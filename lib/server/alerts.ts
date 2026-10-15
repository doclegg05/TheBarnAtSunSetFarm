import { DateTime } from 'luxon';
import { VENUE_TZ, type IsoDate } from '../scheduling/time';
import type {
  FeedHealth,
  StoredEvent,
  StoredShowing,
  StoredStay,
} from './store';

export interface AlertText {
  subject: string;
  text: string;
}

const SPACE_NAME = { barn: 'Barn', cabin: 'Cabin' } as const;
const SOURCE_NAME = { airbnb: 'Airbnb', vrbo: 'VRBO' } as const;
const SIGN_OFF = '\n\nSent by the venue scheduler.';

function day(iso: IsoDate): string {
  return DateTime.fromISO(iso, { zone: VENUE_TZ }).toFormat('ccc, LLL d');
}

function moment(ms: number): string {
  return DateTime.fromMillis(ms, { zone: VENUE_TZ }).toFormat(
    "ccc, LLL d 'at' h:mm a"
  );
}

function stayLine(stay: StoredStay): string {
  return `${SOURCE_NAME[stay.source]} ${SPACE_NAME[stay.space]} stay, ${day(stay.checkIn)} to ${day(stay.checkOut)}`;
}

/** C6: a Barn guest booked over a showing. The stay stands; the showing must move. */
export function showingClashAlert(
  showing: StoredShowing,
  stay: StoredStay
): AlertText {
  return {
    subject: `Move a showing: a Barn guest booked ${day(stay.checkIn)}`,
    text:
      `A new ${stayLine(stay)} covers the showing on ${moment(showing.startMs)}.\n` +
      'The guest keeps the stay. Please contact the visitor and move the showing.' +
      SIGN_OFF,
  };
}

/** Which part of the event a stay lands on, in the manager's words. */
export function partOfEvent(event: StoredEvent, stay: StoredStay): string {
  if (stay.space === 'cabin') return 'one of its nights';
  if (stay.checkIn <= event.lastDay && stay.checkOut >= event.firstDay)
    return 'the event itself';
  return stay.checkIn < event.firstDay
    ? 'the setup day before it'
    : 'the cleanup day after it';
}

/** C3, C5, C9 to C11: a guest booked a night an event blocks, usually during Airbnb's sync delay. */
export function eventStayAlert(
  event: StoredEvent,
  stay: StoredStay
): AlertText {
  return {
    subject: `Guest booked into ${event.title}`,
    text:
      `A ${stayLine(stay)} touches ${partOfEvent(event, stay)}: ${event.title}, ` +
      `${day(event.firstDay)} to ${day(event.lastDay)}.\n` +
      `Please check the booking in ${SOURCE_NAME[stay.source]}.` +
      SIGN_OFF,
  };
}

/** A feed that has not synced for over 2 hours, or never has. */
export function feedOutageAlert(feed: FeedHealth): AlertText {
  const since =
    feed.lastSuccessMs === null
      ? 'has never synced'
      : `has not synced since ${moment(feed.lastSuccessMs)}`;
  return {
    subject: `${SOURCE_NAME[feed.source]} ${SPACE_NAME[feed.space]} calendar ${since}`,
    text:
      `The ${SOURCE_NAME[feed.source]} calendar for the ${SPACE_NAME[feed.space]} ${since}.\n` +
      'Until it does, check that listing by hand before booking showings or events. ' +
      'The feed link may have changed in the listing settings.' +
      SIGN_OFF,
  };
}

/** A feed lost all or most of its future stays on two syncs in a row, so the scheduler accepted it. */
export function feedDropAlert(
  feed: { space: StoredStay['space']; source: StoredStay['source'] },
  before: number,
  after: number
): AlertText {
  return {
    subject: `${SOURCE_NAME[feed.source]} ${SPACE_NAME[feed.space]} calendar dropped to ${after} upcoming stays`,
    text:
      `The ${SOURCE_NAME[feed.source]} calendar for the ${SPACE_NAME[feed.space]} went from ` +
      `${before} upcoming stays to ${after} on two syncs in a row, so the scheduler now uses the new list.\n` +
      'If guests did not cancel, check the listing.' +
      SIGN_OFF,
  };
}
