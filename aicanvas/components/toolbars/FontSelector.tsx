import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../ui/Icons';

interface FontSelectorProps {
  fonts: string[];
  selectedFont: string;
  onSelectFont: (font: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onPreviewFont: (font: string) => void;
  onRevertPreview: () => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ fonts, selectedFont, onSelectFont, onOpen, onClose, onPreviewFont, onRevertPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        if (isOpen) {
            onClose();
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSelect = (font: string) => {
    onSelectFont(font);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={toggleOpen}
        title="Select font"
        className="w-40 p-2 border border-white/10 rounded-md bg-white/5 text-gray-200 text-sm focus:ring-nutshel-blue focus:border-nutshel-blue outline-none flex justify-between items-center"
      >
        <span className="truncate" style={{ fontFamily: selectedFont }}>{selectedFont}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-48 bg-nutshel-gray-dark border border-white/10 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto custom-scrollbar">
          <ul className="p-1" onMouseLeave={onRevertPreview}>
            {fonts.map(font => (
              <li key={font}>
                <button
                  onClick={() => handleSelect(font)}
                  onMouseEnter={() => onPreviewFont(font)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${selectedFont === font ? 'bg-nutshel-blue text-black font-semibold' : 'text-gray-200 hover:bg-white/10'}`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FontSelector;