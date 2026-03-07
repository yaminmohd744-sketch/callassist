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

// Classify who is speaking based on content.
// Prospect: asks about price/product, raises objections, talks about their own company/situation.
// Rep: pitches, introduces themselves, talks about their product, asks discovery questions.
function classifySpeaker(text: string): 'rep' | 'prospect' {
  const lower = text.toLowerCase();

  // ── Strong prospect signals ───────────────────────────────────────────────
  const prospectPhrases = [
    // Price & cost questions
    'how much', "what's the price", 'what does it cost', 'cost per', 'pricing', 'how expensive',
    'what would it cost', 'what\'s the cost',
    // Asking about the product
    'how does it work', 'tell me more', 'what does it do', "what's included", 'can it do',
    'does it integrate', 'does it work with', 'can you show', 'can we see a demo',
    'how long does it take', 'how many', 'what kind of',
    // Objections
    'not interested', 'not right now', 'not the right time', 'no thanks', 'not a good fit',
    'already have', 'already using', 'using another', 'we have a', 'we use a',
    'too expensive', 'too costly', "can't afford", 'no budget', 'no money', 'out of budget',
    'send me info', 'send an email', 'too busy', 'call me back',
    'need to think', 'talk to my boss', 'let me check', 'not sure about',
    // Buying signals
    'sounds good', 'sounds interesting', 'i\'m interested', 'we\'re interested',
    'how soon can you', 'let\'s do it', 'sign me up',
    // Prospect talking about their own company/situation
    'we currently', 'we\'re currently', 'our team', 'our company', 'our business',
    'we\'ve been', 'we\'re looking', 'we need', 'we want', 'my team', 'my company',
    'we don\'t', 'we do', 'i don\'t', 'i\'m not sure',
    // Prospect short stalls / dismissals / permission (the hardest to catch without context)
    'make it quick', 'make it fast',
    'go ahead', 'go on', 'i\'m listening', 'you have', 'you\'ve got',
    'what is it', 'what do you want', 'what\'s this about', 'what\'s it about',
    'who is this', "who's this", 'who are you', 'who do you want', 'how did you get',
    'not a good time', 'bad time', 'not the best time',
    'i\'m in a meeting', 'i\'m driving', 'i\'m with',
  ];

  // ── Strong rep signals ────────────────────────────────────────────────────
  const repPhrases = [
    // Introducing / opening
    'i\'m calling', 'i\'m reaching out', 'my name is', 'i work at', 'i\'m from', 'this is',
    'the reason i\'m calling', 'i wanted to', 'i\'d like to', 'i\'d love to',
    // Pitching the product/company
    'our platform', 'our product', 'our solution', 'our service', 'our software', 'our tool',
    'what we do', 'we help', 'we work with', 'we specialize', 'we\'ve helped',
    'we\'ve been working', 'we partner',
    // Explaining / presenting
    'let me explain', 'basically', 'the way it works', 'to give you an idea',
    'what that means', 'the benefit is', 'what this allows', 'for example',
    'imagine being able to', 'think about',
    // Discovery questions (rep asking about prospect)
    'what\'s your current', 'how are you currently', 'what challenges', 'are you currently',
    'how do you currently', 'what would it mean', 'would it be helpful', 'what are you using',
    'how many people', 'what\'s your biggest', 'how does your team',
    // Closing / scheduling (rep asking for time or commitment)
    'can we set aside', 'can we find', 'can we schedule', 'could we set aside',
    'do you have time', 'do you have a few', 'do you have ten', 'do you have five',
    'ten minutes', 'fifteen minutes', 'quick call', 'quick chat', 'quick conversation',
    'would you be open', 'would it make sense', 'are you open to',
    'does that sound', 'does that make sense', 'what would it take',
    'can i share', 'can i show you', 'could i show', 'let me share',
    'i\'m yaman', 'i\'m calling from', 'calling from',
  ];

  if (prospectPhrases.some(p => lower.includes(p))) return 'prospect';
  if (repPhrases.some(p => lower.includes(p))) return 'rep';

  // Short questions (≤ 7 words, ends with ?) → likely a brief prospect query (e.g. "How much?")
  // Threshold kept tight so longer rep sentences (closing questions, etc.) fall through to default.
  const wordCount = lower.trim().split(/\s+/).length;
  if (lower.trimEnd().endsWith('?') && wordCount <= 4) return 'prospect';

  // Default to rep — reps talk more during a cold call
  return 'rep';
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

  // Automatically classify each mic utterance as rep or prospect based on content.
  // Only prospect entries trigger AI analysis.
  const handleFinalTranscript = useCallback((text: string) => {
    const isFirst = transcriptRef.current.length === 0;
    const mentionsProspect = config.prospectName.trim().length > 0 &&
      text.toLowerCase().includes(config.prospectName.trim().toLowerCase());
    const speaker = (isFirst || mentionsProspect) ? 'rep' : classifySpeaker(text);
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
    }
  }, [elapsedSeconds, processEntry, config]);

  const { isListening, interimText, errorMessage, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
  });

  useEffect(() => {
    setCallStatus('active');
    startTimer();
    startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManualSubmit() {
    const text = manualInput.trim();
    if (!text) return;

    // Manual input is always treated as prospect speech
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
