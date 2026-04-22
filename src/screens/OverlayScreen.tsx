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
  'objection-response': 'HANDLE',
  'close-attempt':      'CLOSE',
  'tip':                'NEXT',
  'discovery':          'DEEPER',
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
  ],
};

export function OverlayScreen() {
  const isDemo = !window.electronAPI;
  const [data, setData] = useState<OverlayData | null>(isDemo ? DEMO_DATA : null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.onSuggestionsUpdate((incoming) => {
      setData(incoming);
    });
    return cleanup;
  }, []);

  const suggestions = data?.suggestions ?? [];
  const prob        = data?.closeProbability ?? 0;
  const stage       = data?.callStage ?? 'opener';
  const name        = data?.prospectName ?? '';
  const latest      = suggestions.length > 0 ? suggestions[suggestions.length - 1] : null;

  return (
    <div className="ov">
      {/* ── Bar row (drag handle) ── */}
      <div className="ov__bar">
        <div className="ov__brand">
          <span className="ov__dot" />
          <span className="ov__logo">
            PITCH<span className="ov__logo-plus">PLUS</span>
          </span>
          {name && <span className="ov__prospect">· {name}</span>}
        </div>

        <div className="ov__stats">
          <span className={`ov__stage ov__stage--${stage}`}>{STAGE_LABEL[stage]}</span>
          <span className="ov__prob">{prob}%</span>
        </div>

        <div className="ov__actions">
          <button
            className="ov__btn-icon"
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              {expanded
                ? <path d="M2 7L5.5 3.5L9 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </button>
          <button
            className="ov__btn-end"
            onClick={() => window.electronAPI?.endCallFromOverlay()}
          >
            ■ End
          </button>
        </div>
      </div>

      {/* ── Suggestion row ── */}
      {expanded && (
        <div className="ov__body">
          {latest ? (
            <>
              <span className="ov__body-label">{TYPE_LABEL[latest.type]}</span>
              <span className="ov__body-text">
                {latest.body}
                {latest.streaming && <span className="ov__cursor">▌</span>}
              </span>
            </>
          ) : (
            <>
              <span className="ov__body-dot" />
              <span className="ov__body-idle">Listening to your call…</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
