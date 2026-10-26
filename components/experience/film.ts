/**
 * Plays a film by scroll: the video lives as still frames in public/<name>/,
 * and scroll progress picks which one to draw. Between two frames it blends
 * them, so the motion stays smooth although there are only 10–12 frames a
 * second. Used for the opening drone descent and the walk into the barn.
 *
 * A film only loads once its section is near (`load`). It fetches every
 * frame's compressed file once, coarse to fine (every 16th, then every 8th,
 * and so on), and keeps those small files. Only the frames within
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
  readonly sizes: { readonly sm: number; readonly md: number };
}

type Size = 'sm' | 'md';
type Direction = 1 | -1;

const FETCH_PARALLEL = 6;
const DECODE_PARALLEL = 3;
/** Decoded frames kept either side of the playhead. */
export const DECODE_RADIUS = 12;

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

/** Small frames on phones and on data saver; larger ones elsewhere. */
const pickSize = (): Size => {
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData ?? false;
  return saveData ||
    Math.min(window.innerWidth, window.innerHeight * 1.78) < 760
    ? 'sm'
    : 'md';
};

export class FilmPlayer {
  private readonly context: CanvasRenderingContext2D | null;
  private readonly size = pickSize();
  private readonly files: Array<Blob | undefined> = [];
  private readonly decoded = new Map<number, ImageBitmap>();
  private readonly decoding = new Set<number>();
  private readonly broken = new Set<number>();
  private progress = 0;
  private direction: Direction = 1;
  private drawn = '';
  private raf = 0;
  private fetching = false;
  private active = false;
  private generation = 0;
  private disposed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly film: Film
  ) {
    this.context = canvas.getContext('2d');
    this.resize();
  }

  /** 0 at the film's first frame, 1 at its last. */
  setProgress(progress: number) {
    const next = Math.min(1, Math.max(0, progress));
    if (next !== this.progress) this.direction = next > this.progress ? 1 : -1;
    this.progress = next;
    this.refill();
    this.schedule();
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth, clientHeight } = this.canvas;
    this.canvas.width = Math.round(clientWidth * ratio);
    this.canvas.height = Math.round(clientHeight * ratio);
    this.drawn = '';
    this.schedule();
  }

  /** Starts decoding near the playhead, fetching the frames the first time. */
  load() {
    if (this.active || this.disposed) return;
    this.active = true;
    if (!this.fetching) {
      this.fetching = true;
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

  private get playhead() {
    return Math.round(this.progress * (this.film.count - 1));
  }

  private async fetchFrames() {
    const queue = loadOrder(this.film.count);
    const next = async (): Promise<void> => {
      const index = queue.shift();
      if (index === undefined || this.disposed) return;
      try {
        const response = await fetch(frameUrl(this.film, this.size, index));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.files[index] = await response.blob();
        this.refill();
      } catch {
        // A frame that fails to load is skipped; its neighbours stand in.
        this.broken.add(index);
      }
      return next();
    };
    await Promise.all(Array.from({ length: FETCH_PARALLEL }, next));
  }

  /** Frees frames that left the window and decodes missing ones inside it. */
  private refill() {
    if (!this.active || this.disposed) return;
    const center = this.playhead;
    for (const [index, bitmap] of this.decoded) {
      if (Math.abs(index - center) > DECODE_RADIUS) {
        bitmap.close();
        this.decoded.delete(index);
      }
    }
    const wanted = decodeOrder(
      center,
      this.film.count,
      DECODE_RADIUS,
      this.direction
    );
    for (const index of wanted) {
      if (this.decoding.size >= DECODE_PARALLEL) return;
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
        Math.abs(index - this.playhead) > DECODE_RADIUS;
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
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.draw();
      });
    }
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
    const position = this.progress * (this.film.count - 1);
    const base = Math.floor(position);
    const from = this.nearest(base);
    if (from < 0) return;
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
