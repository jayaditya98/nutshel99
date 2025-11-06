
import React from 'react';

interface LoaderProps {
  message: string;
  progress: number;
}

export const Loader: React.FC<LoaderProps> = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto">
      <p className="text-xl font-semibold text-white">{message}</p>
      <div className="w-full bg-white/10 rounded-full h-2.5 mt-4">
        <div 
          className="bg-nutshel-blue h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="mt-2 text-gray-400 text-sm">Please keep this window open.</p>
    </div>
  );
};