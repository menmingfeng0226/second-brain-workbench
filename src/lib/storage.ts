const NS = 'wb_v1';
const keyOf = (k: string) => `${NS}:${k}`;

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(keyOf(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[storage] safeGet failed:', key, err);
    return fallback;
  }
}

export function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(keyOf(key), JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('[storage] safeSet failed:', key, err);
    return false;
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(keyOf(key));
  } catch {
    /* ignore */
  }
}

export function removeAllWithPrefix(prefix: string): void {
  const full = keyOf(prefix);
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(full)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function hydrateOrSeed<T>(key: string, seed: T): T {
  const existing = safeGet<T | null>(key, null);
  if (existing === null) {
    safeSet(key, seed);
    return seed;
  }
  return existing;
}

const DB_NAME = 'upzhu_workbench';
const DB_VERSION = 1;
const STORE_FEEDBACKS = 'feedbacks';
const STORE_NOTES = 'second_brain_notes';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FEEDBACKS)) {
        const s = db.createObjectStore(STORE_FEEDBACKS, { keyPath: 'id' });
        s.createIndex('noteId', 'noteId', { unique: false });
        s.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        const s = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
        s.createIndex('category', 'category', { unique: false });
      }
    };
  });
  return dbPromise;
}

export async function idbPutMany<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((i) => store.put(i));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('idb put failed'));
  });
}

export async function idbPutFeedback(feedback: { id: string }): Promise<void> {
  await idbPutMany(STORE_FEEDBACKS, [feedback]);
}

export async function idbGetAllFeedbacks(): Promise<unknown[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FEEDBACKS, 'readonly');
    const req = tx.objectStore(STORE_FEEDBACKS).getAll();
    req.onsuccess = () => resolve(req.result as unknown[]);
    req.onerror = () => reject(req.error ?? new Error('idb get failed'));
  });
}

export const storage = {
  safeGet,
  safeSet,
  safeRemove,
  hydrateOrSeed,
  idbPutFeedback,
  idbGetAllFeedbacks,
};

export default storage;
