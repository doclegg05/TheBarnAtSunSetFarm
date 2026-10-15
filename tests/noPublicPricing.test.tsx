import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import type { ComponentType } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';

// The venue does not advertise price: the owner and Heather negotiate it
// directly. Any dollar amount rendered on the home page breaks that rule.
const DOLLAR_AMOUNT = /\$\s?\d/;

const sections: Array<[string, ComponentType]> = [
  ['Hero', Hero],
  ['About', About],
  ['Pricing', Pricing],
  ['FAQ', FAQ],
];

describe('no public pricing', () => {
  afterEach(() => cleanup());

  it.each(sections)('%s renders no dollar amount', (_name, Section) => {
    const { container } = render(<Section />);
    expect(container.textContent ?? '').not.toMatch(DOLLAR_AMOUNT);
  });
});
