import { useState, useRef, useCallback, useEffect } from 'react';

const DEEPGRAM_API_KEY = (import.meta as unknown as { env: Record<string, string> }).env.VITE_DEEPGRAM_API_KEY;

interface UseSpeechRecognitionOptions {
  onFinalTranscript: (text: string) => void;
}

export function useSpeechRecognition({ onFinalTranscript }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Prevents React Strict Mode double-mount from creating two WS connections
  const activeRef = useRef(false);
  // Deduplication: ignore transcript if >90% similar to the previous one
  const lastTranscriptRef = useRef('');
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;

  const stopListening = useCallback(() => {
    activeRef.current = false;
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    mediaRecorderRef.current = null;
    try { wsRef.current?.close(); } catch { /* ignore */ }
    wsRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(async () => {
    // Guard: prevent double-start from React Strict Mode or rapid calls
    if (activeRef.current) return;
    activeRef.current = true;

    if (!DEEPGRAM_API_KEY) {
      setErrorMessage('Add VITE_DEEPGRAM_API_KEY to .env.local and restart the dev server.');
      activeRef.current = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // If stopped while awaiting mic permission, clean up and bail
      if (!activeRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      const url = [
        'wss://api.deepgram.com/v1/listen',
        '?model=nova-2',
        '&language=en-US',
        '&interim_results=true',
        '&smart_format=true',
        '&endpointing=400',
      ].join('');

      // API key passed as WebSocket subprotocol — no CORS preflight needed
      const ws = new WebSocket(url, ['token', DEEPGRAM_API_KEY]);
      wsRef.current = ws;

      ws.onopen = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };

        mediaRecorder.start(250);
        setIsListening(true);
        setErrorMessage(null);
      };

      ws.onmessage = (event) => {
        interface DGResult {
          type: string;
          is_final: boolean;
          speech_final: boolean;
          channel: { alternatives: { transcript: string }[] };
        }
        const data = JSON.parse(event.data as string) as DGResult;
        if (data.type !== 'Results') return;
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (!transcript) return;

        if (data.is_final) {
          // Dedup: skip if >90% word overlap with the previous final transcript
          const prev = lastTranscriptRef.current.toLowerCase().trim().split(/\s+/);
          const curr = transcript.toLowerCase().trim().split(/\s+/);
          const prevSet = new Set(prev);
          const overlap = curr.filter(w => prevSet.has(w)).length;
          const sim = (2 * overlap) / (prev.length + curr.length);
          if (sim < 0.9) {
            lastTranscriptRef.current = transcript;
            onFinalRef.current(transcript);
          }
          setInterimText('');
        } else {
          setInterimText(transcript);
        }
      };

      ws.onerror = () => {
        setErrorMessage('Deepgram connection failed — check your API key.');
        stopListening();
      };

      ws.onclose = (e) => {
        setIsListening(false);
        if (e.code !== 1000 && e.code !== 1001) {
          setErrorMessage(`Deepgram disconnected (${e.code}). Refresh to reconnect.`);
        }
      };
    } catch (err) {
      activeRef.current = false;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setErrorMessage('Microphone access denied. Allow mic in your browser settings.');
      } else {
        setErrorMessage('Could not start microphone: ' + msg);
      }
    }
  }, [stopListening]);

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
