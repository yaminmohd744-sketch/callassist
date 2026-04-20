
import type { AISuggestion, SuggestionType } from '../../types';
import './SuggestionCard.css';

const TYPE_LABEL: Record<SuggestionType, string> = {
  'objection-response': 'HANDLE OBJECTION',
  'close-attempt':      'CLOSE',
  'tip':                'NEXT MOVE',
  'discovery':          'GO DEEPER',
};

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const isStreaming = suggestion.streaming === true;

  return (
    <div className={`suggestion-card suggestion-card--${suggestion.type}${isStreaming ? ' suggestion-card--streaming' : ''}`}>
      <div className="suggestion-card__header">
        <span className="suggestion-card__badge">
          {isStreaming && !suggestion.body ? '...' : TYPE_LABEL[suggestion.type]}
        </span>
        <span className="suggestion-card__time">{formatTime(suggestion.timestampSeconds)}</span>
      </div>
      {(() => {
        const parts = suggestion.body.split('\n\n');
        const script = parts[0];
        const note   = parts.length > 1 ? parts.slice(1).join(' ') : null;
        return (
          <>
            <div className="suggestion-card__script">
              {script}
              {isStreaming && <span className="suggestion-card__cursor" aria-hidden="true">▌</span>}
            </div>
            {!isStreaming && note && (
              <div className="suggestion-card__note">{note}</div>
            )}
          </>
        );
      })()}
      {!isStreaming && suggestion.headline && (
        <div className="suggestion-card__why">
          <span className="suggestion-card__why-label">WHY</span>
          {suggestion.headline}
        </div>
      )}
      {!isStreaming && suggestion.triggeredBy && !suggestion.triggeredBy.startsWith('quick-action') && suggestion.triggeredBy !== 'stage-advancement' && (
        <div className="suggestion-card__trigger">
          Triggered by: <em>"{suggestion.triggeredBy.slice(0, 60)}{suggestion.triggeredBy.length > 60 ? '...' : ''}"</em>
        </div>
      )}
      {suggestion.isFallback && (
        <div className="suggestion-card__fallback-note">~ offline mode</div>
      )}
    </div>
  );
}
