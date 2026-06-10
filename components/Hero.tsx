import React from 'react';
import Gallery from './Gallery';
import { Photo } from '../types';

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

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const Hero: React.FC = () => {
  const backgroundRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Parallax via direct DOM transforms inside requestAnimationFrame so the
  // component never re-renders on scroll.
  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const offset = window.pageYOffset;
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translateY(${offset * 0.5}px)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${offset * 0.2}px)`;
      }
    };

    const handleScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden bg-gray-900"
    >
      {/* Full Screen Gallery with Parallax */}
      <div ref={backgroundRef} className="absolute inset-0 w-full h-full will-change-transform">
        <Gallery photos={venuePhotos} />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"></div>

      {/* Hero Content - Parallax (slower) */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 pointer-events-none will-change-transform"
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <button
            onClick={() => scrollToSection('calendar')}
            className="bg-[#A2B29F] text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-lg hover:bg-[#8c9a89] active:scale-95 transition-all duration-200"
          >
            Check Available Dates
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="bg-white/15 backdrop-blur-sm border border-white/70 text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-lg hover:bg-white/30 active:scale-95 transition-all duration-200"
          >
            Schedule a Tour
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
