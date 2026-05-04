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

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function saveDraft(draft: CallDraft): Promise<void> {
  if ('storage' in navigator) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      if (quota && usage && (quota - usage) < 10_000_000) {
        console.warn('[Pitchbase] Storage low (<10 MB free), skipping draft save');
        return;
      }
    } catch { /* estimate not available — proceed */ }
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(draft, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => {
      const err = tx.error;
      if (err?.name === 'QuotaExceededError') {
        console.error('[Pitchbase] IndexedDB quota exceeded — draft not saved. Free up browser storage.');
      }
      reject(err);
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
