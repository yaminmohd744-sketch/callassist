import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { getDeepgramCode } from '../lib/languages';

const DEEPGRAM_API_KEY = (import.meta as unknown as { env: Record<string, string> }).env.VITE_DEEPGRAM_API_KEY;

// ─── Minimal Web Speech API types ─────────────────────────────────────────────

interface WSRResult { isFinal: boolean; 0: { transcript: string }; }
interface WSREvent  { resultIndex: number; results: WSRResult[]; }
interface WSR {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: WSREvent) => void) | null;
  onerror:  (() => void) | null;
  onend:    (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function getWebSpeech(): WSR | null {
  const W = window as unknown as { SpeechRecognition?: new () => WSR; webkitSpeechRecognition?: new () => WSR };
  const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSpeechRecognitionOptions {
  onFinalTranscript: (text: string) => void;
  language?: string; // BCP 47 code, e.g. 'en-US', 'es-ES'
}

export function useSpeechRecognition({ onFinalTranscript, language = 'en-US' }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening]   = useState(false);
  const [interimText, setInterimText]   = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef           = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const wsrRef          = useRef<WSR | null>(null); // Web Speech Recognition fallback
  const activeRef       = useRef(false);
  const onFinalRef      = useRef(onFinalTranscript);
  useLayoutEffect(() => { onFinalRef.current = onFinalTranscript; });

  // Utterance buffer - accumulates is_final chunks and flushes them as one entry
  // after a short silence, so fragmented mid-sentence commits get merged.
  const bufferRef     = useRef<string[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitBuffer = useCallback(() => {
    if (flushTimerRef.current) { clearTimeout(flushTimerRef.current); flushTimerRef.current = null; }
    const combined = bufferRef.current.join(' ').trim();
    bufferRef.current = [];
    if (combined) onFinalRef.current(combined);
  }, []);

  const flushBuffer = useCallback((immediate = false) => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    if (immediate) {
      const combined = bufferRef.current.join(' ').trim();
      bufferRef.current = [];
      if (combined) onFinalRef.current(combined);
    } else {
      flushTimerRef.current = setTimeout(() => {
        const combined = bufferRef.current.join(' ').trim();
        bufferRef.current = [];
        if (combined) onFinalRef.current(combined);
      }, 350);
    }
  }, []);

  // ── Web Speech API fallback ────────────────────────────────────────────────

  const startWebSpeechFallback = useCallback(() => {
    if (!activeRef.current) return;

    const recognition = getWebSpeech();
    if (!recognition) {
      setErrorMessage('Mic unavailable - use the text input below.');
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

    recognition.onerror = () => {
      if (!activeRef.current || wsrRef.current !== recognition) return;
      setIsListening(false);
      setErrorMessage('Speech recognition error - try refreshing.');
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

    commitBuffer();
    bufferRef.current = [];

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

    setIsListening(false);
    setInterimText('');
  }, []);

  // ── Start (Deepgram primary, Web Speech fallback) ─────────────────────────

  const startListening = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;

    // No Deepgram key → go straight to browser speech.
    if (!DEEPGRAM_API_KEY) {
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
        '&keywords=demo:3',
        '&keywords=trial:2',
        '&keywords=pricing:2',
        '&keywords=integration:2',
        '&keywords=software:2',
        '&keywords=platform:2',
        '&keywords=proposal:2',
      ].join('');

      const ws = new WebSocket(url, ['token', DEEPGRAM_API_KEY]);
      wsRef.current = ws;

      ws.onopen = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        const mr = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mr;
        mr.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
        };
        mr.start(250);
        setIsListening(true);
        setErrorMessage(null);
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        interface DGResult {
          type: string; is_final: boolean; speech_final: boolean;
          channel: { alternatives: { transcript: string }[] };
        }
        const data = JSON.parse(event.data as string) as DGResult;
        if (data.type !== 'Results') return;
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (!transcript) return;
        if (data.is_final) {
          const text = transcript.trim();
          if (!text) return;
          bufferRef.current.push(text);
          setInterimText('');
          // speech_final = Deepgram is confident the utterance is complete → flush immediately
          flushBuffer(data.speech_final);
        } else {
          setInterimText(transcript);
        }
      };

      ws.onerror = () => {
        if (wsRef.current !== ws) return;
        // Deepgram auth/connection failed - silently fall back to browser speech.
        wsRef.current = null;
        try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
        mediaRecorderRef.current = null;
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        startWebSpeechFallback();
      };

      ws.onclose = (e) => {
        if (wsRef.current !== ws) return;
        setIsListening(false);
        // Unexpected close → fall back to browser speech.
        if (e.code !== 1000 && e.code !== 1001 && activeRef.current) {
          startWebSpeechFallback();
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

  useEffect(() => {
    return () => { stopListening(); };
  }, [stopListening]);

  return {
    isListening,
    interimText,
    isSupported: true,
    errorMessage,
    startListening,
    stopListening,
  };
}
