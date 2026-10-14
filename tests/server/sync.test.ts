// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import {
  EmailError,
  type EmailMessage,
  type Mailer,
} from '../../lib/server/email';
import { FeedFetchError } from '../../lib/server/fetchFeed';
import { RpcError, type Rpc, type RpcName } from '../../lib/server/rpc';
import { isBigDrop, runSync, type SyncDeps } from '../../lib/server/sync';
import { at } from '../scheduling/helpers';
import { freshDb, type TestDb } from './testDb';

const NOW = at('2026-10-14', '08:00');
const HOUR = 3_600_000;
const QUARTER_HOUR = 15 * 60_000;
const BARN_LINK = 'https://www.airbnb.com/calendar/ical/barn.ics?s=made-up';
const CABIN_LINK = 'https://www.airbnb.com/calendar/ical/cabin.ics?s=made-up';

/** An all-day calendar like Airbnb's, from [uid, check-in, check-out] rows. Made-up data. */
function calendar(...stays: [string, string, string][]): string {
  const compact = (iso: string) => iso.replaceAll('-', '');
  const events = stays.flatMap(([uid, checkIn, checkOut]) => [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${compact(checkIn)}`,
    `DTEND;VALUE=DATE:${compact(checkOut)}`,
    'SUMMARY:Reserved',
    'END:VEVENT',
  ]);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

let db: TestDb;
let sent: EmailMessage[];
let logged: string[];
/** ok: delivered; down: the email service fails; off: no email settings. */
let email: 'ok' | 'down' | 'off';
let feeds: Record<string, string | Error>;
const mailer: Mailer = {
  send: async (message) => {
    if (email === 'down') throw new EmailError(503);
    if (email === 'off') return 'skipped';
    sent.push(message);
    return 'sent';
  },
};

function deps(nowMs = NOW, rpc: Rpc = db.rpc): SyncDeps {
  return {
    rpc,
    mailer,
    alertTo: 'manager@example.test',
    nowMs,
    log: (line) => logged.push(line),
    fetchFeed: async (link) => {
      const answer = feeds[link];
      if (answer === undefined || answer instanceof Error) {
        throw answer ?? new FeedFetchError('The feed could not be reached');
      }
      return answer;
    },
  };
}

/** The test database, except that one function keeps failing like a Supabase outage. */
function failing(fn: RpcName): Rpc {
  return {
    call: (name, args) =>
      name === fn
        ? Promise.reject(new RpcError('http-504'))
        : db.rpc.call(name, args),
  };
}

async function stayUids(): Promise<string[]> {
  const rows = await db.sql(`select uid from lodging_stays order by uid`);
  return rows.map((row) => String(row.uid));
}

async function lastError(feedId: number): Promise<unknown> {
  const [row] = await db.sql(
    `select last_error from lodging_feeds where id = $1`,
    [feedId]
  );
  return row.last_error;
}

beforeEach(async () => {
  db = await freshDb();
  sent = [];
  logged = [];
  email = 'ok';
  feeds = {
    [BARN_LINK]: calendar(['barn-1', '2026-11-06', '2026-11-08']),
    [CABIN_LINK]: calendar(['cabin-1', '2026-11-19', '2026-11-21']),
  };
  await db.sql(
    `insert into lodging_feed_secrets (feed_id, url) values (1, $1), (3, $2)`,
    [BARN_LINK, CABIN_LINK]
  );
});

describe('runSync: feeds', () => {
  it('stores every configured feed and reports each one', async () => {
    const report = await runSync(deps());
    expect(report).toEqual({
      feeds: [
        { id: 1, outcome: 'updated' },
        { id: 3, outcome: 'updated' },
      ],
      emails: 0,
    });
    expect(await stayUids()).toEqual(['barn-1', 'cabin-1']);
  });

  it.each([
    [
      'a feed it cannot reach',
      new FeedFetchError('The feed could not be reached'),
      'The feed could not be reached',
    ],
    [
      'a feed with a repeating entry',
      'RRULE',
      'Not a usable feed: an entry repeats',
    ],
    [
      'a UID with a control character',
      'CONTROL',
      'Not a usable feed: an entry has an unusable UID',
    ],
    [
      'an unexpected error, without its text',
      new Error(`failed for ${BARN_LINK}`),
      'The sync failed unexpectedly',
    ],
  ])(
    'keeps the old stays and stores a fixed message for %s',
    async (_label, answer, message) => {
      await runSync(deps());
      if (answer === 'RRULE') {
        feeds[BARN_LINK] = calendar([
          'barn-2',
          '2026-11-13',
          '2026-11-15',
        ]).replace('SUMMARY:Reserved', 'RRULE:FREQ=WEEKLY;COUNT=3');
      } else if (answer === 'CONTROL') {
        feeds[BARN_LINK] = calendar(['bad\\nuid', '2026-11-13', '2026-11-15']);
      } else {
        feeds[BARN_LINK] = answer;
      }
      const report = await runSync(deps(NOW + HOUR));
      expect(report.feeds[0]).toEqual({ id: 1, outcome: 'failed' });
      expect(await stayUids()).toEqual(['barn-1', 'cabin-1']);
      expect(await lastError(1)).toBe(message);
    }
  );
});

describe('runSync: a feed that suddenly loses its stays', () => {
  const four = calendar(
    ['a', '2026-11-06', '2026-11-08'],
    ['b', '2026-11-13', '2026-11-15'],
    ['c', '2026-11-20', '2026-11-22'],
    ['d', '2026-11-27', '2026-11-29']
  );

  it('holds the drop for one sync, then accepts it with an email', async () => {
    feeds[BARN_LINK] = four;
    await runSync(deps());
    feeds[BARN_LINK] = calendar();
    expect((await runSync(deps(NOW + QUARTER_HOUR))).feeds[0].outcome).toBe(
      'held'
    );
    expect(await stayUids()).toEqual(['a', 'b', 'c', 'cabin-1', 'd']);
    expect(sent).toEqual([]);
    expect((await runSync(deps(NOW + 2 * QUARTER_HOUR))).feeds[0].outcome).toBe(
      'updated'
    );
    expect(await stayUids()).toEqual(['cabin-1']);
    expect(sent.map((m) => m.subject)).toEqual([
      'Airbnb Barn calendar dropped to 0 upcoming stays',
    ]);
  });

  it('treats a hold older than 45 minutes as a new sighting', async () => {
    feeds[BARN_LINK] = four;
    await runSync(deps());
    feeds[BARN_LINK] = calendar();
    await runSync(deps(NOW + QUARTER_HOUR));
    feeds[BARN_LINK] = new FeedFetchError('The feed could not be reached');
    await runSync(deps(NOW + 2 * QUARTER_HOUR));
    feeds[BARN_LINK] = calendar();
    const threeDays = NOW + 72 * HOUR;
    expect((await runSync(deps(threeDays))).feeds[0].outcome).toBe('held');
    expect(await stayUids()).toEqual(['a', 'b', 'c', 'cabin-1', 'd']);
    expect(
      (await runSync(deps(threeDays + QUARTER_HOUR))).feeds[0].outcome
    ).toBe('updated');
    expect(await stayUids()).toEqual(['cabin-1']);
  });

  it('clears the hold when the stays come back on the next sync', async () => {
    feeds[BARN_LINK] = four;
    await runSync(deps());
    feeds[BARN_LINK] = calendar(['a', '2026-11-06', '2026-11-08']);
    expect((await runSync(deps(NOW + HOUR))).feeds[0].outcome).toBe('held');
    feeds[BARN_LINK] = four;
    expect((await runSync(deps(NOW + 2 * HOUR))).feeds[0].outcome).toBe(
      'updated'
    );
    feeds[BARN_LINK] = calendar(['a', '2026-11-06', '2026-11-08']);
    expect((await runSync(deps(NOW + 3 * HOUR))).feeds[0].outcome).toBe('held');
    expect(sent).toEqual([]);
  });

  it.each([
    [0, 0, false],
    [1, 0, true],
    [3, 1, false],
    [4, 2, false],
    [4, 1, true],
  ])('isBigDrop(%i, %i) is %s', (before, after, expected) => {
    expect(isBigDrop(before, after)).toBe(expected);
  });
});

describe('runSync: outages', () => {
  it('alerts when a feed has not synced for over 2 hours, even with no error stored', async () => {
    await runSync(deps());
    const broken = failing('sched_count_future_stays');
    for (const hours of [1, 2, 3, 4]) {
      await runSync(deps(NOW + hours * HOUR, broken));
    }
    expect(sent.map((m) => m.subject).sort()).toEqual([
      'Airbnb Barn calendar has not synced since Wed, Oct 14 at 8:00 AM',
      'Airbnb Cabin calendar has not synced since Wed, Oct 14 at 8:00 AM',
    ]);
    expect(await lastError(1)).toBe('A database call failed');
  });

  it('waits 2 hours before reporting a new link that keeps failing', async () => {
    await db.sql(
      `insert into lodging_feed_secrets (feed_id, url) values (2, $1)`,
      ['https://www.vrbo.com/icalendar/made-up.ics']
    );
    for (const minutes of [0, 15, 30, 90]) {
      await runSync(deps(NOW + minutes * 60_000));
    }
    expect(sent).toEqual([]);
    await runSync(deps(NOW + 135 * 60_000));
    expect(sent.map((m) => m.subject)).toEqual([
      'VRBO Barn calendar has never synced',
    ]);
  });
});

describe('runSync: when email fails or is off', () => {
  const QUARTER = 15 * 60_000;

  it('keeps syncing every feed while the email service fails, and sends the alert later', async () => {
    await runSync(deps());
    feeds[BARN_LINK] = new FeedFetchError('The feed could not be reached');
    feeds[CABIN_LINK] = calendar(
      ['cabin-1', '2026-11-19', '2026-11-21'],
      ['cabin-new', '2026-12-01', '2026-12-03']
    );
    email = 'down';
    await runSync(deps(NOW + 3 * HOUR));
    expect(await stayUids()).toEqual(['barn-1', 'cabin-1', 'cabin-new']);
    expect(logged).toContain('The email service answered with status 503');
    email = 'ok';
    await runSync(deps(NOW + 3 * HOUR + QUARTER));
    await runSync(deps(NOW + 3 * HOUR + 2 * QUARTER));
    expect(sent.map((m) => m.subject)).toEqual([
      'Airbnb Barn calendar has not synced since Wed, Oct 14 at 8:00 AM',
    ]);
  });

  it('does not count an alert as sent while email is off', async () => {
    await db.sql(
      `insert into appointments (type_id, starts_at, ends_at, blocked_until, manage_token_hash)
       values (1, '2026-11-07T15:00:00Z', '2026-11-07T16:00:00Z', '2026-11-07T16:30:00Z', 'h1')`
    );
    email = 'off';
    await runSync(deps());
    expect(sent).toEqual([]);
    email = 'ok';
    await runSync(deps(NOW + QUARTER));
    expect(sent.map((m) => m.subject)).toEqual([
      'Move a showing: a Barn guest booked Fri, Nov 6',
    ]);
  });

  it('keeps a confirmed drop on hold until its email goes out', async () => {
    feeds[BARN_LINK] = calendar(
      ['a', '2026-11-06', '2026-11-08'],
      ['b', '2026-11-13', '2026-11-15'],
      ['c', '2026-11-20', '2026-11-22'],
      ['d', '2026-11-27', '2026-11-29']
    );
    await runSync(deps());
    feeds[BARN_LINK] = calendar();
    await runSync(deps(NOW + QUARTER));
    email = 'down';
    expect((await runSync(deps(NOW + 2 * QUARTER))).feeds[0].outcome).toBe(
      'held'
    );
    expect(await stayUids()).toEqual(['a', 'b', 'c', 'cabin-1', 'd']);
    email = 'ok';
    expect((await runSync(deps(NOW + 3 * QUARTER))).feeds[0].outcome).toBe(
      'updated'
    );
    expect(await stayUids()).toEqual(['cabin-1']);
    expect(sent.map((m) => m.subject)).toEqual([
      'Airbnb Barn calendar dropped to 0 upcoming stays',
    ]);
  });
});

describe('runSync: secrets stay out of messages', () => {
  it('never puts a feed link or feed text into an email, a log line or a stored error', async () => {
    const CANARY = 'CANARY-7f3a';
    const link = `https://www.airbnb.com/calendar/ical/9.ics?s=${CANARY}`;
    await db.sql(`update lodging_feed_secrets set url = $1 where feed_id = 1`, [
      link,
    ]);
    feeds[link] = calendar([
      `uid-${CANARY}`,
      '2026-11-06',
      '2026-11-08',
    ]).replace('SUMMARY:Reserved', `SUMMARY:${CANARY}`);
    await db.sql(
      `insert into appointments (type_id, starts_at, ends_at, blocked_until, manage_token_hash)
       values (1, '2026-11-07T15:00:00Z', '2026-11-07T16:00:00Z', '2026-11-07T16:30:00Z', 'h1')`
    );
    await db.sql(
      `insert into events (title, first_day, last_day, created_by)
       values ('Wedding', '2026-11-09', '2026-11-09', 't')`
    );
    await runSync(deps());
    feeds[link] = new Error(`fetch failed for ${link}`);
    await runSync(deps(NOW + 3 * HOUR));
    email = 'off';
    await runSync(deps(NOW + 4 * HOUR));
    expect(sent.map((m) => m.subject)).toEqual([
      'Move a showing: a Barn guest booked Fri, Nov 6',
      'Guest booked into Wedding',
      'Airbnb Barn calendar has not synced since Wed, Oct 14 at 8:00 AM',
      // No run between 8:00 and 11:00, so the Cabin calendar was 3 hours stale too.
      'Airbnb Cabin calendar has not synced since Wed, Oct 14 at 8:00 AM',
    ]);
    const everything = [
      ...sent.flatMap((m) => [m.to, m.subject, m.text, m.idempotencyKey]),
      ...logged,
      String(await lastError(1)),
    ].join('\n');
    expect(everything).not.toContain(CANARY);
  });
});

describe('runSync: alerts', () => {
  it('C6: emails once about a showing a new Barn stay now covers', async () => {
    await db.sql(
      `insert into appointments (type_id, starts_at, ends_at, blocked_until, manage_token_hash)
       values (1, '2026-11-07T15:00:00Z', '2026-11-07T16:00:00Z', '2026-11-07T16:30:00Z', 'h1')`
    );
    await runSync(deps());
    await runSync(deps(NOW + HOUR));
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: 'manager@example.test',
      subject: 'Move a showing: a Barn guest booked Fri, Nov 6',
    });
    expect(sent[0].text).toContain('Sat, Nov 7 at 10:00 AM');
  });

  it('emails once per stay on an event’s blocked nights, naming the part it lands on', async () => {
    await db.sql(
      `insert into events (title, first_day, last_day, created_by) values
         ('Wedding C', '2026-12-05', '2026-12-05', 't'), ('Wedding B', '2026-11-21', '2026-11-21', 't')`
    );
    feeds[BARN_LINK] = calendar(['barn-late', '2026-12-06', '2026-12-08']);
    feeds[CABIN_LINK] = calendar(['cabin-night', '2026-11-20', '2026-11-22']);
    await runSync(deps());
    await runSync(deps(NOW + HOUR));
    expect(sent.map((m) => m.subject).sort()).toEqual([
      'Guest booked into Wedding B',
      'Guest booked into Wedding C',
    ]);
    const texts = sent.map((m) => m.text).join('\n');
    expect(texts).toContain('touches the cleanup day after it: Wedding C');
    expect(texts).toContain('touches one of its nights: Wedding B');
    expect(new Set(sent.map((m) => m.idempotencyKey)).size).toBe(2);
  });

  it('emails once about a feed failing for over 2 hours, and about one that never synced', async () => {
    await runSync(deps());
    feeds[BARN_LINK] = new FeedFetchError('The feed could not be reached');
    feeds[CABIN_LINK] = new FeedFetchError('The feed could not be reached');
    await db.sql(`delete from lodging_feed_secrets where feed_id = 3`);
    await db.sql(
      `insert into lodging_feed_secrets (feed_id, url) values (2, $1)`,
      ['https://www.vrbo.com/icalendar/made-up.ics']
    );
    await runSync(deps(NOW + HOUR));
    expect(sent.map((m) => m.subject)).toEqual([]);
    await runSync(deps(NOW + 3 * HOUR));
    await runSync(deps(NOW + 4 * HOUR));
    expect(sent.map((m) => m.subject)).toEqual([
      'Airbnb Barn calendar has not synced since Wed, Oct 14 at 8:00 AM',
      'VRBO Barn calendar has never synced',
    ]);
  });
});
