import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAcademy } from '../hooks/useAcademy';
import { useTraining } from '../hooks/useTraining';
import { CURRICULUM, ALL_LESSONS } from '../lib/curriculum';
import type { CurriculumLesson, CurriculumModule } from '../lib/curriculum';
import type { TrainingScenario } from '../types';
import './AcademySection.css';

// Sub-scenario prompts per scenario - indexed to match SUB_SCENARIOS in TrainingScreen
const SUB_PROMPTS: Record<TrainingScenario, string[]> = {
  'cold-opener': [
    'The prospect is reasonably open. They\'re busy but willing to hear the rep out for a minute if it sounds relevant.',
    'The prospect is professional but skeptical of cold calls. They give the rep 30 seconds to prove relevance before cutting them off.',
    'The prospect gets dozens of cold calls. They\'re immediately defensive and give the rep a very short window.',
  ],
  'not-interested': [
    'The prospect says it\'s not the right time, but is vague about why. They\'re not hostile - they\'re just not ready.',
    'The prospect is comfortable with their current solution and sees no reason to change. They\'re politely dismissive.',
    'The prospect is immediately hostile and wants to end the call. They\'ve heard pitches like this before and are actively trying to hang up.',
  ],
  'price-objection': [
    'The prospect is mildly surprised by the price but hasn\'t compared to competitors and is still interested. They just need reassurance on value.',
    'The prospect has a fixed budget that the price exceeds. They need to justify cost internally to their team.',
    'The prospect is actively comparing you to a named competitor who charges significantly less. They want a price match or a compelling reason to pay more.',
  ],
  'think-it-over': [
    'The prospect likes the offer but wants a day to think. They\'re genuinely considering it, not brushing off.',
    'The prospect is personally interested but needs buy-in from others before deciding. It\'s a real blocker, not an excuse.',
    'The prospect has a firm policy of never deciding on the first call. They always say they\'ll think about it. It\'s a habit, not a genuine objection.',
  ],
  'send-me-info': [
    'The prospect is genuinely interested and wants written details to review properly before deciding. A real information request.',
    'The prospect uses "send me info" as a polite way to end the conversation. They probably won\'t read it unless the rep creates urgency.',
    'The prospect is using the email request as a definitive brush-off. They have no intention of following up and are trying to end the call permanently.',
  ],
  'discovery': [
    'The prospect has real pain they\'re willing to discuss. They just needed someone to ask the right question. They\'re forthcoming.',
    'The prospect is guarded and doesn\'t volunteer information. They answer questions minimally and make the rep work for every insight.',
    'The prospect refuses to answer discovery questions. They flip the conversation back, demanding the rep pitch them directly.',
  ],
  'closing': [
    'The prospect is essentially sold. They just need a clear next step and mild reassurance to commit. Don\'t oversell.',
    'The prospect was close but has last-minute cold feet. They have a real but vague hesitation that the rep needs to surface and resolve.',
    'Every time the rep addresses an objection, the prospect surfaces a new one. They keep adding concerns at the close.',
  ],
  'random': [
    'Generate a surprising but realistic sales situation with a prospect who is mildly resistant.',
    'Generate a surprising but realistic sales situation with a moderately resistant prospect.',
    'Generate a surprising but highly challenging sales situation with a very resistant prospect.',
  ],
};

interface AcademySectionProps {
  user: User | null;
}

type AcademyPhase = 'overview' | 'intro' | 'practice' | 'results';

const TOTAL_LESSONS = ALL_LESSONS.length;

export function AcademySection({ user }: AcademySectionProps) {
  const { loading, saveSession, getLessonStats, getOverallStats } = useAcademy(user);
  const { state: trainingState, startScenario, confirmContext, sendResponse, endSession, reset } = useTraining();

  const [phase, setPhase] = useState<AcademyPhase>('overview');
  const [activeLesson, setActiveLesson] = useState<CurriculumLesson | null>(null);
  const [activeModule, setActiveModule] = useState<CurriculumModule | null>(null);
  const [saleContext, setSaleContext] = useState('');
  const [saved, setSaved] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trainingState.messages]);

  // Detect session end → save score → show results
  useEffect(() => {
    if (
      phase === 'practice' &&
      trainingState.phase === 'summary' &&
      trainingState.overallScore !== null &&
      !saved &&
      activeLesson
    ) {
      setSaved(true);
      void saveSession(activeLesson.id, trainingState.overallScore);
      setPhase('results');
    }
  }, [phase, trainingState.phase, trainingState.overallScore, saved, activeLesson, saveSession]);

  function handleSelectLesson(lesson: CurriculumLesson, mod: CurriculumModule) {
    setActiveLesson(lesson);
    setActiveModule(mod);
    setSaleContext('');
    setSaved(false);
    setInput('');
    reset();
    setPhase('intro');
  }

  async function handleStartPractice() {
    if (!activeLesson) return;
    const subPrompt = SUB_PROMPTS[activeLesson.scenario][activeLesson.subScenarioIndex] ?? '';
    startScenario(activeLesson.scenario, 'en-US');
    await confirmContext(saleContext || 'my product/service', activeLesson.difficulty, subPrompt);
    setPhase('practice');
  }

  function handleSend() {
    const text = input.trim();
    if (!text || trainingState.isLoading) return;
    setInput('');
    void sendResponse(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleBack() {
    reset();
    setPhase('overview');
  }

  // ── Determine module unlock status ─────────────────────────────────────────
  function isModuleUnlocked(modIndex: number): boolean {
    if (modIndex === 0) return true;
    const prevModule = CURRICULUM[modIndex - 1];
    const attempted = prevModule.lessons.filter(l => getLessonStats(l.id) !== null).length;
    return attempted >= 2; // soft lock: 2/3 lessons attempted
  }

  // ── Score color helper ─────────────────────────────────────────────────────
  function scoreColor(score: number) {
    return score >= 7.5 ? 'var(--color-accent-green)'
      : score >= 5 ? 'var(--color-accent-yellow)'
      : 'var(--color-accent-red)';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OVERVIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'overview') {
    const { attempted, avgScore, totalSessions } = getOverallStats();
    const pct = Math.round((attempted / TOTAL_LESSONS) * 100);

    return (
      <div className="academy">
        <div className="academy__stats">
          <div className="academy__stats-title">ACADEMY</div>
          <div className="academy__stats-numbers">
            <div className="academy__stat">
              <div className="academy__stat-val">{attempted}/{TOTAL_LESSONS}</div>
              <div className="academy__stat-label">LESSONS</div>
            </div>
            <div className="academy__stat">
              <div className="academy__stat-val">{totalSessions}</div>
              <div className="academy__stat-label">SESSIONS</div>
            </div>
            <div className="academy__stat">
              <div className="academy__stat-val" style={{ color: avgScore > 0 ? scoreColor(avgScore) : undefined }}>
                {avgScore > 0 ? `${avgScore}/10` : '-'}
              </div>
              <div className="academy__stat-label">AVG SCORE</div>
            </div>
          </div>
          <div className="academy__progress-wrap">
            <div className="academy__progress-bar">
              <div className="academy__progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="academy__progress-label">{pct}% of lessons practiced</div>
          </div>
        </div>

        <div className="academy__modules">
          {CURRICULUM.map((mod, modIndex) => {
            const unlocked = isModuleUnlocked(modIndex);
            const modAttempted = mod.lessons.filter(l => getLessonStats(l.id) !== null).length;

            return (
              <div key={mod.id} className={`academy__module ${!unlocked ? 'academy__module--locked' : ''}`}>
                <div className="academy__module-header">
                  <span className={`academy__module-level academy__module-level--${mod.color}`}>
                    {mod.level.toUpperCase()}
                  </span>
                  <span className="academy__module-title">{mod.title}</span>
                  <span className="academy__module-completion">{modAttempted}/{mod.lessons.length} practiced</span>
                </div>

                {!unlocked ? (
                  <div className="academy__locked-msg">
                    Complete {2 - (CURRICULUM[modIndex - 1]?.lessons.filter(l => getLessonStats(l.id) !== null).length ?? 0)} more lessons in "{CURRICULUM[modIndex - 1]?.title}" to unlock
                  </div>
                ) : (
                  <div className="academy__lessons">
                    {mod.lessons.map(lesson => {
                      const stats = getLessonStats(lesson.id);
                      const attempted = stats !== null;

                      return (
                        <button
                          key={lesson.id}
                          className={`academy__lesson-row ${stats?.mastered ? 'academy__lesson-row--mastered' : ''}`}
                          onClick={() => handleSelectLesson(lesson, mod)}
                          disabled={loading}
                        >
                          <span className="academy__lesson-status">
                            {stats?.mastered ? '✓' : attempted ? '◈' : '○'}
                          </span>

                          <div className="academy__lesson-info">
                            <div className="academy__lesson-title">{lesson.title}</div>
                            <div className="academy__lesson-concept">{lesson.concept}</div>
                          </div>

                          {stats ? (
                            <div className="academy__lesson-meta">
                              <span
                                className="academy__lesson-score"
                                style={{ color: scoreColor(stats.bestScore) }}
                              >
                                {stats.bestScore.toFixed(1)}
                              </span>
                              <span className="academy__lesson-trend">
                                {stats.improving ? '↑' : stats.attempts >= 2 ? '→' : ''}
                              </span>
                              <div className="academy__lesson-dots">
                                {stats.allScores.map((s, i) => (
                                  <div
                                    key={i}
                                    className="academy__lesson-dot"
                                    style={{ background: scoreColor(s), opacity: 0.5 + (i / stats.allScores.length) * 0.5 }}
                                  />
                                ))}
                              </div>
                              <span className="academy__lesson-reps">{stats.attempts} rep{stats.attempts !== 1 ? 's' : ''}</span>
                            </div>
                          ) : (
                            <span className="academy__lesson-start">START →</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INTRO
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'intro' && activeLesson && activeModule) {
    return (
      <div className="academy">
        <main className="training__main">
          <div className="academy__intro">
            <div className="academy__intro-breadcrumb">
              <span>{activeModule.title}</span>
              <span className="academy__intro-breadcrumb-sep">›</span>
              <span className="academy__intro-breadcrumb-lesson">{activeLesson.title}</span>
            </div>

            <h2 className="academy__intro-title">{activeLesson.title}</h2>
            <p className="academy__intro-concept">{activeLesson.concept}</p>

            <div className="academy__tip-card">
              <div className="academy__tip-label">COACHING TIP</div>
              <div className="academy__tip-text">{activeLesson.tip}</div>
            </div>

            <div className="academy__intro-context">
              <div className="academy__intro-context-label">WHAT ARE YOU SELLING?</div>
              <textarea
                className="academy__intro-context-input"
                placeholder="e.g. a $485k 3-bedroom house in Miami, FL"
                value={saleContext}
                onChange={e => setSaleContext(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleStartPractice(); } }}
                rows={2}
                autoFocus
              />
            </div>

            {trainingState.error && <div className="training__error">{trainingState.error}</div>}

            <div className="academy__intro-actions">
              <button
                className="academy__btn academy__btn--primary"
                onClick={() => void handleStartPractice()}
                disabled={trainingState.isLoading}
              >
                {trainingState.isLoading ? 'Setting up...' : 'Start Practice →'}
              </button>
              <button className="academy__btn academy__btn--ghost" onClick={handleBack}>
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRACTICE (active training session)
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'practice' && trainingState.phase === 'active') {
    return (
      <div className="academy">
        <main className="training__main training__main--active">
          <div className="academy__session-header">
            <div className="academy__session-info">
              <span className="academy__session-label">LESSON</span>
              <span className="academy__session-name">{activeLesson?.title}</span>
              <span className={`training__diff-badge training__diff-badge--${trainingState.difficulty}`}>
                {trainingState.difficulty.toUpperCase()}
              </span>
            </div>
            <button className="academy__end-btn" onClick={endSession}>End Session</button>
          </div>

          <div className="training__messages">
            {trainingState.messages.map(msg => (
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
            {trainingState.isLoading && (
              <div className="training__msg training__msg--prospect">
                <div className="training__msg-label">PROSPECT</div>
                <div className="training__msg-bubble training__msg-bubble--loading">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {trainingState.error && <div className="training__error">{trainingState.error}</div>}
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
                disabled={trainingState.isLoading}
              />
              <button
                className="training__send-btn"
                onClick={handleSend}
                disabled={trainingState.isLoading || !input.trim()}
              >
                SEND
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'results' && activeLesson) {
    const score = trainingState.overallScore ?? 0;
    const prevStats = getLessonStats(activeLesson.id);
    // prevStats now includes the just-saved record, so "previous" is the second entry
    const prevBest = prevStats && prevStats.attempts > 1 ? prevStats.allScores[prevStats.allScores.length - 2] : null;
    const delta = prevBest !== null ? score - prevBest : null;

    // Find next lesson
    const flatLessons = ALL_LESSONS;
    const currentIdx = flatLessons.findIndex(l => l.id === activeLesson.id);
    const nextLesson = currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;
    const nextModule = nextLesson ? CURRICULUM.find(m => m.lessons.some(l => l.id === nextLesson.id)) : null;

    return (
      <div className="academy">
        <main className="training__main">
          <div className="academy__results">
            <div className="academy__results-header">
              <h2 className="academy__results-title">Session Complete</h2>
              <div className="academy__results-lesson">{activeLesson.title}</div>
            </div>

            <div className="academy__results-score">
              <div className="academy__results-score-val" style={{ color: scoreColor(score) }}>
                {score.toFixed(1)}<span>/10</span>
              </div>
              <div className="academy__results-score-bar">
                <div className="academy__results-score-fill" style={{ width: `${score * 10}%`, backgroundColor: scoreColor(score) }} />
              </div>
            </div>

            {delta !== null && (
              <div className="academy__improvement">
                <span className="academy__improvement-icon">
                  {delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️'}
                </span>
                <span className="academy__improvement-text">
                  {delta > 0
                    ? <><strong>+{delta.toFixed(1)} improvement</strong> from your previous session on this lesson</>
                    : delta < 0
                    ? <>Score dropped by {Math.abs(delta).toFixed(1)} - review the ideal responses above and try again</>
                    : <>Same score as last time - study the ideal responses to push higher</>
                  }
                </span>
              </div>
            )}

            {delta === null && (
              <div className="academy__improvement">
                <span className="academy__improvement-icon">🎯</span>
                <span className="academy__improvement-text">
                  <strong>First attempt logged.</strong> Practice again to track your improvement.
                </span>
              </div>
            )}

            <div className="academy__results-actions">
              <button
                className="academy__btn academy__btn--primary"
                onClick={() => { setSaved(false); setPhase('intro'); reset(); }}
              >
                Try Again
              </button>
              {nextLesson && nextModule ? (
                <button
                  className="academy__btn academy__btn--ghost"
                  onClick={() => handleSelectLesson(nextLesson, nextModule)}
                >
                  Next Lesson →
                </button>
              ) : (
                <button className="academy__btn academy__btn--ghost" onClick={handleBack}>
                  Back to Academy
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading / transitioning state
  return (
    <div className="academy">
      <main className="training__main">
        <div className="training__selection">
          <div className="training__loading">Loading academy...</div>
        </div>
      </main>
    </div>
  );
}
