import React from 'react';
import { HistoryItem, SerializableFile } from '../types';
import { XIcon } from './IconComponents';

// Helper to format timestamp
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return 'Just now';

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  return `${Math.floor(seconds)} seconds ago`;
};

const HistoryItemCard: React.FC<{ item: HistoryItem; onLoad: (item: HistoryItem) => void }> = ({ item, onLoad }) => {
  const allInputImages: SerializableFile[] = [
    ...item.state.subjects,
    ...(item.state.background.file ? [item.state.background.file] : []),
    ...(item.state.clothing.file ? [item.state.clothing.file] : []),
    ...item.state.accessories.filter(a => a.file).map(a => a.file!),
  ];

  return (
    <button
      onClick={() => onLoad(item)}
      className="w-full text-left bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors space-y-3"
    >
      <div className="flex gap-4">
        <img src={item.resultImageUrl} alt="Generated result" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-gray-200 truncate" title={item.state.compositionPrompt}>
            {item.state.compositionPrompt || 'Untitled Generation'}
          </p>
          <p className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</p>
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
            <strong>BG:</strong> {item.state.background.description || 'Uploaded image'}
          </p>
        </div>
      </div>
      {allInputImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1.5">Inputs:</p>
          <div className="flex gap-2 flex-wrap">
            {allInputImages.map((img, index) => (
              <img key={index} src={img.dataUrl} alt={img.name} className="w-10 h-10 object-cover rounded-md" title={img.name} />
            ))}
          </div>
        </div>
      )}
    </button>
  );
};

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onClear }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-nutshel-gray-dark border-l border-white/10 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 id="history-panel-title" className="text-xl font-bold text-white">Generation History</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close history panel"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {history.length > 0 ? (
            history.map(item => <HistoryItemCard key={item.id} item={item} onLoad={onLoad} />)
          ) : (
            <div className="text-center text-gray-500 pt-10">
              <p>Your generated images will appear here.</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
            <footer className="p-4 border-t border-white/10 flex-shrink-0">
                <button
                    onClick={onClear}
                    className="w-full py-2.5 text-sm font-semibold text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors"
                >
                    Clear History
                </button>
            </footer>
        )}
      </div>
    </>
  );
};
