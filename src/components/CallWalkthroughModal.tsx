import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/Button';
import type { CallSession } from '../types';
import { generateCoaching } from '../lib/mockAI';
import { formatDuration, formatDateFull } from '../lib/formatters';
import './CallWalkthroughModal.css';

interface Props {
  session: CallSession;
  onViewFull: () => void;
  onClose: () => void;
}

type Step = 'verdict' | 'well' | 'improve' | 'moments' | 'tip' | 'done';

function buildSteps(session: CallSession): Step[] {
  const steps: Step[] = ['verdict', 'well', 'improve'];
  if (session.coaching?.keyMoments?.length) steps.push('moments');
  steps.push('tip', 'done');
  return steps;
}

export function CallWalkthroughModal({ session, onViewFull, onClose }: Props) {
  // For sessions loaded from history before coaching was persisted, generate it on the fly
  const coaching = useMemo(
    () => session.coaching ?? generateCoaching(
      session.config, session.transcript, session.suggestions,
      session.finalCloseProbability, session.objectionsCount
    ),
    [session]
  );
  const steps = buildSteps(session);
  const [stepIndex, setStepIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function goNext() {
    if (isLast) return;
    setDirection('forward');
    setAnimKey(k => k + 1);
    setStepIndex(i => i + 1);
  }

  function goBack() {
    if (isFirst) return;
    setDirection('back');
    setAnimKey(k => k + 1);
    setStepIndex(i => i - 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      if (e.key === 'ArrowLeft')  goBack();
      if (e.key === 'Escape')     onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const probLevel = session.finalCloseProbability >= 61 ? 'high' : session.finalCloseProbability >= 31 ? 'medium' : 'low';
  const scoreLevel = session.leadScore >= 70 ? 'high' : session.leadScore >= 40 ? 'medium' : 'low';

  return (
    <div className="wt-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wt-modal">
        {/* Header */}
        <div className="wt-header">
          <div className="wt-header-meta">
            <span className="wt-header-name">{session.config.prospectName || 'Call Review'}</span>
            {session.config.company && <span className="wt-header-company"> · {session.config.company}</span>}
            <span className="wt-header-sep">·</span>
            <span className="wt-header-date">{formatDateFull(session.endedAt)}</span>
          </div>
          <button className="wt-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Progress bar */}
        <div className="wt-progress-bar">
          <div className="wt-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Step dots */}
        <div className="wt-dots">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`wt-dot ${i === stepIndex ? 'wt-dot--active' : ''} ${i < stepIndex ? 'wt-dot--done' : ''}`}
              onClick={() => { setDirection(i > stepIndex ? 'forward' : 'back'); setAnimKey(k => k + 1); setStepIndex(i); }}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="wt-content">
          <div key={animKey} className={`wt-step wt-step--${direction}`}>

            {/* ── VERDICT ── */}
            {currentStep === 'verdict' && (
              <div className="wt-screen wt-screen--verdict">
                <div className="wt-screen-label">CALL VERDICT</div>
                <div className="wt-verdict-goal">{session.config.callGoal}</div>
                <div className="wt-verdict-text">{coaching?.overallVerdict ?? 'Call reviewed.'}</div>
                <div className="wt-verdict-scores">
                  <div className={`wt-score-card wt-score-card--${probLevel}`}>
                    <div className="wt-score-val">{session.finalCloseProbability}%</div>
                    <div className="wt-score-label">CLOSE PROBABILITY</div>
                  </div>
                  <div className={`wt-score-card wt-score-card--${scoreLevel}`}>
                    <div className="wt-score-val">{session.leadScore}</div>
                    <div className="wt-score-label">LEAD SCORE</div>
                  </div>
                  <div className="wt-score-card">
                    <div className="wt-score-val">{formatDuration(session.durationSeconds)}</div>
                    <div className="wt-score-label">DURATION</div>
                  </div>
                  <div className="wt-score-card">
                    <div className={`wt-score-val wt-score-val--stage wt-score-val--${session.callStage}`}>{session.callStage.toUpperCase()}</div>
                    <div className="wt-score-label">STAGE REACHED</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── WHAT WENT WELL ── */}
            {currentStep === 'well' && (
              <div className="wt-screen">
                <div className="wt-screen-label wt-screen-label--green">WHAT WENT WELL</div>
                <div className="wt-items-list">
                  {(coaching?.whatWentWell ?? []).map((item, i) => (
                    <div key={i} className="wt-item wt-item--green" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="wt-item-dot wt-item-dot--green" />
                      <div className="wt-item-body">
                        <div className="wt-item-point">{item.point}</div>
                        <div className="wt-item-note">{item.salesNote}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── AREAS TO IMPROVE ── */}
            {currentStep === 'improve' && (
              <div className="wt-screen">
                <div className="wt-screen-label wt-screen-label--orange">AREAS TO IMPROVE</div>
                <div className="wt-items-list">
                  {(coaching?.areasToImprove ?? []).map((item, i) => (
                    <div key={i} className="wt-item wt-item--orange" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="wt-item-dot wt-item-dot--orange" />
                      <div className="wt-item-body">
                        <div className="wt-item-point">{item.point}</div>
                        <div className="wt-item-note">{item.salesNote}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── KEY MOMENTS ── */}
            {currentStep === 'moments' && (
              <div className="wt-screen">
                <div className="wt-screen-label">KEY MOMENTS</div>
                <div className="wt-moments">
                  {(coaching?.keyMoments ?? []).map((m, i) => {
                    const mins = String(Math.floor(m.timestampSeconds / 60)).padStart(2, '0');
                    const secs = String(m.timestampSeconds % 60).padStart(2, '0');
                    return (
                      <div key={i} className={`wt-moment wt-moment--${m.label === 'Objection' ? 'obj' : 'sig'}`} style={{ animationDelay: `${i * 0.12}s` }}>
                        <div className="wt-moment-time">{mins}:{secs}</div>
                        <div className="wt-moment-label">{m.label}</div>
                        <div className="wt-moment-note">{m.note}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TIP ── */}
            {currentStep === 'tip' && (
              <div className="wt-screen wt-screen--tip">
                <div className="wt-screen-label wt-screen-label--purple">TIP FOR YOUR NEXT CALL</div>
                <div className="wt-tip-card">
                  <div className="wt-tip-icon">◆</div>
                  <div className="wt-tip-text">{coaching?.nextCallTip ?? 'Keep refining your discovery questions.'}</div>
                </div>
                <div className="wt-tip-sub">This tip has been saved and will appear before your next call.</div>
              </div>
            )}

            {/* ── DONE ── */}
            {currentStep === 'done' && (
              <div className="wt-screen wt-screen--done">
                <div className="wt-done-icon">✓</div>
                <div className="wt-done-title">Review Complete</div>
                <div className="wt-done-sub">
                  You've walked through the full coaching breakdown for your call with{' '}
                  <strong>{session.config.prospectName || 'this prospect'}</strong>.
                </div>
                <div className="wt-done-actions">
                  <Button variant="primary" size="lg" onClick={onViewFull}>
                    OPEN FULL REPORT →
                  </Button>
                  <Button variant="ghost" size="md" onClick={onClose}>
                    CLOSE
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer nav */}
        {currentStep !== 'done' && (
          <div className="wt-footer">
            <button className="wt-nav-btn wt-nav-btn--back" onClick={goBack} disabled={isFirst}>
              ← BACK
            </button>
            <span className="wt-step-counter">{stepIndex + 1} / {steps.length}</span>
            <button className="wt-nav-btn wt-nav-btn--next" onClick={goNext}>
              {stepIndex === steps.length - 2 ? 'FINISH ✓' : 'NEXT →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
