
import { useState } from 'react';
import { SuggestionCard } from '../cards/SuggestionCard';
import type { AISuggestion, CallStage, ProspectTone, ToneCoaching } from '../../types';
import './AIIntelligencePanel.css';

const STAGE_LABEL: Record<CallStage, string> = {
  opener:    'OPENER',
  discovery: 'DISCOVERY',
  pitch:     'PITCH',
  close:     'CLOSE',
};

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

const TONE_COLORS: Record<ProspectTone, string> = {
  Skeptical:   '#f0e040',
  Curious:     '#00cfff',
  Defensive:   '#ff6b6b',
  Warm:        '#39d353',
  Disengaged:  '#888888',
  Frustrated:  '#ff8c42',
  Excited:     '#df7afe',
  Hesitant:    '#c8a830',
  Neutral:     'rgba(255,255,255,0.5)',
};

interface AIIntelligencePanelProps {
  suggestions: AISuggestion[];
  callStage: CallStage;
  prospectTone?: ProspectTone | null;
  toneCoaching?: ToneCoaching | null;
}

export function AIIntelligencePanel({ suggestions, callStage, prospectTone, toneCoaching }: AIIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<'coaching' | 'objections'>('coaching');
  const isEmpty = suggestions.length === 0 && !toneCoaching;

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <div className="ai-panel__header-left">
          <div className="ai-panel__title">
            AI INTELLIGENCE FEED
            <span className="ai-panel__cursor">▋</span>
          </div>
          <div className="ai-panel__tabs">
            <button
              className={`ai-panel__tab ${activeTab === 'coaching' ? 'ai-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('coaching')}
            >
              COACHING
            </button>
            <button
              className={`ai-panel__tab ${activeTab === 'objections' ? 'ai-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('objections')}
            >
              OBJECTIONS
            </button>
          </div>
        </div>
        <div className="ai-panel__header-right">
          {prospectTone && (
            <div
              className="ai-panel__tone-pill"
              style={{ '--tone-color': TONE_COLORS[prospectTone] } as React.CSSProperties}
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
            <div className="ai-panel__empty-title">Ready to Assist</div>
            <div className="ai-panel__empty-desc">
              Click <strong>Listen</strong> in the transcript panel to start your mic.
              I'll detect objections, buying signals, and coach you in real-time.
            </div>
            <div className="ai-panel__empty-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <div className="ai-panel__cards">
            {toneCoaching && (
              <div
                className="ai-panel__tone-card"
                style={{ '--tone-color': TONE_COLORS[toneCoaching.tone] } as React.CSSProperties}
              >
                <div className="ai-panel__tone-card-header">
                  <span className="ai-panel__tone-card-dot" />
                  <span className="ai-panel__tone-card-label">TONE: {toneCoaching.tone.toUpperCase()}</span>
                </div>
                <div className="ai-panel__tone-card-move">
                  <span className="ai-panel__tone-card-tag">MOVE</span>
                  {toneCoaching.move}
                </div>
                <div className="ai-panel__tone-card-say">
                  <span className="ai-panel__tone-card-tag">SAY</span>
                  <em>"{toneCoaching.say}"</em>
                </div>
              </div>
            )}
            {suggestions.map(s => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
