import React from 'react';
import { SparklesIcon } from './IconComponents';

interface LoadingSpinnerProps {
    message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({message}) => {
  return (
    <div className="fixed inset-0 bg-nutshel-gray-dark/80 backdrop-blur-sm flex flex-col justify-center items-center z-50 shimmer-bg">
      <div className="flex items-center space-x-3 p-4 bg-nutshel-gray/80 backdrop-blur-md rounded-xl shadow-xl border border-white/10">
        <SparklesIcon className="w-8 h-8 text-nutshel-accent animate-pulse" />
        <span className="text-lg font-semibold text-gray-200">{message}</span>
      </div>
    </div>
  );
};