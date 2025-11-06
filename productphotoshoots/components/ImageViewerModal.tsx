
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { XIcon } from './icons/XIcon';
import { ZoomableImage } from './ZoomableImage';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev
}) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  }, [imageSrc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && canGoNext) onNext();
      if (e.key === 'ArrowLeft' && canGoPrev) onPrev();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev, canGoNext, canGoPrev]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {/* Image Display */}
        <div 
          className="relative max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
          style={{ aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`}}
        >
          <ZoomableImage
            src={imageSrc}
            alt="Full screen product view"
          />
        </div>


        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/50 rounded-full"
          aria-label="Close image viewer"
        >
          <XIcon className="w-8 h-8" />
        </button>

        {/* Prev Button */}
        {canGoPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/50 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-10 h-10" />
          </button>
        )}

        {/* Next Button */}
        {canGoNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/50 rounded-full"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-10 h-10" />
          </button>
        )}
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};