import { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import type { User } from '@supabase/supabase-js';
import { useAcademy } from '../hooks/useAcademy';
import { useTraining } from '../hooks/useTraining';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useProspectVoice } from '../hooks/useProspectVoice';
import { CURRICULUM, ALL_LESSONS } from '../lib/curriculum';
import type { CurriculumLesson, CurriculumModule } from '../lib/curriculum';
import type { TrainingScenario } from '../types';
import { getSavedContexts, saveContext } from '../lib/saleContexts';
import { recordPracticeToday, getStreak } from '../lib/streak';
import { LessonWalkthroughScreen } from './LessonWalkthroughScreen';
import './AcademySection.css';

// Sub-scenario prompts per scenario
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
  'custom': [],
};

export type UserTier = 'starter' | 'pro' | 'business';

interface AcademySectionProps {
  user: User | null;
  appLanguage?: string;
  userTier?: UserTier;
}

type AcademyPhase = 'overview' | 'walkthrough' | 'intro' | 'practice' | 'results';

const TOTAL_LESSONS = ALL_LESSONS.length;

export function AcademySection({ user, appLanguage = 'en-US' }: AcademySectionProps) {
  const t = useTranslations();
  const { loading, saveSession, getLessonStats, isLessonUnlocked, getLessonLockReason, getOverallStats } = useAcademy(user);
  const { state: trainingState, startScenario, confirmContext, sendResponse, endSession, reset } = useTraining();

  const [phase, setPhase] = useState<AcademyPhase>('overview');
  const [activeLesson, setActiveLesson] = useState<CurriculumLesson | null>(null);
  const [activeModule, setActiveModule] = useState<CurriculumModule | null>(null);
  const [saleContext, setSaleContext] = useState('');
  const [saved, setSaved] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEndWarning, setShowEndWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice I/O
  const voiceBufferRef = useRef<string>('');
  const lastProspectIdRef = useRef<string | null>(null);
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isSpeaking, speak, stop: stopSpeaking } = useProspectVoice(appLanguage);
  const { isListening, interimText, startListening, stopListening, errorMessage: speechError } =
    useSpeechRecognition({
      onFinalTranscript: (text) => {
        voiceBufferRef.current = voiceBufferRef.current
          ? `${voiceBufferRef.current} ${text}`
          : text;
        // Auto-submit after 1.5 s of silence
        if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
        autoSubmitTimerRef.current = setTimeout(() => {
          const responseText = voiceBufferRef.current.trim();
          voiceBufferRef.current = '';
          if (responseText) {
            stopListening();
            void sendResponse(responseText);
          }
        }, 1500);
      },
      language: appLanguage,
    });

  // Auto-play each new prospect message
  useEffect(() => {
    if (phase !== 'practice') return;
    const msgs = trainingState.messages;
    const last = msgs[msgs.length - 1];
    if (last?.role === 'prospect' && last.id !== lastProspectIdRef.current) {
      lastProspectIdRef.current = last.id;
      speak(last.text, last.prospectTone);
    }
  }, [trainingState.messages, phase, speak]);

  // Auto-start mic once prospect finishes speaking
  useEffect(() => {
    if (phase !== 'practice' || trainingState.phase !== 'active') return;
    if (!isSpeaking && !isListening && !trainingState.isLoading) {
      const t = setTimeout(() => {
        voiceBufferRef.current = '';
        void startListening();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isSpeaking, isListening, trainingState.isLoading, phase, trainingState.phase, startListening]);

  // Cleanup voice when leaving practice
  useEffect(() => {
    if (phase !== 'practice') {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      stopSpeaking();
      stopListening();
    }
  }, [phase, stopSpeaking, stopListening]);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(true);
      recordPracticeToday();
      void saveSession(activeLesson.id, trainingState.overallScore);
      setShowTranscript(false);
      setPhase('results');
    }
  }, [phase, trainingState.phase, trainingState.overallScore, saved, activeLesson, saveSession]);

  function handleSelectLesson(lesson: CurriculumLesson, mod: CurriculumModule) {
    setActiveLesson(lesson);
    setActiveModule(mod);
    setSaleContext('');
    setSaved(false);
    setShowEndWarning(false);
    reset();
    setPhase('walkthrough');
  }

  async function handleStartPractice(contextOverride?: string) {
    if (!activeLesson) return;
    const ctx = contextOverride !== undefined ? contextOverride : saleContext;
    const subPrompt = SUB_PROMPTS[activeLesson.scenario][activeLesson.subScenarioIndex] ?? '';
    saveContext(ctx.trim());
    startScenario(activeLesson.scenario, appLanguage);
    await confirmContext(ctx || 'my product/service', activeLesson.difficulty, subPrompt, appLanguage);
    setPhase('practice');
  }

  function handleVoiceToggle() {
    if (isListening) {
      // Send immediately without waiting for silence timer
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      stopListening();
      const text = voiceBufferRef.current.trim();
      voiceBufferRef.current = '';
      if (text) void sendResponse(text);
    } else if (!isSpeaking && !trainingState.isLoading) {
      stopSpeaking();
      voiceBufferRef.current = '';
      void startListening();
    }
  }

  function handleBack() {
    reset();
    setPhase('overview');
  }

  function repExchangeCount(): number {
    return trainingState.messages.filter(m => m.role === 'rep').length;
  }

  function handleEndSession() {
    if (!activeLesson) return;
    const exchanges = repExchangeCount();
    if (exchanges < activeLesson.minExchanges) {
      setShowEndWarning(true);
      return;
    }
    setShowEndWarning(false);
    stopListening();
    stopSpeaking();
    void endSession();
  }

  function isModuleUnlocked(modIndex: number): boolean {
    if (modIndex === 0) return true;
    // All lessons in every preceding module must be passed
    for (let i = 0; i < modIndex; i++) {
      const allPassed = CURRICULUM[i].lessons.every(
        l => getLessonStats(l.id, l.passScore)?.passed === true
      );
      if (!allPassed) return false;
    }
    return true;
  }

  function scoreColor(score: number) {
    return score >= 8 ? 'var(--color-accent-green)'
      : score >= 6.5 ? 'var(--color-accent-yellow)'
      : 'var(--color-accent-red)';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OVERVIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'overview') {
    const { attempted, avgScore, totalSessions } = getOverallStats();
    const pct = Math.round((attempted / TOTAL_LESSONS) * 100);
    const streak = getStreak();

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
            <div className="academy__stat">
              <div className="academy__stat-val" style={{ color: streak > 0 ? 'var(--color-accent-cyan)' : undefined }}>
                {streak > 0 ? streak : '-'}
              </div>
              <div className="academy__stat-label">DAY STREAK</div>
            </div>
          </div>
          <div className="academy__progress-wrap">
            <div className="academy__progress-bar">
              <div className="academy__progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="academy__progress-label">{pct}% of lessons practiced</div>
          </div>
        </div>

        <div className="academy__disclaimer">
          <span className="academy__disclaimer-icon">◎</span>
          <span>The Academy teaches fundamentals, not shortcuts. It won't make you a world-class closer overnight -- but it will give you the building blocks that every great salesperson is built on. Learn the concepts, then test them in practice.</span>
        </div>

        <div className="academy__modules">
          {CURRICULUM.map((mod, modIndex) => {
            const modUnlocked = isModuleUnlocked(modIndex);
            const passedInMod = mod.lessons.filter(l => getLessonStats(l.id, l.passScore)?.passed === true).length;
            // Count unpassed lessons across all preceding modules
            const totalPrecedingUnpassed = modIndex > 0
              ? CURRICULUM.slice(0, modIndex).reduce((acc, m) =>
                  acc + m.lessons.filter(l => !getLessonStats(l.id, l.passScore)?.passed).length, 0)
              : 0;

            return (
              <div key={mod.id} className={`academy__module ${!modUnlocked ? 'academy__module--locked' : ''}`}>
                <div className="academy__module-header">
                  <span className={`academy__module-level academy__module-level--${mod.color}`}>
                    {mod.level.toUpperCase()}
                  </span>
                  <span className="academy__module-title">{mod.title}</span>
                  <span className="academy__module-completion">{passedInMod}/{mod.lessons.length} passed</span>
                </div>

                {!modUnlocked ? (
                  <div className="academy__locked-msg">
                    Pass {totalPrecedingUnpassed} more lesson{totalPrecedingUnpassed !== 1 ? 's' : ''} in{' '}
                    {modIndex === 1
                      ? <>&ldquo;{CURRICULUM[0].title}&rdquo;</>
                      : <>&ldquo;{CURRICULUM[0].title}&rdquo; and &ldquo;{CURRICULUM[1].title}&rdquo;</>
                    }{' '}to unlock
                  </div>
                ) : (
                  <div className="academy__lessons">
                    {mod.lessons.map((lesson, lessonIndex) => {
                      const lessonUnlocked = isLessonUnlocked(mod.lessons, lessonIndex);
                      const stats = getLessonStats(lesson.id, lesson.passScore);
                      const attempted = stats !== null;
                      const passed = stats?.passed === true;

                      return (
                        <button
                          key={lesson.id}
                          className={`academy__lesson-row ${passed ? 'academy__lesson-row--mastered' : ''} ${!lessonUnlocked ? 'academy__lesson-row--locked' : ''}`}
                          onClick={() => lessonUnlocked && handleSelectLesson(lesson, mod)}
                          disabled={loading || !lessonUnlocked}
                          title={!lessonUnlocked ? getLessonLockReason(mod.lessons, lessonIndex) : undefined}
                        >
                          <span className="academy__lesson-status">
                            {!lessonUnlocked ? '🔒' : passed ? '✓' : attempted ? '◈' : '○'}
                          </span>

                          {stats?.needsWork && lessonUnlocked && <span className="academy__needs-work">NEEDS WORK</span>}
                          {!lessonUnlocked && <span className="academy__lesson-locked-label">LOCKED</span>}

                          <div className="academy__lesson-info">
                            <div className="academy__lesson-title">{lesson.title}</div>
                            <div className="academy__lesson-concept">{lesson.concept}</div>
                            {lessonUnlocked && !passed && (
                              <div className="academy__lesson-pass-req">
                                Pass: {lesson.passScore}/10 · Min {lesson.minExchanges} exchanges
                              </div>
                            )}
                          </div>

                          {stats && lessonUnlocked ? (
                            <div className="academy__lesson-meta">
                              <span className="academy__lesson-score" style={{ color: scoreColor(stats.bestScore) }}>
                                {stats.bestScore.toFixed(1)}
                              </span>
                              {passed && <span className="academy__lesson-passed-badge">PASSED</span>}
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
                          ) : lessonUnlocked ? (
                            <span className="academy__lesson-start">START →</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="academy__coming-soon">
          <div className="academy__coming-soon-icon">◌</div>
          <div className="academy__coming-soon-title">MORE LESSONS COMING SOON</div>
          <div className="academy__coming-soon-desc">
            New modules covering negotiation tactics, enterprise selling, and managing complex multi-stakeholder deals are in development.
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WALKTHROUGH (animated lesson walkthrough overlay)
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'walkthrough' && activeLesson && activeModule) {
    const lessonIndex = activeModule.lessons.findIndex(l => l.id === activeLesson.id);
    const lessonNumber = lessonIndex + 1;
    const stats = getLessonStats(activeLesson.id, activeLesson.passScore);

    return (
      <LessonWalkthroughScreen
        lesson={activeLesson}
        module={activeModule}
        lessonNumber={lessonNumber}
        stats={stats}
        onStart={(ctx) => { setSaleContext(ctx); void handleStartPractice(ctx); }}
        onBack={handleBack}
        isLoading={trainingState.isLoading}
        error={trainingState.error}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INTRO (lesson teaching page — shown on "Try Again" to skip walkthrough)
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'intro' && activeLesson && activeModule) {
    const lessonIndex = activeModule.lessons.findIndex(l => l.id === activeLesson.id);
    const lessonNumber = lessonIndex + 1;
    const stats = getLessonStats(activeLesson.id, activeLesson.passScore);

    return (
      <div className="academy">
        <main className="training__main">
          <div className="academy__lesson-page">

            {/* Breadcrumb */}
            <div className="academy__intro-breadcrumb">
              <button className="academy__breadcrumb-back" onClick={handleBack}>← Academy</button>
              <span className="academy__intro-breadcrumb-sep">›</span>
              <span>{activeModule.title}</span>
              <span className="academy__intro-breadcrumb-sep">›</span>
              <span className="academy__intro-breadcrumb-lesson">
                Lesson {lessonNumber} of {activeModule.lessons.length}
              </span>
            </div>

            {/* Lesson header */}
            <div className="academy__lesson-header">
              <span className={`academy__lesson-level-badge academy__lesson-level-badge--${activeModule.color}`}>
                {activeModule.level.toUpperCase()}
              </span>
              <h2 className="academy__lesson-title">{activeLesson.title}</h2>
              <p className="academy__lesson-concept">{activeLesson.concept}</p>
            </div>

            {/* Core explanation */}
            <div className="academy__lesson-block">
              <div className="academy__lesson-block-label">THE CONCEPT</div>
              <p className="academy__lesson-body">{activeLesson.lessonBody}</p>
            </div>

            {/* Do Say / Don't Say */}
            <div className="academy__say-grid">
              <div className="academy__say-col academy__say-col--do">
                <div className="academy__say-label academy__say-label--do">✓ SAY THIS</div>
                <ul className="academy__say-list">
                  {activeLesson.doSay.map((s, i) => (
                    <li key={i} className="academy__say-item academy__say-item--do">{s}</li>
                  ))}
                </ul>
              </div>
              <div className="academy__say-col academy__say-col--dont">
                <div className="academy__say-label academy__say-label--dont">✗ NOT THIS</div>
                <ul className="academy__say-list">
                  {activeLesson.dontSay.map((s, i) => (
                    <li key={i} className="academy__say-item academy__say-item--dont">{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Objectives */}
            <div className="academy__lesson-block">
              <div className="academy__lesson-block-label">OBJECTIVES TO HIT IN THE TEST</div>
              <ul className="academy__objectives-list">
                {activeLesson.objectives.map((obj, i) => (
                  <li key={i} className="academy__objective-item">
                    <span className="academy__objective-num">{i + 1}</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coaching tip */}
            <div className="academy__tip-card">
              <div className="academy__tip-label">◈ COACH'S NOTE</div>
              <div className="academy__tip-text">{activeLesson.tip}</div>
            </div>

            {/* Test section */}
            <div className="academy__test-card">
              <div className="academy__test-header">
                <div className="academy__test-title">Now put it into practice</div>
                <div className="academy__test-sub">
                  The AI will play a real prospect. Apply what you just learned. You need at least <strong>{activeLesson.minExchanges} exchanges</strong> before ending — then you'll get a full coaching report.
                </div>
              </div>

              <div className="academy__test-meta">
                <span className={`training__diff-badge training__diff-badge--${activeLesson.difficulty}`}>
                  {activeLesson.difficulty.toUpperCase()}
                </span>
                <span className="academy__test-pass-req">Pass score: {activeLesson.passScore}/10</span>
                {stats && (
                  <span className="academy__test-attempts">
                    {stats.attempts} attempt{stats.attempts !== 1 ? 's' : ''} · Best: {stats.bestScore.toFixed(1)}/10
                  </span>
                )}
              </div>

              <div className="academy__intro-context">
                <div className="academy__intro-context-label">{t.training.whatSelling.toUpperCase()}</div>
                <textarea
                  className="academy__intro-context-input"
                  placeholder="e.g. a $485k 3-bedroom house in Miami, FL"
                  value={saleContext}
                  onChange={e => setSaleContext(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleStartPractice(); } }}
                  rows={2}
                  autoFocus
                />
                {getSavedContexts().length > 0 && (
                  <div className="training__presets">
                    <span className="training__presets-label">{t.training.recent}</span>
                    {getSavedContexts().map((c, i) => (
                      <button key={i} className="training__preset-btn" onClick={() => setSaleContext(c)}>{c}</button>
                    ))}
                  </div>
                )}
              </div>

              {trainingState.error && <div className="training__error">{trainingState.error}</div>}

              <div className="academy__intro-actions">
                <button
                  className="academy__btn academy__btn--primary"
                  onClick={() => void handleStartPractice()}
                  disabled={trainingState.isLoading}
                >
                  {trainingState.isLoading ? t.common.loading : `${t.common.start} →`}
                </button>
                <button className="academy__btn academy__btn--ghost" onClick={handleBack}>
                  Back to Academy
                </button>
              </div>
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
    const exchanges = repExchangeCount();
    const minEx = activeLesson?.minExchanges ?? 4;
    const canEnd = exchanges >= minEx;

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
            <div className="academy__session-right">
              <span className="academy__exchange-counter">
                {exchanges}/{minEx} exchanges
              </span>
              <button
                className={`academy__end-btn ${!canEnd ? 'academy__end-btn--disabled' : ''}`}
                onClick={handleEndSession}
                title={!canEnd ? `Complete at least ${minEx} exchanges before ending` : undefined}
              >
                End Session
              </button>
            </div>
          </div>

          {showEndWarning && (
            <div className="academy__end-warning">
              You need at least <strong>{minEx} exchanges</strong> to complete this lesson.
              You've done <strong>{exchanges}</strong> so far — keep going!
            </div>
          )}

          <div className="training__messages">
            {trainingState.messages.map(msg => (
              <div key={msg.id} className={`training__msg training__msg--${msg.role}`}>
                <div className="training__msg-label">{msg.role === 'prospect' ? t.liveCall.prospect : t.liveCall.you}</div>
                <div className="training__msg-bubble">{msg.text}</div>
              </div>
            ))}
            {trainingState.isLoading && (
              <div className="training__msg training__msg--prospect">
                <div className="training__msg-label">{t.liveCall.prospect}</div>
                <div className="training__msg-bubble training__msg-bubble--loading">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {trainingState.error && <div className="training__error">{trainingState.error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="training__voice-bar">
            {isSpeaking ? (
              <div className="training__prospect-speaking">
                <div className="training__voice-status training__voice-status--speaking">
                  {t.training.prospectSpeaking}
                </div>
                <div className="training__sound-waves">
                  <div className="training__sound-bar" />
                  <div className="training__sound-bar" />
                  <div className="training__sound-bar" />
                  <div className="training__sound-bar" />
                  <div className="training__sound-bar" />
                </div>
                <button className="training__skip-btn" onClick={stopSpeaking}>
                  Skip ›
                </button>
              </div>
            ) : (
              <>
                <div className={`training__voice-status${isListening ? ' training__voice-status--listening' : trainingState.isLoading ? ' training__voice-status--loading' : ''}`}>
                  {isListening ? t.training.yourTurn : trainingState.isLoading ? t.training.aiThinking : t.training.waiting}
                </div>
                <button
                  className={`training__mic-btn${isListening ? ' training__mic-btn--listening' : ''}`}
                  onClick={handleVoiceToggle}
                  disabled={trainingState.isLoading}
                  title={isListening ? 'Send now' : 'Start speaking'}
                >
                  {isListening ? '⏹' : '🎙'}
                </button>
                {(interimText || voiceBufferRef.current) && (
                  <div className="training__voice-interim">
                    {voiceBufferRef.current ? `${voiceBufferRef.current} ${interimText}`.trim() : interimText}
                  </div>
                )}
                {speechError && <div className="training__error">{speechError}</div>}
              </>
            )}
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
    const didPass = score >= activeLesson.passScore;
    const prevStats = getLessonStats(activeLesson.id, activeLesson.passScore);
    const prevBest = prevStats && prevStats.attempts > 1 ? prevStats.allScores[prevStats.allScores.length - 2] : null;
    const delta = prevBest !== null ? score - prevBest : null;

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

            {/* Pass / Fail Banner */}
            <div className={`academy__pass-banner ${didPass ? 'academy__pass-banner--pass' : 'academy__pass-banner--fail'}`}>
              {didPass ? (
                <>
                  <span className="academy__pass-icon">✓</span>
                  <div>
                    <div className="academy__pass-title">Lesson Passed!</div>
                    <div className="academy__pass-sub">
                      You scored {score.toFixed(1)}/10 — above the {activeLesson.passScore} threshold.
                      {nextLesson ? ' Next lesson is now unlocked.' : ' You\'ve completed this module!'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="academy__pass-icon">✗</span>
                  <div>
                    <div className="academy__pass-title">Not Passed Yet</div>
                    <div className="academy__pass-sub">
                      You scored {score.toFixed(1)}/10. You need <strong>{activeLesson.passScore}/10</strong> to unlock the next lesson.
                      Review the feedback below and try again.
                    </div>
                  </div>
                </>
              )}
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
                    ? <>Score dropped by {Math.abs(delta).toFixed(1)} — review the ideal responses above and try again</>
                    : <>Same score as last time — study the ideal responses to push higher</>
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

            {/* Objective Recap */}
            <div className="academy__objectives academy__objectives--results">
              <div className="academy__objectives-label">LESSON OBJECTIVES — REFLECT ON YOUR PRACTICE</div>
              <ul className="academy__objectives-list">
                {activeLesson.objectives.map((obj, i) => (
                  <li key={i} className="academy__objective-item">
                    <span className="academy__objective-num">{i + 1}</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="academy__transcript-toggle"
              onClick={() => setShowTranscript(v => !v)}
            >
              {showTranscript ? 'Hide Conversation ▴' : 'Review Conversation ▾'}
            </button>

            {showTranscript && (
              <div className="academy__transcript-review">
                {trainingState.messages.map(msg => (
                  <div key={msg.id} className={`training__msg training__msg--${msg.role}`}>
                    <div className="training__msg-label">{msg.role === 'prospect' ? t.liveCall.prospect : t.liveCall.you}</div>
                    <div className="training__msg-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="academy__results-actions">
              <button
                className="academy__btn academy__btn--primary"
                onClick={() => { setSaved(false); setPhase('intro'); reset(); }}
              >
                Try Again
              </button>
              {didPass && nextLesson && nextModule ? (
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
