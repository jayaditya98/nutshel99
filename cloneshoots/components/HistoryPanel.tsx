
import React from 'react';
import { HistoryEntry } from '../types';
import { HistoryItem } from './HistoryItem';
import { CloseIcon } from './icons/Icons';

interface HistoryPanelProps {
  isOpen: boolean;
  history: HistoryEntry[];
  onReuse: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, history, onReuse, onDelete, onClearAll, onClose }) => {
    const handleClear = () => {
        onClearAll();
    };

    return (
        <div 
            className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isOpen}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60" 
                onClick={onClose}
            />

            {/* Panel */}
            <aside 
                className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#131314] border-l border-white/10 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-panel-title"
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h2 id="history-panel-title" className="text-xl font-bold text-white">History</h2>
                    <div className="flex items-center gap-2">
                        {history.length > 0 && (
                            <button 
                                onClick={handleClear}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                            aria-label="Close history panel"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4">
                    {history.length > 0 ? (
                        <ul className="space-y-3">
                            {history.map(entry => (
                                <li key={entry.id}>
                                    <HistoryItem entry={entry} onReuse={onReuse} onDelete={onDelete} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <h3 className="mt-4 text-xl font-semibold text-gray-300">No history yet</h3>
                            <p className="mt-1 text-gray-400">Your generated images will appear here.</p>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};