import React from 'react';
import CheckIcon from '../icons/CheckIcon';
import { FAQS } from '../../lib/siteContent';
import type { ResponsiveImage } from '../../scripts/responsiveImages';
import { EXPERIENCE_PACKAGES } from './packageCopy';
import { LOGO, PHOTOS, pic } from './photos';
import { scrollToId } from './scroll';
import { Eyebrow, Heading } from './sections';

/*
 * The wedding-day page (/experience/the-day): the day in chapters, the
 * packages, the planning service and the questions couples ask.
 */

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
      {EXPERIENCE_PACKAGES.map((tier, index) => (
        <div
          key={tier.name}
          className="xp-package"
          data-side={index === 0 ? -1 : 1}
        >
          <div className="xp-tilt relative flex h-full flex-col rounded-[2rem] bg-white/90 p-9 text-brand-charcoal shadow-2xl will-change-transform">
            <h3 className="font-serif text-4xl">{tier.name}</h3>
            <p className="mt-2 text-gray-600">{tier.description}</p>
            <ul className="mt-8 grow space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-brand-sage" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={scrollToId('contact')}
              className="xp-magnetic mt-10 block rounded-full bg-brand-deep-sage py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-cream transition-colors hover:bg-brand-barn-black"
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
          plan weddings here, from full planning to a calm hand on the day
          itself.
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
                className="xp-reveal overflow-hidden rounded-2xl border border-white/15 bg-white/10"
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
