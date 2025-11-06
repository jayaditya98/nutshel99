
import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon } from './icons/Icons';
import { ImageModal } from './ImageModal';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: File | null) => void;
  image: File | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, image }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(image);
    } else {
      setPreview(null);
    }
  }, [image]);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (PNG, JPG, etc.).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Please upload an image under 10MB.');
        return;
      }
    }
    onImageUpload(file);
  }, [onImageUpload]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const openFileDialog = () => {
    const inputId = `file-upload-${title.replace(/\s+/g, '-')}`;
    document.getElementById(inputId)?.click();
  };

  return (
    <div className="bg-black/20 border border-white/10 p-6 rounded-2xl w-full text-center animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
      <div className="relative border-2 border-dashed border-white/20 rounded-lg h-64 md:h-72 group">
        {preview ? (
          <>
            <img
              src={preview}
              alt={`${title} preview`}
              className="absolute inset-0 w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-white font-semibold text-lg">View Larger</span>
            </div>
            <button
              onClick={openFileDialog}
              className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md hover:bg-black/70 transition-colors z-10"
            >
              Change
            </button>
          </>
        ) : (
          <label
            htmlFor={`file-upload-${title.replace(/\s+/g, '-')}`}
            className="absolute inset-0 w-full h-full flex flex-col justify-center items-center cursor-pointer hover:border-nutshel-blue transition-colors duration-300"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center text-gray-400">
              <UploadIcon className="w-12 h-12 mb-2 text-gray-500 group-hover:text-nutshel-blue transition-colors" />
              <span className="font-semibold text-gray-300">Click to upload or drag & drop</span>
              <span className="text-sm">PNG, JPG, WEBP (max 10MB)</span>
            </div>
          </label>
        )}
      </div>
      <input
        id={`file-upload-${title.replace(/\s+/g, '-')}`}
        name={`file-upload-${title.replace(/\s+/g, '-')}`}
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
      />
      {isModalOpen && preview && (
        <ImageModal src={preview} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
