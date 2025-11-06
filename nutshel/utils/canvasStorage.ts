/**
 * IndexedDB storage service for AICanvas designs
 * Handles storage and retrieval of canvas designs and their associated images
 * Migrated from localStorage to support complex projects with large data
 */

const DB_NAME = 'AICanvasDesignDB';
const DB_VERSION = 1;
const STORE_NAME = 'canvas_designs';

let dbPromise: Promise<IDBDatabase> | null = null;

interface StoredCanvasDesign {
  seed: string;
  canvasState: any;
  imageUrl?: string;
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
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Store a canvas design in IndexedDB
 * @param seed - Unique identifier for the canvas design
 * @param canvasState - The canvas state object to store
 * @param imageUrl - Optional image URL to store with the design
 */
export async function storeCanvasDesign(
  seed: string,
  canvasState: any,
  imageUrl?: string
): Promise<void> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const designData: StoredCanvasDesign = {
      seed,
      canvasState,
      ...(imageUrl && { imageUrl }),
      createdAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(designData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error storing canvas design:', error);
    throw error;
  }
}

/**
 * Retrieve a canvas design from IndexedDB
 * @param seed - Unique identifier for the canvas design
 * @returns The canvas state or null if not found
 */
export async function getCanvasDesign(seed: string): Promise<any | null> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(seed);
      request.onsuccess = () => {
        const result = request.result as StoredCanvasDesign | undefined;
        resolve(result?.canvasState || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving canvas design:', error);
    return null;
  }
}

/**
 * Retrieve an image URL for a canvas design
 * @param seed - Unique identifier for the canvas design
 * @returns The image URL or null if not found
 */
export async function getCanvasImage(seed: string): Promise<string | null> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(seed);
      request.onsuccess = () => {
        const result = request.result as StoredCanvasDesign | undefined;
        resolve(result?.imageUrl || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error retrieving canvas image:', error);
    return null;
  }
}

/**
 * Delete a canvas design from IndexedDB
 * @param seed - Unique identifier for the canvas design
 */
export async function deleteCanvasDesign(seed: string): Promise<void> {
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
    console.error('Error deleting canvas design:', error);
    throw error;
  }
}

/**
 * Migrate canvas design from localStorage to IndexedDB
 * Checks localStorage for existing data and moves it to IndexedDB
 * @param seed - Unique identifier for the canvas design
 * @returns The canvas state if found, null otherwise
 */
export async function migrateFromLocalStorage(seed: string): Promise<any | null> {
  try {
    // Check if already in IndexedDB
    const existingDesign = await getCanvasDesign(seed);
    if (existingDesign) {
      return existingDesign;
    }

    // Check localStorage for canvas state
    const canvasStateStr = localStorage.getItem(`canvas_${seed}`);
    const imageUrl = localStorage.getItem(`image_${seed}`);

    if (canvasStateStr) {
      try {
        const canvasState = JSON.parse(canvasStateStr);
        
        // Store in IndexedDB
        await storeCanvasDesign(seed, canvasState, imageUrl || undefined);
        
        // Optionally clear localStorage (keep for now for safety, can be removed later)
        // localStorage.removeItem(`canvas_${seed}`);
        // if (imageUrl) {
        //   localStorage.removeItem(`image_${seed}`);
        // }
        
        return canvasState;
      } catch (parseError) {
        console.error('Error parsing canvas state from localStorage:', parseError);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error migrating canvas design from localStorage:', error);
    return null;
  }
}

/**
 * Get canvas design with fallback to localStorage (for backward compatibility)
 * @param seed - Unique identifier for the canvas design
 * @returns The canvas state or null if not found
 */
export async function getCanvasDesignWithFallback(seed: string): Promise<any | null> {
  try {
    // First try IndexedDB
    const design = await getCanvasDesign(seed);
    if (design) {
      return design;
    }

    // Fallback to localStorage and migrate
    return await migrateFromLocalStorage(seed);
  } catch (error) {
    console.error('Error getting canvas design with fallback:', error);
    // Final fallback: try localStorage directly
    try {
      const canvasStateStr = localStorage.getItem(`canvas_${seed}`);
      if (canvasStateStr) {
        return JSON.parse(canvasStateStr);
      }
    } catch (localError) {
      console.error('Error reading from localStorage fallback:', localError);
    }
    return null;
  }
}

