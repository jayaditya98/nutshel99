
import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';

interface HeroProps {
  onImageUpload: (file: File) => void;
  onOpenLibraryClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onImageUpload, onOpenLibraryClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <section className="text-center py-20">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
        Model Shoots
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
        A single image to series of professional, high-fashion images.
      </p>
      <br></br>
      <div 
        className={`max-w-2xl mx-auto p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive ? 'border-nutshel-blue bg-nutshel-gray' : 'border-white/10'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleButtonClick}
              size="lg"
              className="shadow-lg shadow-nutshel-blue/20 w-full max-w-xs"
            >
              Upload Your Image
            </Button>
            <div className="flex items-center w-full max-w-xs">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
            </div>
            <Button
              onClick={onOpenLibraryClick}
              variant="secondary"
              size="lg"
              className="w-full max-w-xs"
            >
              Choose from Library
            </Button>
            <p className="mt-2 text-gray-500 text-sm">You can also drag and drop a file anywhere in this box</p>
        </div>
      </div>
    </section>
  );
};
