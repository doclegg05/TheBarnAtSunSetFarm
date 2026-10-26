/**
 * Procedural landscape for the 3D scene: a gentle hilltop for the barn,
 * rolling fields around it, and ridged West Virginia mountains that grow
 * taller with distance. Pure functions, so the shape is the same on every
 * device and can be tested without a GPU.
 */

const fract = (x: number) => x - Math.floor(x);

const hash = (x: number, y: number) =>
  fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);

const smooth = (t: number) => t * t * (3 - 2 * t);

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return smooth(t);
};

/** Value noise in roughly [-1, 1]. */
const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * 2 - 1;
};

const fbm = (x: number, y: number, octaves: number) => {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i += 1) {
    total += noise(x * frequency, y * frequency) * amplitude;
    frequency *= 2;
    amplitude *= 0.5;
  }
  return total;
};

/** Sharp-crested noise for mountain ridgelines, in [0, 1]. */
const ridged = (x: number, y: number) => {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 5; i += 1) {
    const n = 1 - Math.abs(noise(x * frequency, y * frequency));
    total += n * n * amplitude;
    frequency *= 2.05;
    amplitude *= 0.5;
  }
  return total;
};

/** The barn's pad is flat at this height, on top of its hill. */
export const BARN_PAD_HEIGHT = 8;
const PAD_RADIUS = 18;

export const terrainHeight = (x: number, z: number): number => {
  const distance = Math.hypot(x, z);
  const hill = 10 * Math.exp(-(distance * distance) / (2 * 55 * 55));
  const fields = fbm(x * 0.018, z * 0.018, 4) * 5;
  const valley = -10 * smoothstep(40, 160, distance);
  const mountains =
    ridged(x * 0.0045 + 3.1, z * 0.0045 - 1.7) *
    125 *
    smoothstep(160, 600, distance);
  const height = hill + fields + valley + mountains - 2;
  // Level a pad for the barn and ease the ground into it.
  return (
    BARN_PAD_HEIGHT +
    (height - BARN_PAD_HEIGHT) *
      smoothstep(PAD_RADIUS, PAD_RADIUS + 22, distance)
  );
};

/** Deterministic pseudo-random sequence so tree placement never jitters. */
export const seededRandom = (seed: number) => {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

/** Forest density at a point, 0 to 1: patchy woods, open fields near the barn. */
export const forestDensity = (x: number, z: number) => {
  const distance = Math.hypot(x, z);
  const patches = fbm(x * 0.012 + 40, z * 0.012 - 13, 3);
  return smoothstep(-0.05, 0.25, patches) * smoothstep(34, 70, distance);
};
