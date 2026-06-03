import React from 'react';
import Gallery from './Gallery';
import { Photo } from '../types';

// Optimized image URLs for faster loading. Reduced quality slightly (q=75) to improve load speed.
const venuePhotos: Photo[] = [
  { id: 1, url: '/photos/carousel/Carosel Barn 1.webp', alt: 'Wedding Setup' },
  { id: 2, url: '/photos/carousel/Carosel Barn 2.webp', alt: 'Scenic View' },
  {
    id: 3,
    url: '/photos/carousel/Carosel Barn 3.webp',
    alt: 'Celebration Moment',
  },
  {
    id: 4,
    url: '/photos/carousel/Carosel Barn 4.webp',
    alt: 'Interior Detail',
  },
  {
    id: 5,
    url: '/photos/carousel/Carosel Barn 5.webp',
    alt: 'Event Highlight',
  },
  {
    id: 6,
    url: '/photos/carousel/Carosel Outdoor Wedding 1.webp',
    alt: 'Rustic Charm',
  },
  {
    id: 7,
    url: '/photos/carousel/Carosel Outdoor Wedding 2.webp',
    alt: 'Evening Atmosphere',
  },
];

const Hero: React.FC = () => {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden bg-gray-900"
    >
      {/* Full Screen Gallery with Parallax */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ transform: `translateY(${offset * 0.5}px)` }}
      >
        <Gallery photos={venuePhotos} />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"></div>

      {/* Hero Content - Parallax (slower) */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 pointer-events-none"
        style={{ transform: `translateY(${offset * 0.2}px)` }}
      >
        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-xl shadow-black pointer-events-auto"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          The Barn at Sunset Farm
        </h1>
        <h2
          className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-xl shadow-black pointer-events-auto mt-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Crafting Your Forever Story
        </h2>
        <p
          className="mt-4 text-base md:text-xl max-w-2xl mx-auto font-light drop-shadow-md pointer-events-auto"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          Experience the magic of a lifetime at The Barn at Sunset Farm, where
          rustic charm meets timeless elegance.
        </p>
      </div>
    </section>
  );
};

export default Hero;
