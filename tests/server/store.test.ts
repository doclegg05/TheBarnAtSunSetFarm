// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import {
  countFutureStays,
  getExportCode,
  hasEventStayAlert,
  loadConfiguredFeeds,
  loadEvents,
  loadFeedHealth,
  loadFutureShowings,
  loadStays,
  markClashAlerted,
  markDropSeen,
  markOutageAlerted,
  recordEventStayAlert,
  recordFeedFailure,
  replaceFeedStays,
} from '../../lib/server/store';
import { at, d } from '../scheduling/helpers';
import { freshDb, type TestDb } from './testDb';

const NOW = at('2026-10-14', '08:00');
const LATER = NOW + 60_000;
const FEED_LINK = 'https://www.airbnb.com/calendar/ical/1.ics?s=made-up';
let db: TestDb;

beforeEach(async () => {
  db = await freshDb();
  await db.sql(
    `insert into lodging_feed_secrets (feed_id, url) values (1, $1)`,
    [FEED_LINK]
  );
});

const stay = (uid: string, checkIn: string, checkOut: string) => ({
  uid,
  checkIn: d(checkIn),
  checkOut: d(checkOut),
});

describe('lodging feeds', () => {
  it('lists only feeds that have a link', async () => {
    expect(await loadConfiguredFeeds(db.rpc)).toEqual([
      {
        id: 1,
        space: 'barn',
        source: 'airbnb',
        url: FEED_LINK,
        dropSeen: false,
      },
    ]);
  });

  it('replaces a feed’s stays and marks it healthy', async () => {
    await replaceFeedStays(
      db.rpc,
      1,
      [stay('a', '2026-10-01', '2026-10-03')],
      NOW
    );
    await replaceFeedStays(
      db.rpc,
      1,
      [
        stay('b', '2026-11-06', '2026-11-08'),
        stay('c', '2026-12-01', '2026-12-04'),
      ],
      LATER
    );
    expect(await loadStays(db.rpc, d('2026-10-14'))).toEqual([
      {
        feedId: 1,
        space: 'barn',
        source: 'airbnb',
        uid: 'b',
        checkIn: '2026-11-06',
        checkOut: '2026-11-08',
      },
      {
        feedId: 1,
        space: 'barn',
        source: 'airbnb',
        uid: 'c',
        checkIn: '2026-12-01',
        checkOut: '2026-12-04',
      },
    ]);
    expect(await countFutureStays(db.rpc, 1, d('2026-11-08'))).toBe(2);
    expect(await countFutureStays(db.rpc, 1, d('2026-11-09'))).toBe(1);
    const [health] = await loadFeedHealth(db.rpc);
    expect(health.lastSuccessMs).toBe(LATER);
    expect(health.lastErrorMs).toBeNull();
  });

  it('records a failure without touching the stays, and the next success clears it', async () => {
    await replaceFeedStays(
      db.rpc,
      1,
      [stay('b', '2026-11-06', '2026-11-08')],
      NOW
    );
    await recordFeedFailure(db.rpc, 1, 'x'.repeat(300), LATER);
    await markDropSeen(db.rpc, 1, LATER);
    await markOutageAlerted(db.rpc, 1, LATER);
    expect(await loadStays(db.rpc, d('2026-10-14'))).toHaveLength(1);
    const [failing] = await loadFeedHealth(db.rpc);
    expect(failing).toMatchObject({
      lastSuccessMs: NOW,
      lastErrorMs: LATER,
      outageAlerted: true,
    });
    const [error] = await db.sql(
      `select last_error from lodging_feeds where id = 1`
    );
    expect(String(error.last_error)).toHaveLength(200);
    expect((await loadConfiguredFeeds(db.rpc))[0].dropSeen).toBe(true);

    await replaceFeedStays(db.rpc, 1, [], LATER + 1);
    const [healthy] = await loadFeedHealth(db.rpc);
    expect(healthy).toMatchObject({ lastErrorMs: null, outageAlerted: false });
    expect((await loadConfiguredFeeds(db.rpc))[0].dropSeen).toBe(false);
  });
});

describe('events, showings and alerts', () => {
  it('loads events that end on or after a date', async () => {
    await db.sql(
      `insert into events (title, first_day, last_day, created_by) values
         ('Old', '2026-09-05', '2026-09-05', 't'), ('Wedding A', '2026-11-10', '2026-11-10', 't')`
    );
    const events = await loadEvents(db.rpc, d('2026-10-14'));
    expect(
      events.map((e) => [e.title, e.firstDay, e.lastDay, e.cabinOverride])
    ).toEqual([['Wedding A', '2026-11-10', '2026-11-10', false]]);
    expect(events[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('loads active future showings only, and marks a clash alert once', async () => {
    const insert = (typeId: number, start: string, status = 'active') =>
      db.sql(
        `insert into appointments (type_id, starts_at, ends_at, blocked_until, status, manage_token_hash)
         values ($1, $2::timestamptz, $2::timestamptz + interval '1 hour',
                 $2::timestamptz + interval '90 minutes', $3, gen_random_uuid()::text)`,
        [typeId, start, status]
      );
    await insert(1, '2026-11-07T14:00:00Z');
    await insert(1, '2026-11-09T14:00:00Z', 'canceled');
    await insert(2, '2026-11-10T14:00:00Z');
    await insert(1, '2026-10-01T14:00:00Z');
    const [showing, ...rest] = await loadFutureShowings(db.rpc, NOW);
    expect(rest).toEqual([]);
    expect(showing).toMatchObject({
      kind: 'showing',
      startMs: Date.parse('2026-11-07T14:00:00Z'),
      endMs: Date.parse('2026-11-07T15:00:00Z'),
      blockedUntilMs: Date.parse('2026-11-07T15:30:00Z'),
      clashAlerted: false,
    });
    await markClashAlerted(db.rpc, showing.id, NOW);
    await markClashAlerted(db.rpc, showing.id, LATER);
    const [alerted] = await db.sql(
      `select (extract(epoch from clash_alerted_at) * 1000)::float8 as at_ms from appointments where id = $1::uuid`,
      [showing.id]
    );
    expect(alerted.at_ms).toBe(NOW);
  });

  it('remembers each event and stay alert, keyed by feed, UID and dates', async () => {
    const [event] = await db.sql(
      `insert into events (title, first_day, last_day, created_by)
       values ('Wedding C', '2026-12-05', '2026-12-05', 't') returning id::text as id`
    );
    const key = {
      eventId: String(event.id),
      feedId: 1,
      uid: 'stay-1',
      checkIn: d('2026-12-06'),
      checkOut: d('2026-12-08'),
    };
    expect(await hasEventStayAlert(db.rpc, key)).toBe(false);
    await recordEventStayAlert(db.rpc, key, NOW);
    await recordEventStayAlert(db.rpc, key, LATER);
    expect(await hasEventStayAlert(db.rpc, key)).toBe(true);
    expect(
      await hasEventStayAlert(db.rpc, { ...key, checkOut: d('2026-12-09') })
    ).toBe(false);
  });

  it('reads the export code for a space, or null when none is set', async () => {
    expect(await getExportCode(db.rpc, 'barn')).toBeNull();
    await db.sql(
      `insert into settings (key, value) values ('export_code_barn', $1)`,
      ['k'.repeat(40)]
    );
    expect(await getExportCode(db.rpc, 'barn')).toBe('k'.repeat(40));
    expect(await getExportCode(db.rpc, 'cabin')).toBeNull();
  });
});
