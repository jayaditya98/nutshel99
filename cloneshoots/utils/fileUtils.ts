

export interface GenerativePart {
    inlineData: {
        mimeType: string;
        data: string;
    };
}

/**
 * Converts a File object to a base64 string and returns it in the format
 * required for the Gemini API's generative parts.
 * @param file The file to convert.
 * @returns A promise that resolves to a GenerativePart object.
 */
export const fileToGenerativePart = (file: File): Promise<GenerativePart> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as data URL.'));
      }
      // The result includes the data URL prefix (e.g., "data:image/png;base64,"),
      // which needs to be removed for the API.
      const base64Data = reader.result.split(',')[1];
      if (!base64Data) {
        return reject(new Error('Could not extract base64 data from file.'));
      }
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a File object to a data URL string.
 * @param file The file to convert.
 * @returns A promise that resolves to the full data URL string.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as data URL.'));
      }
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a data URL string back to a File object.
 * @param dataurl The data URL string.
 * @param filename The desired filename for the new File.
 * @returns A File object.
 */
export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Could not determine MIME type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}
