import React from 'react';
import { TransitionLink } from '../PageTransition';
import {
  GOOGLE_MAPS_DIRECTIONS_URL,
  VENUE_ADDRESS,
  VENUE_NAME,
} from '../../lib/venueLocation';
import { PHOTOS, pic } from './photos';
import { scrollToSection } from './scroll';
import { Eyebrow, Heading } from './sections';
import type { SkyName } from './sky';
import { EXPERIENCE_PATHS, EXPERIENCE_TITLES } from './views';

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
  {
    to: '/gallery',
    eyebrow: 'The gallery',
    title: 'Real weddings at the barn',
    copy: 'Ceremonies, receptions and quiet moments from couples who celebrated here.',
    image: PHOTOS.couplePorch,
    alt: 'Newlyweds dancing on the covered porch',
  },
] as const;

/** Sunset on the story page: where to go next, as clicks, not more scroll. */
export const Next: React.FC = () => (
  <section id="next" data-sky="sunset" className="relative px-6 py-[14vh]">
    <div className="mx-auto max-w-7xl">
      <Eyebrow>Keep exploring</Eyebrow>
      <Heading>Plan the rest of your day</Heading>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {paths.map((path) => (
          <TransitionLink
            key={path.to}
            to={path.to}
            data-cursor="Open"
            className="xp-tile group relative block aspect-[4/3] overflow-hidden rounded-[2rem] text-white shadow-2xl md:aspect-[3/4]"
          >
            <img
              {...pic(path.image, '(min-width: 768px) 33vw, 100vw')}
              alt={path.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                {path.eyebrow}
              </p>
              <p className="mt-3 font-serif text-[clamp(1.9rem,2.8vw,2.6rem)] italic leading-[1.05]">
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
    </div>
  </section>
);

const CHAPTERS = [
  { id: 'arrive', label: 'Arrive' },
  { id: 'barn', label: 'The barn' },
  { id: 'inside', label: 'Inside' },
  { id: 'next', label: 'Plan' },
  { id: 'contact', label: 'Inquire' },
] as const;

/** The chapter under the middle of the screen, for the rail's marker. */
const useActiveChapter = () => {
  const [active, setActive] = React.useState<string>(CHAPTERS[0].id);
  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    for (const chapter of CHAPTERS) {
      const section = document.getElementById(chapter.id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);
  return active;
};

/** Where you are in the story, and a jump to any chapter. Wide screens only. */
export const ChapterRail: React.FC = () => {
  const active = useActiveChapter();
  return (
    <nav
      aria-label="Chapters"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 rounded-full px-3 py-4 shadow-lg lg:block"
      style={{
        background: 'color-mix(in srgb, var(--sky-mid) 82%, transparent)',
      }}
    >
      <ol className="flex flex-col gap-4">
        {CHAPTERS.map((chapter) => {
          const current = chapter.id === active;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={current ? 'step' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(chapter.id);
                }}
                className="group flex items-center justify-end gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.25em]"
              >
                <span
                  className={`transition-opacity ${
                    current ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'
                  }`}
                >
                  {chapter.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-2 w-2 rounded-full border transition-transform ${
                    current
                      ? 'scale-125 border-brand-gold bg-brand-gold'
                      : 'border-current'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const FOOTER_LINKS = [
  { to: EXPERIENCE_PATHS.story, label: EXPERIENCE_TITLES.story },
  { to: EXPERIENCE_PATHS.day, label: EXPERIENCE_TITLES.day },
  { to: EXPERIENCE_PATHS.stay, label: EXPERIENCE_TITLES.stay },
  { to: '/gallery', label: 'Gallery' },
] as const;

/** The close of every experience page: where the barn is, and the pages. */
export const SiteFooter: React.FC = () => (
  <footer data-sky="night" className="relative z-10 px-6 pb-10 pt-6">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-current/15 pt-10 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-serif text-3xl">{VENUE_NAME}</p>
        <address className="mt-2 text-sm not-italic opacity-75">
          {VENUE_ADDRESS.street}, {VENUE_ADDRESS.locality},{' '}
          {VENUE_ADDRESS.regionCode} {VENUE_ADDRESS.postalCode}
        </address>
        <a
          href={GOOGLE_MAPS_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.25em] underline decoration-brand-gold underline-offset-8"
        >
          Get directions
        </a>
      </div>
      <nav aria-label="Pages">
        <ul className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold uppercase tracking-[0.25em]">
          {FOOTER_LINKS.map((link) => (
            <li key={link.to}>
              <TransitionLink
                to={link.to}
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                {link.label}
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    <p className="mx-auto mt-8 max-w-7xl text-xs opacity-55">
      &copy; {new Date().getFullYear()} {VENUE_NAME}. The drone and walk-in
      films are artistic renderings made from photos of the barn.
    </p>
  </footer>
);
