// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  addDays,
  dayInRange,
  eachDay,
  rangesShareDay,
  toIsoDate,
  venueDay,
  venueWallTime,
  wallMinutes,
  weekday,
} from '../../lib/scheduling/time';

const d = toIsoDate;
const HOUR = 3_600_000;

describe('toIsoDate', () => {
  it('accepts a real YYYY-MM-DD date', () => {
    expect(toIsoDate('2026-10-20')).toBe('2026-10-20');
  });

  it.each(['2026-13-01', '2026-02-30', '10/20/2026', '2026-1-5', ''])(
    'rejects %s',
    (value) => {
      expect(() => toIsoDate(value)).toThrow();
    }
  );
});

describe('venue dates and times', () => {
  it('reads instants in Eastern time, not UTC', () => {
    // 23:30 Eastern on Oct 20 is already Oct 21 in UTC.
    const lateEvening = venueWallTime(d('2026-10-20'), wallMinutes('23:30'));
    expect(lateEvening).not.toBeNull();
    expect(venueDay(lateEvening as number)).toBe('2026-10-20');
    expect(new Date(lateEvening as number).toISOString().slice(0, 10)).toBe(
      '2026-10-21'
    );
  });

  it('adds days across month ends and daylight saving changes', () => {
    expect(addDays(d('2026-10-31'), 1)).toBe('2026-11-01');
    expect(addDays(d('2026-11-01'), 1)).toBe('2026-11-02');
    expect(addDays(d('2027-03-14'), -1)).toBe('2027-03-13');
  });

  it('lists every date in an inclusive range', () => {
    expect(eachDay(d('2026-10-30'), d('2026-11-02'))).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
    expect(eachDay(d('2026-10-30'), d('2026-10-29'))).toEqual([]);
  });

  it('numbers weekdays Monday 1 to Sunday 7', () => {
    expect(weekday(d('2026-10-19'))).toBe(1);
    expect(weekday(d('2026-10-20'))).toBe(2);
    expect(weekday(d('2026-10-25'))).toBe(7);
  });

  it('parses HH:mm and rejects other formats', () => {
    expect(wallMinutes('09:30')).toBe(570);
    expect(() => wallMinutes('9:30')).toThrow();
    expect(() => wallMinutes('24:00')).toThrow();
  });

  it('returns null for the hour skipped when daylight saving starts', () => {
    expect(venueWallTime(d('2027-03-14'), wallMinutes('02:30'))).toBeNull();
    expect(venueWallTime(d('2027-03-14'), wallMinutes('03:30'))).not.toBeNull();
  });

  it('counts the repeated hour when daylight saving ends', () => {
    const midnight = venueWallTime(d('2026-11-01'), 0) as number;
    const threeAm = venueWallTime(
      d('2026-11-01'),
      wallMinutes('03:00')
    ) as number;
    expect(threeAm - midnight).toBe(4 * HOUR);
  });

  it('compares inclusive date ranges', () => {
    expect(dayInRange(d('2026-10-23'), d('2026-10-23'), d('2026-10-25'))).toBe(
      true
    );
    expect(dayInRange(d('2026-10-26'), d('2026-10-23'), d('2026-10-25'))).toBe(
      false
    );
    expect(
      rangesShareDay(
        d('2026-10-20'),
        d('2026-10-23'),
        d('2026-10-23'),
        d('2026-10-25')
      )
    ).toBe(true);
    expect(
      rangesShareDay(
        d('2026-10-20'),
        d('2026-10-22'),
        d('2026-10-23'),
        d('2026-10-25')
      )
    ).toBe(false);
  });
});
