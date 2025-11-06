
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultsGallery } from './components/ResultsGallery';
import { Loader } from './components/Loader';
import { EditModal } from './components/EditModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { generateProductImages, refineProductImage, generateImageVariation, getProductName, analyzeImageForEditingSuggestions, analyzeImageForSceneSuggestions, analyzeImageForArtisticSuggestions } from './services/geminiService';
import type { GeneratedImage, AppState, PhotoshootConfig, HistoryItem } from './types';
import { AppStatus } from './types';
import { fileToBase64, addHistoryItem, getAllHistoryItems, deleteHistoryItem, clearHistory } from './utils/fileUtils';
import { Toast } from './components/Toast';
import { HistoryPanel } from './components/HistoryPanel';
import { ShareModal } from './components/ShareModal';
import { useProjects } from '../nutshel/contexts/ProjectContext';
import ProjectSelectionModal from '../nutshel/components/ProjectSelectionModal';

const DEFAULT_ANGLES = [
  'front view'
];

interface EditingState {
  index: number;
  image: GeneratedImage;
  originalImage: GeneratedImage;
}

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addProjectAssetFromStudio, getProjectById } = useProjects();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [styleReferenceFile, setStyleReferenceFile] = useState<File | null>(null);
  const [originalGeneratedImages, setOriginalGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [appState, setAppState] = useState<AppState>({ status: AppStatus.IDLE, message: '' });
  const [progress, setProgress] = useState(0);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isFetchingEditSuggestions, setIsFetchingEditSuggestions] = useState(false);
  const [editSuggestions, setEditSuggestions] = useState<string[]>([]);
  const [generatingVariations, setGeneratingVariations] = useState<Record<number, boolean>>({});
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  const [isAnalyzingSceneSuggestions, setIsAnalyzingSceneSuggestions] = useState(false);
  const [isAnalyzingArtisticSuggestions, setIsAnalyzingArtisticSuggestions] = useState(false);
  const [aiStyleSuggestions, setAiStyleSuggestions] = useState<string[]>([]);
  const [aiArtisticSuggestions, setAiArtisticSuggestions] = useState<string[]>([]);
  const [productName, setProductName] = useState<string>('product');
  const [viewingUploadedImageSrc, setViewingUploadedImageSrc] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
  const [sharingImage, setSharingImage] = useState<GeneratedImage | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [restoredProductImageSrc, setRestoredProductImageSrc] = useState<string | null>(null);
  const [restoredStyleImageSrc, setRestoredStyleImageSrc] = useState<string | null>(null);
  const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] = useState(false);

  // Get projectId and historyId from location state
  const projectId = (location.state as any)?.projectId as number | undefined;
  const projectNameFromState = (location.state as any)?.projectName as string | undefined;
  const historyIdFromState = (location.state as any)?.historyId as number | undefined;
  const project = projectId ? getProjectById(projectId) : null;

  // Restore from history if historyId is provided
  useEffect(() => {
    if (historyIdFromState && history.length > 0) {
      const historyItem = history.find(item => item.id === historyIdFromState);
      if (historyItem) {
        handleRestoreFromHistory(historyItem);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIdFromState, history.length]);


  const [photoshootConfig, setPhotoshootConfig] = useState<PhotoshootConfig>({
      stylePrompt: '',
      negativePrompt: '',
      selectedAngles: DEFAULT_ANGLES,
      artisticStylePrompt: ''
  });
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now(), message, type });
  };

  // Load history from IndexedDB on initial render
  useEffect(() => {
    const loadHistory = async () => {
        try {
            const items = await getAllHistoryItems();
            setHistory(items);
        } catch (error) {
            console.error("Failed to load history from IndexedDB:", error);
            showToast("Could not load history.", "error");
        }
    };
    loadHistory();
  }, []);


  useEffect(() => {
    // Automatically scroll to results when generation is complete
    if (appState.status === AppStatus.SUCCESS && generatedImages.length > 0) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [appState, generatedImages.length]);

  const handleImageUpload = async (file: File) => {
    setUploadedFile(file);
    // When a user uploads a new file, it overrides any restored state
    setRestoredProductImageSrc(null);
    setRestoredStyleImageSrc(null);
    handleReset(false); 
    
    setProductName('product');
    try {
        const { data, mimeType } = await fileToBase64(file);
        const name = await getProductName(data, mimeType);
        setProductName(name);
    } catch (error) {
        console.error("Error getting product name:", error);
        showToast("AI couldn't get the product name.", "error");
    }
  };
  
  const handleStyleReferenceUpload = (file: File) => {
    setStyleReferenceFile(file);
    setRestoredStyleImageSrc(null);
  };
  
  const handleRemoveStyleReference = () => {
    setStyleReferenceFile(null);
    setRestoredStyleImageSrc(null);
  };

  const handleReset = (fullReset = true) => {
    if (fullReset) {
      setUploadedFile(null);
      setProductName('product');
      setRestoredProductImageSrc(null); // Clear restored state on full reset
    }
    setStyleReferenceFile(null);
    setRestoredStyleImageSrc(null); // Clear restored style on any reset
    setGeneratedImages([]);
    setOriginalGeneratedImages([]);
    setPhotoshootConfig({ stylePrompt: '', negativePrompt: '', selectedAngles: DEFAULT_ANGLES, artisticStylePrompt: '' });
    setAppState({ status: AppStatus.IDLE, message: '' });
    setAiStyleSuggestions([]);
    setAiArtisticSuggestions([]);
  };

  const handleGenerate = useCallback(async () => {
    const currentFile = uploadedFile || restoredProductImageSrc;
    if (!currentFile) {
      showToast('Please upload an image first.', 'error');
      return;
    }
    if (photoshootConfig.selectedAngles.length === 0) {
      showToast('Please select at least one angle to generate.', 'error');
      return;
    }
    
    setAppState({ status: AppStatus.LOADING, message: 'Preparing your product for its photoshoot...' });
    setProgress(0);
    setGeneratedImages([]); // Clear previous results immediately
    setOriginalGeneratedImages([]);

    try {
      const productImg = await fileToBase64(currentFile);
      let styleImg: { data: string; mimeType: string } | null = null;
      if (styleReferenceFile || restoredStyleImageSrc) {
        styleImg = await fileToBase64(styleReferenceFile || restoredStyleImageSrc!);
      }

      const images = await generateProductImages(
        productImg.data,
        productImg.mimeType,
        photoshootConfig,
        (message, current, total) => {
           setAppState({ status: AppStatus.LOADING, message });
           setProgress(Math.round((current / total) * 100));
        },
        styleImg?.data,
        styleImg?.mimeType,
      );
        
      if (images.length === 0) {
         showToast('The AI could not generate images. Please try a different product photo or prompt.', 'error');
         setAppState({ status: AppStatus.IDLE, message: '' });
         return;
      }

      const formattedImages = images.map((src, index) => ({
        src,
        name: `${productName}_${photoshootConfig.selectedAngles[index % photoshootConfig.selectedAngles.length].replace(/ /g, '_')}.png`,
      }));
      
      setGeneratedImages(formattedImages);
      setOriginalGeneratedImages(formattedImages);
      setAppState({ status: AppStatus.SUCCESS, message: '' }); // Clear loading message
      showToast('Your product photoshoot is complete!', 'success');
      
       // Save to history
      try {
          const itemToSave: Omit<HistoryItem, 'id'> = {
              timestamp: new Date().toISOString(),
              productImageSrc: `data:${productImg.mimeType};base64,${productImg.data}`,
              styleReferenceImageSrc: styleImg ? `data:${styleImg.mimeType};base64,${styleImg.data}` : undefined,
              config: photoshootConfig,
              generatedImages: formattedImages,
              productName: productName,
          };
          const newHistoryItem = await addHistoryItem(itemToSave);
          setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      } catch (error) {
          console.error("Failed to save history item:", error);
          showToast("Could not save session to history.", "error");
      }

    } catch (error) {
      console.error('Error generating images:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Generation failed: ${errorMessage}`, 'error');
      setAppState({ status: AppStatus.IDLE, message: '' });
    }
  }, [uploadedFile, styleReferenceFile, photoshootConfig, productName, restoredProductImageSrc, restoredStyleImageSrc]);
  
    const handleGetSceneSuggestions = async () => {
    const fileToAnalyze = uploadedFile || restoredProductImageSrc;
    if (!fileToAnalyze) {
      showToast('Please upload an image first.', 'error');
      return;
    }
    
    setIsAnalyzingSceneSuggestions(true);
    try {
      const { data, mimeType } = await fileToBase64(fileToAnalyze);
      const suggestions = await analyzeImageForSceneSuggestions(data, mimeType);
      setAiStyleSuggestions(suggestions);
    } catch (error) {
      console.error("Error analyzing image for scene suggestions:", error);
      showToast("AI couldn't analyze the image for scene suggestions.", "error");
    } finally {
      setIsAnalyzingSceneSuggestions(false);
    }
  };

  const handleGetArtisticSuggestions = async () => {
    const fileToAnalyze = uploadedFile || restoredProductImageSrc;
    if (!fileToAnalyze) {
      showToast('Please upload an image first.', 'error');
      return;
    }
    
    setIsAnalyzingArtisticSuggestions(true);
    try {
      const { data, mimeType } = await fileToBase64(fileToAnalyze);
      const suggestions = await analyzeImageForArtisticSuggestions(data, mimeType);
      setAiArtisticSuggestions(suggestions);
    } catch (error) {
      console.error("Error analyzing image for artistic suggestions:", error);
      showToast("AI couldn't analyze the image for artistic suggestions.", "error");
    } finally {
      setIsAnalyzingArtisticSuggestions(false);
    }
  };

  const handleOpenEditModal = (index: number) => {
    setEditingState({ 
        index, 
        image: generatedImages[index],
        originalImage: originalGeneratedImages[index]
    });
    setEditSuggestions([]); // Reset suggestions
  };

  const handleCloseEditModal = () => {
    setEditingState(null);
    setEditSuggestions([]); // Reset suggestions
  };
  
  const handleGetEditSuggestions = async () => {
    if (!editingState) return;

    setIsFetchingEditSuggestions(true);
    setEditSuggestions([]);
    try {
      const { src } = editingState.image; // Use the *current* image for suggestions
      const { data, mimeType } = await fileToBase64(src);
      const suggestions = await analyzeImageForEditingSuggestions(data, mimeType);
      setEditSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching edit suggestions:", error);
      showToast("Couldn't get AI suggestions for editing.", "error");
    } finally {
      setIsFetchingEditSuggestions(false);
    }
  };

  const handleRefineImage = async (prompt: string) => {
    if (!editingState) return;
    
    setIsRefining(true);

    try {
      const { src } = editingState.image;
      const { data, mimeType } = await fileToBase64(src);

      const refinedImageSrc = await refineProductImage(data, mimeType, prompt);

      if (refinedImageSrc) {
        const updatedImages = [...generatedImages];
        updatedImages[editingState.index] = {
          ...updatedImages[editingState.index],
          src: refinedImageSrc,
        };
        setGeneratedImages(updatedImages);
        showToast('Image refined successfully!', 'success');
      } else {
        throw new Error("The AI failed to refine the image.");
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
       showToast(`Refinement failed: ${errorMessage}`, 'error');
    } finally {
      setIsRefining(false);
      handleCloseEditModal();
    }
  };

  const handleGenerateVariation = async (index: number) => {
    setGeneratingVariations(prev => ({ ...prev, [index]: true }));
     try {
      const imageToVary = generatedImages[index];
      const { data, mimeType } = await fileToBase64(imageToVary.src);
       
      const newImageSrc = await generateImageVariation(data, mimeType);
       if (newImageSrc) {
        const updatedImages = [...generatedImages];
        updatedImages[index] = { ...updatedImages[index], src: newImageSrc };
        setGeneratedImages(updatedImages);
        showToast('New variation generated.', 'success');
      } else {
        throw new Error("The AI failed to generate a variation.");
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
       showToast(`Variation failed: ${errorMessage}`, 'error');
    } finally {
      setGeneratingVariations(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const handleRestoreOriginal = () => {
      if (!editingState) return;
      const { index } = editingState;
      const updatedImages = [...generatedImages];
      updatedImages[index] = originalGeneratedImages[index];
      setGeneratedImages(updatedImages);
      setEditingState(state => state ? {
          ...state,
          image: originalGeneratedImages[index]
      }: null);
  };

  const handleOpenImageViewer = (index: number) => {
    setViewingImageIndex(index);
  };

  const handleCloseImageViewer = () => {
      setViewingImageIndex(null);
  };

  const handleViewNextImage = () => {
      if (viewingImageIndex !== null && viewingImageIndex < generatedImages.length - 1) {
          setViewingImageIndex(viewingImageIndex + 1);
      }
  };

  const handleViewPrevImage = () => {
      if (viewingImageIndex !== null && viewingImageIndex > 0) {
          setViewingImageIndex(viewingImageIndex - 1);
      }
  };
  
  const handleOpenUploadedImageViewer = (src: string) => {
    setViewingUploadedImageSrc(src);
  };

  const handleCloseUploadedImageViewer = () => {
      setViewingUploadedImageSrc(null);
  };

  const handleOpenShareModal = (index: number) => {
    setSharingImage(generatedImages[index]);
  };

  const handleCloseShareModal = () => {
      setSharingImage(null);
  };

  const handleSaveToProject = useCallback(() => {
    if (generatedImages.length === 0) {
      showToast('No images to save.', 'error');
      return;
    }
    setIsProjectSelectionModalOpen(true);
  }, [generatedImages.length, showToast]);

  const handleProjectSelected = useCallback(async (selectedProjectId: number) => {
    if (generatedImages.length === 0) return;

    try {
      // Find the most recent history entry that matches current session
      // This is the history entry that was created when images were generated
      // Sort by timestamp descending and find the first match
      const matchingHistoryItem = [...history]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .find(item => 
          item.productName === productName &&
          item.generatedImages.length === generatedImages.length &&
          JSON.stringify(item.config) === JSON.stringify(photoshootConfig)
        );

      // Save each generated image as a separate asset
      for (const image of generatedImages) {
        addProjectAssetFromStudio(selectedProjectId, {
          name: image.name || `${productName}_${Date.now()}`,
          imageUrl: image.src,
          sourceApp: 'product-photoshoots',
          metadata: {
            productName,
            photoshootConfig,
            createdAt: Date.now(),
            historyId: matchingHistoryItem?.id, // Store history ID for restoration
          },
        });
      }

      showToast(`Saved ${generatedImages.length} image(s) to project!`, 'success');
      
      // Optionally navigate back to project page after a short delay
      setTimeout(() => {
        navigate(`/workspace/project/${selectedProjectId}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving to project:', error);
      showToast('Failed to save images to project.', 'error');
    }
  }, [generatedImages, productName, photoshootConfig, history, addProjectAssetFromStudio, navigate, showToast]);

  // History Panel Handlers
  const handleToggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
  };

  const handleRestoreFromHistory = (item: HistoryItem) => {
    setPhotoshootConfig(item.config);
    setGeneratedImages(item.generatedImages);
    setOriginalGeneratedImages(item.generatedImages);
    setProductName(item.productName);
    setRestoredProductImageSrc(item.productImageSrc);
    setRestoredStyleImageSrc(item.styleReferenceImageSrc || null);

    // Clear file inputs as we are restoring from src, not a File object
    setUploadedFile(null);
    setStyleReferenceFile(null);
    
    // Reset AI suggestions as they were for the original image
    setAiStyleSuggestions([]);
    setAiArtisticSuggestions([]);
    
    setIsHistoryPanelOpen(false);
    showToast('Session restored from history!', 'success');
    
    // Scroll to results after restoring
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDeleteHistoryItem = async (id: number) => {
    try {
        await deleteHistoryItem(id);
        setHistory(prev => prev.filter(item => item.id !== id));
        showToast('History item deleted.', 'success');
    } catch (error) {
        console.error("Failed to delete history item:", error);
        showToast("Could not delete history item.", "error");
    }
  };

  const handleClearHistory = async () => {
    try {
        await clearHistory();
        setHistory([]);
        showToast('History cleared.', 'success');
    } catch (error) {
        console.error("Failed to clear history:", error);
        showToast("Could not clear history.", "error");
    }
  };


  const isGenerating = appState.status === AppStatus.LOADING;
  const showUploader = appState.status !== AppStatus.LOADING;
  const hasUploadedOrRestored = uploadedFile || restoredProductImageSrc;

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header onToggleHistory={handleToggleHistoryPanel} />

        {hasUploadedOrRestored && (
            <div className="w-full flex justify-end -mb-4 pr-4">
                 <button 
                    onClick={() => handleReset(true)}
                    className="px-4 py-2 text-sm font-semibold text-white/80 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                >
                    Start Over
                </button>
            </div>
        )}

        <main className="mt-8">
          {isGenerating && <Loader message={appState.message} progress={progress} />}
          
          {showUploader && (
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              onGenerate={handleGenerate} 
              onReset={() => handleReset(true)}
              uploadedFile={uploadedFile}
              isGenerating={isGenerating}
              config={photoshootConfig}
              onConfigChange={setPhotoshootConfig}
              aiStyleSuggestions={aiStyleSuggestions}
              aiArtisticSuggestions={aiArtisticSuggestions}
              isAnalyzingSceneSuggestions={isAnalyzingSceneSuggestions}
              isAnalyzingArtisticSuggestions={isAnalyzingArtisticSuggestions}
              onGetSceneSuggestions={handleGetSceneSuggestions}
              onGetArtisticSuggestions={handleGetArtisticSuggestions}
              styleReferenceFile={styleReferenceFile}
              onStyleReferenceUpload={handleStyleReferenceUpload}
              onRemoveStyleReference={handleRemoveStyleReference}
              onViewImage={handleOpenUploadedImageViewer}
              productPreviewSrc={restoredProductImageSrc}
              stylePreviewSrc={restoredStyleImageSrc}
            />
          )}

          {generatedImages.length > 0 && (
            <div ref={resultsRef}>
                <ResultsGallery 
                    images={generatedImages} 
                    onEditImage={handleOpenEditModal} 
                    onGenerateVariation={handleGenerateVariation}
                    generatingVariations={generatingVariations}
                    onOpenImageViewer={handleOpenImageViewer}
                    onShareImage={handleOpenShareModal}
                    productName={productName}
                    projectId={projectId}
                    projectName={projectNameFromState || project?.name}
                    onSaveToProject={handleSaveToProject}
                />
            </div>
          )}
        </main>
        
        {editingState && (
          <EditModal
            isOpen={!!editingState}
            onClose={handleCloseEditModal}
            originalImageSrc={editingState.originalImage.src}
            currentImageSrc={editingState.image.src}
            onRefine={handleRefineImage}
            onRestore={handleRestoreOriginal}
            isRefining={isRefining}
            onGetSuggestions={handleGetEditSuggestions}
            suggestions={editSuggestions}
            isFetchingSuggestions={isFetchingEditSuggestions}
          />
        )}
        {viewingImageIndex !== null && (
          <ImageViewerModal
            isOpen={viewingImageIndex !== null}
            imageSrc={generatedImages[viewingImageIndex]?.src}
            onClose={handleCloseImageViewer}
            onNext={handleViewNextImage}
            onPrev={handleViewPrevImage}
            canGoNext={viewingImageIndex < generatedImages.length - 1}
            canGoPrev={viewingImageIndex > 0}
          />
        )}
        {viewingUploadedImageSrc && (
          <ImageViewerModal
            isOpen={!!viewingUploadedImageSrc}
            imageSrc={viewingUploadedImageSrc}
            onClose={handleCloseUploadedImageViewer}
            onNext={() => {}}
            onPrev={() => {}}
            canGoNext={false}
            canGoPrev={false}
          />
        )}
        <HistoryPanel
          isOpen={isHistoryPanelOpen}
          onClose={handleToggleHistoryPanel}
          history={history}
          onRestore={handleRestoreFromHistory}
          onDelete={handleDeleteHistoryItem}
          onClear={handleClearHistory}
        />
        <ShareModal
            isOpen={!!sharingImage}
            onClose={handleCloseShareModal}
            image={sharingImage}
            showToast={showToast}
        />
        <ProjectSelectionModal
          isOpen={isProjectSelectionModalOpen}
          onClose={() => setIsProjectSelectionModalOpen(false)}
          onSelect={handleProjectSelected}
          title="Save to Project"
          description="Choose a project to save your generated images to, or create a new one."
        />
      </div>
       {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
    </div>
  );
};

export default App;
