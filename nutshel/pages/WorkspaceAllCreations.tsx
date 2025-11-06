import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrashIcon, PlusIcon, SearchIcon, PencilIcon, FolderIcon, ChevronDownIcon } from '../components/WorkspaceIcons';
import { PenToolIcon, FilmIcon } from '../components/WorkspaceIcons';
import { Project, ProjectAsset } from '../types';
import { useProjects } from '../contexts/ProjectContext';
import { AnimatedItem } from '../components/AnimatedItem';
import CreateProjectModal from '../components/CreateProjectModal';
import { getStudioImage } from '../utils/imageStorage';

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}> = ({ isOpen, onClose, onConfirm, projectName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-nutshel-gray p-8 rounded-2xl border border-white/10 max-w-md w-full space-y-6 transform transition-all">
        <h2 className="text-2xl font-bold">Confirm Deletion</h2>
        <p className="text-gray-300">
          Are you sure you want to delete the project "{projectName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get image URL for an asset
const getAssetImageUrl = (asset: ProjectAsset): string | null => {
  try {
    if (asset.type === 'ai-canvas') {
      // Try to get image from localStorage
      const imageUrl = localStorage.getItem(`image_${asset.seed}`);
      if (imageUrl) return imageUrl;
    } else if (asset.type === 'nutshel-studios') {
      // Try localStorage first (for backward compatibility)
      const imageUrl = localStorage.getItem(`studio_image_${asset.seed}`);
      if (imageUrl) return imageUrl;
      // For IndexedDB, we'll return null and show placeholder
      // Images will be loaded asynchronously in a future update
    }
  } catch (error) {
    console.error('Error getting asset image URL:', error);
  }
  return null;
};

// Helper function to get banner image for project
const getProjectBannerImage = (project: Project): string => {
  try {
    // Try to get first asset image as banner
    if (project.generations.length > 0) {
      const firstAsset = project.generations[0];
      const imageUrl = getAssetImageUrl(firstAsset);
      if (imageUrl) return imageUrl;
    }
  } catch (error) {
    console.error('Error getting project banner image:', error);
  }
  // Fallback to placeholder
  return `https://picsum.photos/seed/${project.bannerSeed}/800/300`;
};

const ProjectCard: React.FC<{ 
  project: Project; 
  onDelete: (e: React.MouseEvent, id: number) => void;
  isEditing: boolean;
  onStartEdit: (e: React.MouseEvent, project: Project) => void;
  onSaveEdit: () => void;
  tempName: string;
  setTempName: (name: string) => void;
}> = ({ project, onDelete, isEditing, onStartEdit, onSaveEdit, tempName, setTempName }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onSaveEdit();
    }
  };

  // Safety checks for project data
  if (!project || !project.id) {
    return null;
  }

  const generations = Array.isArray(project.generations) ? project.generations : [];
  const assetCount = generations.length;
  const canvasAssets = generations.filter(a => a?.type === 'ai-canvas').length;
  const studioAssets = generations.filter(a => a?.type === 'nutshel-studios').length;

  return (
    <div className="bg-nutshel-gray rounded-2xl overflow-hidden border border-white/10 group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20 relative">
      <Link to={`/workspace/project/${project.id}`} className="block cursor-pointer">
        <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${getProjectBannerImage(project)})` }}>
          {assetCount > 0 && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-white">
              {assetCount} asset{assetCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-3 min-h-[48px]">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={onSaveEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => {e.preventDefault(); e.stopPropagation();}}
                className="bg-white/10 border border-nutshel-accent rounded-md px-2 py-1 text-lg font-bold w-full mr-2"
              />
            ) : (
              <div className="flex-1">
                <h3 className="font-bold text-lg pr-2">{project.name}</h3>
                {(canvasAssets > 0 || studioAssets > 0) && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    {canvasAssets > 0 && (
                      <div className="flex items-center gap-1">
                        <PenToolIcon className="w-3 h-3" />
                        <span>{canvasAssets}</span>
                      </div>
                    )}
                    {studioAssets > 0 && (
                      <div className="flex items-center gap-1">
                        <FilmIcon className="w-3 h-3" />
                        <span>{studioAssets}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex-shrink-0">
              {!isEditing && (
                <button onClick={(e) => onStartEdit(e, project)} className="p-2 rounded-full text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                  <PencilIcon className="w-4 h-4"/>
                </button>
              )}
            </div>
          </div>
          {assetCount > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {generations.slice(0, 4).map(asset => {
                if (!asset || !asset.seed) return null;
                try {
                  const imageUrl = getAssetImageUrl(asset);
                  return (
                    <div key={asset.seed} className="aspect-square bg-black/20 rounded-md overflow-hidden relative">
                      {/* Placeholder - always rendered as fallback */}
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-nutshel-gray-dark">
                        {asset.type === 'ai-canvas' ? (
                          <PenToolIcon className="w-6 h-6 text-gray-600" />
                        ) : asset.type === 'nutshel-studios' ? (
                          <FilmIcon className="w-6 h-6 text-gray-600" />
                        ) : (
                          <FolderIcon className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      {/* Image - overlays placeholder if loaded successfully */}
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          className="relative w-full h-full object-cover z-10" 
                          alt={asset.name || 'Asset'}
                          loading="lazy"
                          onError={(e) => {
                            // Hide broken image to show placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  );
                } catch (error) {
                  console.error('Error rendering asset:', error);
                  return (
                    <div key={asset.seed || Math.random()} className="aspect-square bg-black/20 rounded-md overflow-hidden relative">
                      <div className="w-full h-full flex items-center justify-center bg-nutshel-gray-dark">
                        <FolderIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No assets yet
            </div>
          )}
        </div>
      </Link>
      <button 
        onClick={(e) => onDelete(e, project.id)} 
        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-gray-300 hover:bg-black/60 hover:text-white transition-all opacity-50 group-hover:opacity-100 flex-shrink-0 z-10"
        aria-label={`Delete project ${project.name}`}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};


const AllCreations: React.FC = () => {
  const { projects, deleteProject, updateProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [tempProjectName, setTempProjectName] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'ai-canvas' | 'nutshel-studios'>('all');
  const sortRef = useRef<HTMLDivElement>(null);

  // Safety check: ensure projects is always an array
  const safeProjects = Array.isArray(projects) ? projects : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenDeleteModal = (e: React.MouseEvent, id: number) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      const project = safeProjects.find(p => p?.id === id);
      if (project) {
        setProjectToDelete(project);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error opening delete modal:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProjectToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      handleCloseModal();
    }
  };
  
  const handleStartEdit = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProjectId(project.id);
    setTempProjectName(project.name);
  };

  const handleSaveEdit = () => {
    if (editingProjectId !== null && tempProjectName.trim() !== '') {
      updateProject(editingProjectId, { name: tempProjectName.trim() });
    }
    setEditingProjectId(null);
    setTempProjectName('');
  };

  const sortOptions = {
    newest: 'Date Created (Newest)',
    oldest: 'Date Created (Oldest)',
    'name-asc': 'Name (A-Z)',
    'name-desc': 'Name (Z-A)',
  };

  const sortedAndFilteredProjects = useMemo(() => {
    try {
      let filtered = [...safeProjects];

      // Filter by asset type
      if (filterType !== 'all') {
        filtered = filtered.filter(project => 
          project?.generations && Array.isArray(project.generations) &&
          project.generations.some(asset => asset?.type === filterType)
        );
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(project =>
          project?.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort
      const sorted = filtered.sort((a, b) => {
        try {
          switch (sortOption) {
            case 'oldest':
              return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            case 'name-asc':
              return (a.name || '').localeCompare(b.name || '');
            case 'name-desc':
              return (b.name || '').localeCompare(a.name || '');
            case 'newest':
            default:
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          }
        } catch (error) {
          console.error('Error sorting projects:', error);
          return 0;
        }
      });

      return sorted;
    } catch (error) {
      console.error('Error filtering/sorting projects:', error);
      return safeProjects;
    }
  }, [safeProjects, sortOption, searchTerm, filterType]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            All Creations
          </h1>
          <p className="text-gray-300 text-lg">Your complete project library. All your work, beautifully organized.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-nutshel-accent text-black font-bold py-3 px-5 rounded-lg text-sm transition-colors hover:opacity-90 whitespace-nowrap"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Project</span>
        </button>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-nutshel-gray border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:ring-nutshel-accent focus:border-nutshel-accent"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'ai-canvas' | 'nutshel-studios')}
              className="flex items-center justify-between w-full md:w-auto gap-2 bg-nutshel-gray border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:ring-nutshel-accent focus:border-nutshel-accent appearance-none cursor-pointer"
            >
              <option value="all">All Assets</option>
              <option value="ai-canvas">AI Canvas</option>
              <option value="nutshel-studios">Nutshel Studios</option>
            </select>
          </div>

          <div className="relative" ref={sortRef}>
            <button 
                onClick={() => setIsSortOpen(!isSortOpen)} 
                className="flex items-center justify-between w-full md:w-auto gap-2 bg-nutshel-gray border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:ring-nutshel-accent focus:border-nutshel-accent"
            >
                <span className="whitespace-nowrap">Sort by: {sortOptions[sortOption as keyof typeof sortOptions]}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-full md:w-56 bg-nutshel-gray-dark border border-white/10 rounded-lg shadow-xl z-20">
                    <div className="p-2">
                        {Object.entries(sortOptions).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setSortOption(key);
                                    setIsSortOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${sortOption === key ? 'bg-nutshel-accent text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {safeProjects.length === 0 ? (
        <div className="text-center py-20 px-6 text-gray-400 bg-nutshel-gray rounded-2xl border border-dashed border-white/20 flex flex-col items-center">
            <FolderIcon className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
                Your Workspace is Empty
            </h3>
            <p className="mb-6 max-w-sm">It looks like you haven't created any projects yet. Let's change that!</p>
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-nutshel-accent text-black font-bold py-3 px-5 rounded-lg text-sm transition-colors hover:opacity-90 whitespace-nowrap"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Create Your First Project</span>
            </button>
        </div>
      ) : sortedAndFilteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedAndFilteredProjects.map((project, index) => (
            <AnimatedItem key={project.id} delay={index * 100}>
              <ProjectCard 
                project={project} 
                onDelete={handleOpenDeleteModal}
                isEditing={editingProjectId === project.id}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                tempName={tempProjectName}
                setTempName={setTempProjectName}
              />
            </AnimatedItem>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 text-gray-400 bg-nutshel-gray rounded-2xl border border-dashed border-white/20 flex flex-col items-center">
            <FolderIcon className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
                No Projects Found
            </h3>
            <p>Your search for "{searchTerm}" did not return any results.</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        projectName={projectToDelete?.name || ''}
      />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default AllCreations;

