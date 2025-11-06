import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { Project, ProjectAsset } from '../types';

interface ProjectContextType {
  projects: Project[];
  getProjectById: (id: number) => Project | undefined;
  addProject: () => void;
  deleteProject: (id: number) => void;
  updateProject: (id: number, updates: Partial<Omit<Project, 'id'>>) => void;
  addProjectAsset: (projectId: number) => void;
  deleteProjectAsset: (projectId: number, assetSeed: string) => void;
  updateProjectAsset: (projectId: number, assetSeed: string, updates: Partial<Omit<ProjectAsset, 'seed'>>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

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


export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const getProjectById = useCallback((id: number) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const addProject = useCallback(() => {
    setProjects(prevProjects => {
      const newProjectId = prevProjects.length > 0 ? Math.max(...prevProjects.map(p => p.id)) + 1 : 1;
      const newProject: Project = {
        id: newProjectId,
        name: `Untitled Project ${newProjectId}`,
        description: 'A new collection of generated assets.',
        createdAt: new Date().toISOString().split('T')[0],
        bannerSeed: `new_${newProjectId}`,
        generations: Array.from({ length: 4 }, (_, i) => ({
          seed: `gen${i+1}_${newProjectId}`,
          name: `Asset ${i+1}`
        }))
      };
      return [newProject, ...prevProjects];
    });
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
    setProjects(prevProjects => 
        prevProjects.map(p => {
            if (p.id === projectId) {
                return { ...p, generations: p.generations.filter(g => g.seed !== assetSeed) };
            }
            return p;
        })
    );
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

  const value = useMemo(() => ({ projects, getProjectById, addProject, deleteProject, updateProject, addProjectAsset, deleteProjectAsset, updateProjectAsset }), [projects, getProjectById, addProject, deleteProject, updateProject, addProjectAsset, deleteProjectAsset, updateProjectAsset]);

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