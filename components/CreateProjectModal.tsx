import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (projectId: number) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const { addProject } = useProjects();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setProjectName('');
      setProjectDescription('');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!projectName.trim()) return;

    const projectId = addProject(projectName.trim(), projectDescription.trim() || undefined);

    if (onProjectCreated) {
      onProjectCreated(projectId);
    } else {
      // Navigate to the new project page
      navigate(`/workspace/project/${projectId}`);
    }
    
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && projectName.trim()) {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-nutshel-gray p-8 rounded-2xl border border-white/10 max-w-md w-full mx-4 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <p className="text-gray-300 mt-2">Give your project a name and optionally add details.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nutshel-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Add a description for your project..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nutshel-accent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2 px-6 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;

