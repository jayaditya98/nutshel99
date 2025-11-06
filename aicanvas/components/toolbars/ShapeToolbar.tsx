import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Layer, LayerType, ShapeLayerProps } from '../../types';
import ColorPicker from '../ColorPicker';
import { ToolbarButton, ToolbarDivider, ToolbarPopover } from './Common';
import { SharedControls } from './SharedControls';
import { CornerRadiusIcon, Link2Icon, Unlink2Icon } from '../ui/Icons';

interface ShapeToolbarProps {
    layer: Layer;
}

const CornerInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur: () => void; }> = ({ label, value, onChange, onBlur }) => (
    <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">{label}</span>
        <input
            type="number"
            min="0"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            title={`Set ${label} corner radius`}
            className="w-full pl-7 pr-1 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-center focus:ring-1 focus:ring-nutshel-blue outline-none"
        />
    </div>
);

const CornerRadiusControl: React.FC<{
    cornerRadius: [number, number, number, number];
    onChange: (newRadius: [number, number, number, number]) => void;
    onCommit: () => void;
}> = ({ cornerRadius, onChange, onCommit }) => {
    const areAllCornersSame = cornerRadius.every(val => val === cornerRadius[0]);
    const [isLinked, setIsLinked] = useState(areAllCornersSame);

    useEffect(() => {
        setIsLinked(cornerRadius.every(val => val === cornerRadius[0]));
    }, [cornerRadius]);

    const handleLinkToggle = () => {
        if (!isLinked) { // Becoming linked
            onChange([cornerRadius[0], cornerRadius[0], cornerRadius[0], cornerRadius[0]]);
            onCommit();
        }
        setIsLinked(!isLinked);
    };

    const handleUniformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10) || 0;
        onChange([value, value, value, value]);
    };

    const handleIndividualChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10) || 0;
        // FIX: Spreading a tuple creates a `number[]`, not a new tuple. Use a type assertion to inform TypeScript that the array's structure matches the tuple type.
        const newRadii = [...cornerRadius] as [number, number, number, number];
        newRadii[index] = value;
        onChange(newRadii);
    };

    return (
        <ToolbarPopover
            trigger={
                <ToolbarButton label="Corner Radius">
                    <CornerRadiusIcon className="w-5 h-5" />
                </ToolbarButton>
            }
        >
            <div className="p-2 w-56 space-y-2">
                <div className="flex justify-between items-center px-1">
                    <h4 className="text-xs font-semibold text-gray-400">CORNER RADIUS</h4>
                    <button onClick={handleLinkToggle} title={isLinked ? "Edit corners individually" : "Edit all corners together"}>
                        {isLinked ? <Link2Icon className="w-4 h-4 text-gray-400 hover:text-white" /> : <Unlink2Icon className="w-4 h-4 text-nutshel-blue" />}
                    </button>
                </div>
                {isLinked ? (
                    <div className="relative">
                        <CornerRadiusIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <input
                            type="number"
                            min="0"
                            value={cornerRadius[0]}
                            onChange={handleUniformChange}
                            onBlur={onCommit}
                            title="Set all corner radii"
                            className="w-full pl-8 pr-2 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-center focus:ring-1 focus:ring-nutshel-blue outline-none"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <CornerInput label="TL" value={cornerRadius[0]} onChange={(e) => handleIndividualChange(0, e)} onBlur={onCommit} />
                        <CornerInput label="TR" value={cornerRadius[1]} onChange={(e) => handleIndividualChange(1, e)} onBlur={onCommit} />
                        <CornerInput label="BL" value={cornerRadius[3]} onChange={(e) => handleIndividualChange(3, e)} onBlur={onCommit} />
                        <CornerInput label="BR" value={cornerRadius[2]} onChange={(e) => handleIndividualChange(2, e)} onBlur={onCommit} />
                    </div>
                )}
            </div>
        </ToolbarPopover>
    );
};

export const ShapeToolbar: React.FC<ShapeToolbarProps> = ({ layer }) => {
    const { updateLayer, takeSnapshot } = useCanvasStore();
    const props = layer.properties as ShapeLayerProps;
    const isRectOrSquare = layer.type === LayerType.Rectangle || layer.type === LayerType.Square;

    const handlePropChange = (key: keyof ShapeLayerProps, value: any) => {
        updateLayer(layer.id, l => {
            if (
                l.type !== LayerType.Text &&
                l.type !== LayerType.Image &&
                l.type !== LayerType.Group
            ) {
                (l.properties as any)[key] = value;
            }
        });
    };

    return (
        <>
            <div className="flex items-center space-x-2">
                <span className="text-sm">Fill</span>
                <ColorPicker
                    color={props.fill}
                    onChange={(color) => handlePropChange('fill', color)}
                    onChangeComplete={takeSnapshot}
                    title="Change fill color"
                />
            </div>
            <ToolbarDivider />
            <div className="flex items-center space-x-2">
                <span className="text-sm">Stroke</span>
                <ColorPicker
                    color={props.stroke}
                    onChange={(color) => handlePropChange('stroke', color)}
                    onChangeComplete={takeSnapshot}
                    title="Change stroke color"
                />
            </div>
            <input
                type="number"
                min="0"
                value={props.strokeWidth}
                onChange={(e) => handlePropChange('strokeWidth', parseInt(e.target.value))}
                onBlur={takeSnapshot}
                className="w-20 p-2 border border-white/10 rounded-md bg-white/5 text-gray-200 text-sm text-center focus:ring-nutshel-blue focus:border-nutshel-blue outline-none"
                title="Stroke Width"
            />
            {isRectOrSquare && (
                <>
                    <ToolbarDivider />
                    <CornerRadiusControl
                        cornerRadius={props.cornerRadius || [0, 0, 0, 0]}
                        onChange={(newRadius) => handlePropChange('cornerRadius', newRadius)}
                        onCommit={takeSnapshot}
                    />
                </>
            )}
            <div className="flex-grow" /> {/* Spacer */}
            <SharedControls layer={layer} />
        </>
    );
};