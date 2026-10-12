import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

afterEach(() => {
  cleanup();
  delete window.gtag;
  vi.restoreAllMocks();
});

describe('Header directory links', () => {
  it('records a click to The Knot in Google Analytics before opening it', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open The Knot' }));

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'click',
      expect.objectContaining({
        link_domain: 'www.theknot.com',
        outbound: true,
      })
    );
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('theknot.com'),
      '_blank',
      'noopener,noreferrer'
    );
  });
});
