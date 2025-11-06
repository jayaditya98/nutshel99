import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DownloadIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/WorkspaceIcons';
import { AnimatedItem } from '../components/AnimatedItem';
import { getAllStudioImages } from '../utils/imageStorage';

const studios = [
  {
    title: 'Product Photoshoots',
    description: 'Generate professional, high-resolution product photos in any style or setting imaginable.',
    imageSeed: 'product_photography'
  },
  {
    title: 'Model Shoots',
    description: 'Create realistic model shoots with customizable models, poses, and apparel without a camera.',
    imageSeed: 'fashion_model'
  },
  {
    title: 'Clone Shoots',
    description: 'Transfer styles, poses, and compositions from one image to another with incredible accuracy.',
    imageSeed: 'style_transfer'
  },
  {
    title: 'Image Composer',
    description: 'Combine multiple elements, characters, and backgrounds to create entirely new, coherent scenes.',
    imageSeed: 'digital_composition'
  }
];

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

// Lightbox Modal Component
const ImageLightbox: React.FC<{
  images: RecentImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDownload: (image: RecentImage) => void;
  appName: string;
}> = ({ images, currentIndex, isOpen, onClose, onNavigate, onDownload, appName }) => {
  const currentImage = images[currentIndex];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      // Ensure html also has no margin/padding
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, [isOpen]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(images.length - 1); // Loop to last image
    }
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // Loop to first image
    }
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext]);

  if (!isOpen || !currentImage || images.length === 0) return null;

  const canGoPrevious = images.length > 1;
  const canGoNext = images.length > 1;

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/90 z-50 flex items-center justify-center m-0 p-0"
      style={{ margin: 0, padding: 0 }}
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Download button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(currentImage);
          }}
          className="absolute top-4 right-20 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
          aria-label="Download"
          title="Download image"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>

        {/* App name and image counter */}
        <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-white text-sm font-semibold">{appName}</p>
          {images.length > 1 && (
            <p className="text-white/80 text-xs mt-1">
              {currentIndex + 1} / {images.length}
            </p>
          )}
        </div>

        {/* Previous button */}
        {canGoPrevious && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            aria-label="Previous image"
            title="Previous image (←)"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        )}

        {/* Next button */}
        {canGoNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            aria-label="Next image"
            title="Next image (→)"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        )}

        {/* Image container - properly centered */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={currentImage.imageUrl}
            alt={`Generated from ${appName}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ maxWidth: 'calc(100vw - 8rem)', maxHeight: 'calc(100vh - 8rem)' }}
          />
        </div>
      </div>
    </div>
  );
};

const StudioCard: React.FC<{ title: string; description: string; imageSeed: string }> = ({ title, description, imageSeed }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-nutshel-gray rounded-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20 cursor-pointer overflow-hidden h-full">
      <div className="aspect-video relative bg-white/5">
        {isLoading && (
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
        )}
        <img
          src={`https://picsum.photos/seed/${imageSeed}/600/338`}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-base font-bold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

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

const NutshelStudios: React.FC = () => {
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImages, setLightboxImages] = useState<RecentImage[]>([]);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState<number>(0);
  const [lightboxAppName, setLightboxAppName] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleImageClick = (image: RecentImage, group: ImageGroup) => {
    // Find the index of the clicked image in its group
    const imageIndex = group.images.findIndex(img => img.seed === image.seed);
    setLightboxImages(group.images);
    setLightboxCurrentIndex(imageIndex >= 0 ? imageIndex : 0);
    setLightboxAppName(group.appName);
    setIsLightboxOpen(true);
  };

  const handleLightboxNavigate = (index: number) => {
    setLightboxCurrentIndex(index);
  };

  const handleLightboxClose = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setLightboxCurrentIndex(0);
  };

  const handleDownload = async (image: RecentImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutshel-${image.sourceApp}-${image.seed}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="space-y-2 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Nutshel Studios
        </h1>
        <p className="text-gray-300 text-lg">Your personal AI-powered photography studio. No camera required.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {studios.map((studio, index) => {
          let route = '/workspace/canvas';
          if (studio.title === 'Product Photoshoots') {
            route = '/workspace/product-photoshoots';
          } else if (studio.title === 'Model Shoots') {
            route = '/workspace/model-shoots';
          } else if (studio.title === 'Clone Shoots') {
            route = '/workspace/clone-shoots';
          } else if (studio.title === 'Image Composer') {
            route = '/workspace/image-composer';
          }
          return (
            <AnimatedItem key={studio.title} delay={index * 100}>
              <Link 
                to={route} 
                state={{ studioTitle: studio.title }}
              >
                <StudioCard title={studio.title} description={studio.description} imageSeed={studio.imageSeed} />
              </Link>
            </AnimatedItem>
          );
        })}
      </div>
      
      <section className="space-y-12">
        <header>
            <h2 className="text-3xl font-semibold">Recent generations</h2>
            <p className="text-gray-400 mt-1">Top 10 images from each studio app. Click any image to view it larger.</p>
        </header>
        
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(4)].map((_, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="h-8 w-48 bg-nutshel-gray rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="aspect-square bg-nutshel-gray rounded-lg animate-pulse border border-white/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : imageGroups.length > 0 ? (
          <div className="space-y-12">
            {imageGroups.map((group, groupIndex) => (
              <div key={group.sourceApp} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">{group.appName}</h3>
                  <span className="text-gray-400 text-sm">{group.images.length} image{group.images.length !== 1 ? 's' : ''}</span>
                </div>
                {group.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {group.images.map((image, index) => (
                      <AnimatedItem key={image.seed} delay={groupIndex * 100 + index * 50}>
                        <div 
                          className="relative aspect-square bg-nutshel-gray rounded-lg overflow-hidden group border border-white/10 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-white/20 cursor-pointer"
                          onClick={() => handleImageClick(image, group)}
                        >
                          <img 
                            src={image.imageUrl} 
                            alt={`Generated from ${group.appName}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image);
                              }}
                              className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                              title="Download image"
                              aria-label="Download image"
                            >
                              <DownloadIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </AnimatedItem>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 text-gray-400 bg-nutshel-gray rounded-2xl border border-dashed border-white/20">
            <p className="text-lg">No recent generations yet</p>
            <p className="text-sm mt-2">Start creating images in any of the studios above!</p>
          </div>
        )}
      </section>

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxCurrentIndex}
        isOpen={isLightboxOpen}
        onClose={handleLightboxClose}
        onNavigate={handleLightboxNavigate}
        onDownload={handleDownload}
        appName={lightboxAppName}
      />
    </div>
  );
};

export default NutshelStudios;

