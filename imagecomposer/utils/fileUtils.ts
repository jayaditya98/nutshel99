import { FileWithPreview } from "../types";

export const fileToBase64 = (file: FileWithPreview): Promise<string> =>
  new Promise((resolve, reject) => {
    // If the preview is already a data URL (from history), use it directly.
    if (file.preview && file.preview.startsWith('data:')) {
      resolve(file.preview.split(',')[1]);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
