import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from '../components/Header';

const scroll = vi.fn();
const renderPage = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/gallery" element={<Header />} />
        <Route
          path="/"
          element={
            <>
              <Header />
              <section id="home" />
              <section id="contact">Inquiry form</section>
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  scroll.mockClear();
  Element.prototype.scrollIntoView = scroll;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Header inquiry navigation', () => {
  it('removes availability navigation on desktop and mobile', () => {
    renderPage('/');
    expect(screen.queryByRole('button', { name: 'Availability' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.queryByRole('button', { name: 'Availability' })).toBeNull();
  });

  it('scrolls to contact after returning from an interior page', () => {
    renderPage('/gallery');
    fireEvent.click(screen.getByRole('button', { name: 'Contact' }));
    expect(screen.getByText('Inquiry form')).toBeTruthy();
    expect(scroll.mock.instances.at(-1)).toBe(
      document.getElementById('contact')
    );
  });

  it('redirects an old calendar anchor to the inquiry form', () => {
    renderPage('/#calendar');
    expect(scroll.mock.instances.at(-1)).toBe(
      document.getElementById('contact')
    );
  });

  it('returns to the top when the site name is clicked on the homepage', () => {
    renderPage('/');
    fireEvent.click(screen.getByRole('button', { name: 'Go to home page' }));
    expect(scroll.mock.instances.at(-1)).toBe(document.getElementById('home'));
  });
});
