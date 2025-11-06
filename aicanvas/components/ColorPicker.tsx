import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { SketchPicker } from 'react-color';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onChangeComplete?: () => void;
  title?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, onChangeComplete, title = "Change color" }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const { savedColors, brandColors, addSavedColor } = useCanvasStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = useCallback(() => {
    setDisplayColorPicker(false);
    if (onChangeComplete) {
        onChangeComplete();
    }
  }, [onChangeComplete]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            handleClose();
        }
    };
    if (displayColorPicker) {
      document.addEventListener('mousedown', handleMouseDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [displayColorPicker, handleClose]);
  
  const handleChange = (colorResult: any) => {
    const { r, g, b, a } = colorResult.rgb;
    onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
  };

  const handleAddColor = () => {
    addSavedColor(color);
  };

  const handleSwatchClick = (c: string) => {
      onChange(c);
      if (onChangeComplete) {
          onChangeComplete();
      }
  }

  return (
    <div className="relative">
      <div className="p-1 bg-white/5 border border-white/10 rounded-md inline-block cursor-pointer" onClick={handleClick} title={title}>
        <div className="w-8 h-5 rounded-sm" style={{ backgroundColor: color, backgroundImage: color.startsWith('rgba') && color.endsWith('0)') ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3e%3cpath d='M1 2V0h1v1H0v1z' fill-opacity='0.2'/%3e%3c/svg%3e")` : 'none' }} />
      </div>
      {displayColorPicker ? (
        <div className="absolute z-20" ref={popoverRef}>
             <div className="bg-nutshel-gray rounded-md shadow-lg border border-white/10 w-[240px]">
              <SketchPicker
                color={color}
                onChange={handleChange}
                onChangeComplete={onChangeComplete ? () => onChangeComplete() : undefined}
                presetColors={[]} // Disable default presets
                width="100%"
                 styles={{
                    default: {
                        picker: { boxShadow: 'none', border: 'none', padding: '10px 10px 0', background: 'transparent', borderRadius: '0' },
                        saturation: { borderRadius: '4px' },
                        hue: { borderRadius: '4px' },
                        alpha: { borderRadius: '4px' },
                        controls: { paddingTop: '8px', color: '#fff' },
                        color: { color: '#fff' },
                        label: { color: '#fff' },
                        input: { backgroundColor: 'rgba(255,255,255,0.05)', boxShadow: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                }}
              />
              <div className="p-2 border-t border-white/10 space-y-3">
                {brandColors.length > 0 && (
                    <div>
                        <span className="text-xs font-semibold text-gray-400">Brand Colors:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {brandColors.map(c => (
                                <div key={c} onClick={() => handleSwatchClick(c)} title={c} className="w-5 h-5 rounded-full cursor-pointer border border-white/10 hover:scale-110 transition-transform" style={{backgroundColor: c}}></div>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-400">Saved Colors:</span>
                        <button onClick={handleAddColor} className="text-xs text-nutshel-blue/80 hover:text-nutshel-blue font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue rounded">
                          + Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {savedColors.map(c => (
                            <div key={c} onClick={() => handleSwatchClick(c)} title={c} className="w-5 h-5 rounded-full cursor-pointer border border-white/10 hover:scale-110 transition-transform" style={{backgroundColor: c}}></div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;