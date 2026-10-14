// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { PG_EXCLUSION_VIOLATION } from '../../lib/server/rpc';
import { DEFAULT_TYPES } from '../../lib/scheduling/types';
import { freshDb, type TestDb } from './testDb';

let sql: TestDb['sql'];
beforeEach(async () => {
  ({ sql } = await freshDb());
});

const CHECK_VIOLATION = '23514';

async function pgCode(work: Promise<unknown>): Promise<string> {
  try {
    await work;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      return String(error.code);
    }
    throw error;
  }
  return 'no error';
}

function book(startsAt: string, blockedUntil: string, status = 'active') {
  return sql(
    `insert into appointments (type_id, starts_at, ends_at, blocked_until, status, manage_token_hash)
     values (1, $1, $1::timestamptz + interval '30 minutes', $2, $3, gen_random_uuid()::text)`,
    [startsAt, blockedUntil, status]
  );
}

function addEvent(firstDay: string, lastDay: string) {
  return sql(
    `insert into events (title, first_day, last_day, created_by) values ('Test', $1, $2, 'test')`,
    [firstDay, lastDay]
  );
}

describe('schema: no double booking', () => {
  it('refuses an active appointment that overlaps another, gap included', async () => {
    await book('2026-11-07T14:00:00Z', '2026-11-07T15:30:00Z');
    const code = await pgCode(
      book('2026-11-07T15:00:00Z', '2026-11-07T16:00:00Z')
    );
    expect(code).toBe(PG_EXCLUSION_VIOLATION);
  });

  it('allows back-to-back appointments and overlap with a canceled one', async () => {
    await book('2026-11-07T14:00:00Z', '2026-11-07T15:30:00Z');
    await book('2026-11-07T15:30:00Z', '2026-11-07T16:30:00Z');
    await book('2026-11-07T14:00:00Z', '2026-11-07T15:00:00Z', 'canceled');
    const rows = await sql('select count(*)::int as n from appointments');
    expect(rows[0].n).toBe(3);
  });

  it('D13: refuses a second event on the same day, allows the next day', async () => {
    await addEvent('2026-11-21', '2026-11-21');
    expect(await pgCode(addEvent('2026-11-20', '2026-11-21'))).toBe(
      PG_EXCLUSION_VIOLATION
    );
    await addEvent('2026-11-22', '2026-11-22');
  });
});

describe('schema: values that would break the engine are refused', () => {
  it.each([
    [
      'a zero start step',
      `update appointment_types set step_min = 0 where id = 1`,
    ],
    [
      'a zero duration',
      `update appointment_types set duration_min = 0 where id = 1`,
    ],
    [
      'an event that ends before it starts',
      `insert into events (title, first_day, last_day, created_by) values ('x', '2026-11-09', '2026-11-07', 't')`,
    ],
    [
      'hours that end before they start',
      `insert into weekly_hours (type_id, weekday, start_time, end_time) values (1, 2, '16:00', '10:00')`,
    ],
    [
      'a weekday outside 1 to 7',
      `insert into weekly_hours (type_id, weekday, start_time, end_time) values (1, 0, '10:00', '16:00')`,
    ],
    [
      'a stay that ends before it starts',
      `insert into lodging_stays (feed_id, space_id, uid, check_in, check_out) values (1, 1, 'u', '2026-11-09', '2026-11-07')`,
    ],
    [
      'a feed link that is not https',
      `insert into lodging_feed_secrets (feed_id, url) values (1, 'http://example.test/feed.ics')`,
    ],
    [
      'a short export code',
      `insert into settings (key, value) values ('export_code_barn', 'short')`,
    ],
    [
      'an admin email with capitals',
      `insert into admins (email) values ('Manager@Example.test')`,
    ],
  ])('refuses %s', async (_label, statement) => {
    expect(await pgCode(sql(statement))).toBe(CHECK_VIOLATION);
  });
});

describe('schema: browsers get nothing', () => {
  it('turns on row level security for every table, with no policies', async () => {
    const tables = await sql(
      `select c.relname as name, c.relrowsecurity as rls,
              (select count(*)::int from pg_policies p where p.tablename = c.relname) as policies
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r' order by 1`
    );
    expect(tables.length).toBe(13);
    expect(tables.filter((t) => t.rls !== true || t.policies !== 0)).toEqual(
      []
    );
  });

  it('gives browser roles no table or function privileges', async () => {
    const leaks = await sql(
      `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'
          and (has_table_privilege('anon', c.oid, 'select,insert,update,delete')
            or has_table_privilege('authenticated', c.oid, 'select,insert,update,delete'))
       union all
       select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and (has_function_privilege('anon', p.oid, 'execute')
            or has_function_privilege('authenticated', p.oid, 'execute'))`
    );
    expect(leaks).toEqual([]);
  });

  it('lets the secret-key role run every server function', async () => {
    const rows = await sql(
      `select p.proname as name, has_function_privilege('service_role', p.oid, 'execute') as allowed
         from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and left(p.proname, 6) = 'sched_' order by 1`
    );
    expect(rows.length).toBe(14);
    expect(rows.every((row) => row.allowed === true)).toBe(true);
  });

  it('gives a table or function that a later migration adds no browser privileges', async () => {
    await sql(`create table later_table (id int)`);
    await sql(
      `create function later_function() returns int language sql as 'select 1'`
    );
    const [later] = await sql(
      `select has_table_privilege('anon', 'later_table', 'select,insert,update,delete') as anon_table,
              has_table_privilege('authenticated', 'later_table', 'select,insert,update,delete') as auth_table,
              has_function_privilege('anon', 'later_function()', 'execute') as anon_function,
              has_function_privilege('authenticated', 'later_function()', 'execute') as auth_function`
    );
    expect(later).toEqual({
      anon_table: false,
      auth_table: false,
      anon_function: false,
      auth_function: false,
    });
  });

  it('shows a browser role no rows even if a table grant slips back in', async () => {
    await sql(`grant select on all tables in schema public to anon`);
    await sql(`set role anon`);
    const rows = await sql(`select count(*)::int as n from spaces`);
    await sql(`reset role`);
    expect(rows[0].n).toBe(0);
  });
});

describe('schema: seed rows', () => {
  it('seeds both spaces and the four lodging feeds', async () => {
    const feeds = await sql(
      `select s.slug as space, f.source from lodging_feeds f join spaces s on s.id = f.space_id order by f.id`
    );
    expect(feeds).toEqual([
      { space: 'barn', source: 'airbnb' },
      { space: 'barn', source: 'vrbo' },
      { space: 'cabin', source: 'airbnb' },
      { space: 'cabin', source: 'vrbo' },
    ]);
  });

  it('seeds appointment types that match DEFAULT_TYPES', async () => {
    const rows = await sql(
      `select kind, duration_min, gap_after_min, notice_min, window_days, step_min, needs_barn_free
         from appointment_types order by id`
    );
    expect(rows).toEqual(
      [DEFAULT_TYPES.showing, DEFAULT_TYPES.call].map((t) => ({
        kind: t.kind,
        duration_min: t.durationMin,
        gap_after_min: t.gapAfterMin,
        notice_min: t.noticeMin,
        window_days: t.windowDays,
        step_min: t.stepMin,
        needs_barn_free: t.needsBarnFree,
      }))
    );
  });
});
