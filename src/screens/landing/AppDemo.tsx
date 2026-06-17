import { useState, useEffect, useRef } from 'react';
import './AppDemo.css';

// ── Scene data — three real moments from a live call ─────────────────────────

type Note = { ts: string; text: string; type?: 'objection' | 'signal' };

const SCENES: Array<{
  id: string; label: string; dotClass: string; time: string; objections: number;
  closeProb: number; probLevel: 'green' | 'yellow' | 'red';
  stage: string;
  transcript: Array<{ speaker: string; time: string; text: string; signal: string | null }>;
  interim: { speaker: string; text: string } | null;
  ai: { type: string; badge: string; say: string; why: string; triggeredBy: string; time: string };
  notes: Note[];
}> = [
  {
    id: 'objection',
    label: 'Objection Handled',
    dotClass: 'appdemo__scene-dot--objection',
    time: '02:14',
    objections: 2,
    closeProb: 68,
    probLevel: 'green' as const,
    stage: 'PITCH',
    transcript: [
      { speaker: 'rep',      time: '01:22', text: 'And when leadership asks for a pipeline update mid-week, what happens?', signal: null },
      { speaker: 'prospect', time: '01:35', text: "Someone has to pull it again. It's maybe two hours of work each time just to get a number. It's frustrating.", signal: null },
      { speaker: 'rep',      time: '01:52', text: 'Two hours every time leadership asks — that adds up fast. Is there pressure to fix this before end of Q2?', signal: null },
      { speaker: 'prospect', time: '02:03', text: "We have a product launch in Q3 that's eating all the budget. It's just not the right time right now.", signal: 'objection' as const },
    ],
    interim: { speaker: 'rep', text: 'I completely understand the timing—' },
    ai: {
      type: 'objection-response',
      badge: 'HANDLE OBJECTION',
      say: '"I completely understand — let me ask: what happens to that two-hour weekly burden after the launch? Is this a Q4 priority, or does it stay on the backlog?"',
      why: 'Budget timing objection. Redirect to post-launch timeline to keep urgency alive without applying pressure now.',
      triggeredBy: '"not the right time"',
      time: '02:03',
    },
    notes: [
      { ts: '0:48', text: 'Salesforce → manual Sheets export every Monday. Outdated by Wed.' },
      { ts: '1:35', text: '~2 hrs wasted per mid-week leadership update. RevOps owns it.' },
      { ts: '2:03', text: 'Objection: Q3 product launch eating budget — timing freeze.', type: 'objection' as const },
    ],
  },
  {
    id: 'close',
    label: 'Close Prompt',
    dotClass: 'appdemo__scene-dot--close',
    time: '04:31',
    objections: 2,
    closeProb: 81,
    probLevel: 'green' as const,
    stage: 'CLOSE',
    transcript: [
      { speaker: 'rep',      time: '03:54', text: "So if the launch wraps mid-October, that's when your ops budget reopens?", signal: null },
      { speaker: 'prospect', time: '04:02', text: "Yeah, exactly. After that we'll have headroom again and this problem will still be there — probably worse.", signal: 'buying-signal' as const },
      { speaker: 'rep',      time: '04:17', text: 'What would you need to see to make this a priority in October?', signal: null },
      { speaker: 'prospect', time: '04:28', text: "Honestly just the Salesforce integration working and a rough ROI number. If those two check out, I can make the case internally.", signal: 'buying-signal' as const },
    ],
    interim: null,
    ai: {
      type: 'close-attempt',
      badge: 'CLOSE',
      say: '"Let\'s get 30 minutes on the calendar before October — I\'ll walk you through the Salesforce integration live and put together a custom ROI estimate for your team size. What does mid-September look like for you?"',
      why: 'Two strong buying signals back-to-back. They\'ve told you exactly what they need. Lock in a next step before the call ends.',
      triggeredBy: '"I can make the case internally"',
      time: '04:28',
    },
    notes: [
      { ts: '0:48', text: 'Salesforce → manual Sheets export every Monday.' },
      { ts: '2:03', text: 'Objection: Q3 product launch — budget frozen until Oct.', type: 'objection' as const },
      { ts: '4:02', text: 'Budget opens October — confirmed realistic target window.', type: 'signal' as const },
    ],
  },
  {
    id: 'discovery',
    label: 'Discovery Coaching',
    dotClass: 'appdemo__scene-dot--discovery',
    time: '01:08',
    objections: 0,
    closeProb: 50,
    probLevel: 'yellow' as const,
    stage: 'DISCOVERY',
    transcript: [
      { speaker: 'rep',      time: '00:32', text: "Hi Sarah, thanks for taking the call. Quick one to start — what's the biggest friction point in your reporting workflow right now?", signal: null },
      { speaker: 'prospect', time: '00:48', text: "Honestly it's pipeline visibility. Our RevOps guy exports from Salesforce every Monday, cleans it in Sheets. By Wednesday it's already wrong.", signal: null },
      { speaker: 'rep',      time: '01:05', text: 'How often does leadership ask for an update outside of that Monday report?', signal: null },
    ],
    interim: { speaker: 'prospect', text: 'Usually twice a week at minimum, sometimes more if—' },
    ai: {
      type: 'discovery',
      badge: 'GO DEEPER',
      say: '"What does it actually cost the business when that report is wrong — has a deal ever slipped because your pipeline view was stale?"',
      why: 'Pain is surface-level. Quantify the financial impact before you pitch. This question anchors the value conversation in a real number they\'ll remember.',
      triggeredBy: '"already wrong"',
      time: '00:48',
    },
    notes: [
      { ts: '0:48', text: 'Salesforce → Sheets export every Monday. Outdated by Wednesday.' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const SCENE_DURATION_MS = 5000;

export function AppDemo() {
  const [scene, setScene] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const s = SCENES[scene];

  const goToScene = (idx: number) => {
    if (timer.current) clearTimeout(timer.current);
    setScene(idx);
  };

  useEffect(() => {
    timer.current = setTimeout(() => {
      setScene(prev => (prev + 1) % SCENES.length);
    }, SCENE_DURATION_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [scene]);

  const signalLabel = (sig: string | null) => {
    if (sig === 'buying-signal') return 'Signal';
    if (sig === 'objection')     return 'Objection';
    return null;
  };

  return (
    <div className="appdemo">
      {/* Browser chrome */}
      <div className="appdemo__chrome">
        <div className="appdemo__titlebar">
          <div className="appdemo__tb-dots">
            <span className="appdemo__tb-dot appdemo__tb-dot--r" />
            <span className="appdemo__tb-dot appdemo__tb-dot--y" />
            <span className="appdemo__tb-dot appdemo__tb-dot--g" />
          </div>
          <div className="appdemo__tb-url">
            <span className="appdemo__tb-lock">🔒</span>
            app.pitchr.org · Live Call — Sarah Chen
          </div>
        </div>

        <div className="appdemo__app">
          {/* Header */}
          <div className="appdemo__header">
            <div className="appdemo__header-left">
              <span className="appdemo__logo">Pitchr</span>
              <span className="appdemo__prospect-sep">·</span>
              <span className="appdemo__prospect-name">Sarah Chen</span>
              <span className="appdemo__prospect-sep">@</span>
              <span className="appdemo__prospect-company">CloudBridge Inc.</span>
            </div>
            <div className="appdemo__header-center">● LIVE MODE</div>
            <div className="appdemo__header-right">
              <span className="appdemo__minimize-btn">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4 9.5L7 6.5L10 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 6.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Minimize
              </span>
              <span className="appdemo__end-btn">■ End Call</span>
            </div>
          </div>

          {/* Status bar */}
          <div className="appdemo__statusbar">
            <div className="appdemo__status-left">
              <span className="appdemo__status-dot" />
              <span className="appdemo__status-label">ACTIVE</span>
              <span className="appdemo__status-time">{s.time}</span>
            </div>
            <div className="appdemo__status-right">
              <span className="appdemo__stat">
                OBJECTIONS{' '}
                <span className={`appdemo__stat-val${s.objections > 0 ? ' appdemo__stat-val--red' : ''}`}>
                  {s.objections}
                </span>
              </span>
              <span className="appdemo__stat-sep">·</span>
              <span className="appdemo__stat">
                CLOSE PROB{' '}
                <span className={`appdemo__stat-val appdemo__stat-val--${s.probLevel}`}>
                  {s.closeProb}%
                </span>
              </span>
            </div>
          </div>

          {/* 3 panels */}
          <div className="appdemo__panels">

            {/* ── Transcript ── */}
            <div className="appdemo__panel">
              <div className="appdemo__panel-hdr">
                <div className="appdemo__panel-title">
                  <span className="appdemo__panel-dot" />
                  Transcript Feed
                </div>
                <span className="appdemo__live-badge">● LIVE</span>
              </div>
              <div className="appdemo__transcript">
                {s.transcript.map((entry, i) => (
                  <div
                    key={i}
                    className={`appdemo__entry${entry.signal ? ` appdemo__entry--${entry.signal}` : ''}`}
                  >
                    <div className="appdemo__entry-meta">
                      <span className={`appdemo__entry-who appdemo__entry-who--${entry.speaker}`}>
                        {entry.speaker === 'rep' ? 'You' : 'Prospect'}
                      </span>
                      <span className="appdemo__entry-time">{entry.time}</span>
                      {entry.signal && signalLabel(entry.signal) && (
                        <span className={`appdemo__entry-signal appdemo__entry-signal--${entry.signal}`}>
                          {signalLabel(entry.signal)}
                        </span>
                      )}
                    </div>
                    <div className="appdemo__entry-text">{entry.text}</div>
                  </div>
                ))}
                {s.interim && (
                  <div className="appdemo__interim">
                    <span className="appdemo__interim-label">
                      {s.interim.speaker === 'rep' ? 'You' : 'Prospect'}
                    </span>
                    <span className="appdemo__interim-text">
                      {s.interim.text}
                      <span className="appdemo__interim-cursor" />
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── AI Intelligence ── */}
            <div className="appdemo__panel">
              <div className="appdemo__panel-hdr">
                <div className="appdemo__panel-title">
                  AI Intelligence Feed<span className="appdemo__ai-cursor">▋</span>
                </div>
                <span className={`appdemo__stage-badge appdemo__stage-badge--${s.stage}`}>{s.stage}</span>
              </div>
              <div className="appdemo__ai-body">
                <div className="appdemo__suggestion">
                  <div className="appdemo__suggestion-top">
                    <span className={`appdemo__badge appdemo__badge--${s.ai.type}`}>
                      {s.ai.badge}
                    </span>
                    <span className="appdemo__sug-time">{s.ai.time}</span>
                  </div>
                  <div className="appdemo__say-block">
                    <span className="appdemo__say-label">SAY</span>
                    <span className="appdemo__say-text">{s.ai.say}</span>
                  </div>
                  <div className="appdemo__why-block">
                    <span className="appdemo__why-label">WHY</span>
                    <span className="appdemo__why-text">{s.ai.why}</span>
                  </div>
                  <div className="appdemo__triggered">
                    Triggered by: <em>{s.ai.triggeredBy}</em>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Lead profile ── */}
            <div className="appdemo__panel">
              <div className="appdemo__panel-hdr">
                <div className="appdemo__panel-title">Lead Profile</div>
              </div>
              <div className="appdemo__lead-body">

                {/* This call */}
                <div className="appdemo__lead-section">
                  <div className="appdemo__lead-section-title">This Call</div>
                  <div className="appdemo__lead-fields">
                    <div className="appdemo__lead-field">
                      <span className="appdemo__lead-field-k">Prospect</span>
                      <span className="appdemo__lead-field-v">Sarah Chen</span>
                    </div>
                    <div className="appdemo__lead-field">
                      <span className="appdemo__lead-field-k">Company</span>
                      <span className="appdemo__lead-field-v">CloudBridge Inc.</span>
                    </div>
                    <div className="appdemo__lead-field">
                      <span className="appdemo__lead-field-k">Type</span>
                      <span className="appdemo__lead-field-v appdemo__lead-field-v--chip">Discovery</span>
                    </div>
                    <div className="appdemo__lead-field">
                      <span className="appdemo__lead-field-k">Goal</span>
                      <span className="appdemo__lead-field-v">Book a demo</span>
                    </div>
                  </div>
                </div>

                <div className="appdemo__lead-divider" />

                {/* Close probability */}
                <div className="appdemo__lead-section">
                  <div className="appdemo__lead-section-title">Close Probability</div>
                  <div className="appdemo__prob-row">
                    <span className={`appdemo__prob-pct appdemo__prob-pct--${s.probLevel}`}>
                      {s.closeProb}%
                    </span>
                  </div>
                  <div className="appdemo__prob-bar">
                    <div
                      className={`appdemo__prob-fill appdemo__prob-fill--${s.probLevel}`}
                      style={{ width: `${s.closeProb}%` }}
                    />
                  </div>
                </div>

                <div className="appdemo__lead-divider" />

                {/* Notes */}
                <div className="appdemo__lead-section">
                  <div className="appdemo__lead-section-title">Call Notes</div>
                  <div className="appdemo__notes">
                    {s.notes.map((note, i) => (
                      <div key={i} className={`appdemo__note${note.type ? ` appdemo__note--${note.type}` : ''}`}>
                        <span className="appdemo__note-ts">{note.ts}</span>
                        <span className="appdemo__note-body">{note.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="appdemo__note-input">
                  <span className="appdemo__note-input-fake">Add note…</span>
                  <span className="appdemo__note-add-btn">+</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scene switcher */}
      <div className="appdemo__switcher">
        {SCENES.map((sc, i) => (
          <button
            key={sc.id}
            className={`appdemo__scene-btn${scene === i ? ' appdemo__scene-btn--active' : ''}`}
            onClick={() => goToScene(i)}
          >
            <span className={`appdemo__scene-dot ${scene === i ? '' : sc.dotClass}`} />
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
