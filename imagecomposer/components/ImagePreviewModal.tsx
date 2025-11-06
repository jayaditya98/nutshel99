import React, { useEffect } from 'react';
import { XIcon } from './IconComponents';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  // Effect to handle Escape key press and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Stop propagation to prevent closing the modal when clicking on the image itself
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <img
        src={imageUrl}
        alt="Enlarged preview"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={handleImageClick}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close image preview"
      >
        <XIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
