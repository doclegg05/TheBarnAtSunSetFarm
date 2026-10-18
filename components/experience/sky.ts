/**
 * The experience page is one day at the farm: the sky behind every section
 * moves from dawn to a starry night as the visitor scrolls. Each section
 * names a time of day; the page blends between them, and the text colour
 * ("ink") blends with the sky so copy always reads against it.
 */

export type SkyName =
  | 'dawn'
  | 'morning'
  | 'golden'
  | 'sunset'
  | 'dusk'
  | 'night';

type Rgb = readonly [number, number, number];

export interface SkyState {
  top: Rgb;
  middle: Rgb;
  bottom: Rgb;
  ink: Rgb;
  /** Sun height above the horizon, 0 (set) to 1 (high noon). */
  sun: number;
  /** Sun left-to-right position across the viewport, 0 to 1. */
  sunX: number;
  /** Warmth of the sun's glow, 0 (white) to 1 (deep orange). */
  glow: number;
  /** Opacity of the star field. */
  stars: number;
  /** How many fireflies are awake, 0 to 1. */
  fireflies: number;
}

const hex = (value: string): Rgb => {
  const n = parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const CHARCOAL = hex('#3f3a36');
const CREAM = hex('#fdf8f5');

export const SKIES: Readonly<Record<SkyName, SkyState>> = {
  dawn: {
    top: hex('#f3d6d0'),
    middle: hex('#f9e6de'),
    bottom: hex('#fdf8f5'),
    ink: CHARCOAL,
    sun: 0.12,
    sunX: 0.12,
    glow: 0.55,
    stars: 0,
    fireflies: 0,
  },
  morning: {
    top: hex('#e4ece2'),
    middle: hex('#f4f4ec'),
    bottom: hex('#fdf8f5'),
    ink: CHARCOAL,
    sun: 0.85,
    sunX: 0.3,
    glow: 0.1,
    stars: 0,
    fireflies: 0,
  },
  golden: {
    top: hex('#f6dcae'),
    middle: hex('#fae9cc'),
    bottom: hex('#fdf5e8'),
    ink: CHARCOAL,
    sun: 0.55,
    sunX: 0.6,
    glow: 0.45,
    stars: 0,
    fireflies: 0,
  },
  sunset: {
    top: hex('#efb894'),
    middle: hex('#f6cfb0'),
    bottom: hex('#fae3d2'),
    ink: CHARCOAL,
    sun: 0.18,
    sunX: 0.82,
    glow: 0.9,
    stars: 0,
    fireflies: 0,
  },
  dusk: {
    top: hex('#262640'),
    middle: hex('#3d3150'),
    bottom: hex('#5b3e55'),
    ink: CREAM,
    sun: -0.15,
    sunX: 0.92,
    glow: 1,
    stars: 0.45,
    fireflies: 0.4,
  },
  night: {
    top: hex('#0c1022'),
    middle: hex('#141a31'),
    bottom: hex('#1f2440'),
    ink: CREAM,
    sun: -0.4,
    sunX: 0.98,
    glow: 1,
    stars: 1,
    fireflies: 1,
  },
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const mixNumber = (a: number, b: number, t: number) => a + (b - a) * t;

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(mixNumber(a[0], b[0], t)),
  Math.round(mixNumber(a[1], b[1], t)),
  Math.round(mixNumber(a[2], b[2], t)),
];

/** Ink flips over a narrow band so text is never left at a muddy mid-tone. */
const inkCurve = (t: number) => {
  const x = clamp01((t - 0.35) / 0.3);
  return x * x * (3 - 2 * x);
};

export const mixSky = (a: SkyState, b: SkyState, t: number): SkyState => {
  const k = clamp01(t);
  return {
    top: mixRgb(a.top, b.top, k),
    middle: mixRgb(a.middle, b.middle, k),
    bottom: mixRgb(a.bottom, b.bottom, k),
    ink: mixRgb(a.ink, b.ink, inkCurve(k)),
    sun: mixNumber(a.sun, b.sun, k),
    sunX: mixNumber(a.sunX, b.sunX, k),
    glow: mixNumber(a.glow, b.glow, k),
    stars: mixNumber(a.stars, b.stars, k),
    fireflies: mixNumber(a.fireflies, b.fireflies, k),
  };
};

export interface SectionPosition {
  sky: SkyName;
  /** Distance from the viewport top to the section top, in pixels. */
  top: number;
}

/**
 * The sky for the current scroll position. A section takes over the sky as
 * it rises from the bottom of the viewport to 40% of the way down, so the new
 * time of day is fully in place before its heading reaches eye level.
 */
export const skyAt = (
  sections: readonly SectionPosition[],
  viewportHeight: number
): SkyState => {
  if (sections.length === 0) return SKIES.dawn;
  let sky = SKIES[sections[0].sky];
  const span = Math.max(1, viewportHeight * 0.6);
  for (let i = 1; i < sections.length; i += 1) {
    const entered = (viewportHeight - sections[i].top) / span;
    if (entered <= 0) break;
    sky = mixSky(sky, SKIES[sections[i].sky], entered);
  }
  return sky;
};

export const rgb = (color: Rgb, alpha = 1) =>
  alpha === 1
    ? `rgb(${color[0]} ${color[1]} ${color[2]})`
    : `rgb(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;
