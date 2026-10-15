// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { computeSlots } from '../../lib/scheduling/availability';
import { DEFAULT_TYPES } from '../../lib/scheduling/types';
import { d, input, reasonAt } from './helpers';

const barnStay = {
  space: 'barn' as const,
  checkIn: d('2026-10-23'),
  checkOut: d('2026-10-25'),
};
const range = { fromDay: d('2026-10-22'), toDay: d('2026-10-26') };

describe('lodging and event rules', () => {
  it('C1 and C8: a Barn stay hides showings on every date it covers, turnover dates included', () => {
    const slots = computeSlots(input({ ...range, stays: [barnStay] }));
    expect(reasonAt(slots, '2026-10-22', '10:00')).toBe('open');
    expect(reasonAt(slots, '2026-10-23', '10:00')).toBe('barn-occupied');
    expect(reasonAt(slots, '2026-10-24', '10:00')).toBe('barn-occupied');
    expect(reasonAt(slots, '2026-10-25', '10:00')).toBe('barn-occupied');
    expect(reasonAt(slots, '2026-10-26', '10:00')).toBe('open');
  });

  it('C2: a Cabin stay does not hide showings', () => {
    const slots = computeSlots(
      input({ ...range, stays: [{ ...barnStay, space: 'cabin' }] })
    );
    expect(reasonAt(slots, '2026-10-24', '10:00')).toBe('open');
  });

  it('C1: an event hides showings on each of its dates', () => {
    const events = [
      { id: 'e1', firstDay: d('2026-10-30'), lastDay: d('2026-11-01') },
    ];
    const slots = computeSlots(
      input({ fromDay: d('2026-10-29'), toDay: d('2026-11-02'), events })
    );
    expect(reasonAt(slots, '2026-10-29', '10:00')).toBe('open');
    expect(reasonAt(slots, '2026-10-30', '10:00')).toBe('event-day');
    expect(reasonAt(slots, '2026-11-01', '10:00')).toBe('event-day');
    expect(reasonAt(slots, '2026-11-02', '10:00')).toBe('open');
  });

  it('C7: calls ignore lodging stays and events', () => {
    const events = [
      { id: 'e1', firstDay: d('2026-10-23'), lastDay: d('2026-10-23') },
    ];
    const slots = computeSlots(
      input({ ...range, type: DEFAULT_TYPES.call, stays: [barnStay], events })
    );
    expect(reasonAt(slots, '2026-10-23', '10:00')).toBe('open');
    expect(reasonAt(slots, '2026-10-24', '10:00')).toBe('open');
  });
});
