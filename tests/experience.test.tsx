import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExperiencePage from '../components/experience/ExperiencePage';
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

describe('experience page content', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <ExperiencePage />
      </MemoryRouter>
    );

  // Same rule as the home page: the venue does not advertise price.
  it('renders no dollar amount', () => {
    const { container } = renderPage();
    expect(container.textContent ?? '').not.toMatch(/\$\s?\d/);
  });

  it('gives every in-page link a section to land on', () => {
    const { container } = renderPage();
    const targets = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
      (link) => link.getAttribute('href')!.slice(1)
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const id of new Set(targets)) {
      expect(container.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it('includes the inquiry form', () => {
    const { container } = renderPage();
    expect(container.querySelector('#contact form')).not.toBeNull();
  });
});
