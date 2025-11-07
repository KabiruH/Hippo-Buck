'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
}

export default function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  roomName,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
        aria-label="Close"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </Button>

      {/* Previous Button */}
      <Button
        onClick={handlePrevious}
        variant="ghost"
        size="icon"
        className="absolute left-2 md:left-4 z-10 text-white hover:bg-white/20 h-12 w-12 md:h-16 md:w-16"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
      </Button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
          <Image
            src={images[currentIndex]}
            alt={`${roomName} - Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 90vw"
          />
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={handleNext}
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-4 z-10 text-white hover:bg-white/20 h-12 w-12 md:h-16 md:w-16"
        aria-label="Next image"
      >
        <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
      </Button>

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
        <p className="text-white text-sm md:text-base">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Thumbnail Navigation - Desktop Only */}
      <div className="hidden md:flex absolute bottom-16 left-1/2 -translate-x-1/2 z-10 gap-2 max-w-5xl overflow-x-auto px-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded overflow-hidden transition-all ${
              index === currentIndex
                ? 'ring-2 ring-amber-500 opacity-100'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Touch/Swipe Area for Mobile */}
      <div
        className="absolute inset-0 md:hidden"
        onTouchStart={(e) => {
          const touchStart = e.touches[0].clientX;
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const touchEnd = endEvent.changedTouches[0].clientX;
            const diff = touchStart - touchEnd;
            
            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                handleNext();
              } else {
                handlePrevious();
              }
            }
            
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchend', handleTouchEnd);
        }}
      />
    </div>
  );
}