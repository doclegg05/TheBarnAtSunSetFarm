// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { computeSlots, openSlots } from '../../lib/scheduling/availability';
import { addDays } from '../../lib/scheduling/time';
import { DEFAULT_TYPES } from '../../lib/scheduling/types';
import { at, d, input, reasonAt, wall } from './helpers';

describe('computeSlots: time rules', () => {
  it('hides times already started or inside the notice period', () => {
    const slots = computeSlots(
      input({
        nowMs: at('2026-10-20', '10:00'),
        fromDay: d('2026-10-20'),
        toDay: d('2026-10-21'),
      })
    );
    expect(reasonAt(slots, '2026-10-20', '09:30')).toBe('past');
    expect(reasonAt(slots, '2026-10-20', '10:00')).toBe('past');
    expect(reasonAt(slots, '2026-10-20', '10:30')).toBe('too-soon');
    expect(reasonAt(slots, '2026-10-21', '09:30')).toBe('too-soon');
    expect(reasonAt(slots, '2026-10-21', '10:00')).toBe('open');
  });

  it('hides dates past the booking window', () => {
    const today = d('2026-10-13');
    const slots = computeSlots(
      input({ fromDay: addDays(today, 60), toDay: addDays(today, 61) })
    );
    expect(reasonAt(slots, addDays(today, 60), '09:00')).toBe('open');
    expect(reasonAt(slots, addDays(today, 61), '09:00')).toBe('out-of-window');
  });

  it('hides a start whose meeting would run past closing', () => {
    const slots = computeSlots(input());
    expect(reasonAt(slots, '2026-10-20', '16:00')).toBe('open');
    expect(reasonAt(slots, '2026-10-20', '16:30')).toBe('too-short');
  });

  it('hides times that overlap blocked time, counting the gap after a showing', () => {
    const blocks = [
      { startMs: at('2026-10-20', '13:00'), endMs: at('2026-10-20', '14:00') },
    ];
    const slots = computeSlots(input({ blocks }));
    expect(reasonAt(slots, '2026-10-20', '11:30')).toBe('open');
    expect(reasonAt(slots, '2026-10-20', '12:00')).toBe('blocked');
    expect(reasonAt(slots, '2026-10-20', '13:30')).toBe('blocked');
    expect(reasonAt(slots, '2026-10-20', '14:00')).toBe('open');
  });

  it('separates double bookings from gap clashes', () => {
    const appointments = [
      {
        id: 'a1',
        kind: 'showing' as const,
        startMs: at('2026-10-20', '13:00'),
        endMs: at('2026-10-20', '14:00'),
        blockedUntilMs: at('2026-10-20', '14:30'),
      },
    ];
    const slots = computeSlots(input({ appointments }));
    expect(reasonAt(slots, '2026-10-20', '11:30')).toBe('open');
    expect(reasonAt(slots, '2026-10-20', '12:00')).toBe('gap');
    expect(reasonAt(slots, '2026-10-20', '12:30')).toBe('booked');
    expect(reasonAt(slots, '2026-10-20', '13:00')).toBe('booked');
    expect(reasonAt(slots, '2026-10-20', '14:00')).toBe('gap');
    expect(reasonAt(slots, '2026-10-20', '14:30')).toBe('open');
  });

  it('treats back-to-back calls as no clash', () => {
    const appointments = [
      {
        id: 'c1',
        kind: 'call' as const,
        startMs: at('2026-10-20', '10:00'),
        endMs: at('2026-10-20', '10:30'),
        blockedUntilMs: at('2026-10-20', '10:30'),
      },
    ];
    const slots = computeSlots(
      input({ type: DEFAULT_TYPES.call, appointments })
    );
    expect(reasonAt(slots, '2026-10-20', '09:30')).toBe('open');
    expect(reasonAt(slots, '2026-10-20', '10:00')).toBe('booked');
    expect(reasonAt(slots, '2026-10-20', '10:30')).toBe('open');
  });

  it('reports the first rule that applies', () => {
    const blocks = [
      { startMs: at('2026-10-20', '09:00'), endMs: at('2026-10-20', '17:00') },
    ];
    const slots = computeSlots(
      input({ blocks, nowMs: at('2026-10-20', '12:00') })
    );
    expect(reasonAt(slots, '2026-10-20', '11:00')).toBe('past');
  });
});

describe('openSlots', () => {
  it('keeps only open times', () => {
    const blocks = [
      { startMs: at('2026-10-20', '09:00'), endMs: at('2026-10-20', '12:00') },
    ];
    const slots = openSlots(input({ blocks }));
    expect(slots.every((slot) => slot.status === 'open')).toBe(true);
    expect(wall(slots[0].startMs)).toBe('12:00');
  });
});
