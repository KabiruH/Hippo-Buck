'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageLightbox from './Image-lightbox';

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: RoomGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {/* Main Image - Clickable */}
        <div 
          className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer group shadow-lg"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={`${roomName} - Main View`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay hint on hover */}
          <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/50 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {images.slice(1, 5).map((image, imgIndex) => (
            <div
              key={imgIndex}
              className="relative h-20 md:h-24 rounded overflow-hidden group cursor-pointer shadow-sm"
              onClick={() => openLightbox(imgIndex + 1)}
            >
              <Image
                src={image}
                alt={`${roomName} - View ${imgIndex + 2}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/50 transition-colors duration-300 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        roomName={roomName}
      />
    </>
  );
}