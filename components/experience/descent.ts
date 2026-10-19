import { DESCENT_FRAMES } from './descentFrames';

/**
 * Plays the opening drone descent by scroll: the video lives as still
 * frames in public/descent/, and scroll progress picks which one to draw.
 * Between two frames it blends them, so the motion stays smooth although
 * there are only ten frames a second.
 *
 * Frames load coarse to fine (every 16th, then every 8th, and so on), so
 * the whole descent works within a second and sharpens as the rest arrive.
 */

const MAX_PARALLEL = 6;

export const frameUrl = (size: 'sm' | 'md', index: number) =>
  `/descent/${size}/${String(index).padStart(3, '0')}.avif`;

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

export class DescentPlayer {
  private readonly context: CanvasRenderingContext2D | null;
  private readonly frames: Array<HTMLImageElement | undefined> = [];
  private readonly size: 'sm' | 'md';
  private progress = 0;
  private drawn = '';
  private raf = 0;
  private disposed = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d');
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData ?? false;
    this.size =
      saveData || Math.min(window.innerWidth, window.innerHeight * 1.78) < 760
        ? 'sm'
        : 'md';
    this.resize();
    void this.load();
  }

  /** 0 at the top of the sky, 1 settled at the barn doors. */
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

  dispose() {
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  private async load() {
    const queue = loadOrder(DESCENT_FRAMES.count);
    const next = async (): Promise<void> => {
      const index = queue.shift();
      if (index === undefined || this.disposed) return;
      const image = new Image();
      image.src = frameUrl(this.size, index);
      try {
        await image.decode();
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
    for (let i = index + 1; i < DESCENT_FRAMES.count; i++)
      if (this.frames[i]) return i;
    return -1;
  }

  private draw() {
    const context = this.context;
    if (!context) return;
    const position = this.progress * (DESCENT_FRAMES.count - 1);
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
