import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CompositionState, FileWithPreview, WizardStep, Accessory, HistoryItem } from './types';
import { CLOTHING_PRESETS, WIZARD_STEPS, ACCESSORY_PRESETS } from './constants';
import { StepIndicator } from './components/StepIndicator';
import { ImageUploader } from './components/ImageUploader';
import { TextArea } from './components/TextInput';
import { generateComposition, getBackgroundSuggestions, getCompositionSuggestions } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ArrowLeftIcon, ArrowRightIcon, LightBulbIcon, XIcon, SparklesIcon, HistoryIcon, ShareIcon } from './components/IconComponents';
import { Tooltip } from './components/Tooltip';
import { CompositionSummary } from './components/CompositionSummary';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { TextInput } from './components/TextInput';
import { HistoryPanel } from './components/HistoryPanel';
import { serializableToState, stateToSerializable } from './utils/historyUtils';
import { addHistoryItem, getAllHistoryItems, clearHistoryDB } from './utils/db';
import { useProjects } from '../contexts/ProjectContext';
import ProjectSelectionModal from '../components/ProjectSelectionModal';

const initialCompositionState: CompositionState = {
  subjects: [],
  background: {
    type: 'generate',
    description: '',
    file: undefined,
  },
  accessories: [],
  clothing: {
    type: 'none',
    preset: '',
    description: '',
    file: undefined,
  },
  compositionPrompt: '',
};

// Step components are defined outside the App component to prevent re-creation on re-renders.

interface StepProps {
    state: CompositionState;
    setState: React.Dispatch<React.SetStateAction<CompositionState>>;
    onImageClick?: (file: FileWithPreview) => void;
}

const Step1Subjects: React.FC<StepProps> = ({ state, setState, onImageClick }) => (
    <div className="space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Upload Your Subjects</h2>
        <p className="text-gray-400 text-lg">Select one or more images of people, pets, or objects you want in the final composition.</p>
        <ImageUploader 
            id="subjects"
            label="Subject Images"
            files={state.subjects}
            onFilesChange={(files) => setState(s => ({...s, subjects: files}))}
            multiple
            onImageClick={onImageClick}
        />
    </div>
);

interface Step2Props extends StepProps {
    onGetSuggestions: () => void;
    suggestions: string[];
    isSuggestionsLoading: boolean;
    suggestionsError: string | null;
}

const Step2Background: React.FC<Step2Props> = ({ state, setState, onImageClick, onGetSuggestions, suggestions, isSuggestionsLoading, suggestionsError }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Set the Scene</h2>
        <p className="text-gray-400 text-lg">Choose to upload a background or describe one for the AI to generate.</p>
        <div className="flex space-x-4">
            <button onClick={() => setState(s => ({...s, background: {...s.background, type: 'generate'}}))} className={`flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-colors ${state.background.type === 'generate' ? 'bg-nutshel-accent text-black' : 'bg-white/5 hover:bg-white/10'}`}>AI Generated</button>
            <button onClick={() => setState(s => ({...s, background: {...s.background, type: 'upload'}}))} className={`flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-colors ${state.background.type === 'upload' ? 'bg-nutshel-accent text-black' : 'bg-white/5 hover:bg-white/10'}`}>Upload Image</button>
        </div>
        {state.background.type === 'generate' ? (
            <div className="space-y-4">
                <Tooltip text="Describe the scene for the AI to create. e.g., 'A futuristic city skyline at night'">
                    <TextInput
                        id="bg-description"
                        label="Background Description"
                        placeholder="e.g., A futuristic city skyline at night"
                        value={state.background.description}
                        onChange={(e) => setState(s => ({...s, background: {...s.background, description: e.target.value}}))}
                    />
                </Tooltip>

                 <div className="space-y-3 pt-2">
                    <button
                        onClick={onGetSuggestions}
                        disabled={isSuggestionsLoading || state.subjects.length === 0}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full shadow-sm text-white bg-white/10 hover:bg-white/20 transition-colors disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                       <LightBulbIcon className="w-5 h-5" />
                        {isSuggestionsLoading ? 'Getting suggestions...' : 'Get AI Suggestions'}
                    </button>
                    {state.subjects.length === 0 && <p className="text-xs text-gray-500">Upload a subject image first to get suggestions.</p>}
                    
                    {suggestionsError && <div className="p-3 bg-red-900/20 border border-red-700/50 text-red-300 rounded-xl text-sm">{suggestionsError}</div>}
                    
                    {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setState(s => ({...s, background: {...s.background, description: suggestion}}))}
                                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 text-gray-200"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <ImageUploader
                id="bg-image"
                label="Background Image"
                files={state.background.file ? [state.background.file] : []}
                onFilesChange={(files) => setState(s => ({...s, background: {...s.background, file: files[0]}}))}
                onImageClick={onImageClick}
            />
        )}
    </div>
);

const Step3Details: React.FC<StepProps> = ({ state, setState, onImageClick }) => {
    
    const addAccessory = (type: 'preset' | 'upload', data: string | FileWithPreview[]) => {
        let newAccessories: Accessory[] = [];
        if (type === 'preset' && typeof data === 'string') {
            newAccessories.push({ id: crypto.randomUUID(), type: 'preset', preset: data });
        } else if (type === 'upload' && Array.isArray(data)) {
            newAccessories = data.map(file => ({ id: crypto.randomUUID(), type: 'upload', file: file }));
        }
        
        setState(s => ({
            ...s,
            accessories: [...s.accessories, ...newAccessories]
        }));
    };

    const removeAccessory = (id: string) => {
        setState(s => ({
            ...s,
            accessories: s.accessories.filter(acc => acc.id !== id)
        }));
    };
    
    const toggleAccessoryPreset = (presetName: string) => {
        const existingAccessory = state.accessories.find(acc => acc.type === 'preset' && acc.preset === presetName);
        if (existingAccessory) {
            removeAccessory(existingAccessory.id);
        } else {
            addAccessory('preset', presetName);
        }
    };

    const toggleClothingPreset = (presetName: string) => {
        setState(s => ({
            ...s,
            clothing: {
                ...s.clothing,
                preset: s.clothing.preset === presetName ? '' : presetName,
            }
        }));
    }


    const handleRemoveAccessoryClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        removeAccessory(id);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Add Clothing & Accessories</h2>
                <p className="text-gray-400 text-lg">Define the style for your subjects.</p>
            </div>
            <div className="space-y-4 p-4 border border-white/10 rounded-xl">
                 <h3 className="font-semibold text-xl">Clothing (Optional)</h3>
                 <p className="text-sm text-gray-400">Let the AI decide, or customize the clothing with a description, style, or reference image.</p>
                 <div className="flex space-x-4">
                    <button onClick={() => setState(s => ({...s, clothing: {...initialCompositionState.clothing, type: 'none'}}))} className={`flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-colors ${state.clothing.type === 'none' ? 'bg-nutshel-accent text-black' : 'bg-white/5 hover:bg-white/10'}`}>AI Decides</button>
                    <button onClick={() => setState(s => ({...s, clothing: {...s.clothing, type: 'custom'}}))} className={`flex-1 py-3 px-4 rounded-xl text-base font-semibold transition-colors ${state.clothing.type === 'custom' ? 'bg-nutshel-accent text-black' : 'bg-white/5 hover:bg-white/10'}`}>Customize</button>
                </div>
                
                {state.clothing.type === 'custom' && (
                    <div className="space-y-6 pt-4">
                        <Tooltip text="Add specific details about the clothing, e.g., 'a red t-shirt with a logo'.">
                            <TextInput
                                id="clothing-description"
                                label="Clothing Description"
                                placeholder="e.g., a red t-shirt with a logo"
                                value={state.clothing.description}
                                onChange={(e) => setState(s => ({...s, clothing: {...s.clothing, description: e.target.value}}))}
                            />
                        </Tooltip>

                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-300">
                                Style Suggestion (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CLOTHING_PRESETS.map(preset => {
                                    const isSelected = state.clothing.preset === preset;
                                    return (
                                        <button
                                            key={preset}
                                            onClick={() => toggleClothingPreset(preset)}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                                isSelected
                                                    ? 'bg-nutshel-accent text-black'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-200'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                         <Tooltip text="Upload an image of clothing for the AI to use as inspiration.">
                            <ImageUploader
                                id="clothing-upload"
                                label="Clothing Reference (Optional)"
                                files={state.clothing.file ? [state.clothing.file] : []}
                                onFilesChange={(files) => setState(s => ({...s, clothing: {...s.clothing, file: files[0]}}))}
                                onImageClick={onImageClick}
                            />
                        </Tooltip>
                    </div>
                )}
            </div>
            <div className="space-y-4 p-4 border border-white/10 rounded-xl">
                 <h3 className="font-semibold text-xl">Accessories</h3>
                 <p className="text-sm text-gray-400">Add accessories from presets or by uploading images for the AI to intelligently place.</p>
                
                 {state.accessories.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {state.accessories.map(acc => {
                            if (acc.type === 'preset' && acc.preset) {
                                return (
                                    <div key={acc.id} className="relative group bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 text-center aspect-square">
                                        <span className="font-medium text-white break-words">{acc.preset}</span>
                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                            <button
                                                onClick={() => removeAccessory(acc.id)}
                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                                                aria-label={`Remove ${acc.preset}`}
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                            if (acc.type === 'upload' && acc.file) {
                                const file = acc.file;
                                return (
                                    <div 
                                        key={acc.id} 
                                        className="relative group rounded-xl overflow-hidden aspect-square cursor-pointer"
                                        onClick={() => onImageClick?.(file)}
                                        role="button"
                                        aria-label={`View larger image of ${file.name}`}
                                    >
                                        <img src={file.preview} alt={`Preview ${file.name}`} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleRemoveAccessoryClick(e, acc.id)}
                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 z-10"
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
                 
                 <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Add from preset
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ACCESSORY_PRESETS.map(preset => {
                                const isSelected = state.accessories.some(acc => acc.preset === preset);
                                return (
                                    <button
                                        key={preset}
                                        onClick={() => toggleAccessoryPreset(preset)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                            isSelected
                                                ? 'bg-nutshel-accent text-black'
                                                : 'bg-white/5 hover:bg-white/10 text-gray-200'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <Tooltip text="Upload an image of a specific accessory. The AI will identify it and place it on the subject.">
                        <ImageUploader 
                            id="accessories-upload"
                            label="Or upload accessory image(s)"
                            files={[]} // Pass empty array to use as an "add-only" uploader
                            onFilesChange={(files) => addAccessory('upload', files)}
                            multiple
                            onImageClick={onImageClick}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

interface Step4Props extends StepProps {
    onGetSuggestions: () => void;
    suggestions: string[];
    isSuggestionsLoading: boolean;
    suggestionsError: string | null;
}

const Step4Styling: React.FC<Step4Props> = ({ state, setState, onGetSuggestions, suggestions, isSuggestionsLoading, suggestionsError }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Describe the Final Shot</h2>
        <p className="text-gray-400 text-lg">Use a single prompt to control the lighting, camera, and subject placement for the perfect shot.</p>
        <div className="space-y-4 p-4 border border-white/10 rounded-xl">
            <Tooltip text="e.g., 'Cinematic lighting, wide shot showing the subjects in the foreground'">
                <TextArea
                    id="composition-prompt"
                    label="Composition Prompt"
                    placeholder="e.g., Golden hour lighting, close-up portrait shot, subjects are happy"
                    value={state.compositionPrompt}
                    onChange={(e) => setState(s => ({...s, compositionPrompt: e.target.value}))}
                    required
                />
            </Tooltip>

             <div className="space-y-3 pt-2">
                <button
                    onClick={onGetSuggestions}
                    disabled={isSuggestionsLoading || state.subjects.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full shadow-sm text-white bg-white/10 hover:bg-white/20 transition-colors disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                   <LightBulbIcon className="w-5 h-5" />
                    {isSuggestionsLoading ? 'Getting suggestions...' : 'Get AI Suggestions'}
                </button>
                {state.subjects.length === 0 && <p className="text-xs text-gray-500">Upload a subject image first to get suggestions.</p>}
                
                {suggestionsError && <div className="p-3 bg-red-900/20 border border-red-700/50 text-red-300 rounded-xl text-sm">{suggestionsError}</div>}
                
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => setState(s => ({...s, compositionPrompt: suggestion}))}
                                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 text-gray-200"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addProjectAssetFromStudio, getProjectById } = useProjects();
    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.Subjects);
    const [compositionState, setCompositionState] = useState<CompositionState>(initialCompositionState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [backgroundSuggestions, setBackgroundSuggestions] = useState<string[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
    const [compositionSuggestions, setCompositionSuggestions] = useState<string[]>([]);
    const [isCompositionSuggestionsLoading, setIsCompositionSuggestionsLoading] = useState(false);
    const [compositionSuggestionsError, setCompositionSuggestionsError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isWebShareSupported, setIsWebShareSupported] = useState(false);
    const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] = useState(false);
    const hasRestoredRef = useRef(false);

    // Get projectId and historyId from location state
    const projectId = (location.state as any)?.projectId as number | undefined;
    const projectNameFromState = (location.state as any)?.projectName as string | undefined;
    const historyIdFromState = (location.state as any)?.historyId as string | undefined;
    const project = projectId ? getProjectById(projectId) : null;

    // Load history from IndexedDB on initial render
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const items = await getAllHistoryItems();
                setHistory(items);
            } catch (e) {
                console.error("Failed to load history from IndexedDB", e);
                setError("Could not load your generation history.");
            }
        };
        loadHistory();
        
        // Check for Web Share API support
        if (navigator.share) {
            setIsWebShareSupported(true);
        }
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
                console.log('Restoring image-composer history:', historyIdFromState);
                handleLoadFromHistory(historyItem);
            } else {
                console.warn('History item not found for ID:', historyIdFromState);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyIdFromState, history.length]);

    const handleImageClick = (fileOrUrl: FileWithPreview | string) => {
        if (typeof fileOrUrl === 'string') {
            setPreviewImageUrl(fileOrUrl);
        } else {
            setPreviewImageUrl(fileOrUrl.preview);
        }
    };

    const handleGetBackgroundSuggestions = useCallback(async () => {
        setIsSuggestionsLoading(true);
        setSuggestionsError(null);
        setBackgroundSuggestions([]);
        try {
            const suggestions = await getBackgroundSuggestions(compositionState.subjects);
            setBackgroundSuggestions(suggestions);
        } catch (e) {
            setSuggestionsError(e instanceof Error ? e.message : 'Failed to get suggestions.');
        } finally {
            setIsSuggestionsLoading(false);
        }
    }, [compositionState.subjects]);

    const handleGetCompositionSuggestions = useCallback(async () => {
        setIsCompositionSuggestionsLoading(true);
        setCompositionSuggestionsError(null);
        setCompositionSuggestions([]);
        try {
            const suggestions = await getCompositionSuggestions(compositionState.subjects);
            setCompositionSuggestions(suggestions);
        } catch (e) {
            setCompositionSuggestionsError(e instanceof Error ? e.message : 'Failed to get suggestions.');
        } finally {
            setIsCompositionSuggestionsLoading(false);
        }
    }, [compositionState.subjects]);

    const getTotalImageCount = (state: CompositionState): number => {
        let count = state.subjects.length;
        if (state.background.type === 'upload' && state.background.file) {
            count++;
        }
        if (state.clothing.type === 'custom' && state.clothing.file) {
            count++;
        }
        count += state.accessories.filter(acc => acc.type === 'upload').length;
        return count;
    };

    const totalImages = getTotalImageCount(compositionState);
    const maxImages = 4;
    const hasTooManyImages = totalImages > maxImages;

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handleBack = () => {
        if (currentStep > 1) {
            setResult(null);
            setError(null);
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const imageUrl = await generateComposition(compositionState);
            setResult(imageUrl);

             // Save to history on success
            const serializableState = await stateToSerializable(compositionState);
            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                state: serializableState,
                resultImageUrl: imageUrl,
            };
            await addHistoryItem(newHistoryItem);
            setHistory(prevHistory => [newHistoryItem, ...prevHistory]);

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [compositionState]);

    const handleSaveToProject = useCallback(() => {
        if (!result) {
            alert('No image to save.');
            return;
        }
        setIsProjectSelectionModalOpen(true);
    }, [result]);

    const handleProjectSelected = useCallback(async (selectedProjectId: number) => {
        if (!result) return;

        try {
            // Find the most recent history entry that matches current result
            // Sort by timestamp descending and find the first match
            const matchingHistoryItem = [...history]
                .sort((a, b) => b.timestamp - a.timestamp)
                .find(item => item.resultImageUrl === result);

            addProjectAssetFromStudio(selectedProjectId, {
                name: `Image Composition ${new Date().toLocaleDateString()}`,
                imageUrl: result,
                sourceApp: 'image-composer',
                metadata: {
                    compositionState: await stateToSerializable(compositionState),
                    createdAt: Date.now(),
                    historyId: matchingHistoryItem?.id, // Store history ID for restoration
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
    }, [result, compositionState, history, addProjectAssetFromStudio, navigate]);

    const handleShare = async () => {
        if (!result || !navigator.share) {
            return;
        }

        try {
            // Convert data URL to blob and then to a file
            const response = await fetch(result);
            const blob = await response.blob();
            const file = new File([blob], 'composition.png', { type: blob.type });

            // Use the Web Share API
            await navigator.share({
                files: [file],
                title: 'AI Image Composition',
                text: 'Check out this image I created with PenUltimate Image Composer!',
            });
        } catch (error) {
            // AbortError is thrown when the user cancels the share dialog, which is not a real error.
            if ((error as Error).name !== 'AbortError') {
                console.error('Share failed:', error);
                setError('Sharing failed. Please try downloading the image instead.');
            }
        }
    };

    const handleEditStep = (step: WizardStep) => {
        setResult(null);
        setError(null);
        setCurrentStep(step);
    }

    const handleLoadFromHistory = (item: HistoryItem) => {
        const loadedState = serializableToState(item.state);
        setCompositionState(loadedState);
        setResult(item.resultImageUrl);
        setCurrentStep(WizardStep.Generate);
        setIsHistoryPanelOpen(false); // Close panel after loading
        // Reset suggestions as they are context-specific
        setBackgroundSuggestions([]);
        setCompositionSuggestions([]);
        setSuggestionsError(null);
        setCompositionSuggestionsError(null);
    };
    
    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to clear your entire generation history? This action cannot be undone.")) {
             try {
                await clearHistoryDB();
                setHistory([]);
            } catch (e) {
                console.error("Failed to clear history", e);
                setError("Could not clear history. Please try again.");
            }
        }
    };

    const renderStepContent = () => {
        const baseProps = { state: compositionState, setState: setCompositionState };
        const propsWithImageClick = { ...baseProps, onImageClick: handleImageClick };
        
        switch (currentStep) {
            case WizardStep.Subjects: return <Step1Subjects {...propsWithImageClick} />;
            case WizardStep.Background: return <Step2Background 
                {...propsWithImageClick} 
                onGetSuggestions={handleGetBackgroundSuggestions} 
                suggestions={backgroundSuggestions} 
                isSuggestionsLoading={isSuggestionsLoading} 
                suggestionsError={suggestionsError} 
            />;
            case WizardStep.Details: return <Step3Details {...propsWithImageClick} />;
            case WizardStep.Styling: return <Step4Styling 
                {...baseProps} 
                onGetSuggestions={handleGetCompositionSuggestions}
                suggestions={compositionSuggestions}
                isSuggestionsLoading={isCompositionSuggestionsLoading}
                suggestionsError={compositionSuggestionsError}
            />;
            case WizardStep.Generate:
                return (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Ready to Compose?</h2>
                        <p className="mt-2 text-gray-400 text-lg">Review your selections below and click generate to create your masterpiece.</p>
                        <div className="mt-6 text-left">
                            <CompositionSummary state={compositionState} onEdit={handleEditStep} />
                        </div>
                        {error && <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 text-red-300 rounded-xl">{error}</div>}
                        {result && (
                            <div className="mt-6 flex flex-col items-center gap-4">
                                <img
                                    src={result}
                                    alt="Generated Composition"
                                    className="rounded-xl shadow-2xl max-w-full h-auto max-h-[50vh] cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleImageClick(result)}
                                />
                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={handleSaveToProject}
                                        className="inline-flex items-center gap-2 bg-nutshel-accent hover:opacity-90 text-black font-bold py-3 px-8 rounded-full transition-opacity"
                                        title={projectNameFromState || project?.name ? `Save to ${projectNameFromState || project?.name}` : 'Save to Project'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Save to Project
                                    </button>
                                    <a href={result} download="composition.png" className="inline-flex items-center justify-center bg-nutshel-accent hover:opacity-90 text-black font-bold py-3 px-8 rounded-full transition-opacity">
                                        Download
                                    </a>
                                    <Tooltip text={isWebShareSupported ? "Share this image" : "Sharing is not supported on your browser or device"}>
                                      <div className="inline-block"> {/* Wrapper for tooltip on disabled button */}
                                        <button
                                            onClick={handleShare}
                                            disabled={!isWebShareSupported}
                                            className="inline-flex items-center gap-2 px-8 py-3 text-base font-medium rounded-full shadow-sm text-white bg-white/10 hover:bg-white/20 transition-colors disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            <ShareIcon className="w-5 h-5" />
                                            Share
                                        </button>
                                      </div>
                                    </Tooltip>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };
    
    const isNextDisabled = (): boolean => {
        if (hasTooManyImages) return true;
        switch (currentStep) {
            case WizardStep.Subjects:
                return compositionState.subjects.length === 0;
            case WizardStep.Background:
                return compositionState.background.type === 'upload' && !compositionState.background.file;
            case WizardStep.Styling:
                return !compositionState.compositionPrompt;
            default:
                return false;
        }
    }

    return (
        <>
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
            {isLoading && <LoadingSpinner message="Generating your masterpiece..." />}
            {previewImageUrl && (
                <ImagePreviewModal 
                    imageUrl={previewImageUrl}
                    onClose={() => setPreviewImageUrl(null)}
                />
            )}
            <HistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                history={history}
                onLoad={handleLoadFromHistory}
                onClear={handleClearHistory}
            />
            <div className="w-full max-w-4xl mx-auto">
                <header className="relative text-center mb-10">
                    <button
                        onClick={() => setIsHistoryPanelOpen(true)}
                        className="absolute top-0 right-0 p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Open generation history"
                    >
                        <HistoryIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tighter">
                        Image Composer
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">Multiple images to a single harmonized image</p>
                </header>
                <main className="bg-nutshel-gray shadow-2xl rounded-2xl p-6 sm:p-8 border border-white/10">
                    <div className="mb-10 flex justify-center pt-4">
                        <StepIndicator currentStep={currentStep} />
                    </div>

                    {hasTooManyImages && (
                        <div className="mb-6 p-3 bg-red-900/20 border border-red-700/50 text-red-300 rounded-xl text-sm text-center" role="alert">
                            Warning: You have selected {totalImages} images, but the model supports a maximum of {maxImages}. Please remove some images to proceed.
                        </div>
                    )}
                    
                    <div className="min-h-[400px] flex flex-col justify-center">
                        {renderStepContent()}
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1 || isLoading}
                            className="inline-flex items-center gap-2 px-8 py-3 text-base font-medium rounded-full shadow-sm text-white bg-white/10 hover:bg-white/20 transition-colors disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                           <ArrowLeftIcon />
                            Back
                        </button>
                        
                        {currentStep < WizardStep.Generate ? (
                             <button
                                onClick={handleNext}
                                disabled={isNextDisabled() || isLoading}
                                className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-full shadow-sm text-black bg-nutshel-accent hover:opacity-90 transition-opacity focus:outline-none disabled:bg-nutshel-accent/40 disabled:cursor-not-allowed disabled:text-black/40"
                            >
                                Next
                                <ArrowRightIcon />
                            </button>
                        ) : (
                             <button
                                onClick={handleGenerate}
                                disabled={isLoading || hasTooManyImages}
                                className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-full shadow-sm text-black bg-nutshel-accent hover:opacity-90 transition-opacity focus:outline-none disabled:bg-nutshel-accent/40 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                {result ? 'Regenerate' : 'Generate'}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
        <ProjectSelectionModal
          isOpen={isProjectSelectionModalOpen}
          onClose={() => setIsProjectSelectionModalOpen(false)}
          onSelect={handleProjectSelected}
          title="Save to Project"
          description="Choose a project to save your generated image to, or create a new one."
        />
        </>
    );
};

export default App;
