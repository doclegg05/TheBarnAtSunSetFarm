/**
 * The /experience design is split over three pages so the opening story
 * stays short and light: the story itself (the only page with the 3D
 * landscape), the wedding day and its planning, and lodging with the area
 * around the farm.
 */
export type ExperienceView = 'story' | 'day' | 'stay';

export const EXPERIENCE_PATHS: Readonly<Record<ExperienceView, string>> = {
  story: '/experience',
  day: '/experience/the-day',
  stay: '/experience/stay',
};

export const EXPERIENCE_TITLES: Readonly<Record<ExperienceView, string>> = {
  story: 'A day at the barn',
  day: 'Your wedding day',
  stay: 'Stay & explore',
};

export interface NavTarget {
  readonly label: string;
  readonly view: ExperienceView;
  /** The section on that page the link lands on. */
  readonly section: string;
}

export const NAV_TARGETS: readonly NavTarget[] = [
  { label: 'The barn', view: 'story', section: 'barn' },
  { label: 'The day', view: 'day', section: 'the-day' },
  { label: 'Packages', view: 'day', section: 'packages' },
  { label: 'Stay', view: 'stay', section: 'stay' },
  { label: 'FAQ', view: 'day', section: 'faq' },
];

/** The href for a target, as seen from the page `from`. */
export const navHref = (target: NavTarget, from: ExperienceView): string => {
  if (target.view === from) return `#${target.section}`;
  return `${EXPERIENCE_PATHS[target.view]}#${target.section}`;
};
