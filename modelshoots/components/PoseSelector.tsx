
import React from 'react';
import type { Pose, Gender } from '../types';
import { MALE_POSES, FEMALE_POSES, MAX_POSES } from '../constants';
import { Card } from './ui/Card';
import { Tooltip } from './ui/Tooltip';
import { Button } from './ui/Button';

interface PoseSelectorProps {
  selectedGender: Gender;
  onGenderChange: (gender: Gender) => void;
  selectedPoses: Pose[];
  onPoseSelect: (pose: Pose) => void;
  customPosesInput: string;
  onCustomPosesChange: (value: string) => void;
  poseSuggestions: string[];
  isFetchingPoseSuggestions: boolean;
  onFetchPoseSuggestions: () => void;
  onPoseSuggestionClick: (suggestion: string) => void;
}

export const PoseSelector: React.FC<PoseSelectorProps> = ({
  selectedGender,
  onGenderChange,
  selectedPoses,
  onPoseSelect,
  customPosesInput,
  onCustomPosesChange,
  poseSuggestions,
  isFetchingPoseSuggestions,
  onFetchPoseSuggestions,
  onPoseSuggestionClick,
}) => {
  const poses = selectedGender === 'male' ? MALE_POSES : FEMALE_POSES;
  const customPoseCount = customPosesInput.split('\n').filter(p => p.trim() !== '').length;
  const totalSelected = selectedPoses.length + customPoseCount;
  const isPoseLimitReached = totalSelected >= MAX_POSES;

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newLines = newText.split('\n');

    if (newLines.length > MAX_POSES - selectedPoses.length) {
      // Prevent adding more lines than available slots
      const availableSlots = MAX_POSES - selectedPoses.length;
      onCustomPosesChange(newLines.slice(0, availableSlots).join('\n'));
    } else {
      onCustomPosesChange(newText);
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="bg-nutshel-gray rounded-full p-1 flex">
          <button
            onClick={() => onGenderChange('female')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${selectedGender === 'female' ? 'bg-nutshel-blue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Female Poses
          </button>
          <button
            onClick={() => onGenderChange('male')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${selectedGender === 'male' ? 'bg-nutshel-blue text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Male Poses
          </button>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10">
        <h3 className="text-xl font-semibold text-center mb-4 text-white">Or Describe Your Own Poses</h3>
        <div className="max-w-xl mx-auto">
          <textarea
            value={customPosesInput}
            onChange={handleTextAreaChange}
            placeholder="e.g., 'Sitting on a stool, looking over the left shoulder' (one pose per line)"
            rows={4}
            className="w-full bg-nutshel-gray-dark border-2 border-white/10 text-white p-3 rounded-lg focus:border-nutshel-blue focus:outline-none resize-y"
            aria-label="Custom Poses Input"
          />
          <div className="mt-2 flex flex-col gap-2">
            {isFetchingPoseSuggestions && (
              <div className="flex items-center justify-center gap-2 text-gray-400 p-3 bg-nutshel-gray-dark rounded-full">
                <svg className="animate-spin h-5 w-5 text-nutshel-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating AI pose ideas...</span>
              </div>
            )}
            {!isFetchingPoseSuggestions && poseSuggestions.length === 0 && (
              <Tooltip tip="Let AI suggest poses based on your image" position="bottom">
                <Button onClick={onFetchPoseSuggestions} variant="secondary" className="w-full flex items-center justify-center gap-2" disabled={isPoseLimitReached}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Get AI Pose Suggestions
                </Button>
              </Tooltip>
            )}
            {!isFetchingPoseSuggestions && poseSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onPoseSuggestionClick(suggestion)}
                disabled={isPoseLimitReached}
                className="w-full text-left bg-nutshel-blue/10 hover:bg-nutshel-blue/20 text-nutshel-blue font-semibold px-4 py-2 rounded-full transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-nutshel-blue/10"
              >
                <span className="bg-nutshel-blue text-black rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center font-bold text-sm">+</span>
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-white/10">
        <h3 className="text-xl font-semibold text-center text-white">Choose From The Library</h3>
        <p className="text-center text-gray-400 my-4">Select up to {MAX_POSES} total poses ({totalSelected}/{MAX_POSES} selected)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {poses.map(pose => {
            const isSelected = selectedPoses.some(p => p.id === pose.id);
            const isDisabled = !isSelected && isPoseLimitReached;
            return (
              <Tooltip key={pose.id} tip={isDisabled ? 'Pose limit reached' : (pose.description || pose.name)}>
                <Card
                  onClick={() => !isDisabled && onPoseSelect(pose)}
                  className={`relative border-4 transition-all duration-300 ${isSelected ? 'border-nutshel-blue' : 'border-transparent'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <img src={pose.imageUrl} alt={pose.name} className="w-full h-48 object-cover" />
                  <div className="p-2 text-center">
                    <h4 className="font-semibold text-sm text-gray-300">{pose.name}</h4>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-nutshel-blue rounded-full h-6 w-6 flex items-center justify-center text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </Card>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};
