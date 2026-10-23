import { PACKAGE_TIERS, type PackageTier } from '../../lib/siteContent';
import { AMENITIES } from '../amenityList';

/*
 * The experience pages' wording for copy shared with the classic home page.
 * The classic site keeps its own text until the owner decides which design
 * stays, so these are rewrites by name rather than edits to the shared
 * lists: sentence case, plain words, nothing that reads like software
 * pricing.
 */

interface PackageWording {
  description: string;
  features: readonly string[];
}

const PACKAGE_WORDING: Readonly<Record<string, PackageWording>> = {
  'Classic Celebration': {
    description: 'One day at the barn, the porch and the grounds.',
    features: [
      'Open availability',
      'Up to 200 guests',
      'All-day rental',
      'The whole barn and the grounds',
      'Optional: one night in the guest cabin',
    ],
  },
  'The Sunset Weekend': {
    description: 'Two nights, Friday to Sunday.',
    features: [
      'Friday to Sunday access',
      'Up to 200 guests',
      'Tables and chairs included',
      'Space for the rehearsal dinner',
      "The bridal suite and the groom's quarters",
      'An overnight stay for the couple',
      'Priority vendor access',
      'Everything in the Classic Celebration',
      'More amenities on request',
    ],
  },
};

/** The packages as the experience pages word them. */
export const EXPERIENCE_PACKAGES: readonly PackageTier[] = PACKAGE_TIERS.map(
  (tier) => ({ ...tier, ...PACKAGE_WORDING[tier.name] })
);

const AMENITY_TITLES: Readonly<Record<string, string>> = {
  'Handicap Accessible': 'Wheelchair accessible',
};

export type Amenity = Omit<(typeof AMENITIES)[number], 'title'> & {
  title: string;
};

/** The amenities as the experience pages word them. */
export const EXPERIENCE_AMENITIES: readonly Amenity[] = AMENITIES.map(
  (amenity) => ({
    ...amenity,
    title: AMENITY_TITLES[amenity.title] ?? amenity.title,
  })
);
