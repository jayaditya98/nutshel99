
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { PromptSuggestions } from './PromptSuggestions';
import { CheckIcon } from './icons/CheckIcon';
import type { PhotoshootConfig } from '../types';
import { ExcludeIcon } from './icons/ExcludeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { SceneIcon } from './icons/SceneIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Tooltip } from './Tooltip';
import { InfoIcon } from './icons/InfoIcon';


const AVAILABLE_ANGLES = [
  'front view',
  'left side view',
  'right side view',
  'top-down view',
  '45-degree perspective',
  'back view',
  'close-up detail shot',
  'extreme close-up',
  'lifestyle shot with props',
  'dynamic action shot',
  'low angle shot',
  'high angle shot',
];

const NEGATIVE_SUGGESTIONS = [
  "text", "logos", "watermarks", "human hands", "blurry product", "reflections"
];

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onGenerate: () => void;
  onReset: () => void;
  uploadedFile: File | null;
  isGenerating: boolean;
  config: PhotoshootConfig;
  onConfigChange: (config: PhotoshootConfig) => void;
  aiStyleSuggestions: string[];
  aiArtisticSuggestions: string[];
  isAnalyzingSceneSuggestions: boolean;
  isAnalyzingArtisticSuggestions: boolean;
  onGetSceneSuggestions: () => void;
  onGetArtisticSuggestions: () => void;
  styleReferenceFile: File | null;
  onStyleReferenceUpload: (file: File) => void;
  onRemoveStyleReference: () => void;
  onViewImage: (src: string) => void;
  productPreviewSrc?: string | null;
  stylePreviewSrc?: string | null;
}

const SuggestionSkeleton: React.FC = () => (
    <div className="flex flex-wrap gap-2 mt-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-7 w-28 sm:w-36 bg-white/5 rounded-full animate-pulse"></div>
      ))}
    </div>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  onGenerate, 
  onReset, 
  uploadedFile, 
  isGenerating,
  config,
  onConfigChange,
  aiStyleSuggestions,
  aiArtisticSuggestions,
  isAnalyzingSceneSuggestions,
  isAnalyzingArtisticSuggestions,
  onGetSceneSuggestions,
  onGetArtisticSuggestions,
  styleReferenceFile,
  onStyleReferenceUpload,
  onRemoveStyleReference,
  onViewImage,
  productPreviewSrc,
  stylePreviewSrc
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stylePreviewUrl, setStylePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productPreviewSrc) {
      setPreviewUrl(productPreviewSrc);
    } else if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [uploadedFile, productPreviewSrc]);
  
  useEffect(() => {
    if (stylePreviewSrc) {
      setStylePreviewUrl(stylePreviewSrc);
    } else if (styleReferenceFile) {
      const url = URL.createObjectURL(styleReferenceFile);
      setStylePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setStylePreviewUrl(null);
    }
  }, [styleReferenceFile, stylePreviewSrc]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleStyleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onStyleReferenceUpload(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleStyleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onStyleReferenceUpload(file);
    }
  }, [onStyleReferenceUpload]);


  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const triggerFileSelect = () => {
      fileInputRef.current?.click();
  };
  
  const triggerStyleFileSelect = () => {
      styleFileInputRef.current?.click();
  };


  const handleAngleToggle = (angle: string) => {
    const newAngles = config.selectedAngles.includes(angle)
      ? config.selectedAngles.filter(a => a !== angle)
      : [...config.selectedAngles, angle];
    onConfigChange({ ...config, selectedAngles: newAngles });
  };
  
  const handlePromptChange = (field: 'stylePrompt' | 'negativePrompt' | 'artisticStylePrompt', value: string) => {
    onConfigChange({ ...config, [field]: value });
  }

  const handleSuggestionSelect = (field: 'stylePrompt' | 'negativePrompt' | 'artisticStylePrompt', suggestion: string) => {
      const currentValue = config[field];
      const newValue = currentValue ? `${currentValue}, ${suggestion}` : suggestion;
      handlePromptChange(field, newValue);
  }
  
  const handleSelectAllAngles = () => {
    onConfigChange({ ...config, selectedAngles: [...AVAILABLE_ANGLES] });
  };

  const handleDeselectAllAngles = () => {
    onConfigChange({ ...config, selectedAngles: [] });
  };

  // FIX: Correctly type the UploaderBox component using React.FC and React.PropsWithChildren to resolve issues with TypeScript's inference for the 'children' prop when the component is defined within another component.
  const UploaderBox: React.FC<React.PropsWithChildren<{
    onClick: React.MouseEventHandler<HTMLDivElement>;
    onDrop: React.DragEventHandler<HTMLDivElement>;
    onDragOver: React.DragEventHandler<HTMLDivElement>;
    isStyleUploader?: boolean;
    isDisabled?: boolean;
  }>> = ({ onClick, onDrop, onDragOver, children, isStyleUploader = false, isDisabled = false }) => (
    <div
      onClick={!isDisabled ? onClick : undefined}
      onDrop={!isDisabled ? onDrop : undefined}
      onDragOver={!isDisabled ? onDragOver : undefined}
      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl bg-white/5 transition-colors ${isDisabled ? 'cursor-not-allowed border-white/10' : 'cursor-pointer border-white/20 hover:bg-white/10 hover:border-nutshel-blue/80'}`}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
        {children}
      </div>
    </div>
  );
  
  const hasUploadedOrRestored = uploadedFile || productPreviewSrc;

  return (
    <div className="w-full max-w-4xl mx-auto bg-nutshel-gray rounded-2xl p-6 sm:p-8 border border-white/10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={styleFileInputRef}
        onChange={handleStyleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* ----- COLUMN 1: PRODUCT UPLOAD ----- */}
        <div className="w-full">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">1. Upload Product</h2>
          <p className="text-center text-gray-400 mt-2 text-lg">A clear, well-lit image works best.</p>
          
          <div className="mt-6">
            {!previewUrl ? (
               <UploaderBox onClick={triggerFileSelect} onDrop={handleDrop} onDragOver={handleDragOver}>
                  <CameraIcon className="w-10 h-10 mb-3 text-gray-500"/>
                  <p className="mb-2 text-base text-gray-400"><span className="font-semibold text-nutshel-blue">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 tracking-wide">PNG, JPG or WEBP</p>
               </UploaderBox>
            ) : (
              <div className="flex flex-col items-center">
                  <div 
                    className="w-48 h-48 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg cursor-pointer group/preview"
                    onClick={() => previewUrl && onViewImage(previewUrl)}
                    aria-label="View uploaded product image"
                  >
                      <img src={previewUrl} alt="Product preview" className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-300" />
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-sm font-medium text-white/70 hover:text-white transition-colors">Use a different image</button>
              </div>
            )}
          </div>
        </div>

        {/* ----- COLUMN 2: STYLE TRANSFER ----- */}
        <div className={`w-full transition-opacity duration-500 ${!hasUploadedOrRestored ? 'opacity-40' : ''}`}>
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Style Transfer</span>
              <span className="text-sm font-medium text-gray-400">(Optional)</span>
              <Tooltip text="Upload an image to copy its visual style, lighting, and composition.">
                 <InfoIcon className="w-4 h-4 text-gray-500" />
              </Tooltip>
          </h2>
          <p className="text-center text-gray-400 mt-2 text-lg">
              {hasUploadedOrRestored ? 'Upload a reference for the style.' : 'Upload product image first.'}
          </p>

          <div className="mt-6">
            {!stylePreviewUrl ? (
                <UploaderBox onClick={triggerStyleFileSelect} onDrop={handleStyleDrop} onDragOver={handleDragOver} isDisabled={!hasUploadedOrRestored}>
                    <CameraIcon className="w-10 h-10 mb-3 text-gray-500"/>
                    <p className="mb-2 text-base text-gray-400"><span className="font-semibold text-nutshel-blue">Upload style image</span></p>
                    <p className="text-xs text-gray-500 tracking-wide">PNG, JPG or WEBP</p>
                </UploaderBox>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div 
                          className="w-48 h-48 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg cursor-pointer group/preview"
                          onClick={() => stylePreviewUrl && onViewImage(stylePreviewUrl)}
                          aria-label="View style reference image"
                        >
                            <img src={stylePreviewUrl} alt="Style reference preview" className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-300" />
                        </div>
                        <button 
                            onClick={onRemoveStyleReference} 
                            className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-red-500 transition-all duration-200"
                            aria-label="Remove style reference image"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>


      {hasUploadedOrRestored && (
        <div className="mt-12 border-t border-white/10 pt-10">
          <div className="space-y-10">
              <div>
                  <h2 className="text-3xl font-bold text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">2. Select Shots</h2>
                  <p className="text-center text-gray-400 mt-2 text-lg">Choose the angles you want the AI to generate.</p>
                  <div className="flex justify-end gap-3 mt-4 -mb-1">
                      <button
                          onClick={handleSelectAllAngles}
                          disabled={config.selectedAngles.length === AVAILABLE_ANGLES.length}
                          className="text-xs font-semibold text-white/70 hover:text-white disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                      >
                          Select All
                      </button>
                      <button
                          onClick={handleDeselectAllAngles}
                          disabled={config.selectedAngles.length === 0}
                          className="text-xs font-semibold text-white/70 hover:text-white disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                      >
                          Deselect All
                      </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {AVAILABLE_ANGLES.map(angle => {
                          const isSelected = config.selectedAngles.includes(angle);
                          return (
                              <button 
                                  key={angle}
                                  onClick={() => handleAngleToggle(angle)}
                                  className={`p-3 text-sm font-semibold rounded-full border transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 ${
                                      isSelected
                                      ? 'bg-nutshel-blue border-nutshel-blue text-black'
                                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                  }`}
                              >
                                  {isSelected && <CheckIcon className="w-4 h-4 flex-shrink-0" />}
                                  <span className="truncate">{angle.charAt(0).toUpperCase() + angle.slice(1)}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>

              <div>
                  <h2 className="text-3xl font-bold text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">3. Customize Photoshoot</h2>
                  {(styleReferenceFile || stylePreviewSrc) && (
                      <p className="text-center text-nutshel-blue/80 bg-nutshel-blue/10 px-4 py-2 mt-4 max-w-lg mx-auto rounded-lg text-xs border border-nutshel-blue/20">
                        Your reference image will strongly influence the style. These prompts are for refinement.
                      </p>
                  )}
                  <div className="mt-6 bg-black/20 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-start justify-between gap-3">
                          <div className='flex items-start gap-3'>
                            <div className="w-10 h-10 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <PaintBrushIcon className="w-5 h-5 text-nutshel-blue" />
                            </div>
                            <div className="flex-grow">
                                <label htmlFor="artistic-style-prompt" className="font-bold text-white text-lg flex items-center gap-1.5">
                                    Artistic Style
                                    <span className="text-sm font-medium text-gray-400">(Optional)</span>
                                    <Tooltip text="Define the overall aesthetic, e.g., 'Analog film', 'Photorealistic', 'Vintage'.">
                                        <InfoIcon className="w-4 h-4 text-gray-500" />
                                    </Tooltip>
                                </label>
                                <p className="text-sm text-gray-400 -mt-0.5">Define the overall visual aesthetic.</p>
                            </div>
                          </div>
                          {aiArtisticSuggestions.length === 0 && (
                            <button
                                type="button"
                                onClick={onGetArtisticSuggestions}
                                disabled={isAnalyzingArtisticSuggestions}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-nutshel-blue bg-nutshel-blue/10 rounded-full hover:bg-nutshel-blue/20 border border-nutshel-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {isAnalyzingArtisticSuggestions ? 'Getting ideas...' : 'Get AI Ideas'}
                            </button>
                          )}
                      </div>
                      <div className="mt-4 relative">
                          <textarea
                              id="artistic-style-prompt"
                              value={config.artisticStylePrompt}
                              onChange={(e) => handlePromptChange('artisticStylePrompt', e.target.value)}
                              placeholder="e.g., 'Analog film photo, 35mm lens...'"
                              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue transition-all resize-y"
                              rows={2}
                              disabled={isGenerating}
                          />
                      </div>
                      {isAnalyzingArtisticSuggestions ? (
                          <SuggestionSkeleton />
                      ) : (
                          <PromptSuggestions suggestions={aiArtisticSuggestions} onSelect={(s) => handleSuggestionSelect('artisticStylePrompt', s)} className="mt-3" />
                      )}
                  </div>
                  <div className="mt-6 grid md:grid-cols-2 gap-6">
                      {/* Style & Scene Card */}
                      <div className="bg-black/20 rounded-2xl p-6 border border-white/10">
                          <div className="flex items-start justify-between gap-3">
                              <div className='flex items-start gap-3'>
                                <div className="w-10 h-10 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <SceneIcon className="w-5 h-5 text-nutshel-blue" />
                                </div>
                                <div className="flex-grow">
                                    <label htmlFor="style-prompt" className="font-bold text-white text-lg flex items-center gap-1.5">
                                        Style & Scene
                                        <span className="text-sm font-medium text-gray-400">(Optional)</span>
                                        <Tooltip text="Describe the background, props, surfaces, and lighting.">
                                            <InfoIcon className="w-4 h-4 text-gray-500" />
                                        </Tooltip>
                                    </label>
                                    <p className="text-sm text-gray-400 -mt-0.5">Describe background and lighting.</p>
                                </div>
                              </div>
                              {aiStyleSuggestions.length === 0 && (
                                <button
                                    type="button"
                                    onClick={onGetSceneSuggestions}
                                    disabled={isAnalyzingSceneSuggestions}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-nutshel-blue bg-nutshel-blue/10 rounded-full hover:bg-nutshel-blue/20 border border-nutshel-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    {isAnalyzingSceneSuggestions ? 'Getting ideas...' : 'Get AI Ideas'}
                                </button>
                              )}
                          </div>
                          <div className="mt-4 relative">
                              <textarea
                                  id="style-prompt"
                                  value={config.stylePrompt}
                                  onChange={(e) => handlePromptChange('stylePrompt', e.target.value)}
                                  placeholder="e.g., 'On a dark wood surface...'"
                                  className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue transition-all resize-y"
                                  rows={3}
                                  disabled={isGenerating}
                              />
                          </div>
                          {isAnalyzingSceneSuggestions ? (
                              <SuggestionSkeleton />
                          ) : (
                              <PromptSuggestions suggestions={aiStyleSuggestions} onSelect={(s) => handleSuggestionSelect('stylePrompt', s)} className="mt-3" />
                          )}
                      </div>

                      {/* Exclude from Image Card */}
                      <div className="bg-black/20 rounded-2xl p-6 border border-white/10">
                          <div className="flex items-start gap-3">
                              <div className="w-10 h-10 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                  <ExcludeIcon className="w-5 h-5 text-nutshel-blue" />
                              </div>
                              <div className="flex-grow">
                                  <label htmlFor="negative-prompt" className="font-bold text-white text-lg flex items-center gap-1.5">
                                      Exclude
                                      <span className="text-sm font-medium text-gray-400">(Optional)</span>
                                       <Tooltip text="List anything you want to avoid in the final image, like text, logos, or certain colors.">
                                          <InfoIcon className="w-4 h-4 text-gray-500" />
                                      </Tooltip>
                                  </label>
                                  <p className="text-sm text-gray-400 -mt-0.5">List things you don't want to see.</p>
                              </div>
                          </div>
                          <div className="mt-4 relative">
                              <textarea
                                  id="negative-prompt"
                                  value={config.negativePrompt}
                                  onChange={(e) => handlePromptChange('negativePrompt', e.target.value)}
                                  placeholder="e.g., 'text, logos, human hands'"
                                  className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue transition-all resize-y"
                                  rows={3}
                                  disabled={isGenerating}
                              />
                          </div>
                          <PromptSuggestions suggestions={NEGATIVE_SUGGESTIONS} onSelect={(s) => handleSuggestionSelect('negativePrompt', s)} className="mt-3" />
                      </div>
                  </div>
              </div>
              
              <div className="text-center pt-6 border-t border-white/10">
                  <h2 className="text-3xl font-bold text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">4. Start Photoshoot</h2>
                  <p className="text-center text-gray-400 mt-2 text-lg">You are one click away from studio level shoots!</p>
                  <button
                      onClick={onGenerate}
                      disabled={isGenerating || !hasUploadedOrRestored || config.selectedAngles.length === 0}
                      className="mt-6 inline-flex items-center justify-center gap-3 px-8 py-3 text-lg font-semibold text-black bg-nutshel-blue rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity duration-300"
                  >
                      <SparklesIcon className="w-6 h-6" />
                      <span>
                          {isGenerating ? 'Generating...' : `Generate ${config.selectedAngles.length} Image${config.selectedAngles.length === 1 ? '' : 's'}`}
                      </span>
                  </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
