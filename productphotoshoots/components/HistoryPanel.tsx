
import React from 'react';
import type { HistoryItem } from '../types';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LoadIcon } from './icons/LoadIcon';
import { Tooltip } from './Tooltip';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
  onClear: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onDelete,
  onClear,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-nutshel-gray-dark border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <h2 id="history-panel-title" className="text-2xl font-bold text-white">
              History
            </h2>
            <div className="flex items-center gap-2">
               {history.length > 0 && (
                 <button
                    onClick={onClear}
                    className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
               )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close history panel"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-grow overflow-y-auto p-4">
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>No history yet. <br /> Generate some images to see them here.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {history.map((item) => (
                  <li key={item.id} className="bg-nutshel-gray p-4 rounded-xl border border-white/10">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        <img
                          src={item.productImageSrc}
                          alt="Product thumbnail"
                          className="w-16 h-16 object-cover rounded-md bg-black/20"
                          loading="lazy"
                        />
                        {item.styleReferenceImageSrc && (
                          <img
                            src={item.styleReferenceImageSrc}
                            alt="Style reference thumbnail"
                            className="w-16 h-16 object-cover rounded-md bg-black/20"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-white truncate" title={item.productName}>
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-400">{formatDate(item.timestamp)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.generatedImages.length} image{item.generatedImages.length !== 1 ? 's' : ''} generated
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                           <button
                            onClick={() => onRestore(item)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold text-black bg-nutshel-blue rounded-full hover:opacity-90 transition-opacity"
                          >
                            <LoadIcon className="w-4 h-4" />
                            Restore
                          </button>
                           <Tooltip text="Delete">
                             <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-gray-400 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                aria-label="Delete history item"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                           </Tooltip>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
