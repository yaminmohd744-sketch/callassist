import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { StatusBar } from '../components/layout/StatusBar';
import { TranscriptPanel } from '../components/panels/TranscriptPanel';
import { AIIntelligencePanel } from '../components/panels/AIIntelligencePanel';
import { LeadProfilePanel } from '../components/panels/LeadProfilePanel';
import { useCallTimer } from '../hooks/useCallTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAICoach } from '../hooks/useAICoach';
import { generateSessionSummary } from '../lib/mockAI';
import type { CallConfig, CallSession, CallStatus, QuickAction, TranscriptEntry, TranscriptSignal } from '../types';
import './LiveCallScreen.css';

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function classifySignal(text: string): TranscriptSignal {
  const lower = text.toLowerCase();
  const objectionKeywords = ['too expensive', 'too costly', 'too high', 'price is too', 'costs too much', "can't afford", 'out of budget', 'not in the budget', 'not interested', 'not right now', 'not the right time', 'no thanks', 'not a good fit', 'no budget', 'no money', 'already have', 'using another', 'send me info', 'send an email', 'too busy', 'call me back', 'need to think', 'talk to my boss'];
  const buyingKeywords = ['interested', 'tell me more', 'how much', 'how does it work', 'when can', 'sounds good', 'makes sense', 'can you', "what's included"];
  if (objectionKeywords.some(k => lower.includes(k))) return 'objection';
  if (buyingKeywords.some(k => lower.includes(k))) return 'buying-signal';
  return 'neutral';
}

interface LiveCallScreenProps {
  config: CallConfig;
  onEndCall: (session: CallSession) => void;
}

export function LiveCallScreen({ config, onEndCall }: LiveCallScreenProps) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('standby');
  const [manualInput, setManualInput] = useState('');

  const { elapsedSeconds, formattedTime, startTimer, stopTimer } = useCallTimer();
  const { suggestions, closeProbability, callStage, objectionsCount, processEntry, addQuickActionSuggestion } = useAICoach();

  const handleFinalTranscript = useCallback((text: string) => {
    // Everything the mic picks up is treated as the prospect speaking.
    // Diarization on a single mic is unreliable — rep can log their own
    // lines via the text input below the transcript.
    const entry: TranscriptEntry = {
      id: genId(),
      speaker: 'prospect',
      text,
      timestampSeconds: elapsedSeconds,
      signal: classifySignal(text),
    };
    const newTranscript = [...transcriptRef.current, entry];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
    processEntry(entry, newTranscript, elapsedSeconds, config);
  }, [elapsedSeconds, processEntry, config]);

  const { isListening, interimText, errorMessage, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
  });

  // Auto-start mic and timer as soon as the live call screen mounts
  useEffect(() => {
    setCallStatus('active');
    startTimer();
    startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManualSubmit() {
    const text = manualInput.trim();
    if (!text) return;

    const entry: TranscriptEntry = {
      id: genId(),
      speaker: 'prospect',
      text,
      timestampSeconds: elapsedSeconds,
      signal: classifySignal(text),
    };

    const newTranscript = [...transcriptRef.current, entry];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
    processEntry(entry, newTranscript, elapsedSeconds, config);
    setManualInput('');
  }

  function handleQuickAction(action: QuickAction) {
    addQuickActionSuggestion(action, { prospectName: config.prospectName, callGoal: config.callGoal }, elapsedSeconds);
  }

  function handleEndCall() {
    stopListening();
    stopTimer();
    const { aiSummary, followUpEmail, leadScore } = generateSessionSummary(
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
    };
    onEndCall(session);
  }

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
      <div className="live-call__panels">
        <TranscriptPanel
          entries={transcript}
          isListening={isListening}
          interimText={interimText}
          errorMessage={errorMessage}
          manualInput={manualInput}
          onManualInputChange={setManualInput}
          onManualSubmit={handleManualSubmit}
        />
        <AIIntelligencePanel
          suggestions={suggestions}
          callStage={callStage}
        />
        <LeadProfilePanel
          config={config}
          closeProbability={closeProbability}
          objectionsCount={objectionsCount}
          onAction={handleQuickAction}
        />
      </div>
    </div>
  );
}
