import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import * as Sentry from '@sentry/react';
import { getDeepgramCode } from '../lib/languages';
import { FUNCTIONS_BASE, ANON_KEY, getAuthToken } from '../lib/api';

const WATCHDOG_TIMEOUT_MS     = 10_000;
const FLUSH_DEBOUNCE_MS       = 350;
const TOKEN_CACHE_TTL_MS      = 3_500_000; // 58 min — key TTL is 1hr, refresh 2min early
const TOKEN_CACHE_HEADROOM_MS = 120_000;   // refetch 2min before expiry

let _deepgramTokenCache: { value: string; expiresAt: number } | null = null;
export function clearDeepgramTokenCache() { _deepgramTokenCache = null; }

/**
 * Warm the Deepgram token cache ahead of the WebSocket connection. Call this
 * the moment the user commits to starting a call so the ~1-2s token fetch
 * overlaps with audio-permission prompts instead of delaying first transcription.
 */
export function prefetchDeepgramToken(): void {
  void fetchDeepgramKey();
}

async function fetchDeepgramKey(): Promise<string | null> {
  if (_deepgramTokenCache && Date.now() + TOKEN_CACHE_HEADROOM_MS < _deepgramTokenCache.expiresAt) {
    return _deepgramTokenCache.value;
  }
  try {
    const authToken = await getAuthToken();
    const res = await fetch(`${FUNCTIONS_BASE}/deepgram-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json() as { key?: string };
    const key = data.key ?? null;
    if (key) _deepgramTokenCache = { value: key, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS };
    return key;
  } catch (err) {
    // Token fetch failure forces the Web Speech fallback (no diarization) —
    // surface it so production transcription degradations are observable.
    Sentry.captureException(err, { tags: { section: 'deepgram-token' } });
    return null;
  }
}

// ─── Minimal Web Speech API types ─────────────────────────────────────────────

interface WSRResult { isFinal: boolean; 0: { transcript: string }; }
interface WSREvent  { resultIndex: number; results: WSRResult[]; }
interface WSRErrorEvent { error: string; message?: string; }
interface WSR {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: WSREvent) => void) | null;
  onerror:  ((e: WSRErrorEvent) => void) | null;
  onend:    (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Browsers expose SpeechRecognition under different names; neither is in the
// standard lib, so we augment window with the narrowest possible type.
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => WSR;
  webkitSpeechRecognition?: new () => WSR;
}

function getWebSpeech(): WSR | null {
  const W = window as SpeechRecognitionWindow;
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

// Check constructor existence without instantiating — used for the isSupported flag.
const _W = window as SpeechRecognitionWindow;
const WEB_SPEECH_SUPPORTED = !!(_W.SpeechRecognition ?? _W.webkitSpeechRecognition);

const MAX_BUFFER_CHUNKS = 50;

// Deepgram keyword boosting — common sales terms weighted for better transcription accuracy.
// Format: 'word:boost' where boost is 1–10. Add/adjust terms here.
const DG_KEYWORD_BOOSTS = [
  'demo:3', 'trial:2', 'pricing:2', 'integration:2',
  'software:2', 'platform:2', 'proposal:2',
];

// ─── Deepgram message types ────────────────────────────────────────────────────

interface DGWord   { word: string; speaker: number; }
interface DGResult {
  type: string; is_final: boolean; speech_final: boolean;
  channel: { alternatives: Array<{ transcript: string; words?: DGWord[] }> };
}

type SpeakerRole = 'rep' | 'prospect';

// One independent Deepgram pipeline (WebSocket + MediaRecorder + utterance buffer)
// bound to a single audio source. Dual-stream mode runs two of these — mic→rep and
// system-audio→prospect — so the speaker is KNOWN per source, not diarized/guessed.
interface DGConnection {
  label: SpeakerRole | 'mixed';
  role?: SpeakerRole;        // explicit speaker (dual mode); undefined → diarize + index
  diarize: boolean;
  stream: MediaStream;
  ownsStream: boolean;       // true → stop tracks on teardown (we created it)
  primary: boolean;          // mic connection — drives Web Speech fallback on failure
  ws: WebSocket | null;
  recorder: MediaRecorder | null;
  watchdog: ReturnType<typeof setTimeout> | null;
  buffer: string[];
  flushTimer: ReturnType<typeof setTimeout> | null;
  isFlushing: boolean;
  currentSpeaker?: number;   // diarized index (mixed mode only)
  audioStarted: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSpeechRecognitionOptions {
  // explicitSpeaker is set when the audio source unambiguously identifies the
  // speaker (dual-stream mode); speakerIndex is the diarized index (mixed mode).
  onFinalTranscript: (text: string, speakerIndex?: number, explicitSpeaker?: SpeakerRole) => void;
  language?: string; // BCP 47 code, e.g. 'en-US', 'es-ES'
  systemAudioStream?: MediaStream | null; // system audio from getDisplayMedia — captured as its own "prospect" channel
}

export function useSpeechRecognition({ onFinalTranscript, language = 'en-US', systemAudioStream }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening]   = useState(false);
  const [interimText, setInterimText]   = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connectionsRef      = useRef<DGConnection[]>([]);
  const wsrRef              = useRef<WSR | null>(null); // Web Speech Recognition fallback
  const activeRef           = useRef(false);
  const sysStreamRef        = useRef<MediaStream | null | undefined>(systemAudioStream);
  const wsrNetworkErrRef    = useRef(0); // consecutive Web Speech network errors
  const didFallbackRef      = useRef(false);
  const onFinalRef          = useRef(onFinalTranscript);
  useLayoutEffect(() => { onFinalRef.current = onFinalTranscript; }, [onFinalTranscript]);
  useLayoutEffect(() => { sysStreamRef.current = systemAudioStream; }, [systemAudioStream]);

  // ── Per-connection utterance buffer ────────────────────────────────────────
  // Accumulates is_final chunks and flushes them as one entry after a short
  // silence, so fragmented mid-sentence commits merge into one transcript line.
  // Each connection has its own buffer so the rep's and prospect's words never
  // bleed into each other. Capped at MAX_BUFFER_CHUNKS to bound memory.
  const flushConn = useCallback((conn: DGConnection, immediate = false) => {
    if (conn.flushTimer) { clearTimeout(conn.flushTimer); conn.flushTimer = null; }
    const doFlush = () => {
      if (conn.isFlushing) return;
      conn.isFlushing = true;
      const combined = conn.buffer.join(' ').trim();
      const speaker = conn.currentSpeaker;
      conn.buffer = [];
      conn.currentSpeaker = undefined;
      conn.isFlushing = false;
      if (combined) onFinalRef.current(combined, conn.role ? undefined : speaker, conn.role);
    };
    if (immediate) doFlush();
    else conn.flushTimer = setTimeout(doFlush, FLUSH_DEBOUNCE_MS);
  }, []);

  const teardownConn = useCallback((conn: DGConnection) => {
    if (conn.watchdog) { clearTimeout(conn.watchdog); conn.watchdog = null; }
    if (conn.flushTimer) { clearTimeout(conn.flushTimer); conn.flushTimer = null; }
    try { conn.recorder?.stop(); } catch { /* ignore */ }
    conn.recorder = null;
    try { conn.ws?.close(); } catch { /* ignore */ }
    conn.ws = null;
    if (conn.ownsStream) conn.stream.getTracks().forEach(t => t.stop());
  }, []);

  // ── Web Speech API fallback (mic only, no speaker labels) ───────────────────

  const startWebSpeechFallback = useCallback(() => {
    if (!activeRef.current) return;

    const recognition = getWebSpeech();
    if (!recognition) {
      setErrorMessage('Mic unavailable — use the text input below.');
      return;
    }

    wsrRef.current = recognition;
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = language;

    recognition.onresult = (e) => {
      wsrNetworkErrRef.current = 0; // reset on any successful result
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const text = r[0].transcript.trim();
          if (text) onFinalRef.current(text);
          setInterimText('');
        } else {
          setInterimText(r[0].transcript);
        }
      }
    };

    recognition.onerror = (e) => {
      if (!activeRef.current || wsrRef.current !== recognition) return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setIsListening(false);
        setErrorMessage('Microphone access denied — allow mic in System Preferences > Privacy > Microphone.');
      } else if (e.error === 'audio-capture') {
        setIsListening(false);
        setErrorMessage('No microphone found — plug one in and try again.');
      } else if (e.error === 'network') {
        // In Electron production builds, webkitSpeechRecognition always returns
        // 'network' because Google's API keys aren't bundled. After 3 consecutive
        // failures, stop retrying and show a clear error so the user isn't stuck
        // staring at "Listening" with nothing happening.
        wsrNetworkErrRef.current += 1;
        if (wsrNetworkErrRef.current >= 3) {
          setIsListening(false);
          setErrorMessage('Speech recognition unavailable — microphone is active but the transcription service could not connect. Ensure Deepgram is configured in your Supabase project.');
          wsrRef.current = null;
          try { recognition.abort(); } catch { /* ignore */ }
        }
      } else if (e.error === 'aborted') {
        // Aborted by us (stopListening) — ignore.
      } else {
        // Unknown error — still let onend restart it, but show a soft warning.
        setErrorMessage(`Speech error (${e.error}) — retrying…`);
      }
    };

    // Browser speech stops after silence; auto-restart so it stays on.
    // Guard against stale recognition instances (e.g. React StrictMode double-invoke):
    // onend fires asynchronously, so by the time it runs a new recognition may already
    // be active - only restart if this is still the current one.
    recognition.onend = () => {
      if (!activeRef.current || wsrRef.current !== recognition) return;
      try { recognition.start(); } catch { /* ignore if already started */ }
    };

    try {
      recognition.start();
      setIsListening(true);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Could not start browser speech recognition.');
    }
  }, [language]);

  // Fired only when the PRIMARY (mic) Deepgram pipeline fails — drop to Web Speech.
  // A failure on the secondary (system-audio) pipeline is non-fatal: we just lose
  // the prospect channel and keep coaching off the rep's mic.
  const fallbackToWebSpeech = useCallback(() => {
    if (didFallbackRef.current) return;
    didFallbackRef.current = true;
    // Tear down every Deepgram pipeline before switching engines.
    connectionsRef.current.forEach(teardownConn);
    connectionsRef.current = [];
    setErrorMessage('Switched to browser speech recognition — speaker labels unavailable.');
    startWebSpeechFallback();
  }, [teardownConn, startWebSpeechFallback]);

  // ── Stop ──────────────────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    activeRef.current = false;
    // Flush any buffered finals before tearing down so the last line isn't lost.
    connectionsRef.current.forEach(conn => flushConn(conn, true));
    connectionsRef.current.forEach(teardownConn);
    connectionsRef.current = [];

    if (wsrRef.current) {
      try { wsrRef.current.abort(); } catch { /* ignore */ }
      wsrRef.current = null;
    }

    wsrNetworkErrRef.current = 0;
    setIsListening(false);
    setInterimText('');
  }, [flushConn, teardownConn]);

  // ── Open one Deepgram pipeline for a single source ──────────────────────────

  const openConnection = useCallback((conn: DGConnection, deepgramKey: string) => {
    const url = [
      'wss://api.deepgram.com/v1/listen',
      '?model=nova-2',
      `&language=${getDeepgramCode(language)}`,
      '&interim_results=true',
      '&smart_format=true',
      '&endpointing=250',
      '&utterance_end_ms=1000',
      // Diarization is only needed for the mixed/mic-only path. In dual-stream
      // mode the source itself identifies the speaker, so we skip it.
      ...(conn.diarize ? ['&diarize=true'] : []),
      ...DG_KEYWORD_BOOSTS.map(k => `&keywords=${k}`),
    ].join('');

    let ws: WebSocket;
    try {
      ws = new WebSocket(url, ['token', deepgramKey]);
    } catch {
      if (conn.primary) fallbackToWebSpeech();
      else teardownConn(conn);
      return;
    }
    conn.ws = ws;

    const onFail = () => {
      if (conn.ws !== ws) return;
      teardownConn(conn);
      if (conn.primary) fallbackToWebSpeech();
    };

    ws.onopen = () => {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : null;
      if (!mimeType) { onFail(); return; }

      let mr: MediaRecorder;
      try {
        mr = new MediaRecorder(conn.stream, { mimeType });
      } catch { onFail(); return; }
      conn.recorder = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(e.data);
          // First audio chunk flowing = capture works → clear the failure watchdog.
          if (!conn.audioStarted) {
            conn.audioStarted = true;
            if (conn.watchdog) { clearTimeout(conn.watchdog); conn.watchdog = null; }
          }
        }
      };
      try { mr.start(250); } catch { onFail(); return; }
      setIsListening(true);
      setErrorMessage(null);
      // If no audio data flows within 10s, assume a silent capture failure.
      conn.watchdog = setTimeout(() => { if (!conn.audioStarted) onFail(); }, WATCHDOG_TIMEOUT_MS);
    };

    ws.onmessage = (event) => {
      if (conn.ws !== ws) return;
      let data: DGResult;
      try { data = JSON.parse(event.data as string) as DGResult; } catch { return; }
      if (data.type !== 'Results') return;
      const alt = data.channel?.alternatives?.[0];
      const transcript = alt?.transcript;
      // Diarized (mixed) mode: pick the majority speaker from word-level labels.
      if (conn.diarize && alt?.words && alt.words.length > 0) {
        const counts = new Map<number, number>();
        for (const w of alt.words) counts.set(w.speaker, (counts.get(w.speaker) ?? 0) + 1);
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
        conn.currentSpeaker = sorted[0][0];
      }
      if (!transcript) return;
      if (data.is_final) {
        const text = transcript.trim();
        if (!text) return;
        conn.buffer.push(text);
        setInterimText('');
        flushConn(conn, data.speech_final || conn.buffer.length >= MAX_BUFFER_CHUNKS);
      } else {
        setInterimText(transcript);
      }
    };

    ws.onerror = () => onFail();

    ws.onclose = (e) => {
      if (conn.ws !== ws) return;
      if (e.code === 4001) {
        _deepgramTokenCache = null;
        console.warn('[Pitchr] Deepgram auth error (4001), token cache cleared');
      }
      // Unexpected close → treat as failure (drives fallback only if primary).
      if (e.code !== 1000 && e.code !== 1001 && activeRef.current) {
        onFail();
      } else {
        teardownConn(conn);
        if (connectionsRef.current.every(c => c.ws === null)) setIsListening(false);
      }
    };
  }, [language, flushConn, teardownConn, fallbackToWebSpeech]);

  // ── Start (dual-stream Deepgram primary, Web Speech fallback) ───────────────

  const startListening = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;
    didFallbackRef.current = false;

    const rawKey = await fetchDeepgramKey();
    const deepgramKey = rawKey?.trim() ?? null;
    // WebSocket subprotocol tokens must be valid RFC 7230 tchar sequences.
    const keyIsValid = !!deepgramKey && /^[!#$%&'*+\-.^_`|~\w]+$/.test(deepgramKey);
    if (!keyIsValid) {
      startWebSpeechFallback();
      return;
    }

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        // Echo cancellation reduces the prospect's voice bleeding into the mic
        // when the user isn't on headphones — keeps the "rep" channel cleaner.
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (!activeRef.current) {
        micStream.getTracks().forEach(t => t.stop());
        return;
      }

      // Tear down anything stale (StrictMode double-invoke).
      connectionsRef.current.forEach(teardownConn);
      connectionsRef.current = [];

      const sysStream = sysStreamRef.current;
      const liveSysTracks = sysStream?.getAudioTracks().filter(t => t.readyState === 'live') ?? [];
      const dualStream = liveSysTracks.length > 0;

      const conns: DGConnection[] = [];
      if (dualStream) {
        // ── Dual-stream: each source is a KNOWN speaker — no diarization guessing.
        conns.push(mkConn('rep', micStream, true, true));
        conns.push(mkConn('prospect', sysStream!, false, false));
      } else {
        // ── Mic-only: can't separate by source, so fall back to diarization.
        const mixed = mkConn('mixed', micStream, true, true);
        mixed.diarize = true;
        conns.push(mixed);
      }
      connectionsRef.current = conns;
      conns.forEach(c => openConnection(c, deepgramKey!));
    } catch (err) {
      activeRef.current = false;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setErrorMessage('Microphone access denied - allow mic in browser settings.');
      } else {
        setErrorMessage('Could not start microphone: ' + msg);
      }
    }

    function mkConn(label: SpeakerRole | 'mixed', stream: MediaStream, ownsStream: boolean, primary: boolean): DGConnection {
      return {
        label,
        role: label === 'mixed' ? undefined : label,
        diarize: false,
        stream,
        ownsStream,
        primary,
        ws: null,
        recorder: null,
        watchdog: null,
        buffer: [],
        flushTimer: null,
        isFlushing: false,
        audioStarted: false,
      };
    }
  }, [startWebSpeechFallback, teardownConn, openConnection]);

  // If the language changes while the Web Speech fallback is active mid-call,
  // abort the stale recognition and restart it with the new language.
  useEffect(() => {
    if (!activeRef.current || wsrRef.current === null) return;
    try { wsrRef.current.abort(); } catch { /* ignore */ }
    wsrRef.current = null;
    startWebSpeechFallback();
  }, [language, startWebSpeechFallback]);

  useEffect(() => {
    return () => { stopListening(); };
  }, [stopListening]);

  return {
    isListening,
    interimText,
    isSupported: WEB_SPEECH_SUPPORTED,
    errorMessage,
    startListening,
    stopListening,
  };
}
