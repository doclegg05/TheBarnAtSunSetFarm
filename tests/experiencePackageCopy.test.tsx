import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PACKAGE_TIERS } from '../lib/siteContent';
import {
  EXPERIENCE_AMENITIES,
  EXPERIENCE_PACKAGES,
} from '../components/experience/packageCopy';
import { Packages } from '../components/experience/daySections';
import { Amenities } from '../components/experience/staySections';

afterEach(() => cleanup());

describe('experience package wording', () => {
  it('rewords every shared package, so a renamed one cannot slip through', () => {
    EXPERIENCE_PACKAGES.forEach((tier, index) => {
      const shared = PACKAGE_TIERS[index];
      expect(tier.name).toBe(shared.name);
      expect(tier.description).not.toBe(shared.description);
      expect(tier.features).not.toEqual(shared.features);
    });
  });

  it('writes features in sentence case', () => {
    for (const tier of EXPERIENCE_PACKAGES) {
      for (const feature of tier.features) {
        // After the first word, capitals belong only to proper nouns: the
        // package names and the days of the week.
        const rest = feature
          .replace('Classic Celebration', '')
          .split(' ')
          .slice(1)
          .filter((word) => !/^(Friday|Saturday|Sunday)$/.test(word));
        expect(rest.filter((word) => /^[A-Z]/.test(word))).toEqual([]);
      }
    }
  });
});

describe('experience packages and amenities', () => {
  it('shows the packages side by side with no "most popular" badge', () => {
    render(<Packages />);
    expect(screen.queryByText(/most popular/i)).toBeNull();
    expect(
      screen.getAllByRole('link', { name: 'Request a quote' })
    ).toHaveLength(2);
  });

  it('uses current wording for access', () => {
    render(<Amenities />);
    expect(screen.queryAllByText(/handicap/i)).toHaveLength(0);
    expect(screen.getAllByText('Wheelchair accessible').length).toBeGreaterThan(
      0
    );
    expect(EXPERIENCE_AMENITIES).toHaveLength(7);
  });
});
