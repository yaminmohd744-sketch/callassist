import { useState, useEffect } from 'react';
import type { OverlayData } from '../electron';
import type { AISuggestion, CallStage } from '../types/index';
import './OverlayScreen.css';

const STAGE_LABEL: Record<CallStage, string> = {
  opener:    'OPENER',
  discovery: 'DISCOVERY',
  pitch:     'PITCH',
  close:     'CLOSE',
};

const TYPE_LABEL: Record<AISuggestion['type'], string> = {
  'objection-response': 'HANDLE OBJECTION',
  'close-attempt':      'CLOSE',
  'tip':                'NEXT MOVE',
  'discovery':          'GO DEEPER',
};

const DEMO_DATA: OverlayData = {
  prospectName: 'Sarah Chen',
  callStage: 'pitch',
  closeProbability: 72,
  suggestions: [
    {
      id: 'd1',
      type: 'tip',
      headline: 'She mentioned budget constraints twice — anchor on ROI now',
      body: '"Reference the $40k savings her competitor achieved in Q1. Frame this as an investment, not a cost."',
      triggeredBy: 'demo',
      timestampSeconds: 120,
      streaming: false,
    },
    {
      id: 'd2',
      type: 'objection-response',
      headline: 'Objection: "We already have a solution for this"',
      body: '"That\'s great — what\'s the one thing you wish it did better? Most teams we work with find that\'s the gap costing them the most time."',
      triggeredBy: 'demo',
      timestampSeconds: 210,
      streaming: false,
    },
  ],
};

export function OverlayScreen() {
  const isDemo = !window.electronAPI;
  const [data, setData] = useState<OverlayData | null>(isDemo ? DEMO_DATA : null);
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

  const suggestions = data?.suggestions ?? [];
  const prob = data?.closeProbability ?? 0;
  const stage = data?.callStage ?? 'opener';
  const name = data?.prospectName ?? '';

  // Show the 3 most recent suggestions, newest on top
  const feed = [...suggestions].reverse().slice(0, 3);

  return (
    <div className="ov">
      {/* Drag handle / pill bar */}
      <div className="ov__bar">
        <div className="ov__bar-left">
          <span className="ov__icon">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="white" strokeWidth="1.4"/>
              <circle cx="6.5" cy="6.5" r="2" fill="white"/>
            </svg>
          </span>
          <span className="ov__brand">Co-Pilot</span>
          {name && <span className="ov__prospect">· {name}</span>}
        </div>
        <div className="ov__bar-right">
          <div className={`ov__stage ov__stage--${stage}`}>{STAGE_LABEL[stage]}</div>
          <div className="ov__prob">{prob}%</div>
          <button
            className="ov__ctrl"
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Expand' : 'Collapse'}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              {minimized
                ? <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </button>
          <button className="ov__ctrl ov__ctrl--close" onClick={handleClose} title="Close">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="ov__feed">
          {feed.length === 0 ? (
            <div className="ov__empty">
              <div className="ov__empty-icon">◎</div>
              <div className="ov__empty-text">Listening to your call…</div>
            </div>
          ) : (
            feed.map(s => (
              <div key={s.id} className={`ov__card ov__card--${s.type}`}>
                <div className="ov__card-badge">{TYPE_LABEL[s.type]}</div>
                <div className="ov__card-script">
                  {s.body}
                  {s.streaming && <span className="ov__cursor">▌</span>}
                </div>
                {!s.streaming && s.headline && (
                  <div className="ov__card-why">
                    <span className="ov__card-why-label">WHY</span>
                    {s.headline}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
