import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { LayersIcon } from '../ui/Icons';
import { ToolbarButton, ToolbarPopover } from './Common';

interface PositionControlsProps {
    layerId: string;
}

export const PositionControls: React.FC<PositionControlsProps> = ({ layerId }) => {
    const { bringLayerForward, sendLayerBackward, bringToFront, sendToBack } = useCanvasStore();

    return (
        <ToolbarPopover
            trigger={
                <ToolbarButton label="Position">
                    <LayersIcon className="w-5 h-5" />
                    <span className="ml-2 text-sm">Position</span>
                </ToolbarButton>
            }
        >
            <div className="flex flex-col space-y-1 w-40">
                <button onClick={() => bringToFront(layerId)} className="text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">Bring to front</button>
                <button onClick={() => bringLayerForward(layerId)} className="text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">Bring forward</button>
                <button onClick={() => sendLayerBackward(layerId)} className="text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">Send backward</button>
                <button onClick={() => sendToBack(layerId)} className="text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">Send to back</button>
            </div>
        </ToolbarPopover>
    );
};