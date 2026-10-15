import { DateTime } from 'luxon';
import { blockedNights } from '../scheduling/nights';
import type { IsoDate } from '../scheduling/time';
import type { SpaceSlug } from '../scheduling/types';

/** What a blocking feed may know about an event. No title or notes, so they cannot leak. */
export interface FeedEvent {
  /** The event's database UUID. Anything else is refused. */
  id: string;
  firstDay: IsoDate;
  lastDay: IsoDate;
}

const CRLF = '\r\n';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SPACE_NAMES: Record<SpaceSlug, string> = {
  barn: 'The Barn',
  cabin: 'The Cabin',
};

/** C3, C5, C9, C10 and C11: an all-day "Blocked" entry per event, for Airbnb and VRBO to import. */
export function buildBlockingFeed(
  space: SpaceSlug,
  events: readonly FeedEvent[],
  nowMs: number
): string {
  assertPublishable(events, nowMs);
  const stamp = DateTime.fromMillis(nowMs, { zone: 'utc' }).toFormat(
    "yyyyMMdd'T'HHmmss'Z'"
  );
  const entries = [...events].sort(byDateThenId).flatMap((event) => {
    const nights = blockedNights(event, space);
    return [
      'BEGIN:VEVENT',
      `UID:${event.id}-${space}@sunset-farm-scheduler`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(nights.start)}`,
      `DTEND;VALUE=DATE:${compact(nights.endExclusive)}`,
      'SUMMARY:Blocked',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ];
  });
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sunset Farm//Venue Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${SPACE_NAMES[space]} blocked dates`,
    ...entries,
    'END:VCALENDAR',
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}

/**
 * The feed is public. Refuse an id that could carry private text or extra
 * lines into it, and any entry Airbnb or VRBO could drop as malformed.
 * Messages name the problem, never the value.
 */
function assertPublishable(events: readonly FeedEvent[], nowMs: number): void {
  if (!Number.isFinite(nowMs)) {
    throw new Error('Feed build time must be a real instant');
  }
  for (const event of events) {
    if (!UUID_PATTERN.test(event.id)) {
      throw new Error('Feed event ids must be UUIDs');
    }
    if (event.lastDay < event.firstDay) {
      throw new Error('A feed event cannot end before it starts');
    }
  }
}

function byDateThenId(a: FeedEvent, b: FeedEvent): number {
  if (a.firstDay !== b.firstDay) return a.firstDay < b.firstDay ? -1 : 1;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

function compact(day: IsoDate): string {
  return day.replaceAll('-', '');
}

/** RFC 5545 folding: no physical line over 75 octets; continuations start with one space. */
export function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let limit = 75;
  for (const char of line) {
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
      limit = 74;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}
