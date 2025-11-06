import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';

interface ResizeModalProps {
  onClose: () => void;
}

const presets = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 940, height: 788 },
  { name: 'Twitter Post', width: 1024, height: 512 },
  { name: 'A4 Document', width: 794, height: 1123 }, // 210x297mm at 96dpi
  { name: 'US Letter', width: 816, height: 1056 }, // 8.5x11in at 96dpi
];

const ResizeModal: React.FC<ResizeModalProps> = ({ onClose }) => {
  const { canvasWidth, canvasHeight, setCanvasSize } = useCanvasStore();
  const [width, setWidth] = useState(canvasWidth);
  const [height, setHeight] = useState(canvasHeight);

  const handleResize = () => {
    if (width > 0 && height > 0) {
      setCanvasSize(width, height);
      onClose();
    }
  };

  const handlePresetClick = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-nutshel-gray rounded-xl shadow-xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-white">Resize Canvas</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="width" className="block text-sm font-medium text-gray-400">Width (px)</label>
              <input
                type="number"
                id="width"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
                className="mt-1 block w-full p-2 border border-white/10 rounded-md shadow-sm bg-white/5 text-white focus:ring-nutshel-blue focus:border-nutshel-blue"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-400">Height (px)</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                className="mt-1 block w-full p-2 border border-white/10 rounded-md shadow-sm bg-white/5 text-white focus:ring-nutshel-blue focus:border-nutshel-blue"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset.width, preset.height)}
                  className="text-left p-2 rounded-md bg-white/5 hover:bg-white/10 text-sm text-gray-300"
                >
                  {preset.name} <span className="text-gray-500">({preset.width}x{preset.height})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleResize}
            className="px-5 py-2 bg-nutshel-blue text-black font-semibold rounded-full hover:opacity-90"
          >
            Resize
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResizeModal;