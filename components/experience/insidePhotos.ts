import type { ResponsiveImage } from '../../scripts/responsiveImages';
import { PHOTOS } from './photos';

/*
 * Real photos of the rooms the walk inside passes through, shown once the
 * film ends. None of them is a photo the drone film's pins already open, so
 * the story page never shows the same picture twice.
 */

export interface HallPhoto {
  label: string;
  image: ResponsiveImage;
  alt: string;
}

/** In the order of the walk: the hall, then out to the porch. */
export const HALL_PHOTOS: readonly HallPhoto[] = [
  {
    label: 'The hall, set for dinner',
    image: PHOTOS.hallTables,
    alt: 'Round tables with greenery runners set for a reception in the knotty pine hall',
  },
  {
    label: 'The cake table',
    image: PHOTOS.cake,
    alt: 'A white tiered wedding cake against the knotty pine wall under a "Happily Ever After" sign',
  },
  {
    label: 'Long tables on the porch',
    image: PHOTOS.porchLongTables,
    alt: 'Long tables laid with plates and blue runners along the covered porch',
  },
  {
    label: 'The porch at sunset',
    image: PHOTOS.tableSunset,
    alt: 'Reception tables on the covered porch as the sun sets over the hills',
  },
];
