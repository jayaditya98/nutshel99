import React from 'react';

interface FeatureAnimationProps {
  title: string;
  description: string;
  gifUrl: string;
}

export const FeatureAnimation: React.FC<FeatureAnimationProps> = ({ title, description, gifUrl }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6 w-full max-w-md shadow-lg">
        <img src={gifUrl} alt={`${title} animation`} className="w-full h-auto object-cover" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 max-w-sm">{description}</p>
    </div>
  );
};
