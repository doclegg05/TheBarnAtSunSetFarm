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

  it('uses DURATION for the check-out date when an entry has no DTEND', () => {
    const lasting = wrap(
      [
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:20261020',
        'DURATION:P3D',
        'UID:sample-duration-13',
        'END:VEVENT',
      ],
      [
        'BEGIN:VEVENT',
        'DTSTART:20261023T190000Z',
        'DURATION:PT44H',
        'UID:sample-duration-14',
        'END:VEVENT',
      ]
    );
    expect(parseLodgingFeed(lasting).stays).toEqual([
      {
        uid: 'sample-duration-13',
        checkIn: '2026-10-20',
        checkOut: '2026-10-23',
      },
      {
        uid: 'sample-duration-14',
        checkIn: '2026-10-23',
        checkOut: '2026-10-25',
      },
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

  it('returns no stays for an empty calendar', () => {
    expect(parseLodgingFeed(wrap())).toEqual({ stays: [] });
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

/** One otherwise good entry plus the lines under test. */
const entryWith = (...lines: string[]) =>
  wrap(['BEGIN:VEVENT', 'UID:sample-hostile', ...lines, 'END:VEVENT']);

describe('parseLodgingFeed fails closed (spec R8: a stay it cannot read must not vanish)', () => {
  it.each([
    ['an entry with no start', entryWith('DTEND;VALUE=DATE:20261025')],
    [
      'an entry that ends before it starts',
      entryWith('DTSTART;VALUE=DATE:20261025', 'DTEND;VALUE=DATE:20261023'),
    ],
    [
      'an unreadable end',
      entryWith('DTSTART;VALUE=DATE:20261023', 'DTEND;VALUE=TEXT:soon'),
    ],
    [
      'an unreadable start date',
      entryWith('DTSTART;VALUE=DATE:notadate', 'DTEND;VALUE=DATE:20261025'),
    ],
    [
      'an impossible date',
      entryWith('DTSTART;VALUE=DATE:20261340', 'DTEND;VALUE=DATE:20261342'),
    ],
    [
      'a negative duration',
      entryWith('DTSTART;VALUE=DATE:20261023', 'DURATION:-P3D'),
    ],
    [
      'an unreadable duration',
      entryWith('DTSTART;VALUE=DATE:20261023', 'DURATION:soon'),
    ],
    [
      'a duration over 400 days',
      entryWith('DTSTART;VALUE=DATE:20261023', 'DURATION:P500D'),
    ],
    [
      'a repeating entry (RRULE)',
      entryWith(
        'DTSTART;VALUE=DATE:20261023',
        'DTEND;VALUE=DATE:20261025',
        'RRULE:FREQ=WEEKLY;COUNT=10'
      ),
    ],
    [
      'extra dates (RDATE)',
      entryWith(
        'DTSTART;VALUE=DATE:20261023',
        'DTEND;VALUE=DATE:20261025',
        'RDATE;VALUE=DATE:20261030'
      ),
    ],
    [
      'an entry nested in another component',
      wrap([
        'BEGIN:X-GROUP',
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:20261023',
        'DTEND;VALUE=DATE:20261025',
        'UID:sample-nested',
        'END:VEVENT',
        'END:X-GROUP',
      ]),
    ],
  ])('throws FeedParseError for %s', (_label, body) => {
    expect(() => parseLodgingFeed(body)).toThrow(FeedParseError);
  });

  it('rejects a huge duration at once instead of hanging', () => {
    const started = Date.now();
    expect(() =>
      parseLodgingFeed(
        entryWith('DTSTART;VALUE=DATE:20261023', 'DURATION:P10000000000D')
      )
    ).toThrow(FeedParseError);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('keeps feed text out of error messages', () => {
    const leaky =
      'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDESCRIPTION:Reservation\r\n' +
      'Phone Number (Last 4 Digits) 9876\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
    const huge = '<html>' + 'x'.repeat(100_000) + '</html>';
    for (const body of [leaky, huge]) {
      let message = '';
      try {
        parseLodgingFeed(body);
      } catch (error) {
        expect(error).toBeInstanceOf(FeedParseError);
        message = error instanceof Error ? error.message : String(error);
      }
      expect(message).not.toBe('');
      expect(message).not.toContain('9876');
      expect(message.length).toBeLessThan(120);
    }
  });
});
