import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { LayersIcon } from '../ui/Icons';
import { ToolbarButton } from './Common';

export const MultiSelectToolbar: React.FC = () => {
    const { selectedLayerIds, groupSelectedLayers } = useCanvasStore();

    return (
        <>
            <span className="font-semibold">{selectedLayerIds.length} Layers Selected</span>
            <div className="flex-grow" />
            <ToolbarButton onClick={groupSelectedLayers} label="Group Layers">
                <LayersIcon className="w-5 h-5" />
                <span className="ml-2">Group</span>
            </ToolbarButton>
        </>
    );
};
