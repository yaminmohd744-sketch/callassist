import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { getDeepgramCode } from '../lib/languages';
import { FUNCTIONS_BASE, ANON_KEY, getAuthToken } from '../lib/api';

const WATCHDOG_TIMEOUT_MS     = 10_000;
const FLUSH_DEBOUNCE_MS       = 350;
const TOKEN_CACHE_TTL_MS      = 3_500_000; // 58 min — key TTL is 1hr, refresh 2min early
const TOKEN_CACHE_HEADROOM_MS = 120_000;   // refetch 2min before expiry

let _deepgramTokenCache: { value: string; expiresAt: number } | null = null;
export function clearDeepgramTokenCache() { _deepgramTokenCache = null; }

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
  } catch {
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSpeechRecognitionOptions {
  onFinalTranscript: (text: string, speakerIndex?: number) => void;
  language?: string; // BCP 47 code, e.g. 'en-US', 'es-ES'
  systemAudioStream?: MediaStream | null; // system audio from getDisplayMedia — mixed with mic
}

export function useSpeechRecognition({ onFinalTranscript, language = 'en-US', systemAudioStream }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening]   = useState(false);
  const [interimText, setInterimText]   = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef             = useRef<WebSocket | null>(null);
  const watchdogTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const wsrRef          = useRef<WSR | null>(null); // Web Speech Recognition fallback
  const activeRef       = useRef(false);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const sysStreamRef    = useRef<MediaStream | null | undefined>(systemAudioStream);
  const onFinalRef      = useRef(onFinalTranscript);
  useLayoutEffect(() => { onFinalRef.current = onFinalTranscript; }, [onFinalTranscript]);
  useLayoutEffect(() => { sysStreamRef.current = systemAudioStream; }, [systemAudioStream]);

  // Utterance buffer - accumulates is_final chunks and flushes them as one entry
  // after a short silence, so fragmented mid-sentence commits get merged.
  // Capped at MAX_BUFFER_CHUNKS to prevent unbounded memory growth on very long calls.
  const bufferRef = useRef<string[]>([]);
  const flushTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFlushingRef      = useRef(false);
  // Tracks the Deepgram speaker index for the current utterance (updated per chunk).
  const dgCurrentSpeakerRef = useRef<number | undefined>(undefined);

  const flushBuffer = useCallback((immediate = false) => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    if (immediate) {
      // Guard against concurrent flushes from rapid final-chunk bursts
      if (isFlushingRef.current) return;
      isFlushingRef.current = true;
      const combined = bufferRef.current.join(' ').trim();
      const speaker = dgCurrentSpeakerRef.current;
      bufferRef.current = [];
      dgCurrentSpeakerRef.current = undefined;
      isFlushingRef.current = false;
      if (combined) onFinalRef.current(combined, speaker);
    } else {
      flushTimerRef.current = setTimeout(() => {
        if (isFlushingRef.current) return;
        isFlushingRef.current = true;
        const combined = bufferRef.current.join(' ').trim();
        const speaker = dgCurrentSpeakerRef.current;
        bufferRef.current = [];
        dgCurrentSpeakerRef.current = undefined;
        isFlushingRef.current = false;
        if (combined) onFinalRef.current(combined, speaker);
      }, FLUSH_DEBOUNCE_MS);
    }
  }, []);

  // ── Web Speech API fallback ────────────────────────────────────────────────

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
        setErrorMessage('Microphone access denied — allow mic in your OS settings.');
      } else if (e.error === 'audio-capture') {
        setIsListening(false);
        setErrorMessage('No microphone found — plug one in and try again.');
      } else if (e.error === 'network') {
        // Network errors are transient — the onend handler will auto-restart.
        // Don't kill isListening or show an error; let it silently retry.
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

  // ── Stop ──────────────────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    activeRef.current = false;
    if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }

    flushBuffer(true);

    if (wsrRef.current) {
      try { wsrRef.current.abort(); } catch { /* ignore */ }
      wsrRef.current = null;
    }

    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    mediaRecorderRef.current = null;

    try { wsRef.current?.close(); } catch { /* ignore */ }
    wsRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;

    setIsListening(false);
    setInterimText('');
  }, [flushBuffer]);

  // ── Start (Deepgram primary, Web Speech fallback) ─────────────────────────

  const startListening = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;

    // Fetch a short-lived Deepgram key from the Edge Function proxy.
    // Falls back to Web Speech if the proxy isn't configured or the fetch fails.
    const rawKey = await fetchDeepgramKey();

    // WebSocket subprotocol tokens must be valid RFC 7230 tchar sequences —
    // no spaces, angle brackets, colons, slashes, or control characters.
    // Trim whitespace first (copy-paste or env var trailing newlines are common).
    const deepgramKey = rawKey?.trim() ?? null;
    const keyIsValid = !!deepgramKey && /^[!#$%&'*+\-.^_`|~\w]+$/.test(deepgramKey);

    if (!keyIsValid) {
      startWebSpeechFallback();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!activeRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      // Kill any stale connection from React StrictMode double-invoke.
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = stream;
      try { wsRef.current?.close(); } catch { /* ignore */ }

      const url = [
        'wss://api.deepgram.com/v1/listen',
        '?model=nova-2',
        `&language=${getDeepgramCode(language)}`,
        '&interim_results=true',
        '&smart_format=true',
        '&endpointing=250',
        '&utterance_end_ms=1000',
        '&diarize=true',
        ...DG_KEYWORD_BOOSTS.map(k => `&keywords=${k}`),
      ].join('');

      // WebSocket constructor throws synchronously if the subprotocol token is
      // rejected by the browser — catch it here and fall back to Web Speech.
      let ws: WebSocket;
      try {
        ws = new WebSocket(url, ['token', deepgramKey]);
      } catch {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        startWebSpeechFallback();
        return;
      }
      wsRef.current = ws;

      // One-shot guard: onerror, onclose, and watchdog can all fire for the same failure.
      // Ensure only the first one triggers the fallback.
      let didFallback = false;
      const tryFallback = () => {
        if (didFallback) return;
        didFallback = true;
        if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }
        setErrorMessage('Switched to browser speech recognition — speaker labels unavailable.');
        startWebSpeechFallback();
      };

      ws.onopen = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : null;
        if (!mimeType) {
          stream.getTracks().forEach(t => t.stop());
          streamRef.current = null;
          tryFallback();
          return;
        }

        // Mix mic + system audio when available.
        // AudioContext merges both tracks into a single MediaStream for Deepgram.
        let inputStream: MediaStream = stream;
        const sysStream = sysStreamRef.current;
        const liveSysTracks = sysStream?.getAudioTracks().filter(t => t.readyState === 'live') ?? [];
        if (liveSysTracks.length > 0) {
          try {
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            const dest = ctx.createMediaStreamDestination();
            ctx.createMediaStreamSource(stream).connect(dest);
            ctx.createMediaStreamSource(sysStream!).connect(dest);
            inputStream = dest.stream;
          } catch {
            // Mixing failed — fall back to mic only
          }
        }

        const mr = new MediaRecorder(inputStream, { mimeType });
        mediaRecorderRef.current = mr;
        mr.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
        };
        mr.start(250);
        setIsListening(true);
        setErrorMessage(null);
        // If no audio data arrives within 10s of connecting, assume silent failure and fall back.
        watchdogTimerRef.current = setTimeout(() => tryFallback(), WATCHDOG_TIMEOUT_MS);
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }
        let data: DGResult;
        try { data = JSON.parse(event.data as string) as DGResult; } catch { return; }
        if (data.type !== 'Results') return;
        const alt = data.channel?.alternatives?.[0];
        const transcript = alt?.transcript;
        // Extract majority speaker from word-level diarization when available.
        // Sort descending by count so the highest-count speaker is always first (ties broken by lower speaker index).
        if (alt?.words && alt.words.length > 0) {
          const counts = new Map<number, number>();
          for (const w of alt.words) counts.set(w.speaker, (counts.get(w.speaker) ?? 0) + 1);
          const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
          dgCurrentSpeakerRef.current = sorted[0][0];
        }
        if (!transcript) return;
        if (data.is_final) {
          const text = transcript.trim();
          if (!text) return;
          bufferRef.current.push(text);
          setInterimText('');
          // Flush immediately if the buffer is getting too large so memory stays bounded,
          // or if Deepgram signals the utterance is complete.
          flushBuffer(data.speech_final || bufferRef.current.length >= MAX_BUFFER_CHUNKS);
        } else {
          setInterimText(transcript);
        }
      };

      ws.onerror = () => {
        if (wsRef.current !== ws) return;
        if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }
        // Deepgram auth/connection failed - silently fall back to browser speech.
        wsRef.current = null;
        try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
        mediaRecorderRef.current = null;
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        tryFallback();
      };

      ws.onclose = (e) => {
        if (wsRef.current !== ws) return;
        if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }
        // Clean up media resources before attempting fallback so they don't leak.
        try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
        mediaRecorderRef.current = null;
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        // Auth error — token is invalid; clear cache so next call fetches a fresh one.
        if (e.code === 4001) {
          _deepgramTokenCache = null;
          console.warn('[Pitchr] Deepgram auth error (4001), token cache cleared');
        }
        // Unexpected close → fall back to browser speech.
        // Only set isListening=false on a clean/intentional close to avoid a flicker
        // when tryFallback() immediately sets it back to true via Web Speech start.
        if (e.code !== 1000 && e.code !== 1001 && activeRef.current) {
          tryFallback();
        } else {
          setIsListening(false);
        }
      };

    } catch (err) {
      activeRef.current = false;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setErrorMessage('Microphone access denied - allow mic in browser settings.');
      } else {
        setErrorMessage('Could not start microphone: ' + msg);
      }
    }
  }, [startWebSpeechFallback, flushBuffer, language]);

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
