import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExperiencePage from '../components/experience/ExperiencePage';
import {
  EXPERIENCE_PATHS,
  type ExperienceView,
} from '../components/experience/views';
import { SKIES, mixSky, skyAt } from '../components/experience/sky';

afterEach(() => cleanup());

describe('experience page sky', () => {
  it('holds the first time of day until the next section rises into view', () => {
    const sky = skyAt(
      [
        { sky: 'dawn', top: -400 },
        { sky: 'night', top: 900 },
      ],
      800
    );
    expect(sky).toEqual(SKIES.dawn);
  });

  it('hands the sky to a section once it is 40% of the way up the screen', () => {
    const sky = skyAt(
      [
        { sky: 'dawn', top: -2000 },
        { sky: 'night', top: 320 },
      ],
      800
    );
    expect(sky.top).toEqual(SKIES.night.top);
    expect(sky.ink).toEqual(SKIES.night.ink);
  });

  it('keeps the text colour on one side of the change for most of a blend', () => {
    expect(mixSky(SKIES.sunset, SKIES.dusk, 0.25).ink).toEqual(
      SKIES.sunset.ink
    );
    expect(mixSky(SKIES.sunset, SKIES.dusk, 0.75).ink).toEqual(SKIES.dusk.ink);
  });
});

const VIEWS: readonly ExperienceView[] = ['story', 'day', 'stay'];

const renderView = (view: ExperienceView) =>
  render(
    <MemoryRouter>
      <ExperiencePage view={view} />
    </MemoryRouter>
  );

describe.each(VIEWS)('experience %s page content', (view) => {
  // Same rule as the home page: the venue does not advertise price.
  it('renders no dollar amount', () => {
    const { container } = renderView(view);
    expect(container.textContent ?? '').not.toMatch(/\$\s?\d/);
  });

  it('gives every in-page link a section to land on', () => {
    const { container } = renderView(view);
    const targets = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
      (link) => link.getAttribute('href')!.slice(1)
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const id of new Set(targets)) {
      expect(container.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it('gives every link to another experience page a section to land on', () => {
    const { container } = renderView(view);
    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="/experience"]'),
      (link) => link.getAttribute('href')!
    );
    for (const href of new Set(links)) {
      const [path, hash] = href.split('#');
      const target = VIEWS.find((other) => EXPERIENCE_PATHS[other] === path);
      expect(target, href).toBeDefined();
      if (!hash) continue;
      cleanup();
      const { container: other } = renderView(target!);
      expect(other.querySelector(`#${hash}`), href).not.toBeNull();
      cleanup();
      renderView(view);
    }
  });

  it('includes the inquiry form', () => {
    const { container } = renderView(view);
    expect(container.querySelector('#contact form')).not.toBeNull();
  });
});

describe('experience story page', () => {
  it('leaves the planning and lodging detail to their own pages', () => {
    const { container } = renderView('story');
    for (const id of ['the-day', 'stay', 'packages', 'planning', 'faq']) {
      expect(container.querySelector(`#${id}`), id).toBeNull();
    }
  });

  it('points visitors to the day and stay pages', () => {
    const { container } = renderView('story');
    const hrefs = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('#next a'),
      (link) => link.getAttribute('href')
    );
    expect(hrefs).toContain(EXPERIENCE_PATHS.day);
    expect(hrefs).toContain(EXPERIENCE_PATHS.stay);
  });
});

describe('experience page soundscape', () => {
  it('plays birds by morning, music at golden hour and crickets at night', async () => {
    const { layerLevels } = await import('../components/experience/soundscape');
    const morning = layerLevels(SKIES.morning);
    const sunset = layerLevels(SKIES.sunset);
    const night = layerLevels(SKIES.night);
    expect(morning.birds).toBeGreaterThan(morning.music);
    expect(sunset.music).toBeGreaterThan(sunset.birds);
    expect(night).toEqual({ birds: 0, music: 0, crickets: 1 });
  });
});
