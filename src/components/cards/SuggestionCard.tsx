
import type { AISuggestion, SuggestionType } from '../../types';
import './SuggestionCard.css';

const TYPE_LABEL: Record<SuggestionType, string> = {
  'objection-response': 'HANDLE OBJECTION',
  'close-attempt':      'CLOSE',
  'tip':                'NEXT MOVE',
  'discovery':          'GO DEEPER',
};

const PHYSICAL_LABEL: Record<string, string> = {
  nod:     'NOD',
  eye:     'EYE CONTACT',
  lean:    'LEAN IN',
  chin:    'CHIN UP',
  quiet:   'STAY QUIET',
  posture: 'SIT UP',
  smile:   'SMILE',
  pause:   'PAUSE',
};

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const isStreaming = suggestion.streaming === true;
  const hasPhysical = !!suggestion.physicalAction;
  const hasVerbal = !!suggestion.body;

  return (
    <div className={`suggestion-card suggestion-card--${suggestion.type}${isStreaming ? ' suggestion-card--streaming' : ''}`}>
      <div className="suggestion-card__header">
        <span className="suggestion-card__badge">
          {isStreaming && !suggestion.body ? '...' : TYPE_LABEL[suggestion.type]}
        </span>
        <span className="suggestion-card__time">{formatTime(suggestion.timestampSeconds)}</span>
      </div>

      {hasPhysical && (
        <div className="suggestion-card__physical">
          <span className="suggestion-card__physical-badge">
            {PHYSICAL_LABEL[suggestion.physicalIcon ?? ''] ?? (suggestion.physicalIcon?.toUpperCase() ?? 'DO')}
          </span>
          <span className="suggestion-card__physical-text">{suggestion.physicalAction}</span>
        </div>
      )}

      {hasVerbal && (() => {
        const parts = suggestion.body.split('\n\n');
        const script = parts[0];
        const note   = parts.length > 1 ? parts.slice(1).join(' ') : null;
        return (
          <>
            <div className={`suggestion-card__script${hasPhysical ? ' suggestion-card__script--below-physical' : ''}`}>
              {!isStreaming && <span className="suggestion-card__say-label">SAY</span>}
              <span className="suggestion-card__say-text">
                {!isStreaming && '"'}{script}{!isStreaming && '"'}
              </span>
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
      {!isStreaming && suggestion.triggeredBy
        && !suggestion.triggeredBy.startsWith('quick-action')
        && suggestion.triggeredBy !== 'stage-advancement'
        && !suggestion.triggeredBy.startsWith('body:') && (
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
