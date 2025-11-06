import React from 'react';
import { GenerationMode } from '../types';

interface ModeSelectorProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const modes = [
  { id: GenerationMode.Style, label: 'Style', tooltip: 'Transfer lighting, colors, and visuals.' },
  { id: GenerationMode.Pose, label: 'Pose', tooltip: 'Mimic the body alignment and pose.' },
  { id: GenerationMode.Both, label: 'Both', tooltip: 'Combine both style and pose transfer.' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-center text-white">Select Mode</h3>
      <div className="grid grid-cols-3 gap-1 bg-nutshel-gray p-1 rounded-full">
        {modes.map((mode) => (
          <div key={mode.id} className="relative group">
            <button
              onClick={() => onModeChange(mode.id)}
              className={`w-full py-2 px-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                selectedMode === mode.id
                  ? 'bg-nutshel-blue text-black shadow-lg shadow-nutshel-blue/20'
                  : 'bg-transparent text-gray-300 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
             <span className="absolute bottom-full z-10 mb-2 w-max px-2 py-1 bg-nutshel-gray border border-white/10 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none left-1/2 -translate-x-1/2">
                {mode.tooltip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};