import React from 'react';
import {
  GOOGLE_MAPS_DIRECTIONS_URL,
  VENUE_ADDRESS,
} from '../../lib/venueLocation';
import TapFilm from './TapFilm';
import inside from './films/inside';
import HallPhotos from './HallPhotos';
import InquiryForm from './InquiryForm';
import Meadow from './Meadow';
import { PHOTOS, pic } from './photos';

/*
 * Section markup for the story page, and the pieces every /experience page
 * shares (the eyebrow, the heading, the inquiry). The wedding-day page's
 * sections are in daySections.tsx, the stay page's in staySections.tsx. Every section is readable as
 * plain, static HTML: motion.ts adds all movement on top, and skips it when
 * the visitor prefers reduced motion. Class names starting with "xp-" are
 * the hooks motion.ts animates.
 */

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p
    className={`xp-reveal text-xs font-semibold uppercase tracking-[0.35em] opacity-70 sm:text-sm ${className}`}
  >
    {children}
  </p>
);

export const Heading: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h2
    className={`xp-split mt-4 font-serif text-[clamp(2.6rem,6vw,5.5rem)] font-normal leading-[0.98] tracking-tight ${className}`}
  >
    {children}
  </h2>
);

/* ------------------------------------------------------------------ */
/* 3b. Late morning: the cedar doors slide open and you walk inside.  */
/* ------------------------------------------------------------------ */

/** Timed to the film: the doors open, the hall, then the French doors. */
const insideLines = [
  { from: 0, to: 0.26, eyebrow: 'The Main Barn', text: 'Step inside.' },
  {
    from: 0.45,
    to: 0.72,
    eyebrow: 'The reception hall',
    text: 'Knotty pine, morning light, room for 200.',
  },
  {
    from: 0.86,
    to: 1,
    eyebrow: 'To the porch',
    text: 'Out to the porch and the hills.',
  },
] as const;

export const Inside: React.FC = () => (
  <section
    id="inside"
    data-sky="golden"
    data-cue="doors"
    aria-label="Stepping inside the barn"
    className="xp-inside relative h-svh min-h-[560px] overflow-hidden bg-[#c9b391]"
  >
    <TapFilm
      film={inside}
      cues={insideLines}
      alt="The reception hall inside the barn: pale knotty pine walls, square pine posts and a black wagon-wheel chandelier"
      playLabel="Step inside"
      playClassName="absolute inset-0 z-20 grid place-items-center"
    >
      {({ phase, cue, play }) => {
        // Before the film plays, its first line invites the visitor in.
        const showing = phase === 'ready' ? 0 : cue;
        return (
          <>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-black/25" />
            <div className="absolute inset-x-0 bottom-[12vh] z-10 px-6 sm:px-[8vw]">
              {insideLines.map((line, index) => (
                <div
                  key={line.text}
                  data-line=""
                  className={`text-white transition-[opacity,translate] duration-700 ease-out sm:max-w-2xl lg:max-w-xl ${
                    index > 0
                      ? 'absolute inset-x-6 bottom-0 sm:inset-x-[8vw]'
                      : ''
                  } ${
                    showing === index
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-6 opacity-0'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
                    {line.eyebrow}
                  </p>
                  <p className="mt-3 font-serif text-[clamp(2.2rem,5.5vw,4.75rem)] italic leading-[1.02] drop-shadow-lg">
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
            {phase === 'ended' && <HallPhotos />}
            {phase === 'ended' && (
              <button
                type="button"
                onClick={play}
                className="absolute bottom-10 right-4 z-20 rounded-full bg-black/55 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-black/70 sm:right-6"
              >
                Watch again
              </button>
            )}
          </>
        );
      }}
    </TapFilm>

    <p className="absolute bottom-3 right-4 z-10 text-[0.6rem] uppercase tracking-[0.25em] text-white/60">
      Artistic rendering
    </p>
  </section>
);

/* ------------------------------------------------------------------ */
/* 4. Golden: the barn itself, with numbers that count up.             */
/* ------------------------------------------------------------------ */

const stats = [
  { value: 200, label: 'Guests for ceremony & reception' },
  { value: 5, label: 'Bedrooms inside the barn' },
  { value: 1, label: 'Private guest cottage' },
  { value: 15, label: 'Guests can stay the night' },
] as const;

const mosaic = [
  {
    src: PHOTOS.barnPorch,
    alt: 'The barn and its covered porch',
    className: 'col-span-2 row-span-2',
  },
  {
    src: PHOTOS.porchView,
    alt: 'View from the porch over the ceremony lawn',
    className: '',
  },
  {
    src: PHOTOS.kitchen,
    alt: 'The barn kitchen and dining area',
    className: '',
  },
  {
    src: PHOTOS.livingRoom,
    alt: 'The barn living room with fireplace',
    className: 'col-span-2',
  },
] as const;

export const Barn: React.FC = () => (
  <section id="barn" data-sky="golden" className="relative px-6 py-[18vh]">
    <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[1fr_1.15fr]">
      <div>
        <Eyebrow>The Main Barn</Eyebrow>
        <Heading>
          Soaring ceilings, exposed beams, <em>room for everyone</em>
        </Heading>
        <p className="xp-reveal mt-8 max-w-lg text-lg opacity-85">
          With its soaring ceilings, exposed wooden beams, and grand
          chandeliers, the barn is a versatile space that can be transformed to
          match your vision: a spacious dance floor and panoramic windows
          overlooking the farm.
        </p>
        <p className="xp-reveal mt-4 max-w-lg opacity-75">
          Rustic chic or formal black-tie, the space flows seamlessly from your
          ceremony to cocktail hour and reception.
        </p>
      </div>
      <div className="xp-clip relative h-[70vh] overflow-hidden rounded-[2rem] shadow-2xl">
        <img
          {...pic(PHOTOS.barnFront, '(min-width: 768px) 55vw, 100vw')}
          alt="The front of the barn with its wooden doors open"
          loading="lazy"
          className="xp-parallax-img absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
        />
      </div>
    </div>

    <dl className="mx-auto mt-24 grid max-w-6xl grid-cols-2 gap-y-12 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="xp-reveal border-l border-current/20 pl-5"
        >
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span
              className="xp-count block font-serif text-[clamp(3rem,6vw,5.5rem)] leading-none text-brand-gold"
              data-to={stat.value}
            >
              {stat.value}
            </span>
            <span aria-hidden="true" className="mt-2 block text-sm opacity-75">
              {stat.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>

    <div className="mx-auto mt-24 grid max-w-7xl auto-rows-[22vh] grid-cols-2 gap-4 md:auto-rows-[26vh] md:grid-cols-4">
      {mosaic.map((tile) => (
        <div
          key={tile.alt}
          className={`xp-tile overflow-hidden rounded-2xl shadow-xl ${tile.className}`}
        >
          <img
            {...pic(tile.src, '(min-width: 768px) 50vw, 100vw')}
            alt={tile.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 10b. Night: the inquiry form, on every page.               */
/* ------------------------------------------------------------------ */

export const Inquire: React.FC = () => (
  <section
    id="contact"
    data-sky="night"
    aria-labelledby="xp-inquire-title"
    className="relative px-4 py-[12vh] sm:px-6"
  >
    <div className="relative mx-auto grid max-w-6xl gap-12 overflow-hidden rounded-[2rem] bg-[#fdf8f5] p-8 pb-[min(24vw,11rem)] text-brand-charcoal shadow-2xl sm:p-12 sm:pb-[min(20vw,12rem)] md:grid-cols-[1fr_1.2fr] md:gap-16">
      <Meadow className="absolute inset-x-0 bottom-0" />
      <div>
        <Eyebrow>Inquire</Eyebrow>
        <h2
          id="xp-inquire-title"
          className="mt-4 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1.02]"
        >
          Check your date
        </h2>
        <p className="mt-5 max-w-sm opacity-80">
          Tell us when you&apos;re thinking and how to reach you. We&apos;ll
          confirm availability and set up a visit to the barn.
        </p>
        <p className="mt-8 text-sm opacity-70">
          {VENUE_ADDRESS.street}, {VENUE_ADDRESS.locality},{' '}
          {VENUE_ADDRESS.regionCode}
        </p>
        <a
          href={GOOGLE_MAPS_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.25em] underline decoration-brand-gold underline-offset-8"
        >
          Get directions
        </a>
      </div>
      <InquiryForm />
    </div>
  </section>
);
