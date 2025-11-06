import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Project, ProjectAsset } from '../types';
import { useProjects } from '../contexts/ProjectContext';
import { PencilIcon, TrashIcon, PlusIcon, EditIcon } from '../components/Icons';
import { AnimatedItem } from '../components/AnimatedItem';

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
}> = ({ isOpen, onClose, onConfirm, title, body }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-nutshel-gray p-8 rounded-2xl border border-white/10 max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-300">{body}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};


const AssetCard: React.FC<{
    asset: ProjectAsset;
    onDelete: (seed: string) => void;
    onRename: (seed: string, newName: string) => void;
}> = ({ asset, onDelete, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(asset.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        setTempName(asset.name);
    }, [asset.name]);

    const handleSave = () => {
        if (tempName.trim() !== '' && tempName.trim() !== asset.name) {
            onRename(asset.seed, tempName.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setTempName(asset.name);
            setIsEditing(false);
        }
    };
    
    const handleEditInCanvas = () => {
        navigate('/canvas', { state: { imageSeed: asset.seed, imageName: asset.name } });
    }

    return (
        <div className="group relative">
            <div className="aspect-square bg-nutshel-gray rounded-lg overflow-hidden border border-white/10 transform group-hover:-translate-y-1 transition-transform">
                <img 
                    src={`https://picsum.photos/seed/${asset.seed}/400/400`} 
                    alt={asset.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={handleEditInCanvas} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Edit in Canvas">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(asset.seed)} className="p-3 bg-white/10 rounded-full text-white hover:bg-red-600 transition-colors" title="Delete Asset">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-white/10 text-sm rounded px-2 py-1 border border-nutshel-accent"
                    />
                ) : (
                    <>
                        <p className="text-sm font-medium truncate flex-1" title={asset.name}>{asset.name}</p>
                        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity flex-shrink-0">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const ProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { projects, getProjectById, updateProject, deleteProject, addProjectAsset, deleteProjectAsset, updateProjectAsset } = useProjects();
    const [project, setProject] = useState<Project | undefined>();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
    const [isProjectDeleteModalOpen, setIsProjectDeleteModalOpen] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const projId = parseInt(id || '', 10);
        if (!isNaN(projId)) {
            const foundProject = getProjectById(projId);
            setProject(foundProject);
            setTempTitle(foundProject?.name || '');
        }
    }, [id, getProjectById, projects]);

    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
    }, [isEditingTitle]);

    const handleTitleSave = () => {
        if (project && tempTitle.trim() !== '' && tempTitle.trim() !== project.name) {
            updateProject(project.id, { name: tempTitle.trim() });
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeydown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSave();
        if (e.key === 'Escape') {
            setTempTitle(project?.name || '');
            setIsEditingTitle(false);
        }
    }
    
    const handleConfirmDeleteAsset = () => {
        if (project && assetToDelete) {
            deleteProjectAsset(project.id, assetToDelete);
        }
        setAssetToDelete(null);
    };

    const handleConfirmDeleteProject = () => {
      if (project) {
        deleteProject(project.id);
        setIsProjectDeleteModalOpen(false);
        navigate('/creations');
      }
    };
    
    const handleRenameAsset = (assetSeed: string, newName: string) => {
        if (project) {
            updateProjectAsset(project.id, assetSeed, { name: newName });
        }
    };

    if (!project) {
        return (
            <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
                <p className="text-gray-400 mb-8">We couldn't find the project with ID: {id}.</p>
                <Link to="/creations" className="bg-nutshel-accent text-black font-semibold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity">
                    Back to All Creations
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-white/10">
                <img src={`https://picsum.photos/seed/${project.bannerSeed}/1200/400`} alt={`${project.name} banner`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                     <Link to="/creations" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-white bg-black/30 backdrop-blur-sm py-1.5 px-3 rounded-full hover:bg-black/50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        All Creations
                    </Link>
                    <div className="flex flex-wrap items-center gap-4">
                        {isEditingTitle ? (
                            <input 
                                ref={titleInputRef}
                                type="text" 
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleTitleKeydown}
                                className="bg-transparent border-b-2 border-nutshel-accent text-4xl md:text-5xl font-bold text-white drop-shadow-lg focus:outline-none"
                            />
                        ) : (
                            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{project.name}</h1>
                        )}
                         {!isEditingTitle && (
                            <button onClick={() => setIsEditingTitle(true)} className="p-2 text-white/70 hover:text-white transition-colors flex-shrink-0" title="Rename Project">
                                <PencilIcon className="w-6 h-6" />
                            </button>
                         )}
                        <button onClick={() => setIsProjectDeleteModalOpen(true)} className="p-2 text-white/70 hover:text-red-500 transition-colors flex-shrink-0" title="Delete Project">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-gray-200 mt-2 max-w-2xl drop-shadow-md">{project.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Created on: {new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
            </header>

            <section>
                <h2 className="text-3xl font-semibold mb-6">Project Assets ({project.generations.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                    <AnimatedItem delay={0}>
                      <button
                          onClick={() => addProjectAsset(project.id)}
                          className="aspect-square bg-nutshel-gray rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 hover:bg-white/5 hover:border-nutshel-accent hover:text-nutshel-accent transition-all duration-300 transform hover:-translate-y-1"
                      >
                          <PlusIcon className="w-10 h-10" />
                          <span className="mt-2 text-sm font-semibold">Add Asset</span>
                      </button>
                    </AnimatedItem>
                    {project.generations.map((asset, index) => (
                      <AnimatedItem key={asset.seed} delay={(index + 1) * 50}>
                        <AssetCard 
                              asset={asset}
                              onDelete={setAssetToDelete}
                              onRename={handleRenameAsset}
                        />
                      </AnimatedItem>
                    ))}
                </div>
            </section>
            
            <ConfirmationModal 
                isOpen={!!assetToDelete}
                onClose={() => setAssetToDelete(null)}
                onConfirm={handleConfirmDeleteAsset}
                title="Delete Asset"
                body="Are you sure you want to delete this asset? This cannot be undone."
            />

            <ConfirmationModal 
                isOpen={isProjectDeleteModalOpen}
                onClose={() => setIsProjectDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteProject}
                title="Delete Project"
                body={`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default ProjectPage;