
import { useState } from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import type { AISuggestion, CallStage } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './AIIntelligencePanel.css';

const OBJECTION_REFERENCE = [
  {
    objection: '"It\'s too expensive"',
    rebuttal: '"Is it the price, or whether you\'ll see the return? What ROI would make this a no-brainer?"',
  },
  {
    objection: '"I need to think about it"',
    rebuttal: '"What specifically are you thinking through? Let\'s work through it now so you have everything you need."',
  },
  {
    objection: '"Send me some information"',
    rebuttal: '"Of course what specifically would help you most? And what would need to be in that info to move things forward?"',
  },
  {
    objection: '"We\'re happy with our current solution"',
    rebuttal: '"That\'s great to hear. If you could change one thing about it, what would it be?"',
  },
  {
    objection: '"Not the right time"',
    rebuttal: '"When would be the right time? What needs to change between now and then?"',
  },
  {
    objection: '"I need to run it by my team"',
    rebuttal: '"If they\'re on board, are you ready to move forward? What would they need to see?"',
  },
];

interface AIIntelligencePanelProps {
  suggestions: AISuggestion[];
  callStage: CallStage;
}

export function AIIntelligencePanel({ suggestions, callStage }: AIIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<'coaching' | 'objections'>('coaching');
  const t = useTranslations();
  const isEmpty = suggestions.length === 0;

  const STAGE_LABEL: Record<CallStage, string> = {
    opener:    t.liveCall.stageOpener,
    discovery: t.liveCall.stageDiscovery,
    pitch:     t.liveCall.stagePitch,
    close:     t.liveCall.stageClose,
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <div className="ai-panel__header-left">
          <div className="ai-panel__title">
            {t.liveCall.aiFeed}
            <span className="ai-panel__cursor">▋</span>
          </div>
          <div className="ai-panel__tabs">
            <button
              className={`ai-panel__tab ${activeTab === 'coaching' ? 'ai-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('coaching')}
            >
              {t.liveCall.coaching}
            </button>
            <button
              className={`ai-panel__tab ${activeTab === 'objections' ? 'ai-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('objections')}
            >
              {t.liveCall.objections}
            </button>
          </div>
        </div>
        <div className="ai-panel__header-right">
          <div className={`ai-panel__stage ai-panel__stage--${callStage}`}>
            {STAGE_LABEL[callStage]}
          </div>
        </div>
      </div>

      <div className="ai-panel__body">
        {activeTab === 'objections' ? (
          <div className="ai-panel__objections">
            {OBJECTION_REFERENCE.map((item, i) => (
              <div key={i} className="ai-panel__objection-card">
                <div className="ai-panel__objection-q">{item.objection}</div>
                <div className="ai-panel__objection-a">{item.rebuttal}</div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
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
