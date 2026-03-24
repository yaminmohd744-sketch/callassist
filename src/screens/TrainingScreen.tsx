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

export function TrainingScreen({ onBack }: TrainingScreenProps) {
  const { state, startScenario, confirmContext, sendResponse, endSession, reset } = useTraining();
  const [input, setInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [difficulty, setDifficulty] = useState<TrainingDifficulty>('medium');
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

  // Stop listening when session ends
  useEffect(() => {
    if (state.phase !== 'active') {
      stopListening();
    }
  }, [state.phase, stopListening]);

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

            <h2 className="training__context-title">What are you selling?</h2>
            <p className="training__context-sub">
              Give the AI context so it can simulate a realistic prospect for your industry.
            </p>

            <div className="training__diff-row">
              <div className="training__diff-label">DIFFICULTY</div>
              <div className="training__diff-btns">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    className={`training__diff-btn training__diff-btn--${d} ${difficulty === d ? 'training__diff-btn--active' : ''}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="training__context-input"
              placeholder="e.g. a $485k 3-bedroom house in Miami, FL"
              value={contextInput}
              onChange={e => setContextInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void confirmContext(contextInput.trim() || 'my product/service', difficulty); } }}
              rows={3}
              autoFocus
            />

            {state.error && <div className="training__error">{state.error}</div>}

            <div className="training__context-actions">
              <button
                className="training__btn training__btn--primary"
                onClick={() => void confirmContext(contextInput.trim() || 'my product/service', difficulty)}
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
              title={isListening ? 'Stop recording' : 'Speak your response'}
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
                onClick={() => { startScenario(s.id, language); setContextInput(''); setDifficulty('medium'); }}
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
