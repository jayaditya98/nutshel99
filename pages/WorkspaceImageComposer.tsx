import React from 'react';
import { Link } from 'react-router-dom';
// Import the ImageComposer App component from the imagecomposer folder
import ImageComposerApp from 'imagecomposer/App';

const WorkspaceImageComposer: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      {/* Back to Studios Button */}
      <Link
        to="/workspace/studios"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-nutshel-gray/90 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-nutshel-gray hover:border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl group"
        title="Back to Nutshel Studios"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span className="text-sm font-medium">Back to Studios</span>
      </Link>
      <ImageComposerApp />
    </div>
  );
};

export default WorkspaceImageComposer;

