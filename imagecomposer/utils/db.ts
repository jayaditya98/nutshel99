import { HistoryItem } from '../types';

const DB_NAME = 'ImageComposerDB';
const DB_VERSION = 1;
const STORE_NAME = 'history';

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Create an index on 'timestamp' to allow sorting
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function addHistoryItem(item: HistoryItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(item);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error adding history item:', request.error);
      reject('Could not add item to history.');
    };
  });
}

export async function getAllHistoryItems(): Promise<HistoryItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => {
      // Results are sorted by the index key (timestamp) in ascending order.
      // We reverse them to get the most recent items first.
      resolve(request.result.reverse());
    };
    request.onerror = () => {
      console.error('Error getting all history items:', request.error);
      reject('Could not retrieve history.');
    };
  });
}

export async function clearHistoryDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error clearing history:', request.error);
      reject('Could not clear history.');
    };
  });
}
