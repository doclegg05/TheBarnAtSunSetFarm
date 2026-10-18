import React from 'react';
import type { SkyState } from './sky';

interface AtmosphereProps {
  /** Read every frame; the page writes the current sky into it on scroll. */
  skyRef: React.RefObject<SkyState>;
  reducedMotion: boolean;
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface Drifter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
}

const STAR_COUNT = 160;
const FIREFLY_COUNT = 38;
const PETAL_COUNT = 16;

const random = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * One canvas behind the whole page: drifting blush petals by day, stars and
 * fireflies after dark. Their strength comes from the scroll-driven sky.
 */
const Atmosphere: React.FC<AtmosphereProps> = ({ skyRef, reducedMotion }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastSky = '';

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.pow(Math.random(), 1.6) * 0.85,
      r: random(0.4, 1.5),
      phase: random(0, Math.PI * 2),
      speed: random(0.6, 2),
    }));
    const fireflies: Drifter[] = Array.from({ length: FIREFLY_COUNT }, () => ({
      x: Math.random(),
      y: random(0.45, 1),
      vx: random(-0.00025, 0.00025),
      vy: random(-0.0002, 0.0002),
      phase: random(0, Math.PI * 2),
      size: random(1.2, 2.6),
    }));
    const petals: Drifter[] = Array.from({ length: PETAL_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: random(0.00015, 0.0005),
      vy: random(0.0003, 0.0007),
      phase: random(0, Math.PI * 2),
      size: random(4, 8),
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      lastSky = '';
    };

    const draw = (time: number) => {
      const sky = skyRef.current;
      if (!sky) return;
      const t = time / 1000;
      context.clearRect(0, 0, width, height);

      if (sky.stars > 0.01) {
        for (const star of stars) {
          const twinkle = reducedMotion
            ? 0.8
            : 0.55 + 0.45 * Math.sin(t * star.speed + star.phase);
          context.globalAlpha = sky.stars * twinkle;
          context.fillStyle = '#fdf8f5';
          context.beginPath();
          context.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
          context.fill();
        }
      }

      const petalStrength = (1 - sky.stars) * 0.7;
      if (petalStrength > 0.02) {
        context.fillStyle = '#e8b9c9';
        for (const petal of petals) {
          if (!reducedMotion) {
            petal.x += petal.vx + Math.sin(t + petal.phase) * 0.0003;
            petal.y += petal.vy;
            if (petal.y > 1.05) {
              petal.y = -0.05;
              petal.x = Math.random();
            }
            if (petal.x > 1.05) petal.x = -0.05;
          }
          context.save();
          context.globalAlpha = petalStrength * 0.55;
          context.translate(petal.x * width, petal.y * height);
          context.rotate(t * 0.6 + petal.phase);
          context.beginPath();
          context.ellipse(
            0,
            0,
            petal.size,
            petal.size * 0.55,
            0,
            0,
            Math.PI * 2
          );
          context.fill();
          context.restore();
        }
      }

      if (sky.fireflies > 0.01) {
        for (const fly of fireflies) {
          if (!reducedMotion) {
            fly.vx += random(-0.00002, 0.00002);
            fly.vy += random(-0.00002, 0.00002);
            fly.vx = Math.max(-0.0005, Math.min(0.0005, fly.vx));
            fly.vy = Math.max(-0.0004, Math.min(0.0004, fly.vy));
            fly.x += fly.vx;
            fly.y += fly.vy;
            if (fly.x < -0.02) fly.x = 1.02;
            if (fly.x > 1.02) fly.x = -0.02;
            if (fly.y < 0.35) fly.vy = Math.abs(fly.vy);
            if (fly.y > 1.02) fly.vy = -Math.abs(fly.vy);
          }
          const pulse = reducedMotion
            ? 0.7
            : Math.max(0, Math.sin(t * 1.4 + fly.phase));
          const x = fly.x * width;
          const y = fly.y * height;
          const radius = fly.size * 6;
          const halo = context.createRadialGradient(x, y, 0, x, y, radius);
          halo.addColorStop(0, 'rgb(255 236 150 / 0.9)');
          halo.addColorStop(0.25, 'rgb(240 210 90 / 0.35)');
          halo.addColorStop(1, 'rgb(240 210 90 / 0)');
          context.globalAlpha = sky.fireflies * pulse;
          context.fillStyle = halo;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      frame = window.requestAnimationFrame(loop);
      if (reducedMotion) {
        // Still frames only: redraw when the sky itself has changed.
        const sky = skyRef.current;
        const key = sky
          ? `${sky.stars.toFixed(3)}:${sky.fireflies.toFixed(3)}`
          : '';
        if (key === lastSky) return;
        lastSky = key;
      }
      draw(time);
    };

    resize();
    window.addEventListener('resize', resize);
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frame);
    };
  }, [skyRef, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-1 h-full w-full"
    />
  );
};

export default Atmosphere;
