import React, { useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Layer, LayerType, TextLayerProps } from '../../types';
import ColorPicker from '../ColorPicker';
import { BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, CaseIcon, LineHeightIcon, LetterSpacingIcon } from '../ui/Icons';
import { ToolbarButton, ToolbarDivider, ToolbarPopover } from './Common';
import { SharedControls } from './SharedControls';
import FontSelector from './FontSelector';

interface TextToolbarProps {
    layer: Layer;
}

const CaseButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${
            isActive ? 'bg-nutshel-blue text-black font-semibold' : 'text-gray-300 hover:bg-white/10'
        }`}
    >
        {children}
    </button>
);


export const TextToolbar: React.FC<TextToolbarProps> = ({ layer }) => {
    const updateLayer = useCanvasStore(state => state.updateLayer);
    const takeSnapshot = useCanvasStore(state => state.takeSnapshot);
    const customFonts = useCanvasStore(state => state.customFonts);
    
    const props = layer.properties as TextLayerProps;
    const originalFontRef = useRef<string | null>(null);

    const handlePropChange = (key: keyof TextLayerProps, value: any) => {
        updateLayer(layer.id, l => {
            if (l.type === LayerType.Text) {
                (l.properties as any)[key] = value;
            }
        });
    };

    // --- Font Selector Handlers for Live Preview ---
    const handleOpenFontSelector = () => {
        originalFontRef.current = props.fontFamily;
    };

    const handleCloseFontSelector = () => {
        if (originalFontRef.current) {
            updateLayer(layer.id, l => {
                if (l.type === LayerType.Text) {
                    (l.properties as TextLayerProps).fontFamily = originalFontRef.current!;
                }
            });
            originalFontRef.current = null;
        }
    };
    
    const handlePreviewFont = (font: string) => {
        updateLayer(layer.id, l => {
            if (l.type === LayerType.Text) {
                (l.properties as TextLayerProps).fontFamily = font;
            }
        });
    };

    const handleRevertPreview = () => {
        if (originalFontRef.current) {
             updateLayer(layer.id, l => {
                if (l.type === LayerType.Text) {
                    (l.properties as TextLayerProps).fontFamily = originalFontRef.current!;
                }
            });
        }
    };

    const handleSelectFont = (font: string) => {
        originalFontRef.current = null; // Prevent reverting
        handlePropChange('fontFamily', font);
        takeSnapshot();
    };
    // --- End Font Selector Handlers ---

    return (
        <>
            {/* Font Family and Size */}
            <FontSelector
                fonts={customFonts}
                selectedFont={props.fontFamily}
                onSelectFont={handleSelectFont}
                onOpen={handleOpenFontSelector}
                onClose={handleCloseFontSelector}
                onPreviewFont={handlePreviewFont}
                onRevertPreview={handleRevertPreview}
            />
            <input 
                type="number" 
                title="Font size"
                value={props.fontSize} 
                onChange={(e) => handlePropChange('fontSize', parseInt(e.target.value))} 
                onBlur={takeSnapshot} 
                className="w-20 p-2 border border-white/10 rounded-md bg-white/5 text-gray-200 text-sm text-center focus:ring-nutshel-blue focus:border-nutshel-blue outline-none"
            />
             <div className="flex items-center space-x-1 p-2 border border-white/10 rounded-md bg-white/5" title="Line Height">
                <LineHeightIcon className="w-5 h-5 text-gray-400" />
                <input 
                    type="number"
                    step="0.1"
                    min="0"
                    title="Line height"
                    value={props.lineHeight} 
                    onChange={(e) => handlePropChange('lineHeight', parseFloat(e.target.value) || 0)} 
                    onBlur={takeSnapshot} 
                    className="w-12 bg-transparent text-gray-200 text-sm text-center [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none outline-none"
                />
            </div>
            <div className="flex items-center space-x-1 p-2 border border-white/10 rounded-md bg-white/5" title="Letter Spacing">
                <LetterSpacingIcon className="w-5 h-5 text-gray-400" />
                <input 
                    type="number"
                    step="0.1"
                    title="Letter spacing"
                    value={props.letterSpacing} 
                    onChange={(e) => handlePropChange('letterSpacing', parseFloat(e.target.value) || 0)} 
                    onBlur={takeSnapshot} 
                    className="w-12 bg-transparent text-gray-200 text-sm text-center [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none outline-none"
                />
            </div>
            <ToolbarDivider />
            {/* Color */}
            <ColorPicker 
                color={props.color}
                onChange={(color) => handlePropChange('color', color)}
                onChangeComplete={takeSnapshot}
                title="Change text color"
            />
            <ToolbarDivider />
            {/* Style Toggles */}
            <div className="flex items-center space-x-1 p-1 bg-white/5 rounded-md">
                <ToolbarButton label="Bold" isActive={props.fontWeight === 'bold'} onClick={() => { handlePropChange('fontWeight', props.fontWeight === 'bold' ? 'normal' : 'bold'); takeSnapshot(); }}>
                    <BoldIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton label="Italic" isActive={props.fontStyle === 'italic'} onClick={() => { handlePropChange('fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic'); takeSnapshot(); }}>
                    <ItalicIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton label="Underline" isActive={props.textDecoration === 'underline'} onClick={() => { handlePropChange('textDecoration', props.textDecoration === 'underline' ? 'none' : 'underline'); takeSnapshot(); }}>
                    <UnderlineIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarPopover
                    trigger={
                        <ToolbarButton label="Change Case">
                            <CaseIcon className="w-5 h-5" />
                        </ToolbarButton>
                    }
                >
                    <div className="flex flex-col space-y-1 w-32">
                        <CaseButton
                            onClick={() => { handlePropChange('textTransform', 'uppercase'); takeSnapshot(); }}
                            isActive={props.textTransform === 'uppercase'}
                        >
                            Uppercase
                        </CaseButton>
                        <CaseButton
                            onClick={() => { handlePropChange('textTransform', 'lowercase'); takeSnapshot(); }}
                            isActive={props.textTransform === 'lowercase'}
                        >
                            Lowercase
                        </CaseButton>
                        <CaseButton
                            onClick={() => { handlePropChange('textTransform', 'none'); takeSnapshot(); }}
                            isActive={props.textTransform === 'none'}
                        >
                            None
                        </CaseButton>
                    </div>
                </ToolbarPopover>
            </div>
            <ToolbarDivider />
            {/* Alignment Toggles */}
             <div className="flex items-center space-x-1 p-1 bg-white/5 rounded-md">
                <ToolbarButton label="Align Left" isActive={props.textAlign === 'left'} onClick={() => { handlePropChange('textAlign', 'left'); takeSnapshot(); }}>
                    <AlignLeftIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton label="Align Center" isActive={props.textAlign === 'center'} onClick={() => { handlePropChange('textAlign', 'center'); takeSnapshot(); }}>
                    <AlignCenterIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton label="Align Right" isActive={props.textAlign === 'right'} onClick={() => { handlePropChange('textAlign', 'right'); takeSnapshot(); }}>
                    <AlignRightIcon className="w-5 h-5" />
                </ToolbarButton>
            </div>

            <div className="flex-grow" /> {/* Spacer */}
            <SharedControls layer={layer} />
        </>
    );
};