
import React from 'react';
import { HistoryEntry } from '../types';
import { ReuseIcon, TrashIcon } from './icons/Icons';

interface HistoryItemProps {
  entry: HistoryEntry;
  onReuse: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(new Date(timestamp));
};

export const HistoryItem: React.FC<HistoryItemProps> = ({ entry, onReuse, onDelete }) => {
  return (
    <div className="bg-[#27272A] p-3 rounded-lg border border-white/10">
      <div className="flex items-start gap-4">
        <img 
          src={entry.outputImage} 
          alt="Generated output thumbnail" 
          className="w-12 h-12 object-cover rounded-md flex-shrink-0" 
        />
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-white truncate" title={entry.originalImageName}>
              {entry.originalImageName}
          </p>
          <p className="text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
          <p className="text-xs text-gray-400 mt-0.5">1 image generated</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button 
          onClick={() => onReuse(entry)}
          className="flex-grow bg-nutshel-blue text-black font-semibold text-sm py-2 px-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          aria-label="Restore this generation"
        >
          <ReuseIcon className="w-4 h-4" />
          Restore
        </button>
        <button
            onClick={() => onDelete(entry.id)}
            className="text-gray-500 hover:text-red-400 bg-white/5 hover:bg-white/10 transition-colors p-2 rounded-md flex-shrink-0"
            aria-label="Delete this generation"
        >
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};