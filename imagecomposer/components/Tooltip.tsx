import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    // The wrapper needs to be relative for the absolute tooltip positioning.
    // 'group' is the key for Tailwind's group-hover functionality.
    // 'w-full' ensures it takes the same width as the form elements inside it.
    <div className="relative group w-full">
      {children}
      <div 
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-sm rounded-lg shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10"
      >
        {text}
        {/* This div creates the small arrow at the bottom of the tooltip */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black/40"></div>
      </div>
    </div>
  );
};