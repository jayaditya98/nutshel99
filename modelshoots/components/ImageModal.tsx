import React, { useEffect } from 'react';
import type { GeneratedImage } from '../types';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

interface ImageModalProps {
  image: GeneratedImage;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const NavButton: React.FC<{onClick: (e: React.MouseEvent) => void; disabled: boolean; children: React.ReactNode; 'aria-label': string; className?: string}> = ({ onClick, disabled, children, 'aria-label': ariaLabel, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full h-12 w-12 flex items-center justify-center transition-all ${className}`}
  >
    {children}
  </button>
);

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onNext, onPrev, isFirst, isLast }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !isLast) onNext();
      if (e.key === 'ArrowLeft' && !isFirst) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, isFirst, isLast]);
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(image.url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${image.pose.name.replace(/\s+/g, '_').toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.share) {
      alert('Web Share API is not available on your browser.');
      return;
    }
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const file = new File([blob], `${image.pose.name.replace(/\s+/g, '_').toLowerCase()}.jpg`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `AI Photoshoot: ${image.pose.name}`,
          text: 'Check out this image I created with the AI Studio Photoshoot app!',
        });
      } else {
        alert("Your browser can't share files.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.error('Error sharing the image:', error);
      alert('An error occurred while trying to share the image.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div 
        className="relative w-full h-full max-w-5xl max-h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <Tooltip tip="Close (Esc)" position="left">
          <button
            onClick={onClose}
            aria-label="Close image viewer"
            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 flex items-center justify-center transition-all text-2xl font-bold z-30"
          >&times;</button>
        </Tooltip>
          
        {/* Image Container with Navigation */}
        <div className="relative flex-grow w-full min-h-0">
          <img 
            src={image.url} 
            alt={`Generated image: ${image.pose.name}`} 
            className="w-full h-full object-contain" 
          />
          
          <Tooltip tip="Previous (Left Arrow)" position="right" className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-20">
            <NavButton onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={isFirst} aria-label="Previous image">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </NavButton>
          </Tooltip>

          <Tooltip tip="Next (Right Arrow)" position="left" className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-20">
            <NavButton onClick={(e) => { e.stopPropagation(); onNext(); }} disabled={isLast} aria-label="Next image">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </NavButton>
          </Tooltip>
        </div>
        
        {/* Actions Container */}
        <div className="flex-shrink-0 w-full pt-4 pb-2 text-center text-white">
          <h3 id="image-modal-title" className="text-xl font-bold">{image.pose.name}</h3>
          <div className="mt-4 flex justify-center gap-2">
            <Tooltip tip="Download this image">
              <Button onClick={handleDownload}>
                Download Image
              </Button>
            </Tooltip>
            {navigator.share && (
              <Tooltip tip="Share this image">
                <Button onClick={handleShare} variant="secondary">
                  Share
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};