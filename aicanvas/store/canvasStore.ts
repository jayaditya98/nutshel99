import { create } from 'zustand';
import { produce } from 'immer';
import { CanvasState, Layer, LayerType, ShapeLayerProps, TextLayerProps, GroupLayerProps, ImageLayerProps } from '../types';

interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

interface CanvasStore extends CanvasState {
  clipboard: Layer[] | null;
  setLayers: (layers: Layer[]) => void;
  addLayer: (type: LayerType) => void;
  addImageLayer: (src: string, width: number, height: number) => void;
  deleteSelectedLayers: () => void;
  setSelectedLayers: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  updateLayer: (id: string, newProps: Partial<Layer> | ((layer: Layer) => void)) => void;
  updateLayers: (ids: string[], newProps: Partial<Layer> | ((layer: Layer) => void)) => void;
  moveSelectedLayers: (dx: number, dy: number) => void;
  resizeLayer: (id: string, width: number, height: number, x: number, y: number) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;
  toggleLayerVisibility: (id:string) => void;
  toggleLayerLock: (id: string) => void;
  addCustomFont: (fontFamily: string) => void;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  copySelectedLayers: () => void;
  cutSelectedLayers: () => void;
  pasteLayers: () => void;
  sendLayerBackward: (id: string) => void;
  bringLayerForward: (id: string) => void;
  sendToBack: (id: string) => void;
  bringToFront: (id: string) => void;
  groupSelectedLayers: () => void;
  ungroupLayer: (groupId: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  addSavedColor: (color: string) => void;
  setBrandColors: (colors: string[]) => void;
  setCanvasBackgroundColor: (color: string) => void;
  setPanning: (panning: boolean) => void;
  selectCanvas: () => void;
  deselectAll: () => void;
  setCanvasName: (name: string) => void;
  newCanvas: () => void;
}

const initialState: CanvasState = {
  layers: [],
  selectedLayerIds: [],
  customFonts: [
    // System Fonts
    'Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New', 'Impact',
    // Sans-Serif
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Oswald',
    // Serif
    'Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'EB Garamond',
    // Display
    'Lobster', 'Pacifico', 'Bebas Neue', 'Alfa Slab One', 'Caveat',
    // Monospace
    'Inconsolata', 'Roboto Mono', 'Source Code Pro',
  ],
  canvasWidth: 800,
  canvasHeight: 600,
  zoom: 1,
  panning: false,
  canvasBackgroundColor: '#FFFFFF',
  brandColors: [],
  savedColors: [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', 
    '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', 
    '#FF9800', '#FF5722', '#795548', '#607D8B'
  ],
  isCanvasSelected: false,
  canvasName: 'Untitled Design',
};

const historyInitialState: HistoryState = {
  past: [],
  present: initialState,
  future: [],
};

let history: HistoryState = { ...historyInitialState };

const defaultFilters: ImageLayerProps['filters'] = {
    grayscale: 0, sepia: 0, invert: 0,
    brightness: 1, contrast: 1, saturate: 1,
    blur: 0, hueRotate: 0,
};

const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...initialState,
  clipboard: null,
  takeSnapshot: () => {
    // We don't snapshot transient view-only properties
    const currentState: CanvasState = {
      layers: get().layers,
      selectedLayerIds: get().selectedLayerIds,
      customFonts: get().customFonts,
      canvasWidth: get().canvasWidth,
      canvasHeight: get().canvasHeight,
      zoom: get().zoom,
      panning: get().panning,
      brandColors: get().brandColors,
      savedColors: get().savedColors,
      canvasBackgroundColor: get().canvasBackgroundColor,
      isCanvasSelected: get().isCanvasSelected,
      canvasName: get().canvasName,
    };
    // Debounce or prevent duplicate snapshots
    if (history.past.length > 0 && 
        JSON.stringify(history.present.layers) === JSON.stringify(currentState.layers) && 
        JSON.stringify(history.present.selectedLayerIds) === JSON.stringify(currentState.selectedLayerIds) &&
        history.present.canvasBackgroundColor === currentState.canvasBackgroundColor
    ) {
        return;
    }

    history.past.push({
      ...history.present,
      zoom: get().zoom,
      panning: get().panning,
      isCanvasSelected: get().isCanvasSelected,
    });
    history.present = {
        ...currentState,
        // Only store canvas-related properties in the present state for history
        layers: currentState.layers,
        selectedLayerIds: currentState.selectedLayerIds,
        customFonts: currentState.customFonts,
        canvasWidth: currentState.canvasWidth,
        canvasHeight: currentState.canvasHeight,
        brandColors: currentState.brandColors,
        savedColors: currentState.savedColors,
        canvasBackgroundColor: currentState.canvasBackgroundColor,
        isCanvasSelected: currentState.isCanvasSelected,
        canvasName: currentState.canvasName,
    };
    history.future = [];
  },
  undo: () => {
    if (history.past.length > 0) {
      const newPresent = history.past.pop()!;
      history.future.unshift(history.present);
      history.present = newPresent;
      set({
        ...newPresent,
        zoom: get().zoom, // Retain current zoom & panning
        panning: get().panning,
      });
    }
  },
  redo: () => {
    if (history.future.length > 0) {
      const newPresent = history.future.shift()!;
      history.past.push(history.present);
      history.present = newPresent;
      set({
        ...newPresent,
        zoom: get().zoom, // Retain current zoom & panning
        panning: get().panning,
      });
    }
  },
  setCanvasSize: (width: number, height: number) => {
    get().takeSnapshot();
    set({ canvasWidth: width, canvasHeight: height });
  },
  setLayers: (layers: Layer[]) => set({ layers }),
  addLayer: (type: LayerType) => {
    get().takeSnapshot();
    const newLayer = createNewLayer(type);
    set(produce((draft) => {
      draft.layers.push(newLayer);
      draft.selectedLayerIds = [newLayer.id];
      draft.isCanvasSelected = false;
    }));
  },
  addImageLayer: (src: string, width: number, height: number) => {
    get().takeSnapshot();
    const { canvasWidth, canvasHeight } = get();

    const PADDING = 0.8;
    const maxW = canvasWidth * PADDING;
    const maxH = canvasHeight * PADDING;
    
    let newWidth = width;
    let newHeight = height;

    const aspectRatio = width / height;

    if (newWidth > maxW) {
        newWidth = maxW;
        newHeight = newWidth / aspectRatio;
    }
    if (newHeight > maxH) {
        newHeight = maxH;
        newWidth = newHeight * aspectRatio;
    }
    
    const newLayer: Layer = {
        id: `layer_${Date.now()}_${Math.random()}`,
        type: LayerType.Image,
        x: (canvasWidth - newWidth) / 2,
        y: (canvasHeight - newHeight) / 2,
        width: newWidth,
        height: newHeight,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        properties: { 
          src,
          flipHorizontal: false,
          flipVertical: false,
          filters: defaultFilters
        } as ImageLayerProps,
    };
    set(produce(draft => {
        draft.layers.push(newLayer);
        draft.selectedLayerIds = [newLayer.id];
        draft.isCanvasSelected = false;
    }));
  },
  deleteSelectedLayers: () => {
    const { selectedLayerIds } = get();
    if (selectedLayerIds.length === 0) return;
    
    get().takeSnapshot();
    
    set(produce((draft) => {
      const unlockedSelectedIds = draft.selectedLayerIds.filter(id => {
          const layer = draft.layers.find(l => l.id === id);
          return layer && !layer.locked;
      });

      if (unlockedSelectedIds.length > 0) {
        draft.layers = draft.layers.filter((layer) => !unlockedSelectedIds.includes(layer.id));
      }
      
      draft.selectedLayerIds = draft.selectedLayerIds.filter(id => !unlockedSelectedIds.includes(id));
      draft.isCanvasSelected = false;
    }));
  },
  setSelectedLayers: (ids: string[]) => set({ selectedLayerIds: ids, isCanvasSelected: false }),
  toggleSelection: (id: string) => {
    set(produce(draft => {
        const index = draft.selectedLayerIds.indexOf(id);
        if (index > -1) {
            draft.selectedLayerIds.splice(index, 1);
        } else {
            draft.selectedLayerIds.push(id);
        }
        draft.isCanvasSelected = false;
    }));
  },
  updateLayer: (id: string, newProps: Partial<Layer> | ((layer: Layer) => void)) => {
    get().updateLayers([id], newProps);
  },
  updateLayers: (ids: string[], newProps: Partial<Layer> | ((layer: Layer) => void)) => {
     set(produce((draft) => {
      draft.layers.forEach((layer) => {
        if (ids.includes(layer.id)) {
            if (typeof newProps === 'function') {
                newProps(layer);
            } else {
                Object.assign(layer, newProps);
            }
        }
      });
    }));
  },
  moveSelectedLayers: (dx: number, dy: number) => {
     set(produce((draft) => {
      draft.layers.forEach((layer) => {
        if (draft.selectedLayerIds.includes(layer.id) && !layer.locked) {
            layer.x += dx;
            layer.y += dy;
        }
      });
    }));
  },
  resizeLayer: (id: string, width: number, height: number, x: number, y: number) => {
     get().updateLayer(id, { width, height, x, y });
  },
  reorderLayer: (fromIndex: number, toIndex: number) => {
    get().takeSnapshot();
    set(produce((draft) => {
      const [movedLayer] = draft.layers.splice(fromIndex, 1);
      draft.layers.splice(toIndex, 0, movedLayer);
    }));
  },
  toggleLayerVisibility: (id: string) => {
    get().takeSnapshot();
    get().updateLayer(id, l => { l.visible = !l.visible });
  },
  toggleLayerLock: (id: string) => {
    get().takeSnapshot();
    get().updateLayer(id, l => { l.locked = !l.locked });
  },
  addCustomFont: (fontFamily: string) => {
    get().takeSnapshot();
    set(produce((draft) => {
      if (!draft.customFonts.includes(fontFamily)) {
        draft.customFonts.unshift(fontFamily);
      }
    }));
  },
  setBrandColors: (colors: string[]) => {
    set({ brandColors: colors });
  },
  setCanvasBackgroundColor: (color: string) => {
    get().takeSnapshot();
    set({ canvasBackgroundColor: color });
  },
  addSavedColor: (color: string) => {
    set(produce(draft => {
      const lowerCaseColor = color.toLowerCase();
      if (!draft.savedColors.some((c: string) => c.toLowerCase() === lowerCaseColor)) {
        draft.savedColors.push(color);
      }
    }));
  },
  copySelectedLayers: () => {
    const { layers, selectedLayerIds } = get();
    const layersToCopy = layers.filter(l => selectedLayerIds.includes(l.id));
    if (layersToCopy.length > 0) {
      set({ clipboard: JSON.parse(JSON.stringify(layersToCopy)) }); // Deep copy
    }
  },
  cutSelectedLayers: () => {
    const { layers, selectedLayerIds } = get();
    const unlockedLayersToCopy = layers.filter(l => selectedLayerIds.includes(l.id) && !l.locked);
    if (unlockedLayersToCopy.length > 0) {
      set({ clipboard: JSON.parse(JSON.stringify(unlockedLayersToCopy)) });
    }
    get().deleteSelectedLayers(); // This will only delete unlocked layers
  },
  pasteLayers: () => {
    const { clipboard } = get();
    if (clipboard) {
      get().takeSnapshot();
      const newIds: string[] = [];

      const deepCopyAndNewIds = (layers: Layer[]): Layer[] => {
          return layers.map(layer => {
              const newLayer: Layer = {
                ...layer,
                id: `layer_${Date.now()}_${Math.random()}`,
                x: layer.x + 20, // Offset pasted layer
                y: layer.y + 20,
              };
              newIds.push(newLayer.id);
              if (newLayer.type === LayerType.Group) {
                  newLayer.properties = {
                      ...newLayer.properties,
                      children: deepCopyAndNewIds((newLayer.properties as GroupLayerProps).children)
                  };
              }
              return newLayer;
          });
      };
      
      const newLayers = deepCopyAndNewIds(clipboard);
      set(produce(draft => {
        draft.layers.push(...newLayers);
        draft.selectedLayerIds = newIds;
        draft.isCanvasSelected = false;
      }));
    }
  },
  sendLayerBackward: (id: string) => {
    const { layers } = get();
    const layer = layers.find(l => l.id === id);
    if (layer?.locked) return;
    const fromIndex = layers.findIndex(l => l.id === id);
    if (fromIndex > 0) {
      const toIndex = fromIndex - 1;
      get().reorderLayer(fromIndex, toIndex);
    }
  },
  bringLayerForward: (id: string) => {
    const { layers } = get();
    const layer = layers.find(l => l.id === id);
    if (layer?.locked) return;
    const fromIndex = layers.findIndex(l => l.id === id);
    if (fromIndex !== -1 && fromIndex < layers.length - 1) {
      const toIndex = fromIndex + 1;
      get().reorderLayer(fromIndex, toIndex);
    }
  },
  sendToBack: (id: string) => {
    const { layers } = get();
    const layer = layers.find(l => l.id === id);
    if (layer?.locked) return;
    const fromIndex = layers.findIndex(l => l.id === id);
    if (fromIndex > 0) {
      get().reorderLayer(fromIndex, 0);
    }
  },
  bringToFront: (id: string) => {
    const { layers } = get();
    const layer = layers.find(l => l.id === id);
    if (layer?.locked) return;
    const fromIndex = layers.findIndex(l => l.id === id);
    if (fromIndex !== -1 && fromIndex < layers.length - 1) {
      get().reorderLayer(fromIndex, layers.length - 1);
    }
  },
  groupSelectedLayers: () => {
    const { layers, selectedLayerIds } = get();

    const unlockedSelectedIds = selectedLayerIds.filter(id => {
        const layer = layers.find(l => l.id === id);
        return layer && !layer.locked;
    });
    
    if (unlockedSelectedIds.length <= 1) return;
    
    get().takeSnapshot();

    const selectedLayers = layers.filter(l => unlockedSelectedIds.includes(l.id));
    
    const minX = Math.min(...selectedLayers.map(l => l.x));
    const minY = Math.min(...selectedLayers.map(l => l.y));
    const maxX = Math.max(...selectedLayers.map(l => l.x + l.width));
    const maxY = Math.max(...selectedLayers.map(l => l.y + l.height));

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;

    const children = selectedLayers.map(l => ({
      ...l,
      x: l.x - minX,
      y: l.y - minY,
    }));

    const newGroup: Layer = {
      id: `group_${Date.now()}_${Math.random()}`,
      type: LayerType.Group,
      x: minX,
      y: minY,
      width: groupWidth,
      height: groupHeight,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      properties: { children } as GroupLayerProps,
    };
    
    set(produce(draft => {
        draft.layers = draft.layers.filter(l => !unlockedSelectedIds.includes(l.id));
        draft.layers.push(newGroup);
        draft.selectedLayerIds = [newGroup.id];
        draft.isCanvasSelected = false;
    }));
  },
  ungroupLayer: (groupId: string) => {
    get().takeSnapshot();
    set(produce(draft => {
        const groupIndex = draft.layers.findIndex(l => l.id === groupId);
        if (groupIndex === -1) return;

        const groupLayer = draft.layers[groupIndex];
        if (groupLayer.type !== LayerType.Group || groupLayer.locked) return;

        const children = (groupLayer.properties as GroupLayerProps).children.map(child => ({
            ...child,
            x: groupLayer.x + child.x,
            y: groupLayer.y + child.y,
        }));
        
        draft.layers.splice(groupIndex, 1, ...children);
        draft.selectedLayerIds = children.map(c => c.id);
        draft.isCanvasSelected = false;
    }));
  },
  setZoom: (zoom: number) => {
      set({ zoom: Math.max(0.01, Math.min(zoom, 10)) }); // Clamp zoom between 1% and 1000%
  },
  zoomIn: () => {
    const { zoom } = get();
    get().setZoom(zoom * 1.2);
  },
  zoomOut: () => {
    const { zoom } = get();
    get().setZoom(zoom / 1.2);
  },
  setPanning: (panning: boolean) => {
    set({panning});
  },
  selectCanvas: () => set({ selectedLayerIds: [], isCanvasSelected: true }),
  deselectAll: () => set({ selectedLayerIds: [], isCanvasSelected: false }),
  setCanvasName: (name: string) => {
    set({ canvasName: name });
  },
  newCanvas: () => {
    get().takeSnapshot();
    const presentState = get();
    const blankState: CanvasState = {
        ...initialState,
        customFonts: presentState.customFonts,
        brandColors: presentState.brandColors,
        savedColors: presentState.savedColors,
        zoom: 1,
        panning: false,
    };
    history.present = blankState;
    history.future = [];
    set(blankState);
  },
}));

const createNewLayer = (type: LayerType): Layer => {
    const { canvasWidth, canvasHeight } = useCanvasStore.getState();
    const commonProps = {
        id: `layer_${Date.now()}_${Math.random()}`,
        x: canvasWidth / 2 - 50,
        y: canvasHeight / 2 - 50,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
    };

    const defaultShapeProps: ShapeLayerProps = {
      fill: 'rgba(204, 204, 204, 1)',
      stroke: 'rgba(0, 0, 0, 1)',
      strokeWidth: 0,
    };

    switch (type) {
        case LayerType.Text:
            return {
                ...commonProps,
                x: canvasWidth / 2 - 100,
                y: canvasHeight / 2 - 25,
                type: LayerType.Text,
                width: 200,
                height: 50,
                properties: {
                    text: 'Double click to edit',
                    fontFamily: 'Roboto',
                    fontSize: 24,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: 'rgba(0, 0, 0, 1)',
                    textAlign: 'left',
                    letterSpacing: 0,
                    lineHeight: 1.2,
                    textTransform: 'none',
                } as TextLayerProps,
            };
        case LayerType.Image:
             return {
                ...commonProps,
                x: canvasWidth / 2 - 100,
                y: canvasHeight / 2 - 100,
                type: LayerType.Image,
                width: 200,
                height: 200,
                properties: {
                    src: 'https://picsum.photos/200',
                    flipHorizontal: false,
                    flipVertical: false,
                    filters: defaultFilters,
                },
            };
        case LayerType.Rectangle:
        case LayerType.Square:
             return { ...commonProps, type, width: 100, height: 100, properties: { ...defaultShapeProps, cornerRadius: [0, 0, 0, 0] } };
        case LayerType.Triangle:
        case LayerType.Arrow:
        case LayerType.Heart:
        case LayerType.Diamond:
        case LayerType.Parallelogram:
        case LayerType.Trapezoid:
            return { ...commonProps, type, width: 100, height: 100, properties: defaultShapeProps };
        case LayerType.Ellipse:
        case LayerType.Circle:
            return { ...commonProps, type, width: 100, height: 100, properties: defaultShapeProps };
        case LayerType.Polygon:
             return { ...commonProps, type, width: 100, height: 100, properties: {...defaultShapeProps, points: 6} };
        case LayerType.Star:
            return { ...commonProps, type, width: 100, height: 100, properties: {...defaultShapeProps, points: 5, innerRadiusRatio: 0.5} };
        default:
            throw new Error('Unknown layer type');
    }
};

// Initialize history
history.present = useCanvasStore.getState();

export { useCanvasStore };