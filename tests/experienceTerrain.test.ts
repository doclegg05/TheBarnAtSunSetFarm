import { describe, expect, it } from 'vitest';
import {
  BARN_PAD_HEIGHT,
  forestDensity,
  seededRandom,
  terrainHeight,
} from '../components/experience/three/terrain';

describe('experience 3D terrain', () => {
  it('levels a flat pad for the barn', () => {
    for (const [x, z] of [
      [0, 0],
      [10, -8],
      [-12, 9],
    ]) {
      expect(terrainHeight(x, z)).toBeCloseTo(BARN_PAD_HEIGHT, 5);
    }
  });

  it('rises into mountains far from the barn', () => {
    const far = Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      return terrainHeight(Math.cos(angle) * 700, Math.sin(angle) * 700);
    });
    expect(Math.max(...far)).toBeGreaterThan(BARN_PAD_HEIGHT + 30);
  });

  it('keeps trees off the open ground around the barn', () => {
    expect(forestDensity(0, 0)).toBe(0);
    expect(forestDensity(20, 15)).toBe(0);
  });

  it('places everything the same way on every visit', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
