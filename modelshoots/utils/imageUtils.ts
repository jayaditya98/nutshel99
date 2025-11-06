
import type { EncodedImage, HistoryEntry } from '../types';

/**
 * Converts a File object to a base64 encoded string and extracts its MIME type.
 * This is necessary for sending image data in JSON payloads to the Gemini API.
 * @param file The image file to convert.
 * @returns A promise that resolves with an object containing the base64 string and the MIME type.
 */
export const base64EncodeFile = (file: File): Promise<EncodedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result is a data URL: "data:image/jpeg;base64,..."
      const [header, base64Data] = result.split(',');
      const mimeType = header?.match(/:(.*?);/)?.[1];

      if (base64Data && mimeType) {
        resolve({ base64Data, mimeType });
      } else {
        reject(new Error("Failed to read file as base64 or determine its MIME type."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a base64 data URL back into a File object.
 * @param dataUrl The full data URL (e.g., "data:image/jpeg;base64,...").
 * @param filename The desired filename for the resulting File object.
 * @returns A promise that resolves to a File object.
 */
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};

// --- IndexedDB History Management ---

const DB_NAME = 'PhotoshootDB';
const STORE_NAME = 'history';
const DB_VERSION = 1;

const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject("IndexedDB is not supported by this browser.");
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (event: Event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event: Event) => {
            reject(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
        };
    });
};

// Singleton pattern for DB connection
const getDb = (() => {
    let dbInstance: Promise<IDBDatabase> | null = null;
    return () => {
        if (!dbInstance) {
            dbInstance = openDatabase();
        }
        return dbInstance;
    };
})();

export const addHistoryEntry = async (entry: HistoryEntry): Promise<void> => {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(entry);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getAllHistoryEntries = async (): Promise<HistoryEntry[]> => {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll(); 
    
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            // getAll() on an index returns results sorted ascending by that index.
            // We want newest first, so we reverse the array.
            resolve(request.result.reverse());
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const deleteHistoryEntry = async (id: string): Promise<void> => {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const clearHistory = async (): Promise<void> => {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
