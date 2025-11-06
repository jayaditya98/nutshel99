import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Layer, ImageLayerProps, LayerType } from '../../types';
import { ToolbarButton, ToolbarPopover } from './Common';
import { SharedControls } from './SharedControls';
import { FlipHorizontalIcon, FlipVerticalIcon, FilterAdjustIcon, ResetIcon } from '../ui/Icons';

interface ImageToolbarProps {
    layer: Layer;
}

const FilterSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    onReset: () => void;
    min: number;
    max: number;
    step: number;
}> = ({ label, value, onChange, onReset, min, max, step }) => (
    <div className="flex items-center space-x-2 px-2 py-1">
        <button onClick={onReset} title={`Reset ${label}`} className="p-1 text-gray-400 hover:text-white"><ResetIcon className="w-3 h-3" /></button>
        <label className="text-xs font-medium w-20 truncate">{label}</label>
        <input
            type="range"
            title={label}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs w-8 text-right tabular-nums">{value.toFixed(label === 'Blur' ? 1 : 2)}</span>
    </div>
);


export const ImageToolbar: React.FC<ImageToolbarProps> = ({ layer }) => {
    const { updateLayer, takeSnapshot } = useCanvasStore();
    const props = layer.properties as ImageLayerProps;

    const handleFlip = (direction: 'horizontal' | 'vertical') => {
        updateLayer(layer.id, l => {
            const imgProps = l.properties as ImageLayerProps;
            if (direction === 'horizontal') {
                imgProps.flipHorizontal = !imgProps.flipHorizontal;
            } else {
                imgProps.flipVertical = !imgProps.flipVertical;
            }
        });
        takeSnapshot();
    };

    const handleFilterChange = (filterName: keyof ImageLayerProps['filters'], value: number) => {
        updateLayer(layer.id, l => {
            if (l.type === LayerType.Image) {
                (l.properties as ImageLayerProps).filters[filterName] = value;
            }
        });
    };
    
    const handleResetAllFilters = () => {
        updateLayer(layer.id, l => {
            if (l.type === LayerType.Image) {
                (l.properties as ImageLayerProps).filters = {
                    grayscale: 0, sepia: 0, invert: 0,
                    brightness: 1, contrast: 1, saturate: 1,
                    blur: 0, hueRotate: 0,
                };
            }
        });
        takeSnapshot();
    }
    
    return (
        <>
            <ToolbarPopover
                trigger={
                    <ToolbarButton label="Flip">
                        <FlipHorizontalIcon className="w-5 h-5" />
                        <span className="ml-2 text-sm">Flip</span>
                    </ToolbarButton>
                }
            >
                <div className="flex flex-col space-y-1 w-48">
                    <button onClick={() => handleFlip('horizontal')} className="flex items-center space-x-2 text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">
                        <FlipHorizontalIcon className="w-4 h-4" /> <span>Flip Horizontal</span>
                    </button>
                    <button onClick={() => handleFlip('vertical')} className="flex items-center space-x-2 text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">
                        <FlipVerticalIcon className="w-4 h-4" /> <span>Flip Vertical</span>
                    </button>
                </div>
            </ToolbarPopover>

            <ToolbarPopover
                trigger={
                    <ToolbarButton label="Filters">
                        <FilterAdjustIcon className="w-5 h-5" />
                        <span className="ml-2 text-sm">Filters</span>
                    </ToolbarButton>
                }
            >
                <div className="flex flex-col space-y-1 w-80" onMouseUp={takeSnapshot}>
                    <FilterSlider label="Brightness" value={props.filters.brightness} onChange={v => handleFilterChange('brightness', v)} onReset={() => handleFilterChange('brightness', 1)} min={0} max={2} step={0.01} />
                    <FilterSlider label="Contrast" value={props.filters.contrast} onChange={v => handleFilterChange('contrast', v)} onReset={() => handleFilterChange('contrast', 1)} min={0} max={2} step={0.01} />
                    <FilterSlider label="Saturation" value={props.filters.saturate} onChange={v => handleFilterChange('saturate', v)} onReset={() => handleFilterChange('saturate', 1)} min={0} max={2} step={0.01} />
                    <FilterSlider label="Grayscale" value={props.filters.grayscale} onChange={v => handleFilterChange('grayscale', v)} onReset={() => handleFilterChange('grayscale', 0)} min={0} max={1} step={0.01} />
                    <FilterSlider label="Sepia" value={props.filters.sepia} onChange={v => handleFilterChange('sepia', v)} onReset={() => handleFilterChange('sepia', 0)} min={0} max={1} step={0.01} />
                    <FilterSlider label="Invert" value={props.filters.invert} onChange={v => handleFilterChange('invert', v)} onReset={() => handleFilterChange('invert', 0)} min={0} max={1} step={0.01} />
                    <FilterSlider label="Hue Rotate" value={props.filters.hueRotate} onChange={v => handleFilterChange('hueRotate', v)} onReset={() => handleFilterChange('hueRotate', 0)} min={0} max={360} step={1} />
                    <FilterSlider label="Blur" value={props.filters.blur} onChange={v => handleFilterChange('blur', v)} onReset={() => handleFilterChange('blur', 0)} min={0} max={10} step={0.1} />
                    <div className="border-t border-white/10 my-1"></div>
                    <button onClick={handleResetAllFilters} className="w-full text-center px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10">
                        Reset All Filters
                    </button>
                </div>
            </ToolbarPopover>
            
            <div className="flex-grow" /> {/* Spacer */}
            <SharedControls layer={layer} />
        </>
    );
};