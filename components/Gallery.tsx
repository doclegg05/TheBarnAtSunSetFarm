import React, { useState, useEffect, useCallback } from 'react';
import { Photo } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface GalleryProps {
  photos: Photo[];
}

const Gallery: React.FC<GalleryProps> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (photos.length === 0) return;
      setCurrentIndex((prevIndex) =>
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    },
    [photos.length]
  );

  const prevSlide = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (photos.length === 0) return;
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? photos.length - 1 : prevIndex - 1
      );
    },
    [photos.length]
  );

  useEffect(() => {
    const slideInterval = setInterval(() => nextSlide(), 6000); // Slightly slower interval for a more relaxed pace
    return () => clearInterval(slideInterval);
  }, [nextSlide, currentIndex]); // Reset timer when slide changes (auto or manual)

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900 group">
      {/* Main Slider */}
      <div className="relative h-full w-full">
        {photos.length > 0 ? (
          photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {/* 
                Refined Image Display:
                1. object-cover: Fills the screen completely (immersive).
                2. object-[center_35%]: Centers the image horizontally, but focuses slightly above center vertically. 
                   This is critical for wedding photos to ensure heads/faces aren't cropped out on landscape screens.
                3. scale animation: Adds a subtle 'breathing' effect to make the image feel alive.
              */}
              <img
                src={photo.url}
                alt={photo.alt}
                className={`w-full h-full object-cover object-[center_35%] transform transition-transform duration-[10000ms] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                decoding="async"
              />

              {/* Subtle gradient overlay to ensure text readability is always maintained without overpowering the image */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>No photos available.</p>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-300 z-20 cursor-pointer backdrop-blur-[2px]"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-300 z-20 cursor-pointer backdrop-blur-[2px]"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 cursor-pointer shadow-sm ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
