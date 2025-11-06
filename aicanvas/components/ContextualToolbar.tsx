import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { LayerType } from '../types';
import { TextToolbar } from './toolbars/TextToolbar';
import { ImageToolbar } from './toolbars/ImageToolbar';
import { ShapeToolbar } from './toolbars/ShapeToolbar';
import { MultiSelectToolbar } from './toolbars/MultiSelectToolbar';
import { GroupToolbar } from './toolbars/GroupToolbar';
import { CanvasToolbar } from './toolbars/CanvasToolbar';

const ContextualToolbar: React.FC = () => {
    const { selectedLayerIds, layers, isCanvasSelected } = useCanvasStore();

    let toolbarContent: React.ReactNode | null = null;

    if (isCanvasSelected) {
        toolbarContent = <CanvasToolbar />;
    } else if (selectedLayerIds.length > 1) {
        toolbarContent = <MultiSelectToolbar />;
    } else if (selectedLayerIds.length === 1) {
        const selectedLayer = layers.find(l => l.id === selectedLayerIds[0]);
        if (selectedLayer) {
            switch(selectedLayer.type) {
                case LayerType.Text:
                    toolbarContent = <TextToolbar layer={selectedLayer} />;
                    break;
                case LayerType.Image:
                    toolbarContent = <ImageToolbar layer={selectedLayer} />;
                    break;
                case LayerType.Rectangle:
                case LayerType.Square:
                case LayerType.Circle:
                case LayerType.Ellipse:
                case LayerType.Triangle:
                case LayerType.Polygon:
                case LayerType.Star:
                case LayerType.Arrow:
                case LayerType.Heart:
                case LayerType.Diamond:
                case LayerType.Parallelogram:
                case LayerType.Trapezoid:
                    toolbarContent = <ShapeToolbar layer={selectedLayer} />;
                    break;
                case LayerType.Group:
                    toolbarContent = <GroupToolbar layer={selectedLayer} />;
                    break;
            }
        }
    }
    
    if (!toolbarContent) {
        return null;
    }

    const containerClasses = "absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-nutshel-gray/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg flex items-center p-2 space-x-2 text-sm text-gray-300";

    return (
        <div className={containerClasses}>
            {toolbarContent}
        </div>
    );
};

export default ContextualToolbar;