
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group/tooltip flex items-center">
      {children}
      <div 
        className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg z-10 border border-white/10"
        role="tooltip"
      >
        {text}
      </div>
    </div>
  );
};
