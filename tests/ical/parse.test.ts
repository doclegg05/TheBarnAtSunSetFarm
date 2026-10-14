// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { FeedParseError, parseLodgingFeed } from '../../lib/ical/parse';

/** Joins lines with CRLF, the way calendar feeds are served. */
const ics = (...lines: string[]) => lines.join('\r\n') + '\r\n';

/** Wraps made-up events in a calendar. No real data. */
const wrap = (...events: string[][]) =>
  ics(
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Example Host//Test Feed//EN',
    ...events.flat(),
    'END:VCALENDAR'
  );

const rentalStyle = wrap(
  [
    'BEGIN:VEVENT',
    'DTSTAMP:20261013T120000Z',
    'DTSTART;VALUE=DATE:20261023',
    'DTEND;VALUE=DATE:20261025',
    'SUMMARY:Reserved',
    'UID:sample-reservation-1@example.test',
    'END:VEVENT',
  ],
  [
    'BEGIN:VEVENT',
    'DTSTAMP:20261013T120000Z',
    'DTSTART;VALUE=DATE:20261101',
    'DTEND;VALUE=DATE:20261103',
    'SUMMARY:Not available',
    'UID:sample-owner-block-2@example.test',
    'END:VEVENT',
  ]
);

describe('parseLodgingFeed', () => {
  it('reads all-day entries as check-in and check-out dates', () => {
    expect(parseLodgingFeed(rentalStyle)).toEqual({
      stays: [
        {
          uid: 'sample-reservation-1@example.test',
          checkIn: '2026-10-23',
          checkOut: '2026-10-25',
        },
        {
          uid: 'sample-owner-block-2@example.test',
          checkIn: '2026-11-01',
          checkOut: '2026-11-03',
        },
      ],
      skipped: 0,
    });
  });

  it('counts owner-blocked nights as occupied (spec R8)', () => {
    const uids = parseLodgingFeed(rentalStyle).stays.map((stay) => stay.uid);
    expect(uids).toContain('sample-owner-block-2@example.test');
  });

  it('unfolds long lines and ignores unknown properties', () => {
    const folded = wrap([
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20261023',
      'DTEND;VALUE=DATE:20261025',
      'UID:sample-folded-3@exa',
      ' mple.test',
      'X-EXAMPLE-NOTE:anything',
      'DESCRIPTION:A long description that runs past the',
      '  seventy-five octet limit and wraps',
      'END:VEVENT',
    ]);
    expect(parseLodgingFeed(folded).stays[0].uid).toBe(
      'sample-folded-3@example.test'
    );
  });

  it('converts UTC and TZID date-times to venue dates', () => {
    const timed = wrap(
      [
        'BEGIN:VEVENT',
        'DTSTART:20261023T190000Z',
        'DTEND:20261025T150000Z',
        'UID:sample-utc-4',
        'END:VEVENT',
      ],
      [
        'BEGIN:VEVENT',
        'DTSTART;TZID=America/New_York:20261101T160000',
        'DTEND;TZID=America/New_York:20261103T110000',
        'UID:sample-tzid-5',
        'END:VEVENT',
      ]
    );
    expect(parseLodgingFeed(timed).stays).toEqual([
      { uid: 'sample-utc-4', checkIn: '2026-10-23', checkOut: '2026-10-25' },
      { uid: 'sample-tzid-5', checkIn: '2026-11-01', checkOut: '2026-11-03' },
    ]);
  });

  it('puts a UTC time just after midnight on the previous venue date', () => {
    const late = wrap([
      'BEGIN:VEVENT',
      'DTSTART:20261024T030000Z',
      'DTEND:20261025T150000Z',
      'UID:sample-late-6',
      'END:VEVENT',
    ]);
    expect(parseLodgingFeed(late).stays[0].checkIn).toBe('2026-10-23');
  });

  it('reads an unknown TZID name as venue time', () => {
    const odd = wrap([
      'BEGIN:VEVENT',
      'DTSTART;TZID=Eastern Standard Time:20261101T160000',
      'DTEND;TZID=Eastern Standard Time:20261103T110000',
      'UID:sample-oddzone-7',
      'END:VEVENT',
    ]);
    expect(parseLodgingFeed(odd).stays[0]).toEqual({
      uid: 'sample-oddzone-7',
      checkIn: '2026-11-01',
      checkOut: '2026-11-03',
    });
  });

  it('gives an all-day entry with no end one night, and a timed one no extra night', () => {
    const open = wrap(
      [
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:20261023',
        'UID:sample-noend-8',
        'END:VEVENT',
      ],
      [
        'BEGIN:VEVENT',
        'DTSTART:20261023T190000Z',
        'UID:sample-noend-9',
        'END:VEVENT',
      ]
    );
    expect(parseLodgingFeed(open).stays).toEqual([
      { uid: 'sample-noend-8', checkIn: '2026-10-23', checkOut: '2026-10-24' },
      { uid: 'sample-noend-9', checkIn: '2026-10-23', checkOut: '2026-10-23' },
    ]);
  });

  it('uses the dates as an id when an entry has no UID', () => {
    const anonymous = wrap([
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20261023',
      'DTEND;VALUE=DATE:20261025',
      'END:VEVENT',
    ]);
    expect(parseLodgingFeed(anonymous).stays[0].uid).toBe(
      '2026-10-23/2026-10-25'
    );
  });

  it('skips entries with no start or with an end before the start', () => {
    const messy = wrap(
      ['BEGIN:VEVENT', 'UID:sample-nostart-10', 'END:VEVENT'],
      [
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:20261025',
        'DTEND;VALUE=DATE:20261023',
        'UID:sample-backwards-11',
        'END:VEVENT',
      ],
      [
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:20261101',
        'DTEND;VALUE=DATE:20261102',
        'UID:sample-ok-12',
        'END:VEVENT',
      ]
    );
    expect(parseLodgingFeed(messy)).toEqual({
      stays: [
        { uid: 'sample-ok-12', checkIn: '2026-11-01', checkOut: '2026-11-02' },
      ],
      skipped: 2,
    });
  });

  it('returns no stays for an empty calendar', () => {
    expect(parseLodgingFeed(wrap())).toEqual({ stays: [], skipped: 0 });
  });

  it('tolerates a byte-order mark', () => {
    expect(parseLodgingFeed('﻿' + rentalStyle).stays).toHaveLength(2);
  });

  it.each([
    ['an HTML error page', '<!doctype html><html><body>Sign in</body></html>'],
    ['plain text', 'This is not a calendar'],
    ['an empty response', ''],
  ])('rejects %s with FeedParseError', (_label, body) => {
    expect(() => parseLodgingFeed(body)).toThrow(FeedParseError);
  });
});
