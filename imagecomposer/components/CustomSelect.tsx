import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './IconComponents';

interface CustomSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ label, id, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const selectedOptionText = value || 'Select...';

  return (
    <div className="w-full relative" ref={selectRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-3 pr-4 py-3 text-base bg-nutshel-gray-dark border border-white/10 focus:outline-none focus:ring-1 focus:ring-nutshel-accent focus:border-nutshel-accent sm:text-sm rounded-xl text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>{selectedOptionText}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute mt-1 w-full rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg z-10 p-1 max-h-60 overflow-auto"
        >
          {options.map(option => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                value === option
                  ? 'bg-nutshel-accent text-black font-semibold'
                  : 'text-gray-200 hover:bg-nutshel-accent/20'
              }`}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};