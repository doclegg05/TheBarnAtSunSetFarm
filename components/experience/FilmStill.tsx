import React from 'react';
import { frameUrl, type Film } from './film';

interface FilmStillProps {
  film: Film;
  index: number;
  alt: string;
  className: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * One frame of a scroll film as a plain image: the poster shown before the
 * film loads and instead of it when motion is reduced. Screens held upright
 * get the upright slice; landscape screens a frame as wide as they need.
 */
const FilmStill: React.FC<FilmStillProps> = ({ film, index, ...image }) => {
  const at = (size: 'md' | 'lg' | 'xl') => frameUrl(film, size, index);
  return (
    <picture>
      <source
        media="(orientation: portrait)"
        srcSet={frameUrl(film, 'pt', index)}
      />
      <img
        src={at('md')}
        srcSet={`${at('md')} 1024w, ${at('lg')} 1920w, ${at('xl')} 2560w`}
        sizes="100vw"
        {...image}
      />
    </picture>
  );
};

export default FilmStill;
