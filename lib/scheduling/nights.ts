import { addDays, type IsoDate } from './time';
import type { SpaceSlug, VenueEvent } from './types';

/** C3 and C5: every event blocks lodging in both spaces. */
export const SPACES_BLOCKED_BY_EVENTS: readonly SpaceSlug[] = ['barn', 'cabin'];

/** C10: guest-free days the Barn needs before an event's first day, for setup. */
export const BARN_SETUP_DAYS = 1;

/** C11: guest-free days the Barn needs after an event's last day, for cleanup. */
export const BARN_CLEANUP_DAYS = 1;

/** Lodging nights as a half-open date range: [start, endExclusive). */
export interface NightRange {
  start: IsoDate;
  endExclusive: IsoDate;
}

/**
 * C9: an event blocks the night of every event day, the last day included.
 * C10 and C11: the Barn also blocks the nights that would put a guest in the
 * building on a setup or cleanup day. Setup needs one extra night, because a
 * guest is still there on the morning they check out.
 */
export function blockedNights(
  event: Pick<VenueEvent, 'firstDay' | 'lastDay'>,
  space: SpaceSlug
): NightRange {
  const eventNights = {
    start: event.firstDay,
    endExclusive: addDays(event.lastDay, 1),
  };
  if (space === 'cabin') return eventNights;
  return {
    start: addDays(event.firstDay, -(BARN_SETUP_DAYS + 1)),
    endExclusive: addDays(eventNights.endExclusive, BARN_CLEANUP_DAYS),
  };
}

export function nightsOverlap(a: NightRange, b: NightRange): boolean {
  return a.start < b.endExclusive && b.start < a.endExclusive;
}

/** A stay sleeps from its check-in night up to its check-out date. */
export function stayNights(stay: {
  checkIn: IsoDate;
  checkOut: IsoDate;
}): NightRange {
  return { start: stay.checkIn, endExclusive: stay.checkOut };
}
