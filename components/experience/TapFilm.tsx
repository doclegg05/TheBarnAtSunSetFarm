import React from 'react';
import {
  cueAt,
  filmUrl,
  screenShape,
  type Cue,
  type FilmData,
} from './filmCues';

export type FilmPhase = 'ready' | 'playing' | 'ended';

export interface FilmState {
  phase: FilmPhase;
  /** The cue showing now, or -1. */
  cue: number;
  play: () => void;
  skip: () => void;
}

interface TapFilmProps {
  film: FilmData;
  cues: readonly Cue[];
  /** Describes the film for screen readers. */
  alt: string;
  /** The play button's words. */
  playLabel: string;
  /** Positions the play button. */
  playClassName?: string;
  /** The overlays: captions, the ending, skip and replay controls. */
  children: (state: FilmState) => React.ReactNode;
}

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Rewinds and plays: the one place the player drives the video element. */
const playFromStart = (video: HTMLVideoElement): Promise<void> => {
  video.currentTime = 0;
  return video.play();
};

/** Follows the playing film and reports the cue showing, frame by frame. */
const useCueTracking = (
  video: HTMLVideoElement | null,
  phase: FilmPhase,
  cues: readonly Cue[],
  duration: number,
  setCue: (cue: number) => void
) => {
  React.useEffect(() => {
    if (phase !== 'playing') return;
    let frame = 0;
    const tick = () => {
      if (video) {
        const length = video.duration || duration;
        setCue(cueAt(video.currentTime / length, cues));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [video, phase, cues, duration, setCue]);
};

/**
 * A film that plays on a tap, as real video: the browser decodes it in
 * hardware at a steady 24 frames a second, so it never depends on how the
 * visitor scrolls. It waits on its first frame, and holds its last frame
 * once it ends or is skipped. Visitors who ask for reduced motion start on
 * the last frame and can still choose to watch.
 */
const TapFilm: React.FC<TapFilmProps> = ({
  film,
  cues,
  alt,
  playLabel,
  playClassName = 'absolute inset-x-0 bottom-[16vh] z-20 flex justify-center',
  children,
}) => {
  // The element is kept in state, not a ref, so the controls handed to
  // the overlays can use it without reading a ref during render.
  const [video, setVideo] = React.useState<HTMLVideoElement | null>(null);
  const [shape] = React.useState(screenShape);
  const [phase, setPhase] = React.useState<FilmPhase>(() =>
    prefersReducedMotion() ? 'ended' : 'ready'
  );
  const [playingCue, setCue] = React.useState(-1);
  useCueTracking(video, phase, cues, film.duration, setCue);
  // The ending's cue comes from the phase, so a tracking frame that lands
  // after the film ends cannot replace it.
  const cue = phase === 'ended' ? cueAt(1, cues) : playingCue;

  const end = React.useCallback(() => setPhase('ended'), []);

  const play = React.useCallback(() => {
    if (!video) return;
    setCue(-1);
    setPhase('playing');
    // A browser that refuses to play shows the ending instead.
    playFromStart(video).catch(end);
  }, [video, end]);

  const skip = React.useCallback(() => {
    video?.pause();
    end();
  }, [video, end]);

  return (
    <>
      <video
        ref={setVideo}
        src={filmUrl(film, shape)}
        poster={filmUrl(film, shape, 'first')}
        aria-label={alt}
        muted
        playsInline
        preload="metadata"
        onEnded={end}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {phase === 'ended' && (
        <img
          src={filmUrl(film, shape, 'last')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {phase === 'ready' && (
        <div className={playClassName}>
          <button
            type="button"
            onClick={play}
            className="group flex items-center gap-4 rounded-full bg-black/45 py-2 pl-2 pr-6 text-white shadow-xl transition-colors hover:bg-black/60"
          >
            <span
              aria-hidden="true"
              className="grid h-12 w-12 place-items-center rounded-full bg-brand-cream text-brand-barn-black transition-transform group-hover:scale-105"
            >
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-5 w-5"
                fill="currentColor"
              >
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">
              {playLabel}
            </span>
          </button>
        </div>
      )}
      {children({ phase, cue, play, skip })}
    </>
  );
};

export default TapFilm;
