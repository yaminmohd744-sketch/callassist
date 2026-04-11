import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Header } from '../components/layout/Header';
import { StatusBar } from '../components/layout/StatusBar';
import { TranscriptPanel } from '../components/panels/TranscriptPanel';
import { AIIntelligencePanel } from '../components/panels/AIIntelligencePanel';
import { LeadProfilePanel } from '../components/panels/LeadProfilePanel';
import { useCallTimer } from '../hooks/useCallTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAICoach } from '../hooks/useAICoach';
import { useAudioTone } from '../hooks/useAudioTone';
import { generateSessionSummary, classifySignalAI } from '../lib/ai';
import { OBJECTION_KEYWORDS, BUYING_KEYWORDS, PROSPECT_PHRASES, REP_PHRASES, PROSPECT_REACTIONS } from '../lib/keywords';
import type { CallConfig, CallSession, CallStatus, QuickAction, TranscriptEntry, TranscriptSignal } from '../types';
import './LiveCallScreen.css';

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function classifySignal(text: string): TranscriptSignal {
  const lower = text.toLowerCase();
  if (OBJECTION_KEYWORDS.some(k => lower.includes(k))) return 'objection';
  if (BUYING_KEYWORDS.some(k => lower.includes(k))) return 'buying-signal';
  return 'neutral';
}

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

  const { elapsedSeconds, formattedTime, startTimer, stopTimer } = useCallTimer();

  // For non-English calls, patch the signal on an existing entry after the AI classifies it.
  const applySignal = useCallback((id: string, text: string) => {
    if (config.language === 'en-US') return; // English uses fast keyword matching — no AI needed
    classifySignalAI(text, config.language ?? 'en-US').then(signal => {
      setTranscript(prev => {
        const updated = prev.map(e => e.id === id ? { ...e, signal } : e);
        transcriptRef.current = updated;
        return updated;
      });
    });
  }, [config.language]);
  const { suggestions, closeProbability, callStage, objectionsCount, processEntry, addQuickActionSuggestion } = useAICoach();
  const {
    tone: prospectTone,
    coaching: toneCoaching,
    startCapture: startToneCapture,
    stopCapture: stopToneCapture,
  } = useAudioTone({ prospectName: config.prospectName, callGoal: config.callGoal, yourPitch: config.yourPitch });

  // Automatically classify each mic utterance as rep or prospect based on content.
  // Only prospect entries trigger AI analysis.
  const handleFinalTranscript = useCallback((text: string) => {
    const isFirst = transcriptRef.current.length === 0;
    const mentionsProspect = config.prospectName.trim().length > 0 &&
      text.toLowerCase().includes(config.prospectName.trim().toLowerCase());
    const speaker = (isFirst || mentionsProspect) ? 'rep' : classifySpeaker(text, transcriptRef.current);
    const entry: TranscriptEntry = {
      id: genId(),
      speaker,
      text,
      timestampSeconds: elapsedSeconds,
      signal: speaker === 'prospect' ? classifySignal(text) : 'neutral',
    };
    const newTranscript = [...transcriptRef.current, entry];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
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
    // Run once on mount to start the call immediately. startTimer and
    // startListening are stable callback refs that never change identity, so
    // omitting them from the dep array is intentional — re-running this effect
    // would restart the timer and mic mid-call.
    setCallStatus('active');
    startTimer();
    startListening();
    startToneCapture();
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
        const flipped = e.speaker === 'rep' ? 'prospect' : 'rep';
        return { ...e, speaker: flipped, signal: flipped === 'prospect' ? classifySignal(e.text) : 'neutral' as const };
      });
      transcriptRef.current = updated;
      // Re-run AI for the flipped entry if it became a prospect entry
      const flippedEntry = updated.find(e => e.id === id);
      if (flippedEntry?.speaker === 'prospect') {
        processEntry(flippedEntry, updated, flippedEntry.timestampSeconds, config);
        applySignal(flippedEntry.id, flippedEntry.text);
      }
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
    stopToneCapture();
    stopTimer();
    const { aiSummary, followUpEmail, leadScore } = await generateSessionSummary(
      config,
      transcript,
      suggestions,
      closeProbability,
      objectionsCount
    );

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
    };
    onEndCall(session);
  }, [stopListening, stopTimer, config, transcript, suggestions, closeProbability, objectionsCount, elapsedSeconds, callStage, notes, onEndCall]);

  return (
    <div className="live-call">
      <Header
        prospectName={config.prospectName}
        company={config.company}
        onEndCall={handleEndCall}
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
          suggestions={suggestions}
          callStage={callStage}
          prospectTone={prospectTone}
          toneCoaching={toneCoaching}
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
    </div>
  );
}
