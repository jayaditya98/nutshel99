import React from 'react';
import { CompositionState, WizardStep } from '../types';

interface CompositionSummaryProps {
  state: CompositionState;
  onEdit: (step: WizardStep) => void;
}

const SummaryItem: React.FC<{ label: string; value: React.ReactNode; onEdit: () => void }> = ({ label, value, onEdit }) => (
    <div className="flex justify-between items-start py-3 border-b border-white/10">
        <span className="font-semibold text-gray-300">{label}:</span>
        <div className="text-right flex items-center gap-4">
            <span className="text-gray-400 max-w-xs truncate">{value}</span>
            <button onClick={onEdit} className="text-sm text-nutshel-accent hover:opacity-80 font-semibold flex-shrink-0">
                Change
            </button>
        </div>
    </div>
);


export const CompositionSummary: React.FC<CompositionSummaryProps> = ({ state, onEdit }) => {

  const getAccessorySummary = () => {
    const presets = state.accessories.filter(a => a.type === 'preset').map(a => a.preset);
    const uploads = state.accessories.filter(a => a.type === 'upload');

    if (presets.length === 0 && uploads.length === 0) {
      return <span className="text-gray-500 italic">None</span>;
    }

    const parts = [];
    if (presets.length > 0) parts.push(`${presets.join(', ')}`);
    if (uploads.length > 0) parts.push(`${uploads.length} image(s)`);
    
    return parts.join(' & ');
  };
  
  const getClothingSummary = () => {
    if (state.clothing.type === 'none') {
        return <span className="text-gray-500 italic">AI Decides</span>;
    }
    const parts = [];
    if (state.clothing.preset) parts.push(`Style: ${state.clothing.preset}`);
    if (state.clothing.description) parts.push(`"${state.clothing.description}"`);
    if (state.clothing.file) parts.push('Reference Image');

    if (parts.length === 0) {
        return 'Customized';
    }
    
    return parts.join(' | ');
  }

  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-2 mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Composition Summary</h3>
        <SummaryItem 
            label="Subjects" 
            value={`${state.subjects.length} image(s) uploaded`} 
            onEdit={() => onEdit(WizardStep.Subjects)} 
        />
        <SummaryItem 
            label="Background" 
            value={state.background.type === 'upload' ? '1 image uploaded' : `Generated ('${state.background.description || 'No description'}')`} 
            onEdit={() => onEdit(WizardStep.Background)} 
        />
        <SummaryItem 
            label="Clothing" 
            value={getClothingSummary()}
            onEdit={() => onEdit(WizardStep.Details)} 
        />
        <SummaryItem 
            label="Accessories" 
            value={getAccessorySummary()} 
            onEdit={() => onEdit(WizardStep.Details)} 
        />
        <SummaryItem 
            label="Styling" 
            value={state.compositionPrompt || <span className="text-gray-500 italic">Default</span>} 
            onEdit={() => onEdit(WizardStep.Styling)} 
        />
    </div>
  );
};