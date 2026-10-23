import React from 'react';
import { useLocation } from 'react-router-dom';
import LogoMark from '../LogoMark';
import { TransitionLink } from '../PageTransition';
import Atmosphere from './Atmosphere';
import { useBrandHead } from './brandHead';
import { initMotion } from './motion';
import { scrollToSection } from './scroll';
import { Soundscape, type Cue } from './soundscape';
import {
  mixSky,
  rgb,
  SKIES,
  skyAt,
  skyGradient,
  skyLayers,
  type SkyLayers,
  type SkyName,
  type SkyState,
} from './sky';
import { Packages, Planning, Questions, TheDay } from './daySections';
import { Barn, Inquire, Inside } from './sections';
import { Amenities, Region, Stay } from './staySections';
import {
  EXPERIENCE_TITLES,
  NAV_TARGETS,
  navHref,
  type ExperienceView,
} from './views';
import { Descent } from './descent';
import { ChapterRail, Next, PageIntro, SiteFooter } from './wayfinding';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const SOUND_KEY = 'xp-sound';

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia?.(REDUCED_MOTION);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
};
const prefersReducedMotion = () =>
  window.matchMedia?.(REDUCED_MOTION).matches ?? false;

const goTo = scrollToSection;

const DayIntro: React.FC = () => (
  <PageIntro
    eyebrow="Your wedding day"
    title="From first look to last dance"
    lead="How the day unfolds at the barn, the two ways to celebrate, the help we offer and the questions couples ask most."
    sky="morning"
  />
);

const StayIntro: React.FC = () => (
  <PageIntro
    eyebrow="Stay & explore"
    title="Sleep where you celebrate"
    lead="Rooms for the wedding party in the barn, a cottage on the hill, and the gorge, lakes and trails around Nebo."
    sky="golden"
  />
);

/**
 * The sections of each page, top to bottom. The story is kept short: the
 * drone film, the barn, the walk inside, then cards to the other pages.
 */
const VIEW_SECTIONS: Readonly<Record<ExperienceView, readonly React.FC[]>> = {
  story: [Descent, Barn, Inside, Next, Inquire],
  day: [DayIntro, TheDay, Packages, Planning, Questions, Inquire],
  stay: [StayIntro, Amenities, Stay, Region, Inquire],
};

interface NavLinkProps {
  href: string;
  className: string;
  style?: React.CSSProperties;
  onPick: (id: string) => (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

/** An in-page jump when the section is on this page, else a page link. */
const NavLink: React.FC<NavLinkProps> = ({
  href,
  className,
  style,
  onPick,
  children,
}) =>
  href.startsWith('#') ? (
    <a
      href={href}
      onClick={onPick(href.slice(1))}
      className={className}
      style={style}
    >
      {children}
    </a>
  ) : (
    <TransitionLink to={href} className={className} style={style}>
      {children}
    </TransitionLink>
  );

/** Four bars that dance while the soundscape plays. */
const SoundToggle: React.FC<{ on: boolean; onToggle: () => void }> = ({
  on,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={on}
    title={on ? 'Turn sound off' : 'Turn sound on'}
    className="grid h-10 w-10 place-items-center rounded-full border border-current/25 transition-colors hover:bg-current/10"
  >
    <span className="sr-only">Sound</span>
    <span aria-hidden="true" className="flex h-3.5 items-end gap-[3px]">
      {[0, 1, 2, 3].map((bar) => (
        <span
          key={bar}
          className="block w-[2px] origin-bottom rounded-full bg-current"
          style={{
            height: '100%',
            transform: on ? undefined : 'scaleY(0.25)',
            animation: on
              ? `xp-eq 0.9s ${bar * 0.15}s ease-in-out infinite alternate`
              : undefined,
          }}
        />
      ))}
    </span>
  </button>
);

const BRAND_CLASS =
  'flex min-w-0 items-center gap-2 font-serif leading-none sm:gap-2.5';

/**
 * The Sunset Barn mark and the venue's name, for the nav: on one line on
 * wide screens, and stacked like the logo lockup on narrow ones.
 */
const Brand: React.FC = () => (
  <>
    <LogoMark simple decorative className="h-7 w-auto shrink-0" />
    <span className="flex flex-col gap-0.5 whitespace-nowrap sm:hidden">
      <span className="text-[0.8rem] italic">The Barn at</span>
      <span className="text-lg">Sunset Farm</span>
    </span>
    <span className="hidden whitespace-nowrap text-2xl sm:inline">
      The Barn at Sunset Farm
    </span>
  </>
);

const Nav: React.FC<{
  view: ExperienceView;
  navRef: React.RefObject<HTMLElement | null>;
  soundOn: boolean;
  onToggleSound: () => void;
}> = ({ view, navRef, soundOn, onToggleSound }) => {
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
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2 pl-5 pr-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)]"
        style={{
          background: 'color-mix(in srgb, var(--sky-mid) 92%, transparent)',
        }}
      >
        {view === 'story' ? (
          <a href="#arrive" onClick={pick('arrive')} className={BRAND_CLASS}>
            <Brand />
          </a>
        ) : (
          <TransitionLink to="/experience" className={BRAND_CLASS}>
            <Brand />
          </TransitionLink>
        )}
        <nav
          aria-label="Sections"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_TARGETS.map((target) => (
            <NavLink
              key={target.label}
              href={navHref(target, view)}
              onPick={pick}
              className="text-xs font-semibold uppercase tracking-[0.25em] opacity-75 transition-opacity hover:opacity-100"
            >
              {target.label}
            </NavLink>
          ))}
          <TransitionLink
            to="/gallery"
            className="text-xs font-semibold uppercase tracking-[0.25em] opacity-75 transition-opacity hover:opacity-100"
          >
            Gallery
          </TransitionLink>
        </nav>
        <div className="flex items-center gap-2">
          <SoundToggle on={soundOn} onToggle={onToggleSound} />
          <a
            href="#contact"
            onClick={pick('contact')}
            className="xp-magnetic rounded-full bg-brand-deep-sage px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cream transition-colors hover:bg-brand-barn-black"
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
        className="mx-auto mt-2 max-w-7xl rounded-3xl p-6 shadow-xl lg:hidden"
        style={{
          background: 'color-mix(in srgb, var(--sky-mid) 90%, transparent)',
        }}
      >
        {NAV_TARGETS.map((target, index) => (
          <NavLink
            key={target.label}
            href={navHref(target, view)}
            onPick={pick}
            className="block border-b border-current/10 py-3 font-serif text-3xl"
            style={{
              animation: open
                ? `xp-menu-in 0.5s ${index * 0.05}s both cubic-bezier(0.16,1,0.3,1)`
                : undefined,
            }}
          >
            {target.label}
          </NavLink>
        ))}
        <TransitionLink
          to="/gallery"
          className="block py-3 font-serif text-3xl"
        >
          Gallery
        </TransitionLink>
      </nav>
    </header>
  );
};

/** A soft ring that trails the pointer and swells over anything clickable. */
const Cursor: React.FC = () => {
  const ringRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;
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
      const hint =
        target?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor;
      label.textContent = hint ?? '';
      ring.dataset.label = hint ? 'on' : '';
      targetScale = hint ? 2.8 : target?.closest('a, button') ? 2.4 : 1;
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
      className="xp-cursor pointer-events-none fixed left-0 top-0 z-60 grid h-8 w-8 place-items-center rounded-full border border-brand-gold opacity-0 mix-blend-difference transition-[opacity,background-color] duration-300"
    >
      <span
        ref={labelRef}
        className="text-[4px] font-semibold uppercase tracking-[0.2em] text-white"
      />
    </div>
  );
};

/**
 * The colour variables (text, nav, fades) change in this many steps per
 * hand-over between skies. Every change restyles the whole page, so they
 * move in steps while the background itself fades smoothly.
 */
const SKY_STEPS = 12;

interface PaintedSky {
  base: SkyName | null;
  next: SkyName | null;
  colours: string;
}

const setSkyColours = (root: HTMLElement, sky: SkyState) => {
  root.style.setProperty('--sky-top', rgb(sky.top));
  root.style.setProperty('--sky-mid', rgb(sky.middle));
  root.style.setProperty('--sky-bot', rgb(sky.bottom));
  root.style.setProperty('--ink', rgb(sky.ink));
};

/**
 * Draws the sky as two fixed layers: a gradient is repainted only when a
 * layer changes time of day; while scrolling, only the top layer's opacity
 * changes, which the browser composites without repainting. Returns what is
 * now painted, for the next call to compare against.
 */
const paintSky = (
  root: HTMLElement,
  layers: { base: HTMLElement; next: HTMLElement },
  sky: SkyLayers,
  painted: PaintedSky
): PaintedSky => {
  if (painted.base !== sky.base) {
    layers.base.style.background = skyGradient(SKIES[sky.base]);
  }
  if (sky.next && painted.next !== sky.next) {
    layers.next.style.background = skyGradient(SKIES[sky.next]);
  }
  layers.next.style.opacity = sky.next ? String(sky.fade) : '0';
  const step = Math.round(sky.fade * SKY_STEPS) / SKY_STEPS;
  const colours = `${sky.base}:${sky.next}:${step}`;
  if (colours !== painted.colours) {
    setSkyColours(
      root,
      sky.next
        ? mixSky(SKIES[sky.base], SKIES[sky.next], step)
        : SKIES[sky.base]
    );
  }
  return { base: sky.base, next: sky.next ?? painted.next, colours };
};

interface ExperiencePageProps {
  view?: ExperienceView;
}

/**
 * One page of the venue story, set over a sky that moves from dawn to night
 * as you scroll. Lives at /experience (and /experience/the-day,
 * /experience/stay) as a preview beside the classic home page.
 */
const ExperiencePage: React.FC<ExperiencePageProps> = ({ view = 'story' }) => {
  const sections = VIEW_SECTIONS[view];
  const { hash } = useLocation();
  useBrandHead();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const skyBaseRef = React.useRef<HTMLDivElement>(null);
  const skyNextRef = React.useRef<HTMLDivElement>(null);
  const skyRef = React.useRef<SkyState>(SKIES.dawn);
  const soundRef = React.useRef<Soundscape | null>(null);
  const [soundOn, setSoundOn] = React.useState(false);

  const setSound = React.useCallback(async (on: boolean) => {
    try {
      localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
    if (!on) {
      soundRef.current?.stop();
      setSoundOn(false);
      return;
    }
    soundRef.current ??= new Soundscape();
    setSoundOn(true);
    try {
      await soundRef.current.start();
      soundRef.current.update(skyRef.current);
    } catch {
      setSoundOn(false);
    }
  }, []);

  // Browsers only start audio from a click or key press, so a visitor who
  // left sound on last time gets it back at their first interaction.
  React.useEffect(() => {
    let remembered = false;
    try {
      remembered = localStorage.getItem(SOUND_KEY) === 'on';
    } catch {
      return;
    }
    if (!remembered) return;
    const resume = (event: Event) => {
      if ((event.target as Element | null)?.closest('[aria-pressed]')) return;
      void setSound(true);
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [setSound]);

  // One-time sound cues as their sections come into view.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cue = (entry.target as HTMLElement).dataset.cue as Cue;
          soundRef.current?.cue(cue);
        }
      },
      // Fires as a section's top passes 60% of the way up the screen,
      // however tall the section is.
      { rootMargin: '0px 0px -40% 0px' }
    );
    root
      .querySelectorAll('[data-cue]')
      .forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      soundRef.current?.dispose();
      soundRef.current = null;
    };
  }, []);
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false
  );

  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = `The Barn at Sunset Farm · ${EXPERIENCE_TITLES[view]}`;
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
  }, [view]);

  // Arriving from another page with a #section. With motion on, initMotion
  // lands there once the pins have measured themselves; without it, the
  // page is static and a plain jump is enough.
  const [landOn] = React.useState(() => hash.slice(1));
  React.useEffect(() => {
    if (!landOn || !reducedMotion) return;
    goTo(landOn, { immediate: true });
  }, [landOn, reducedMotion]);

  // The sky, progress line and hide-on-scroll nav all follow scroll.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    let lastY = window.scrollY;
    let painted: PaintedSky = { base: null, next: null, colours: '' };
    // A page's sections never change, so they are looked up once.
    const skySections = Array.from(
      root.querySelectorAll<HTMLElement>('[data-sky]'),
      (section: HTMLElement) => section
    );

    const update = () => {
      frame = 0;
      const sections = skySections.map((section) => ({
        sky: section.dataset.sky as SkyName,
        top: section.getBoundingClientRect().top,
      }));
      const sky = skyAt(sections, window.innerHeight);
      skyRef.current = sky;
      soundRef.current?.update(sky);
      const base = skyBaseRef.current;
      const next = skyNextRef.current;
      if (base && next) {
        painted = paintSky(
          root,
          { base, next },
          skyLayers(sections, window.innerHeight),
          painted
        );
      }

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
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
    return initMotion(root, { landOn });
  }, [reducedMotion, landOn]);

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
        @keyframes xp-photo-in { from { opacity: 0; transform: translateY(28px) scale(0.92); } }
        @keyframes xp-eq { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
        .xp-cursor[data-label='on'] { background: #d4af37; border-color: transparent; mix-blend-mode: normal; }
        .xp-cursor span { opacity: 0; transition: opacity 0.2s; }
        .xp-cursor[data-label='on'] span { opacity: 1; }
      `}</style>

      <a
        href="#contact"
        className="sr-only z-70 rounded-full bg-brand-charcoal px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to the inquiry form
      </a>

      <div
        ref={skyBaseRef}
        aria-hidden="true"
        className="fixed inset-0 z-0"
        style={{ background: skyGradient(SKIES.dawn) }}
      />
      <div
        ref={skyNextRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 opacity-0 will-change-[opacity]"
      />

      <Atmosphere skyRef={skyRef} reducedMotion={reducedMotion} />

      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-60 h-0.5 origin-left scale-x-0 bg-brand-gold"
      />
      <Nav
        view={view}
        navRef={navRef}
        soundOn={soundOn}
        onToggleSound={() => void setSound(!soundOn)}
      />

      <main className="relative z-10">
        {sections.map((Section, index) => (
          // Each page's list is fixed, so its position is a stable key.
          <Section key={index} />
        ))}
      </main>
      <SiteFooter />
      {view === 'story' && <ChapterRail />}

      <Cursor />
    </div>
  );
};

export default ExperiencePage;
