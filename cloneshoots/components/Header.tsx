import React from 'react';
import { SparklesIcon } from './icons/Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-black/40 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-7xl">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-nutshel-blue" />
          <span className="text-xl font-bold text-white">AI Image Fusion</span>
        </div>
        <div className="flex items-center gap-4">
            <button className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Log in
            </button>
            <button className="bg-nutshel-blue text-black font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity text-sm">
                Try for free
            </button>
        </div>
      </div>
    </header>
  );
};