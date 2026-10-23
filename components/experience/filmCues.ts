/*
 * The films on the /experience page play on a tap (TapFilm.tsx). These are
 * the pure parts: which cue (a caption, a line) is showing at a point in a
 * film, and where a film's video and stills live (scripts/filmVideos.mjs).
 */

export type FilmShape = 'landscape' | 'portrait';
export type FilmStill = 'first' | 'last';

export interface FilmData {
  readonly name: string;
  /** Seconds. */
  readonly duration: number;
}

/** A stretch of a film, as shares of its length from 0 to 1. */
export interface Cue {
  readonly from: number;
  readonly to: number;
}

/**
 * The cue showing at `progress` (0 to 1), or -1 between cues. A cue that
 * runs to the end stays up on the last frame.
 */
export const cueAt = (progress: number, cues: readonly Cue[]): number =>
  cues.findIndex(
    ({ from, to }) =>
      progress >= from && (progress < to || (to >= 1 && progress >= 1))
  );

/** A film's video for a screen shape, or one of its stills. */
export const filmUrl = (
  film: FilmData,
  shape: FilmShape,
  still?: FilmStill
): string =>
  still
    ? `/films/${film.name}/${still}-${shape}.avif`
    : `/films/${film.name}/${shape}.mp4`;

/** Screens held upright get the upright cut of each film. */
export const screenShape = (): FilmShape =>
  window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
