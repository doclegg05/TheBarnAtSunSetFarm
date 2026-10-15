// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { candidatesForDay, mergeWindows } from '../../lib/scheduling/slots';
import { DEFAULT_TYPES } from '../../lib/scheduling/types';
import { d, everyDay9to5, HOUR, wall } from './helpers';

const showing = DEFAULT_TYPES.showing;

describe('mergeWindows', () => {
  it('joins overlapping and touching blocks for the weekday', () => {
    const hours = [
      { weekday: 2, start: '11:00', end: '14:00' },
      { weekday: 2, start: '09:00', end: '12:00' },
      { weekday: 2, start: '14:00', end: '15:00' },
      { weekday: 2, start: '16:00', end: '17:00' },
      { weekday: 3, start: '08:00', end: '09:00' },
    ];
    expect(mergeWindows(hours, 2)).toEqual([
      { start: 540, end: 900 },
      { start: 960, end: 1020 },
    ]);
  });

  it('drops blocks whose end is not after their start', () => {
    expect(
      mergeWindows([{ weekday: 2, start: '12:00', end: '12:00' }], 2)
    ).toEqual([]);
  });
});

describe('candidatesForDay', () => {
  it('offers a start every 30 minutes from opening to the last start before closing', () => {
    const starts = candidatesForDay(d('2026-10-20'), showing, everyDay9to5).map(
      (c) => wall(c.startMs)
    );
    expect(starts[0]).toBe('09:00');
    expect(starts.at(-1)).toBe('16:30');
    expect(starts).toHaveLength(16);
  });

  it('records the window end so a start too close to closing can be hidden', () => {
    const last = candidatesForDay(d('2026-10-20'), showing, everyDay9to5).at(
      -1
    );
    expect(last && last.endMs > last.windowEndMs).toBe(true);
  });

  it('offers nothing on a weekday with no hours', () => {
    const tuesdaysOnly = [{ weekday: 2, start: '09:00', end: '17:00' }];
    expect(candidatesForDay(d('2026-10-19'), showing, tuesdaysOnly)).toEqual(
      []
    );
  });

  it('never repeats a start when hour blocks overlap, and uses the merged closing time', () => {
    const hours = [
      { weekday: 2, start: '09:00', end: '12:00' },
      { weekday: 2, start: '11:00', end: '14:00' },
    ];
    const candidates = candidatesForDay(d('2026-10-20'), showing, hours);
    const starts = candidates.map((c) => c.startMs);
    expect(new Set(starts).size).toBe(starts.length);
    const elevenThirty = candidates.find((c) => wall(c.startMs) === '11:30');
    expect(elevenThirty && wall(elevenThirty.windowEndMs)).toBe('14:00');
  });

  it('keeps wall-clock starts and true 60-minute lengths when daylight saving ends (2026-11-01)', () => {
    const fallBack = candidatesForDay(d('2026-11-01'), showing, everyDay9to5);
    const ordinary = candidatesForDay(d('2026-10-20'), showing, everyDay9to5);
    expect(fallBack.map((c) => wall(c.startMs))).toEqual(
      ordinary.map((c) => wall(c.startMs))
    );
    expect(fallBack.every((c) => c.endMs - c.startMs === HOUR)).toBe(true);
  });

  it('keeps 16 distinct starts when daylight saving starts (2027-03-14)', () => {
    const starts = candidatesForDay(d('2027-03-14'), showing, everyDay9to5).map(
      (c) => wall(c.startMs)
    );
    expect(starts).toHaveLength(16);
    expect(new Set(starts).size).toBe(16);
  });

  it('skips wall-clock times that do not exist on 2027-03-14', () => {
    const night = [{ weekday: 7, start: '01:00', end: '04:00' }];
    const starts = candidatesForDay(
      d('2027-03-14'),
      DEFAULT_TYPES.call,
      night
    ).map((c) => wall(c.startMs));
    expect(starts).toEqual(['01:00', '01:30', '03:00', '03:30']);
  });
});
