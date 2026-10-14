import { DateTime } from 'luxon';
import {
  toIsoDate,
  VENUE_TZ,
  venueWallTime,
  wallMinutes,
  type IsoDate,
} from '../../lib/scheduling/time';
import {
  DEFAULT_TYPES,
  type AvailabilityInput,
  type Slot,
  type WeeklyHours,
} from '../../lib/scheduling/types';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

export const d = (value: string): IsoDate => toIsoDate(value);

/** Epoch ms of a venue wall-clock time. Throws if that time does not exist. */
export function at(day: string, hhmm: string): number {
  const ms = venueWallTime(d(day), wallMinutes(hhmm));
  if (ms === null) {
    throw new Error(`${day} ${hhmm} does not exist in venue time`);
  }
  return ms;
}

/** Venue wall-clock HH:mm of an instant, for readable assertions. */
export function wall(ms: number): string {
  return DateTime.fromMillis(ms, { zone: VENUE_TZ }).toFormat('HH:mm');
}

export const everyDay9to5: WeeklyHours[] = [1, 2, 3, 4, 5, 6, 7].map(
  (weekday) => ({ weekday, start: '09:00', end: '17:00' })
);

/** A showing request on a quiet calendar, seen from Tuesday 2026-10-13 at 08:00. */
export function input(
  overrides: Partial<AvailabilityInput> = {}
): AvailabilityInput {
  return {
    type: DEFAULT_TYPES.showing,
    hours: everyDay9to5,
    blocks: [],
    events: [],
    stays: [],
    appointments: [],
    nowMs: at('2026-10-13', '08:00'),
    fromDay: d('2026-10-20'),
    toDay: d('2026-10-20'),
    ...overrides,
  };
}

/** 'open' or the hidden reason of the candidate starting at a venue time. */
export function reasonAt(
  slots: readonly Slot[],
  day: string,
  hhmm: string
): string {
  const startMs = at(day, hhmm);
  const slot = slots.find((candidate) => candidate.startMs === startMs);
  if (!slot) {
    throw new Error(`No candidate at ${day} ${hhmm}`);
  }
  return slot.status === 'open' ? 'open' : slot.reason;
}
