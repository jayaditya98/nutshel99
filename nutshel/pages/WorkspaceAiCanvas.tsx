import React, { useEffect, useRef, useLayoutEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from '../../aicanvas/components/Canvas';
import LayersPanel from '../../aicanvas/components/LayersPanel';
import Toolbar from '../../aicanvas/components/Toolbar';
import TopBar from '../../aicanvas/components/TopBar';
import ZoomControls from '../../aicanvas/components/ZoomControls';
import ChatPanel from '../../aicanvas/components/ChatPanel';
import { useCanvasStore } from '../../aicanvas/store/canvasStore';
import { LayerType } from '../../aicanvas/types';
import ContextualToolbar from '../../aicanvas/components/ContextualToolbar';
import { ChevronLeftIcon, ChevronRightIcon } from '../../aicanvas/components/ui/Icons';
import { getCanvasDesignWithFallback } from '../utils/canvasStorage';

const WorkspaceAiCanvas: React.FC = () => {
  const location = useLocation();
  const { 
    zoom, setZoom, zoomIn, zoomOut, panning, setPanning,
    canvasWidth, canvasHeight, deselectAll, setCanvasName,
    setCanvasSize, setLayers, setCanvasBackgroundColor
  } = useCanvasStore();

  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Load canvas state from IndexedDB (with localStorage fallback) if assetSeed is provided
  useEffect(() => {
    const loadCanvasState = async () => {
      const assetSeed = (location.state as any)?.assetSeed as string | undefined;
      if (assetSeed) {
        try {
          // Use IndexedDB with localStorage fallback and migration
          const canvasState = await getCanvasDesignWithFallback(assetSeed);
          if (canvasState) {
            if (canvasState.layers) {
              setLayers(canvasState.layers);
            }
            if (canvasState.canvasWidth && canvasState.canvasHeight) {
              setCanvasSize(canvasState.canvasWidth, canvasState.canvasHeight);
            }
            if (canvasState.canvasName) {
              setCanvasName(canvasState.canvasName);
            }
            if (canvasState.canvasBackgroundColor) {
              setCanvasBackgroundColor(canvasState.canvasBackgroundColor);
            }
          }
        } catch (error) {
          console.error('Error loading canvas state:', error);
        }
      }
    };
    
    loadCanvasState();
  }, [location.state, setLayers, setCanvasSize, setCanvasName, setCanvasBackgroundColor]);

  const fitCanvasToScreen = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const { width: containerWidth, height: containerHeight } = canvasContainerRef.current.getBoundingClientRect();
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const newZoom = Math.min(scaleX, scaleY) * 0.9; // 0.9 provides some padding
    setZoom(newZoom);
    if (viewportRef.current) {
        viewportRef.current.style.transform = `translate(0px, 0px)`;
    }
  }, [canvasWidth, canvasHeight, setZoom]);

  useLayoutEffect(() => {
    fitCanvasToScreen();
  }, [canvasWidth, canvasHeight, fitCanvasToScreen]);

  useEffect(() => {
    const handleResize = () => fitCanvasToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitCanvasToScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      
      const { 
        addLayer, deleteSelectedLayers, copySelectedLayers, cutSelectedLayers, pasteLayers,
        sendLayerBackward, bringLayerForward, undo, redo, selectedLayerIds
      } = useCanvasStore.getState();
      
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (e.key === ' ' && !panning) {
        e.preventDefault();
        setPanning(true);
      }

      switch (e.key.toLowerCase()) {
        case 'r': if (!isCmdOrCtrl) { e.preventDefault(); addLayer(LayerType.Rectangle); } break;
        case 'c':
          if (isCmdOrCtrl && selectedLayerIds.length > 0) { e.preventDefault(); copySelectedLayers(); }
          else if (!isCmdOrCtrl) { e.preventDefault(); addLayer(LayerType.Ellipse); }
          break;
        case 't': if (!isCmdOrCtrl) { e.preventDefault(); addLayer(LayerType.Text); } break;
        case 'backspace':
        case 'delete': if (selectedLayerIds.length > 0) { e.preventDefault(); deleteSelectedLayers(); } break;
        case 'x': if (isCmdOrCtrl && selectedLayerIds.length > 0) { e.preventDefault(); cutSelectedLayers(); } break;
        case 'v': if (isCmdOrCtrl) { e.preventDefault(); pasteLayers(); } break;
        case 'z': if (isCmdOrCtrl) { e.preventDefault(); e.shiftKey ? redo() : undo(); } break;
        case '=':
        case '+': if (isCmdOrCtrl) { e.preventDefault(); zoomIn(); } break;
        case '-': if (isCmdOrCtrl) { e.preventDefault(); zoomOut(); } break;
        case '[': if (isCmdOrCtrl && selectedLayerIds.length === 1) { e.preventDefault(); sendLayerBackward(selectedLayerIds[0]); } break;
        case ']': if (isCmdOrCtrl && selectedLayerIds.length === 1) { e.preventDefault(); bringLayerForward(selectedLayerIds[0]); } break;
        default: break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            setPanning(false);
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
    };
  }, [panning, setPanning, zoomIn, zoomOut]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
        const state = useCanvasStore.getState();
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                state.zoomIn();
            } else {
                state.zoomOut();
            }
        } else if (state.panning && viewportRef.current) {
            e.preventDefault();
            const transform = new DOMMatrix(getComputedStyle(viewportRef.current).transform);
            const newX = transform.e - e.deltaX;
            const newY = transform.f - e.deltaY;
            viewportRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
        container.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  const handlePan = (e: React.MouseEvent) => {
    if (panning && viewportRef.current) {
        const transform = new DOMMatrix(getComputedStyle(viewportRef.current).transform);
        const newX = transform.e + e.movementX;
        const newY = transform.f + e.movementY;
        viewportRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  }

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click is on the gray area around the canvas, deselect everything.
    if (e.target === e.currentTarget) {
        deselectAll();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-nutshel-gray-dark text-gray-300 font-sans overflow-hidden fixed inset-0 z-50">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <ContextualToolbar />
            <main className="flex-1 flex overflow-hidden">
              <div 
                ref={canvasContainerRef}
                className={`flex-1 flex items-center justify-center bg-nutshel-gray-dark overflow-hidden relative ${panning ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseMove={handlePan}
                onMouseDown={handleContainerMouseDown}
              >
                <div ref={viewportRef} id="viewport">
                    <div id="zoom-container" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                        <Canvas />
                    </div>
                </div>
                <ZoomControls fitToScreen={fitCanvasToScreen}/>
              </div>
              <div className="relative">
                <div className={`transition-all duration-300 ease-in-out ${isLayersPanelOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
                    <div className="w-72 bg-nutshel-gray border-l border-white/10 flex flex-col h-full">
                        <LayersPanel />
                    </div>
                </div>
                <button
                    onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
                    title={isLayersPanelOpen ? 'Hide Layers' : 'Show Layers'}
                    className="absolute top-1/2 -left-3 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-nutshel-gray border border-white/10 text-gray-400 hover:bg-nutshel-blue hover:text-black transition-colors"
                >
                    {isLayersPanelOpen ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                </button>
              </div>
            </main>
        </div>
      </div>
      <ChatPanel />
    </div>
  );
};

export default WorkspaceAiCanvas;
