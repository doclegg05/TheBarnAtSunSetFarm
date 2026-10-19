/**
 * Plays a film by scroll: the video lives as still frames in public/<name>/,
 * and scroll progress picks which one to draw. Between two frames it blends
 * them, so the motion stays smooth although there are only 10–12 frames a
 * second. Used for the opening drone descent and the walk into the barn.
 *
 * Frames load coarse to fine (every 16th, then every 8th, and so on), so a
 * whole film works within a second and sharpens as the rest arrive. A film
 * only loads once its section is near (`load`), and hands its decoded frames
 * back to the browser when the visitor has scrolled well away (`release`),
 * so two films never sit in memory for nothing.
 */

export interface Film {
  readonly name: string;
  readonly count: number;
  readonly fps: number;
  readonly aspect: number;
  readonly sizes: { readonly sm: number; readonly md: number };
}

type Size = 'sm' | 'md';

const MAX_PARALLEL = 6;

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
  private frames: Array<HTMLImageElement | undefined> = [];
  private readonly size = pickSize();
  private progress = 0;
  private drawn = '';
  private raf = 0;
  private loading = false;
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
    this.progress = Math.min(1, Math.max(0, progress));
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

  /** Starts fetching frames; does nothing if they are loaded or loading. */
  load() {
    if (this.loading || this.disposed) return;
    this.loading = true;
    void this.fetchFrames(this.generation);
  }

  /** Drops every frame; `load` fetches them again (from the HTTP cache). */
  release() {
    this.generation++;
    this.loading = false;
    this.frames = [];
    this.drawn = '';
  }

  dispose() {
    this.disposed = true;
    this.release();
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  private async fetchFrames(generation: number) {
    const queue = loadOrder(this.film.count);
    const stale = () => this.disposed || generation !== this.generation;
    const next = async (): Promise<void> => {
      const index = queue.shift();
      if (index === undefined || stale()) return;
      const image = new Image();
      image.src = frameUrl(this.film, this.size, index);
      try {
        await image.decode();
        if (stale()) return;
        this.frames[index] = image;
        this.schedule();
      } catch {
        // A frame that fails to load is skipped; its neighbours stand in.
      }
      return next();
    };
    await Promise.all(Array.from({ length: MAX_PARALLEL }, next));
  }

  private schedule() {
    if (!this.raf && !this.disposed) {
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.draw();
      });
    }
  }

  /** The nearest loaded frame at or before `index`, else after it. */
  private nearest(index: number) {
    for (let i = index; i >= 0; i--) if (this.frames[i]) return i;
    for (let i = index + 1; i < this.film.count; i++)
      if (this.frames[i]) return i;
    return -1;
  }

  private draw() {
    const context = this.context;
    if (!context) return;
    const position = this.progress * (this.film.count - 1);
    const base = Math.floor(position);
    const from = this.nearest(base);
    if (from < 0) return;
    const to = from === base ? base + 1 : -1;
    const blend = to >= 0 && this.frames[to] ? position - base : 0;
    const key = `${from}:${blend.toFixed(2)}:${this.canvas.width}`;
    if (key === this.drawn) return;
    this.drawn = key;

    context.globalAlpha = 1;
    this.cover(context, this.frames[from]!);
    if (blend > 0.01) {
      context.globalAlpha = blend;
      this.cover(context, this.frames[to]!);
      context.globalAlpha = 1;
    }
  }

  /** Draws a frame to fill the canvas, cropping like object-fit: cover. */
  private cover(context: CanvasRenderingContext2D, image: HTMLImageElement) {
    const { width, height } = this.canvas;
    const scale = Math.max(
      width / image.naturalWidth,
      height / image.naturalHeight
    );
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
  }
}
