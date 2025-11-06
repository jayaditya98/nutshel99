import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import { ChevronDownIcon } from './ui/Icons';

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: number, saveAsDesign: boolean, saveAsImage: boolean) => void;
}

type ProjectMode = 'existing' | 'new';
type Step = 1 | 2 | 3;

const SaveDesignModal: React.FC<SaveDesignModalProps> = ({ isOpen, onClose, onSave }) => {
  const location = useLocation();
  const { projects, addProject } = useProjects();
  const [step, setStep] = useState<Step>(1);
  const [projectMode, setProjectMode] = useState<ProjectMode>('existing');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [saveAsDesign, setSaveAsDesign] = useState(true);
  const [saveAsImage, setSaveAsImage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // Modal just opened - initialize state
      wasOpenRef.current = true;
      const projectIdFromState = (location.state as any)?.projectId;
      if (projectIdFromState && projects.find(p => p.id === projectIdFromState)) {
        // Pre-select project and skip to format selection
        setSelectedProjectId(projectIdFromState);
        setProjectMode('existing');
        setStep(3);
        setSaveAsDesign(true);
        setSaveAsImage(false);
      } else {
        // Normal flow - initialize to step 1
        setStep(1);
        setProjectMode('existing');
        setSelectedProjectId(null);
        setNewProjectName('');
        setSaveAsDesign(true);
        setSaveAsImage(false);
      }
    } else if (!isOpen) {
      wasOpenRef.current = false;
    }
  }, [isOpen, location.state, projects]); // Include projects to check for projectIdFromState

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setProjectMode('existing');
      setSelectedProjectId(null);
      setNewProjectName('');
    }
  }, [isOpen]);

  // Focus name input when creating new project
  useEffect(() => {
    if (step === 2 && projectMode === 'new' && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step, projectMode]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      // Move to step 2 (project selection/creation)
      setStep(2);
    } else if (step === 2) {
      // Validate and move to step 3 (format selection)
      if (projectMode === 'existing' && selectedProjectId) {
        setStep(3);
      } else if (projectMode === 'new') {
        // Create new project and move to step 3
        const projectId = addProject(newProjectName.trim() || undefined);
        setSelectedProjectId(projectId);
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSave = () => {
    if (!selectedProjectId) return;
    if (!saveAsDesign && !saveAsImage) return;
    
    onSave(selectedProjectId, saveAsDesign, saveAsImage);
    onClose();
  };

  const canProceedFromStep1 = projectMode === 'existing' || projectMode === 'new';
  const canProceedFromStep2 = 
    (projectMode === 'existing' && selectedProjectId !== null) ||
    (projectMode === 'new' && true); // New project can always proceed (will use default name if empty)
  const canProceedFromStep3 = saveAsDesign;

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-nutshel-gray p-8 rounded-2xl border border-white/10 max-w-md w-full mx-4 space-y-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Save Design</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-nutshel-accent text-black' : 'bg-white/10 text-gray-400'}`}>
              1
            </div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-nutshel-accent' : 'bg-white/10'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-nutshel-accent text-black' : 'bg-white/10 text-gray-400'}`}>
              2
            </div>
            <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-nutshel-accent' : 'bg-white/10'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-nutshel-accent text-black' : 'bg-white/10 text-gray-400'}`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Choose Project Mode */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-300">Choose how you want to save your design:</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border-2 border-transparent hover:border-white/20">
                <input
                  type="radio"
                  name="projectMode"
                  value="existing"
                  checked={projectMode === 'existing'}
                  onChange={(e) => setProjectMode(e.target.value as ProjectMode)}
                  className="w-5 h-5 text-nutshel-accent focus:ring-nutshel-accent"
                />
                <div className="flex-1">
                  <div className="font-semibold">Choose Existing Project</div>
                  <div className="text-sm text-gray-400">Save to a project in All Creations</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border-2 border-transparent hover:border-white/20">
                <input
                  type="radio"
                  name="projectMode"
                  value="new"
                  checked={projectMode === 'new'}
                  onChange={(e) => setProjectMode(e.target.value as ProjectMode)}
                  className="w-5 h-5 text-nutshel-accent focus:ring-nutshel-accent"
                />
                <div className="flex-1">
                  <div className="font-semibold">Create New Project</div>
                  <div className="text-sm text-gray-400">Create a new project and save your design</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 2a: Select Existing Project */}
        {step === 2 && projectMode === 'existing' && (
          <div className="space-y-4">
            <p className="text-gray-300">Select a project:</p>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No projects found. Please create a new project.</p>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-nutshel-accent transition-colors flex items-center justify-between"
                >
                  <span className={selectedProjectId ? 'text-white' : 'text-gray-500'}>
                    {selectedProjectId 
                      ? projects.find(p => p.id === selectedProjectId)?.name || '-- Select a project --'
                      : '-- Select a project --'}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-nutshel-gray-dark border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(null);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        !selectedProjectId ? 'bg-white/10 text-white' : 'text-gray-300'
                      }`}
                    >
                      -- Select a project --
                    </button>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                          selectedProjectId === project.id ? 'bg-white/10 text-white' : 'text-gray-300'
                        }`}
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2b: Create New Project */}
        {step === 2 && projectMode === 'new' && (
          <div className="space-y-4">
            <p className="text-gray-300">Enter a name for your new project:</p>
            <input
              ref={nameInputRef}
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nutshel-accent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canProceedFromStep2) {
                  handleNext();
                }
              }}
            />
            <p className="text-sm text-gray-400">Leave empty to use default name</p>
          </div>
        )}

        {/* Step 3: Format Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-300">
                Save to: <span className="font-semibold text-white">{selectedProject?.name || 'New Project'}</span>
              </p>
              <button
                onClick={() => {
                  // Determine the mode based on whether the selected project exists in the projects list
                  const projectExists = projects.some(p => p.id === selectedProjectId);
                  setProjectMode(projectExists ? 'existing' : 'new');
                  setStep(2);
                  // Clear new project name if we're going back to new project mode
                  if (!projectExists) {
                    setNewProjectName('');
                  }
                }}
                className="text-sm text-nutshel-accent hover:underline"
              >
                Change Project
              </button>
            </div>
            <p className="text-gray-300">Choose how you want to save your design:</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={saveAsDesign}
                  onChange={(e) => setSaveAsDesign(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-nutshel-accent focus:ring-nutshel-accent"
                />
                <div>
                  <div className="font-semibold">Save as Editable Design</div>
                  <div className="text-sm text-gray-400">Save the full canvas state so you can edit it later</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between gap-4">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceedFromStep1 || (step === 2 && !canProceedFromStep2)}
                className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2 px-6 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canProceedFromStep3}
                className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2 px-6 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveDesignModal;

