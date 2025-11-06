import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '../contexts/ProjectContext';

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectId: number) => void;
  title?: string;
  description?: string;
}

type ProjectMode = 'existing' | 'new';

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  title = 'Select Project',
  description = 'Choose a project to save your asset to, or create a new one.'
}) => {
  const { projects, addProject } = useProjects();
  const [projectMode, setProjectMode] = useState<ProjectMode>('existing');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setProjectMode('existing');
      setSelectedProjectId(null);
      setNewProjectName('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && projectMode === 'new' && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen, projectMode]);

  const handleConfirm = () => {
    if (projectMode === 'existing' && selectedProjectId) {
      onSelect(selectedProjectId);
      onClose();
    } else if (projectMode === 'new') {
      const projectId = addProject(newProjectName.trim() || undefined);
      onSelect(projectId);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const canProceed = 
    (projectMode === 'existing' && selectedProjectId !== null) ||
    (projectMode === 'new');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-nutshel-gray p-8 rounded-2xl border border-white/10 max-w-md w-full mx-4 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-300 mt-2">{description}</p>
        </div>

        <div className="space-y-4">
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
                <div className="text-sm text-gray-400">Create a new project and save your asset</div>
              </div>
            </label>
          </div>

          {projectMode === 'existing' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Select Project:
              </label>
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-white/5 rounded-lg">
                  <p>No projects found. Please create a new project.</p>
                </div>
              ) : (
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-nutshel-accent"
                >
                  <option value="">-- Select a project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id} className="bg-nutshel-gray">
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {projectMode === 'new' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Project Name:
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter project name..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nutshel-accent"
              />
              <p className="text-sm text-gray-400">Leave empty to use default name</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2 px-6 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {projectMode === 'new' ? 'Create & Save' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;

