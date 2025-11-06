import React, { useState } from 'react';
import type { Model, Gender } from '../types';
import { MALE_MODELS, FEMALE_MODELS } from '../constants';
import { Card } from './ui/Card';
import { Tooltip } from './ui/Tooltip';

interface ModelLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: Model) => void;
}

export const ModelLibrary: React.FC<ModelLibraryProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  
  const models = selectedGender === 'male' ? MALE_MODELS : FEMALE_MODELS;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-library-title"
    >
      <div 
        className="bg-nutshel-gray w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-white/10 flex flex-col p-6 md:p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between mb-6">
          <h2 id="model-library-title" className="text-3xl font-bold text-white">Choose a Model</h2>
          <Tooltip tip="Close library" position="bottom">
            <button
              onClick={onClose}
              aria-label="Close model library"
              className="bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 flex items-center justify-center transition-all text-2xl font-bold"
            >&times;</button>
          </Tooltip>
        </div>

        <div className="flex-shrink-0 flex justify-center mb-6">
          <div className="bg-nutshel-gray-dark rounded-full p-1 flex">
            <button
              onClick={() => setSelectedGender('female')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${selectedGender === 'female' ? 'bg-nutshel-blue text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Female Models
            </button>
            <button
              onClick={() => setSelectedGender('male')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${selectedGender === 'male' ? 'bg-nutshel-blue text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Male Models
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {models.map(model => (
                    <Card
                    key={model.id}
                    onClick={() => onSelect(model)}
                    className="relative border-4 border-transparent hover:border-nutshel-blue"
                    >
                    <img src={model.imageUrl} alt={model.name} className="w-full h-auto object-cover aspect-[2/3]" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
                        <h4 className="font-semibold text-sm text-white">{model.name}</h4>
                    </div>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
