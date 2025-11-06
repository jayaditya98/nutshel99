
import React, { useState, useEffect } from 'react';
import { PromptSuggestions } from './PromptSuggestions';
import { RevertIcon } from './icons/RevertIcon';
import { ZoomableImage } from './ZoomableImage';
import { SparklesIcon } from './icons/SparklesIcon';

const REFINE_SUGGESTIONS = [
  "Improve the lighting",
  "Add a soft shadow",
  "Make the colors more vibrant",
  "Change background to a neutral gray",
  "Place the product on a marble surface",
  "Add dramatic, moody lighting",
  "Create a minimalist composition",
  "Give it a cinematic feel",
  "Make the product stand out more",
  "Increase sharpness",
  "Reduce noise",
  "Correct color balance",
  "Enhance texture detail",
];

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImageSrc: string;
  currentImageSrc: string;
  onRefine: (prompt: string) => void;
  onRestore: () => void;
  isRefining: boolean;
  onGetSuggestions: () => void;
  suggestions: string[];
  isFetchingSuggestions: boolean;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, originalImageSrc, currentImageSrc, onRefine, onRestore, isRefining, onGetSuggestions, suggestions, isFetchingSuggestions }) => {
  const [prompt, setPrompt] = useState('');

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
      setPrompt(''); // Reset prompt on close
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
       document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onRefine(prompt);
      setPrompt('');
    }
  };
  
  const handleSuggestionSelect = (suggestion: string) => {
      const newPrompt = prompt ? `${prompt}, ${suggestion}` : suggestion;
      setPrompt(newPrompt);
  }

  const hasBeenEdited = originalImageSrc !== currentImageSrc;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="modal-title"
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
                <h2 id="modal-title" className="text-3xl font-bold text-white">Refine Image</h2>
                <p className="text-gray-400 mt-1 text-lg">Describe changes to regenerate the image.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-center text-gray-400 mb-2">Before</p>
                  <div className="aspect-square border border-white/10 rounded-xl">
                    <ZoomableImage src={originalImageSrc} alt="Original image" />
                  </div>
                </div>
                 <div>
                  <p className="text-sm font-semibold text-center text-gray-400 mb-2">After</p>
                  <div className="aspect-square border border-white/10 rounded-xl relative">
                    <ZoomableImage src={currentImageSrc} alt="Image to refine" />
                    {hasBeenEdited && (
                        <button 
                            onClick={onRestore}
                            title="Restore Original"
                            className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 text-white rounded-full hover:bg-white hover:text-black hover:scale-110 transition-all"
                        >
                            <RevertIcon className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </div>
             </div>
          </div>
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-2 gap-2">
                <div>
                    <label htmlFor="refine-prompt" className="font-semibold text-gray-200">Your Instructions</label>
                    <p className="text-sm text-gray-400">Be specific for the best results.</p>
                </div>
                <button
                    type="button"
                    onClick={onGetSuggestions}
                    disabled={isFetchingSuggestions || isRefining}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-nutshel-blue bg-nutshel-blue/10 rounded-full hover:bg-nutshel-blue/20 border border-nutshel-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {isFetchingSuggestions ? 'Getting ideas...' : 'Get AI Ideas'}
                </button>
            </div>
            <textarea
              id="refine-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Make the background blue'"
              className="w-full flex-grow bg-white/5 border-white/10 rounded-xl p-3 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue transition-all resize-none"
              rows={5}
              disabled={isRefining}
            />
             <PromptSuggestions 
                suggestions={suggestions.length > 0 ? suggestions : REFINE_SUGGESTIONS} 
                onSelect={handleSuggestionSelect} 
                className="mt-2" 
             />
          </form>
        </div>

        <div className="mt-6 flex justify-end gap-4">
            <button
                type="button"
                onClick={onClose}
                disabled={isRefining}
                className="px-6 py-2 text-md font-semibold text-gray-200 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                onClick={handleSubmit}
                disabled={isRefining || !prompt.trim()}
                className="px-6 py-2 text-md font-semibold text-black bg-nutshel-blue rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
            >
                {isRefining ? 'Regenerating...' : 'Regenerate'}
            </button>
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
