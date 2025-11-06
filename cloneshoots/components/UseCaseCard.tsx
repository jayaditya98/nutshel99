import React from 'react';

interface UseCaseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const UseCaseCard: React.FC<UseCaseCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center hover:-translate-y-1 transition-transform duration-300">
      <div className="inline-block text-nutshel-blue mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};