
import type { AISuggestion, SuggestionType } from '../../types';
import './SuggestionCard.css';

const TYPE_LABEL: Record<SuggestionType, string> = {
  'objection-handler': 'OBJECTION HANDLER',
  'closing-prompt':    'CLOSING PROMPT',
  'tip':               'AI TIP',
  'alert':             'ALERT',
};

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div className={`suggestion-card suggestion-card--${suggestion.type}`}>
      <div className="suggestion-card__header">
        <span className="suggestion-card__badge">{TYPE_LABEL[suggestion.type]}</span>
        <span className="suggestion-card__time">{formatTime(suggestion.timestampSeconds)}</span>
      </div>
      <div className="suggestion-card__headline">{suggestion.headline}</div>
      <div className="suggestion-card__body">{suggestion.body}</div>
      {suggestion.triggeredBy && suggestion.triggeredBy !== 'stage-advancement' && !suggestion.triggeredBy.startsWith('quick-action') && (
        <div className="suggestion-card__trigger">
          Triggered by: <em>"{suggestion.triggeredBy.slice(0, 60)}{suggestion.triggeredBy.length > 60 ? '...' : ''}"</em>
        </div>
      )}
    </div>
  );
}
