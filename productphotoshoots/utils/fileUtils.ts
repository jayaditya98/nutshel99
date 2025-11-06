
import type { GeneratedImage, HistoryItem } from '../types';

// This tells TypeScript that JSZip is available globally, loaded from the CDN
declare const JSZip: any;

export const downloadImage = (src: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllAsZip = async (images: GeneratedImage[], productName: string = 'product'): Promise<void> => {
  if (typeof JSZip === 'undefined') {
    console.error('JSZip library is not loaded.');
    alert('Could not download ZIP file. JSZip library is missing.');
    return;
  }
  
  const zip = new JSZip();
  
  images.forEach(image => {
    // Remove the data URL prefix, e.g., "data:image/png;base64,"
    const base64Data = image.src.split(',')[1];
    zip.file(image.name, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `${productName}-photoshoot.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch data URL: ${response.statusText}`);
  }
  return response.blob();
};

export const fileToBase64 = (file: File | string): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    if (typeof file === 'string') {
        // Handle case where it's already a data URL
        const [header, data] = file.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (data && mimeType) {
            resolve({ data, mimeType });
        } else {
            reject(new Error("Invalid data URL."));
        }
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const [header, data] = base64String.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (data && mimeType) {
        resolve({ data, mimeType });
      } else {
        reject(new Error("Could not process the file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};


// --- IndexedDB History Service ---

const DB_NAME = 'ProductPhotoshootDB';
const DB_VERSION = 1;
const STORE_NAME = 'history';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
  return dbPromise;
};

export const addHistoryItem = async (item: Omit<HistoryItem, 'id'>): Promise<HistoryItem> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(item);
    
    request.onsuccess = () => {
      const newItem: HistoryItem = { ...item, id: request.result as number };
      resolve(newItem);
    };
    
    request.onerror = () => {
      console.error('Error adding history item:', request.error);
      reject(request.error);
    };
  });
};

export const getAllHistoryItems = async (): Promise<HistoryItem[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by timestamp descending to show newest first
      const sorted = request.result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(sorted);
    };

    request.onerror = () => {
      console.error('Error getting all history items:', request.error);
      reject(request.error);
    };
  });
};

export const deleteHistoryItem = async (id: number): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting history item:', request.error);
      reject(request.error);
    };
  });
};

export const clearHistory = async (): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error clearing history:', request.error);
      reject(request.error);
    };
  });
};
