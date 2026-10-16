/**
 * Answers for the contact form's "How did you hear about us?" question.
 *
 * The owner uses these to see which channels actually bring in inquiries —
 * in particular, whether The Knot and WeddingWire still earn their keep.
 * Keep the wording stable: renaming an option splits its history in two.
 */
export const HEARD_ABOUT_OTHER = 'Other';

export const HEARD_ABOUT_OPTIONS = [
  'Google search',
  'Google Maps',
  'Facebook',
  'Instagram',
  'Pinterest',
  'The Knot',
  'WeddingWire',
  'Friend, family, or past guest',
  'Stayed with us (Airbnb / Vrbo)',
  'Drove by / local',
  'Wedding show or event',
  HEARD_ABOUT_OTHER,
] as const;
