import { useState, useRef, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import type { ProspectTone, ToneCoaching } from '../types';
import { FUNCTIONS_BASE, ANON_KEY, getAuthToken } from '../lib/api';

// Chunk duration in ms — low latency as requested
const CHUNK_MS = 4000;

interface AudioToneConfig {
  prospectName: string;
  callGoal: string;
  yourPitch: string;
}

export interface AudioToneState {
  isCapturing: boolean;
  tone: ProspectTone | null;
  coaching: ToneCoaching | null;
  permissionError: string | null;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
}

export function useAudioTone(config: AudioToneConfig): AudioToneState {
  const [isCapturing, setIsCapturing] = useState(false);
  const [tone, setTone] = useState<ProspectTone | null>(null);
  const [coaching, setCoaching] = useState<ToneCoaching | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const isProcessingRef = useRef(false);
  const lastToneRef = useRef<{ tone: ProspectTone; at: number } | null>(null);

  const processChunk = useCallback(async (blob: Blob) => {
    // Skip silent / tiny chunks
    if (blob.size < 2000) return;
    // Don't queue up requests — wait for previous one to finish
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;

    // Abort and reset if the edge function hangs beyond 12 s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);

    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const CHUNK = 8192;
      let binary = '';
      for (let i = 0; i < bytes.length; i += CHUNK)
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
      const base64 = btoa(binary);

      const authToken = await getAuthToken();
      const res = await fetch(`${FUNCTIONS_BASE}/analyze-tone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          audio: base64,
          mimeType: blob.type || 'audio/webm',
          prospectName: config.prospectName,
          callGoal: config.callGoal,
          yourPitch: config.yourPitch,
        }),
        signal: controller.signal,
      });

      if (!res.ok) return;
      const data = await res.json() as { tone?: ProspectTone; move?: string; say?: string };

      if (data.tone) {
        const now = Date.now();
        // Don't thrash the UI — only update if tone changed or 15s have passed.
        if (!(lastToneRef.current?.tone === data.tone && now - lastToneRef.current.at < 15_000)) {
          lastToneRef.current = { tone: data.tone, at: now };
          setTone(data.tone);
          if (data.move && data.say) {
            setCoaching({ tone: data.tone, move: data.move, say: data.say });
          }
        }
      }
    } catch (err) {
      // Never crash the call — but always report non-abort errors
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (!isAbort) {
        console.warn('[AudioTone] Chunk analysis failed:', err);
        Sentry.captureException(err, { tags: { section: 'audio-tone' } });
      }
    } finally {
      clearTimeout(timeoutId);
      isProcessingRef.current = false;
    }
  }, [config.prospectName, config.callGoal, config.yourPitch]);

  const stopCapture = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsCapturing(false);
  }, []);

  const startCapture = useCallback(async () => {
    setPermissionError(null);

    try {
      // Request display media — user must select screen and check "Share system audio"
      // We include a minimal video constraint because some browsers reject audio-only getDisplayMedia
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: { width: 1, height: 1 },
      });

      // Drop video tracks immediately — we only need audio
      stream.getVideoTracks().forEach(t => t.stop());

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(t => t.stop());
        setPermissionError('No system audio captured. When prompted, select your screen and check "Share system audio".');
        return;
      }

      streamRef.current = stream;
      const audioStream = new MediaStream(audioTracks);

      // Pick best supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          void processChunk(e.data);
        }
      };

      // Deliver chunks every CHUNK_MS
      recorder.start(CHUNK_MS);
      setIsCapturing(true);

      // If the user stops sharing from the browser UI, clean up
      audioTracks[0].onended = () => stopCapture();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Permission denied. Allow screen sharing to enable live tone analysis.');
        } else if (err.name === 'NotSupportedError') {
          setPermissionError('System audio capture is not supported in this browser.');
        } else {
          setPermissionError('Could not start audio capture. Please try again.');
        }
      }
    }
  }, [processChunk, stopCapture]);

  return { isCapturing, tone, coaching, permissionError, startCapture, stopCapture };
}
