import React from 'react';
import { EXPERIENCE_AMENITIES, type Amenity } from './packageCopy';
import { PHOTOS, pic } from './photos';
import { Eyebrow, Heading } from './sections';

/*
 * The stay page (/experience/stay): amenities, lodging and the region
 * around the farm.
 */

/* ------------------------------------------------------------------ */
/* 5. Amenities on two marquees that speed up with your scroll.        */
/* ------------------------------------------------------------------ */

const MarqueeRow: React.FC<{
  items: readonly Amenity[];
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
              className="flex w-[78vw] shrink-0 items-center gap-5 rounded-full border border-current/15 bg-white/45 py-4 pl-4 pr-8 shadow-sm sm:w-auto"
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
      <MarqueeRow items={EXPERIENCE_AMENITIES.slice(0, 4)} direction={-1} />
      <MarqueeRow items={EXPERIENCE_AMENITIES.slice(4)} direction={1} />
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
          Up to 15 guests sleep on site: five bedrooms in the barn and a private
          cottage, for the wedding party or family from out of town.
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
        reach, with something for every guest between the rehearsal and the
        send-off.
      </p>
    </div>
  </section>
);
