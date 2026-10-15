import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GalleryPage from '../components/GalleryPage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Gallery photo viewer', () => {
  it('opens a modal from a focusable tile and restores focus after Escape', () => {
    const show = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.showModal = show;
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    render(
      <MemoryRouter>
        <GalleryPage />
      </MemoryRouter>
    );
    const tile = screen.getAllByRole('button', { name: /^View / })[0];
    tile.focus();
    expect(document.activeElement).toBe(tile);
    fireEvent.click(tile);
    expect(show).toHaveBeenCalledOnce();
    const dialog = screen.getByRole('dialog', { name: 'Photo viewer' });
    expect(document.body.style.overflow).toBe('hidden');
    const firstPhoto = dialog.querySelector('img')!.src;
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(dialog.querySelector('img')!.src).not.toBe(firstPhoto);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(tile);
  });
});
