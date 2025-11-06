import React from 'react';
import type { GeneratedImage } from '../types';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/Button';

interface GeneratedGalleryProps {
  images: GeneratedImage[];
  isLoading: boolean;
  loadingMessage: string;
  onImageClick: (index: number) => void;
  onStartNew: () => void;
}

export const GeneratedGallery: React.FC<GeneratedGalleryProps> = ({ images, isLoading, loadingMessage, onImageClick, onStartNew }) => {
  if (isLoading) {
    return (
      <section className="py-20 text-center">
        <div className="flex justify-center mb-4">
          <Spinner />
        </div>
        <h2 className="text-3xl font-bold mb-2 animate-pulse-slow text-brand-light">AI is creating your photoshoot...</h2>
        <p className="text-lg text-gray-400">{loadingMessage}</p>
      </section>
    );
  }

  if (images.length === 0) {
    return null; // Don't render anything if there are no images and not loading
  }

  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">Your AI-Generated Photoshoot</h2>
        <p className="text-lg text-gray-400 mt-2">Click on an image to view it in full screen, or start over.</p>
        <div className="mt-6">
            <Button onClick={onStartNew} variant="secondary">
                Start New Photoshoot
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((image, index) => (
          <div key={image.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <Card className="group" onClick={() => onImageClick(index)}>
              <img src={image.url} alt={`Generated image in ${image.pose.name} pose`} className="w-full h-auto object-cover aspect-[2/3]" />
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                <h4 className="text-lg font-bold text-white text-center mb-2">{image.pose.name}</h4>
                <div className="flex items-center text-white font-semibold">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                     <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.27 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                   </svg>
                   Click to View
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};