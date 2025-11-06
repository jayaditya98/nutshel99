import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import LayerComponent from './LayerComponent';
import SnappingGuides from './SnappingGuides';

const Canvas: React.FC = () => {
  const { layers, setSelectedLayers, selectCanvas, canvasWidth, canvasHeight, zoom, panning, canvasBackgroundColor, isCanvasSelected } = useCanvasStore();
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ horizontal: number[]; vertical: number[] }>({ horizontal: [], vertical: [] });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panning) return;
    // Start marquee selection if clicking on the canvas background
    if (e.target === e.currentTarget) {
      selectCanvas(); // Select the canvas and deselect layers
      
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const startX = (e.clientX - canvasRect.left) / zoom;
      const startY = (e.clientY - canvasRect.top) / zoom;

      setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });

      const onMouseMove = (moveEvent: MouseEvent) => {
        const currentX = (moveEvent.clientX - canvasRect.left) / zoom;
        const currentY = (moveEvent.clientY - canvasRect.top) / zoom;
        
        setSelectionBox({
          x: Math.min(startX, currentX),
          y: Math.min(startY, currentY),
          width: Math.abs(currentX - startX),
          height: Math.abs(currentY - startY),
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        
        setSelectionBox(prevBox => {
            if (prevBox && (prevBox.width > 5 || prevBox.height > 5)) {
                const selectedIds: string[] = [];
                layers.forEach(layer => {
                    const layerRect = { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
                    if (
                        prevBox.x < layerRect.x + layerRect.width &&
                        prevBox.x + prevBox.width > layerRect.x &&
                        prevBox.y < layerRect.y + layerRect.height &&
                        prevBox.y + prevBox.height > layerRect.y
                    ) {
                        selectedIds.push(layer.id);
                    }
                });
                if (selectedIds.length > 0) {
                    setSelectedLayers(selectedIds); // This will deselect the canvas
                }
            }
            // If it was just a click or an empty marquee, the canvas remains selected.
            return null; // Hide the box
        });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }
  };

  return (
    <div
      id="canvas"
      className={`relative shadow-lg ${isCanvasSelected ? 'outline outline-2 outline-offset-[-2px] outline-nutshel-blue' : ''}`}
      style={{ width: canvasWidth, height: canvasHeight, backgroundColor: canvasBackgroundColor }}
      onMouseDown={handleMouseDown}
    >
      <SnappingGuides guides={snapGuides} />
      {layers.map((layer, index) => (
         layer.visible && <LayerComponent key={layer.id} layer={layer} index={index} setSnapGuides={setSnapGuides} />
      ))}
      {selectionBox && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
          style={{
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
        />
      )}
    </div>
  );
};

export default Canvas;