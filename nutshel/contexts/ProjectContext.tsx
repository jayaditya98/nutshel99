import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { Project, ProjectAsset } from '../types';
import { storeStudioImage } from '../utils/imageStorage';
import { storeCanvasDesign, deleteCanvasDesign } from '../utils/canvasStorage';

interface ProjectContextType {
  projects: Project[];
  getProjectById: (id: number) => Project | undefined;
  addProject: (name?: string) => number;
  deleteProject: (id: number) => void;
  updateProject: (id: number, updates: Partial<Omit<Project, 'id'>>) => void;
  addProjectAsset: (projectId: number) => void;
  deleteProjectAsset: (projectId: number, assetSeed: string) => void;
  updateProjectAsset: (projectId: number, assetSeed: string, updates: Partial<Omit<ProjectAsset, 'seed'>>) => void;
  addProjectAssetFromCanvas: (
    projectId: number,
    asset: {
      name: string;
      type?: string;
      sourceApp?: string;
      canvasState?: any;
      imageUrls?: string;
      metadata?: any;
    },
    saveAsDesign: boolean,
    saveAsImage: boolean
  ) => Promise<void>;
  addProjectAssetFromStudio: (
    projectId: number,
    asset: {
      name: string;
      imageUrl: string;
      sourceApp: string;
      metadata?: any;
    }
  ) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'nutshel_projects';

const initialProjects: Project[] = [
  {
    id: 1,
    name: "IKEA AI Generated Banner",
    description: "A campaign exploring minimalist furniture in surreal environments.",
    createdAt: "2023-10-26",
    bannerSeed: "ikea",
    generations: [
      { seed: "ad1", name: "Main Banner Ad" },
      { seed: "product1", name: "Sofa Showcase" },
      { seed: "model1", name: "Lifestyle Shot" },
      { seed: "ad2", name: "Alternate Ad" },
      { seed: "ikea_sofa", name: "SÖDERHAMN in room" },
      { seed: "ikea_lamp", name: "FADO Lamp" },
      { seed: "ikea_table", name: "LACK Table" },
      { seed: "ikea_room", name: "Full Room Concept" }
    ]
  },
  {
    id: 2,
    name: "Summer Sportswear Campaign",
    description: "Dynamic shots of athletes in summer apparel.",
    createdAt: "2023-10-22",
    bannerSeed: "sports",
    generations: [
        { seed: "run1", name: "Runner Close-up" },
        { seed: "run2", name: "Marathon Finish" },
        { seed: "shoe1", name: "New Shoe Model" },
        { seed: "shoe2", name: "Shoe on Pavement" },
        { seed: "athlete1", name: "Tennis Player" },
        { seed: "athlete2", name: "Swimmer" },
    ]
  },
  {
    id: 3,
    name: "Futuristic Gadget Launch",
    description: "Sleek and modern visuals for a new tech product.",
    createdAt: "2023-10-15",
    bannerSeed: "tech",
    generations: [
        { seed: "gadget1", name: "Holographic Phone" },
        { seed: "gadget2", name: "Transparent Tablet" },
        { seed: "gadget3", name: "AR Glasses" },
        { seed: "user1", name: "User with Glasses" },
        { seed: "interface1", name: "UI Mockup" },
    ]
  },
  {
    id: 4,
    name: "Minimalist Home Decor",
    description: "Clean and aesthetic compositions for interior design inspiration.",
    createdAt: "2023-09-30",
    bannerSeed: "decor",
    generations: [
        { seed: "chair1", name: "Eames Chair" },
        { seed: "lamp1", name: "Floor Lamp" },
        { seed: "table1", name: "Coffee Table" },
        { seed: "room1", name: "Living Room View" },
        { seed: "vase1", name: "Ceramic Vase" },
        { seed: "shelf1", name: "Floating Shelf" },
        { seed: "plant1", name: "Monstera Plant" },
    ]
  }
];

// Load projects from localStorage on initialization
const loadProjectsFromStorage = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading projects from localStorage:', error);
  }
  // Return initial projects if nothing is stored or if there's an error
  return initialProjects;
};

// Save projects to localStorage
const saveProjectsToStorage = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to localStorage:', error);
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStorage());

  // Save to localStorage whenever projects change
  React.useEffect(() => {
    saveProjectsToStorage(projects);
  }, [projects]);

  const getProjectById = useCallback((id: number) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const addProject = useCallback((name?: string, description?: string) => {
    let newProjectId: number;
    let newProject: Project;
    setProjects(prevProjects => {
      newProjectId = prevProjects.length > 0 ? Math.max(...prevProjects.map(p => p.id)) + 1 : 1;
      const projectName = name?.trim() || `Untitled Project ${newProjectId}`;
      newProject = {
        id: newProjectId,
        name: projectName,
        description: description?.trim() || 'A new collection of generated assets.',
        createdAt: new Date().toISOString().split('T')[0],
        bannerSeed: `new_${newProjectId}`,
        generations: []
      };
      const updatedProjects = [newProject, ...prevProjects];
      // Save immediately to localStorage
      saveProjectsToStorage(updatedProjects);
      return updatedProjects;
    });
    return newProjectId;
  }, []);

  const deleteProject = useCallback((id: number) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
  }, []);
  
  const updateProject = useCallback((id: number, updates: Partial<Omit<Project, 'id'>>) => {
    setProjects(prevProjects => 
      prevProjects.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const addProjectAsset = useCallback((projectId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const newAsset: ProjectAsset = {
            seed: `new_asset_${p.id}_${Date.now()}`,
            name: 'Untitled Asset'
          };
          return { ...p, generations: [newAsset, ...p.generations] };
        }
        return p;
      })
    );
  }, []);

  const deleteProjectAsset = useCallback((projectId: number, assetSeed: string) => {
    setProjects(prevProjects => {
      // Find the asset being deleted to check its type
      const project = prevProjects.find(p => p.id === projectId);
      const asset = project?.generations.find(g => g.seed === assetSeed);
      
      // Clean up IndexedDB data if it's a canvas asset
      if (asset && asset.type === 'ai-canvas') {
        deleteCanvasDesign(assetSeed).catch(error => {
          console.error('Error deleting canvas design from IndexedDB:', error);
          // Also try to clean up localStorage as fallback
          try {
            localStorage.removeItem(`canvas_${assetSeed}`);
            localStorage.removeItem(`image_${assetSeed}`);
          } catch (localError) {
            console.error('Error cleaning up localStorage:', localError);
          }
        });
      }
      
      return prevProjects.map(p => {
        if (p.id === projectId) {
          return { ...p, generations: p.generations.filter(g => g.seed !== assetSeed) };
        }
        return p;
      });
    });
  }, []);
  
  const updateProjectAsset = useCallback((projectId: number, assetSeed: string, updates: Partial<Omit<ProjectAsset, 'seed'>>) => {
      setProjects(prevProjects =>
          prevProjects.map(p => {
              if (p.id === projectId) {
                  return {
                      ...p,
                      generations: p.generations.map(asset => 
                          asset.seed === assetSeed ? { ...asset, ...updates } : asset
                      )
                  };
              }
              return p;
          })
      );
  }, []);

  const addProjectAssetFromCanvas = useCallback(async (
    projectId: number,
    asset: {
      name: string;
      type?: string;
      sourceApp?: string;
      canvasState?: any;
      imageUrls?: string;
      metadata?: any;
    },
    saveAsDesign: boolean,
    saveAsImage: boolean
  ) => {
    try {
      // Generate seed before updating state
      const seed = `canvas_${projectId}_${Date.now()}`;
      const newAsset: ProjectAsset = {
        seed,
        name: asset.name || 'Untitled Design',
        type: 'ai-canvas',
        sourceApp: asset.sourceApp || 'ai-canvas'
      };
      
      // Store canvas design in IndexedDB instead of localStorage
      // This handles complex projects with large data that exceed localStorage limits
      if (saveAsDesign && asset.canvasState) {
        storeCanvasDesign(
          newAsset.seed,
          asset.canvasState,
          saveAsImage && asset.imageUrls ? asset.imageUrls : undefined
        ).catch(error => {
          console.error('Error storing canvas design to IndexedDB:', error);
          // Fallback to localStorage if IndexedDB fails
          try {
            localStorage.setItem(`canvas_${newAsset.seed}`, JSON.stringify(asset.canvasState));
            if (saveAsImage && asset.imageUrls) {
              localStorage.setItem(`image_${newAsset.seed}`, asset.imageUrls);
            }
          } catch (localError) {
            console.error('Error storing canvas design to localStorage fallback:', localError);
          }
        });
      } else if (saveAsImage && asset.imageUrls) {
        // If only saving image without design, still store in IndexedDB
        storeCanvasDesign(
          newAsset.seed,
          {},
          asset.imageUrls
        ).catch(error => {
          console.error('Error storing canvas image to IndexedDB:', error);
          // Fallback to localStorage if IndexedDB fails
          try {
            localStorage.setItem(`image_${newAsset.seed}`, asset.imageUrls);
          } catch (localError) {
            console.error('Error storing canvas image to localStorage fallback:', localError);
          }
        });
      }
      
      // Update projects state
      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === projectId) {
            return { ...p, generations: [newAsset, ...p.generations] };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error adding project asset from canvas:', error);
      throw error;
    }
  }, []);

  const addProjectAssetFromStudio = useCallback(async (
    projectId: number,
    asset: {
      name: string;
      imageUrl: string;
      sourceApp: string;
      metadata?: any;
    }
  ) => {
    try {
      const newAsset: ProjectAsset = {
        seed: `studio_${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: asset.name || 'Untitled Asset',
        type: 'nutshel-studios',
        sourceApp: asset.sourceApp
      };

      // Store image in IndexedDB instead of localStorage
      // This handles large base64 images that exceed localStorage limits
      await storeStudioImage(
        newAsset.seed,
        asset.imageUrl,
        asset.sourceApp,
        {
          sourceApp: asset.sourceApp,
          ...asset.metadata
        }
      );

      // Update projects state
      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === projectId) {
            return { ...p, generations: [newAsset, ...p.generations] };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error saving studio asset to IndexedDB:', error);
      // Still add the asset to the project even if IndexedDB fails
      // This prevents blank screens and allows the user to continue
      const newAsset: ProjectAsset = {
        seed: `studio_${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: asset.name || 'Untitled Asset',
        type: 'nutshel-studios',
        sourceApp: asset.sourceApp
      };
      
      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === projectId) {
            return { ...p, generations: [newAsset, ...p.generations] };
          }
          return p;
        })
      );
      
      // Re-throw error so calling code can handle it
      throw error;
    }
  }, []);

  const value = useMemo(() => ({ projects, getProjectById, addProject, deleteProject, updateProject, addProjectAsset, deleteProjectAsset, updateProjectAsset, addProjectAssetFromCanvas, addProjectAssetFromStudio }), [projects, getProjectById, addProject, deleteProject, updateProject, addProjectAsset, deleteProjectAsset, updateProjectAsset, addProjectAssetFromCanvas, addProjectAssetFromStudio]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

