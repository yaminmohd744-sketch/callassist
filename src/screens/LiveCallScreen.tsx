import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import { useToast } from '../lib/toast';
import { useTranslations } from '../hooks/useTranslations';
import { Header } from '../components/layout/Header';
import { StatusBar } from '../components/layout/StatusBar';
import { TranscriptPanel } from '../components/panels/TranscriptPanel';
import { AIIntelligencePanel } from '../components/panels/AIIntelligencePanel';
import { LeadProfilePanel } from '../components/panels/LeadProfilePanel';
import { useCallTimer } from '../hooks/useCallTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAICoach } from '../hooks/useAICoach';
import { generateSessionSummary, classifySignalAI } from '../lib/ai';
import { classifySignal, PROSPECT_PHRASES, REP_PHRASES, PROSPECT_REACTIONS } from '../lib/keywords';
import type { CallConfig, CallSession, CallStatus, TranscriptEntry, TranscriptSpeaker } from '../types';
import { genId } from '../lib/id';
import { saveDraft, loadDraft, clearDraft } from '../lib/callDraft';
import { useCallRecorder } from '../hooks/useCallRecorder';
import { useBodyLanguage } from '../hooks/useBodyLanguage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { extractAutoNote, clearAutoNoteDedup } from '../lib/autoNotes';
import type { AISuggestion } from '../types';
import { STORAGE_KEYS } from '../lib/storageKeys';
import './LiveCallScreen.css';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'sort of', 'kind of', 'i mean', 'right'];
const FILLER_PATTERNS = FILLER_WORDS.map(w => new RegExp(`\\b${w}\\b`, 'i'));

const BODY_SUGGESTIONS_MAX = 10;
const DRAFT_SAVE_INTERVAL_MS = 10_000;
const FLIP_DEBOUNCE_MS = 400;
const DEFAULT_TALK_RATIO = 0.5;

// Classify who is speaking based on content + conversational context.
// Prospect: asks about price/product, raises objections, reacts to the rep's pitch.
// Rep: pitches, introduces themselves, asks discovery questions.
function classifySpeaker(text: string, history: TranscriptEntry[]): 'rep' | 'prospect' {
  const lower = text.toLowerCase();
  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  const prevSpeaker = lastEntry?.speaker ?? null;
  const wordCount = lower.trim().split(/\s+/).length;

  if (PROSPECT_PHRASES.some(p => lower.includes(p))) return 'prospect';
  if (REP_PHRASES.some(p => lower.includes(p))) return 'rep';

  // Short question (≤4 words, ends with ?) → likely a brief prospect query
  if (lower.trimEnd().endsWith('?') && wordCount <= 4) return 'prospect';

  // ── Conversation rhythm analysis ─────────────────────────────────────────
  // How many consecutive rep entries are at the end of history?
  let consecutiveRep = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].speaker === 'rep') consecutiveRep++;
    else break;
  }
  // After 2+ rep turns in a row, the next entry is almost certainly the prospect reacting.
  if (consecutiveRep >= 2 && wordCount <= 15) return 'prospect';

  // If the whole history so far is nothing but rep entries (call just started),
  // treat the next short-to-medium utterance as the prospect.
  if (history.length >= 3 && history.every(e => e.speaker === 'rep') && wordCount <= 20) {
    return 'prospect';
  }

  // ── Turn-taking: after the rep speaks, reaction words signal the prospect ──
  if (prevSpeaker === 'rep' && wordCount <= 10) {
    if (PROSPECT_REACTIONS.some(r => lower.includes(r))) return 'prospect';
  }

  // Default to rep - reps tend to speak more during cold calls
  return 'rep';
}

// Once a strong prospect signal locks in the pattern, walk backwards through history
// (skipping index 0 which is always the rep opening) and apply strict alternation.
// This retroactively corrects early ambiguous turns like "Hmm" or "Yeah, one second".
function retroactivelyCorrectSpeakers(
  history: TranscriptEntry[],
  confirmedProspectIdx: number
): TranscriptEntry[] {
  if (confirmedProspectIdx <= 1) return history;
  const corrected = [...history];
  let expected: 'rep' | 'prospect' = 'rep'; // entry just before prospect → rep
  for (let i = confirmedProspectIdx - 1; i >= 1; i--) {
    if (corrected[i].speaker === 'system') continue;
    corrected[i] = { ...corrected[i], speaker: expected };
    expected = expected === 'rep' ? 'prospect' : 'rep';
  }
  return corrected;
}

interface LiveCallScreenProps {
  config: CallConfig;
  onEndCall: (session: CallSession) => void;
}

export function LiveCallScreen({ config, onEndCall }: LiveCallScreenProps) {
  const t = useTranslations();
  const toast = useToast();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('standby');
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'transcript' | 'ai' | 'lead'>('transcript');
  const [isSummarising, setIsSummarising] = useState(false);
  const [micWarning, setMicWarning] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [draftRecovery, setDraftRecovery] = useState<{ transcript: TranscriptEntry[]; suggestions: AISuggestion[]; startedAt: string } | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const recordingKeyRef = useRef(startedAtRef.current);
  const { startRecording, stopRecording, isSupported: recordingSupported, recordingError } = useCallRecorder();
  const [bodySuggestions, setBodySuggestions] = useState<AISuggestion[]>([]);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const dragListenersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);
  const flipDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakerLockedRef = useRef(false);
  const dgSpeakerMapRef = useRef<Map<number, TranscriptSpeaker> | null>(null);
  const repSecondsRef = useRef(0);
  const prospectSecondsRef = useRef(0);
  const speechStartRef = useRef<number | null>(null);
  const fillerCountRef = useRef(0);
  const isSummarisingRef = useRef(false);

  const handleBubbleDragStart = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!bubbleRef.current) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (ev: MouseEvent) => {
      if (!dragOffset.current || !bubbleRef.current) return;
      const x = Math.max(0, Math.min(window.innerWidth - bubbleRef.current.offsetWidth, ev.clientX - dragOffset.current.x));
      const y = Math.max(0, Math.min(window.innerHeight - bubbleRef.current.offsetHeight, ev.clientY - dragOffset.current.y));
      bubbleRef.current.style.left = `${x}px`;
      bubbleRef.current.style.top = `${y}px`;
      bubbleRef.current.style.transform = 'none';
    };

    const onUp = () => {
      dragOffset.current = null;
      dragListenersRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    dragListenersRef.current = { move: onMove, up: onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  const { elapsedSeconds, formattedTime, startTimer, stopTimer } = useCallTimer();
  const signalAbortRef = useRef<AbortController | null>(null);

  const { suggestions, phaseLabel, prospectTone, closeProbability, callStage, objectionsCount, processEntry, reset: resetCoach, seedSuggestions } = useAICoach();
  const suggestionsRef = useRef(suggestions);
  useLayoutEffect(() => { suggestionsRef.current = suggestions; }, [suggestions]);

  const latestAIScript = suggestions.length > 0 ? suggestions[suggestions.length - 1].body : undefined;
  const onBodySuggestion = useCallback((s: AISuggestion) => {
    setBodySuggestions(prev => [...prev.slice(-(BODY_SUGGESTIONS_MAX - 1)), s]);
  }, []);
  const { cameraError } = useBodyLanguage({
    isActive: callStatus === 'active',
    elapsedSeconds,
    currentScript: latestAIScript,
    onSuggestion: onBodySuggestion,
  });

  // Both sources append chronologically, so no sort needed (max ~18 items total)
  const allSuggestions = useMemo(() => {
    return [...suggestions, ...bodySuggestions];
  }, [suggestions, bodySuggestions]);

  // Automatically classify each mic utterance as rep or prospect based on content.
  // Only prospect entries trigger AI analysis.
  const handleFinalTranscript = useCallback((text: string, deepgramSpeaker?: number) => {
    const isFirst = transcriptRef.current.length === 0;
    const mentionsProspect = config.prospectName.trim().length > 0 &&
      text.toLowerCase().includes(config.prospectName.trim().toLowerCase());

    let speaker: TranscriptSpeaker;

    // Deepgram diarization takes priority over all heuristics when available
    if (deepgramSpeaker !== undefined) {
      if (!dgSpeakerMapRef.current) {
        dgSpeakerMapRef.current = new Map([[deepgramSpeaker, 'rep']]);
      }
      const mapped = dgSpeakerMapRef.current.get(deepgramSpeaker);
      if (mapped) {
        speaker = mapped;
      } else {
        const newRole: TranscriptSpeaker = [...dgSpeakerMapRef.current.values()][0] === 'rep' ? 'prospect' : 'rep';
        dgSpeakerMapRef.current.set(deepgramSpeaker, newRole);
        speaker = newRole;
      }
    } else if (isFirst || mentionsProspect) {
      speaker = 'rep';
    } else if (speakerLockedRef.current) {
      const lastNonSystem = [...transcriptRef.current].reverse().find(e => e.speaker !== 'system');
      const alternation: TranscriptSpeaker = lastNonSystem?.speaker === 'rep' ? 'prospect' : 'rep';
      const lower = text.toLowerCase();
      if (PROSPECT_PHRASES.some(p => lower.includes(p))) speaker = 'prospect';
      else if (REP_PHRASES.some(p => lower.includes(p))) speaker = 'rep';
      else speaker = alternation;
    } else {
      speaker = classifySpeaker(text, transcriptRef.current);
    }

    // First time a strong prospect keyword fires — lock the pattern and retroactively correct.
    const isLockIn = deepgramSpeaker === undefined &&
      !speakerLockedRef.current &&
      speaker === 'prospect' &&
      PROSPECT_PHRASES.some(p => text.toLowerCase().includes(p));

    const entry: TranscriptEntry = {
      id: genId(),
      speaker,
      text,
      timestampSeconds: elapsedSeconds,
      signal: speaker === 'prospect' ? classifySignal(text) : 'neutral',
    };

    let newTranscript = [...transcriptRef.current, entry];

    if (isLockIn) {
      speakerLockedRef.current = true;
      newTranscript = retroactivelyCorrectSpeakers(newTranscript, newTranscript.length - 1);
    }

    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);

    // Accumulate speaking duration per speaker.
    // speechStartRef was set when interim text first appeared; if not set (e.g. Deepgram
    // speech_final with no prior interim), fall back to a word-rate estimate (150 wpm).
    const wordCount = text.trim().split(/\s+/).length;
    const now = Date.now();
    const durationSec = speechStartRef.current !== null
      ? (now - speechStartRef.current) / 1000
      : wordCount / 2.5; // ~150 wpm fallback
    speechStartRef.current = null;

    if (speaker === 'rep') {
      repSecondsRef.current += durationSec;
      // Track filler words
      const lower = text.toLowerCase();
      const fillers = FILLER_PATTERNS.filter(p => p.test(lower)).length;
      if (fillers > 0) fillerCountRef.current += fillers;
    } else if (speaker === 'prospect') {
      prospectSecondsRef.current += durationSec;
    }

    if (speaker === 'prospect') {
      if (config.language === 'en-US') {
        // Signal already correct from synchronous classifySignal()
        processEntry(entry, newTranscript, elapsedSeconds, config);
      } else {
        // Await AI classification so extractContext sees the correct signal before analysis runs
        signalAbortRef.current?.abort();
        const ctrl = new AbortController();
        signalAbortRef.current = ctrl;
        classifySignalAI(text, config.language ?? 'en-US', ctrl.signal)
          .then(signal => {
            if (ctrl.signal.aborted) return;
            const patched = { ...entry, signal };
            const updatedTranscript = newTranscript.map(e =>
              e.id === entry.id ? patched : e
            );
            transcriptRef.current = updatedTranscript;
            setTranscript(updatedTranscript);
            processEntry(patched, updatedTranscript, elapsedSeconds, config);
          })
          .catch(() => {
            // Classification failed/aborted — still run analysis with neutral signal
            if (!ctrl.signal.aborted) processEntry(entry, newTranscript, elapsedSeconds, config);
          });
      }
      const autoNote = extractAutoNote(text, elapsedSeconds);
      if (autoNote) setNotes(prev => [...prev, `◆ ${autoNote}`]);
    }
  }, [elapsedSeconds, processEntry, config]);

  const { isListening, interimText, errorMessage, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
    language: config.language ?? 'en-US',
  });

  // Record when speech starts so we can measure utterance duration accurately.
  const prevInterimRef = useRef('');
  useEffect(() => {
    if (interimText && !prevInterimRef.current) {
      speechStartRef.current = Date.now();
    }
    prevInterimRef.current = interimText;
  }, [interimText]);

  useEffect(() => {
    // Reset AI coach so each new call starts with a clean slate.
    resetCoach();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for a crash-recovery draft on mount
  useEffect(() => {
    loadDraft().then(draft => {
      if (!draft || draft.transcript.length === 0) return;
      setDraftRecovery({ transcript: draft.transcript, suggestions: draft.suggestions ?? [], startedAt: draft.startedAt });
    }).catch(() => { /* IndexedDB unavailable — silent */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft to IndexedDB every 10 seconds during an active call.
  // suggestionsRef keeps the interval stable — recreating it on every new suggestion
  // would create timing gaps in the 10s cadence.
  useEffect(() => {
    if (callStatus !== 'active') return;
    const id = setInterval(() => {
      saveDraft({
        config,
        transcript: transcriptRef.current,
        suggestions: suggestionsRef.current,
        startedAt: startedAtRef.current,
        savedAt: new Date().toISOString(),
      }).catch((err: unknown) => {
        if (err instanceof Error && err.message === 'QuotaExceededError') {
          toast.error('Storage full — auto-save draft paused. Free up browser storage.');
        }
      });
    }, DRAFT_SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus, config]);

  // Push live call data to the Electron overlay window whenever it changes.
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.pushOverlayData({
      suggestions,
      closeProbability,
      callStage,
      prospectName: config.prospectName,
    });
  }, [suggestions, closeProbability, callStage, config.prospectName]);

  // Listen for the overlay's "End Session" button — restores main window and ends the call.
  // Uses a ref so the listener always calls the latest handleEndCall without re-registering.
  useEffect(() => {
    if (!window.electronAPI) return;
    return window.electronAPI.onTriggerEndCall(() => {
      handleEndCallRef.current();
    });
  }, []);

  useEffect(() => {
    // Run once on mount to start the call immediately. startTimer and
    // startListening are stable callback refs that never change identity, so
    // omitting them from the dep array is intentional — re-running this effect
    // would restart the timer and mic mid-call.
    dgSpeakerMapRef.current = null; // reset speaker map for fresh call
    setCallStatus('active');
    startTimer();
    startListening().catch(() => setMicWarning(true));
    if (recordingSupported) startRecording();
    return () => {
      if (flipDebounceRef.current) clearTimeout(flipDebounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up any dangling drag listeners if the component unmounts mid-drag.
  useEffect(() => {
    return () => {
      if (dragListenersRef.current) {
        window.removeEventListener('mousemove', dragListenersRef.current.move);
        window.removeEventListener('mouseup', dragListenersRef.current.up);
      }
    };
  }, []);

  const handleFlipSpeaker = useCallback((id: string) => {
    setTranscript(prev => {
      const updated = prev.map(e => {
        if (e.id !== id) return e;
        const flipped: TranscriptSpeaker = e.speaker === 'rep' ? 'prospect' : 'rep';
        return { ...e, speaker: flipped, signal: flipped === 'prospect' ? classifySignal(e.text) : 'neutral' as const };
      });
      transcriptRef.current = updated;
      const flippedEntry = updated.find(e => e.id === id);
      if (flippedEntry?.speaker === 'prospect') {
        if (flipDebounceRef.current) clearTimeout(flipDebounceRef.current);
        flipDebounceRef.current = setTimeout(() => {
          if (config.language === 'en-US') {
            processEntry(flippedEntry, updated, flippedEntry.timestampSeconds, config);
          } else {
            signalAbortRef.current?.abort();
            const ctrl = new AbortController();
            signalAbortRef.current = ctrl;
            classifySignalAI(flippedEntry.text, config.language ?? 'en-US', ctrl.signal)
              .then(signal => {
                if (ctrl.signal.aborted) return;
                const patched = { ...flippedEntry, signal };
                setTranscript(prev => {
                  const next = prev.map(e => e.id === patched.id ? patched : e);
                  transcriptRef.current = next;
                  return next;
                });
                processEntry(patched, transcriptRef.current, patched.timestampSeconds, config);
              })
              .catch(() => {
                if (!ctrl.signal.aborted) processEntry(flippedEntry, updated, flippedEntry.timestampSeconds, config);
              });
          }
        }, FLIP_DEBOUNCE_MS);
      }
      speakerLockedRef.current = false;
      dgSpeakerMapRef.current = null;
      return updated;
    });
  }, [processEntry, config]);

  const handleAddNote = useCallback(() => {
    const text = noteInput.trim();
    if (!text) return;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    setNotes(prev => [...prev, `${mins}:${secs} ${text}`]);
    setNoteInput('');
  }, [noteInput, elapsedSeconds]);

  const handleRestoreDraft = useCallback(() => {
    if (!draftRecovery) return;
    setTranscript(draftRecovery.transcript);
    transcriptRef.current = draftRecovery.transcript;
    speakerLockedRef.current = false;
    dgSpeakerMapRef.current = null;
    resetCoach();
    seedSuggestions(draftRecovery.suggestions);
    setDraftRecovery(null);
  }, [draftRecovery, resetCoach, seedSuggestions]);

  const handleDismissDraft = useCallback(() => {
    clearDraft().catch(() => {});
    setDraftRecovery(null);
  }, []);

  const handleEndCall = useCallback(async () => {
    // Warn if no transcript yet, but still allow ending the call.
    if (transcriptRef.current.length === 0) {
      toast.error(t.liveCall.noTranscript);
    }
    if (isSummarisingRef.current) return;
    if (flipDebounceRef.current) { clearTimeout(flipDebounceRef.current); flipDebounceRef.current = null; }
    stopListening();
    stopTimer();
    await stopRecording(recordingKeyRef.current);
    window.electronAPI?.closeOverlay();
    isSummarisingRef.current = true;
    setIsSummarising(true);
    // Use refs so we always get the latest values even if a final speech chunk
    // arrived in the same tick as the "End Call" click.
    const finalTranscript = transcriptRef.current;
    const finalSuggestions = suggestionsRef.current;
    const totalSeconds = repSecondsRef.current + prospectSecondsRef.current;
    const talkRatio = totalSeconds > 0 ? repSecondsRef.current / totalSeconds : DEFAULT_TALK_RATIO;
    try {
      const { aiSummary, followUpEmail, leadScore, coaching } = await generateSessionSummary(
        config,
        finalTranscript,
        finalSuggestions,
        closeProbability,
        objectionsCount,
        talkRatio
      );

      try { localStorage.setItem(STORAGE_KEYS.nextCallTip, coaching.nextCallTip); } catch { /* storage full */ }
      clearDraft().catch(() => { /* silent */ });
      clearAutoNoteDedup();

      const session: CallSession = {
        config,
        transcript: finalTranscript,
        suggestions: finalSuggestions,
        durationSeconds: elapsedSeconds,
        finalCloseProbability: closeProbability,
        objectionsCount,
        callStage,
        endedAt: new Date().toISOString(),
        aiSummary,
        followUpEmail,
        leadScore,
        notes,
        talkRatio,
        coaching,
        recordingKey: recordingSupported ? recordingKeyRef.current : undefined,
      };
      onEndCall(session);
    } catch {
      isSummarisingRef.current = false;
      setIsSummarising(false);
      toast.error(t.liveCall.summaryFailed);
      onEndCall({
        config, transcript: finalTranscript, suggestions: finalSuggestions,
        durationSeconds: elapsedSeconds,
        finalCloseProbability: closeProbability,
        objectionsCount, callStage,
        endedAt: new Date().toISOString(),
        aiSummary: '', followUpEmail: '', leadScore: 0,
        notes,
        talkRatio,
        coaching: undefined,
      });
    }
  }, [stopListening, stopTimer, stopRecording, config, closeProbability, objectionsCount, elapsedSeconds, callStage, notes, onEndCall, t]);

  // Keep a stable ref so the overlay's trigger-end-call listener always calls the latest version.
  const handleEndCallRef = useRef(handleEndCall);
  useLayoutEffect(() => { handleEndCallRef.current = handleEndCall; });

  const handleMobileTabChange = useCallback((p: 'transcript' | 'ai' | 'lead') => {
    setMobilePanel(p);
  }, []);

  const handleShareScreen = useCallback(() => {
    if (window.electronAPI) {
      // Electron: open a real always-on-top overlay window, minimize main window to taskbar.
      window.electronAPI.launchOverlay();
      window.electronAPI.minimizeMain();
    } else {
      // Web fallback: collapse to in-app floating bubble.
      setMinimized(true);
    }
  }, []);

  useEffect(() => {
    if (!minimized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMinimized(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [minimized]);

  const latestSuggestion = allSuggestions.length > 0 ? allSuggestions[allSuggestions.length - 1] : null;
  const stageLabelMap: Record<string, string> = {
    opener: 'OPENER', discovery: 'DISCOVERY', pitch: 'PITCH', close: 'CLOSE',
  };
  const suggestionTypeLabel: Record<string, string> = {
    'objection-response': 'HANDLE OBJECTION',
    'close-attempt':      'CLOSE',
    'tip':                'NEXT MOVE',
    'discovery':          'GO DEEPER',
  };

  return (
    <div className="live-call">
      {draftRecovery && (
        <div className="live-call__recovery-banner">
          <span>↺ {t.liveCall.draftFound(new Date(draftRecovery.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</span>
          <button
            className="live-call__recovery-btn live-call__recovery-btn--restore"
            aria-label="Restore unsaved transcript"
            onClick={handleRestoreDraft}
          >{t.liveCall.draftRestore}</button>
          <button
            className="live-call__recovery-btn live-call__recovery-btn--dismiss"
            aria-label="Dismiss unsaved transcript"
            onClick={handleDismissDraft}
          >{t.liveCall.draftDismiss}</button>
        </div>
      )}
      {!minimized && (
        <>
          <Header
            prospectName={config.prospectName}
            company={config.company}
            onEndCall={handleEndCall}
            onMinimize={handleShareScreen}
          />
          <StatusBar
            status={callStatus}
            formattedTime={formattedTime}
            objectionsCount={objectionsCount}
            closeProbability={closeProbability}
          />
          {micWarning && (
            <div className="livecall__mic-warning">
              ⚠ {t.liveCall.micUnavailable}
            </div>
          )}
          {recordingError && (
            <div className="livecall__mic-warning">
              ⚠ {recordingError}
            </div>
          )}
          {cameraError && (
            <div className="livecall__mic-warning">
              ⚠ {t.liveCall.bodyUnavailable(cameraError)}
            </div>
          )}
          <div className="live-call__panels" data-mobile={mobilePanel}>
            <ErrorBoundary>
              <TranscriptPanel
                entries={transcript}
                isListening={isListening}
                interimText={interimText}
                errorMessage={errorMessage}
                onFlipSpeaker={handleFlipSpeaker}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <AIIntelligencePanel
                suggestions={allSuggestions}
                callStage={callStage}
                phaseLabel={phaseLabel}
                prospectTone={prospectTone}
                elapsedSeconds={elapsedSeconds}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <LeadProfilePanel
                config={config}
                closeProbability={closeProbability}
                objectionsCount={objectionsCount}
                notes={notes}
                noteInput={noteInput}
                onNoteChange={setNoteInput}
                onAddNote={handleAddNote}
              />
            </ErrorBoundary>
          </div>
          <div className="live-call__mobile-tabs" role="tablist" aria-label="Panel tabs">
            {(['transcript', 'ai', 'lead'] as const).map(p => (
              <button
                key={p}
                role="tab"
                aria-selected={mobilePanel === p}
                className={`live-call__mobile-tab ${mobilePanel === p ? 'live-call__mobile-tab--active' : ''}`}
                onClick={() => handleMobileTabChange(p)}
              >
                {p === 'transcript' ? `⊟ ${t.liveCall.transcript}` : p === 'ai' ? `◈ ${t.liveCall.aiSuggestions}` : `◉ ${t.liveCall.profile}`}
              </button>
            ))}
          </div>
        </>
      )}

      {minimized && (
        <div ref={bubbleRef} className="live-call__bubble" role="dialog" aria-label="Live call assistant" aria-modal="false">
          <div className="live-call__bubble-bar" onMouseDown={handleBubbleDragStart}>
            <div className="live-call__bubble-brand">
              <span className="live-call__bubble-dot" />
              <span className="live-call__bubble-logo">
                PITCHBASE
              </span>
              {config.prospectName && (
                <span className="live-call__bubble-prospect">· {config.prospectName}</span>
              )}
            </div>
            <div className="live-call__bubble-stats">
              <span className="live-call__bubble-stage">{stageLabelMap[callStage] ?? callStage.toUpperCase()}</span>
              <span className="live-call__bubble-prob">{closeProbability}%</span>
            </div>
            <div className="live-call__bubble-actions">
              <button
                className="live-call__bubble-restore"
                onClick={() => setMinimized(false)}
                aria-label="Restore full view"
                title="Restore full view"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="live-call__bubble-end" onClick={handleEndCall} aria-label="End call">
                ■ End
              </button>
            </div>
          </div>
          {latestSuggestion ? (
            <div className="live-call__bubble-suggestion">
              {latestSuggestion.physicalAction && (
                <div className="live-call__bubble-do">
                  <span className="live-call__bubble-do-label">DO</span>
                  <span className="live-call__bubble-do-text">{latestSuggestion.physicalAction}</span>
                </div>
              )}
              {latestSuggestion.body && (
                <div className="live-call__bubble-say">
                  <span className="live-call__bubble-suggestion-label">
                    {latestSuggestion.physicalAction ? 'SAY' : (suggestionTypeLabel[latestSuggestion.type] ?? 'NEXT')}
                  </span>
                  <span className="live-call__bubble-suggestion-text">
                    {latestSuggestion.body.split('\n\n')[0]}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="live-call__bubble-listening">
              <span className="live-call__bubble-mic-pulse" />
              {t.liveCall.listeningBubble}
            </div>
          )}
        </div>
      )}

      {isSummarising && (
        <div className="live-call__summarising-overlay" role="status" aria-live="polite">
          <div className="live-call__summarising-spinner" />
          <p className="live-call__summarising-text">{t.liveCall.generatingReport}</p>
        </div>
      )}
    </div>
  );
}
