/**
 * Copy shared by the classic home page and the /experience page, kept in one
 * place so the two never drift apart. No prices: the venue does not advertise
 * them (see tests/noPublicPricing.test.tsx).
 */

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: readonly Faq[] = [
  {
    question: 'What is the venue capacity?',
    answer:
      'We can comfortably accommodate up to 200 guests for both the ceremony and reception, ensuring an intimate and enjoyable experience for everyone.',
  },
  {
    question: 'Can we bring our own vendors?',
    answer:
      'We have a curated list of preferred vendors we love and trust, but you are welcome to bring your own licensed and insured professionals for catering, photography, and florals.',
  },
  {
    question: 'Is there parking on-site?',
    answer: 'Yes, we have ample parking available for all your guests.',
  },
  {
    question: 'Do you require event insurance?',
    answer:
      'Yes, we require a standard event insurance policy for the day of your wedding. This protects both you and the venue and is a standard practice in the industry.',
  },
];

export interface PackageTier {
  name: string;
  description: string;
  features: readonly string[];
  highlight: boolean;
}

export const PACKAGE_TIERS: readonly PackageTier[] = [
  {
    name: 'Classic Celebration',
    description: '1 Day Wedding. Use of the Barn/Porch/Outside Area.',
    features: [
      'Open Availability',
      'Up to 200 guests',
      'All day rental',
      'Full Barn & Outdoor access',
      'Optional: 1 Night at Guest Cabin',
    ],
    highlight: false,
  },
  {
    name: 'The Sunset Weekend',
    description: '2 nights. The ultimate experience.',
    features: [
      'Friday - Sunday access',
      'Up to 200 guests',
      'Tables and Chairs included',
      'Rehearsal Dinner space',
      "Bridal Suite & Groom's Quarters",
      'Overnight stay for the couple',
      'Priority vendor access',
      'All amenities from Classic package',
      'Additional Amenities Available',
    ],
    highlight: true,
  },
];
