import React from 'react';
import { TransitionLink } from '../PageTransition';
import { PHOTOS, pic } from './photos';
import { Eyebrow, Heading } from './sections';
import type { SkyName } from './sky';
import { EXPERIENCE_PATHS } from './views';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  lead: string;
  sky: SkyName;
}

/** The opening of the day and stay pages: a title and the way back. */
export const PageIntro: React.FC<PageIntroProps> = ({
  eyebrow,
  title,
  lead,
  sky,
}) => (
  <section
    data-sky={sky}
    className="relative flex min-h-[72svh] items-end px-6 pb-[10vh] pt-[24vh]"
  >
    <div className="mx-auto w-full max-w-7xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="xp-split mt-4 max-w-5xl font-serif text-[clamp(3rem,9vw,8rem)] font-normal leading-[0.95] tracking-tight">
        {title}
      </h1>
      <p className="xp-reveal mt-6 max-w-xl text-lg opacity-80">{lead}</p>
      <TransitionLink
        to={EXPERIENCE_PATHS.story}
        className="xp-reveal mt-8 inline-block text-xs font-semibold uppercase tracking-[0.25em] opacity-75 transition-opacity hover:opacity-100"
      >
        &larr; Back to the story
      </TransitionLink>
    </div>
  </section>
);

const paths = [
  {
    to: EXPERIENCE_PATHS.day,
    eyebrow: 'Your wedding day',
    title: 'From first look to last dance',
    copy: 'How the day unfolds, the two packages, planning help and the questions couples ask most.',
    image: PHOTOS.vows,
    alt: 'A couple exchanging vows in front of the barn',
  },
  {
    to: EXPERIENCE_PATHS.stay,
    eyebrow: 'Stay & explore',
    title: 'Sleep where you celebrate',
    copy: 'Five bedrooms in the barn, a cottage on the hill, and the gorge, lakes and trails nearby.',
    image: PHOTOS.cottage,
    alt: 'The guest cottage on the hillside',
  },
] as const;

/** Sunset on the story page: where to go next, instead of more scrolling. */
export const Next: React.FC = () => (
  <section id="next" data-sky="sunset" className="relative px-6 py-[14vh]">
    <div className="mx-auto max-w-7xl">
      <Eyebrow>Keep exploring</Eyebrow>
      <Heading>Plan the rest of your day</Heading>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {paths.map((path) => (
          <TransitionLink
            key={path.to}
            to={path.to}
            data-cursor="Open"
            className="xp-tile xp-tilt group relative block aspect-[4/5] overflow-hidden rounded-[2rem] text-white shadow-2xl sm:aspect-[4/3]"
          >
            <img
              {...pic(path.image, '(min-width: 768px) 50vw, 100vw')}
              alt={path.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                {path.eyebrow}
              </p>
              <p className="mt-3 font-serif text-[clamp(2rem,3.6vw,3.25rem)] italic leading-[1.02]">
                {path.title}
              </p>
              <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
                {path.copy}
              </p>
              <span
                aria-hidden="true"
                className="mt-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]"
              >
                Open
                <span className="transition-transform duration-500 group-hover:translate-x-2">
                  &rarr;
                </span>
              </span>
            </div>
          </TransitionLink>
        ))}
      </div>
      <p className="xp-reveal mt-10 text-center text-sm">
        <TransitionLink
          to="/gallery"
          className="font-semibold uppercase tracking-[0.25em] underline decoration-brand-gold underline-offset-8"
        >
          Or browse the gallery
        </TransitionLink>
      </p>
    </div>
  </section>
);
