import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { ZoomInIcon, ZoomOutIcon, FitToScreenIcon } from './ui/Icons';

interface ZoomControlsProps {
    fitToScreen: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ fitToScreen }) => {
    const { zoom, zoomIn, zoomOut } = useCanvasStore();

    return (
        <div className="absolute bottom-4 right-4 bg-nutshel-gray/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg flex items-center p-1 space-x-1 text-white">
            <button
                onClick={zoomOut}
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
                aria-label="Zoom out"
                title="Zoom out"
            >
                <ZoomOutIcon className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold w-16 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <button
                onClick={zoomIn}
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
                aria-label="Zoom in"
                title="Zoom in"
            >
                <ZoomInIcon className="w-5 h-5" />
            </button>
             <div className="border-l border-white/10 h-5 mx-1"></div>
             <button
                onClick={fitToScreen}
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
                aria-label="Fit to screen"
                title="Fit to screen"
            >
                <FitToScreenIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ZoomControls;