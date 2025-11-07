import React from 'react';
import Gallery from './Gallery';
import { Photo } from '../types';

const stockPhotos: Photo[] = [
  { id: 1, url: 'https://picsum.photos/seed/wedding1/1920/1080', alt: 'Elegant barn wedding reception' },
  { id: 2, url: 'https://picsum.photos/seed/wedding2/1920/1080', alt: 'Bride and groom in a rustic field' },
  { id: 3, url: 'https://picsum.photos/seed/wedding3/1920/1080', alt: 'Cozy cottage exterior' },
  { id: 4, url: 'https://picsum.photos/seed/wedding4/1920/1080', alt: 'Outdoor wedding ceremony setup' },
  { id: 5, url: 'https://picsum.photos/seed/wedding5/1920/1080', alt: 'Close-up of wedding decorations' },
];

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-center text-white">
      <Gallery photos={stockPhotos} />
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 p-4">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Crafting Your Forever Story
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto font-light" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Experience the magic of a lifetime at The Barn at Sunset Farm, where rustic charm meets timeless elegance.
        </p>
      </div>
    </section>
  );
};

export default Hero;
