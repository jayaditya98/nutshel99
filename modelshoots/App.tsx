
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hero } from './components/Hero';
import { PoseSelector } from './components/PoseSelector';
import { ControlsPanel } from './components/ControlsPanel';
import { GeneratedGallery } from './components/GeneratedGallery';
import { ImageModal } from './components/ImageModal';
import { ModelLibrary } from './components/ModelLibrary';
import { HistoryPanel } from './components/HistoryPanel';
import { generateStudioImage, generateStyleSuggestions, generatePoseSuggestions } from './services/geminiService';
import { base64EncodeFile, dataUrlToFile, addHistoryEntry, getAllHistoryEntries, deleteHistoryEntry, clearHistory as clearDbHistory } from './utils/imageUtils';
import type { Pose, GeneratedImage, Gender, Model, HistoryEntry, EncodedImage } from './types';
import { MAX_POSES, MAX_ACCESSORIES } from './constants';
import { Button } from './components/ui/Button';
import { Tooltip } from './components/ui/Tooltip';
import { useProjects } from '../contexts/ProjectContext';
import ProjectSelectionModal from '../components/ProjectSelectionModal';

const MAX_HISTORY_ITEMS = 20;

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addProjectAssetFromStudio, getProjectById } = useProjects();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  const [selectedPoses, setSelectedPoses] = useState<Pose[]>([]);
  const [customPosesInput, setCustomPosesInput] = useState<string>('');
  const [poseSuggestions, setPoseSuggestions] = useState<string[]>([]);
  const [isFetchingPoseSuggestions, setIsFetchingPoseSuggestions] = useState<boolean>(false);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [styleSuggestions, setStyleSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
  const [uploadedAccessories, setUploadedAccessories] = useState<File[]>([]);
  const [uploadedAccessoryPreviews, setUploadedAccessoryPreviews] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  const [isModelLibraryOpen, setIsModelLibraryOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] = useState(false);

  // Get projectId and historyId from location state
  const projectId = (location.state as any)?.projectId as number | undefined;
  const projectNameFromState = (location.state as any)?.projectName as string | undefined;
  const historyIdFromState = (location.state as any)?.historyId as string | undefined;
  const project = projectId ? getProjectById(projectId) : null;

  const galleryRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const studioControlsRef = useRef<HTMLDivElement>(null);
  const hasRestoredRef = useRef(false);

  // Load history from IndexedDB on initial mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const entries = await getAllHistoryEntries();
        setHistory(entries);
      } catch (err) {
        console.error("Failed to load history from IndexedDB", err);
        setError("Could not load photoshoot history from your browser's database.");
      }
    };
    loadHistory();
  }, []);

  // Reset restoration flag when location changes
  useEffect(() => {
    hasRestoredRef.current = false;
  }, [location.key]);

  // Restore from history if historyId is provided (when re-editing from project page)
  useEffect(() => {
    if (historyIdFromState && history.length > 0 && !hasRestoredRef.current) {
      const historyItem = history.find(item => item.id === historyIdFromState);
      if (historyItem) {
        hasRestoredRef.current = true;
        console.log('Restoring model-shoots history:', historyIdFromState);
        handleRestoreHistoryItem(historyIdFromState);
      } else {
        console.warn('History item not found for ID:', historyIdFromState);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIdFromState, history.length]);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    setSelectedPoses([]);
    setCustomPosesInput('');
    setPoseSuggestions([]);
    setIsFetchingPoseSuggestions(false);
    setStylePrompt('');
    setStyleSuggestions([]);
    setIsFetchingSuggestions(false);
    setUploadedAccessories([]);
    setUploadedAccessoryPreviews([]);
    setGeneratedImages([]);
    setError(null);
    setIsLoading(false);
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSelectNewImage = (file: File) => {
    handleReset();
    setUploadedImage(file);
    setUploadedImagePreview(URL.createObjectURL(file));
  };
  
  const handlePoseSelect = (pose: Pose) => {
    const customPoseCount = customPosesInput.split('\n').filter(p => p.trim() !== '').length;
    setSelectedPoses(prev => {
      const isAlreadySelected = prev.find(p => p.id === pose.id);
      if (isAlreadySelected) {
        return prev.filter(p => p.id !== pose.id);
      }
      if (prev.length + customPoseCount < MAX_POSES) {
        return [...prev, pose];
      }
      return prev;
    });
  };

  const handleAccessoryUpload = (files: File[]) => {
    const currentTotal = uploadedAccessories.length;
    const availableSlots = MAX_ACCESSORIES - currentTotal;
    if (availableSlots <= 0) {
      setError(`You can only upload a maximum of ${MAX_ACCESSORIES} accessories.`);
      return;
    }

    const newFiles = files.slice(0, availableSlots);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setUploadedAccessories(prev => [...prev, ...newFiles]);
    setUploadedAccessoryPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleAccessoryRemove = (index: number) => {
    const previewToRemove = uploadedAccessoryPreviews[index];
    URL.revokeObjectURL(previewToRemove); // Clean up memory

    setUploadedAccessories(prev => prev.filter((_, i) => i !== index));
    setUploadedAccessoryPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleModelSelect = async (model: Model) => {
    setIsModelLibraryOpen(false);
    try {
      const response = await fetch(model.imageUrl);
      const blob = await response.blob();
      const fileExtension = model.imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const mimeType = blob.type || `image/${fileExtension}`;
      const fileName = `${model.name.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;
      
      const file = new File([blob], fileName, { type: mimeType });
      handleSelectNewImage(file);
    } catch (err) {
      setError('Failed to load the selected model image. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    // Cleanup object URLs on unmount to prevent memory leaks
    return () => {
      if (uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
      uploadedAccessoryPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [uploadedImagePreview, uploadedAccessoryPreviews]);

  useEffect(() => {
    if (uploadedImagePreview && studioControlsRef.current) {
      studioControlsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Clear suggestions when the image is removed.
    if (!uploadedImage) {
      setStyleSuggestions([]);
      setPoseSuggestions([]);
    }
  }, [uploadedImage, uploadedImagePreview]);

  const handleFetchSuggestions = async () => {
    if (!uploadedImage) return;

    setIsFetchingSuggestions(true);
    try {
      const { base64Data, mimeType } = await base64EncodeFile(uploadedImage);
      const suggestions = await generateStyleSuggestions(base64Data, mimeType);
      setStyleSuggestions(suggestions);
    } catch (err) {
      console.error("Failed to fetch style suggestions:", err);
      setError("Failed to get AI suggestions. Please try again.");
      setStyleSuggestions([]); // Clear suggestions on error
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleFetchPoseSuggestions = async () => {
    if (!uploadedImage) return;

    setIsFetchingPoseSuggestions(true);
    setPoseSuggestions([]);
    try {
      const { base64Data, mimeType } = await base64EncodeFile(uploadedImage);
      const suggestions = await generatePoseSuggestions(base64Data, mimeType);
      setPoseSuggestions(suggestions);
    } catch (err) {
      console.error("Failed to fetch pose suggestions:", err);
      setError("Failed to get AI pose suggestions. Please try again.");
    } finally {
      setIsFetchingPoseSuggestions(false);
    }
  };
  
  const handlePoseSuggestionClick = (suggestion: string) => {
    const customPoseLines = customPosesInput.split('\n').filter(p => p.trim() !== '');
    if (selectedPoses.length + customPoseLines.length < MAX_POSES) {
        setCustomPosesInput(prev => {
            const trimmedPrev = prev.trim();
            return trimmedPrev ? `${trimmedPrev}\n${suggestion}` : suggestion;
        });
    }
  };

  const handleGenerate = useCallback(async () => {
    const customPoseLines = customPosesInput.split('\n').filter(p => p.trim() !== '');
    const customPoseObjects: Pose[] = customPoseLines.map((line, index) => ({
      id: `custom-${Date.now()}-${index}`,
      name: line.trim(),
      description: line.trim(),
      imageUrl: '', // No image for custom poses
    }));

    const allPoses = [...selectedPoses, ...customPoseObjects];

    if (!uploadedImage || allPoses.length === 0) {
      setError('Please upload an image and select or describe at least one pose.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setLoadingMessage(`Preparing your photoshoot...`);

    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const mainImageEncoded = await base64EncodeFile(uploadedImage);
      const accessoriesEncoded: EncodedImage[] = await Promise.all(
        uploadedAccessories.map(file => base64EncodeFile(file))
      );

      const imagePromises: Promise<GeneratedImage>[] = [];

      for (let i = 0; i < allPoses.length; i++) {
        const pose = allPoses[i];
        setLoadingMessage(`Generating pose ${i + 1} of ${allPoses.length}: "${pose.name}"`);
        
        const poseDescription = pose.description || `a standard '${pose.name}' pose.`;
        const styleDescription = stylePrompt.trim() ? `The scene and style should be: ${stylePrompt.trim()}.` : 'The scene should be a clean studio background with professional lighting.';
        
        let prompt: string;

        if (uploadedAccessories.length > 0) {
          prompt = `A studio quality, professional photograph of the person from the main image, now interacting with the provided accessory. The person should hold or wear the accessory in a natural and compelling way. Adapt the base pose, which is '${pose.name}' (${poseDescription}), to accommodate the accessory. The interaction with the accessory is the top priority. ${styleDescription} The final image must be a photorealistic, high-fashion editorial shot.`;
        } else {
          prompt = `A studio quality, professional photograph of the person in the provided image. Recreate them in a pose described as follows: ${poseDescription}. ${styleDescription} Ensure the result is a photorealistic, high-fashion editorial image.`;
        }
        
        const promise = generateStudioImage(mainImageEncoded.base64Data, mainImageEncoded.mimeType, prompt, accessoriesEncoded)
          .then(url => ({
            id: `${pose.id}-${new Date().getTime()}`,
            url,
            pose,
            prompt
          }));

        imagePromises.push(promise);
      }
      
      const results = await Promise.all(imagePromises);
      setGeneratedImages(results);

      // Save to history
      const newHistoryEntry: HistoryEntry = {
        id: `shoot-${Date.now()}`,
        timestamp: Date.now(),
        uploadedImage: mainImageEncoded,
        selectedGender,
        selectedPoses,
        stylePrompt,
        customPoses: customPoseLines,
        uploadedAccessories: accessoriesEncoded,
        generatedImages: results,
      };
      await addHistoryEntry(newHistoryEntry);
      setHistory(prev => [newHistoryEntry, ...prev].slice(0, MAX_HISTORY_ITEMS));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during image generation. Please try again.';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [uploadedImage, selectedPoses, stylePrompt, customPosesInput, uploadedAccessories, selectedGender]);

  // Modal navigation handlers
  const handleViewImage = (index: number) => setViewingImageIndex(index);
  const handleCloseModal = () => setViewingImageIndex(null);
  const handleNextImage = () => {
    if (viewingImageIndex !== null) {
      setViewingImageIndex((viewingImageIndex + 1) % generatedImages.length);
    }
  };
  const handlePrevImage = () => {
     if (viewingImageIndex !== null) {
      setViewingImageIndex((viewingImageIndex - 1 + generatedImages.length) % generatedImages.length);
    }
  }

  const handleSaveToProject = useCallback(() => {
    if (generatedImages.length === 0) {
      alert('No images to save.');
      return;
    }
    setIsProjectSelectionModalOpen(true);
  }, [generatedImages.length]);

  const handleProjectSelected = useCallback(async (selectedProjectId: number) => {
    if (generatedImages.length === 0) return;

    try {
      // Find the most recent history entry that matches current session
      // Sort by timestamp descending and find the first match
      const matchingHistoryEntry = [...history]
        .sort((a, b) => b.timestamp - a.timestamp)
        .find(entry => 
          entry.generatedImages.length === generatedImages.length &&
          entry.selectedGender === selectedGender &&
          entry.stylePrompt === stylePrompt
        );

      // Save each generated image as a separate asset
      for (const image of generatedImages) {
        addProjectAssetFromStudio(selectedProjectId, {
          name: image.pose?.name || `Model Shoot ${Date.now()}`,
          imageUrl: image.url,
          sourceApp: 'model-shoots',
          metadata: {
            pose: image.pose,
            prompt: image.prompt,
            selectedGender,
            stylePrompt,
            createdAt: Date.now(),
            historyId: matchingHistoryEntry?.id, // Store history ID for restoration
          },
        });
      }

      // Show success message (you might want to add a toast system here)
      alert(`Saved ${generatedImages.length} image(s) to project!`);
      
      // Optionally navigate back to project page after a short delay
      setTimeout(() => {
        navigate(`/workspace/project/${selectedProjectId}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving to project:', error);
      alert('Failed to save images to project.');
    }
  }, [generatedImages, selectedGender, stylePrompt, history, addProjectAssetFromStudio, navigate]);

  // History handlers
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete history item:", err);
      setError("Failed to delete history item.");
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire photoshoot history? This cannot be undone.')) {
      try {
        await clearDbHistory();
        setHistory([]);
      } catch (err) {
        console.error("Failed to clear history:", err);
        setError("Failed to clear history.");
      }
    }
  };

  const handleRestoreHistoryItem = async (id: string) => {
    const itemToRestore = history.find(item => item.id === id);
    if (!itemToRestore) return;

    setIsHistoryPanelOpen(false);
    setIsLoading(true);
    setLoadingMessage('Restoring photoshoot session...');
    
    // Clear existing previews
    if (uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
    uploadedAccessoryPreviews.forEach(url => URL.revokeObjectURL(url));

    try {
      // Restore main image
      const mainImageDataUrl = `data:${itemToRestore.uploadedImage.mimeType};base64,${itemToRestore.uploadedImage.base64Data}`;
      const mainImageFile = await dataUrlToFile(mainImageDataUrl, `restored-image-${Date.now()}`);
      setUploadedImage(mainImageFile);
      setUploadedImagePreview(URL.createObjectURL(mainImageFile));

      // Restore accessories
      const accessoryFiles = await Promise.all(
        itemToRestore.uploadedAccessories.map(async (acc, index) => {
          const accDataUrl = `data:${acc.mimeType};base64,${acc.base64Data}`;
          return dataUrlToFile(accDataUrl, `restored-accessory-${index}-${Date.now()}`);
        })
      );
      setUploadedAccessories(accessoryFiles);
      setUploadedAccessoryPreviews(accessoryFiles.map(file => URL.createObjectURL(file)));

      // Restore other settings
      setSelectedGender(itemToRestore.selectedGender);
      setSelectedPoses(itemToRestore.selectedPoses);
      setStylePrompt(itemToRestore.stylePrompt);
      setCustomPosesInput(itemToRestore.customPoses?.join('\n') || '');
      setGeneratedImages(itemToRestore.generatedImages);

      studioControlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      setError("Failed to restore session. The data might be corrupted.");
      console.error("Restoration error:", err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }

  const totalSelectedPoses = selectedPoses.length + customPosesInput.split('\n').filter(p => p.trim() !== '').length;
  
  return (
    <div className="bg-nutshel-gray-dark min-h-screen font-sans">
      <header className="absolute top-0 right-0 p-4 md:p-6 z-10">
        <Tooltip tip="View photoshoot history" position="left">
          <Button 
            variant="secondary" 
            size="icon"
            onClick={() => setIsHistoryPanelOpen(true)}
            aria-label={`View photoshoot history (${history.length} items)`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </Tooltip>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        <div ref={heroRef}>
          <Hero 
            onImageUpload={handleSelectNewImage}
            onOpenLibraryClick={() => setIsModelLibraryOpen(true)}
          />
        </div>
        
        {uploadedImagePreview && (
          <div ref={studioControlsRef} id="studio-controls" className="animate-fade-in-up mt-16 p-6 md:p-8 bg-nutshel-gray rounded-2xl shadow-2xl border border-white/10">
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Customize Your Photoshoot</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 flex flex-col items-center">
                 <h3 className="text-xl font-semibold mb-4 text-center text-white">Your Uploaded Image</h3>
                 <div className="relative group">
                    <img src={uploadedImagePreview} alt="User upload" className="rounded-xl w-48 h-48 object-cover shadow-lg border-4 border-white/10" />
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip tip="Upload a different image">
                        <Button variant="secondary" onClick={handleReset}>Replace Image</Button>
                      </Tooltip>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-2">
                <PoseSelector 
                  selectedGender={selectedGender}
                  onGenderChange={setSelectedGender}
                  selectedPoses={selectedPoses}
                  onPoseSelect={handlePoseSelect}
                  customPosesInput={customPosesInput}
                  onCustomPosesChange={setCustomPosesInput}
                  poseSuggestions={poseSuggestions}
                  isFetchingPoseSuggestions={isFetchingPoseSuggestions}
                  onFetchPoseSuggestions={handleFetchPoseSuggestions}
                  onPoseSuggestionClick={handlePoseSuggestionClick}
                />
              </div>
            </div>
            
            <ControlsPanel
              stylePrompt={stylePrompt}
              onStylePromptChange={setStylePrompt}
              styleSuggestions={styleSuggestions}
              isFetchingSuggestions={isFetchingSuggestions}
              onSuggestionClick={(suggestion) => setStylePrompt(prev => prev ? `${prev}\n${suggestion}` : suggestion)}
              onFetchSuggestions={handleFetchSuggestions}
              uploadedAccessoryPreviews={uploadedAccessoryPreviews}
              onAccessoryUpload={handleAccessoryUpload}
              onAccessoryRemove={handleAccessoryRemove}
            />

            <div className="text-center mt-12">
              <Button 
                onClick={handleGenerate}
                disabled={isLoading || totalSelectedPoses === 0}
                size="lg"
                className="shadow-lg shadow-nutshel-blue/20"
              >
                {isLoading ? 'Generating...' : `Generate ${totalSelectedPoses} Image${totalSelectedPoses !== 1 ? 's' : ''}`}
              </Button>
              {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
          </div>
        )}

        <div ref={galleryRef}>
          <GeneratedGallery
            images={generatedImages}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            onImageClick={handleViewImage}
            onStartNew={handleReset}
            projectId={projectId}
            projectName={projectNameFromState || project?.name}
            onSaveToProject={handleSaveToProject}
          />
        </div>

      </main>

      {viewingImageIndex !== null && generatedImages[viewingImageIndex] && (
        <ImageModal
          image={generatedImages[viewingImageIndex]}
          onClose={handleCloseModal}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          isFirst={viewingImageIndex === 0}
          isLast={viewingImageIndex === generatedImages.length - 1}
        />
      )}

      <ModelLibrary
        isOpen={isModelLibraryOpen}
        onClose={() => setIsModelLibraryOpen(false)}
        onSelect={handleModelSelect}
      />

      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        onRestore={handleRestoreHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />
      <ProjectSelectionModal
        isOpen={isProjectSelectionModalOpen}
        onClose={() => setIsProjectSelectionModalOpen(false)}
        onSelect={handleProjectSelected}
        title="Save to Project"
        description="Choose a project to save your generated images to, or create a new one."
      />
    </div>
  );
};

export default App;
