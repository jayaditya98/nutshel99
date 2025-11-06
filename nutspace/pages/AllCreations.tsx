import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrashIcon, PlusIcon, SearchIcon, PencilIcon, FolderIcon, ChevronDownIcon } from '../components/Icons';
import { Project } from '../types';
import { useProjects } from '../contexts/ProjectContext';
import { AnimatedItem } from '../components/AnimatedItem';

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
      onSaveEdit(); // simple cancel just saves
    }
  };

  return (
  <div className="bg-nutshel-gray rounded-2xl overflow-hidden border border-white/10 group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20 relative">
    <Link to={`/project/${project.id}`} className="block cursor-pointer">
      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(https://picsum.photos/seed/${project.bannerSeed}/800/300)` }}></div>
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
              <h3 className="font-bold text-lg pr-2">{project.name}</h3>
            )}
            <div className="flex-shrink-0">
              {!isEditing && (
                 <button onClick={(e) => onStartEdit(e, project)} className="p-2 rounded-full text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <PencilIcon className="w-4 h-4"/>
                </button>
              )}
            </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {project.generations.slice(0, 4).map(asset => (
            <div key={asset.seed} className="aspect-square bg-black/20 rounded-md overflow-hidden">
              <img src={`https://picsum.photos/seed/${asset.seed}/200/200`} className="w-full h-full object-cover" alt={asset.name} />
            </div>
          ))}
        </div>
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
  )
};


const AllCreations: React.FC = () => {
  const { projects, deleteProject, addProject, updateProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [tempProjectName, setTempProjectName] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.createNew) {
      addProject();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, addProject]);

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
    e.preventDefault();
    e.stopPropagation();
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectToDelete(project);
      setIsModalOpen(true);
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
    const sorted = [...projects].sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    if (!searchTerm) {
      return sorted;
    }

    return sorted.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, sortOption, searchTerm]);

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
          onClick={addProject}
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

      {projects.length === 0 ? (
        <div className="text-center py-20 px-6 text-gray-400 bg-nutshel-gray rounded-2xl border border-dashed border-white/20 flex flex-col items-center">
            <FolderIcon className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
                Your Workspace is Empty
            </h3>
            <p className="mb-6 max-w-sm">It looks like you haven't created any projects yet. Let's change that!</p>
            <button 
                onClick={addProject}
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
    </div>
  );
};

export default AllCreations;