
export interface Pose {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  pose: Pose;
  prompt: string;
}

export type Gender = 'male' | 'female';

export interface Model {
  id:string;
  name: string;
  imageUrl: string;
}

// Stored encoded image data for persistence
export interface EncodedImage {
  base64Data: string;
  mimeType: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  uploadedImage: EncodedImage;
  selectedGender: Gender;
  selectedPoses: Pose[];
  stylePrompt: string;
  customPoses: string[];
  uploadedAccessories: EncodedImage[];
  generatedImages: GeneratedImage[];
}
