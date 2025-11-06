
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImageUploader } from './components/ImageUploader';
import { ModeSelector } from './components/ModeSelector';
import { OutputDisplay } from './components/OutputDisplay';
import { GenerationMode, HistoryEntry } from './types';
import { generateImage } from './services/geminiService';
import { SparklesIcon, HistoryIcon } from './components/icons/Icons';
import { HistoryPanel } from './components/HistoryPanel';
import { fileToDataUrl, dataURLtoFile } from './utils/fileUtils';
import { getAllHistory, addHistoryEntry, deleteHistoryEntry, clearHistory } from './utils/historyDb';
import { useProjects } from '../contexts/ProjectContext';
import ProjectSelectionModal from '../components/ProjectSelectionModal';

const MAX_HISTORY_ITEMS = 15;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addProjectAssetFromStudio, getProjectById } = useProjects();
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.Style);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] = useState(false);

  // Get projectId and historyId from location state
  const projectId = (location.state as any)?.projectId as number | undefined;
  const projectNameFromState = (location.state as any)?.projectName as string | undefined;
  const historyIdFromState = (location.state as any)?.historyId as string | undefined;
  const project = projectId ? getProjectById(projectId) : null;

  // Restore from history if historyId is provided
  useEffect(() => {
    if (historyIdFromState && history.length > 0) {
      const historyEntry = history.find(entry => entry.id === historyIdFromState);
      if (historyEntry) {
        handleReuse(historyEntry);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIdFromState, history.length]);

  // Load history from IndexedDB on initial render
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyFromDb = await getAllHistory();
        setHistory(historyFromDb);
      } catch (e) {
        console.error("Failed to load history from IndexedDB", e);
      }
    };
    loadHistory();
  }, []);

  const handleGeneration = useCallback(async () => {
    if (!originalImage || !referenceImage) {
      setError('Please upload both an original and a reference image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutputImage(null);

    try {
      const result = await generateImage(originalImage, referenceImage, generationMode);
      setOutputImage(result);

      // Add to history on success
      const [originalImageDataUrl, referenceImageDataUrl] = await Promise.all([
          fileToDataUrl(originalImage),
          fileToDataUrl(referenceImage)
      ]);
      
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalImage: originalImageDataUrl,
        originalImageName: originalImage.name,
        referenceImage: referenceImageDataUrl,
        referenceImageName: referenceImage.name,
        outputImage: result,
        mode: generationMode,
        timestamp: Date.now(),
      };
      
      try {
        await addHistoryEntry(newEntry);
        // After successfully adding to DB, update state
        setHistory(prevHistory => [newEntry, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));
      } catch (e) {
        console.error("Failed to save history to IndexedDB", e);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, referenceImage, generationMode]);

  const handleReuse = useCallback((entry: HistoryEntry) => {
    try {
      const originalFile = dataURLtoFile(entry.originalImage, entry.originalImageName);
      const referenceFile = dataURLtoFile(entry.referenceImage, entry.referenceImageName || 'reference.png');

      setOriginalImage(originalFile);
      setReferenceImage(referenceFile);
      setGenerationMode(entry.mode);
      setOutputImage(entry.outputImage);
      
      setIsHistoryPanelOpen(false);
      // Scroll to top to see the reused inputs
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Failed to reuse history item:", e);
      setError("Could not reuse the selected images. They may be corrupted.");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      setHistory(prevHistory => prevHistory.filter(entry => entry.id !== id));
    } catch (e) {
      console.error("Failed to delete history item from IndexedDB", e);
    }
  }, []);

  const handleClearAllHistory = useCallback(async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear history from IndexedDB", e);
    }
  }, []);

  const handleSaveToProject = useCallback(() => {
    if (!outputImage) {
      alert('No image to save.');
      return;
    }
    setIsProjectSelectionModalOpen(true);
  }, [outputImage]);

  const handleProjectSelected = useCallback(async (selectedProjectId: number) => {
    if (!outputImage) return;

    try {
      // Find the most recent history entry that matches current session
      // Sort by timestamp descending and find the first match
      const matchingHistoryEntry = [...history]
        .sort((a, b) => b.timestamp - a.timestamp)
        .find(entry => 
          entry.outputImage === outputImage &&
          entry.mode === generationMode
        );

      addProjectAssetFromStudio(selectedProjectId, {
        name: `Clone Shoot ${new Date().toLocaleDateString()}`,
        imageUrl: outputImage,
        sourceApp: 'clone-shoots',
        metadata: {
          generationMode,
          originalImageName: originalImage?.name,
          referenceImageName: referenceImage?.name,
          createdAt: Date.now(),
          historyId: matchingHistoryEntry?.id, // Store history ID for restoration
        },
      });

      alert('Image saved to project!');
      
      // Optionally navigate back to project page after a short delay
      setTimeout(() => {
        navigate(`/workspace/project/${selectedProjectId}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving to project:', error);
      alert('Failed to save image to project.');
    }
  }, [outputImage, generationMode, originalImage, referenceImage, history, addProjectAssetFromStudio, navigate]);

  return (
    <div className="min-h-screen bg-nutshel-gray-dark text-gray-300 font-sans">
      <button
        onClick={() => setIsHistoryPanelOpen(true)}
        className="fixed top-6 right-6 z-30 bg-nutshel-gray/50 backdrop-blur-md border border-white/10 rounded-full w-12 h-12 flex items-center justify-center text-gray-300 hover:text-white hover:border-white/20 transition-all"
        aria-label="Open generation history"
      >
        <HistoryIcon className="w-6 h-6" />
      </button>

      <main className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-20 md:mb-32 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-6xl sm:text-8xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tighter">
              Clone Shoots
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300 font-sans">
            Transfer styles, poses, or both from a reference image.
          </p>
        </section>

        {/* Main Interaction Area */}
        <section className="mb-20 md:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left Column: Inputs & Controls */}
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ImageUploader title="Original Image" image={originalImage} onImageUpload={setOriginalImage} />
                <ImageUploader title="Inspiration Image" image={referenceImage} onImageUpload={setReferenceImage} />
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
                <ModeSelector selectedMode={generationMode} onModeChange={setGenerationMode} />
                <button
                  onClick={handleGeneration}
                  disabled={!originalImage || !referenceImage || isLoading}
                  className="w-full mt-6 bg-nutshel-blue text-black font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6 mr-2" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="lg:sticky lg:top-24 h-full">
              <OutputDisplay 
                outputImage={outputImage} 
                isLoading={isLoading} 
                error={error}
                projectId={projectId}
                projectName={projectNameFromState || project?.name}
                onSaveToProject={handleSaveToProject}
              />
            </div>
          </div>
        </section>
      </main>
      
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        history={history}
        onReuse={handleReuse}
        onDelete={handleDelete}
        onClearAll={handleClearAllHistory}
        onClose={() => setIsHistoryPanelOpen(false)}
      />
      <ProjectSelectionModal
        isOpen={isProjectSelectionModalOpen}
        onClose={() => setIsProjectSelectionModalOpen(false)}
        onSelect={handleProjectSelected}
        title="Save to Project"
        description="Choose a project to save your generated image to, or create a new one."
      />
    </div>
  );
}
