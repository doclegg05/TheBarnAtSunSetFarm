import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPage from '../components/PrivacyPage';
import Footer from '../components/Footer';

afterEach(() => cleanup());

describe('Privacy notice', () => {
  it('discloses Google Analytics and links to Google’s explanation and opt-out', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Google Analytics/).length).toBeGreaterThan(0);
    expect(
      (
        screen.getByRole('link', {
          name: /how Google uses information/i,
        }) as HTMLAnchorElement
      ).href
    ).toBe('https://policies.google.com/technologies/partner-sites');
    expect(
      (
        screen.getByRole('link', {
          name: /opt-out browser add-on/i,
        }) as HTMLAnchorElement
      ).href
    ).toBe('https://tools.google.com/dlpage/gaoptout');
  });

  it('is linked from the footer on every page', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: 'Privacy Notice' }).getAttribute('href')
    ).toBe('/privacy');
  });
});
