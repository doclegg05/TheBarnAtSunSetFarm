import React, { useState, useEffect, useCallback } from 'react';
import { Photo } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import XMarkIcon from './icons/XMarkIcon';
import PlusIcon from './icons/PlusIcon';

interface GalleryProps {
  photos: Photo[];
}

const Gallery: React.FC<GalleryProps> = ({ photos: initialPhotos }) => {
  // Use local state for photos to allow editing
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextSlide = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  }, [photos.length]);

  const prevSlide = () => {
    if (photos.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 6000); // Slightly slower interval for a more relaxed pace
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: Photo[] = (Array.from(e.target.files) as File[]).map((file) => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        alt: file.name,
      }));
      
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = (id: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      // Adjust current index if necessary
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

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
                loading={index === 0 ? "eager" : "lazy"}
              />
              
              {/* Subtle gradient overlay to ensure text readability is always maintained without overpowering the image */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>No photos available. Click 'Edit Photos' to add some.</p>
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

      {/* Edit Button */}
       <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-4 right-4 bg-[#D4AF37] bg-opacity-90 text-white text-xs md:text-sm py-2 px-3 md:px-4 rounded-md hover:bg-opacity-100 transition-opacity duration-300 z-30 cursor-pointer shadow-lg font-medium flex items-center gap-2 backdrop-blur-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Edit Photos
        </button>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800 font-serif">Manage Gallery</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#D4AF37] transition-colors">
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  <PlusIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Upload Photo</span>
                </label>

                {/* Photo Grid */}
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        title="Remove photo"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-lg">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-[#4a4a4a] text-white py-2 px-6 rounded-md hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;