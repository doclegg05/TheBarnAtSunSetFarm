import React, { useState } from 'react';
import { Photo } from '../types';
import Header from './Header';
import Footer from './Footer';
import XMarkIcon from './icons/XMarkIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

// Reusing photos from Hero.tsx for now, plus more for the grid
const galleryPhotos: Photo[] = [
  { id: 1, url: '/photos/gallery/554776877_17844129915581636_4772702611147383898_n.jpg', alt: 'Gallery Image 1' },
  { id: 2, url: '/photos/gallery/554811363_17844129897581636_1173150047932271451_n.jpg', alt: 'Gallery Image 2' },
  { id: 3, url: '/photos/gallery/554859432_17843941959581636_1922670440829880078_n.jpg', alt: 'Gallery Image 3' },
  { id: 4, url: '/photos/gallery/554967703_17843941932581636_2207741614559766379_n.jpg', alt: 'Gallery Image 4' },
  { id: 5, url: '/photos/gallery/555353442_17844129888581636_9065261012694462792_n.jpg', alt: 'Gallery Image 5' },
  { id: 6, url: '/photos/gallery/555529069_17844131238581636_8276592574337105814_n.jpg', alt: 'Gallery Image 6' },
  { id: 7, url: '/photos/gallery/555675309_17844129906581636_8469726544023182048_n.jpg', alt: 'Gallery Image 7' },
  { id: 8, url: '/photos/gallery/556225631_24579278641767196_1550527612094572014_n.jpg', alt: 'Gallery Image 8' },
  { id: 9, url: '/photos/gallery/556417814_17844131214581636_2888744871867747881_n.jpg', alt: 'Gallery Image 9' },
  { id: 10, url: '/photos/gallery/556704560_17844131223581636_5047059223244871933_n.jpg', alt: 'Gallery Image 10' },
  { id: 11, url: '/photos/gallery/556736595_17844131250581636_2867864846048970807_n.jpg', alt: 'Gallery Image 11' },
  { id: 12, url: '/photos/gallery/556814070_17844129852581636_1619732996988947943_n.jpg', alt: 'Gallery Image 12' },
  { id: 13, url: '/photos/gallery/556835887_17844131205581636_9038033877817599686_n.jpg', alt: 'Gallery Image 13' },
  { id: 14, url: '/photos/gallery/556940506_17844129879581636_8954112487327534858_n.jpg', alt: 'Gallery Image 14' },
  { id: 15, url: '/photos/gallery/556974794_17844131265581636_2152568210786832382_n.jpg', alt: 'Gallery Image 15' },
  { id: 16, url: '/photos/gallery/557006285_17844129870581636_8722342343678553285_n.jpg', alt: 'Gallery Image 16' },
  { id: 17, url: '/photos/gallery/557064052_17844129801581636_3377932837812386289_n.jpg', alt: 'Gallery Image 17' },
  { id: 18, url: '/photos/gallery/557702632_17844790905581636_9022509360543714625_n.jpg', alt: 'Gallery Image 18' },
  { id: 19, url: '/photos/gallery/557847527_17844129861581636_6810991947877495382_n.jpg', alt: 'Gallery Image 19' },
  { id: 20, url: '/photos/gallery/564760941_17847031491581636_4657080208668798040_n.jpg', alt: 'Gallery Image 20' },
  { id: 21, url: '/photos/gallery/572241396_17850427008581636_5317694953211561273_n.jpg', alt: 'Gallery Image 21' },
  { id: 22, url: '/photos/gallery/572647165_17849853939581636_7729082671336363043_n.jpg', alt: 'Gallery Image 22' },
  { id: 23, url: '/photos/gallery/575680130_17851176579581636_6241060163251199730_n.jpg', alt: 'Gallery Image 23' },
  { id: 24, url: '/photos/gallery/581055459_17851410018581636_1679243285675442589_n.jpg', alt: 'Gallery Image 24' },
  { id: 25, url: '/photos/gallery/real-barn.jpg.jpg', alt: 'Gallery Image 25' },
  { id: 26, url: '/photos/gallery/real-cottage.jpg.jpg', alt: 'Gallery Image 26' },
  { id: 27, url: '/photos/gallery/IMG_5089.jpeg', alt: 'Gallery Image 27' },
  { id: 28, url: '/photos/gallery/IMG_5090.jpeg', alt: 'Gallery Image 28' },
  { id: 29, url: '/photos/gallery/IMG_5091.jpeg', alt: 'Gallery Image 29' },
  { id: 30, url: '/photos/gallery/IMG_5096.jpeg', alt: 'Gallery Image 30' },
  { id: 31, url: '/photos/gallery/IMG_5097.jpeg', alt: 'Gallery Image 31' },
  { id: 32, url: '/photos/gallery/IMG_5098.jpeg', alt: 'Gallery Image 32' },
  { id: 33, url: '/photos/gallery/IMG_5102.jpeg', alt: 'Gallery Image 33' },
];

const GalleryPage: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
    document.body.style.overflow = 'unset';
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : (prev as number) + 1));
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : (prev as number) - 1));
    }
  };

  return (
    <div className="bg-[#FDF8F5] min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#4a4a4a] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Our Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Explore the beauty and charm of The Barn at Sunset Farm. From our rustic interiors to the breathtaking landscape, see why couples choose us for their special day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPhotos.map((photo, index) => (
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
              src={galleryPhotos[selectedPhotoIndex].url}
              alt={galleryPhotos[selectedPhotoIndex].alt}
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
            {selectedPhotoIndex + 1} / {galleryPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
