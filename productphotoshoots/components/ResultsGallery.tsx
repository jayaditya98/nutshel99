
import React from 'react';
import type { GeneratedImage } from '../types';
import { downloadImage, downloadAllAsZip } from '../utils/fileUtils';
import { DownloadIcon } from './icons/DownloadIcon';
import { ZipIcon } from './icons/ZipIcon';
import { EditIcon } from './icons/EditIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShareIcon } from './icons/ShareIcon';

interface ResultsGalleryProps {
  images: GeneratedImage[];
  onEditImage: (index: number) => void;
  onGenerateVariation: (index: number) => void;
  generatingVariations: Record<number, boolean>;
  onOpenImageViewer: (index: number) => void;
  onShareImage: (index: number) => void;
  productName: string;
  projectId?: number;
  projectName?: string;
  onSaveToProject?: () => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ 
    images, 
    onEditImage, 
    onGenerateVariation, 
    generatingVariations,
    onOpenImageViewer,
    onShareImage,
    productName,
    projectId,
    projectName,
    onSaveToProject
}) => {

  // Helper function to handle clicks on action buttons without triggering the image viewer
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="w-full mt-16">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl sm:text-5xl font-bold text-center sm:text-left bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Results</h2>
        <div className="flex items-center gap-3">
            {onSaveToProject && (
              <button
                  onClick={onSaveToProject}
                  className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-nutshel-accent rounded-full hover:opacity-90 transition-opacity"
                  title={projectName ? `Save to ${projectName}` : 'Save to Project'}
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Save to Project
              </button>
            )}
            <button
                onClick={() => downloadAllAsZip(images, productName)}
                className="flex items-center gap-2 px-5 py-2 font-semibold text-black bg-nutshel-blue rounded-full hover:opacity-90 transition-opacity"
            >
                <ZipIcon className="w-5 h-5" />
                Download All ({images.length})
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {images.map((image, index) => (
          <div 
            key={index} 
            onClick={() => onOpenImageViewer(index)}
            className="relative group aspect-square bg-nutshel-gray rounded-xl overflow-hidden border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-zoom-in"
            aria-label="View larger image"
          >
            <img 
              src={image.src} 
              alt={`Generated product shot ${index + 1}`} 
              className={`w-full h-full object-contain transition-all duration-300 ${generatingVariations[index] ? 'opacity-20' : 'group-hover:opacity-60'}`} 
              loading="lazy"
              decoding="async"
            />
            
            {generatingVariations[index] && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30">
                    <div className="w-10 h-10 border-2 border-nutshel-blue rounded-full animate-spin border-t-transparent"></div>
                    <p className="text-sm font-semibold mt-2 text-gray-400">
                        Creating variation...
                    </p>
                 </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center flex-wrap gap-2 p-2 z-20">
                 <div className="relative group/tooltip flex items-center">
                    <button
                        onClick={(e) => handleActionClick(e, () => onShareImage(index))}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-white hover:text-black text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue transition-colors"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        Share
                    </div>
                </div>
                <div className="relative group/tooltip flex items-center">
                    <button
                        onClick={(e) => handleActionClick(e, () => onGenerateVariation(index))}
                        disabled={generatingVariations[index]}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-white hover:text-black text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5" />
                    </button>
                     <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        Generate Variation
                    </div>
                </div>
                <div className="relative group/tooltip flex items-center">
                    <button
                        onClick={(e) => handleActionClick(e, () => onEditImage(index))}
                        disabled={generatingVariations[index]}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-white hover:text-black text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue disabled:opacity-50 transition-colors"
                    >
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        Edit Image
                    </div>
                </div>
                <div className="relative group/tooltip flex items-center">
                    <button
                        onClick={(e) => handleActionClick(e, () => downloadImage(image.src, image.name))}
                        disabled={generatingVariations[index]}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-white hover:text-black text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue disabled:opacity-50 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        Download Image
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};