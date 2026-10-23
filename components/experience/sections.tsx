import React from 'react';
import {
  GOOGLE_MAPS_DIRECTIONS_URL,
  VENUE_ADDRESS,
} from '../../lib/venueLocation';
import CheckIcon from '../icons/CheckIcon';
import { AMENITIES } from '../amenityList';
import { FAQS, PACKAGE_TIERS } from '../../lib/siteContent';
import type { ResponsiveImage } from '../../scripts/responsiveImages';
import { frameUrl } from './film';
import inside from './films/inside';
import InquiryForm from './InquiryForm';
import { LOGO, PHOTOS, pic } from './photos';
import { scrollToSection } from './scroll';

/*
 * Section markup for the /experience page. Every section is readable as
 * plain, static HTML: motion.ts adds all movement on top, and skips it when
 * the visitor prefers reduced motion. Class names starting with "xp-" are
 * the hooks motion.ts animates.
 */

const scrollToId = (id: string) => (event: React.MouseEvent) => {
  event.preventDefault();
  scrollToSection(id);
};

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
/* 3. The day, told sideways: five chapters on a horizontal track.     */
/* ------------------------------------------------------------------ */

interface Chapter {
  name: string;
  title: string;
  copy: string;
  photos: readonly {
    src: ResponsiveImage;
    alt: string;
    className: string;
    depth: number;
  }[];
}

const chapters: readonly Chapter[] = [
  {
    name: 'Getting ready',
    title: 'Morning light in the loft',
    copy: 'The bridal suite, dresses hung from the barn doors, boots waiting beside the bouquet.',
    photos: [
      {
        src: PHOTOS.dresses,
        alt: 'Bridesmaid dresses hanging from the barn doors',
        className: 'left-0 top-[4%] w-[58%] h-[70%]',
        depth: 0.6,
      },
      {
        src: PHOTOS.loft,
        alt: 'The bridal suite vanity in the loft',
        className: 'right-0 top-[30%] w-[48%] h-[48%]',
        depth: 1.4,
      },
      {
        src: PHOTOS.boots,
        alt: 'Boots beside a wildflower bouquet',
        className: 'left-[18%] bottom-0 w-[34%] h-[36%]',
        depth: 2.2,
      },
    ],
  },
  {
    name: 'The ceremony',
    title: 'Vows beneath the arch',
    copy: 'An outdoor aisle across the lawn, the wooden arch, and the mountains as your witness.',
    photos: [
      {
        src: PHOTOS.aisle,
        alt: 'Guests watching a ceremony at the wooden arch',
        className: 'left-0 top-0 w-[62%] h-[64%]',
        depth: 0.6,
      },
      {
        src: PHOTOS.vows,
        alt: 'A couple exchanging vows under draped fabric',
        className: 'right-0 top-[22%] w-[42%] h-[52%]',
        depth: 1.5,
      },
      {
        src: PHOTOS.ceremonySetup,
        alt: 'White chairs set for a ceremony overlooking the hills',
        className: 'left-[10%] bottom-0 w-[46%] h-[30%]',
        depth: 2.2,
      },
    ],
  },
  {
    name: 'The reception',
    title: 'Long tables & a full dance floor',
    copy: 'Dinner on the covered porch, then into the barn under soaring ceilings and exposed beams.',
    photos: [
      {
        src: PHOTOS.porchTables,
        alt: 'Long tables set on the covered porch',
        className: 'left-0 top-[8%] w-[52%] h-[66%]',
        depth: 0.6,
      },
      {
        src: PHOTOS.greatRoom,
        alt: 'Round reception tables inside the barn',
        className: 'right-0 top-0 w-[46%] h-[46%]',
        depth: 1.5,
      },
      {
        src: PHOTOS.cake,
        alt: 'A white wedding cake against the wood wall',
        className: 'right-[12%] bottom-0 w-[32%] h-[44%]',
        depth: 2.3,
      },
    ],
  },
  {
    name: 'Golden hour',
    title: 'The farm earns its name',
    copy: 'String lights come on as the sun slips behind the ridgeline and the porch glows.',
    photos: [
      {
        src: PHOTOS.porchSunset,
        alt: 'Reception tables on the porch at sunset under string lights',
        className: 'left-0 top-[6%] w-[64%] h-[62%]',
        depth: 0.6,
      },
      {
        src: PHOTOS.tableSunset,
        alt: 'Candlelit table with orange flowers at sunset',
        className: 'right-0 bottom-[4%] w-[44%] h-[50%]',
        depth: 1.6,
      },
      {
        src: PHOTOS.coupleDoors,
        alt: 'A couple in front of the barn doors',
        className: 'left-[14%] bottom-0 w-[28%] h-[34%]',
        depth: 2.4,
      },
    ],
  },
  {
    name: 'Nightfall',
    title: 'Stay a little longer',
    copy: 'Gather round the fire pit, then sleep on site and wake to the quiet of the countryside.',
    photos: [
      {
        src: PHOTOS.barnDusk,
        alt: 'The barn at dusk with its lights on',
        className: 'left-0 top-0 w-[60%] h-[58%]',
        depth: 0.6,
      },
      {
        src: PHOTOS.firePit,
        alt: 'Adirondack chairs around the fire pit',
        className: 'right-0 top-[26%] w-[46%] h-[46%]',
        depth: 1.5,
      },
      {
        src: PHOTOS.bedroom,
        alt: 'A guest bedroom in the barn',
        className: 'left-[8%] bottom-0 w-[40%] h-[34%]',
        depth: 2.3,
      },
    ],
  },
];

export const TheDay: React.FC = () => (
  <section
    id="the-day"
    data-sky="morning"
    data-cursor="Drag"
    className="xp-day relative overflow-hidden [.xp-reduced_&]:overflow-x-auto"
  >
    <div className="xp-day-track flex min-h-svh w-max items-center gap-[6vw] px-[6vw] py-[10vh]">
      <div className="flex w-[80vw] shrink-0 flex-col justify-center md:w-[34vw]">
        <Eyebrow>A day at the barn</Eyebrow>
        <Heading>
          From first light to the{' '}
          <em className="text-brand-gold">last dance</em>
        </Heading>
        <p className="xp-reveal mt-6 max-w-sm text-base opacity-80">
          Keep scrolling to walk through a wedding day at Sunset Farm, one
          chapter at a time.
        </p>
      </div>
      {chapters.map((chapter, index) => (
        <article
          key={chapter.name}
          className="xp-chapter flex w-[86vw] shrink-0 flex-col gap-6 md:w-[min(78vw,1150px)] md:flex-row md:items-center"
        >
          <div className="md:w-[36%]">
            <p
              aria-hidden="true"
              className="font-serif text-[clamp(3rem,9vw,8rem)] leading-none opacity-15"
            >
              0{index + 1}
            </p>
            <p className="-mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold">
              {chapter.name}
            </p>
            <h3 className="mt-3 font-serif text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02]">
              {chapter.title}
            </h3>
            <p className="mt-4 max-w-sm opacity-80">{chapter.copy}</p>
          </div>
          <div className="relative h-[38vh] md:h-[64vh] md:flex-1">
            {chapter.photos.map((photo) => (
              <div
                key={photo.alt}
                data-depth={photo.depth}
                data-gl-zoom="1.1"
                className={`xp-chapter-photo absolute overflow-hidden rounded-2xl shadow-2xl ${photo.className}`}
              >
                <img
                  {...pic(photo.src, '(min-width: 768px) 40vw, 80vw')}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full scale-110 object-cover"
                />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
    <div
      aria-hidden="true"
      className="xp-day-progress pointer-events-none absolute inset-x-[6vw] bottom-[5vh] hidden md:block [.xp-reduced_&]:hidden"
    >
      <div className="relative h-px bg-current/20">
        <div className="xp-day-fill absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-brand-gold" />
      </div>
      <div className="mt-3 flex justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] opacity-60">
        {chapters.map((chapter) => (
          <span key={chapter.name}>{chapter.name}</span>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 3b. Late morning: the cedar doors slide open and you walk inside.  */
/* ------------------------------------------------------------------ */

/** The film frame shown before it plays, and instead of it when motion is reduced. */
const INSIDE_POSTER = 60;

const insideLines = [
  { eyebrow: 'The Main Barn', text: 'Step inside.' },
  {
    eyebrow: 'The reception hall',
    text: 'Knotty pine, morning light, room for 200.',
  },
  {
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
    <img
      src={frameUrl(inside, 'md', INSIDE_POSTER)}
      alt="The reception hall inside the barn: pale knotty pine walls, square pine posts and a black wagon-wheel chandelier"
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <canvas
      aria-hidden="true"
      className="xp-inside-canvas absolute inset-0 h-full w-full"
    />
    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-black/25" />

    <div className="absolute inset-x-0 bottom-[12vh] z-10 px-6 sm:px-[8vw]">
      {insideLines.map((line, index) => (
        <div
          key={line.text}
          className={`xp-inside-line text-white sm:max-w-2xl ${
            index > 0
              ? 'absolute inset-x-6 bottom-0 opacity-0 sm:inset-x-[8vw]'
              : ''
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
/* 5. Amenities on two marquees that speed up with your scroll.        */
/* ------------------------------------------------------------------ */

const MarqueeRow: React.FC<{
  items: typeof AMENITIES;
  direction: 1 | -1;
}> = ({ items, direction }) => (
  <div className="overflow-hidden py-3 [.xp-reduced_&]:overflow-x-auto">
    <div className="xp-marquee flex w-max gap-4" data-direction={direction}>
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 ? true : undefined}
          className={`flex gap-4 ${copy === 1 ? '[.xp-reduced_&]:hidden' : ''}`}
        >
          {items.map((item) => (
            <li
              key={item.title}
              className="flex w-[78vw] shrink-0 items-center gap-5 rounded-full border border-current/15 bg-white/45 py-4 pl-4 pr-8 shadow-sm backdrop-blur-sm sm:w-auto"
            >
              <span className="rounded-full bg-brand-cream p-3 text-brand-sage shadow-inner">
                <item.icon className="h-7 w-7" />
              </span>
              <span>
                <span className="block font-serif text-2xl leading-tight">
                  {item.title}
                </span>
                <span className="block text-sm opacity-70 sm:whitespace-nowrap">
                  {item.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  </div>
);

export const Amenities: React.FC = () => (
  <section data-sky="golden" className="relative py-[14vh]">
    <div className="px-6 text-center">
      <Eyebrow>Venue amenities</Eyebrow>
      <Heading>Thoughtful touches, all on site</Heading>
    </div>
    <div className="mt-14 -rotate-2">
      <MarqueeRow items={AMENITIES.slice(0, 4)} direction={-1} />
      <MarqueeRow items={AMENITIES.slice(4)} direction={1} />
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 6. Sunset: lodging cards stack on top of each other.                */
/* ------------------------------------------------------------------ */

const stays = [
  {
    title: 'Five bedrooms in the barn',
    copy: 'Room for the wedding party to rest, get ready together and wake up already at the venue.',
    src: PHOTOS.bedroom,
    alt: 'A guest bedroom with an iron bed frame',
  },
  {
    title: 'A one-bedroom cottage',
    copy: 'A peaceful retreat with modern comforts and picturesque views. Wake up to the serene sounds of the countryside.',
    src: PHOTOS.cottage,
    alt: 'The guest cottage on the hillside',
  },
  {
    title: 'Kitchens & living areas',
    copy: 'Fully equipped kitchens and comfortable living areas, so the celebration has somewhere to go after the reception.',
    src: PHOTOS.livingRoom,
    alt: 'The living room with sofas and a stone fireplace',
  },
  {
    title: 'Patios & the fire pit',
    copy: 'Private patios with scenic views, and a fire pit for the last toast of the night.',
    src: PHOTOS.firePit,
    alt: 'Chairs gathered around the fire pit',
  },
] as const;

export const Stay: React.FC = () => (
  <section
    id="stay"
    data-sky="sunset"
    className="relative px-4 py-[16vh] sm:px-6"
  >
    <div className="mx-auto max-w-6xl">
      <div className="mb-[10vh] text-center">
        <Eyebrow>Overnight lodging included</Eyebrow>
        <Heading>Stay the night</Heading>
        <p className="xp-reveal mx-auto mt-6 max-w-xl text-lg opacity-80">
          Up to 15 guests sleep on site — five bedrooms in the barn plus a
          private cottage. Perfect for the wedding party or out-of-town guests.
        </p>
      </div>
      {stays.map((stay, index) => (
        <article
          key={stay.title}
          className="xp-stack sticky mb-[8vh] grid min-h-[68vh] overflow-hidden rounded-[2rem] bg-brand-cream text-brand-charcoal shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45)] md:grid-cols-[1.25fr_1fr] [.xp-reduced_&]:static"
          style={{ top: `calc(12vh + ${index * 1.6}rem)` }}
        >
          <div className="relative min-h-[36vh] overflow-hidden">
            <img
              {...pic(stay.src, '(min-width: 768px) 60vw, 100vw')}
              alt={stay.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-14">
            <p className="font-serif text-6xl leading-none text-brand-pink">
              0{index + 1}
            </p>
            <h3 className="mt-4 font-serif text-[clamp(2rem,3.4vw,3.2rem)] leading-tight">
              {stay.title}
            </h3>
            <p className="mt-4 text-gray-600">{stay.copy}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 7. Packages that swing in and tilt toward the pointer.              */
/* ------------------------------------------------------------------ */

export const Packages: React.FC = () => (
  <section
    id="packages"
    data-sky="sunset"
    data-cue="clink"
    className="relative px-6 pb-[18vh] pt-[8vh] [perspective:1400px]"
  >
    <div className="mb-16 text-center">
      <Eyebrow>Packages</Eyebrow>
      <Heading>Two ways to celebrate</Heading>
    </div>
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
      {PACKAGE_TIERS.map((tier, index) => (
        <div
          key={tier.name}
          className="xp-package"
          data-side={index === 0 ? -1 : 1}
        >
          <div
            className={`xp-tilt relative flex h-full flex-col rounded-[2rem] p-9 shadow-2xl will-change-transform ${
              tier.highlight
                ? 'bg-brand-charcoal text-white'
                : 'bg-white/90 text-brand-charcoal backdrop-blur'
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-gold px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#2a2522] shadow-lg">
                Most popular
              </span>
            )}
            <h3 className="font-serif text-4xl">{tier.name}</h3>
            <p
              className={`mt-2 ${tier.highlight ? 'text-white/75' : 'text-gray-600'}`}
            >
              {tier.description}
            </p>
            <ul className="mt-8 grow space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-brand-sage" />
                  <span
                    className={
                      tier.highlight ? 'text-white/90' : 'text-gray-700'
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={scrollToId('contact')}
              className={`xp-magnetic mt-10 block rounded-full py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                tier.highlight
                  ? 'bg-brand-gold text-[#2a2522] hover:bg-white'
                  : 'bg-brand-charcoal text-white hover:bg-brand-gold'
              }`}
            >
              Request a quote
            </a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 8. Dusk: Sunset Willow Event Planning.                              */
/* ------------------------------------------------------------------ */

const services = [
  {
    title: 'Full service coordination',
    intro: 'A planning partnership from engagement to exit.',
    items: [
      'Timeline creation and management',
      'Vendor sourcing and communication',
      'Rehearsal direction',
      'Ceremony and reception flow coordination',
    ],
  },
  {
    title: 'Day-of coordination',
    intro: 'You planned the details; we run the day.',
    items: [
      'Wedding day timeline oversight',
      'Vendor arrival and setup monitoring',
      'Ceremony cueing',
      'Problem solving and guest assistance',
    ],
  },
] as const;

export const Planning: React.FC = () => (
  <section
    id="planning"
    data-sky="dusk"
    data-cue="lights"
    className="relative px-6 py-[18vh]"
  >
    <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[0.8fr_1.2fr]">
      <div className="flex justify-center">
        <div className="xp-medallion relative aspect-square w-[min(70vw,360px)] rounded-full bg-brand-cream p-10 shadow-[0_0_120px_-10px_rgb(212_175_55/0.55)]">
          <img
            src={LOGO}
            alt="Sunset Willow Event Planning, LLC logo"
            loading="lazy"
            className="h-full w-full object-contain"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            className="xp-medallion-ring absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] text-brand-gold"
          >
            <defs>
              <path
                id="xp-ring"
                d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"
              />
            </defs>
            <text className="fill-current text-[9.5px] uppercase tracking-[0.35em]">
              <textPath href="#xp-ring">
                Where your vision meets seamless execution · Sunset Willow Event
                Planning ·
              </textPath>
            </text>
          </svg>
        </div>
      </div>
      <div>
        <Eyebrow>Wedding & event coordination</Eyebrow>
        <Heading>
          A steady hand, <em className="text-brand-gold">start to finish</em>
        </Heading>
        <p className="xp-reveal mt-6 max-w-xl text-lg opacity-85">
          Sunset Willow Event Planning partners with The Barn at Sunset Farm to
          give couples a stress-free, beautifully organized wedding — from full
          planning to a calm presence on the day itself.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.title} className="xp-reveal">
              <h3 className="font-serif text-2xl">{service.title}</h3>
              <p className="mt-1 text-sm opacity-70">{service.intro}</p>
              <ul className="mt-4 space-y-2">
                {service.items.map((item) => (
                  <li
                    key={item}
                    className="xp-list-item flex items-start gap-3 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-px w-4 shrink-0 bg-brand-gold"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="xp-reveal mt-10 text-sm opacity-80">
          <span className="font-semibold">Heather Tharp</span>, Event
          Coordinator ·{' '}
          <a
            href="tel:304-619-6805"
            className="underline-offset-4 hover:underline"
          >
            304-619-6805
          </a>{' '}
          ·{' '}
          <a
            href="mailto:sunsetwillowevents@gmail.com"
            className="underline-offset-4 hover:underline"
          >
            sunsetwillowevents@gmail.com
          </a>
        </p>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 9. The region: a photo grid that zooms into the New River Gorge.    */
/* ------------------------------------------------------------------ */

const region = [
  {
    src: PHOTOS.gorgeSunset,
    alt: 'A couple watching the sun set over the New River Gorge',
    label: 'New River Gorge National Park',
    place: 'h-[30vh] w-[28vw] md:h-[26vh] md:w-[24vw]',
    scale: 4.2,
  },
  {
    src: PHOTOS.gorgeBridge,
    alt: 'The New River Gorge Bridge',
    label: 'New River Gorge Bridge',
    place:
      'h-[22vh] w-[30vw] -translate-x-[95%] -translate-y-[120%] md:h-[24vh] md:w-[22vw] md:-translate-x-[118%] md:-translate-y-[78%]',
    scale: 5,
  },
  {
    src: PHOTOS.lake,
    alt: 'A lake surrounded by forest from above',
    label: 'Area lakes',
    place:
      'h-[18vh] w-[26vw] translate-x-[105%] -translate-y-[140%] md:h-[22vh] md:w-[18vw] md:translate-x-[150%] md:-translate-y-[60%]',
    scale: 6,
  },
  {
    src: PHOTOS.babcock,
    alt: 'The grist mill at Babcock State Park',
    label: 'Babcock State Park',
    place:
      'h-[20vh] w-[30vw] -translate-x-[90%] translate-y-[125%] md:h-[22vh] md:w-[20vw] md:-translate-x-[150%] md:translate-y-[70%]',
    scale: 5.5,
  },
  {
    src: PHOTOS.hawksNest,
    alt: 'Overlook at Hawks Nest State Park',
    label: 'Hawks Nest State Park',
    place:
      'h-[20vh] w-[28vw] translate-x-[100%] translate-y-[115%] md:h-[26vh] md:w-[24vw] md:translate-x-[112%] md:translate-y-[62%]',
    scale: 5,
  },
  {
    src: PHOTOS.lighthouse,
    alt: 'A lighthouse against autumn trees',
    label: 'Lakeside lighthouse',
    place:
      'hidden md:block md:h-[18vh] md:w-[13vw] md:translate-x-[20%] md:-translate-y-[195%]',
    scale: 7,
  },
  {
    src: PHOTOS.gorgeCliffs,
    alt: 'Sandstone cliffs above the gorge',
    label: 'Gorge overlooks',
    place:
      'hidden md:block md:h-[18vh] md:w-[15vw] md:-translate-x-[10%] md:translate-y-[195%]',
    scale: 7,
  },
] as const;

export const Region: React.FC = () => (
  <section
    id="explore"
    data-sky="dusk"
    className="xp-region relative h-svh min-h-[560px] overflow-hidden"
  >
    {region.map((item, index) => (
      <div
        key={item.label}
        data-scale={item.scale}
        className={`xp-region-item absolute inset-0 flex items-center justify-center ${
          index === 0 ? 'z-10' : ''
        } [.xp-reduced_&]:hidden`}
      >
        <figure
          className={`relative overflow-hidden rounded-xl shadow-2xl ${item.place}`}
        >
          <img
            {...pic(item.src, '(min-width: 768px) 50vw, 60vw')}
            alt={item.alt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white">
            {item.label}
          </figcaption>
        </figure>
      </div>
    ))}
    <img
      {...pic(PHOTOS.gorgeSunset, '100vw')}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 hidden h-full w-full object-cover [.xp-reduced_&]:block"
    />
    <div className="xp-region-copy absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 px-6 text-center text-white opacity-0 [.xp-reduced_&]:opacity-100">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
        Make a weekend of it
      </p>
      <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.02]">
        Minutes from the <em>New River Gorge</em>
      </h2>
      <p className="mt-6 max-w-xl text-white/85">
        State parks, lakes, overlooks and the famous bridge are all within easy
        reach — something for every guest between the rehearsal and the
        send-off.
      </p>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* 10. Night: questions, then the inquiry form.                        */
/* ------------------------------------------------------------------ */

export const Questions: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" data-sky="night" className="relative px-6 py-[16vh]">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Eyebrow>Good to know</Eyebrow>
          <Heading>Questions, answered</Heading>
        </div>
        <div className="mt-14 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div
                key={faq.question}
                className="xp-reveal overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`xp-faq-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-serif text-2xl"
                  >
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand-gold/60 text-brand-gold transition-transform duration-500 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`xp-faq-${index}`}
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <p className="overflow-hidden px-6 opacity-80">
                    <span className="block pb-6">{faq.answer}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Inquire: React.FC = () => (
  <section
    id="contact"
    data-sky="night"
    aria-labelledby="xp-inquire-title"
    className="relative px-4 py-[12vh] sm:px-6"
  >
    <div className="mx-auto grid max-w-6xl gap-12 rounded-[2rem] bg-[#fdf8f5] p-8 text-brand-charcoal shadow-2xl sm:p-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
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
