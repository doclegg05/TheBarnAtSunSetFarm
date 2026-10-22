import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilmPlayer, type Film } from '../components/experience/film';

const film: Film = {
  name: 'test-film',
  count: 3,
  fps: 12,
  aspect: 1.78,
  sizes: { sm: 640, md: 1024 },
};

/**
 * jsdom has no 2D canvas, so this stands in for one: it remembers whether a
 * frame is on the canvas. Drawing paints it; only a clear that covers the
 * whole canvas wipes it, as on a real canvas.
 */
const fakeCanvas = () => {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'clientWidth', { value: 640 });
  Object.defineProperty(canvas, 'clientHeight', { value: 360 });
  const screen = { painted: false };
  const context = {
    globalAlpha: 1,
    drawImage: () => {
      screen.painted = true;
    },
    clearRect: (x: number, y: number, width: number, height: number) => {
      const whole =
        x <= 0 &&
        y <= 0 &&
        x + width >= canvas.width &&
        y + height >= canvas.height;
      if (whole) screen.painted = false;
    },
  };
  // A test double for the browser's 2D context, which jsdom lacks.
  vi.spyOn(canvas, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );
  return { canvas, screen };
};

let frameQueue: FrameRequestCallback[] = [];
const flushFrames = () => {
  const queued = frameQueue;
  frameQueue = [];
  for (const callback of queued) callback(0);
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  frameQueue = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameQueue.push(callback);
    return frameQueue.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  // jsdom never decodes images; every frame "loads" at once.
  Object.defineProperty(HTMLImageElement.prototype, 'decode', {
    configurable: true,
    value: () => Promise.resolve(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (HTMLImageElement.prototype as { decode?: unknown }).decode;
});

describe('experience scroll film', () => {
  it('leaves no stale frame on the canvas after releasing its frames', async () => {
    const { canvas, screen } = fakeCanvas();
    const player = new FilmPlayer(canvas, film);

    player.load();
    await settle();
    flushFrames();
    expect(screen.painted).toBe(true);

    player.release();
    flushFrames();
    expect(screen.painted).toBe(false);
  });
});
