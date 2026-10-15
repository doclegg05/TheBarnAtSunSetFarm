/**
 * Single source of truth for the venue's physical location.
 *
 * The barn is a new build at 86 Harper Ln — that address is not yet in any
 * geocoding database, so navigation apps can't find it. "19 Boulder Trail"
 * is only the nearest mailbox address, and Google routes it into the Rivers
 * Edge housing development instead of the farm. Every map link and embed
 * must therefore target the exact GPS coordinates below rather than a
 * street-address query.
 */
export const VENUE_NAME = 'The Barn at Sunset Farm';

// Matches the official pin the owner placed on the Google Business listing
// (2026-07-20). If the listing pin ever moves, update these to match.
export const VENUE_COORDINATES = {
  latitude: 38.1904268,
  longitude: -80.8917911,
} as const;

export const VENUE_ADDRESS = {
  street: '86 Harper Ln',
  locality: 'Mount Nebo',
  region: 'West Virginia',
  regionCode: 'WV',
  postalCode: '26679',
} as const;

const coordinatePair = `${VENUE_COORDINATES.latitude},${VENUE_COORDINATES.longitude}`;

/** Cross-platform directions link — opens the Google Maps app on phones. */
export const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${coordinatePair}`;

/** Directions for guests whose default navigation is Apple Maps. */
export const APPLE_MAPS_DIRECTIONS_URL = `https://maps.apple.com/?daddr=${coordinatePair}`;

/** Pin link (no navigation) — used for "view on Google Maps" overlays. */
export const GOOGLE_MAPS_PIN_URL = `https://www.google.com/maps/search/?api=1&query=${coordinatePair}`;

/** Pin-accurate embed for on-page maps. */
export const GOOGLE_MAPS_EMBED_URL = `https://maps.google.com/maps?q=${coordinatePair}&z=15&hl=en&output=embed`;

/**
 * Last-mile guidance published by the venue — the final gravel stretch is
 * unmapped, so GPS alone can strand guests at the wrong entrance.
 */
export const ARRIVAL_INSTRUCTIONS: readonly string[] = [
  'Follow the directions link to our GPS pin — you will arrive on Old Boley Rd.',
  'Do not turn into the Rivers Edge housing development off Old Boley Rd.',
  'Where the pavement ends, continue straight onto the gravel road.',
  'Bear right onto Marley Ln, then after about 100 yards bear right onto Harper Ln.',
  'The barn is straight ahead.',
];
