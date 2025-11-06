import React, { useRef, useState, useCallback } from 'react';
import { MAX_ACCESSORIES } from '../constants';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

interface AccessoryUploaderProps {
  onFilesChange: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  accessoryPreviews: string[];
}

const AccessoryUploader: React.FC<AccessoryUploaderProps> = ({
  onFilesChange,
  onFileRemove,
  accessoryPreviews
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    onFilesChange(newFiles);
  }, [onFilesChange]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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
    handleFiles(e.dataTransfer.files);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };
  
  const canUploadMore = accessoryPreviews.length < MAX_ACCESSORIES;

  return (
    <div>
       <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-nutshel-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 13L2 9l4-6zM12 22V9m-10 0h20M6 3l6 6m6-6l-6 6" />
          </svg>
        </div>
        <div>
          <label className="block text-lg font-semibold text-white/90">Accessories <span className="text-gray-400 font-normal">(Optional)</span></label>
          <p className="text-gray-400 text-sm">Add items like watches or glasses. ({accessoryPreviews.length}/{MAX_ACCESSORIES})</p>
        </div>
      </div>
      
      {canUploadMore && (
        <div 
          className={`w-full p-6 border-2 border-dashed rounded-lg transition-all duration-300 text-center cursor-pointer ${dragActive ? 'border-nutshel-blue bg-nutshel-gray' : 'border-white/10'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={handleButtonClick}
        >
          <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" multiple onChange={handleFileChange} />
          <p className="text-gray-400">Click to upload or drag & drop</p>
        </div>
      )}

      {accessoryPreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {accessoryPreviews.map((src, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={src} alt={`Accessory preview ${index + 1}`} className="w-full h-full object-contain rounded-md bg-nutshel-gray-dark" />
              <Tooltip tip="Remove accessory" position="top">
                <button onClick={() => onFileRemove(index)} className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove accessory">&times;</button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


interface ControlsPanelProps {
  stylePrompt: string;
  onStylePromptChange: (value: string) => void;
  styleSuggestions: string[];
  isFetchingSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onFetchSuggestions: () => void;
  uploadedAccessoryPreviews: string[];
  onAccessoryUpload: (files: File[]) => void;
  onAccessoryRemove: (index: number) => void;
}

const StyleSceneControl: React.FC<Omit<ControlsPanelProps, 'uploadedAccessoryPreviews' | 'onAccessoryUpload' | 'onAccessoryRemove'>> = ({
  stylePrompt,
  onStylePromptChange,
  styleSuggestions,
  isFetchingSuggestions,
  onSuggestionClick,
  onFetchSuggestions
}) => {
  return (
    <div className="md:col-span-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-nutshel-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white/90">Style & Scene <span className="text-gray-400 font-normal">(Optional)</span></h4>
          <p className="text-gray-400 text-sm">Describe background and lighting.</p>
        </div>
      </div>
      <textarea
        value={stylePrompt}
        onChange={(e) => onStylePromptChange(e.target.value)}
        placeholder="e.g., 'A moody, cinematic scene with dramatic shadows...'"
        className="w-full h-24 bg-nutshel-gray-dark border-2 border-white/10 text-white p-3 rounded-lg focus:border-nutshel-blue focus:outline-none resize-none"
      />
      <div className="mt-2 flex flex-col gap-2">
        {isFetchingSuggestions && (
            <div className="flex items-center justify-center gap-2 text-gray-400 p-3 bg-nutshel-gray-dark rounded-full">
              <svg className="animate-spin h-5 w-5 text-nutshel-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating AI suggestions...</span>
            </div>
        )}
        {!isFetchingSuggestions && styleSuggestions.length === 0 && (
          <Tooltip tip="Let AI suggest styles based on your image" position="bottom">
            <Button
              onClick={onFetchSuggestions}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get AI Style Suggestions
            </Button>
          </Tooltip>
        )}
        {!isFetchingSuggestions && styleSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left bg-nutshel-blue/10 hover:bg-nutshel-blue/20 text-nutshel-blue font-semibold px-4 py-2 rounded-full transition-colors duration-300 flex items-center gap-2"
          >
            <span className="bg-nutshel-blue text-black rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center font-bold text-sm">+</span>
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ControlsPanel: React.FC<ControlsPanelProps> = (props) => {
  const {
    uploadedAccessoryPreviews,
    onAccessoryUpload,
    onAccessoryRemove,
    ...styleSceneProps
  } = props;
  
  return (
    <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-2xl font-bold text-center mb-8 text-white">Fine-Tune Your Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StyleSceneControl {...styleSceneProps} />
            <AccessoryUploader 
              accessoryPreviews={uploadedAccessoryPreviews}
              onFilesChange={onAccessoryUpload}
              onFileRemove={onAccessoryRemove}
            />
        </div>
    </div>
  );
};
