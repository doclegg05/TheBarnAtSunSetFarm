import React, { useEffect, useState } from 'react';
import { Photo } from '../types';
import Header from './Header';
import Footer from './Footer';
import XMarkIcon from './icons/XMarkIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

// Reusing photos from Hero.tsx for now, plus more for the grid
const barnPhotos: Photo[] = [
  { id: 1, url: '/photos/gallery/Barn 1.webp', alt: 'The Barn Exterior 1' },
  { id: 2, url: '/photos/gallery/Barn 2.webp', alt: 'The Barn Exterior 2' },
  { id: 3, url: '/photos/gallery/Barn 3.webp', alt: 'The Barn Exterior 3' },
  { id: 4, url: '/photos/gallery/Barn 4.webp', alt: 'The Barn Interior' },
  { id: 5, url: '/photos/gallery/Barn 5.webp', alt: 'Barn Detail' },
  { id: 6, url: '/photos/gallery/Barn 6.webp', alt: 'Barn Detail' },
  { id: 7, url: '/photos/gallery/Barn 7.webp', alt: 'Barn View' },
  { id: 8, url: '/photos/gallery/Barn 8.webp', alt: 'Barn View' },
  { id: 9, url: '/photos/gallery/Barn 9.webp', alt: 'Barn Night View' },
  { id: 10, url: '/photos/gallery/Barn 10.webp', alt: 'Barn Event Setup' },
  { id: 11, url: '/photos/gallery/Barn 11.webp', alt: 'Barn Interior' },
  { id: 12, url: '/photos/gallery/Barn 12.webp', alt: 'Barn Interior' },
  { id: 13, url: '/photos/gallery/Barn 13.webp', alt: 'Barn Interior' },
  { id: 14, url: '/photos/gallery/Barn 14.webp', alt: 'Barn Interior' },
  { id: 15, url: '/photos/gallery/Barn 16.webp', alt: 'Barn Wedding Setup' },
  { id: 16, url: '/photos/gallery/Barn 17.webp', alt: 'Barn Wedding Setup' },
  { id: 17, url: '/photos/gallery/Barn 18.jpg', alt: 'Barn Wedding Setup' },
  {
    id: 18,
    url: '/photos/gallery/Outdoor Wedding.webp',
    alt: 'Outdoor Wedding Ceremony',
  },
  {
    id: 19,
    url: '/photos/gallery/Outdoor Wedding 2.webp',
    alt: 'Outdoor Wedding Setup',
  },
  { id: 20, url: '/photos/gallery/Fire Pit.webp', alt: 'Fire Pit Area' },
  { id: 21, url: '/photos/gallery/Living Room 1.webp', alt: 'Living Room' },
  { id: 22, url: '/photos/gallery/Bedroom 1.webp', alt: 'Bedroom 1' },
  { id: 23, url: '/photos/gallery/Bedroom 2.webp', alt: 'Bedroom 2' },
  { id: 24, url: '/photos/gallery/Bedroom 3.webp', alt: 'Bedroom 3' },
  { id: 25, url: '/photos/gallery/Bedroom 4.webp', alt: 'Bedroom 4' },
  { id: 26, url: '/photos/gallery/Bedroom 5.webp', alt: 'Bedroom 5' },
  { id: 27, url: '/photos/gallery/Bedroom 6.webp', alt: 'Bedroom 6' },
  { id: 28, url: '/photos/gallery/Cabin 1.webp', alt: 'Cabin Exterior 1' },
  { id: 29, url: '/photos/gallery/Cabin 2.webp', alt: 'Cabin Exterior 2' },
  { id: 30, url: '/photos/gallery/Cabin 3.webp', alt: 'Cabin Interior' },
  { id: 31, url: '/photos/gallery/Cabin 4.webp', alt: 'Cabin Interior' },
  { id: 32, url: '/photos/gallery/Cabin 5.webp', alt: 'Cabin Bedroom' },
  { id: 33, url: '/photos/gallery/Cabin 6.webp', alt: 'Cabin Bedroom' },
  { id: 34, url: '/photos/gallery/Cabin 7.webp', alt: 'Cabin Bedroom' },
];

const weddingPhotos: Photo[] = [
  {
    id: 201,
    url: '/photos/gallery/Bride and Groom on Balcony 1.jpg',
    alt: 'Bride and groom on the balcony',
  },
  {
    id: 202,
    url: '/photos/gallery/Bride and Groom on Balcony 2.jpg',
    alt: 'Bride and groom on the balcony',
  },
  {
    id: 203,
    url: '/photos/gallery/Bride and Groom_1.jpg',
    alt: 'Bride and groom portrait',
  },
  {
    id: 204,
    url: '/photos/gallery/Bride and Groom_2.jpg',
    alt: 'Bride and groom portrait',
  },
  {
    id: 205,
    url: '/photos/gallery/Bride and Groom_Porch_1.jpg',
    alt: 'Bride and groom on the porch',
  },
  {
    id: 206,
    url: '/photos/gallery/Bride and Groom_Porch_2.jpg',
    alt: 'Bride and groom on the porch',
  },
  {
    id: 207,
    url: '/photos/gallery/Bride_and_Groom_Porch_3.jpg',
    alt: 'Bride and groom on the porch',
  },
  {
    id: 208,
    url: '/photos/gallery/Bride_Stairs.jpg',
    alt: 'Bride on the stairs',
  },
  {
    id: 209,
    url: '/photos/gallery/Center_Piece.JPG',
    alt: 'Wedding reception centerpiece',
  },
  {
    id: 210,
    url: '/photos/gallery/Friends_1.jpg',
    alt: 'Wedding party and friends',
  },
  {
    id: 211,
    url: '/photos/gallery/Friends_2.jpg',
    alt: 'Wedding party and friends',
  },
  {
    id: 212,
    url: '/photos/gallery/Friends_3.jpg',
    alt: 'Wedding party and friends',
  },
  {
    id: 213,
    url: '/photos/gallery/Friends_4.jpg',
    alt: 'Wedding party and friends',
  },
  {
    id: 214,
    url: '/photos/gallery/Friends_5.JPG',
    alt: 'Wedding party and friends',
  },
  {
    id: 215,
    url: '/photos/gallery/Friends_6.JPG',
    alt: 'Wedding party and friends',
  },
  {
    id: 216,
    url: '/photos/gallery/Friends_7.jpg',
    alt: 'Wedding party and friends',
  },
];

const surroundingPhotos: Photo[] = [
  {
    id: 101,
    url: '/photos/gallery/Babcock State Park 1.webp',
    alt: 'Babcock State Park',
  },
  {
    id: 102,
    url: '/photos/gallery/Hawksnest State Park 1.webp',
    alt: 'Hawksnest State Park',
  },
  { id: 103, url: '/photos/gallery/Lake 1.webp', alt: 'Summersville Lake' },
  { id: 104, url: '/photos/gallery/Lake 2.webp', alt: 'Summersville Lake' },
  { id: 105, url: '/photos/gallery/Lake 3.webp', alt: 'Summersville Lake' },
  { id: 106, url: '/photos/gallery/Lake 4.webp', alt: 'Summersville Lake' },
  {
    id: 107,
    url: '/photos/gallery/Lighthouse 1.webp',
    alt: 'Summersville Lake Lighthouse',
  },
  {
    id: 108,
    url: '/photos/gallery/New River Gorge Bridge 1.webp',
    alt: 'New River Gorge Bridge',
  },
  {
    id: 109,
    url: '/photos/gallery/New River Gorge National Park 1.webp',
    alt: 'New River Gorge National Park',
  },
  {
    id: 110,
    url: '/photos/gallery/New River Gorge National Park 2.webp',
    alt: 'New River Gorge National Park',
  },
];

const allPhotos = [...barnPhotos, ...weddingPhotos, ...surroundingPhotos];

const GalleryPage: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPhotoIndex]);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) =>
        prev === allPhotos.length - 1 ? 0 : (prev as number) + 1
      );
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) =>
        prev === 0 ? allPhotos.length - 1 : (prev as number) - 1
      );
    }
  };

  return (
    <div className="bg-[#FDF8F5] min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-5xl font-bold text-[#4a4a4a] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Our Gallery
            </h1>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              Explore the beauty and charm of The Barn at Sunset Farm. From our
              rustic interiors to the breathtaking landscape, see why couples
              choose us for their special day.
            </p>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <h2
                className="text-3xl font-bold text-[#4a4a4a]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                The Barn & Grounds
              </h2>
              <div className="ml-4 h-px bg-[#EAD1DC] w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barnPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-md cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-medium tracking-wider uppercase text-sm border border-white px-4 py-2">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <h2
                className="text-3xl font-bold text-[#4a4a4a]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Weddings & Celebrations
              </h2>
              <div className="ml-4 h-px bg-[#EAD1DC] w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddingPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-md cursor-pointer"
                  onClick={() => openLightbox(barnPhotos.length + index)}
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-medium tracking-wider uppercase text-sm border border-white px-4 py-2">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Surrounding Area Section */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <h2
                className="text-3xl font-bold text-[#4a4a4a]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Surrounding Area
              </h2>
              <div className="ml-4 h-px bg-[#EAD1DC] w-24"></div>
            </div>
            {surroundingPhotos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surroundingPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-md cursor-pointer"
                    // Offset the index by the number of barn photos
                    onClick={() =>
                      openLightbox(
                        barnPhotos.length + weddingPhotos.length + index
                      )
                    }
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium tracking-wider uppercase text-sm border border-white px-4 py-2">
                        View
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 italic">
                  Photos of the surrounding area coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            onClick={closeLightbox}
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2"
            onClick={prevPhoto}
          >
            <ChevronLeftIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <img
              loading="lazy"
              src={allPhotos[selectedPhotoIndex].url}
              alt={allPhotos[selectedPhotoIndex].alt}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2"
            onClick={nextPhoto}
          >
            <ChevronRightIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm md:text-base font-light tracking-wide">
            {selectedPhotoIndex + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
