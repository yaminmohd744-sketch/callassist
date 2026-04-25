
import { SuggestionCard } from '../cards/SuggestionCard';
import type { AISuggestion, CallStage, ProspectTone } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './AIIntelligencePanel.css';

const TONE_COLOR: Record<ProspectTone, string> = {
  Skeptical:   '#f59e0b',
  Curious:     '#814ac8',
  Defensive:   '#ef4444',
  Warm:        '#22c55e',
  Disengaged:  '#6b7280',
  Frustrated:  '#f97316',
  Excited:     '#a3e635',
  Hesitant:    '#eab308',
  Neutral:     '#94a3b8',
};

interface AIIntelligencePanelProps {
  suggestions: AISuggestion[];
  callStage: CallStage;
  phaseLabel?: string;
  prospectTone?: ProspectTone | null;
  talkRatio?: number;
  fillerCount?: number;
}

export function AIIntelligencePanel({
  suggestions,
  callStage,
  phaseLabel,
  prospectTone,
  talkRatio,
  fillerCount = 0,
}: AIIntelligencePanelProps) {
  const t = useTranslations();

  const STAGE_LABEL: Record<CallStage, string> = {
    opener:    t.liveCall.stageOpener,
    discovery: t.liveCall.stageDiscovery,
    pitch:     t.liveCall.stagePitch,
    close:     t.liveCall.stageClose,
  };

  const isEmpty = suggestions.length === 0;
  const repPct = talkRatio !== undefined ? Math.round(talkRatio * 100) : null;
  const talkWarning = repPct !== null && repPct > 65;

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <div className="ai-panel__header-left">
          <div className="ai-panel__title">
            {t.liveCall.aiFeed}
            <span className="ai-panel__cursor">▋</span>
          </div>
        </div>
        <div className="ai-panel__header-right">
          {prospectTone && (
            <div
              className="ai-panel__tone-pill"
              style={{ '--tone-color': TONE_COLOR[prospectTone] } as React.CSSProperties}
            >
              <span className="ai-panel__tone-dot" />
              {prospectTone.toUpperCase()}
            </div>
          )}
          <div className={`ai-panel__stage ai-panel__stage--${callStage}`}>
            {phaseLabel || STAGE_LABEL[callStage]}
          </div>
        </div>
      </div>

      {repPct !== null && (
        <div className={`ai-panel__talk-row${talkWarning ? ' ai-panel__talk-row--warn' : ''}`}>
          <span className="ai-panel__talk-label">YOU {repPct}%</span>
          <div className="ai-panel__talk-bar">
            <div className="ai-panel__talk-bar-fill" style={{ width: `${repPct}%` }} />
          </div>
          <span className="ai-panel__talk-label">{100 - repPct}% THEM</span>
          {fillerCount > 0 && (
            <span className={`ai-panel__filler${fillerCount >= 5 ? ' ai-panel__filler--high' : ''}`}>
              {fillerCount} filler{fillerCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <div className="ai-panel__body">
        {isEmpty ? (
          <div className="ai-panel__empty">
            <div className="ai-panel__empty-icon">◎</div>
            <div className="ai-panel__empty-title">{t.liveCall.readyToAssist}</div>
            <div className="ai-panel__empty-desc">
              {t.liveCall.readyDesc}
            </div>
            <div className="ai-panel__empty-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <div className="ai-panel__cards">
            {suggestions.map(s => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
