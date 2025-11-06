import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenToolIcon, FilmIcon } from './WorkspaceIcons';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
}

type AssetSource = 'ai-canvas' | 'nutshel-studios';

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, projectId, projectName }) => {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<AssetSource | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!selectedSource) return;

    if (selectedSource === 'ai-canvas') {
      navigate('/workspace/canvas', { 
        state: { projectId, projectName } 
      });
    } else if (selectedSource === 'nutshel-studios') {
      navigate('/workspace/studios', { 
        state: { projectId, projectName } 
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-nutshel-gray p-8 rounded-2xl border border-white/10 max-w-md w-full mx-4 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-2xl font-bold">Add Asset to Project</h2>
          <p className="text-gray-300 mt-2">Choose how you want to create your asset for "{projectName}":</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-4 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border-2 border-transparent hover:border-white/20">
            <input
              type="radio"
              name="assetSource"
              value="ai-canvas"
              checked={selectedSource === 'ai-canvas'}
              onChange={() => setSelectedSource('ai-canvas')}
              className="w-5 h-5 text-nutshel-accent focus:ring-nutshel-accent"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-white/5 rounded-lg">
                <PenToolIcon className="w-6 h-6 text-nutshel-accent" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">AI Canvas</div>
                <div className="text-sm text-gray-400">Create and edit designs with text, images, and shapes</div>
              </div>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border-2 border-transparent hover:border-white/20">
            <input
              type="radio"
              name="assetSource"
              value="nutshel-studios"
              checked={selectedSource === 'nutshel-studios'}
              onChange={() => setSelectedSource('nutshel-studios')}
              className="w-5 h-5 text-nutshel-accent focus:ring-nutshel-accent"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-white/5 rounded-lg">
                <FilmIcon className="w-6 h-6 text-nutshel-accent" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Nutshel Studios</div>
                <div className="text-sm text-gray-400">Generate professional photoshoots and images</div>
              </div>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedSource}
            className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2 px-6 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;

