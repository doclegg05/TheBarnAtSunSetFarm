import { describe, expect, it } from 'vitest';
import {
  GoogleCalendarEvent,
  expandEventsToBookedDates,
  formatDateRangeLabel,
  isDateBooked,
  isPastDate,
} from '../lib/bookingDates';

const allDay = (
  start: string,
  end: string,
  status = 'confirmed'
): GoogleCalendarEvent => ({
  start: { date: start },
  end: { date: end },
  status,
});

describe('expandEventsToBookedDates', () => {
  it('returns an empty list for no events', () => {
    expect(expandEventsToBookedDates([])).toEqual([]);
  });

  it('marks each day of an all-day event, treating the end date as exclusive', () => {
    const dates = expandEventsToBookedDates([
      allDay('2027-03-05', '2027-03-07'),
    ]);
    expect(dates).toEqual(['2027-03-05', '2027-03-06']);
  });

  it('marks the day of a timed (dateTime) event', () => {
    const dates = expandEventsToBookedDates([
      {
        start: { dateTime: '2027-03-05T15:00:00Z' },
        end: { dateTime: '2027-03-05T20:00:00Z' },
        status: 'confirmed',
      },
    ]);
    expect(dates).toEqual(['2027-03-05']);
  });

  it('ignores cancelled and tentative events', () => {
    const dates = expandEventsToBookedDates([
      allDay('2027-03-05', '2027-03-06', 'cancelled'),
      allDay('2027-03-08', '2027-03-09', 'tentative'),
    ]);
    expect(dates).toEqual([]);
  });

  it('skips events missing a start or end', () => {
    const dates = expandEventsToBookedDates([
      { start: {}, end: { date: '2027-03-06' }, status: 'confirmed' },
      { start: { date: '2027-03-05' }, end: {}, status: 'confirmed' },
    ]);
    expect(dates).toEqual([]);
  });

  it('does not throw on malformed date strings and marks nothing', () => {
    const dates = expandEventsToBookedDates([
      allDay('not-a-date', '2027-03-06'),
      allDay('2027-03-05', 'garbage'),
    ]);
    expect(dates).toEqual([]);
  });

  it('marks nothing when the end is before the start', () => {
    expect(
      expandEventsToBookedDates([allDay('2027-03-07', '2027-03-05')])
    ).toEqual([]);
  });

  it('deduplicates days covered by overlapping events', () => {
    const dates = expandEventsToBookedDates([
      allDay('2027-03-05', '2027-03-07'),
      allDay('2027-03-06', '2027-03-08'),
    ]);
    expect(dates).toEqual(['2027-03-05', '2027-03-06', '2027-03-07']);
  });

  it('handles an oversized event list without losing days', () => {
    const events = Array.from({ length: 2500 }, (_, i) => {
      const day = new Date(Date.UTC(2027, 0, 1 + (i % 300)));
      const next = new Date(Date.UTC(2027, 0, 2 + (i % 300)));
      return allDay(
        day.toISOString().split('T')[0],
        next.toISOString().split('T')[0]
      );
    });
    expect(expandEventsToBookedDates(events)).toHaveLength(300);
  });
});

describe('isDateBooked', () => {
  const booked = ['2027-03-05', '2027-03-06'];

  it('is true for a date whose local day is in the booked list', () => {
    expect(isDateBooked(booked, new Date(2027, 2, 5))).toBe(true);
  });

  it('is false for a date outside the booked list', () => {
    expect(isDateBooked(booked, new Date(2027, 2, 9))).toBe(false);
  });

  it('is false against an empty booked list', () => {
    expect(isDateBooked([], new Date(2027, 2, 5))).toBe(false);
  });
});

describe('isPastDate', () => {
  const now = new Date(2027, 2, 15, 14, 30);

  it('is true for yesterday', () => {
    expect(isPastDate(new Date(2027, 2, 14), now)).toBe(true);
  });

  it('is false for today even though the current time is later', () => {
    expect(isPastDate(new Date(2027, 2, 15), now)).toBe(false);
  });

  it('is false for tomorrow', () => {
    expect(isPastDate(new Date(2027, 2, 16), now)).toBe(false);
  });
});

describe('formatDateRangeLabel', () => {
  it('is empty when either end of the range is missing', () => {
    expect(formatDateRangeLabel(null, null)).toBe('');
    expect(formatDateRangeLabel(new Date(2027, 0, 5), null)).toBe('');
    expect(formatDateRangeLabel(null, new Date(2027, 0, 7))).toBe('');
  });

  it('formats a complete range as "Mon D, YYYY - Mon D, YYYY"', () => {
    expect(
      formatDateRangeLabel(new Date(2027, 0, 5), new Date(2027, 0, 7))
    ).toBe('Jan 5, 2027 - Jan 7, 2027');
  });
});
