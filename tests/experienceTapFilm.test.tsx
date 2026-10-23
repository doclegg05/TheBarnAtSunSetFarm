import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import TapFilm from '../components/experience/TapFilm';
import { cueAt, filmUrl } from '../components/experience/filmCues';

const film = {
  name: 'test-film',
  duration: 10,
  stills: ['first', 'last'],
} as const;
const cues = [
  { from: 0, to: 0.4 },
  { from: 0.5, to: 1 },
] as const;

let play: ReturnType<typeof vi.fn>;
beforeEach(() => {
  // jsdom has no media playback; play resolves at once, as on a tap.
  play = vi.fn(() => Promise.resolve());
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: play,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: () => {},
  });
});
afterEach(() => cleanup());

describe('cueAt', () => {
  it('finds the cue playing at a point in the film', () => {
    expect(cueAt(0.2, cues)).toBe(0);
    expect(cueAt(0.45, cues)).toBe(-1);
    expect(cueAt(0.7, cues)).toBe(1);
  });

  it('keeps a cue that runs to the end on the last frame', () => {
    expect(cueAt(1, cues)).toBe(1);
  });
});

describe('filmUrl', () => {
  it('points at the video and stills for a screen shape', () => {
    expect(filmUrl(film, 'portrait')).toBe('/films/test-film/portrait.mp4');
    expect(filmUrl(film, 'landscape', 'last')).toBe(
      '/films/test-film/last-landscape.avif'
    );
  });
});

const renderFilm = () =>
  render(
    <TapFilm
      film={film}
      cues={cues}
      alt="A test film"
      playLabel="Play the film"
    >
      {({ phase, cue, skip }) => (
        <>
          <p data-testid="phase">{phase}</p>
          <p data-testid="cue">{cue}</p>
          <button type="button" onClick={skip}>
            Skip the film
          </button>
        </>
      )}
    </TapFilm>
  );

describe('tap-to-play film', () => {
  it('waits for a tap before playing', () => {
    renderFilm();
    expect(screen.getByTestId('phase').textContent).toBe('ready');
    expect(play).not.toHaveBeenCalled();
  });

  it('plays on a tap and holds the last frame when it ends', async () => {
    const { container } = renderFilm();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Play the film' }));
    });
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('phase').textContent).toBe('playing');

    const video = container.querySelector('video')!;
    act(() => {
      fireEvent(video, new Event('ended'));
    });
    expect(screen.getByTestId('phase').textContent).toBe('ended');
    expect(screen.getByTestId('cue').textContent).toBe('1');
  });

  it('skips straight to the last frame without playing', () => {
    renderFilm();
    fireEvent.click(screen.getByRole('button', { name: 'Skip the film' }));
    expect(screen.getByTestId('phase').textContent).toBe('ended');
    expect(play).not.toHaveBeenCalled();
  });

  it('plays without sound and inline, as phones require', () => {
    const { container } = renderFilm();
    const video = container.querySelector('video')!;
    expect(video.muted).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
  });
});
