import React from 'react';
import { PHOTOS, pic } from './photos';

interface MeadowProps {
  className?: string;
}

/** The brand's watercolour meadow: grasses and wildflowers along an edge. */
const Meadow: React.FC<MeadowProps> = ({ className = '' }) => (
  <img
    {...pic(PHOTOS.meadow, '100vw')}
    alt=""
    aria-hidden="true"
    loading="lazy"
    className={`pointer-events-none w-full select-none ${className}`}
  />
);

export default Meadow;
