import type { ParsedStay } from '../ical/parse';
import type { IsoDate } from '../scheduling/time';
import type {
  BookedAppointment,
  SpaceSlug,
  Stay,
  VenueEvent,
} from '../scheduling/types';
import {
  bool,
  int,
  isoDate,
  ms,
  msOrNull,
  source,
  space,
  text,
  type FeedSource,
} from './rows';
import type { Rpc } from './rpc';

export interface FeedConfig {
  id: number;
  space: SpaceSlug;
  source: FeedSource;
  /** Secret. Never log it or put it in an error message or email. */
  url: string;
  /** When a sync first saw this feed lose most future stays; null when not held. */
  dropSeenMs: number | null;
}

export interface FeedHealth {
  id: number;
  space: SpaceSlug;
  source: FeedSource;
  lastSuccessMs: number | null;
  lastErrorMs: number | null;
  /** The first failure since the last success. */
  failingSinceMs: number | null;
  outageAlerted: boolean;
}

export interface StoredStay extends Stay {
  feedId: number;
  source: FeedSource;
  uid: string;
}

export interface StoredEvent extends VenueEvent {
  title: string;
  cabinOverride: boolean;
}

export interface StoredShowing extends BookedAppointment {
  clashAlerted: boolean;
}

/** Identifies one alert email about one stay on one event's blocked nights. */
export interface EventStayAlertKey {
  eventId: string;
  feedId: number;
  uid: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
}

/** Feeds the manager has given a link for. */
export async function loadConfiguredFeeds(rpc: Rpc): Promise<FeedConfig[]> {
  const rows = await rpc.call('sched_configured_feeds');
  return rows.map((row) => ({
    id: int(row, 'id'),
    space: space(row, 'space'),
    source: source(row, 'source'),
    url: text(row, 'url'),
    dropSeenMs: msOrNull(row, 'drop_seen_ms'),
  }));
}

export async function loadFeedHealth(rpc: Rpc): Promise<FeedHealth[]> {
  const rows = await rpc.call('sched_feed_health');
  return rows.map((row) => ({
    id: int(row, 'id'),
    space: space(row, 'space'),
    source: source(row, 'source'),
    lastSuccessMs: msOrNull(row, 'last_success_ms'),
    lastErrorMs: msOrNull(row, 'last_error_ms'),
    failingSinceMs: msOrNull(row, 'failing_since_ms'),
    outageAlerted: bool(row, 'outage_alerted'),
  }));
}

export async function countFutureStays(
  rpc: Rpc,
  feedId: number,
  today: IsoDate
): Promise<number> {
  const rows = await rpc.call('sched_count_future_stays', {
    p_feed_id: feedId,
    p_today: today,
  });
  return int(rows[0], 'n');
}

/** Replaces one feed's stays and marks the feed healthy, in one transaction. */
export async function replaceFeedStays(
  rpc: Rpc,
  feedId: number,
  stays: readonly ParsedStay[],
  nowMs: number
): Promise<void> {
  const payload = stays.map((stay) => ({
    uid: stay.uid,
    check_in: stay.checkIn,
    check_out: stay.checkOut,
  }));
  await rpc.call('sched_replace_feed_stays', {
    p_feed_id: feedId,
    p_stays: JSON.stringify(payload),
    p_now_ms: nowMs,
  });
}

/** Keeps the old stays. `message` must be a fixed message, never feed text or the link. */
export async function recordFeedFailure(
  rpc: Rpc,
  feedId: number,
  message: string,
  nowMs: number
): Promise<void> {
  await rpc.call('sched_record_feed_failure', {
    p_feed_id: feedId,
    p_message: message,
    p_now_ms: nowMs,
  });
}

export async function markDropSeen(
  rpc: Rpc,
  feedId: number,
  nowMs: number
): Promise<void> {
  await rpc.call('sched_mark_drop_seen', {
    p_feed_id: feedId,
    p_now_ms: nowMs,
  });
}

export async function markOutageAlerted(
  rpc: Rpc,
  feedId: number,
  nowMs: number
): Promise<void> {
  await rpc.call('sched_mark_outage_alerted', {
    p_feed_id: feedId,
    p_now_ms: nowMs,
  });
}

/** Stays in both spaces that have not checked out before `fromDay`. */
export async function loadStays(
  rpc: Rpc,
  fromDay: IsoDate
): Promise<StoredStay[]> {
  const rows = await rpc.call('sched_stays_from', { p_from: fromDay });
  return rows.map((row) => ({
    feedId: int(row, 'feed_id'),
    space: space(row, 'space'),
    source: source(row, 'source'),
    uid: text(row, 'uid'),
    checkIn: isoDate(row, 'check_in'),
    checkOut: isoDate(row, 'check_out'),
  }));
}

/** Events whose last day is on or after `fromDay`. */
export async function loadEvents(
  rpc: Rpc,
  fromDay: IsoDate
): Promise<StoredEvent[]> {
  const rows = await rpc.call('sched_events_from', { p_from: fromDay });
  return rows.map((row) => ({
    id: text(row, 'id'),
    title: text(row, 'title'),
    firstDay: isoDate(row, 'first_day'),
    lastDay: isoDate(row, 'last_day'),
    cabinOverride: bool(row, 'cabin_override'),
  }));
}

/** Active showings that start at or after `fromMs`. */
export async function loadFutureShowings(
  rpc: Rpc,
  fromMs: number
): Promise<StoredShowing[]> {
  const rows = await rpc.call('sched_future_showings', { p_from_ms: fromMs });
  return rows.map((row) => ({
    id: text(row, 'id'),
    kind: 'showing' as const,
    startMs: ms(row, 'start_ms'),
    endMs: ms(row, 'end_ms'),
    blockedUntilMs: ms(row, 'blocked_until_ms'),
    clashAlerted: bool(row, 'clash_alerted'),
  }));
}

export async function markClashAlerted(
  rpc: Rpc,
  appointmentId: string,
  nowMs: number
): Promise<void> {
  await rpc.call('sched_mark_clash_alerted', {
    p_appointment_id: appointmentId,
    p_now_ms: nowMs,
  });
}

function alertArgs(key: EventStayAlertKey) {
  return {
    p_event_id: key.eventId,
    p_feed_id: key.feedId,
    p_uid: key.uid,
    p_check_in: key.checkIn,
    p_check_out: key.checkOut,
  };
}

export async function hasEventStayAlert(
  rpc: Rpc,
  key: EventStayAlertKey
): Promise<boolean> {
  const rows = await rpc.call('sched_has_event_stay_alert', alertArgs(key));
  return bool(rows[0], 'found');
}

export async function recordEventStayAlert(
  rpc: Rpc,
  key: EventStayAlertKey,
  nowMs: number
): Promise<void> {
  await rpc.call('sched_record_event_stay_alert', {
    ...alertArgs(key),
    p_now_ms: nowMs,
  });
}

export async function getExportCode(
  rpc: Rpc,
  feedSpace: SpaceSlug
): Promise<string | null> {
  const rows = await rpc.call('sched_export_code', { p_space: feedSpace });
  return rows.length === 0 ? null : text(rows[0], 'code');
}
