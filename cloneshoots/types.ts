export enum GenerationMode {
  Style = 'style',
  Pose = 'pose',
  Both = 'both',
}

export interface ImageFile {
  mimeType: string;
  data: string; // base64 encoded string without the data URL prefix
}

export interface HistoryEntry {
  id: string;
  originalImage: string; // data URL string
  originalImageName: string;
  referenceImage: string; // data URL string
  referenceImageName: string;
  outputImage: string; // data URL string
  mode: GenerationMode;
  timestamp: number;
}
