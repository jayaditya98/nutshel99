
import React, { useState, useEffect } from 'react';
import type { GeneratedImage } from '../types';
import { XIcon } from './icons/XIcon';
import { ZoomableImage } from './ZoomableImage';
import { dataUrlToBlob, downloadImage } from '../utils/fileUtils';
import { ShareIcon } from './icons/ShareIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, image, showToast }) => {
  const [canUseShareApi, setCanUseShareApi] = useState(false);

  useEffect(() => {
    // Check if the navigator.share API is supported by the browser.
    if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
      setCanUseShareApi(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const handleShare = async () => {
    try {
      const blob = await dataUrlToBlob(image.src);
      const file = new File([blob], image.name, { type: blob.type });

      if (canUseShareApi && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'AI Product Photoshoot',
          text: `Check out this image I generated for ${image.name.split('_')[0]}.`,
        });
        onClose();
      } else {
        showToast("Web Share isn't supported for files on this browser.", 'error');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled the share sheet, not an actual error.
        console.log('Share action was cancelled by the user.');
      } else {
        console.error('Error sharing image:', error);
        showToast('Failed to share image.', 'error');
      }
    }
  };

  const handleCopy = async () => {
    try {
      const blob = await dataUrlToBlob(image.src);
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      showToast('Image copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying image:', error);
      showToast('Could not copy image to clipboard.', 'error');
    }
  };

  const handleDownload = () => {
    downloadImage(image.src, image.name);
    showToast('Download started!', 'success');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="share-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-nutshel-gray rounded-2xl w-full max-w-3xl m-4 p-6 border border-white/10 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 id="share-modal-title" className="text-3xl font-bold text-white">Share Image</h2>
            <p className="text-gray-400 mt-1 text-lg">Share your creation with the world.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square border border-white/10 rounded-xl">
            <ZoomableImage src={image.src} alt="Image to share" />
          </div>
          <div className="flex flex-col justify-center items-center space-y-4 p-4">
            {canUseShareApi ? (
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold text-black bg-nutshel-blue rounded-full hover:opacity-90 transition-opacity"
              >
                <ShareIcon className="w-6 h-6" />
                <span>Share via...</span>
              </button>
            ) : (
              <p className="text-sm text-gray-400 text-center pb-2">
                Your browser doesn't support native sharing. Use an option below instead.
              </p>
            )}
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ClipboardIcon className="w-5 h-5" />
              <span>Copy Image</span>
            </button>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
