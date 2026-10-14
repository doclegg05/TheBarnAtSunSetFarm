import {
  FeedParseError,
  parseLodgingFeed,
  type ParsedStay,
} from '../ical/parse';
import {
  findEventStayConflicts,
  findShowingClashes,
} from '../scheduling/conflicts';
import { BARN_CLEANUP_DAYS } from '../scheduling/nights';
import { addDays, dayInRange, venueDay } from '../scheduling/time';
import {
  eventStayAlert,
  feedDropAlert,
  feedOutageAlert,
  showingClashAlert,
  type AlertText,
} from './alerts';
import { EmailError, idempotencyKey, type Mailer } from './email';
import { FeedFetchError } from './fetchFeed';
import { RpcError, type Rpc } from './rpc';
import {
  countFutureStays,
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
  type FeedConfig,
  type FeedHealth,
} from './store';

/** The spec's outage alert: a feed failing for over 2 hours. */
export const OUTAGE_AFTER_MS = 2 * 60 * 60 * 1000;
const MAX_UID_LENGTH = 255;

export interface SyncDeps {
  rpc: Rpc;
  mailer: Mailer;
  /** The manager's address for alert emails. */
  alertTo: string;
  /** Downloads a feed link; see fetchFeedText. */
  fetchFeed: (link: string) => Promise<string>;
  nowMs: number;
  /** One line per problem; never a link, feed text or email address. */
  log: (line: string) => void;
}

export type FeedOutcome = 'updated' | 'held' | 'failed';

interface FeedResult {
  id: number;
  outcome: FeedOutcome;
  emails: number;
}

export interface SyncReport {
  feeds: { id: number; outcome: FeedOutcome }[];
  emails: number;
}

/**
 * One scheduled run. Outages are checked first, so a run that later hangs
 * still reports feeds the previous runs could not sync.
 */
export async function runSync(deps: SyncDeps): Promise<SyncReport> {
  const outageEmails = await alertOutages(deps);
  const feeds = await loadConfiguredFeeds(deps.rpc);
  const results = await Promise.all(feeds.map((feed) => syncFeed(deps, feed)));
  const conflictEmails = await alertConflicts(deps);
  return {
    feeds: results.map(({ id, outcome }) => ({ id, outcome })),
    emails:
      outageEmails +
      conflictEmails +
      results.reduce((n, result) => n + result.emails, 0),
  };
}

async function syncFeed(deps: SyncDeps, feed: FeedConfig): Promise<FeedResult> {
  try {
    return await updateFeed(deps, feed);
  } catch (error) {
    await recordFeedFailure(
      deps.rpc,
      feed.id,
      failureMessage(error),
      deps.nowMs
    ).catch(() =>
      deps.log(`Lodging sync: could not record the failure of feed ${feed.id}`)
    );
    return { id: feed.id, outcome: 'failed', emails: 0 };
  }
}

async function updateFeed(
  deps: SyncDeps,
  feed: FeedConfig
): Promise<FeedResult> {
  const stays = checkUids(
    parseLodgingFeed(await deps.fetchFeed(feed.url)).stays
  );
  const today = venueDay(deps.nowMs);
  const before = await countFutureStays(deps.rpc, feed.id, today);
  const after = stays.filter((stay) => stay.checkOut >= today).length;
  const dropped = isBigDrop(before, after);
  if (dropped && !feed.dropSeen) {
    await markDropSeen(deps.rpc, feed.id, deps.nowMs);
    return { id: feed.id, outcome: 'held', emails: 0 };
  }
  if (dropped) {
    // The email goes out before any stay is deleted; until it does, the old stays stand.
    const told = await trySend(
      deps,
      feedDropAlert(feed, before, after),
      'drop',
      feed.id,
      before,
      after
    );
    if (!told) return { id: feed.id, outcome: 'held', emails: 0 };
  }
  await replaceFeedStays(deps.rpc, feed.id, stays, deps.nowMs);
  return { id: feed.id, outcome: 'updated', emails: dropped ? 1 : 0 };
}

/**
 * A feed that lost every future stay, or more than half of four or more, is
 * held for one sync. A glitch clears by the next run; a real change is seen
 * again and accepted, with an email.
 */
export function isBigDrop(before: number, after: number): boolean {
  if (before === 0) return false;
  return after === 0 || (before >= 4 && after * 2 < before);
}

function checkUids(stays: ParsedStay[]): ParsedStay[] {
  const unusable = stays.some(
    (stay) => stay.uid.length > MAX_UID_LENGTH || hasControlCharacter(stay.uid)
  );
  if (unusable) {
    throw new FeedParseError('Not a usable feed: an entry has an unusable UID');
  }
  return stays;
}

/** Newlines and other control characters in a UID could break the alert keys and emails. */
function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/** Only the fixed messages from our own errors are stored; anything else could hold feed text. */
function failureMessage(error: unknown): string {
  if (error instanceof FeedFetchError || error instanceof FeedParseError) {
    return error.message;
  }
  if (error instanceof RpcError) return 'A database call failed';
  return 'The sync failed unexpectedly';
}

/**
 * An outage is timed from the last success, whether or not an error was stored,
 * because a run can die before it records one. A link that has never synced is
 * timed from its first failure.
 */
export function isOutage(feed: FeedHealth, nowMs: number): boolean {
  if (feed.outageAlerted) return false;
  const since = feed.lastSuccessMs ?? feed.failingSinceMs;
  return since !== null && nowMs - since > OUTAGE_AFTER_MS;
}

async function alertOutages(deps: SyncDeps): Promise<number> {
  const down = (await loadFeedHealth(deps.rpc)).filter((feed) =>
    isOutage(feed, deps.nowMs)
  );
  let sent = 0;
  for (const feed of down) {
    const key = feed.lastSuccessMs ?? feed.failingSinceMs ?? 'never';
    if (!(await trySend(deps, feedOutageAlert(feed), 'outage', feed.id, key)))
      continue;
    await markOutageAlerted(deps.rpc, feed.id, deps.nowMs);
    sent += 1;
  }
  return sent;
}

async function alertConflicts(deps: SyncDeps): Promise<number> {
  const today = venueDay(deps.nowMs);
  const [stays, events, showings] = await Promise.all([
    loadStays(deps.rpc, today),
    loadEvents(deps.rpc, addDays(today, -(BARN_CLEANUP_DAYS + 1))),
    loadFutureShowings(deps.rpc, deps.nowMs),
  ]);
  let sent = 0;
  const unalerted = showings.filter((showing) => !showing.clashAlerted);
  for (const showing of findShowingClashes(unalerted, stays)) {
    const showingDay = venueDay(showing.startMs);
    const stay = stays.find(
      (s) => s.space === 'barn' && dayInRange(showingDay, s.checkIn, s.checkOut)
    );
    if (stay === undefined) continue;
    if (
      !(await trySend(
        deps,
        showingClashAlert(showing, stay),
        'clash',
        showing.id
      ))
    )
      continue;
    await markClashAlerted(deps.rpc, showing.id, deps.nowMs);
    sent += 1;
  }
  for (const { event, stay } of findEventStayConflicts(events, stays)) {
    const key = {
      eventId: event.id,
      feedId: stay.feedId,
      uid: stay.uid,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
    };
    if (await hasEventStayAlert(deps.rpc, key)) continue;
    const told = await trySend(
      deps,
      eventStayAlert(event, stay),
      'event-stay',
      ...Object.values(key)
    );
    if (!told) continue;
    await recordEventStayAlert(deps.rpc, key, deps.nowMs);
    sent += 1;
  }
  return sent;
}

/**
 * True only when the email went out. A failure is logged with fixed text and
 * reported as false, so the caller leaves the alert unmarked and the next run
 * tries again. Email trouble never stops a sync.
 */
async function trySend(
  deps: SyncDeps,
  alert: AlertText,
  ...keyParts: (string | number)[]
): Promise<boolean> {
  try {
    const result = await deps.mailer.send({
      to: deps.alertTo,
      subject: alert.subject,
      text: alert.text,
      idempotencyKey: idempotencyKey(...keyParts),
    });
    return result === 'sent';
  } catch (error) {
    deps.log(
      error instanceof EmailError
        ? error.message
        : 'An alert email could not be sent'
    );
    return false;
  }
}
