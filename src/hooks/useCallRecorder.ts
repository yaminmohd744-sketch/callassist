import { useRef, useState, useCallback } from 'react';

const DB_NAME  = 'pitchbase';
const STORE    = 'call_recordings';

function openRecordingDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function saveRecording(key: string, blob: Blob): Promise<void> {
  const db = await openRecordingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function loadRecording(key: string): Promise<Blob | null> {
  const db = await openRecordingDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

export async function deleteRecording(key: string): Promise<void> {
  const db = await openRecordingDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export function useCallRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isSupported]    = useState(() => !!(navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices && 'MediaRecorder' in window));

  const startRecording = useCallback(async (): Promise<void> => {
    if (!isSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isPermission = msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed') || msg.toLowerCase().includes('denied');
      setRecordingError(isPermission ? 'Microphone permission denied — call recording disabled.' : 'Microphone unavailable — call recording disabled.');
    }
  }, [isSupported]);

  const stopRecording = useCallback((sessionKey: string): Promise<void> => {
    return new Promise(resolve => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === 'inactive') { resolve(); return; }
      mr.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        // Stop all mic tracks to release the microphone indicator
        mr.stream.getTracks().forEach(t => t.stop());
        if (blob.size > 0) {
          await saveRecording(sessionKey, blob).catch(() => { /* storage full */ });
        }
        resolve();
      };
      mr.stop();
    });
  }, []);

  return { startRecording, stopRecording, isRecording, isSupported, recordingError };
}
