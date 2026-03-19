import { useState, useRef, useEffect } from 'react';
import { useTraining } from '../hooks/useTraining';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { TrainingScenario } from '../types';
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
  const { state, startScenario, sendResponse, endSession, reset } = useTraining();
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en-US');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

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

  const scoredMessages = state.messages.filter(m => m.role === 'rep' && m.feedback);

  // ── Summary Screen ──────────────────────────────────────────────────────────
  if (state.phase === 'summary') {
    const score = state.overallScore ?? 0;
    const allPros = scoredMessages.flatMap(m => m.feedback?.pros ?? []);
    const allCons = scoredMessages.flatMap(m => m.feedback?.cons ?? []);

    return (
      <div className="training">
        <aside className="training__sidebar">
          <div className="training__logo">◎ CALL<span>ASSIST</span></div>
          <nav className="training__nav">
            <div className="training__nav-item" onClick={onBack}>
              <span className="training__nav-icon">⊞</span>Dashboard
            </div>
            <div className="training__nav-item training__nav-item--active">
              <span className="training__nav-icon">◈</span>Training
            </div>
          </nav>
        </aside>

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

  // ── Active Session ──────────────────────────────────────────────────────────
  if (state.phase === 'active') {
    return (
      <div className="training">
        <aside className="training__sidebar">
          <div className="training__logo">◎ CALL<span>ASSIST</span></div>
          <nav className="training__nav">
            <div className="training__nav-item" onClick={onBack}>
              <span className="training__nav-icon">⊞</span>Dashboard
            </div>
            <div className="training__nav-item training__nav-item--active">
              <span className="training__nav-icon">◈</span>Training
            </div>
          </nav>
          <div className="training__sidebar-info">
            <div className="training__sidebar-label">SCENARIO</div>
            <div className="training__sidebar-value">{SCENARIOS.find(s => s.id === state.scenario)?.label}</div>
            <div className="training__sidebar-desc">{state.scenarioDescription}</div>
          </div>
          <button className="training__end-btn" onClick={endSession}>End Session</button>
        </aside>

        <main className="training__main training__main--active">
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
            <textarea
              className="training__input"
              placeholder="Type your response..."
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
        </main>
      </div>
    );
  }

  // ── Scenario Selection ──────────────────────────────────────────────────────
  return (
    <div className="training">
      <aside className="training__sidebar">
        <div className="training__logo">◎ CALL<span>ASSIST</span></div>
        <nav className="training__nav">
          <div className="training__nav-item" onClick={onBack}>
            <span className="training__nav-icon">⊞</span>Dashboard
          </div>
          <div className="training__nav-item training__nav-item--active">
            <span className="training__nav-icon">◈</span>Training
          </div>
        </nav>
      </aside>

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
                    <span className="training__lang-flag">{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

          {SCENARIOS.map(s => (
              <button
                key={s.id}
                className={`training__scenario-card ${s.id === 'random' ? 'training__scenario-card--random' : ''}`}
                onClick={() => void startScenario(s.id, language)}
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
