
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cursorClass = onClick ? 'cursor-pointer' : '';
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 border border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-nutshel-blue/10 hover:-translate-y-1 ${cursorClass} ${className}`}
    >
      {children}
    </div>
  );
};
