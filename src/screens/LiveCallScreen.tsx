import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { StatusBar } from '../components/layout/StatusBar';
import { TranscriptPanel } from '../components/panels/TranscriptPanel';
import { AIIntelligencePanel } from '../components/panels/AIIntelligencePanel';
import { LeadProfilePanel } from '../components/panels/LeadProfilePanel';
import { useCallTimer } from '../hooks/useCallTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAICoach } from '../hooks/useAICoach';
import { useAudioTone } from '../hooks/useAudioTone';
import { generateSessionSummary } from '../lib/ai';
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

// Classify who is speaking based on content + conversational context.
// Prospect: asks about price/product, raises objections, reacts to the rep's pitch.
// Rep: pitches, introduces themselves, asks discovery questions.
function classifySpeaker(text: string, history: TranscriptEntry[]): 'rep' | 'prospect' {
  const lower = text.toLowerCase();
  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  const prevSpeaker = lastEntry?.speaker ?? null;
  const wordCount = lower.trim().split(/\s+/).length;

  // ── Strong prospect signals ───────────────────────────────────────────────
  const prospectPhrases = [
    // Price & cost questions
    'how much', "what's the price", 'what does it cost', 'cost per', 'pricing', 'how expensive',
    'what would it cost', "what's the cost",
    // Asking about the product
    'how does it work', 'tell me more', 'what does it do', "what's included", 'can it do',
    'does it integrate', 'does it work with', 'can you show', 'can we see a demo',
    'how long does it take', 'what kind of',
    // Objections
    'not interested', 'not right now', 'not the right time', 'no thanks', 'not a good fit',
    'already have', 'already using', 'using another', 'we have a', 'we use a',
    'too expensive', 'too costly', "can't afford", 'no budget', 'no money', 'out of budget',
    'send me info', 'send an email', 'too busy', 'call me back',
    'need to think', 'talk to my boss', 'let me check', 'not sure about',
    // Buying signals
    'sounds good', 'sounds interesting', "i'm interested", "we're interested",
    'how soon can you', "let's do it", 'sign me up',
    // Prospect talking about their own company/situation
    'we currently', "we're currently", 'our team', 'our company', 'our business',
    "we've been", "we're looking", 'we need', 'we want', 'my team', 'my company',
    "we don't", 'we do', "i don't", "i'm not sure",
    // Permission / "go ahead" reactions (prospect responding to rep's pitch)
    'let me hear', 'let me hear it', 'go ahead', 'go on', "i'm listening",
    "you've got", 'you have my', 'make it quick', 'make it fast',
    "i'll give you", 'go for it', 'fair enough', 'alright then',
    // Identification challenges
    'what is it', 'what do you want', "what's this about", "what's it about",
    'who is this', "who's this", 'who are you', 'how did you get',
    // Availability dismissals
    'not a good time', 'bad time', 'not the best time',
    "i'm in a meeting", "i'm driving", "i'm with",
  ];

  // ── Strong rep signals ────────────────────────────────────────────────────
  const repPhrases = [
    // Introducing / opening
    "i'm calling", "i'm reaching out", 'my name is', 'i work at', "i'm from",
    'the reason i\'m calling', 'i wanted to', "i'd like to", "i'd love to",
    // Pitching the product/company
    'our platform', 'our product', 'our solution', 'our service', 'our software', 'our tool',
    'what we do', 'we help', 'we work with', 'we specialize', "we've helped",
    "we've been working", 'we partner',
    // Explaining / presenting
    'let me explain', 'the way it works', 'to give you an idea',
    'what that means', 'the benefit is', 'what this allows', 'for example',
    'imagine being able to',
    // Discovery questions (rep asking about prospect)
    "what's your current", 'how are you currently', 'what challenges', 'are you currently',
    'how do you currently', 'what would it mean', 'would it be helpful', 'what are you using',
    "what's your biggest", 'how does your team',
    // Closing / scheduling
    'can we set aside', 'can we schedule', 'do you have time', 'do you have a few',
    'ten minutes', 'fifteen minutes', 'quick call', 'quick chat',
    'would you be open', 'would it make sense', 'are you open to',
    'does that make sense', 'can i share', 'can i show you', 'let me share',
    "i'm calling from", 'calling from',
  ];

  if (prospectPhrases.some(p => lower.includes(p))) return 'prospect';
  if (repPhrases.some(p => lower.includes(p))) return 'rep';

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
    const prospectReactions = [
      'ok', 'okay', 'sure', 'alright', 'right', 'yeah', 'yes', 'fine', 'yep',
      'i see', 'i hear', 'understood', 'interesting', 'really', 'uh huh', 'mm',
      'how so', 'what do you mean', 'go on', 'tell me', 'i got it',
    ];
    if (prospectReactions.some(r => lower.includes(r))) return 'prospect';
  }

  // Default to rep - reps tend to speak more during cold calls
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
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'transcript' | 'ai' | 'lead'>('transcript');
  const [overlayOpen, setOverlayOpen] = useState(false);

  const { elapsedSeconds, formattedTime, startTimer, stopTimer } = useCallTimer();
  const { suggestions, closeProbability, callStage, objectionsCount, processEntry, addQuickActionSuggestion } = useAICoach();
  const { isCapturing: isAudioCapturing, tone: prospectTone, coaching: toneCoaching, permissionError: tonePermissionError, startCapture, stopCapture } = useAudioTone({
    prospectName: config.prospectName,
    callGoal: config.callGoal,
    yourPitch: config.yourPitch,
  });

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
    }
  }, [elapsedSeconds, processEntry, config]);

  const { isListening, interimText, errorMessage, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
    language: config.language ?? 'en-US',
  });

  useEffect(() => {
    setCallStatus('active');
    startTimer();
    startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep overlay in sync with latest AI data
  useEffect(() => {
    if (overlayOpen && window.electronAPI) {
      window.electronAPI.sendSuggestionsToOverlay({
        suggestions,
        closeProbability,
        callStage,
        prospectName: config.prospectName,
      });
    }
  }, [suggestions, closeProbability, callStage, overlayOpen, config.prospectName]);

  // Sync overlay state if user closes it from the overlay itself
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onOverlayClosed(() => setOverlayOpen(false));
    return cleanup;
  }, []);

  async function handleToggleOverlay() {
    if (!window.electronAPI) return;
    const isNowOpen = await window.electronAPI.toggleOverlay();
    setOverlayOpen(isNowOpen);
  }

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

  function handleAddNote() {
    const text = noteInput.trim();
    if (!text) return;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    setNotes(prev => [...prev, `${mins}:${secs} ${text}`]);
    setNoteInput('');
  }

  function handleQuickAction(action: QuickAction) {
    addQuickActionSuggestion(action, { prospectName: config.prospectName, callGoal: config.callGoal }, elapsedSeconds);
  }

  async function handleEndCall() {
    stopListening();
    stopTimer();
    stopCapture();
    if (overlayOpen && window.electronAPI) {
      await window.electronAPI.toggleOverlay();
      setOverlayOpen(false);
    }
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
      <div className="live-call__toolbar">
        {window.electronAPI && (
          <button
            className={`live-call__overlay-btn ${overlayOpen ? 'live-call__overlay-btn--active' : ''}`}
            onClick={handleToggleOverlay}
            title={overlayOpen ? 'Close floating overlay' : 'Open floating overlay (hidden from screen share)'}
          >
            {overlayOpen ? '◈ OVERLAY ON' : '◈ OPEN OVERLAY'}
          </button>
        )}
        <button
          className={`live-call__tone-btn ${isAudioCapturing ? 'live-call__tone-btn--active' : ''}`}
          onClick={isAudioCapturing ? stopCapture : () => void startCapture()}
          title={isAudioCapturing ? 'Stop tone analysis' : 'Capture speaker audio for live tone analysis'}
        >
          {isAudioCapturing ? (
            <><span className="live-call__tone-dot" />TONE LIVE</>
          ) : (
            <>◉ TONE ANALYSIS</>
          )}
        </button>
        {tonePermissionError && (
          <span className="live-call__tone-error">{tonePermissionError}</span>
        )}
      </div>
      <div className="live-call__panels" data-mobile={mobilePanel}>
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
            {p === 'transcript' ? '⊟ TRANSCRIPT' : p === 'ai' ? '◈ AI COACH' : '◉ PROFILE'}
          </button>
        ))}
      </div>
    </div>
  );
}
