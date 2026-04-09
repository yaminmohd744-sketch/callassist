import { useState, useRef, useEffect } from 'react';
import { useTraining } from '../hooks/useTraining';
import { useAuth } from '../hooks/useAuth';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import { AcademySection } from './AcademySection';
import { getSavedContexts, saveContext } from '../lib/saleContexts';
import { recordPracticeToday } from '../lib/streak';
import { saveTrainingSession, getTrainingHistory, getMonthlySessionCount } from '../lib/trainingHistory';
import type { TrainingHistoryEntry } from '../lib/trainingHistory';
import type { UserTier } from './AcademySection';
import type { TrainingScenario } from '../types';
import type { TrainingDifficulty } from '../hooks/useTraining';
import './TrainingScreen.css';

interface TrainingScreenProps {
  onBack: () => void;
  appLanguage?: string;
}

const SCENARIO_ROWS: { id: TrainingScenario; label: string; description: string; icon: string }[][] = [
  [
    { id: 'price-objection', label: 'Price Objection', description: 'Prospect says it\'s too expensive',    icon: '◈' },
    { id: 'not-interested',  label: 'Not Interested',  description: 'Prospect wants to end the call',      icon: '⊘' },
    { id: 'think-it-over',  label: 'Think It Over',   description: 'Prospect is stalling for time',       icon: '◎' },
    { id: 'send-me-info',   label: 'Send Me Info',    description: 'Prospect deflects with email request', icon: '◻' },
  ],
  [
    { id: 'cold-opener', label: 'Cold Opener', description: 'Start a cold call from scratch',     icon: '◇' },
    { id: 'discovery',   label: 'Discovery',   description: 'Uncover pain points and needs',      icon: '◑' },
    { id: 'closing',     label: 'Closing',     description: 'Push for commitment at the end',     icon: '◆' },
  ],
  [
    { id: 'random', label: 'Random Scenario', description: 'AI generates a surprise situation',  icon: '★' },
    { id: 'custom', label: 'Custom Scenario', description: 'Describe your own prospect persona', icon: '✎' },
  ],
];
const SCENARIOS = SCENARIO_ROWS.flat();

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
    { id: 'ni-easy',   label: 'Bad Timing',  difficulty: 'easy',   description: '"It\'s just not the right time."',         prompt: 'The prospect says it\'s not the right time, but is vague about why. They\'re not hostile - they\'re just not ready.' },
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
    { id: 'co-hard',   label: 'Ten Seconds',    difficulty: 'hard',   description: '"You have 10 seconds. Go."',               prompt: 'The prospect gets dozens of cold calls. They\'re immediately defensive and give the rep a very short window - if the opener doesn\'t hook them instantly, they\'re gone.' },
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
  'custom': [],
};

type SelectionMode = 'split' | 'practice' | 'academy';

const TIER_SCENARIO_LIMITS: Record<UserTier, number | null> = {
  starter: 10,
  pro: 30,
  business: null, // unlimited
};

export function TrainingScreen({ onBack, appLanguage = 'en-US' }: TrainingScreenProps) {
  const { user } = useAuth();
  const { state, startScenario, confirmContext, sendResponse, endSession, reset } = useTraining();
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('split');
  const [input, setInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [selectedSub, setSelectedSub] = useState<SubScenario | null>(null);
  const [customDesc, setCustomDesc] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<TrainingDifficulty>('medium');
  const [language, setLanguage] = useState(appLanguage);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<TrainingHistoryEntry[]>(() => getTrainingHistory());
  const [monthlyCount, setMonthlyCount] = useState(() => getMonthlySessionCount());
  const userTier: UserTier = 'pro';
  const scenarioLimit = TIER_SCENARIO_LIMITS[userTier];
  const limitReached = scenarioLimit !== null && monthlyCount >= scenarioLimit;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Sync app-level language if changed while in selection phase
  useEffect(() => {
    if (state.phase === 'selection') setLanguage(appLanguage);
  }, [appLanguage, state.phase]);

  // Save to history and record streak when session summary arrives
  useEffect(() => {
    if (state.phase !== 'summary') return;
    recordPracticeToday();
    if (state.summary) {
      const entry: TrainingHistoryEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        scenarioId: state.scenario ?? 'unknown',
        scenarioLabel: SCENARIOS.find(s => s.id === state.scenario)?.label ?? state.scenario ?? 'Unknown',
        difficulty: state.difficulty,
        overallScore: state.overallScore,
        headline: state.summary.headline,
        exchanges: state.messages.filter(m => m.role === 'rep').length,
        date: new Date().toISOString(),
      };
      saveTrainingSession(entry);
      setHistory(getTrainingHistory());
      setMonthlyCount(getMonthlySessionCount());
    }
  }, [state.phase, state.summary]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSwitchToSplit() {
    setSelectionMode('split');
    reset();
  }

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

  const repMessages = state.messages.filter(m => m.role === 'rep');

  // ── Render practice phase content ────────────────────────────────────────────
  function renderPracticeContent() {
    // Summary
    if (state.phase === 'summary') {
      const { summary } = state;
      return (
        <main className="training__main">
          <div className="training__summary">
            <div className="training__summary-header">
              <h2 className="training__summary-title">
                {summary ? summary.headline : 'Session Complete'}
              </h2>
              <p className="training__summary-sub">
                {SCENARIOS.find(s => s.id === state.scenario)?.label ?? 'Training'} — {repMessages.length} exchange{repMessages.length !== 1 ? 's' : ''}
              </p>
            </div>

            {state.isLoading && (
              <div className="training__summary-loading">Generating your coaching report...</div>
            )}

            {summary && (
              <>
                <div className="training__summary-assessment">{summary.assessment}</div>
                <div className="training__summary-sections">
                  {summary.strengths.length > 0 && (
                    <div className="training__summary-section training__summary-section--pros">
                      <div className="training__summary-section-title">✓ What you did well</div>
                      <ul>{summary.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                  )}
                  {summary.improvements.length > 0 && (
                    <div className="training__summary-section training__summary-section--cons">
                      <div className="training__summary-section-title">✗ What to work on</div>
                      <ul>{summary.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                  )}
                </div>
                <div className="training__summary-takeaway">
                  <div className="training__summary-takeaway-label">KEY TAKEAWAY</div>
                  <div className="training__summary-takeaway-text">{summary.keyTakeaway}</div>
                </div>
              </>
            )}

            <div className="training__summary-actions">
              <button className="training__btn training__btn--primary" onClick={reset}>Practice Again</button>
              <button className="training__btn training__btn--ghost" onClick={onBack}>Back to Dashboard</button>
            </div>
          </div>
        </main>
      );
    }

    // Context
    if (state.phase === 'context') {
      const isCustom = state.scenario === 'custom';
      const subs = state.scenario && !isCustom ? SUB_SCENARIOS[state.scenario] : [];
      const savedContexts = getSavedContexts();

      function handleStart() {
        saveContext(contextInput.trim());
        if (isCustom) {
          const desc = customDesc.trim() || 'A prospect who needs persuasion to make a buying decision.';
          void confirmContext(contextInput.trim() || 'my product/service', selectedDifficulty, desc);
        } else {
          const sub = selectedSub ?? subs[1];
          void confirmContext(contextInput.trim() || 'my product/service', sub.difficulty, sub.prompt);
        }
      }

      return (
        <main className="training__main">
          <div className="training__context">
            <div className="training__context-header">
              <span className="training__context-scenario-label">SCENARIO</span>
              <span className="training__context-scenario-name">
                {SCENARIOS.find(s => s.id === state.scenario)?.label}
              </span>
            </div>

            {isCustom ? (
              <div className="training__custom-block">
                <h2 className="training__context-title">Describe your prospect</h2>
                <p className="training__context-sub">
                  Tell the AI who they are, their attitude, and their situation.
                </p>
                <textarea
                  className="training__context-input"
                  placeholder="e.g. A CFO at a mid-sized logistics company. Skeptical of new software after a failed implementation last year."
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <div className="training__custom-diff">
                  <span className="training__diff-label">DIFFICULTY</span>
                  {(['easy', 'medium', 'hard'] as TrainingDifficulty[]).map(d => (
                    <button
                      key={d}
                      className={`training__custom-diff-btn training__custom-diff-btn--${d} ${selectedDifficulty === d ? 'training__custom-diff-btn--active' : ''}`}
                      onClick={() => setSelectedDifficulty(d)}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="training__sub-scenarios">
                <div className="training__diff-label">SELECT SUB-SCENARIO</div>
                <div className="training__sub-grid">
                  {subs.map((sub, i) => (
                    <button
                      key={sub.id}
                      className={`training__sub-card training__sub-card--${sub.difficulty} ${selectedSub?.id === sub.id ? 'training__sub-card--selected' : ''}`}
                      style={{ animationDelay: `${i * 0.22}s` }}
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
            )}

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
            />
            {savedContexts.length > 0 && (
              <div className="training__presets">
                <span className="training__presets-label">RECENT</span>
                {savedContexts.map((c, i) => (
                  <button key={i} className="training__preset-btn" onClick={() => setContextInput(c)}>{c}</button>
                ))}
              </div>
            )}
            {state.error && <div className="training__error">{state.error}</div>}
            <div className="training__context-actions">
              <button className="training__btn training__btn--primary" onClick={handleStart} disabled={state.isLoading}>
                {state.isLoading ? 'Setting up...' : 'Start Training →'}
              </button>
              <button className="training__btn training__btn--ghost" onClick={reset}>Back</button>
            </div>
          </div>
        </main>
      );
    }

    // Active session
    if (state.phase === 'active') {
      return (
        <main className="training__main training__main--active">
          <div className="training__session-header">
            <div className="training__session-info">
              <span className="training__session-label">SCENARIO</span>
              <span className="training__session-name">{SCENARIOS.find(s => s.id === state.scenario)?.label}</span>
              <span className={`training__diff-badge training__diff-badge--${state.difficulty}`}>
                {state.difficulty.toUpperCase()}
              </span>
            </div>
            <button className="training__end-btn" onClick={() => void endSession('manual')}>End Session</button>
          </div>
          <div className="training__messages">
            {state.messages.map(msg => (
              <div key={msg.id} className={`training__msg training__msg--${msg.role}`}>
                <div className="training__msg-label">{msg.role === 'prospect' ? 'PROSPECT' : 'YOU'}</div>
                <div className="training__msg-bubble">{msg.text}</div>
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
            <div className="training__text-row">
              <textarea
                className="training__input"
                placeholder="Type your response..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={state.isLoading}
              />
              <button className="training__send-btn" onClick={handleSend} disabled={state.isLoading || !input.trim()}>
                SEND
              </button>
            </div>
          </div>
        </main>
      );
    }

    // Scenario selection
    return (
      <main className="training__main">
        <div className="training__selection">
          <div className="training__selection-header">
            <h1 className="training__selection-title">Training Mode</h1>
            <p className="training__selection-sub">Pick a scenario. The AI plays the prospect. End the call when you're ready for your coaching report.</p>
            {scenarioLimit !== null && (
              <div className={`training__session-quota${limitReached ? ' training__session-quota--exhausted' : ''}`}>
                {limitReached
                  ? `Monthly limit reached — ${scenarioLimit} scenario sessions used this month. Resets next month.`
                  : `${monthlyCount} / ${scenarioLimit} scenario sessions used this month`}
              </div>
            )}
          </div>
          {state.error && <div className="training__error">{state.error}</div>}
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
          <div className="training__scenarios">
            {SCENARIO_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="training__scenario-row">
                {row.map((s, i) => {
                  const globalIdx = SCENARIO_ROWS.slice(0, rowIdx).reduce((acc, r) => acc + r.length, 0) + i;
                  return (
                    <button
                      key={s.id}
                      className={`training__scenario-card training__scenario-card--${s.id}${limitReached ? ' training__scenario-card--locked' : ''}`}
                      style={{ animationDelay: `${globalIdx * 0.18}s` }}
                      onClick={() => { if (limitReached) return; startScenario(s.id, language); setContextInput(''); setSelectedSub(null); setCustomDesc(''); setSelectedDifficulty('medium'); }}
                      disabled={state.isLoading || limitReached}
                    >
                      <div className="training__scenario-icon">{s.icon}</div>
                      <div className="training__scenario-label">{s.label}</div>
                      <div className="training__scenario-desc">{s.description}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {state.isLoading && <div className="training__loading">Setting up scenario...</div>}

          {history.length > 0 && (
            <div className="training__history">
              <button
                className="training__history-toggle"
                onClick={() => setShowHistory(v => !v)}
              >
                <span>◷ Session History</span>
                <span className="training__history-count">{history.length}</span>
                <span className="training__history-caret">{showHistory ? '▴' : '▾'}</span>
              </button>
              {showHistory && (
                <div className="training__history-list">
                  {history.map((h) => (
                    <div key={h.id} className="training__history-item">
                      <div className="training__history-left">
                        <span className="training__history-scenario">{h.scenarioLabel}</span>
                        <span className={`training__diff-badge training__diff-badge--${h.difficulty}`}>
                          {h.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <div className="training__history-center">
                        <span className="training__history-headline">{h.headline}</span>
                        <span className="training__history-meta">{h.exchanges} exchange{h.exchanges !== 1 ? 's' : ''} · {new Date(h.date).toLocaleDateString()}</span>
                      </div>
                      {h.overallScore !== null && (
                        <div className="training__history-score" style={{
                          color: h.overallScore >= 8 ? 'var(--color-accent-green)'
                            : h.overallScore >= 6 ? 'var(--color-accent-yellow)'
                            : 'var(--color-accent-red)',
                        }}>
                          {h.overallScore.toFixed(1)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="training">
      <div className={`training__split training__split--${selectionMode}`}>

        {/* ── Practice panel ── */}
        <div className="training__split-panel training__split-panel--practice">
          {selectionMode === 'split' ? (
            <div
              className="training__chooser training__chooser--practice"
              onClick={() => setSelectionMode('practice')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelectionMode('practice')}
            >
              <div className="training__chooser-inner">
                <div className="training__chooser-icon">◎</div>
                <div className="training__chooser-title">PRACTICE SCENARIOS</div>
                <div className="training__chooser-desc">
                  Train with AI-powered prospect simulations. Get instant coaching feedback on every reply.
                </div>
                <ul className="training__chooser-features">
                  <li>9 unique sales scenarios</li>
                  <li>Easy, medium, and brutal difficulty</li>
                  <li>Full coaching report at the end of every session</li>
                </ul>
                <div className="training__chooser-cta">Start Practicing →</div>
              </div>
            </div>
          ) : selectionMode === 'practice' ? (
            <div className="training__full-mode">
              <div className="training__switch-bar">
                <button className="training__switch-btn" onClick={handleSwitchToSplit}>
                  ← Back to selection
                </button>
                <span className="training__switch-sep">·</span>
                <button className="training__switch-btn" onClick={() => { handleSwitchToSplit(); setTimeout(() => setSelectionMode('academy'), 10); }}>
                  Switch to Academy ◈
                </button>
              </div>
              {renderPracticeContent()}
            </div>
          ) : null}
        </div>

        {/* ── Academy panel ── */}
        <div className="training__split-panel training__split-panel--academy">
          {selectionMode === 'split' ? (
            <div
              className="training__chooser training__chooser--academy"
              onClick={() => setSelectionMode('academy')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelectionMode('academy')}
            >
              <div className="training__chooser-inner">
                <div className="training__chooser-icon">◈</div>
                <div className="training__chooser-title">AI ACADEMY</div>
                <div className="training__chooser-desc">
                  Structured lessons designed to build real sales skill — from cold openers to closing hard deals.
                </div>
                <ul className="training__chooser-features">
                  <li>3 skill levels — Beginner to Advanced</li>
                  <li>27 lessons: taught first, then tested</li>
                  <li>Track your scores and improvement</li>
                </ul>
                <div className="training__chooser-cta">Start Learning →</div>
              </div>
            </div>
          ) : selectionMode === 'academy' ? (
            <div className="training__full-mode">
              <div className="training__switch-bar">
                <button className="training__switch-btn" onClick={handleSwitchToSplit}>
                  ← Back to selection
                </button>
                <span className="training__switch-sep">·</span>
                <button className="training__switch-btn" onClick={() => { handleSwitchToSplit(); setTimeout(() => setSelectionMode('practice'), 10); }}>
                  Switch to Practice ◎
                </button>
              </div>
              <AcademySection user={user} appLanguage={language} userTier={userTier} />
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
