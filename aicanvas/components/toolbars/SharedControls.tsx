import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Layer } from '../../types';
import { PositionControls } from './PositionControls';
import { ToolbarDivider } from './Common';

interface SharedControlsProps {
    layer: Layer;
}

export const SharedControls: React.FC<SharedControlsProps> = ({ layer }) => {
    const { updateLayer, takeSnapshot } = useCanvasStore();

    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateLayer(layer.id, { opacity: parseFloat(e.target.value) });
    };

    return (
        <>
            <ToolbarDivider />
            <PositionControls layerId={layer.id} />
            <ToolbarDivider />
            <div className="flex items-center space-x-2">
                <label htmlFor="opacity-slider" className="text-sm">Opacity</label>
                <input
                    id="opacity-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={layer.opacity}
                    onChange={handleOpacityChange}
                    onMouseUp={takeSnapshot}
                    title="Change layer opacity"
                    className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </>
    );
};