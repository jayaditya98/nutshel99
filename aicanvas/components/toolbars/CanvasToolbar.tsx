import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import ColorPicker from '../ColorPicker';

export const CanvasToolbar: React.FC = () => {
    const { canvasBackgroundColor, setCanvasBackgroundColor, takeSnapshot } = useCanvasStore();

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Background</span>
            <ColorPicker
                color={canvasBackgroundColor}
                onChange={setCanvasBackgroundColor}
                onChangeComplete={takeSnapshot}
                title="Change canvas background color"
            />
        </div>
    );
};