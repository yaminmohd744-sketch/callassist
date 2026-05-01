import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo, type MouseEvent as ReactMouseEvent } from 'react';
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
import type { CallConfig, CallSession, CallStatus, QuickAction, TranscriptEntry, TranscriptSpeaker } from '../types';
import { genId } from '../lib/id';
import { saveDraft, loadDraft, clearDraft } from '../lib/callDraft';
import { useCallRecorder } from '../hooks/useCallRecorder';
import { useBodyLanguage } from '../hooks/useBodyLanguage';
import type { AISuggestion } from '../types';
import './LiveCallScreen.css';

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
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('standby');
  const [manualInput, setManualInput] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'transcript' | 'ai' | 'lead'>('transcript');
  const [manualSpeaker, setManualSpeaker] = useState<'rep' | 'prospect'>('prospect');
  const [isSummarising, setIsSummarising] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [draftRecovery, setDraftRecovery] = useState<{ transcript: TranscriptEntry[]; startedAt: string } | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const recordingKeyRef = useRef(startedAtRef.current);
  const { startRecording, stopRecording, isSupported: recordingSupported } = useCallRecorder();
  const [bodySuggestions, setBodySuggestions] = useState<AISuggestion[]>([]);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const flipDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakerLockedRef = useRef(false);
  const dgSpeakerMapRef = useRef<Map<number, TranscriptSpeaker> | null>(null);
  const repWordsRef = useRef(0);
  const prospectWordsRef = useRef(0);
  const [, setFillerCount] = useState(0);

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
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  const { elapsedSeconds, formattedTime, startTimer, stopTimer } = useCallTimer();
  const signalAbortRef = useRef<AbortController | null>(null);

  // For non-English calls, patch the signal on an existing entry after the AI classifies it.
  const applySignal = useCallback((id: string, text: string) => {
    if (config.language === 'en-US') return; // English uses fast keyword matching — no AI needed
    signalAbortRef.current?.abort();
    const ctrl = new AbortController();
    signalAbortRef.current = ctrl;
    classifySignalAI(text, config.language ?? 'en-US', ctrl.signal).then(signal => {
      if (ctrl.signal.aborted) return;
      setTranscript(prev => {
        const updated = prev.map(e => e.id === id ? { ...e, signal } : e);
        transcriptRef.current = updated;
        return updated;
      });
    }).catch(() => { /* aborted — ignore */ });
  }, [config.language]);
  const { suggestions, phaseLabel, prospectTone, closeProbability, callStage, objectionsCount, processEntry, addQuickActionSuggestion, reset: resetCoach } = useAICoach();

  const latestAIScript = suggestions.length > 0 ? suggestions[suggestions.length - 1].body : undefined;
  const onBodySuggestion = useCallback((s: AISuggestion) => {
    setBodySuggestions(prev => [...prev.slice(-9), s]);
  }, []);
  useBodyLanguage({
    isActive: callStatus === 'active',
    elapsedSeconds,
    currentScript: latestAIScript,
    onSuggestion: onBodySuggestion,
  });

  const allSuggestions = useMemo(() => {
    return [...suggestions, ...bodySuggestions]
      .sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  }, [suggestions, bodySuggestions]);

  const FILLER_WORDS = ['um', 'uh', ' like ', 'you know', 'basically', 'literally', 'sort of', 'kind of', 'i mean', 'right?'];

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

    // Track talk time (word counts per speaker)
    const wordCount = text.trim().split(/\s+/).length;
    if (speaker === 'rep') {
      repWordsRef.current += wordCount;
      // Track filler words
      const lower = text.toLowerCase();
      const fillers = FILLER_WORDS.filter(f => lower.includes(f)).length;
      if (fillers > 0) setFillerCount(c => c + fillers);
    } else if (speaker === 'prospect') {
      prospectWordsRef.current += wordCount;
    }

    if (speaker === 'prospect') {
      processEntry(entry, newTranscript, elapsedSeconds, config);
      applySignal(entry.id, text);
    }
  }, [elapsedSeconds, processEntry, config, applySignal]);

  const { isListening, interimText, errorMessage, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
    language: config.language ?? 'en-US',
  });

  useEffect(() => {
    // Reset AI coach so each new call starts with a clean slate.
    resetCoach();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for a crash-recovery draft on mount
  useEffect(() => {
    loadDraft().then(draft => {
      if (!draft || draft.transcript.length === 0) return;
      setDraftRecovery({ transcript: draft.transcript, startedAt: draft.startedAt });
    }).catch(() => { /* IndexedDB unavailable — silent */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft to IndexedDB every 10 seconds during an active call
  useEffect(() => {
    if (callStatus !== 'active') return;
    const id = setInterval(() => {
      saveDraft({
        config,
        transcript: transcriptRef.current,
        suggestions,
        startedAt: startedAtRef.current,
        savedAt: new Date().toISOString(),
      }).catch(() => { /* silent */ });
    }, 10_000);
    return () => clearInterval(id);
  }, [callStatus, config, suggestions]);

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
    setCallStatus('active');
    startTimer();
    startListening();
    if (recordingSupported) startRecording();
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = useCallback(() => {
    const text = manualInput.trim();
    if (!text) return;

    const entry: TranscriptEntry = {
      id: genId(),
      speaker: manualSpeaker,
      text,
      timestampSeconds: elapsedSeconds,
      signal: manualSpeaker === 'prospect' ? classifySignal(text) : 'neutral',
    };

    const newTranscript = [...transcriptRef.current, entry];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);

    const wc = text.trim().split(/\s+/).length;
    if (manualSpeaker === 'rep') {
      repWordsRef.current += wc;
      const lower = text.toLowerCase();
      const fillers = FILLER_WORDS.filter(f => lower.includes(f)).length;
      if (fillers > 0) setFillerCount(c => c + fillers);
    } else if (manualSpeaker === 'prospect') {
      prospectWordsRef.current += wc;
    }

    if (manualSpeaker === 'prospect') {
      processEntry(entry, newTranscript, elapsedSeconds, config);
      applySignal(entry.id, text);
    }
    setManualInput('');
  }, [manualInput, manualSpeaker, elapsedSeconds, processEntry, config, applySignal]);

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
          processEntry(flippedEntry, updated, flippedEntry.timestampSeconds, config);
          applySignal(flippedEntry.id, flippedEntry.text);
        }, 400);
      }
      speakerLockedRef.current = false;
      dgSpeakerMapRef.current = null;
      return updated;
    });
  }, [processEntry, config, applySignal]);

  const handleAddNote = useCallback(() => {
    const text = noteInput.trim();
    if (!text) return;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    setNotes(prev => [...prev, `${mins}:${secs} ${text}`]);
    setNoteInput('');
  }, [noteInput, elapsedSeconds]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    addQuickActionSuggestion(action, { prospectName: config.prospectName, callGoal: config.callGoal }, elapsedSeconds);
  }, [addQuickActionSuggestion, config.prospectName, config.callGoal, elapsedSeconds]);

  const handleEndCall = useCallback(async () => {
    stopListening();
    stopTimer();
    await stopRecording(recordingKeyRef.current);
    window.electronAPI?.closeOverlay();
    setIsSummarising(true);
    try {
      const { aiSummary, followUpEmail, leadScore, coaching } = await generateSessionSummary(
        config,
        transcript,
        suggestions,
        closeProbability,
        objectionsCount
      );

      localStorage.setItem('pitchbase:nextCallTip', coaching.nextCallTip);
      clearDraft().catch(() => { /* silent */ });

      const totalWords = repWordsRef.current + prospectWordsRef.current;
      const talkRatio = totalWords > 0 ? repWordsRef.current / totalWords : 0.5;

      const session: CallSession = {
        config,
        transcript,
        suggestions,
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
      const totalWords = repWordsRef.current + prospectWordsRef.current;
      onEndCall({
        config, transcript, suggestions,
        durationSeconds: elapsedSeconds,
        finalCloseProbability: closeProbability,
        objectionsCount, callStage,
        endedAt: new Date().toISOString(),
        aiSummary: '', followUpEmail: '', leadScore: 0,
        notes,
        talkRatio: totalWords > 0 ? repWordsRef.current / totalWords : 0.5,
        coaching: undefined,
      });
    } finally {
      setIsSummarising(false);
    }
  }, [stopListening, stopTimer, config, transcript, suggestions, closeProbability, objectionsCount, elapsedSeconds, callStage, notes, onEndCall]);

  // Keep a stable ref so the overlay's trigger-end-call listener always calls the latest version.
  const handleEndCallRef = useRef(handleEndCall);
  useLayoutEffect(() => { handleEndCallRef.current = handleEndCall; });

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

  const latestSuggestion = allSuggestions.length > 0 ? allSuggestions[allSuggestions.length - 1] : null;
  const stageLabelMap: Record<string, string> = {
    opener: 'OPENER', discovery: 'DISCOVERY', pitch: 'PITCH', close: 'CLOSE',
  };
  const suggestionTypeLabel: Record<string, string> = {
    'objection-response': 'HANDLE',
    'close-attempt': 'CLOSE',
    'tip': 'NEXT',
    'discovery': 'DEEPER',
  };

  return (
    <div className="live-call">
      {draftRecovery && (
        <div className="live-call__recovery-banner">
          <span>↺ Unsaved transcript found from {new Date(draftRecovery.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — restore it?</span>
          <button className="live-call__recovery-btn live-call__recovery-btn--restore" onClick={() => {
            setTranscript(draftRecovery.transcript);
            transcriptRef.current = draftRecovery.transcript;
            setDraftRecovery(null);
          }}>Restore</button>
          <button className="live-call__recovery-btn live-call__recovery-btn--dismiss" onClick={() => {
            clearDraft().catch(() => {});
            setDraftRecovery(null);
          }}>Dismiss</button>
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
          <div className="live-call__panels" data-mobile={mobilePanel}>
            <TranscriptPanel
              entries={transcript}
              isListening={isListening}
              interimText={interimText}
              errorMessage={errorMessage}
              manualInput={manualInput}
              onManualInputChange={setManualInput}
              onManualSubmit={handleManualSubmit}
              onFlipSpeaker={handleFlipSpeaker}
              manualSpeaker={manualSpeaker}
              onManualSpeakerToggle={() => setManualSpeaker(s => s === 'prospect' ? 'rep' : 'prospect')}
            />
            <AIIntelligencePanel
              suggestions={allSuggestions}
              callStage={callStage}
              phaseLabel={phaseLabel}
              prospectTone={prospectTone}
            />
            <LeadProfilePanel
              config={config}
              closeProbability={closeProbability}
              objectionsCount={objectionsCount}
              onAction={handleQuickAction}
              notes={notes}
              noteInput={noteInput}
              onNoteChange={setNoteInput}
              onAddNote={handleAddNote}
            />
          </div>
          <div className="live-call__mobile-tabs">
            {(['transcript', 'ai', 'lead'] as const).map(p => (
              <button
                key={p}
                className={`live-call__mobile-tab ${mobilePanel === p ? 'live-call__mobile-tab--active' : ''}`}
                onClick={() => setMobilePanel(p)}
              >
                {p === 'transcript' ? `⊟ ${t.liveCall.transcript}` : p === 'ai' ? `◈ ${t.liveCall.aiSuggestions}` : '◉ PROFILE'}
              </button>
            ))}
          </div>
        </>
      )}

      {minimized && (
        <div ref={bubbleRef} className="live-call__bubble">
          <div className="live-call__bubble-bar" onMouseDown={handleBubbleDragStart}>
            <div className="live-call__bubble-brand">
              <span className="live-call__bubble-dot" />
              <span className="live-call__bubble-logo">
                PITCH<span className="lp__logo-plus">PLUS</span>
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
                title="Restore full view"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="live-call__bubble-end" onClick={handleEndCall}>
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
              Listening to your call…
            </div>
          )}
        </div>
      )}

      {isSummarising && (
        <div className="live-call__summarising-overlay" role="status" aria-live="polite">
          <div className="live-call__summarising-spinner" />
          <p className="live-call__summarising-text">Generating your coaching report…</p>
        </div>
      )}
    </div>
  );
}
