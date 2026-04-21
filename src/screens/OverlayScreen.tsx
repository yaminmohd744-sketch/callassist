import { useState, useEffect, useRef } from 'react';
import type { OverlayData } from '../electron';
import type { AISuggestion, CallStage } from '../types/index';
import './OverlayScreen.css';

type QuickTab = 'assist' | 'what-to-say' | 'objections' | 'recap';

const STAGE_LABEL: Record<CallStage, string> = {
  opener:    'OPENER',
  discovery: 'DISCOVERY',
  pitch:     'PITCH',
  close:     'CLOSE',
};

const TYPE_LABEL: Record<AISuggestion['type'], string> = {
  'objection-response': 'OBJECTION',
  'close-attempt':      'CLOSE',
  'tip':                'TIP',
  'discovery':          'DISCOVERY',
};

const OBJECTION_REBUTTALS = [
  { q: '"It\'s too expensive"',           a: '"Is it the price, or the return? What ROI would make this a no-brainer?"' },
  { q: '"I need to think about it"',      a: '"What specifically? Let\'s work through it now so you have everything you need."' },
  { q: '"Send me some information"',      a: '"Of course — what specifically would help most? What would need to be in it to move things forward?"' },
  { q: '"We\'re happy with our current solution"', a: '"If you could change one thing about it, what would it be?"' },
  { q: '"Not the right time"',            a: '"When would be the right time? What needs to change between now and then?"' },
  { q: '"Need to run it by my team"',     a: '"If they\'re on board, are you ready to move forward? What would they need to see?"' },
];

const DEMO_DATA: OverlayData = {
  prospectName: 'Sarah Chen',
  callStage: 'pitch',
  closeProbability: 72,
  suggestions: [
    {
      id: 'd1',
      type: 'tip',
      headline: 'She mentioned budget constraints twice — anchor on ROI now',
      body: 'Reference the $40k savings her competitor achieved in Q1. Frame this as an investment, not a cost.',
      triggeredBy: 'demo',
      timestampSeconds: 120,
      streaming: false,
    },
    {
      id: 'd2',
      type: 'objection-response',
      headline: 'Objection: "We already have a solution for this"',
      body: '"That\'s great — what\'s the one thing you wish it did better? Most teams we work with find X is the gap that costs them the most time."',
      triggeredBy: 'demo',
      timestampSeconds: 210,
      streaming: false,
    },
    {
      id: 'd3',
      type: 'close-attempt',
      headline: 'Strong buying signal — she asked about onboarding timeline',
      body: '"If we can get your team live in 2 weeks, would that timing work for your Q3 goal? I can hold a slot with our implementation team today."',
      triggeredBy: 'demo',
      timestampSeconds: 340,
      streaming: false,
    },
  ],
};

export function OverlayScreen() {
  const isDemo = !window.electronAPI;
  const [data, setData] = useState<OverlayData | null>(isDemo ? DEMO_DATA : null);
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<QuickTab>('assist');
  const [askInput, setAskInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Filter suggestions per tab
  const assistSuggestions = suggestions.slice(-3);
  const whatToSay = suggestions.filter(s => s.type === 'tip' || s.type === 'close-attempt').slice(-2);
  const objectionSuggestions = suggestions.filter(s => s.type === 'objection-response').slice(-3);

  const recapText = suggestions.length > 0
    ? `${suggestions.length} AI insights generated. Stage: ${STAGE_LABEL[stage]}. Close probability: ${prob}%.`
    : null;

  return (
    <div className="ov">
      {/* ── Drag handle / top bar ──────────────────────────────────── */}
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
          <button className="ov__ctrl" onClick={() => setMinimized(m => !m)} title={minimized ? 'Expand' : 'Collapse'}>
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
        <>
          {/* ── Tab bar ───────────────────────────────────────────────── */}
          <div className="ov__tabs">
            {(['assist', 'what-to-say', 'objections', 'recap'] as QuickTab[]).map(tab => (
              <button
                key={tab}
                className={`ov__tab ${activeTab === tab ? 'ov__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'assist'       ? 'Assist'
                : tab === 'what-to-say' ? 'What to say'
                : tab === 'objections'  ? 'Objections'
                :                        'Recap'}
              </button>
            ))}
          </div>

          {/* ── Content area ──────────────────────────────────────────── */}
          <div className="ov__body">
            {activeTab === 'assist' && (
              assistSuggestions.length === 0 ? (
                <div className="ov__empty">
                  <div className="ov__empty-icon">◎</div>
                  <div className="ov__empty-text">Listening to your call…</div>
                </div>
              ) : (
                assistSuggestions.map(s => (
                  <div key={s.id} className={`ov__card ov__card--${s.type}`}>
                    <div className="ov__card-label">{TYPE_LABEL[s.type]}</div>
                    <div className="ov__card-head">{s.headline}</div>
                    <div className="ov__card-body">{s.body}</div>
                  </div>
                ))
              )
            )}

            {activeTab === 'what-to-say' && (
              whatToSay.length === 0 ? (
                <div className="ov__empty">
                  <div className="ov__empty-icon">◎</div>
                  <div className="ov__empty-text">No suggestions yet — keep talking.</div>
                </div>
              ) : (
                whatToSay.map(s => (
                  <div key={s.id} className={`ov__card ov__card--${s.type}`}>
                    <div className="ov__card-label">{TYPE_LABEL[s.type]}</div>
                    <div className="ov__card-head">{s.headline}</div>
                    <div className="ov__card-body">{s.body}</div>
                  </div>
                ))
              )
            )}

            {activeTab === 'objections' && (
              <>
                {objectionSuggestions.length > 0 && (
                  <div className="ov__section-label">Live objections</div>
                )}
                {objectionSuggestions.map(s => (
                  <div key={s.id} className="ov__card ov__card--objection-response">
                    <div className="ov__card-label">LIVE</div>
                    <div className="ov__card-head">{s.headline}</div>
                    <div className="ov__card-body">{s.body}</div>
                  </div>
                ))}
                <div className="ov__section-label">Common rebuttals</div>
                {OBJECTION_REBUTTALS.map((r, i) => (
                  <div key={i} className="ov__rebuttal">
                    <div className="ov__rebuttal-q">{r.q}</div>
                    <div className="ov__rebuttal-a">{r.a}</div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'recap' && (
              recapText ? (
                <div className="ov__recap">
                  <div className="ov__recap-stat">
                    <span className="ov__recap-label">Stage</span>
                    <span className={`ov__stage ov__stage--${stage}`}>{STAGE_LABEL[stage]}</span>
                  </div>
                  <div className="ov__recap-stat">
                    <span className="ov__recap-label">Close probability</span>
                    <span className="ov__recap-value">{prob}%</span>
                  </div>
                  <div className="ov__recap-stat">
                    <span className="ov__recap-label">AI insights</span>
                    <span className="ov__recap-value">{suggestions.length}</span>
                  </div>
                  <div className="ov__recap-stat">
                    <span className="ov__recap-label">Objections handled</span>
                    <span className="ov__recap-value">{objectionSuggestions.length}</span>
                  </div>
                </div>
              ) : (
                <div className="ov__empty">
                  <div className="ov__empty-icon">◎</div>
                  <div className="ov__empty-text">Recap will appear once your call has activity.</div>
                </div>
              )
            )}
          </div>

          {/* ── Ask input ─────────────────────────────────────────────── */}
          <div className="ov__ask">
            <input
              ref={inputRef}
              className="ov__ask-input"
              placeholder="Ask about your screen or conversation…"
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setAskInput(''); }}
            />
            <button className="ov__ask-btn" onClick={() => setAskInput('')}>▶</button>
          </div>
        </>
      )}
    </div>
  );
}
