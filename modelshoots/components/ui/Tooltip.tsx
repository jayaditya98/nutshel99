import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, tip, className = '', position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  // No tooltip if tip is empty
  if (!tip) return <>{children}</>;

  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <div className={`absolute w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 ${positionClasses[position]}`}>
        {tip}
      </div>
    </div>
  );
};
