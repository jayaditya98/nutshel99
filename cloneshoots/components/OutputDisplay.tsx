import React, { useState } from 'react';
import { DownloadIcon, ShareIcon } from './icons/Icons';
import { ImageModal } from './ImageModal';

interface OutputDisplayProps {
  outputImage: string | null;
  isLoading: boolean;
  error: string | null;
  projectId?: number;
  projectName?: string;
  onSaveToProject?: () => void;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ outputImage, isLoading, error, projectId, projectName, onSaveToProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleDownload = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    link.download = 'ai-fused-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!outputImage) return;
    try {
        const response = await fetch(outputImage);
        const blob = await response.blob();
        const file = new File([blob], 'ai-fused-image.png', { type: blob.type });

        if (navigator.share) {
            await navigator.share({
                title: 'AI Fused Image',
                text: 'Check out this image I created with AI Image Fusion!',
                files: [file],
            });
        } else {
            alert('Share API not supported in your browser. You can download the image instead.');
        }
    } catch (err) {
        console.error('Sharing failed:', err);
        alert('Could not share the image. Please try downloading it instead.');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-nutshel-blue"></div>
          <p className="mt-4 text-lg font-semibold text-white">Generating your masterpiece...</p>
          <p className="text-sm text-gray-400">This may take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold">Generation Failed</p>
          <p className="text-sm text-center max-w-md">{error}</p>
        </div>
      );
    }
    if (outputImage) {
      return (
        <>
            <div 
              className="relative group w-full h-full animate-fade-in cursor-pointer"
              onClick={openModal}
            >
                <img 
                    src={outputImage} 
                    alt="Generated output" 
                    className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                    {onSaveToProject && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveToProject();
                        }}
                        className="flex items-center gap-2 bg-nutshel-accent text-black font-semibold py-2 px-4 rounded-full hover:opacity-90 transition-opacity"
                        title={projectName ? `Save to ${projectName}` : 'Save to Project'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Save to Project
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                      }}
                      className="flex items-center gap-2 bg-white/10 text-white font-semibold py-2 px-4 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Download
                    </button>
                    {navigator.share && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare();
                          }}
                          className="flex items-center gap-2 bg-white/10 text-white font-semibold py-2 px-4 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5" />
                          Share
                        </button>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <ImageModal src={outputImage} onClose={closeModal} />
            )}
        </>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-300 text-center">Your generated image will appear here</h3>
        <p className="text-gray-400 text-center">Upload both images and click "Generate" to begin.</p>
      </div>
    );
  };

  return (
    <div className="bg-black/20 border border-white/10 p-4 rounded-2xl w-full h-full aspect-square flex items-center justify-center">
      {renderContent()}
    </div>
  );
};