/**
 * Guest testimonials for the homepage "Love Notes" section, which stays
 * hidden while this list is empty. TESTIMONIALS.md explains how to collect
 * them and what each field means.
 *
 * Only real words from real guests, with their written permission. The
 * section labels them as selected and links to the full Google reviews,
 * because the FTC review rule (16 CFR 465, in force since October 2024)
 * bars presenting hand-picked reviews as if they were all of them.
 */
export interface Testimonial {
  /** As the guests want to be named, e.g. "Sarah & James". */
  names: string;
  /** e.g. "Wedding", "Family reunion", "Elopement". */
  event: string;
  /** Month and year of the event, e.g. "June 2026". */
  date: string;
  /** Their own words — trimmed with "…" if needed, never reworded. */
  quote: string;
  /** Where the words came from, e.g. "Google review" or "Email to us". */
  source: string;
  /** Stars, only when quoting a real rated review (Google, The Knot). */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Must be true: we have their written OK to publish this. */
  permissionOnFile: true;
}

export const TESTIMONIALS: Testimonial[] = [];

/** The venue's main Google Business Profile listing, where every review lives. */
export const GOOGLE_REVIEWS_URL =
  'https://maps.google.com/?cid=15081211618553277720';
