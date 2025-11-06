export interface FileWithPreview extends File {
  preview: string;
}

export enum WizardStep {
  Subjects = 1,
  Background = 2,
  Details = 3,
  Styling = 4,
  Generate = 5,
}

export interface Accessory {
  id: string; // Unique ID for React keys
  type: 'preset' | 'upload';
  preset?: string;
  file?: FileWithPreview;
}

export interface CompositionState {
  subjects: FileWithPreview[];
  background: {
    type: 'upload' | 'generate';
    file?: FileWithPreview;
    description: string;
  };
  accessories: Accessory[];
  clothing: {
    type: 'none' | 'custom';
    preset: string;
    file?: FileWithPreview;
    description: string;
  };
  compositionPrompt: string;
}


// Types for serializing state to localStorage

export interface SerializableFile {
  dataUrl: string;
  name: string;
}

export interface SerializableAccessory {
    id: string;
    type: 'preset' | 'upload';
    preset?: string;
    file?: SerializableFile;
}

// This is the structure saved in localStorage
export interface SerializableCompositionState {
  subjects: SerializableFile[];
  background: {
    type: 'upload' | 'generate';
    file?: SerializableFile;
    description: string;
  };
  accessories: SerializableAccessory[];
  clothing: {
    type: 'none' | 'custom';
    preset: string;
    file?: SerializableFile;
    description: string;
  };
  compositionPrompt: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  state: SerializableCompositionState;
  resultImageUrl: string;
}
