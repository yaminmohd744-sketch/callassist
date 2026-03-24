import { useState, useRef, useEffect } from 'react';
import { useTraining } from '../hooks/useTraining';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { TrainingScenario } from '../types';
import type { TrainingDifficulty } from '../hooks/useTraining';
import './TrainingScreen.css';

interface TrainingScreenProps {
  onBack: () => void;
}

const SCENARIOS: { id: TrainingScenario; label: string; description: string }[] = [
  { id: 'price-objection',  label: 'Price Objection',      description: 'Prospect says it\'s too expensive' },
  { id: 'not-interested',   label: 'Not Interested',        description: 'Prospect wants to end the call' },
  { id: 'think-it-over',    label: 'Think It Over',         description: 'Prospect is stalling for time' },
  { id: 'send-me-info',     label: 'Send Me Info',          description: 'Prospect deflects with email request' },
  { id: 'cold-opener',      label: 'Cold Opener',           description: 'Start a cold call from scratch' },
  { id: 'discovery',        label: 'Discovery',             description: 'Uncover pain points and needs' },
  { id: 'closing',          label: 'Closing',               description: 'Push for commitment at the end' },
  { id: 'random',           label: '★ Random Scenario',     description: 'AI generates a surprise situation' },
];

interface SubScenario {
  id: string;
  label: string;
  description: string;
  difficulty: TrainingDifficulty;
  prompt: string;
}

const SUB_SCENARIOS: Record<TrainingScenario, SubScenario[]> = {
  'price-objection': [
    { id: 'po-easy',   label: 'Sticker Shock',     difficulty: 'easy',   description: '"That\'s a bit more than I expected."',          prompt: 'The prospect is mildly surprised by the price but hasn\'t compared to competitors and is still interested. They just need reassurance on value.' },
    { id: 'po-medium', label: 'Over Budget',        difficulty: 'medium', description: '"We\'ve got a budget and you\'re over it."',      prompt: 'The prospect has a fixed budget that the price exceeds. They need to justify cost internally to their team.' },
    { id: 'po-hard',   label: 'Cheaper Competitor', difficulty: 'hard',   description: '"Your competitor is 40% cheaper."',               prompt: 'The prospect is actively comparing you to a named competitor who charges significantly less. They want a price match or a compelling reason to pay more.' },
  ],
  'not-interested': [
    { id: 'ni-easy',   label: 'Bad Timing',  difficulty: 'easy',   description: '"It\'s just not the right time."',         prompt: 'The prospect says it\'s not the right time, but is vague about why. They\'re not hostile — they\'re just not ready.' },
    { id: 'ni-medium', label: 'Status Quo',  difficulty: 'medium', description: '"We\'re happy with what we have."',         prompt: 'The prospect is comfortable with their current solution and sees no reason to change. They\'re politely dismissive.' },
    { id: 'ni-hard',   label: 'Hard No',     difficulty: 'hard',   description: '"Don\'t call me again."',                   prompt: 'The prospect is immediately hostile and wants to end the call. They\'ve heard pitches like this before and are actively trying to hang up.' },
  ],
  'think-it-over': [
    { id: 'tio-easy',   label: 'Sleep On It',    difficulty: 'easy',   description: '"I want to think about it overnight."',  prompt: 'The prospect likes the offer but wants a day to think. They\'re genuinely considering it, not brushing off.' },
    { id: 'tio-medium', label: 'Team Sign-Off',  difficulty: 'medium', description: '"I need to run this by my team."',       prompt: 'The prospect is personally interested but needs buy-in from others before deciding. It\'s a real blocker, not an excuse.' },
    { id: 'tio-hard',   label: 'Serial Staller', difficulty: 'hard',   description: '"I never decide on the first call."',    prompt: 'The prospect has a firm policy of never deciding on the first call. They always say they\'ll think about it. It\'s a habit, not a genuine objection.' },
  ],
  'send-me-info': [
    { id: 'smi-easy',   label: 'Genuinely Curious', difficulty: 'easy',   description: '"Send me details so I can review."',           prompt: 'The prospect is genuinely interested and wants written details to review properly before deciding. A real information request.' },
    { id: 'smi-medium', label: 'Email Deflector',   difficulty: 'medium', description: '"Just email me and I\'ll take a look."',        prompt: 'The prospect uses "send me info" as a polite way to end the conversation. They probably won\'t read it unless the rep creates urgency.' },
    { id: 'smi-hard',   label: 'Brush-Off',         difficulty: 'hard',   description: '"Send a brochure. I\'ll call if interested."',   prompt: 'The prospect is using the email request as a definitive brush-off. They have no intention of following up and are trying to end the call permanently.' },
  ],
  'cold-opener': [
    { id: 'co-easy',   label: 'Open Listener',  difficulty: 'easy',   description: '"I have a minute. What\'s this about?"',  prompt: 'The prospect is reasonably open. They\'re busy but willing to hear the rep out for a minute if it sounds relevant.' },
    { id: 'co-medium', label: 'Skeptical Pro',  difficulty: 'medium', description: '"Who is this? Make it quick."',            prompt: 'The prospect is professional but skeptical of cold calls. They give the rep 30 seconds to prove relevance before cutting them off.' },
    { id: 'co-hard',   label: 'Ten Seconds',    difficulty: 'hard',   description: '"You have 10 seconds. Go."',               prompt: 'The prospect gets dozens of cold calls. They\'re immediately defensive and give the rep a very short window — if the opener doesn\'t hook them instantly, they\'re gone.' },
  ],
  'discovery': [
    { id: 'di-easy',   label: 'Opens Up',   difficulty: 'easy',   description: '"Actually, we do have some issues."',    prompt: 'The prospect has real pain they\'re willing to discuss. They just needed someone to ask the right question. They\'re forthcoming.' },
    { id: 'di-medium', label: 'Guarded',    difficulty: 'medium', description: '"Things are fine. Why do you ask?"',     prompt: 'The prospect is guarded and doesn\'t volunteer information. They answer questions minimally and make the rep work for every insight.' },
    { id: 'di-hard',   label: 'Deflector',  difficulty: 'hard',   description: '"Just tell me what you\'re selling."',  prompt: 'The prospect refuses to answer discovery questions. They flip the conversation back, demanding the rep pitch them directly rather than doing a needs assessment.' },
  ],
  'closing': [
    { id: 'cl-easy',   label: 'Almost There',       difficulty: 'easy',   description: '"What does getting started look like?"',  prompt: 'The prospect is essentially sold. They just need a clear next step and mild reassurance to commit. Don\'t oversell.' },
    { id: 'cl-medium', label: 'Last-Minute Doubts', difficulty: 'medium', description: '"I\'m still not 100% sure."',              prompt: 'The prospect was close but has last-minute cold feet. They have a real but vague hesitation that the rep needs to surface and resolve.' },
    { id: 'cl-hard',   label: 'Moving Goalposts',   difficulty: 'hard',   description: '"Actually, one more concern..."',         prompt: 'Every time the rep addresses an objection, the prospect surfaces a new one. They keep adding concerns at the close.' },
  ],
  'random': [
    { id: 'r-easy',   label: 'Random Easy',   difficulty: 'easy',   description: 'AI generates a surprise easy scenario',    prompt: 'Generate a surprising but realistic sales situation with a prospect who is mildly resistant.' },
    { id: 'r-medium', label: 'Random Medium', difficulty: 'medium', description: 'AI generates a surprise medium scenario',  prompt: 'Generate a surprising but realistic sales situation with a moderately resistant prospect.' },
    { id: 'r-hard',   label: 'Random Hard',   difficulty: 'hard',   description: 'AI generates a surprise hard scenario',    prompt: 'Generate a surprising but highly challenging sales situation with a very resistant prospect.' },
  ],
};

export function TrainingScreen({ onBack }: TrainingScreenProps) {
  const { state, startScenario, confirmContext, sendResponse, endSession, reset } = useTraining();
  const [input, setInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [selectedSub, setSelectedSub] = useState<SubScenario | null>(null);
  const [language, setLanguage] = useState('en-US');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, interimText, errorMessage: voiceError, startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      if (!state.isLoading) {
        void sendResponse(text);
      }
    },
    language: state.language,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Stop listening when leaving active phase
  useEffect(() => {
    if (state.phase !== 'active') {
      stopListening();
    }
  }, [state.phase, stopListening]);

  // Auto-start mic when session becomes active
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.phase === 'active') {
      void startListening();
    }
  }, [state.phase]);

  function handleSend() {
    const text = input.trim();
    if (!text || state.isLoading) return;
    setInput('');
    void sendResponse(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  }

  const scoredMessages = state.messages.filter(m => m.role === 'rep' && m.feedback);

  // ── Summary Screen ──────────────────────────────────────────────────────────
  if (state.phase === 'summary') {
    const score = state.overallScore ?? 0;
    const allPros = scoredMessages.flatMap(m => m.feedback?.pros ?? []);
    const allCons = scoredMessages.flatMap(m => m.feedback?.cons ?? []);

    return (
      <div className="training">
        <main className="training__main">
          <div className="training__summary">
            <div className="training__summary-header">
              <h2 className="training__summary-title">Session Complete</h2>
              <p className="training__summary-sub">
                {SCENARIOS.find(s => s.id === state.scenario)?.label ?? 'Training'} — {scoredMessages.length} exchange{scoredMessages.length !== 1 ? 's' : ''} scored
              </p>
            </div>

            <div className="training__score-block">
              <div className="training__score-value">{score.toFixed(1)}<span>/10</span></div>
              <div className="training__score-bar">
                <div className="training__score-fill" style={{ width: `${score * 10}%`, backgroundColor: score >= 7 ? 'var(--color-accent-green)' : score >= 5 ? 'var(--color-accent-yellow)' : 'var(--color-accent-red)' }} />
              </div>
              <div className="training__score-label">
                {score >= 8 ? 'Excellent — keep it up' : score >= 6 ? 'Good — a few things to sharpen' : score >= 4 ? 'Needs work — study the ideal responses' : 'Keep practicing — this takes reps'}
              </div>
            </div>

            <div className="training__summary-sections">
              {allPros.length > 0 && (
                <div className="training__summary-section training__summary-section--pros">
                  <div className="training__summary-section-title">✓ What you did well</div>
                  <ul>{allPros.slice(0, 4).map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
              {allCons.length > 0 && (
                <div className="training__summary-section training__summary-section--cons">
                  <div className="training__summary-section-title">✗ Areas to improve</div>
                  <ul>{allCons.slice(0, 4).map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
              )}
            </div>

            <div className="training__summary-actions">
              <button className="training__btn training__btn--primary" onClick={reset}>Practice Again</button>
              <button className="training__btn training__btn--ghost" onClick={onBack}>Back to Dashboard</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Context Screen ──────────────────────────────────────────────────────────
  if (state.phase === 'context') {
    const subs = state.scenario ? SUB_SCENARIOS[state.scenario] : [];

    function handleStart() {
      const sub = selectedSub ?? subs[1]; // default to medium if none selected
      void confirmContext(contextInput.trim() || 'my product/service', sub.difficulty, sub.prompt);
    }

    return (
      <div className="training">
        <main className="training__main">
          <div className="training__context">
            <div className="training__context-header">
              <span className="training__context-scenario-label">SCENARIO</span>
              <span className="training__context-scenario-name">
                {SCENARIOS.find(s => s.id === state.scenario)?.label}
              </span>
            </div>

            <div className="training__sub-scenarios">
              <div className="training__diff-label">SELECT SUB-SCENARIO</div>
              <div className="training__sub-grid">
                {subs.map(sub => (
                  <button
                    key={sub.id}
                    className={`training__sub-card training__sub-card--${sub.difficulty} ${selectedSub?.id === sub.id ? 'training__sub-card--selected' : ''}`}
                    onClick={() => setSelectedSub(sub)}
                  >
                    <div className="training__sub-header">
                      <span className="training__sub-label">{sub.label}</span>
                      <span className={`training__diff-badge training__diff-badge--${sub.difficulty}`}>
                        {sub.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <div className="training__sub-desc">{sub.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <h2 className="training__context-title">What are you selling?</h2>
            <p className="training__context-sub">
              Give the AI context so it can simulate a realistic prospect for your industry.
            </p>

            <textarea
              className="training__context-input"
              placeholder="e.g. a $485k 3-bedroom house in Miami, FL"
              value={contextInput}
              onChange={e => setContextInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
              rows={3}
              autoFocus
            />

            {state.error && <div className="training__error">{state.error}</div>}

            <div className="training__context-actions">
              <button
                className="training__btn training__btn--primary"
                onClick={handleStart}
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Setting up...' : 'Start Training →'}
              </button>
              <button className="training__btn training__btn--ghost" onClick={reset}>
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Active Session ──────────────────────────────────────────────────────────
  if (state.phase === 'active') {
    return (
      <div className="training">
        <main className="training__main training__main--active">
          <div className="training__session-header">
            <div className="training__session-info">
              <span className="training__session-label">SCENARIO</span>
              <span className="training__session-name">{SCENARIOS.find(s => s.id === state.scenario)?.label}</span>
              <span className={`training__diff-badge training__diff-badge--${state.difficulty}`}>
                {state.difficulty.toUpperCase()}
              </span>
            </div>
            <button className="training__end-btn" onClick={endSession}>End Session</button>
          </div>
          <div className="training__messages">
            {state.messages.map(msg => (
              <div key={msg.id} className={`training__msg training__msg--${msg.role}`}>
                <div className="training__msg-label">{msg.role === 'prospect' ? 'PROSPECT' : 'YOU'}</div>
                <div className="training__msg-bubble">{msg.text}</div>

                {msg.feedback && (
                  <div className="training__feedback">
                    <div className="training__feedback-score">
                      <span className="training__feedback-score-val" style={{
                        color: msg.feedback.score >= 7 ? 'var(--color-accent-green)' : msg.feedback.score >= 5 ? 'var(--color-accent-yellow)' : 'var(--color-accent-red)'
                      }}>
                        {msg.feedback.score}/10
                      </span>
                      <span className="training__feedback-score-label">Score</span>
                    </div>
                    {msg.feedback.pros.length > 0 && (
                      <div className="training__feedback-section training__feedback-section--pro">
                        {msg.feedback.pros.map((p, i) => <div key={i} className="training__feedback-item">✓ {p}</div>)}
                      </div>
                    )}
                    {msg.feedback.cons.length > 0 && (
                      <div className="training__feedback-section training__feedback-section--con">
                        {msg.feedback.cons.map((c, i) => <div key={i} className="training__feedback-item">✗ {c}</div>)}
                      </div>
                    )}
                    <div className="training__feedback-ideal">
                      <div className="training__feedback-ideal-label">IDEAL RESPONSE</div>
                      <div className="training__feedback-ideal-text">"{msg.feedback.idealResponse}"</div>
                      <div className="training__feedback-ideal-reason">{msg.feedback.idealReason}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {state.isLoading && (
              <div className="training__msg training__msg--prospect">
                <div className="training__msg-label">PROSPECT</div>
                <div className="training__msg-bubble training__msg-bubble--loading">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {state.error && <div className="training__error">{state.error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="training__input-bar">
            {(isListening || interimText) && (
              <div className="training__interim">{interimText || '…listening'}</div>
            )}

            <button
              className={`training__mic-btn ${isListening ? 'training__mic-btn--active' : ''}`}
              onClick={handleMicClick}
              disabled={state.isLoading}
              title={isListening ? 'Pause mic' : 'Resume mic'}
            >
              🎤
            </button>

            <div className="training__text-row">
              <textarea
                className="training__input"
                placeholder="Or type your response..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={state.isLoading}
              />
              <button
                className="training__send-btn"
                onClick={handleSend}
                disabled={state.isLoading || !input.trim()}
              >
                SEND
              </button>
            </div>

            {voiceError && <div className="training__error">{voiceError}</div>}
          </div>
        </main>
      </div>
    );
  }

  // ── Scenario Selection ──────────────────────────────────────────────────────
  return (
    <div className="training">
      <main className="training__main">
        <div className="training__selection">
          <div className="training__selection-header">
            <h1 className="training__selection-title">Training Mode</h1>
            <p className="training__selection-sub">Pick a scenario. The AI plays the prospect. You close the deal.</p>
          </div>

          {state.error && <div className="training__error">{state.error}</div>}

          <div className="training__scenarios">
            <div className="training__lang-row">
              <div className="training__lang-label">LANGUAGE</div>
              <div className="training__lang-select">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`training__lang-btn ${language === l.code ? 'training__lang-btn--active' : ''}`}
                    onClick={() => setLanguage(l.code)}
                  >
                    <img className="training__lang-flag" src={`https://flagcdn.com/w20/${l.code.split('-')[1].toLowerCase()}.png`} alt={l.label} />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {SCENARIOS.map(s => (
              <button
                key={s.id}
                className={`training__scenario-card ${s.id === 'random' ? 'training__scenario-card--random' : ''}`}
                onClick={() => { startScenario(s.id, language); setContextInput(''); setSelectedSub(null); }}
                disabled={state.isLoading}
              >
                <div className="training__scenario-label">{s.label}</div>
                <div className="training__scenario-desc">{s.description}</div>
              </button>
            ))}
          </div>

          {state.isLoading && <div className="training__loading">Setting up scenario...</div>}
        </div>
      </main>
    </div>
  );
}
