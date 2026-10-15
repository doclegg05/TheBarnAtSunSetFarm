import ICAL from 'ical.js';
import { DateTime } from 'luxon';
import { addDays, toIsoDate, VENUE_TZ, type IsoDate } from '../scheduling/time';

type IcalComponent = InstanceType<typeof ICAL.Component>;
type IcalProperty = InstanceType<typeof ICAL.Property>;
type IcalTime = InstanceType<typeof ICAL.Time>;

/** The longest stay an entry may give as a DURATION. Longer values are refused, never added up. */
const MAX_DURATION_SECONDS = 400 * 24 * 60 * 60;

/** Some servers start the file with this invisible character; ical.js rejects it. */
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

export interface ParsedStay {
  uid: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
}

export interface ParseResult {
  stays: ParsedStay[];
}

/** A feed that cannot be trusted in full. Messages never repeat feed text, which can hold guest details. */
export class FeedParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedParseError';
  }
}

/**
 * Reads an Airbnb or VRBO calendar feed. Every entry counts as occupied (spec R8),
 * so an entry that cannot be read fails the whole feed instead of vanishing.
 */
export function parseLodgingFeed(text: string): ParseResult {
  const calendar = parseCalendar(text);
  const vevents = calendar.getAllSubcomponents('vevent');
  if (countAllVevents(calendar) !== vevents.length) {
    throw new FeedParseError(
      'Not a usable feed: an entry is nested inside another part'
    );
  }
  return { stays: vevents.map(readStay) };
}

function parseCalendar(text: string): IcalComponent {
  let root: IcalComponent;
  try {
    const body = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text;
    root = new ICAL.Component(ICAL.parse(body));
  } catch {
    // ical.js quotes the offending line, so its message is dropped on purpose.
    throw new FeedParseError(
      'Not a calendar feed: the text is not valid iCalendar'
    );
  }
  if (root.name !== 'vcalendar') {
    throw new FeedParseError('Not a calendar feed: no VCALENDAR');
  }
  return root;
}

/** Every VEVENT at any depth, counted without recursion so deep nesting cannot overflow the stack. */
function countAllVevents(root: IcalComponent): number {
  const pending = [...root.getAllSubcomponents()];
  let count = 0;
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    if (next.name === 'vevent') count += 1;
    for (const child of next.getAllSubcomponents()) pending.push(child);
  }
  return count;
}

/** ical.js decodes values lazily and throws plain errors that quote feed text. */
function readStay(vevent: IcalComponent): ParsedStay {
  try {
    return toStay(vevent);
  } catch (error) {
    if (error instanceof FeedParseError) throw error;
    throw new FeedParseError(
      'Not a usable feed: an entry has a value that cannot be read'
    );
  }
}

function toStay(vevent: IcalComponent): ParsedStay {
  if (vevent.hasProperty('rrule') || vevent.hasProperty('rdate')) {
    throw new FeedParseError('Not a usable feed: an entry repeats');
  }
  const start = vevent.getFirstProperty('dtstart');
  const checkIn = start ? dateOf(start) : null;
  if (!start || checkIn === null) {
    throw new FeedParseError('Not a usable feed: an entry has no start date');
  }
  const end = vevent.getFirstProperty('dtend');
  const checkOut = end ? dateOf(end) : defaultCheckOut(vevent, start, checkIn);
  if (checkOut === null) {
    throw new FeedParseError('Not a usable feed: an entry has no end date');
  }
  if (checkOut < checkIn) {
    throw new FeedParseError(
      'Not a usable feed: an entry ends before it starts'
    );
  }
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
  if (!vevent.hasProperty('duration')) {
    return value instanceof ICAL.Time && value.isDate
      ? addDays(checkIn, 1)
      : checkIn;
  }
  const duration = vevent.getFirstPropertyValue('duration');
  if (!(value instanceof ICAL.Time) || !(duration instanceof ICAL.Duration)) {
    return null;
  }
  if (duration.isNegative || duration.toSeconds() > MAX_DURATION_SECONDS) {
    throw new FeedParseError(
      'Not a usable feed: an entry has a negative or over-long duration'
    );
  }
  const endTime = value.clone();
  endTime.addDuration(duration);
  return venueDateOf(start, endTime);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The venue date a DTSTART or DTEND value falls on. */
function dateOf(property: IcalProperty): IsoDate | null {
  const value = property.getFirstValue();
  if (!(value instanceof ICAL.Time)) return null;
  assertRealDate(property);
  return venueDateOf(property, value);
}

/** ical.js rolls impossible dates over (Feb 30 becomes Mar 2), so check the text it was given. */
function assertRealDate(property: IcalProperty): void {
  const raw: unknown = property.jCal[3];
  if (typeof raw !== 'string') {
    throw new FeedParseError('Not a usable feed: an entry has no date text');
  }
  toIsoDate(raw.slice(0, 10));
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
