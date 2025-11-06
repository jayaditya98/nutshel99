import React, { useCallback, useEffect } from 'react';
import { UploadIcon, XIcon } from './IconComponents';
import { FileWithPreview } from '../types';

interface ImageUploaderProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  multiple?: boolean;
  label: string;
  id: string;
  onImageClick?: (file: FileWithPreview) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  files,
  onFilesChange,
  multiple = false,
  label,
  id,
  onImageClick,
}) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // FIX: Explicitly type `file` as `File` to resolve an inference issue where it was being treated as `unknown`.
      const selectedFiles = Array.from(event.target.files).map((file: File) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      if (multiple) {
        onFilesChange([...files, ...selectedFiles]);
      } else {
        onFilesChange(selectedFiles.slice(0, 1));
      }
    }
  }, [files, multiple, onFilesChange]);

  const handleRemoveClick = (e: React.MouseEvent, fileToRemove: FileWithPreview) => {
      e.stopPropagation(); // Prevent the modal from opening when removing an image
      const newFiles = files.filter(file => file !== fileToRemove);
      onFilesChange(newFiles);
      URL.revokeObjectURL(fileToRemove.preview);
  };
  
  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supportedMimeTypes = "image/png, image/jpeg, image/webp, image/gif";

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-lg font-semibold text-gray-200 mb-3">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-nutshel-accent/50 border-dashed rounded-xl transition hover:border-nutshel-accent">
        <div className="space-y-1 text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
          <div className="flex text-sm text-gray-400">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-transparent rounded-md font-semibold text-nutshel-accent hover:opacity-90 focus-within:outline-none"
            >
              <span>Upload file(s)</span>
              <input id={id} name={id} type="file" className="sr-only" multiple={multiple} accept={supportedMimeTypes} onChange={handleFileChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-sm text-gray-400">PNG, JPG, WEBP, GIF up to 10MB</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div 
                key={index} 
                className="relative group rounded-xl overflow-hidden cursor-pointer"
                onClick={() => onImageClick?.(file)}
                role="button"
                aria-label={`View larger image of ${file.name}`}
            >
              <img src={file.preview} alt={`Preview ${file.name}`} className="h-28 w-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleRemoveClick(e, file)}
                  className="p-1.5 bg-red-600/80 backdrop-blur-sm text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 z-10"
                  aria-label={`Remove ${file.name}`}
                >
                    <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
