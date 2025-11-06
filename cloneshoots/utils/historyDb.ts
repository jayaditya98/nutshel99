import { HistoryEntry } from '../types';

const DB_NAME = 'ImageFusionDB';
const DB_VERSION = 1;
const STORE_NAME = 'history';
const MAX_HISTORY_ITEMS = 15;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const dbInstance = (event.target as IDBOpenDBRequest).result;
        if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
          const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
  return dbPromise;
}

// Helper to convert data URL to Blob
function dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    if (arr.length < 2) throw new Error('Invalid data URL');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL: MIME type not found');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Helper to convert Blob to data URL
function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
}


export async function addHistoryEntry(entry: HistoryEntry) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  const entryForDb = {
    ...entry,
    originalImage: dataURLToBlob(entry.originalImage),
    referenceImage: dataURLToBlob(entry.referenceImage),
    outputImage: dataURLToBlob(entry.outputImage),
  };

  store.put(entryForDb);

  // After putting, check count and trim if necessary
  const countReq = store.count();
  countReq.onsuccess = () => {
    let toDelete = countReq.result - MAX_HISTORY_ITEMS;
    if (toDelete > 0) {
      const index = store.index('timestamp');
      const cursorReq = index.openCursor(); // Oldest first
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor && toDelete > 0) {
          cursor.delete();
          toDelete--;
          cursor.continue();
        }
      };
    }
  };

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();

    return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = async () => {
            if (!request.result) {
                resolve([]);
                return;
            }
            // Sort by timestamp descending (newest first)
            const dbEntries: any[] = request.result.sort((a, b) => b.timestamp - a.timestamp);
            const uiEntries: HistoryEntry[] = await Promise.all(
                dbEntries.map(async (entry) => ({
                    ...entry,
                    originalImage: await blobToDataURL(entry.originalImage),
                    referenceImage: await blobToDataURL(entry.referenceImage),
                    outputImage: await blobToDataURL(entry.outputImage),
                }))
            );
            resolve(uiEntries);
        };
    });
}

export async function deleteHistoryEntry(id: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function clearHistory(): Promise<void> {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
