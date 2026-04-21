
import { useMemo } from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import type { AISuggestion, CallStage, ProspectTone, ToneCoaching } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './AIIntelligencePanel.css';

const TONE_COLOR: Record<ProspectTone, string> = {
  Skeptical:   '#f59e0b',
  Curious:     '#00cfff',
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
  prospectTone?: ProspectTone | null;
  toneCoaching?: ToneCoaching | null;
}

export function AIIntelligencePanel({
  suggestions,
  callStage,
  prospectTone,
  toneCoaching,
}: AIIntelligencePanelProps) {
  const t = useTranslations();

  const STAGE_LABEL: Record<CallStage, string> = {
    opener:    t.liveCall.stageOpener,
    discovery: t.liveCall.stageDiscovery,
    pitch:     t.liveCall.stagePitch,
    close:     t.liveCall.stageClose,
  };

  // Convert tone coaching into a normal suggestion card so it renders identically
  // to AI-generated suggestions — no special UI treatment.
  const toneSuggestion = useMemo<AISuggestion | null>(() => {
    if (!toneCoaching) return null;
    return {
      id: 'tone-live',
      type: 'tip',
      headline: `${toneCoaching.tone} tone — read this`,
      body: `${toneCoaching.move}\n\n"${toneCoaching.say}"`,
      triggeredBy: 'voice-tone',
      timestampSeconds: 0,
      streaming: false,
    };
  }, [toneCoaching]);

  const allCards = useMemo<AISuggestion[]>(() => {
    return toneSuggestion ? [toneSuggestion, ...suggestions] : suggestions;
  }, [toneSuggestion, suggestions]);

  const isEmpty = allCards.length === 0;

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
            {STAGE_LABEL[callStage]}
          </div>
        </div>
      </div>

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
            {allCards.map(s => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
