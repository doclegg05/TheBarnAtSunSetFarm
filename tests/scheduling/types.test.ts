// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { DEFAULT_TYPES } from '../../lib/scheduling/types';

describe('DEFAULT_TYPES', () => {
  it('matches the defaults table in the spec', () => {
    expect(DEFAULT_TYPES.showing).toEqual({
      kind: 'showing',
      durationMin: 60,
      gapAfterMin: 30,
      noticeMin: 1440,
      windowDays: 60,
      stepMin: 30,
      needsBarnFree: true,
    });
    expect(DEFAULT_TYPES.call).toEqual({
      kind: 'call',
      durationMin: 30,
      gapAfterMin: 0,
      noticeMin: 240,
      windowDays: 60,
      stepMin: 30,
      needsBarnFree: false,
    });
  });
});
