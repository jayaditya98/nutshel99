/**
 * IndexedDB storage service for Nutshel Studios images
 * Handles storage and retrieval of images generated from:
 * - Model Shoots
 * - Clone Shoots
 * - Product Photoshoots
 * - Image Composer
 */

const DB_NAME = 'NutshelStudiosImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'studio_images';

let dbPromise: Promise<IDBDatabase> | null = null;

interface StoredImage {
  seed: string;
  imageUrl: string;
  metadata?: any;
  sourceApp: string;
  createdAt: number;
}

/**
 * Open or get the IndexedDB database
 */
function getDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }

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
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'seed' });
        store.createIndex('sourceApp', 'sourceApp', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Store an image in IndexedDB
 * @param seed - Unique identifier for the image
 * @param imageUrl - Base64 data URL or blob URL of the image
 * @param sourceApp - Source application (model-shoots, clone-shoots, product-photoshoots, image-composer)
 * @param metadata - Optional metadata to store with the image
 */
export async function storeStudioImage(
  seed: string,
  imageUrl: string,
  sourceApp: string,
  metadata?: any
): Promise<void> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const imageData: StoredImage = {
      seed,
      imageUrl,
      sourceApp,
      metadata: metadata || {},
      createdAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(imageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error storing studio image:', error);
    throw error;
  }
}

/**
 * Retrieve an image from IndexedDB
 * @param seed - Unique identifier for the image
 * @returns The image URL or null if not found
 */
export async function getStudioImage(seed: string): Promise<string | null> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(seed);
      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        resolve(result?.imageUrl || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving studio image:', error);
    return null;
  }
}

/**
 * Retrieve metadata for an image
 * @param seed - Unique identifier for the image
 * @returns The metadata or null if not found
 */
export async function getStudioImageMetadata(seed: string): Promise<any | null> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(seed);
      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        resolve(result?.metadata || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving studio image metadata:', error);
    return null;
  }
}

/**
 * Delete an image from IndexedDB
 * @param seed - Unique identifier for the image
 */
export async function deleteStudioImage(seed: string): Promise<void> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(seed);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting studio image:', error);
    throw error;
  }
}

/**
 * Get all images for a specific source app
 * @param sourceApp - Source application name
 * @returns Array of stored images
 */
export async function getStudioImagesBySource(sourceApp: string): Promise<StoredImage[]> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sourceApp');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sourceApp);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving studio images by source:', error);
    return [];
  }
}

/**
 * Get all stored studio images
 * @returns Array of all stored images
 */
export async function getAllStudioImages(): Promise<StoredImage[]> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving all studio images:', error);
    return [];
  }
}

/**
 * Get the most recent studio images from all apps
 * @param limit - Maximum number of images to return (default: 10)
 * @returns Array of stored images sorted by creation date (newest first)
 */
export async function getRecentStudioImages(limit: number = 10): Promise<StoredImage[]> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // 'prev' for descending order (newest first)
      const results: StoredImage[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving recent studio images:', error);
    return [];
  }
}

/**
 * Clear all studio images from IndexedDB
 */
export async function clearAllStudioImages(): Promise<void> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing all studio images:', error);
    throw error;
  }
}

