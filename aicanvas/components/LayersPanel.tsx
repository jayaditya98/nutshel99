import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { EyeIcon, EyeOffIcon, TrashIcon, LockIcon, UnlockIcon } from './ui/Icons';
import { LayerType } from '../types';

const layerTypeToName = (type: LayerType) => {
    switch (type) {
        case LayerType.Text: return "Text";
        case LayerType.Image: return "Image";
        case LayerType.Rectangle: return "Rectangle";
        case LayerType.Ellipse: return "Ellipse";
        case LayerType.Group: return "Group";
        case LayerType.Square: return "Square";
        case LayerType.Circle: return "Circle";
        case LayerType.Triangle: return "Triangle";
        case LayerType.Polygon: return "Polygon";
        case LayerType.Star: return "Star";
        case LayerType.Arrow: return "Arrow";
        case LayerType.Heart: return "Heart";
        case LayerType.Diamond: return "Diamond";
        case LayerType.Parallelogram: return "Parallelogram";
        case LayerType.Trapezoid: return "Trapezoid";
        default: return "Layer";
    }
}

const LayersPanel: React.FC = () => {
  const { layers, selectedLayerIds, setSelectedLayers, deleteSelectedLayers, reorderLayer, toggleLayerVisibility, toggleLayerLock } = useCanvasStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDelete = (id: string) => {
      setSelectedLayers([id]);
      setTimeout(() => deleteSelectedLayers(), 0);
  }

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const draggedOverItem = e.currentTarget;
    draggedOverItem.classList.add('border-t-2', 'border-nutshel-blue');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('border-t-2', 'border-nutshel-blue');
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      // Reorder from top of the list (visual) to bottom of z-index (render order)
      const fromVisualIndex = layers.length - 1 - draggedIndex;
      const toVisualIndex = layers.length - 1 - toIndex;
      reorderLayer(fromVisualIndex, toVisualIndex);
    }
    setDraggedIndex(null);
    e.currentTarget.classList.remove('border-t-2', 'border-nutshel-blue');
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  }

  const reversedLayers = [...layers].reverse();

  return (
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="text-lg font-bold mb-4 px-2 text-white">Layers</h3>
      <ul className="flex-1 overflow-y-auto space-y-1">
        {reversedLayers.map((layer, index) => (
          <li
            key={layer.id}
            draggable={!layer.locked}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => setSelectedLayers([layer.id])}
            className={`flex items-center justify-between p-2 rounded-md transition-colors ${
              selectedLayerIds.includes(layer.id) ? 'bg-nutshel-blue/20' : 'hover:bg-white/5'
            } ${layer.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-sm font-medium truncate">{layerTypeToName(layer.type)}</span>
            <div className="flex items-center space-x-2 text-gray-400">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerLock(layer.id);
                }}
                className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
                aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
                title={layer.locked ? "Unlock layer" : "Lock layer"}
              >
                {layer.locked ? <LockIcon className="w-4 h-4 text-gray-500" /> : <UnlockIcon className="w-4 h-4 hover:text-white" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
                className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
                aria-label={layer.visible ? "Hide layer" : "Show layer"}
                title={layer.visible ? "Hide layer" : "Show layer"}
              >
                {layer.visible ? <EyeIcon className="w-4 h-4 hover:text-white" /> : <EyeOffIcon className="w-4 h-4 text-gray-500 hover:text-white" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(layer.id);
                }}
                className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue disabled:opacity-50"
                aria-label="Delete layer"
                title="Delete layer"
                disabled={layer.locked}
              >
                <TrashIcon className="w-4 h-4 hover:text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayersPanel;