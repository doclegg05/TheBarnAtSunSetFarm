import { describe, expect, it } from 'vitest';
import {
  APPLE_MAPS_DIRECTIONS_URL,
  ARRIVAL_INSTRUCTIONS,
  GOOGLE_MAPS_DIRECTIONS_URL,
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_PIN_URL,
  VENUE_COORDINATES,
} from '../lib/venueLocation';

describe('venue location', () => {
  it('pins the barn near Mount Nebo, WV (guards lat/lng swaps and sign errors)', () => {
    expect(VENUE_COORDINATES.latitude).toBeGreaterThan(38.18);
    expect(VENUE_COORDINATES.latitude).toBeLessThan(38.2);
    expect(VENUE_COORDINATES.longitude).toBeGreaterThan(-80.9);
    expect(VENUE_COORDINATES.longitude).toBeLessThan(-80.88);
  });

  it('builds every map URL from coordinates, never from a street address', () => {
    const coords = `${VENUE_COORDINATES.latitude},${VENUE_COORDINATES.longitude}`;
    for (const url of [
      GOOGLE_MAPS_DIRECTIONS_URL,
      APPLE_MAPS_DIRECTIONS_URL,
      GOOGLE_MAPS_PIN_URL,
      GOOGLE_MAPS_EMBED_URL,
    ]) {
      expect(url).toContain(coords);
      // Address-based queries geocode to the wrong spot for this rural road.
      expect(url.toLowerCase()).not.toContain('boulder');
      expect(url.toLowerCase()).not.toContain('harper');
    }
  });

  it('uses the universal Google Maps directions API format', () => {
    expect(GOOGLE_MAPS_DIRECTIONS_URL).toMatch(
      /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/
    );
  });

  it('uses the Apple Maps destination format', () => {
    expect(APPLE_MAPS_DIRECTIONS_URL).toMatch(
      /^https:\/\/maps\.apple\.com\/\?daddr=/
    );
  });

  it('embed URL renders an embeddable map', () => {
    expect(GOOGLE_MAPS_EMBED_URL).toContain('output=embed');
  });

  it('publishes the gravel-road arrival guidance', () => {
    const joined = ARRIVAL_INSTRUCTIONS.join(' ');
    expect(joined).toContain('Rivers Edge');
    expect(joined).toContain('Marley Ln');
    expect(joined).toContain('Harper Ln');
  });
});
