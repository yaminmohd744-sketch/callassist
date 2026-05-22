// Profile picture stored in IndexedDB instead of localStorage to avoid
// consuming the ~5 MB localStorage quota and to keep it out of synchronous storage.

const DB_NAME = 'pitchr';
const STORE   = 'profile_pics';
const KEY     = 'current';
const DB_VERSION = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // Preserve existing stores created by earlier versions.
      if (!db.objectStoreNames.contains('call_draft'))    db.createObjectStore('call_draft');
      if (!db.objectStoreNames.contains('call_recordings')) db.createObjectStore('call_recordings');
      if (!db.objectStoreNames.contains(STORE))           db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function saveProfilePic(dataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(dataUrl, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function loadProfilePic(): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror   = () => reject(req.error);
  });
}

export async function deleteProfilePic(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}
