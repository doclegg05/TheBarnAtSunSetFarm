import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import XMarkIcon from './icons/XMarkIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { photosFromFolder } from '../lib/photoFolders';

// Each section shows every image found in its folder — add or remove
// files there and the gallery updates automatically.
const barnPhotos = photosFromFolder(
  import.meta.glob('/photos/gallery/barn/*', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

const weddingPhotos = photosFromFolder(
  import.meta.glob('/photos/gallery/weddings/*', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

const otherEventPhotos = photosFromFolder(
  import.meta.glob('/photos/gallery/other-events/*', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

const surroundingPhotos = photosFromFolder(
  import.meta.glob('/photos/gallery/surrounding/*', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

const sections = [
  { title: 'The Barn & Grounds', photos: barnPhotos },
  { title: 'Weddings & Celebrations', photos: weddingPhotos },
  { title: 'Other Events', photos: otherEventPhotos },
  { title: 'Surrounding Area', photos: surroundingPhotos },
];

const allPhotos = sections.flatMap((section) => section.photos);

// The lightbox indexes into allPhotos, so each section's tiles are
// offset by the number of photos in the sections before it.
const sectionOffsets = sections.map((_, index) =>
  sections
    .slice(0, index)
    .reduce((total, section) => total + section.photos.length, 0)
);

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

  const goToNext = () => {
    setSelectedPhotoIndex((prev) =>
      prev === null ? prev : prev === allPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrev = () => {
    setSelectedPhotoIndex((prev) =>
      prev === null ? prev : prev === 0 ? allPhotos.length - 1 : prev - 1
    );
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNext();
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrev();
  };

  // Keyboard support while the lightbox is open.
  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex]);

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

          {sections.map((section, sectionIndex) => {
            const offset = sectionOffsets[sectionIndex];

            return (
              <div key={section.title} className="mb-12">
                <div className="flex items-center justify-center mb-8">
                  <h2
                    className="text-3xl font-bold text-[#4a4a4a]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {section.title}
                  </h2>
                  <div className="ml-4 h-px bg-[#EAD1DC] w-24"></div>
                </div>
                {section.photos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.photos.map((photo, index) => (
                      <div
                        key={photo.url}
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-md cursor-pointer"
                        onClick={() => openLightbox(offset + index)}
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
                      Photos coming soon...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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
            aria-label="Close photo viewer"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2"
            onClick={prevPhoto}
            aria-label="Previous photo"
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
            aria-label="Next photo"
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
