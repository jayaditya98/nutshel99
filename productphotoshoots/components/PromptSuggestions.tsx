
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface PromptSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
  variant?: 'default' | 'negative' | 'artistic';
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ suggestions, onSelect, className = '' }) => {
  const buttonClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all transform hover:-translate-y-px border text-nutshel-blue bg-nutshel-blue/10 hover:bg-nutshel-blue/20 border-nutshel-blue/20";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={buttonClass}
        >
          <PlusIcon className="w-3 h-3" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
};