import ICAL from 'ical.js';
import { DateTime } from 'luxon';
import { addDays, toIsoDate, VENUE_TZ, type IsoDate } from '../scheduling/time';

type IcalComponent = InstanceType<typeof ICAL.Component>;
type IcalProperty = InstanceType<typeof ICAL.Property>;
type IcalTime = InstanceType<typeof ICAL.Time>;

export interface ParsedStay {
  uid: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
}

export interface ParseResult {
  stays: ParsedStay[];
  /** Entries dropped because they had no start or ended before they began. */
  skipped: number;
}

export class FeedParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedParseError';
  }
}

/** Reads an Airbnb or VRBO calendar feed. Every entry counts as occupied (spec R8). */
export function parseLodgingFeed(text: string): ParseResult {
  const entries = parseCalendar(text).getAllSubcomponents('vevent').map(toStay);
  const stays = entries.filter((stay): stay is ParsedStay => stay !== null);
  return { stays, skipped: entries.length - stays.length };
}

function parseCalendar(text: string): IcalComponent {
  let root: IcalComponent;
  try {
    root = new ICAL.Component(ICAL.parse(text.replace(/^\uFEFF/, '')));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new FeedParseError(`Not a calendar feed: ${reason}`);
  }
  if (root.name !== 'vcalendar') {
    throw new FeedParseError('Not a calendar feed: no VCALENDAR');
  }
  return root;
}

function toStay(vevent: IcalComponent): ParsedStay | null {
  const start = vevent.getFirstProperty('dtstart');
  const checkIn = start ? dateOf(start) : null;
  if (!start || checkIn === null) return null;
  const end = vevent.getFirstProperty('dtend');
  const checkOut = end ? dateOf(end) : defaultCheckOut(vevent, start, checkIn);
  if (checkOut === null || checkOut < checkIn) return null;
  const uid = vevent.getFirstPropertyValue('uid');
  return {
    uid: typeof uid === 'string' && uid !== '' ? uid : `${checkIn}/${checkOut}`,
    checkIn,
    checkOut,
  };
}

/**
 * No DTEND: the start plus DURATION when one is given. Otherwise an all-day
 * entry covers one night and a timed entry ends the same date.
 */
function defaultCheckOut(
  vevent: IcalComponent,
  start: IcalProperty,
  checkIn: IsoDate
): IsoDate | null {
  const value = start.getFirstValue();
  const duration = vevent.getFirstPropertyValue('duration');
  if (value instanceof ICAL.Time && duration instanceof ICAL.Duration) {
    const endTime = value.clone();
    endTime.addDuration(duration);
    return venueDateOf(start, endTime);
  }
  return value instanceof ICAL.Time && value.isDate
    ? addDays(checkIn, 1)
    : checkIn;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The venue date a DTSTART or DTEND value falls on. */
function dateOf(property: IcalProperty): IsoDate | null {
  const value = property.getFirstValue();
  return value instanceof ICAL.Time ? venueDateOf(property, value) : null;
}

/** The venue date of a time from a DTSTART or DTEND property, read in that property's zone. */
function venueDateOf(property: IcalProperty, value: IcalTime): IsoDate | null {
  if (value.isDate) {
    return toIsoDate(`${value.year}-${pad(value.month)}-${pad(value.day)}`);
  }
  const fields = {
    year: value.year,
    month: value.month,
    day: value.day,
    hour: value.hour,
    minute: value.minute,
    second: value.second,
  };
  const inSourceZone = DateTime.fromObject(fields, {
    zone: sourceZone(property, value),
  });
  const resolved = inSourceZone.isValid
    ? inSourceZone
    : DateTime.fromObject(fields, { zone: VENUE_TZ });
  const day = resolved.setZone(VENUE_TZ).toISODate();
  return day === null ? null : toIsoDate(day);
}

/** UTC for Z times, the TZID when given, otherwise venue time. Unknown TZIDs fall back to venue time. */
function sourceZone(property: IcalProperty, value: IcalTime): string {
  if (value.zone?.tzid === 'UTC') return 'utc';
  const tzid = property.getParameter('tzid');
  return typeof tzid === 'string' ? tzid : VENUE_TZ;
}
