import React from 'react';
import type { HistoryEntry } from '../types';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onRestore: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onRestore, onDeleteItem, onClearAll }) => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-panel-title"
    >
      <div 
        className="absolute top-0 right-0 h-full w-full max-w-md bg-nutshel-gray-dark shadow-2xl border-l border-white/10 flex flex-col transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0%)' : 'translateX(100%)' }}
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
          <h2 id="history-panel-title" className="text-xl font-bold text-white">Photoshoot History</h2>
          <Tooltip tip="Close history" position="bottom">
            <button
              onClick={onClose}
              aria-label="Close history panel"
              className="bg-white/10 hover:bg-white/20 text-white rounded-full h-8 w-8 flex items-center justify-center transition-all text-lg font-bold"
            >&times;</button>
          </Tooltip>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              <p className="text-lg">No history yet.</p>
              <p>Your completed photoshoots will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="bg-nutshel-gray p-3 rounded-lg border border-white/10 animate-fade-in-up" style={{animationDuration: '0.5s'}}>
                  <div className="flex gap-3">
                    <img 
                      src={`data:${item.uploadedImage.mimeType};base64,${item.uploadedImage.base64Data}`}
                      alt="Uploaded thumbnail"
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-nutshel-gray-dark"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-white">{new Date(item.timestamp).toLocaleString()}</p>
                      <p className="text-sm text-gray-400">
                        {item.selectedPoses.length} poses, {item.generatedImages.length} images generated.
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {item.generatedImages.slice(0, 4).map(img => (
                          <img key={img.id} src={img.url} className="w-8 h-8 rounded object-cover bg-nutshel-gray-dark" />
                        ))}
                        {item.generatedImages.length > 4 && (
                           <div className="w-8 h-8 rounded bg-nutshel-gray-dark flex items-center justify-center text-xs text-gray-300 font-bold">
                             +{item.generatedImages.length - 4}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                    <Tooltip tip="Restore this photoshoot session" className="w-full">
                      <Button onClick={() => onRestore(item.id)} className="w-full text-sm py-1 px-3">
                        Restore
                      </Button>
                    </Tooltip>
                    <Tooltip tip="Delete this entry forever" className="w-full">
                      <Button onClick={() => onDeleteItem(item.id)} variant="secondary" className="w-full text-sm py-1 px-3">
                        Delete
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Panel Footer */}
        {history.length > 0 && (
            <div className="flex-shrink-0 p-4 border-t border-white/10">
              <Tooltip tip="Permanently delete all history" position="top">
                <Button onClick={onClearAll} variant="secondary" className="w-full">
                    Clear All History
                </Button>
              </Tooltip>
            </div>
        )}
      </div>
    </div>
  );
};
