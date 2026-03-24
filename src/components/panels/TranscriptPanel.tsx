import { useRef, useEffect } from 'react';
import type { TranscriptEntry } from '../../types';
import './TranscriptPanel.css';

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  isListening: boolean;
  interimText: string;
  errorMessage?: string | null;
  manualInput: string;
  onManualInputChange: (val: string) => void;
  onManualSubmit: () => void;
  onFlipSpeaker?: (id: string) => void;
}

export function TranscriptPanel({
  entries,
  isListening,
  interimText,
  errorMessage,
  manualInput,
  onManualInputChange,
  onManualSubmit,
  onFlipSpeaker,
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length, interimText]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onManualSubmit();
  }

  return (
    <div className="transcript-panel">
      <div className="transcript-panel__header">
        <div className="transcript-panel__title">
          <span className={`transcript-panel__indicator ${isListening ? 'transcript-panel__indicator--active' : ''}`} />
          TRANSCRIPT FEED
        </div>
        {isListening && <span className="transcript-panel__live-badge">● LIVE</span>}
      </div>

      {errorMessage && (
        <div className="transcript-panel__error">{errorMessage}</div>
      )}

      <div className="transcript-panel__body">
        {entries.length === 0 && !interimText && (
          <div className="transcript-panel__empty">
            {isListening
              ? 'Listening - speakers are detected automatically.'
              : 'Mic starting... or type prospect dialogue below.'}
          </div>
        )}

        {entries.map(entry => {
          const isFlippable = entry.speaker !== 'system' && !!onFlipSpeaker;
          const label = entry.speaker === 'rep' ? 'YOU' : entry.speaker === 'prospect' ? 'PROSPECT' : 'SYSTEM';
          return (
            <div
              key={entry.id}
              className={`transcript-entry transcript-entry--${entry.signal} transcript-entry--${entry.speaker}`}
            >
              <div className="transcript-entry__meta">
                {isFlippable ? (
                  <button
                    type="button"
                    className="transcript-entry__speaker transcript-entry__speaker--flip"
                    onClick={() => onFlipSpeaker(entry.id)}
                    title="Click to reassign speaker"
                  >
                    {label}<span className="transcript-entry__flip-icon" aria-hidden="true">⇄</span>
                  </button>
                ) : (
                  <span className="transcript-entry__speaker">{label}</span>
                )}
                <span className="transcript-entry__time">{formatTime(entry.timestampSeconds)}</span>
              </div>
              <div className="transcript-entry__text">{entry.text}</div>
            </div>
          );
        })}

        {interimText && (
          <div className="transcript-entry transcript-entry--interim">
            <div className="transcript-entry__meta">
              <span className="transcript-entry__speaker">LIVE</span>
            </div>
            <div className="transcript-entry__text">{interimText}<span className="transcript-entry__cursor">_</span></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="transcript-panel__input">
        <input
          className="transcript-panel__text"
          placeholder="Type what the prospect said..."
          value={manualInput}
          onChange={e => onManualInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="transcript-panel__send"
          onClick={onManualSubmit}
          disabled={!manualInput.trim()}
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
