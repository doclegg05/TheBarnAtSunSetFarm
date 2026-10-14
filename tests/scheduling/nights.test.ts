// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  BARN_CLEANUP_DAYS,
  BARN_SETUP_DAYS,
  blockedNights,
  nightsOverlap,
  SPACES_BLOCKED_BY_EVENTS,
} from '../../lib/scheduling/nights';
import { d } from './helpers';

describe('blockedNights', () => {
  const weekend = { firstDay: d('2026-11-06'), lastDay: d('2026-11-08') };

  it('C9: a Friday-to-Sunday event blocks the Friday, Saturday and Sunday nights in the Cabin', () => {
    expect(blockedNights(weekend, 'cabin')).toEqual({
      start: '2026-11-06',
      endExclusive: '2026-11-09',
    });
  });

  it('C9: a one-day event blocks its own night', () => {
    expect(
      blockedNights(
        { firstDay: d('2026-11-07'), lastDay: d('2026-11-07') },
        'cabin'
      )
    ).toEqual({
      start: '2026-11-07',
      endExclusive: '2026-11-08',
    });
  });

  it('C10 and C11: the Barn adds two setup nights before and one cleanup night after', () => {
    expect(blockedNights(weekend, 'barn')).toEqual({
      start: '2026-11-04',
      endExclusive: '2026-11-10',
    });
    expect(BARN_SETUP_DAYS).toBe(1);
    expect(BARN_CLEANUP_DAYS).toBe(1);
  });

  it('C3 and C5: events block lodging in both the Barn and the Cabin', () => {
    expect(SPACES_BLOCKED_BY_EVENTS).toEqual(['barn', 'cabin']);
  });

  it('compares night ranges as half-open', () => {
    const event = { start: d('2026-11-06'), endExclusive: d('2026-11-08') };
    expect(
      nightsOverlap(event, {
        start: d('2026-11-08'),
        endExclusive: d('2026-11-10'),
      })
    ).toBe(false);
    expect(
      nightsOverlap(event, {
        start: d('2026-11-07'),
        endExclusive: d('2026-11-09'),
      })
    ).toBe(true);
    expect(
      nightsOverlap(event, {
        start: d('2026-11-04'),
        endExclusive: d('2026-11-06'),
      })
    ).toBe(false);
  });
});
