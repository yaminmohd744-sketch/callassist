
import { SuggestionCard } from '../cards/SuggestionCard';
import type { AISuggestion, CallStage } from '../../types';
import './AIIntelligencePanel.css';

const STAGE_LABEL: Record<CallStage, string> = {
  opener:    'OPENER',
  discovery: 'DISCOVERY',
  pitch:     'PITCH',
  close:     'CLOSE',
};

interface AIIntelligencePanelProps {
  suggestions: AISuggestion[];
  callStage: CallStage;
}

export function AIIntelligencePanel({ suggestions, callStage }: AIIntelligencePanelProps) {
  const isEmpty = suggestions.length === 0;

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <div className="ai-panel__title">
          AI INTELLIGENCE FEED
          <span className="ai-panel__cursor">▋</span>
        </div>
        <div className={`ai-panel__stage ai-panel__stage--${callStage}`}>
          {STAGE_LABEL[callStage]}
        </div>
      </div>

      <div className="ai-panel__body">
        {isEmpty ? (
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
            {suggestions.map(s => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
