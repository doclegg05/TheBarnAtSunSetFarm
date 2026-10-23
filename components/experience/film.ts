/**
 * Plays a film by scroll: the video lives as still frames in public/<name>/,
 * and scroll progress picks which one to draw. Between two frames it blends
 * them, so the motion stays smooth although there are only 10–12 frames a
 * second. Used for the opening drone descent and the walk into the barn.
 *
 * A film only loads once its section is near (`load`). It fetches every
 * frame's compressed file once, coarse to fine (every 16th, then every 8th,
 * and so on), and keeps those small files; fetching pauses while the film is
 * released and resumes where it stopped. Only the frames within
 * DECODE_RADIUS of the playhead are decoded, off the main thread, into
 * bitmaps that draw without further work; frames that fall out of that
 * window are freed. So memory stays flat however long the film is, and the
 * frame about to be drawn is already decoded. `release` frees every decoded
 * frame when the visitor has scrolled well away.
 */

export interface Film {
  readonly name: string;
  readonly count: number;
  readonly fps: number;
  readonly aspect: number;
  /** Each frame set's dimensions, in pixels. */
  readonly sizes: Readonly<Record<Size, FrameSize>>;
}

/**
 * The frame sets: landscape by width (sm 640, md 1024, lg 1920, xl 2560)
 * and pt, an upright 1080 x 1920 slice from the middle of the frame for
 * screens held upright, which only ever show that slice.
 */
export type Size = 'sm' | 'md' | 'lg' | 'xl' | 'pt';

export interface FrameSize {
  readonly width: number;
  readonly height: number;
}

interface Screen {
  width: number;
  height: number;
  /** Device pixels per CSS pixel. */
  ratio: number;
  saveData?: boolean;
}
type Direction = 1 | -1;

const FETCH_PARALLEL = 6;
/** Decoded frames kept either side of the playhead. */
export const DECODE_RADIUS = 12;
const MIN_RADIUS = 4;
const MB = 1024 * 1024;

export interface DecodeBudget {
  /** Frames decoded at once. */
  parallel: number;
  /** Roughly how much memory the decoded frames may take. */
  bytes: number;
  /** The most frames kept decoded either side of the playhead. */
  maxRadius: number;
}

interface Device {
  cores: number;
  /** navigator.deviceMemory, in GB; browsers cap it at 8. */
  memoryGb?: number;
  touch: boolean;
}

/**
 * Phones and touch screens keep a small, steady budget. A computer decodes
 * on up to half its cores and keeps more frames ready, because a wheel or
 * trackpad can cross a film far faster than a finger, and the larger frames
 * it shows take about 30 ms each to decode.
 */
export const decodeBudget = ({
  cores,
  memoryGb,
  touch,
}: Device): DecodeBudget =>
  touch
    ? { parallel: 3, bytes: 96 * MB, maxRadius: DECODE_RADIUS }
    : {
        parallel: Math.min(8, Math.max(3, Math.floor(cores / 2))),
        bytes: (memoryGb ?? 8) >= 8 ? 320 * MB : 160 * MB,
        maxRadius: 20,
      };

const PHONE_BUDGET = decodeBudget({ cores: 0, touch: true });
/**
 * How quickly the shown frame catches up with the scroll position: the gap
 * shrinks by about two thirds every GLIDE_MS. An uneven finger or wheel
 * then plays as one smooth move instead of a run of steps.
 */
const GLIDE_MS = 110;
/** Close enough to the scroll position to stop gliding. */
const SETTLED = 0.0004;

export const frameUrl = (film: Film, size: Size, index: number) =>
  `/${film.name}/${size}/${String(index).padStart(3, '0')}.avif`;

/** Every frame index, coarsest pass first: 0, 16, 32, …, then 8, 24, … */
export const loadOrder = (count: number) => {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let stride = 16; stride >= 1; stride /= 2) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
};

/**
 * The frames to decode around `center`, nearest first, and on a tie the one
 * in the direction of travel first.
 */
export const decodeOrder = (
  center: number,
  count: number,
  radius: number,
  direction: Direction
): number[] => {
  const order: number[] = [];
  for (let step = 0; step <= radius; step += 1) {
    const candidates =
      step === 0
        ? [center]
        : [center + step * direction, center - step * direction];
    for (const index of candidates) {
      if (index >= 0 && index < count) order.push(index);
    }
  }
  return order;
};

/** The frame set that looks sharp on a screen without wasting data. */
export const chooseSize = ({
  width,
  height,
  ratio,
  saveData,
}: Screen): Size => {
  if (saveData) return 'sm';
  if (height > width) return 'pt';
  const pixels = width * Math.min(ratio, 2);
  if (pixels >= 2200) return 'xl';
  if (pixels >= 1100) return 'lg';
  return 'md';
};

/** Fewer decoded frames for larger sets, so memory stays about the same. */
export const decodeRadius = (
  { width, height }: FrameSize,
  budget: DecodeBudget = PHONE_BUDGET
) =>
  Math.max(
    MIN_RADIUS,
    Math.min(
      budget.maxRadius,
      Math.floor(budget.bytes / (width * height * 4) / 2)
    )
  );

/** This device, as decodeBudget sees it; outside a browser, a phone. */
const readDevice = (): Device => {
  const fine = window.matchMedia?.(
    '(hover: hover) and (pointer: fine)'
  ).matches;
  return {
    cores: navigator.hardwareConcurrency || 4,
    memoryGb: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    touch: !fine,
  };
};

const pickSize = (): Size =>
  chooseSize({
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
    saveData:
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData ?? false,
  });

export class FilmPlayer {
  private readonly context: CanvasRenderingContext2D | null;
  private readonly size = pickSize();
  private readonly radius: number;
  private readonly parallel: number;
  /** Draws that had to hold an older frame because the right one was not decoded yet. */
  private held = 0;
  private readonly files: Array<Blob | undefined> = [];
  private readonly decoded = new Map<number, ImageBitmap>();
  private readonly decoding = new Set<number>();
  private readonly broken = new Set<number>();
  /** Where the scroll says the film should be, 0 to 1. */
  private progress = 0;
  /** Where the film is drawn, gliding toward `progress`. */
  private shown = 0;
  private lastTime = 0;
  private direction: Direction = 1;
  private drawn = '';
  private raf = 0;
  /** Frames still to fetch, coarsest first; null until the first load. */
  private queue: number[] | null = null;
  private fetchers = 0;
  private active = false;
  private generation = 0;
  private disposed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly film: Film
  ) {
    this.context = canvas.getContext('2d');
    const budget = decodeBudget(readDevice());
    this.radius = decodeRadius(film.sizes[this.size], budget);
    this.parallel = budget.parallel;
    this.resize();
  }

  /** The progress the canvas currently shows, 0 to 1. */
  get displayedProgress() {
    return this.shown;
  }

  /** 0 at the film's first frame, 1 at its last. */
  setProgress(progress: number) {
    const next = Math.min(1, Math.max(0, progress));
    if (next !== this.progress) this.direction = next > this.progress ? 1 : -1;
    this.progress = next;
    this.refill();
    this.schedule();
  }

  /**
   * The canvas carries as much detail as the frames do once they are
   * scaled to cover it, up to 2x: more would only cost drawing time, less
   * would blur them.
   */
  resize() {
    const frame = this.film.sizes[this.size];
    const { clientWidth, clientHeight } = this.canvas;
    const cover = Math.max(
      clientWidth / frame.width,
      clientHeight / frame.height
    );
    const ratio = Math.max(
      1,
      Math.min(window.devicePixelRatio || 1, 2, cover > 0 ? 1 / cover : 1)
    );

    this.canvas.width = Math.round(clientWidth * ratio);
    this.canvas.height = Math.round(clientHeight * ratio);
    this.drawn = '';
    this.schedule();
  }

  /**
   * Starts decoding near the playhead and fetching any frames not fetched
   * yet, carrying on from where a release stopped it.
   */
  load() {
    if (this.active || this.disposed) return;
    this.active = true;
    this.queue ??= loadOrder(this.film.count);
    while (this.fetchers < FETCH_PARALLEL && this.queue.length > 0) {
      this.fetchers += 1;
      void this.fetchFrames();
    }
    this.refill();
  }

  /**
   * Frees every decoded frame; the fetched files stay, so `load` only has
   * to decode again. Clears the canvas too, so the poster underneath shows
   * instead of a stale frame.
   */
  release() {
    this.active = false;
    this.generation += 1;
    for (const bitmap of this.decoded.values()) bitmap.close();
    this.decoded.clear();
    this.drawn = '';
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  dispose() {
    this.release();
    this.disposed = true;
    this.files.length = 0;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  /** The frame on screen: decoding centres here, ahead in the direction of travel. */
  private get playhead() {
    return Math.round(this.shown * (this.film.count - 1));
  }

  /**
   * One of up to FETCH_PARALLEL workers taking frames off the queue. It stops
   * when the film is released, so a film the visitor has scrolled past
   * never holds up the next one's downloads.
   */
  private async fetchFrames() {
    while (this.active && !this.disposed) {
      const index = this.queue?.shift();
      if (index === undefined) break;
      try {
        const response = await fetch(frameUrl(this.film, this.size, index));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.files[index] = await response.blob();
        this.refill();
      } catch {
        // A frame that fails to load is skipped; its neighbours stand in.
        this.broken.add(index);
      }
    }
    this.fetchers -= 1;
  }

  /** Frees frames that left the window and decodes missing ones inside it. */
  private refill() {
    if (!this.active || this.disposed) return;
    const center = this.playhead;
    for (const [index, bitmap] of this.decoded) {
      if (Math.abs(index - center) > this.radius) {
        bitmap.close();
        this.decoded.delete(index);
      }
    }
    const wanted = decodeOrder(
      center,
      this.film.count,
      this.radius,
      this.direction
    );
    for (const index of wanted) {
      if (this.decoding.size >= this.parallel) return;
      const file = this.files[index];
      const skip =
        !file ||
        this.decoded.has(index) ||
        this.decoding.has(index) ||
        this.broken.has(index);
      if (!skip) void this.decode(index, file);
    }
  }

  private async decode(index: number, file: Blob) {
    const generation = this.generation;
    this.decoding.add(index);
    try {
      const bitmap = await createImageBitmap(file);
      const stale =
        this.disposed ||
        generation !== this.generation ||
        Math.abs(index - this.playhead) > this.radius;
      if (stale) {
        bitmap.close();
      } else {
        this.decoded.set(index, bitmap);
        this.schedule();
      }
    } catch {
      // A frame that fails to decode is skipped; its neighbours stand in.
      this.broken.add(index);
    } finally {
      this.decoding.delete(index);
    }
    this.refill();
  }

  private schedule() {
    if (!this.raf && !this.disposed) {
      this.raf = requestAnimationFrame((time) => {
        this.raf = 0;
        this.glide(time);
        this.refill();
        this.draw();
        if (this.shown !== this.progress) this.schedule();
        else this.lastTime = 0;
      });
    }
  }

  /** Moves the shown position part of the way to the scroll position. */
  private glide(time: number) {
    const elapsed = this.lastTime ? Math.min(100, time - this.lastTime) : 16;
    this.lastTime = time;
    const gap = this.progress - this.shown;
    this.shown =
      Math.abs(gap) < SETTLED
        ? this.progress
        : this.shown + gap * (1 - Math.exp(-elapsed / GLIDE_MS));
  }

  /** The nearest decoded frame at or before `index`, else after it. */
  private nearest(index: number) {
    let before = -1;
    let after = -1;
    for (const decoded of this.decoded.keys()) {
      if (decoded <= index && decoded > before) before = decoded;
      if (decoded > index && (after < 0 || decoded < after)) after = decoded;
    }
    return before >= 0 ? before : after;
  }

  private draw() {
    const context = this.context;
    if (!context) return;
    const position = this.shown * (this.film.count - 1);
    const base = Math.floor(position);
    const from = this.nearest(base);
    if (from < 0) return;
    if (from !== base) {
      // Kept on the canvas so a probe can read how often a film stalls.
      this.held += 1;
      this.canvas.dataset.held = String(this.held);
    }
    const next = this.decoded.get(base + 1);
    const blend = from === base && next ? position - base : 0;
    const key = `${from}:${blend.toFixed(2)}:${this.canvas.width}`;
    if (key === this.drawn) return;
    this.drawn = key;

    context.globalAlpha = 1;
    this.cover(context, this.decoded.get(from)!);
    if (blend > 0.01 && next) {
      context.globalAlpha = blend;
      this.cover(context, next);
      context.globalAlpha = 1;
    }
  }

  /** Draws a frame to fill the canvas, cropping like object-fit: cover. */
  private cover(context: CanvasRenderingContext2D, image: ImageBitmap) {
    const { width, height } = this.canvas;
    const scale = Math.max(width / image.width, height / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
  }
}
