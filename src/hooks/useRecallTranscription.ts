import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { FUNCTIONS_BASE, ANON_KEY, getAuthToken } from '../lib/api';
import { getDeepgramCode } from '../lib/languages';
import type { RecallEvent } from '../electron';

interface UseRecallTranscriptionOptions {
  // Called with each finalised utterance. speakerIndex is a stable per-participant
  // index (first speaker → 0); LiveCallScreen maps index 0 → rep, others → prospect,
  // matching the existing Deepgram diarization path.
  onFinalTranscript: (text: string, speakerIndex?: number) => void;
  onInterim?: (text: string) => void;
  language?: string;
}

interface UseRecallTranscriptionResult {
  /** Recall Desktop SDK is present in this build (Electron only). */
  available: boolean;
  /** A meeting window has been detected and can be recorded. */
  meetingDetected: boolean;
  /** Recall is actively recording + transcribing. */
  isRecording: boolean;
  errorMessage: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

// ── Realtime transcript payload parsing ──────────────────────────────────────
// Recall's transcript.data realtime payload nests the words + participant under
// `data`. We read defensively because the exact envelope can vary by provider.
interface RecallWord { text?: string }
interface RecallParticipant { id?: number | string; name?: string; is_host?: boolean }
interface RecallTranscriptData {
  data?: { words?: RecallWord[]; participant?: RecallParticipant };
  words?: RecallWord[];
  participant?: RecallParticipant;
  transcript?: { text?: string };
  text?: string;
}

function extractText(payload: RecallTranscriptData): string {
  const words = payload?.data?.words ?? payload?.words;
  if (Array.isArray(words) && words.length > 0) {
    return words.map(w => w?.text ?? '').join(' ').replace(/\s+/g, ' ').trim();
  }
  return (payload?.transcript?.text ?? payload?.text ?? '').trim();
}

function extractParticipant(payload: RecallTranscriptData): RecallParticipant | undefined {
  return payload?.data?.participant ?? payload?.participant;
}

export function useRecallTranscription({
  onFinalTranscript,
  onInterim,
  language = 'en-US',
}: UseRecallTranscriptionOptions): UseRecallTranscriptionResult {
  const [available, setAvailable] = useState(false);
  const [meetingDetected, setMeetingDetected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep latest callbacks without re-subscribing.
  const onFinalRef = useRef(onFinalTranscript);
  const onInterimRef = useRef(onInterim);
  onFinalRef.current = onFinalTranscript;
  onInterimRef.current = onInterim;

  // Stable participant-id → speaker index map (first speaker = index 0 = rep).
  const speakerIndexRef = useRef<Map<string, number>>(new Map());
  const uploadTokenRef = useRef<string | null>(null);
  const wantRecordingRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Detect SDK availability on mount.
  useEffect(() => {
    let cancelled = false;
    const recall = window.electronAPI?.recall;
    if (!recall) { setAvailable(false); return; }
    recall.isAvailable().then(ok => { if (!cancelled) setAvailable(ok); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const speakerIndexFor = useCallback((participant?: { id?: number | string; is_host?: boolean }): number => {
    const key = participant?.id != null ? String(participant.id) : 'unknown';
    const map = speakerIndexRef.current;
    const existing = map.get(key);
    if (existing !== undefined) return existing;
    // A participant flagged as host is assumed to be the rep (index 0).
    const index = participant?.is_host ? 0 : map.size;
    map.set(key, index);
    return index;
  }, []);

  const handleEvent = useCallback((evt: RecallEvent) => {
    switch (evt.type) {
      case 'meeting-detected': {
        setMeetingDetected(true);
        // Auto-start recording once a meeting appears, if the user asked to listen.
        if (wantRecordingRef.current && uploadTokenRef.current) {
          window.electronAPI?.recall?.start(uploadTokenRef.current).then(res => {
            if (!res.ok) setErrorMessage(res.error ?? 'Failed to start Recall recording');
          });
        }
        break;
      }
      case 'meeting-closed':
        setMeetingDetected(false);
        break;
      case 'recording-started':
        setIsRecording(true);
        setErrorMessage(null);
        break;
      case 'recording-ended':
        setIsRecording(false);
        break;
      case 'error':
        setErrorMessage(evt.message ?? 'Recall error');
        Sentry.captureException(new Error(`Recall SDK: ${evt.message ?? 'unknown'}`), { tags: { section: 'recall-desktop' } });
        break;
      case 'realtime-event': {
        const payload = evt.data as RecallTranscriptData;
        const text = extractText(payload);
        if (!text) break;
        const speakerIndex = speakerIndexFor(extractParticipant(payload));
        if (evt.event === 'transcript.partial_data') {
          onInterimRef.current?.(text);
        } else {
          // 'transcript.data' — finalised utterance
          onFinalRef.current(text, speakerIndex);
        }
        break;
      }
    }
  }, [speakerIndexFor]);

  const startListening = useCallback(async () => {
    const recall = window.electronAPI?.recall;
    if (!recall) { setErrorMessage('Recall Desktop SDK not available in this build.'); return; }

    setErrorMessage(null);
    speakerIndexRef.current.clear();
    wantRecordingRef.current = true;

    // Subscribe to SDK events (idempotent — drop any previous listener first).
    unsubscribeRef.current?.();
    unsubscribeRef.current = recall.onEvent(handleEvent);

    // 1. Ensure OS permissions (mic / screen-capture / accessibility).
    const perm = await recall.requestPermissions();
    if (!perm.ok) { setErrorMessage(perm.error ?? 'Recall permissions denied'); return; }

    // 2. Fetch a short-lived SDK upload token from the backend.
    try {
      const authToken = await getAuthToken();
      const res = await fetch(`${FUNCTIONS_BASE}/recall-sdk-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ language: getDeepgramCode(language) }),
      });
      if (!res.ok) { setErrorMessage('Could not create Recall recording session.'); return; }
      const data = await res.json() as { uploadToken?: string };
      if (!data.uploadToken) { setErrorMessage('Recall did not return an upload token.'); return; }
      uploadTokenRef.current = data.uploadToken;
    } catch (err) {
      Sentry.captureException(err, { tags: { section: 'recall-token' } });
      setErrorMessage('Could not reach the Recall token service.');
      return;
    }

    // 3. If a meeting is already detected, start now; otherwise the
    //    'meeting-detected' handler starts it when the user joins a call.
    const startRes = await recall.start(uploadTokenRef.current);
    if (!startRes.ok && startRes.error !== 'No meeting detected yet') {
      setErrorMessage(startRes.error ?? 'Failed to start Recall recording');
    }
  }, [handleEvent, language]);

  const stopListening = useCallback(() => {
    wantRecordingRef.current = false;
    window.electronAPI?.recall?.stop().catch(() => {});
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setIsRecording(false);
  }, []);

  // Clean up the event subscription on unmount.
  useEffect(() => () => { unsubscribeRef.current?.(); }, []);

  return { available, meetingDetected, isRecording, errorMessage, startListening, stopListening };
}
