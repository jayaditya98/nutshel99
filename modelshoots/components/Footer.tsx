
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Studio Photoshoot. All rights reserved.</p>
        <p className="text-sm mt-1">Powered by <span className="font-semibold text-gray-400">Gemini AI</span></p>
      </div>
    </footer>
  );
};
