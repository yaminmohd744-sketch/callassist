import type { TranscriptEntry, AISuggestion, CallConfig } from '../types';

const DB_NAME = 'pitchbase';
const STORE   = 'call_draft';
const KEY     = 'active';

export interface CallDraft {
  config: CallConfig;
  transcript: TranscriptEntry[];
  suggestions: AISuggestion[];
  startedAt: string;
  savedAt: string;
}

let _db: Promise<IDBDatabase> | null = null;
function openDB(): Promise<IDBDatabase> {
  if (!_db) {
    _db = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => { _db = null; reject(req.error); };
    });
  }
  return _db;
}

export async function saveDraft(draft: CallDraft): Promise<boolean> {
  if ('storage' in navigator) {
    // quota=0 on error means unknown — skip the check rather than blocking the save.
    const est = await navigator.storage.estimate().catch((): StorageEstimate => ({ usage: 0, quota: 0 }));
    const { usage = 0, quota = 0 } = est;
    const free = quota === 0 ? Infinity : quota - usage;
    if (free < 10_000_000) {
      console.warn('[Pitchbase] Storage low (<10 MB free), skipping draft save');
      return false;
    }
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(draft, KEY);
    tx.oncomplete = () => resolve(true);
    tx.onerror    = () => {
      const err = tx.error;
      if (err?.name === 'QuotaExceededError') {
        reject(new Error('QuotaExceededError'));
      } else {
        reject(err);
      }
    };
  });
}

export async function loadDraft(): Promise<CallDraft | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

export async function clearDraft(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}
