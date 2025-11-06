import React, { useState, useEffect, useRef } from 'react';
import { getAllStudioImages } from '../../nutshel/utils/imageStorage';
import { XIcon } from './ui/Icons';

interface RecentImage {
  seed: string;
  imageUrl: string;
  sourceApp: string;
  createdAt: number;
  metadata?: any;
}

interface ImageGroup {
  sourceApp: string;
  appName: string;
  images: RecentImage[];
}

interface ImportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (imageUrl: string, width: number, height: number) => void;
}

// Helper function to get app name
const getAppName = (sourceApp: string): string => {
  switch (sourceApp) {
    case 'product-photoshoots':
      return 'Product Photoshoots';
    case 'model-shoots':
      return 'Model Shoots';
    case 'clone-shoots':
      return 'Clone Shoots';
    case 'image-composer':
      return 'Image Composer';
    default:
      return 'Studio';
  }
};

const ImportImageModal: React.FC<ImportImageModalProps> = ({ isOpen, onClose, onImport }) => {
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadRecentImages = async () => {
      try {
        setIsLoading(true);
        const allImages = await getAllStudioImages();
        
        // Group images by sourceApp and sort by createdAt (newest first)
        const grouped: { [key: string]: RecentImage[] } = {};
        allImages.forEach((image) => {
          if (!grouped[image.sourceApp]) {
            grouped[image.sourceApp] = [];
          }
          grouped[image.sourceApp].push(image);
        });

        // Sort each group by createdAt (newest first) and take top 10
        const groups: ImageGroup[] = Object.entries(grouped)
          .map(([sourceApp, images]) => ({
            sourceApp,
            appName: getAppName(sourceApp),
            images: images
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 10)
          }))
          .filter(group => group.images.length > 0)
          .sort((a, b) => {
            // Sort groups by most recent image
            const aLatest = a.images[0]?.createdAt || 0;
            const bLatest = b.images[0]?.createdAt || 0;
            return bLatest - aLatest;
          });

        setImageGroups(groups);
      } catch (error) {
        console.error('Error loading recent images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentImages();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleImageClick = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      onImport(imageUrl, img.naturalWidth, img.naturalHeight);
      onClose();
    };
    img.onerror = () => {
      console.error('Failed to load image');
      alert('Failed to load image. Please try again.');
    };
    img.src = imageUrl;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-nutshel-gray rounded-2xl border border-white/10 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold">Import from Recent Generations</h2>
            <p className="text-gray-400 text-sm mt-1">Select an image to import to your canvas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-400">Loading recent generations...</div>
            </div>
          ) : imageGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg mb-2">No recent generations found</p>
              <p className="text-sm">Generate images using Nutshel Studios apps to see them here</p>
            </div>
          ) : (
            <div className="space-y-8">
              {imageGroups.map((group) => (
                <div key={group.sourceApp} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{group.appName}</h3>
                    <span className="text-sm text-gray-400">{group.images.length} image{group.images.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {group.images.map((image) => (
                      <div
                        key={image.seed}
                        className="aspect-square bg-black/20 rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-nutshel-blue transition-all"
                        onClick={() => handleImageClick(image.imageUrl)}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Generated from ${group.appName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportImageModal;

