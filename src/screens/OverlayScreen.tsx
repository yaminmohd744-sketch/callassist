import { useState, useEffect } from 'react';
import type { OverlayData } from '../electron';
import type { AISuggestion, CallStage } from '../types/index';
import './OverlayScreen.css';

const TYPE_LABEL: Record<AISuggestion['type'], string> = {
  'objection-handler': 'OBJECTION',
  'closing-prompt':    'CLOSE',
  'tip':               'TIP',
  'alert':             'ALERT',
};

const STAGE_LABEL: Record<CallStage, string> = {
  opener:    'OPENER',
  discovery: 'DISCOVERY',
  pitch:     'PITCH',
  close:     'CLOSE',
};

export function OverlayScreen() {
  const [data, setData] = useState<OverlayData | null>(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSuggestionsUpdate((incoming) => {
      setData(incoming);
    });
    return cleanup;
  }, []);

  function handleClose() {
    window.electronAPI?.closeOverlay();
  }

  const suggestions = data?.suggestions?.slice(-4) ?? [];
  const prob = data?.closeProbability ?? 0;
  const stage = data?.callStage ?? 'opener';
  const name = data?.prospectName ?? '';

  return (
    <div className="overlay">
      {/* Drag handle / header */}
      <div className="overlay__header">
        <div className="overlay__drag-zone">
          <span className="overlay__title">◈ CO-PILOT</span>
          {name && <span className="overlay__prospect">{name}</span>}
        </div>
        <div className="overlay__controls">
          <button
            className="overlay__btn"
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '▲' : '▼'}
          </button>
          <button className="overlay__btn overlay__btn--close" onClick={handleClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Stage + probability bar */}
          <div className="overlay__meta">
            <span className={`overlay__stage overlay__stage--${stage}`}>
              {STAGE_LABEL[stage]}
            </span>
            <div className="overlay__prob-bar">
              <div className="overlay__prob-fill" style={{ width: `${prob}%` }} />
            </div>
            <span className="overlay__prob-value">{prob}%</span>
          </div>

          {/* Suggestions */}
          <div className="overlay__suggestions">
            {suggestions.length === 0 ? (
              <div className="overlay__empty">
                <div className="overlay__empty-icon">◎</div>
                <div className="overlay__empty-text">Waiting for call activity…</div>
              </div>
            ) : (
              suggestions.map(s => (
                <div key={s.id} className={`overlay__card overlay__card--${s.type}`}>
                  <div className="overlay__card-type">{TYPE_LABEL[s.type]}</div>
                  <div className="overlay__card-headline">{s.headline}</div>
                  <div className="overlay__card-body">{s.body}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
