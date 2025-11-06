import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Layer } from '../../types';
import { LayersIcon } from '../ui/Icons';
import { ToolbarButton } from './Common';
import { SharedControls } from './SharedControls';

interface GroupToolbarProps {
    layer: Layer;
}

export const GroupToolbar: React.FC<GroupToolbarProps> = ({ layer }) => {
    const { ungroupLayer } = useCanvasStore();

    return (
        <>
            <ToolbarButton onClick={() => ungroupLayer(layer.id)} label="Ungroup Layers">
                <LayersIcon className="w-5 h-5" />
                <span className="ml-2">Ungroup</span>
            </ToolbarButton>
            <div className="flex-grow" /> {/* Spacer */}
            <SharedControls layer={layer} />
        </>
    );
};
