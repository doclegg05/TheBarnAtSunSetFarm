import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  chooseSize,
  decodeBudget,
  DECODE_RADIUS,
  decodeOrder,
  decodeRadius,
  FilmPlayer,
  type Film,
} from '../components/experience/film';

const film = (count: number): Film => ({
  name: 'test-film',
  count,
  fps: 12,
  aspect: 1.78,
  sizes: {
    sm: { width: 640, height: 360 },
    md: { width: 1024, height: 576 },
    lg: { width: 1920, height: 1080 },
    xl: { width: 2560, height: 1440 },
    pt: { width: 1080, height: 1920 },
  },
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
const flushFrames = (time = 0) => {
  const queued = frameQueue;
  frameQueue = [];
  for (const callback of queued) callback(time);
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

describe('chooseSize', () => {
  it('gives a phone held upright the upright 1080 by 1920 slice', () => {
    expect(chooseSize({ width: 390, height: 844, ratio: 3 })).toBe('pt');
  });

  it('matches landscape screens by their real pixel width', () => {
    expect(chooseSize({ width: 1280, height: 720, ratio: 1 })).toBe('lg');
    expect(chooseSize({ width: 1440, height: 900, ratio: 2 })).toBe('xl');
    expect(chooseSize({ width: 900, height: 600, ratio: 1 })).toBe('md');
  });

  it('keeps to the smallest frames on data saver', () => {
    expect(
      chooseSize({ width: 390, height: 844, ratio: 3, saveData: true })
    ).toBe('sm');
  });
});

describe('decodeBudget', () => {
  it('keeps phones and touch screens to a small, steady budget', () => {
    expect(decodeBudget({ cores: 6, touch: true })).toEqual({
      parallel: 3,
      bytes: 96 * 1024 * 1024,
      maxRadius: DECODE_RADIUS,
    });
  });

  it('lets a computer decode on more cores and keep more frames ready', () => {
    const budget = decodeBudget({ cores: 16, memoryGb: 8, touch: false });
    expect(budget.parallel).toBe(8);
    expect(
      decodeRadius({ width: 1920, height: 1080 }, budget)
    ).toBeGreaterThanOrEqual(15);
    expect(decodeBudget({ cores: 4, touch: false }).parallel).toBe(3);
  });

  it('stays smaller on a computer that reports little memory', () => {
    const small = decodeBudget({ cores: 8, memoryGb: 4, touch: false });
    const large = decodeBudget({ cores: 8, memoryGb: 8, touch: false });
    expect(small.bytes).toBeLessThan(large.bytes);
  });
});

describe('decodeRadius', () => {
  it('keeps fewer large frames decoded, so memory stays about the same', () => {
    expect(decodeRadius({ width: 1024, height: 576 })).toBe(DECODE_RADIUS);
    expect(decodeRadius({ width: 1080, height: 1920 })).toBeLessThan(8);
    expect(decodeRadius({ width: 2560, height: 1440 })).toBeGreaterThanOrEqual(
      4
    );
  });
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

    // The shown frame glides to the end over a few frames of animation.
    player.setProgress(1);
    for (let time = 16; time < 2000; time += 16) {
      flushFrames(time);
      await settle();
    }
    expect(openBitmaps()).toBeLessThanOrEqual(DECODE_RADIUS * 2 + 1);
    expect(bitmaps[0].closed).toBe(true);
  });

  it('draws the canvas at the detail the frames carry, never past 2x', () => {
    vi.stubGlobal('devicePixelRatio', 2);
    const { canvas } = fakeCanvas();
    // A 2x screen in jsdom's 1024 x 768 window picks the 1920-wide frames:
    // three frame pixels per point on this 640 x 360 canvas, capped at 2x.
    new FilmPlayer(canvas, film(3));
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);
  });

  it('glides toward a new scroll position instead of jumping to it', async () => {
    const { canvas } = fakeCanvas();
    const player = new FilmPlayer(canvas, film(10));
    player.load();
    await settle();

    player.setProgress(1);
    flushFrames(16);
    expect(player.displayedProgress).toBeGreaterThan(0);
    expect(player.displayedProgress).toBeLessThan(0.5);

    for (let time = 32; time < 2000; time += 16) flushFrames(time);
    expect(player.displayedProgress).toBe(1);
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
