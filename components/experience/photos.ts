// Real venue photos, imported so Vite fingerprints and caches them.
import dresses from '/photos/gallery/weddings/Dresses_hanging_from_barn.1.webp';
import loft from '/photos/gallery/weddings/Barn.1.webp';
import boots from '/photos/gallery/weddings/Wedding_decorations.2.webp';
import aisle from '/photos/gallery/weddings/Wedding.8.webp';
import vows from '/photos/gallery/weddings/Wedding_Ceremony.1.webp';
import porchTables from '/photos/gallery/weddings/Wedding_Design-4.webp';
import greatRoom from '/photos/gallery/weddings/Wedding_decorations.15.webp';
import cake from '/photos/gallery/weddings/Wedding_decorations.1.webp';
import centerpiece from '/photos/gallery/weddings/Center_Piece.webp';
import couplePorch from '/photos/gallery/weddings/Bride and Groom_Porch_1.webp';
import coupleDoors from '/photos/gallery/weddings/Bride and Groom_1.webp';
import ceremonySetup from '/photos/gallery/weddings/Wedding_setup.1.webp';
import porchSunset from '/photos/carousel/Carosel Outdoor Wedding 1.webp';
import tableSunset from '/photos/gallery/weddings/Outdoor Wedding 2.webp';
import barnDusk from '/photos/carousel/Carosel Barn 4.webp';
import barnFront from '/photos/carousel/Carosel Barn 3.webp';
import barnPorch from '/photos/gallery/barn/Barn 1.webp';
import kitchen from '/photos/gallery/barn/Barn 4.webp';
import livingRoom from '/photos/gallery/barn/Barn 14.webp';
import porchView from '/photos/gallery/barn/Barn 8.webp';
import bedroom from '/photos/gallery/barn/Bedroom 3.webp';
import cottage from '/photos/gallery/barn/Cabin 6.webp';
import firePit from '/photos/gallery/barn/Fire Pit.webp';
import gorgeSunset from '/photos/gallery/surrounding/New River Gorge National Park 1.webp';
import gorgeBridge from '/photos/gallery/surrounding/New River Gorge Bridge 1.webp';
import gorgeCliffs from '/photos/gallery/surrounding/New River Gorge National Park 2.webp';
import babcock from '/photos/gallery/surrounding/Babcock State Park 1.webp';
import hawksNest from '/photos/gallery/surrounding/Hawksnest State Park 1.webp';
import lake from '/photos/gallery/surrounding/Lake 2.webp';
import lighthouse from '/photos/gallery/surrounding/Lighthouse 1.webp';
// The public/photos original with its black letterbox bars trimmed off.
import heroBarn from '/photos/experience/hero-barn-sunset.webp';

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
  // Served from public/ as-is.
  logo: '/photos/sunset-willow-logo.webp',
} as const;
