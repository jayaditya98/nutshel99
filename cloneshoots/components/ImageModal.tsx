import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon } from './icons/Icons';

interface ImageModalProps {
  src: string;
  onClose: () => void;
}

const modalRoot = document.getElementById('modal-root');

export const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  if (!modalRoot) return null;

  // Effect to handle Escape key press and prevent body scrolling
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

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50"
        aria-label="Close image view"
      >
        <CloseIcon className="w-8 h-8" />
      </button>
      <div 
        className="relative max-w-full max-h-full" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
      >
        <img
          src={src}
          alt="Full screen preview"
          className="block max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};
