import React from 'react';
import Gallery from './Gallery';
import { Photo } from '../types';

// Optimized image URLs for faster loading. Reduced quality slightly (q=75) to improve load speed.
const venuePhotos: Photo[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1519225468359-6963297d2bdb?q=75&w=1600&auto=format&fit=crop', alt: 'The Barn at Sunset Farm exterior setup' },
  { id: 2, url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=75&w=1600&auto=format&fit=crop', alt: 'Elegant wedding reception with string lights' },
  { id: 3, url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=75&w=1600&auto=format&fit=crop', alt: 'Bride and groom in the golden fields' },
  { id: 4, url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=75&w=1600&auto=format&fit=crop', alt: 'Beautiful table setting details' },
  { id: 5, url: 'https://images.unsplash.com/photo-1475724017904-b712052c192a?q=75&w=1600&auto=format&fit=crop', alt: 'Sunset over the rolling hills' },
];

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Full Screen Gallery */}
      <div className="absolute inset-0 w-full h-full">
        <Gallery photos={venuePhotos} />
      </div>
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight drop-shadow-xl shadow-black" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Crafting Your Forever Story
        </h2>
        <p className="mt-4 text-base md:text-xl max-w-2xl mx-auto font-light drop-shadow-md" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Experience the magic of a lifetime at The Barn at Sunset Farm, where rustic charm meets timeless elegance.
        </p>
      </div>
    </section>
  );
};

export default Hero;