import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DECODE_RADIUS,
  decodeOrder,
  FilmPlayer,
  type Film,
} from '../components/experience/film';

const film = (count: number): Film => ({
  name: 'test-film',
  count,
  fps: 12,
  aspect: 1.78,
  sizes: { sm: 640, md: 1024 },
});

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

interface FakeBitmap {
  width: number;
  height: number;
  closed: boolean;
  close: () => void;
}

let frameQueue: FrameRequestCallback[] = [];
let bitmaps: FakeBitmap[] = [];
const flushFrames = () => {
  const queued = frameQueue;
  frameQueue = [];
  for (const callback of queued) callback(0);
};
/** Lets every pending fetch and decode finish. */
const settle = async () => {
  for (let i = 0; i < 20; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};
const openBitmaps = () => bitmaps.filter((bitmap) => !bitmap.closed).length;

beforeEach(() => {
  frameQueue = [];
  bitmaps = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameQueue.push(callback);
    return frameQueue.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, blob: async () => new Blob(['frame']) }))
  );
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => {
      const bitmap: FakeBitmap = {
        width: 1024,
        height: 576,
        closed: false,
        close: () => {
          bitmap.closed = true;
        },
      };
      bitmaps.push(bitmap);
      return bitmap;
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('decodeOrder', () => {
  it('starts at the playhead and works outwards, ahead first', () => {
    expect(decodeOrder(5, 20, 2, 1)).toEqual([5, 6, 4, 7, 3]);
    expect(decodeOrder(5, 20, 2, -1)).toEqual([5, 4, 6, 3, 7]);
  });

  it('stays inside the film', () => {
    expect(decodeOrder(0, 3, 2, 1)).toEqual([0, 1, 2]);
  });
});

describe('experience scroll film', () => {
  it('leaves no stale frame on the canvas after releasing its frames', async () => {
    const { canvas, screen } = fakeCanvas();
    const player = new FilmPlayer(canvas, film(3));

    player.load();
    await settle();
    flushFrames();
    expect(screen.painted).toBe(true);

    player.release();
    flushFrames();
    expect(screen.painted).toBe(false);
  });

  it('keeps only the frames near the playhead decoded', async () => {
    const { canvas } = fakeCanvas();
    const player = new FilmPlayer(canvas, film(200));

    player.load();
    await settle();
    expect(openBitmaps()).toBeLessThanOrEqual(DECODE_RADIUS * 2 + 1);

    player.setProgress(1);
    await settle();
    expect(openBitmaps()).toBeLessThanOrEqual(DECODE_RADIUS * 2 + 1);
    expect(bitmaps[0].closed).toBe(true);
  });

  it('stops fetching once released, so a film left behind never queues ahead of the next', async () => {
    const { canvas } = fakeCanvas();
    const player = new FilmPlayer(canvas, film(200));

    player.load();
    player.release();
    await settle();
    const fetched = vi.mocked(fetch).mock.calls.length;
    expect(fetched).toBeLessThan(200);

    player.load();
    await settle();
    expect(vi.mocked(fetch).mock.calls.length).toBe(200);
  });

  it('frees every decoded frame on release and decodes again without refetching', async () => {
    const { canvas } = fakeCanvas();
    const player = new FilmPlayer(canvas, film(10));

    player.load();
    await settle();
    const fetches = vi.mocked(fetch).mock.calls.length;
    expect(fetches).toBe(10);

    player.release();
    expect(openBitmaps()).toBe(0);

    player.load();
    await settle();
    expect(openBitmaps()).toBeGreaterThan(0);
    expect(vi.mocked(fetch).mock.calls.length).toBe(fetches);
  });
});
