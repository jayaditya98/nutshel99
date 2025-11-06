
export interface GeneratedImage {
  src: string;
  name: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AppState {
  status: AppStatus;
  message: string;
}

export interface PhotoshootConfig {
  stylePrompt: string;
  negativePrompt: string;
  selectedAngles: string[];
  artisticStylePrompt: string;
}

export interface HistoryItem {
  id: number; // Using timestamp as ID
  timestamp: string;
  productImageSrc: string;
  styleReferenceImageSrc?: string;
  config: PhotoshootConfig;
  generatedImages: GeneratedImage[];
  productName: string;
}