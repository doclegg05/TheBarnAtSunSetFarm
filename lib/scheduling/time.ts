import { DateTime } from 'luxon';

/** Every date and wall-clock time in the scheduler is read in the venue's zone. */
export const VENUE_TZ = 'America/New_York';

declare const isoDateBrand: unique symbol;

/** A calendar date in the venue's time zone, written YYYY-MM-DD. */
export type IsoDate = string & { readonly [isoDateBrand]: true };

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WALL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parses a YYYY-MM-DD string. Throws on anything that is not a real date. */
export function toIsoDate(value: string): IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error(`Not a YYYY-MM-DD date: ${value}`);
  }
  const parsed = DateTime.fromISO(value, { zone: VENUE_TZ });
  if (!parsed.isValid || parsed.toISODate() !== value) {
    throw new Error(`Not a real calendar date: ${value}`);
  }
  return value as IsoDate;
}

function dateOf(dateTime: DateTime): IsoDate {
  const day = dateTime.toISODate();
  if (day === null) {
    throw new Error('Invalid date-time');
  }
  return day as IsoDate;
}

/** The venue-zone calendar date of an instant. */
export function venueDay(epochMs: number): IsoDate {
  return dateOf(DateTime.fromMillis(epochMs, { zone: VENUE_TZ }));
}

export function addDays(day: IsoDate, days: number): IsoDate {
  return dateOf(DateTime.fromISO(day, { zone: VENUE_TZ }).plus({ days }));
}

/** Every date from `first` to `last`, both included. */
export function eachDay(first: IsoDate, last: IsoDate): IsoDate[] {
  const days: IsoDate[] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
}

export function dayInRange(
  day: IsoDate,
  first: IsoDate,
  last: IsoDate
): boolean {
  return day >= first && day <= last;
}

/** True when two inclusive date ranges have at least one date in common. */
export function rangesShareDay(
  aFirst: IsoDate,
  aLast: IsoDate,
  bFirst: IsoDate,
  bLast: IsoDate
): boolean {
  return aFirst <= bLast && bFirst <= aLast;
}

/** ISO weekday of a date: 1 is Monday, 7 is Sunday. */
export function weekday(day: IsoDate): number {
  return DateTime.fromISO(day, { zone: VENUE_TZ }).weekday;
}

/** Minutes after midnight for an HH:mm wall-clock time. */
export function wallMinutes(hhmm: string): number {
  const match = WALL_TIME_PATTERN.exec(hhmm);
  if (!match) {
    throw new Error(`Not an HH:mm time: ${hhmm}`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * The instant a venue wall-clock time happens on a date, or null when that
 * time does not exist (the hour skipped when daylight saving time starts).
 */
export function venueWallTime(day: IsoDate, minutes: number): number | null {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const [year, month, date] = day.split('-').map(Number);
  const dateTime = DateTime.fromObject(
    { year, month, day: date, hour, minute },
    { zone: VENUE_TZ }
  );
  const exists =
    dateTime.isValid &&
    dateTime.hour === hour &&
    dateTime.minute === minute &&
    dateTime.toISODate() === day;
  return exists ? dateTime.toMillis() : null;
}
