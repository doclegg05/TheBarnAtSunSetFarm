import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Testimonials from '../components/Testimonials';
import {
  GOOGLE_REVIEWS_URL,
  TESTIMONIALS,
  Testimonial,
} from '../lib/testimonials';

afterEach(() => cleanup());

// Test fixtures only — never real guests.
const emailed: Testimonial = {
  names: 'Test Couple A',
  event: 'Wedding',
  date: 'June 2026',
  quote: 'Fixture quote from an email.',
  source: 'Email to us',
  permissionOnFile: true,
};

const reviewed: Testimonial = {
  names: 'Test Couple B',
  event: 'Family reunion',
  date: 'August 2026',
  quote: 'Fixture quote from a rated review.',
  source: 'Google review',
  rating: 5,
  permissionOnFile: true,
};

describe('Love Notes testimonials', () => {
  it('stays hidden while there are no testimonials', () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows each quote with names, event, date and source', () => {
    render(<Testimonials testimonials={[emailed]} />);
    expect(screen.getByText(/Fixture quote from an email\./)).toBeTruthy();
    expect(screen.getByText('Test Couple A')).toBeTruthy();
    expect(screen.getByText(/Wedding · June 2026/)).toBeTruthy();
    expect(screen.getByText('Email to us')).toBeTruthy();
  });

  it('shows stars only for quotes taken from a rated review', () => {
    render(<Testimonials testimonials={[emailed, reviewed]} />);
    const ratings = screen.getAllByRole('img', { name: /out of 5/ });
    expect(ratings).toHaveLength(1);
    expect(ratings[0].getAttribute('aria-label')).toBe('Rated 5 out of 5');
  });

  it('labels the quotes as selected and links to every Google review', () => {
    render(<Testimonials testimonials={[emailed]} />);
    expect(screen.getByText(/Selected testimonials/)).toBeTruthy();
    const link = screen.getByRole('link', {
      name: 'Read all our reviews on Google',
    }) as HTMLAnchorElement;
    expect(link.href).toBe(GOOGLE_REVIEWS_URL);
  });

  it('only publishes complete, permission-cleared entries', () => {
    for (const entry of TESTIMONIALS) {
      expect(entry.permissionOnFile).toBe(true);
      for (const field of [
        'names',
        'event',
        'date',
        'quote',
        'source',
      ] as const) {
        expect(entry[field].trim()).not.toBe('');
      }
    }
  });
});
