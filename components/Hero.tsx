import React from 'react';
import Gallery from './Gallery';
import { Photo } from '../types';

// Optimized image URLs for faster loading. Reduced quality slightly (q=75) to improve load speed.
const venuePhotos: Photo[] = [
  { id: 1, url: '/photos/carousel/554859432_17843941959581636_1922670440829880078_n.jpg', alt: 'Wedding Setup' },
  { id: 2, url: '/photos/carousel/555659780_24579290471766013_154526886136814725_n.jpg', alt: 'Scenic View' },
  { id: 3, url: '/photos/carousel/555732493_17843947656581636_7216313080117116988_n.jpg', alt: 'Celebration Moment' },
  { id: 4, url: '/photos/carousel/564760941_17847031491581636_4657080208668798040_n.jpg', alt: 'Interior Detail' },
  { id: 5, url: '/photos/carousel/571698558_17849317746581636_883082292931479919_n.jpg', alt: 'Event Highlight' },
  { id: 6, url: '/photos/carousel/572241396_17850427008581636_5317694953211561273_n.jpg', alt: 'Rustic Charm' },
  { id: 7, url: '/photos/carousel/581055459_17851410018581636_1679243285675442589_n.jpg', alt: 'Evening Atmosphere' },
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
    <section id="home" className="relative h-screen w-full overflow-hidden bg-gray-900">
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
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight drop-shadow-xl shadow-black pointer-events-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Crafting Your Forever Story
        </h2>
        <p className="mt-4 text-base md:text-xl max-w-2xl mx-auto font-light drop-shadow-md pointer-events-auto" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Experience the magic of a lifetime at The Barn at Sunset Farm, where rustic charm meets timeless elegance.
        </p>
      </div>
    </section>
  );
};

export default Hero;