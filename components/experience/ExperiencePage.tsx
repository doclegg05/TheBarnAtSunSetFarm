import React from 'react';
import Atmosphere from './Atmosphere';
import Stage from './three/Stage';
import { initMotion } from './motion';
import { rgb, SKIES, skyAt, type SkyName, type SkyState } from './sky';
import {
  Amenities,
  Barn,
  Finale,
  Hero,
  Inquire,
  Packages,
  Planning,
  Questions,
  Region,
  Statement,
  Stay,
  TheDay,
} from './sections';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia?.(REDUCED_MOTION);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
};
const prefersReducedMotion = () =>
  window.matchMedia?.(REDUCED_MOTION).matches ?? false;

const navLinks = [
  { id: 'the-day', label: 'The day' },
  { id: 'barn', label: 'The barn' },
  { id: 'stay', label: 'Stay' },
  { id: 'packages', label: 'Packages' },
  { id: 'faq', label: 'FAQ' },
] as const;

const goTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const Nav: React.FC<{ navRef: React.RefObject<HTMLElement | null> }> = ({
  navRef,
}) => {
  const [open, setOpen] = React.useState(false);
  const pick = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setOpen(false);
    goTo(id);
  };

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-500 ease-out sm:px-6"
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2 pl-5 pr-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)] backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--sky-mid) 72%, transparent)',
        }}
      >
        <a
          href="#home"
          onClick={pick('home')}
          className="font-serif text-lg leading-none sm:text-2xl"
        >
          The Barn at Sunset Farm
        </a>
        <nav
          aria-label="Sections"
          className="hidden items-center gap-7 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={pick(link.id)}
              className="text-xs font-semibold uppercase tracking-[0.25em] opacity-75 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            onClick={pick('contact')}
            className="xp-magnetic rounded-full bg-brand-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-charcoal"
          >
            Inquire
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="xp-menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-current/25 lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span
                className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${
                  open ? 'translate-y-1.5 rotate-45' : ''
                }`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ${
                  open ? '-translate-y-1.5 -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </div>
      <nav
        id="xp-menu"
        aria-label="Sections"
        hidden={!open}
        className="mx-auto mt-2 max-w-7xl rounded-3xl p-6 shadow-xl backdrop-blur-md lg:hidden"
        style={{
          background: 'color-mix(in srgb, var(--sky-mid) 90%, transparent)',
        }}
      >
        {navLinks.map((link, index) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={pick(link.id)}
            className="block border-b border-current/10 py-3 font-serif text-3xl last:border-0"
            style={{
              animation: open
                ? `xp-menu-in 0.5s ${index * 0.05}s both cubic-bezier(0.16,1,0.3,1)`
                : undefined,
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
};

/** A soft ring that trails the pointer and swells over anything clickable. */
const Cursor: React.FC = () => {
  const ringRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    if (!fine?.matches || prefersReducedMotion()) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let currentX = x;
    let currentY = y;
    let scale = 1;
    let targetScale = 1;
    let frame = 0;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target as Element | null;
      targetScale = target?.closest('a, button') ? 2.4 : 1;
      ring.style.opacity = '1';
    };
    const leave = () => {
      ring.style.opacity = '0';
    };
    const loop = () => {
      currentX += (x - currentX) * 0.18;
      currentY += (y - currentY) * 0.18;
      scale += (targetScale - scale) * 0.15;
      ring.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
      frame = window.requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-60 h-8 w-8 rounded-full border border-brand-gold opacity-0 mix-blend-difference transition-opacity duration-300"
    />
  );
};

const applySky = (
  root: HTMLElement,
  sun: HTMLElement | null,
  sky: SkyState
) => {
  root.style.setProperty('--sky-top', rgb(sky.top));
  root.style.setProperty('--sky-mid', rgb(sky.middle));
  root.style.setProperty('--sky-bot', rgb(sky.bottom));
  root.style.setProperty('--ink', rgb(sky.ink));
  if (sun) {
    const x = sky.sunX * window.innerWidth;
    const y = (0.86 - sky.sun * 0.66) * window.innerHeight;
    sun.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    sun.style.opacity = String(
      Math.min(1, Math.max(0, (sky.sun + 0.12) / 0.3))
    );
    sun.style.setProperty('--glow', String(sky.glow));
  }
};

/**
 * The whole venue story on one page, set over a sky that moves from dawn to
 * night as you scroll. Lives at /experience as a preview beside the classic
 * home page.
 */
const ExperiencePage: React.FC = () => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sunRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef(0);
  const skyRef = React.useRef<SkyState>(SKIES.dawn);
  const [has3D, setHas3D] = React.useState(false);
  const handleStageReady = React.useCallback(
    (running: boolean) => setHas3D(running),
    []
  );
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false
  );

  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'The Barn at Sunset Farm · A day at the barn';
    // A design preview: keep it out of search results until it replaces the
    // home page, so it never competes with the live site.
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  // The sky, sun, progress line and hide-on-scroll nav all follow scroll.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    let lastY = window.scrollY;

    const update = () => {
      frame = 0;
      const sections = Array.from(
        root.querySelectorAll<HTMLElement>('[data-sky]'),
        (section: HTMLElement) => ({
          sky: section.dataset.sky as SkyName,
          top: section.getBoundingClientRect().top,
        })
      );
      const sky = skyAt(sections, window.innerHeight);
      skyRef.current = sky;
      applySky(root, sunRef.current, sky);

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressRef.current = progress;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }

      const y = window.scrollY;
      if (navRef.current) {
        const hide = y > lastY && y > 240;
        navRef.current.style.transform = hide
          ? 'translateY(-130%)'
          : 'translateY(0)';
      }
      lastY = y;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    // matchMedia is missing only outside real browsers (e.g. test runs).
    if (!root || reducedMotion || !window.matchMedia) return;
    return initMotion(root);
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`xp-root relative min-h-screen overflow-x-clip font-sans antialiased ${
        reducedMotion ? 'xp-reduced' : ''
      }`}
      style={
        {
          color: 'var(--ink)',
          '--sky-top': rgb(SKIES.dawn.top),
          '--sky-mid': rgb(SKIES.dawn.middle),
          '--sky-bot': rgb(SKIES.dawn.bottom),
          '--ink': rgb(SKIES.dawn.ink),
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes xp-menu-in { from { opacity: 0; transform: translateY(12px); } }
        .xp-root ::selection { background: #d4af37; color: #fff; }
      `}</style>

      <a
        href="#contact"
        className="sr-only z-70 rounded-full bg-brand-charcoal px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to the inquiry form
      </a>

      <div
        aria-hidden="true"
        className="fixed inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--sky-top), var(--sky-mid) 55%, var(--sky-bot))',
        }}
      >
        <div
          ref={sunRef}
          className={`absolute left-0 top-0 h-[38vmin] w-[38vmin] rounded-full will-change-transform ${
            has3D ? 'hidden' : ''
          }`}
          style={
            {
              '--glow': 0.5,
              background:
                'radial-gradient(circle, rgb(255 250 235) 0 18%, color-mix(in srgb, rgb(255 214 140) calc(100% - var(--glow) * 100%), rgb(244 140 90)) 30%, transparent 68%)',
            } as React.CSSProperties
          }
        />
      </div>

      {!reducedMotion && (
        <Stage
          skyRef={skyRef}
          progressRef={progressRef}
          onReady={handleStageReady}
        />
      )}
      {has3D && (
        // Softens the landscape at the bottom of the screen so copy that
        // passes over it stays readable.
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-1"
          style={{
            background:
              'linear-gradient(to top, color-mix(in srgb, var(--sky-bot) 45%, transparent), transparent 42%)',
          }}
        />
      )}
      <Atmosphere
        skyRef={skyRef}
        reducedMotion={reducedMotion}
        petalsOnly={has3D}
      />

      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-60 h-0.5 origin-left scale-x-0 bg-brand-gold"
      />
      <Nav navRef={navRef} />

      <main className="relative z-10">
        <Hero />
        <Statement />
        <TheDay />
        <Barn />
        <Amenities />
        <Stay />
        <Packages />
        <Planning />
        <Region />
        <Questions />
        <Inquire />
      </main>
      <div className="relative z-10">
        <Finale />
      </div>

      <Cursor />
    </div>
  );
};

export default ExperiencePage;
