import type { ResponsiveImage } from '../../scripts/responsiveImages';
import { PHOTOS } from './photos';

/*
 * What the opening drone film shows: captions timed to the film and the
 * places on its last frame that open real photos. Positions are measured on
 * the film's own frames (FRAME pixels), then mapped to the screen.
 */

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** The film's frames, in the pixels the hotspots are measured in. */
export const FRAME: Size = { width: 1024, height: 576 };
/** How close to an edge a pin may sit before it moves to the chip row. */
const EDGE = 28;

/**
 * Where a point on a frame drawn with object-fit: cover lands in a box, and
 * whether it is far enough inside the box to show a pin there.
 */
export const coverPoint = (
  point: Point,
  frame: Size,
  box: Size
): Point & { visible: boolean } => {
  const scale = Math.max(box.width / frame.width, box.height / frame.height);
  const x = (box.width - frame.width * scale) / 2 + point.x * scale;
  const y = (box.height - frame.height * scale) / 2 + point.y * scale;
  const visible =
    x >= EDGE && x <= box.width - EDGE && y >= EDGE && y <= box.height - EDGE;
  return { x, y, visible };
};

/** Shown in turn as the film plays; `from` and `to` are film progress. */
export const CAPTIONS = [
  {
    from: 0.04,
    to: 0.26,
    eyebrow: 'The farm',
    text: 'A hilltop of its own, ringed by forest',
  },
  {
    from: 0.3,
    to: 0.52,
    eyebrow: 'The drive',
    text: 'A private gravel road up the ridge',
  },
  {
    from: 0.56,
    to: 0.76,
    eyebrow: 'The view',
    text: 'Mist in the valleys, mountains on every side',
  },
  {
    from: 0.8,
    to: 0.97,
    eyebrow: 'The barn',
    text: 'Board and batten, cedar doors, two cupolas',
  },
] as const;

export interface Hotspot {
  id: string;
  label: string;
  line: string;
  /** Position on the film's last frame, in FRAME pixels. */
  x: number;
  y: number;
  image: ResponsiveImage;
  alt: string;
  /** Put the label above the pin wherever it sits, clear of a pin below. */
  labelAbove?: boolean;
}

export const HOTSPOTS: readonly Hotspot[] = [
  {
    id: 'doors',
    label: 'The reception hall',
    line: 'The cedar doors open onto the hall: knotty pine, round tables, room for 200.',
    x: 522,
    y: 488,
    image: PHOTOS.greatRoom,
    alt: 'The reception hall set with round tables and gold chargers',
  },
  {
    id: 'loft',
    label: 'The bridal suite',
    line: 'Upstairs behind the hayloft doors: mirrors, vanities and room to get ready together.',
    x: 537,
    y: 392,
    image: PHOTOS.loft,
    alt: 'The bridal suite in the loft, with lit mirrors and vanity tables',
    labelAbove: true,
  },
  {
    id: 'porch',
    label: 'The covered porch',
    line: 'Long tables under the porch roof, for dinner in the open air.',
    x: 236,
    y: 476,
    image: PHOTOS.porchTables,
    alt: 'A long dinner table set along the covered porch',
  },
  {
    id: 'view',
    label: 'The ceremony view',
    line: 'Rows of chairs on the lawn, and the hills beyond them.',
    x: 860,
    y: 190,
    image: PHOTOS.porchView,
    alt: 'Ceremony chairs on the lawn, seen from the covered porch',
  },
];
