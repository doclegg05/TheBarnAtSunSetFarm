import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { Inside } from '../components/experience/sections';
import { HALL_PHOTOS } from '../components/experience/insidePhotos';

beforeEach(() => {
  // jsdom has no media playback.
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn(() => Promise.resolve()),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: () => {},
  });
});
afterEach(() => cleanup());

const endFilm = async (container: HTMLElement) => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Step inside' }));
  });
  act(() => {
    fireEvent(container.querySelector('video')!, new Event('ended'));
  });
};

describe('the walk inside', () => {
  it('keeps the real photos back until the film ends', async () => {
    const { container } = render(<Inside />);
    const [first] = HALL_PHOTOS;
    expect(screen.queryByRole('button', { name: first.label })).toBeNull();

    await endFilm(container);
    for (const photo of HALL_PHOTOS) {
      expect(screen.getByRole('button', { name: photo.label })).toBeTruthy();
    }
  });

  it('opens a photo large and closes it again', async () => {
    const { container } = render(<Inside />);
    await endFilm(container);
    const [first] = HALL_PHOTOS;
    fireEvent.click(screen.getByRole('button', { name: first.label }));

    const dialog = screen.getByRole('dialog', { name: first.label });
    expect(dialog.querySelector('img')?.getAttribute('alt')).toBe(first.alt);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('puts the photos away again when the film replays', async () => {
    const { container } = render(<Inside />);
    await endFilm(container);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Watch again' }));
    });
    expect(
      screen.queryByRole('button', { name: HALL_PHOTOS[0].label })
    ).toBeNull();
  });
});
