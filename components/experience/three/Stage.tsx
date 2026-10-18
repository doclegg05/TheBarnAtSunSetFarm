import React from 'react';
import type { SkyState } from '../sky';
import type { World } from './World';
import type { PhotoLayer } from './PhotoLayer';

interface StageProps {
  skyRef: React.RefObject<SkyState>;
  /** Whole-page scroll progress, 0 to 1, written by the page on scroll. */
  progressRef: React.RefObject<number>;
  /** Told once whether the 3D world is running, so the page can hide its 2D sky. */
  onReady: (running: boolean) => void;
}

const supportsWebGL = () => {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
};

const isLiteDevice = () => {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return (
    window.matchMedia('(max-width: 767px)').matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    connection?.saveData === true
  );
};

/**
 * Hosts the WebGL layers: the 3D world behind the page and, on capable
 * desktops, the photo layer in front of it. three.js loads only after the
 * page is on screen, and nothing here runs without WebGL.
 */
const Stage: React.FC<StageProps> = ({ skyRef, progressRef, onReady }) => {
  const worldCanvas = React.useRef<HTMLCanvasElement>(null);
  const photoCanvas = React.useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const canvas = worldCanvas.current;
    if (!canvas || !supportsWebGL()) {
      onReady(false);
      return;
    }
    let cancelled = false;
    let world: World | null = null;
    let photos: PhotoLayer | null = null;
    let frame = 0;
    const pointer = { x: 0, y: 0 };
    const lite = isLiteDevice();
    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;

    const move = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
      photos?.setPointer(event.clientX, event.clientY);
    };
    const resize = () => {
      world?.resize();
      photos?.resize();
    };
    const loop = () => {
      frame = window.requestAnimationFrame(loop);
      if (!world) return;
      world.render({
        sky: skyRef.current,
        progress: progressRef.current ?? 0,
        pointer,
      });
      photos?.render();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(frame);
      setVisible(false);
      onReady(false);
    };

    Promise.all([import('./World'), lite ? null : import('./PhotoLayer')])
      .then(([worldModule, photoModule]) => {
        if (cancelled) return;
        world = new worldModule.World(canvas, { lite });
        const photoTarget = photoCanvas.current;
        if (photoModule && photoTarget && finePointer) {
          const elements = Array.from(
            document.querySelectorAll<HTMLElement>('[data-gl-photo]')
          );
          photos = new photoModule.PhotoLayer(photoTarget, elements);
        }
        canvas.addEventListener('webglcontextlost', lost);
        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('resize', resize);
        loop();
        setVisible(true);
        onReady(true);
      })
      .catch(() => {
        if (!cancelled) onReady(false);
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener('webglcontextlost', lost);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', resize);
      photos?.dispose();
      world?.dispose();
    };
  }, [skyRef, progressRef, onReady]);

  return (
    <>
      <canvas
        ref={worldCanvas}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-[1600ms] ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <canvas
        ref={photoCanvas}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 h-full w-full"
      />
    </>
  );
};

export default Stage;
