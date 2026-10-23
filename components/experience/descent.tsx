import React from 'react';
import { TransitionLink } from '../PageTransition';
import { frameUrl } from './film';
import descent from './films/descent';
import {
  CAPTIONS,
  coverPoint,
  FRAME,
  HOTSPOTS,
  type Hotspot,
  type Point,
} from './descentSpots';
import { pic } from './photos';
import { scrollToSection } from './scroll';
import { EXPERIENCE_PATHS } from './views';

/*
 * The opening of the story page: a drone film that plays by scroll, with
 * captions naming what is on screen, and pins on its last frame that open
 * real photos of those places. motion.ts plays the film and times the
 * captions and pins; without motion the last frame shows with its pins.
 */

const goTo = (id: string) => (event: React.MouseEvent) => {
  event.preventDefault();
  scrollToSection(id);
};

type PinPlace = Point & { visible: boolean; low: boolean };

/** Below this width every place is a button, not a pin. */
const PIN_MIN_WIDTH = 640;

/** Each pin's place on screen, kept current as `layer` resizes. */
const usePinPositions = (layer: React.RefObject<HTMLElement | null>) => {
  const [positions, setPositions] = React.useState<ReadonlyArray<PinPlace>>([]);
  React.useLayoutEffect(() => {
    const measure = () => {
      const box = layer.current?.getBoundingClientRect();
      if (!box) return;
      // On a narrow phone, pins, labels and the welcome do not all fit, so
      // every place shows as a button in the row under the welcome instead.
      const roomy = box.width >= PIN_MIN_WIDTH;
      setPositions(
        HOTSPOTS.map((spot) => {
          const point = coverPoint(spot, FRAME, box);
          const place = { ...point, visible: point.visible && roomy };
          // A pin low on screen gets its label above it, clear of the edge.
          const low = spot.labelAbove === true || place.y > box.height * 0.7;
          return { ...place, low };
        })
      );
    };
    measure();
    // The layer can be sized after mount (styles, the pin), so watch the
    // layer itself rather than only the window.
    const element = layer.current;
    if (element && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [layer]);
  return positions;
};

const Captions: React.FC = () => (
  <ol className="pointer-events-none absolute bottom-[18vh] left-6 z-10 sm:left-[6vw]">
    {CAPTIONS.map((caption) => (
      <li
        key={caption.text}
        className="xp-descent-caption invisible absolute bottom-0 left-0 w-[min(80vw,26rem)] border-l-2 border-brand-gold pl-4 text-white"
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/80">
          {caption.eyebrow}
        </p>
        <p className="mt-1 font-serif text-2xl italic leading-tight drop-shadow-md sm:text-3xl">
          {caption.text}
        </p>
      </li>
    ))}
  </ol>
);

const Welcome: React.FC = () => (
  <div className="xp-descent-arrive pointer-events-auto invisible text-center text-white in-[.xp-reduced]:visible">
    <p className="font-serif text-[clamp(2.2rem,5.5vw,4.5rem)] italic leading-tight drop-shadow-lg">
      Welcome to the barn.
    </p>
    <p className="mx-auto mt-3 max-w-md text-sm text-white/90 drop-shadow sm:text-base">
      Room for 200 guests, and beds for 15 of them.
    </p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <a
        href="#contact"
        onClick={goTo('contact')}
        className="rounded-full bg-brand-gold px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2a2522] shadow-lg transition-colors hover:bg-white"
      >
        Check your date
      </a>
      <TransitionLink
        to={EXPERIENCE_PATHS.day}
        className="rounded-full border border-white/80 px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/15"
      >
        See the day
      </TransitionLink>
    </div>
  </div>
);

interface SpotPanelProps {
  spot: Hotspot;
  onClose: () => void;
}

const SpotPanel: React.FC<SpotPanelProps> = ({ spot, onClose }) => {
  const close = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => close.current?.focus(), []);
  return (
    <div
      role="dialog"
      aria-label={spot.label}
      onKeyDown={(event) => event.key === 'Escape' && onClose()}
      className="pointer-events-auto absolute inset-x-4 bottom-4 z-30 mx-auto max-w-md overflow-hidden rounded-3xl bg-[#fdf8f5] text-brand-charcoal shadow-2xl sm:bottom-8"
    >
      <img
        {...pic(spot.image, '(min-width: 640px) 28rem, 100vw')}
        alt={spot.alt}
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex items-start gap-4 p-5">
        <div className="flex-1">
          <p className="font-serif text-2xl">{spot.label}</p>
          <p className="mt-1 text-sm opacity-80">{spot.line}</p>
        </div>
        <button
          ref={close}
          type="button"
          onClick={onClose}
          className="rounded-full border border-current/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface PinProps {
  spot: Hotspot;
  at: PinPlace;
  onOpen: (spot: Hotspot) => void;
}

const Pin: React.FC<PinProps> = ({ spot, at, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(spot)}
    className={`group pointer-events-auto absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full`}
    style={{ left: at.x, top: at.y }}
  >
    <span className="sr-only">{spot.label}</span>
    <span
      aria-hidden="true"
      className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:animate-none"
    />
    <span
      aria-hidden="true"
      className="relative h-4 w-4 rounded-full border-2 border-white bg-brand-gold shadow-lg"
    />
    <span
      aria-hidden="true"
      className={`absolute left-1/2 ${at.low ? 'bottom-full mb-1' : 'top-full mt-1'} -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white`}
    >
      {spot.label}
    </span>
  </button>
);

interface ChipsProps {
  spots: readonly Hotspot[];
  onOpen: (spot: Hotspot) => void;
}

/** The places whose pins would fall off this screen, as plain buttons. */
const Chips: React.FC<ChipsProps> = ({ spots, onOpen }) => (
  <div className="xp-descent-chips pointer-events-auto invisible flex max-w-full gap-2 overflow-x-auto px-1 [scrollbar-width:none] in-[.xp-reduced]:visible [&::-webkit-scrollbar]:hidden">
    {spots.map((spot) => (
      <button
        key={spot.id}
        type="button"
        onClick={() => onOpen(spot)}
        className="shrink-0 rounded-full bg-black/45 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm"
      >
        {spot.label}
      </button>
    ))}
  </div>
);

/**
 * Everything on the film's last frame: the welcome, pins where they fit on
 * screen, chips for the rest, and the photo panel a pin opens.
 */
const Arrival: React.FC = () => {
  // Measures a layer of its own: a parent's ref is not attached yet when a
  // child's layout effect runs. motion.ts fades the pin and chip layers as
  // wholes, since the pins themselves re-render once they are measured.
  const layer = React.useRef<HTMLDivElement>(null);
  const positions = usePinPositions(layer);
  const [open, setOpen] = React.useState<Hotspot | null>(null);
  const shown = (index: number) => positions[index]?.visible ?? false;

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 z-20">
      <div className="absolute inset-x-0 top-[13vh] flex flex-col items-center gap-6 px-6">
        <Welcome />
        <Chips
          spots={HOTSPOTS.filter((_, index) => !shown(index))}
          onOpen={setOpen}
        />
      </div>
      <div className="xp-descent-pins invisible absolute inset-0 in-[.xp-reduced]:visible">
        {HOTSPOTS.map((spot, index) =>
          shown(index) ? (
            <Pin
              key={spot.id}
              spot={spot}
              at={positions[index]}
              onOpen={setOpen}
            />
          ) : null
        )}
      </div>
      {open && <SpotPanel spot={open} onClose={() => setOpen(null)} />}
    </div>
  );
};

const LAST_FRAME = descent.count - 1;

export const Descent: React.FC = () => {
  return (
    <section
      id="arrive"
      data-sky="dawn"
      aria-label="Arriving at the barn"
      className="xp-descent relative h-svh min-h-[560px] overflow-hidden bg-[#9fb0a8]"
    >
      {/* The first frame, shown at once while the film loads. */}
      <img
        src={frameUrl(descent, 'md', 0)}
        alt="Aerial view of the barn on its forested hilltop above misty West Virginia ridges at sunrise"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {/* With reduced motion the film stays on its last frame, where the pins are. */}
      <img
        src={frameUrl(descent, 'md', LAST_FRAME)}
        alt=""
        loading="lazy"
        className="absolute inset-0 hidden h-full w-full object-cover in-[.xp-reduced]:block"
      />
      <canvas
        aria-hidden="true"
        className="xp-descent-canvas absolute inset-0 h-full w-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/35" />
      <div
        aria-hidden="true"
        className="xp-descent-fade pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-0"
        style={{
          background: 'linear-gradient(to top, var(--sky-bot), transparent)',
        }}
      />

      <div className="xp-descent-intro absolute inset-x-0 top-[20vh] z-10 px-6 text-center text-white in-[.xp-reduced]:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/85 sm:text-sm">
          Mount Nebo, West Virginia
        </p>
        <h1 className="mt-5 font-serif text-[clamp(2.8rem,8vw,7rem)] leading-[0.95] drop-shadow-md">
          The Barn at Sunset Farm
        </h1>
        <p className="mt-4 font-serif text-xl italic text-white/90 sm:text-2xl">
          High in the hills, the day begins.
        </p>
      </div>

      <Captions />
      <Arrival />

      <div className="absolute inset-x-0 bottom-5 z-20 flex items-end justify-between px-4 sm:px-6">
        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/60">
          Artistic rendering
        </p>
        <button
          type="button"
          onClick={() => scrollToSection('barn')}
          className="rounded-full bg-black/35 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition-colors hover:bg-black/55"
        >
          Skip to the barn
        </button>
      </div>

      <div className="xp-descent-hint pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white opacity-0">
        Scroll to descend
        <span className="relative block h-10 w-px overflow-hidden bg-white/30">
          <span className="xp-scroll-hint-dot absolute inset-x-0 top-0 h-3 bg-white" />
        </span>
      </div>
    </section>
  );
};
