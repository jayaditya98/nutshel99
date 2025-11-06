
import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';

export const Header: React.FC<{ onToggleHistory: () => void }> = ({ onToggleHistory }) => {
  return (
    <header className="relative text-center pt-12 sm:pt-16 lg:pt-20">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onToggleHistory}
          className="p-2 text-white/80 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors border border-white/10"
          aria-label="View history"
        >
          <HistoryIcon className="w-6 h-6" />
        </button>
      </div>
      <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tighter">
        Product Photoshoots
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
        Raw product images into studio quality shoots.
      </p>
    </header>
  );
};
