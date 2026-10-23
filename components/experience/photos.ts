import type { ResponsiveImage } from '../../scripts/responsiveImages';
// Real venue photos. `?responsive` re-encodes each at a few widths
// (scripts/responsiveImages.ts) so phones download far smaller files.
import dresses from '/photos/gallery/weddings/Dresses_hanging_from_barn.1.webp?responsive';
import loft from '/photos/gallery/weddings/Barn.1.webp?responsive';
import boots from '/photos/gallery/weddings/Wedding_decorations.2.webp?responsive';
import aisle from '/photos/gallery/weddings/Wedding.8.webp?responsive';
import vows from '/photos/gallery/weddings/Wedding_Ceremony.1.webp?responsive';
import porchTables from '/photos/gallery/weddings/Wedding_Design-4.webp?responsive';
import greatRoom from '/photos/gallery/weddings/Wedding_decorations.15.webp?responsive';
import cake from '/photos/gallery/weddings/Wedding_decorations.1.webp?responsive';
import centerpiece from '/photos/gallery/weddings/Center_Piece.webp?responsive';
import couplePorch from '/photos/gallery/weddings/Bride and Groom_Porch_1.webp?responsive';
import coupleDoors from '/photos/gallery/weddings/Bride and Groom_1.webp?responsive';
import ceremonySetup from '/photos/gallery/weddings/Wedding_setup.1.webp?responsive';
import porchSunset from '/photos/carousel/Carosel Outdoor Wedding 1.webp?responsive';
import tableSunset from '/photos/gallery/weddings/Outdoor Wedding 2.webp?responsive';
import barnDusk from '/photos/carousel/Carosel Barn 4.webp?responsive';
import barnFront from '/photos/carousel/Carosel Barn 3.webp?responsive';
import barnPorch from '/photos/gallery/barn/Barn 1.webp?responsive';
import kitchen from '/photos/gallery/barn/Barn 4.webp?responsive';
import livingRoom from '/photos/gallery/barn/Barn 14.webp?responsive';
import porchView from '/photos/gallery/barn/Barn 8.webp?responsive';
import bedroom from '/photos/gallery/barn/Bedroom 3.webp?responsive';
import cottage from '/photos/gallery/barn/Cabin 6.webp?responsive';
import firePit from '/photos/gallery/barn/Fire Pit.webp?responsive';
import gorgeSunset from '/photos/gallery/surrounding/New River Gorge National Park 1.webp?responsive';
import gorgeBridge from '/photos/gallery/surrounding/New River Gorge Bridge 1.webp?responsive';
import gorgeCliffs from '/photos/gallery/surrounding/New River Gorge National Park 2.webp?responsive';
import babcock from '/photos/gallery/surrounding/Babcock State Park 1.webp?responsive';
import hawksNest from '/photos/gallery/surrounding/Hawksnest State Park 1.webp?responsive';
import lake from '/photos/gallery/surrounding/Lake 2.webp?responsive';
import lighthouse from '/photos/gallery/surrounding/Lighthouse 1.webp?responsive';
// The public/photos original with its black letterbox bars trimmed off.
import heroBarn from '/photos/experience/hero-barn-sunset.webp?responsive';
// Brand watercolour (design/images, "Meadow Edge"): grasses on a clear ground.
import meadow from '/photos/brand/meadow-edge.webp?responsive';

export const PHOTOS = {
  dresses,
  loft,
  boots,
  aisle,
  vows,
  porchTables,
  greatRoom,
  cake,
  centerpiece,
  couplePorch,
  coupleDoors,
  ceremonySetup,
  porchSunset,
  tableSunset,
  barnDusk,
  barnFront,
  barnPorch,
  kitchen,
  livingRoom,
  porchView,
  bedroom,
  cottage,
  firePit,
  gorgeSunset,
  gorgeBridge,
  gorgeCliffs,
  babcock,
  hawksNest,
  lake,
  lighthouse,
  heroBarn,
  meadow,
} as const;

/** Served from public/ as-is. */
export const LOGO = '/photos/sunset-willow-logo.webp';

/** The <img> attributes for a responsive photo at a given display size. */
export const pic = (image: ResponsiveImage, sizes: string) => ({
  src: image.src,
  srcSet: image.srcSet,
  sizes,
});
