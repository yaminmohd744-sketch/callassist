import { useState } from 'react';
import './AppSlidesScreen.css';

const TOTAL_SLIDES = 6;

function SlideWrapper({ children, label, title, sub }: {
  children: React.ReactNode;
  label: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="asl__slide">
      <div className="asl__slide-glow" />
      <div className="asl__slide-header">
        <div className="asl__slide-label">{label}</div>
        <h2 className="asl__slide-title">{title}</h2>
        <p className="asl__slide-sub">{sub}</p>
      </div>
      <div className="asl__slide-mock">{children}</div>
    </div>
  );
}

// ── Slide 1: Dashboard ────────────────────────────────────────────────────────

function DashboardSlide() {
  return (
    <SlideWrapper
      label="DASHBOARD"
      title="Your sales command center"
      sub="Every call saved. Every metric tracked. No CRM needed."
    >
      <div className="asl__dash">

        {/* Greeting + action row */}
        <div className="asl__dash-top">
          <div className="asl__dash-greet">
            <span className="asl__dash-hello">Good morning, Alex</span>
            <span className="asl__dash-streak">🔥 7-day streak</span>
          </div>
          <button className="asl__dash-cta">▶ Start Call</button>
        </div>

        {/* Stats row */}
        <div className="asl__dash-stats">
          <div className="asl__dash-stat">
            <div className="asl__dash-stat-val asl__dash-stat-val--purple">68%</div>
            <div className="asl__dash-stat-lbl">Win Rate</div>
          </div>
          <div className="asl__dash-stat">
            <div className="asl__dash-stat-val">124</div>
            <div className="asl__dash-stat-lbl">Total Calls</div>
          </div>
          <div className="asl__dash-stat">
            <div className="asl__dash-stat-val asl__dash-stat-val--green">8m 42s</div>
            <div className="asl__dash-stat-lbl">Avg Duration</div>
          </div>
          <div className="asl__dash-stat">
            <div className="asl__dash-stat-val">74%</div>
            <div className="asl__dash-stat-lbl">Avg Close %</div>
          </div>
        </div>

        {/* Recent calls */}
        <div className="asl__dash-section-label">RECENT CALLS</div>
        <div className="asl__dash-calls">
          {[
            { name: 'Amara Osei',      co: 'Meridian Growth',  score: 88, prob: 81, outcome: 'pipeline',  outTag: 'PIPELINE',  outColor: 'blue'  },
            { name: 'Sofia Nakamura',  co: 'CloudBridge Inc.', score: 95, prob: 93, outcome: 'converted', outTag: 'CONVERTED', outColor: 'green' },
            { name: 'James Whitfield', co: 'Apex Ventures',    score: 52, prob: 44, outcome: 'no-deal',   outTag: 'NO DEAL',   outColor: 'red'   },
          ].map((c, i) => (
            <div key={i} className="asl__dash-call">
              <div className="asl__dash-call-avatar">{c.name[0]}</div>
              <div className="asl__dash-call-info">
                <div className="asl__dash-call-name">{c.name}</div>
                <div className="asl__dash-call-co">{c.co}</div>
              </div>
              <div className="asl__dash-call-right">
                <span className={`asl__dash-call-outcome asl__dash-call-outcome--${c.outColor}`}>{c.outTag}</span>
                <span className="asl__dash-call-prob">{c.prob}%</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </SlideWrapper>
  );
}

// ── Slide 2: Pre-Call Setup ───────────────────────────────────────────────────

function PreCallSlide() {
  return (
    <SlideWrapper
      label="PRE-CALL SETUP"
      title="30 seconds to game-ready"
      sub="Tell Pitchr who you're calling. Get an AI brief before the first ring."
    >
      <div className="asl__precall">

        <div className="asl__precall-cols">

          {/* Left col: prospect info */}
          <div className="asl__precall-col">
            <div className="asl__precall-section">
              <div className="asl__precall-section-label">PROSPECT</div>
              <div className="asl__precall-field">
                <div className="asl__precall-field-label">Name</div>
                <div className="asl__precall-field-val">Amara Osei</div>
              </div>
              <div className="asl__precall-field">
                <div className="asl__precall-field-label">Company</div>
                <div className="asl__precall-field-val">Meridian Growth</div>
              </div>
              <div className="asl__precall-field">
                <div className="asl__precall-field-label">Title</div>
                <div className="asl__precall-field-val">VP of Sales</div>
              </div>
            </div>

            <div className="asl__precall-section">
              <div className="asl__precall-section-label">CALL GOAL</div>
              <div className="asl__precall-goal">Book a discovery demo</div>
            </div>

            <div className="asl__precall-section">
              <div className="asl__precall-section-label">CALL TYPE</div>
              <div className="asl__precall-types">
                {['Cold', 'Warm', 'Discovery', 'Demo', 'Close'].map((t, i) => (
                  <span key={i} className={`asl__precall-type${t === 'Discovery' ? ' asl__precall-type--active' : ''}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right col: brief */}
          <div className="asl__precall-col asl__precall-col--brief">
            <div className="asl__precall-brief">
              <div className="asl__precall-brief-header">
                <span className="asl__precall-brief-icon">✦</span>
                <span className="asl__precall-brief-label">AI PRE-CALL BRIEF</span>
              </div>
              <div className="asl__precall-brief-body">
                <div className="asl__precall-brief-item">
                  <span className="asl__precall-brief-key">PAIN</span>
                  <span className="asl__precall-brief-val">Reps spending 50% of day on admin instead of selling — 30% of conversations lost to friction</span>
                </div>
                <div className="asl__precall-brief-item">
                  <span className="asl__precall-brief-key">ANGLE</span>
                  <span className="asl__precall-brief-val">Open with "what's your biggest bottleneck?" — quantify the pipeline cost before pitching</span>
                </div>
                <div className="asl__precall-brief-item">
                  <span className="asl__precall-brief-key">WATCH FOR</span>
                  <span className="asl__precall-brief-val">Budget objection — reframe around stalled pipeline cost, not product price</span>
                </div>
              </div>
            </div>

            <button className="asl__precall-start">▶ START CALL</button>
          </div>
        </div>

      </div>
    </SlideWrapper>
  );
}

// ── Slide 3: Live Call ────────────────────────────────────────────────────────

function LiveCallSlide() {
  return (
    <SlideWrapper
      label="LIVE CALL"
      title="AI coaching the moment they speak"
      sub="Objection detected? The rebuttal is already on screen. Never get caught off-guard again."
    >
      <div className="asl__live">

        {/* Header bar */}
        <div className="asl__live-header">
          <div className="asl__live-header-left">
            <span className="asl__live-logo">PITCHR</span>
            <span className="asl__live-prospect">Amara Osei</span>
            <span className="asl__live-sep">@</span>
            <span className="asl__live-co">Meridian Growth</span>
          </div>
          <div className="asl__live-mode">● LIVE MODE</div>
          <button className="asl__live-end">■ END CALL</button>
        </div>

        {/* Status bar */}
        <div className="asl__live-status">
          <div className="asl__live-status-left">
            <span className="asl__live-dot" />
            <span className="asl__live-status-lbl">ACTIVE</span>
            <span className="asl__live-time">06:42</span>
          </div>
          <div className="asl__live-status-right">
            <span className="asl__live-stat">OBJECTIONS <span className="asl__live-stat-val asl__live-stat-val--red">2</span></span>
            <span className="asl__live-sep2">·</span>
            <span className="asl__live-stat">CLOSE PROB <span className="asl__live-stat-val asl__live-stat-val--green">74%</span></span>
          </div>
        </div>

        {/* 3-panel layout */}
        <div className="asl__live-panels">

          {/* Transcript */}
          <div className="asl__live-panel">
            <div className="asl__live-panel-hdr">
              <span className="asl__live-panel-hdr-dot asl__live-panel-hdr-dot--active" />
              TRANSCRIPT FEED
              <span className="asl__live-badge-live">● LIVE</span>
            </div>
            <div className="asl__live-transcript">
              {[
                { who: 'You',      cls: 'rep',      time: '05:12', text: "What does that cost you in pipeline per quarter, roughly?" },
                { who: 'Prospect', cls: 'prospect', time: '05:28', text: "Our head of sales estimates £80K in stalled deals that could have closed." },
                { who: 'You',      cls: 'rep',      time: '05:54', text: "£80K sitting in stalled pipeline is a real number. What would it mean to fix that before end of Q2?" },
                { who: 'Prospect', cls: 'prospect', time: '06:17', text: "Honestly it's probably not a priority until Q3 — we're heads-down on a product launch right now.", live: true },
              ].map((e, i) => (
                <div key={i} className={`asl__live-entry asl__live-entry--${e.cls}${e.live ? ' asl__live-entry--live' : ''}`}>
                  <div className="asl__live-entry-meta">
                    <span className={`asl__live-entry-who asl__live-entry-who--${e.cls}`}>{e.who}</span>
                    <span className="asl__live-entry-time">{e.time}</span>
                  </div>
                  <div className="asl__live-entry-text">{e.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Intelligence */}
          <div className="asl__live-panel asl__live-panel--ai">
            <div className="asl__live-panel-hdr asl__live-panel-hdr--ai">
              AI INTELLIGENCE FEED<span className="asl__live-cursor">▋</span>
              <span className="asl__live-stage-badge">DISCOVERY</span>
            </div>
            <div className="asl__live-suggestion">
              <div className="asl__live-sug-top">
                <span className="asl__live-sug-badge asl__live-sug-badge--red">HANDLE OBJECTION</span>
                <span className="asl__live-sug-time">06:17</span>
              </div>
              <div className="asl__live-sug-say">
                <span className="asl__live-say-label">SAY</span>
                <span className="asl__live-say-text">"That makes sense. If the manual reporting is costing your team two hours a week, what's the cost of waiting another quarter?"</span>
              </div>
              <div className="asl__live-sug-why">
                <span className="asl__live-why-label">WHY</span>
                <span className="asl__live-why-text">Reframes delay as an active cost — makes the status quo more painful than the change.</span>
              </div>
            </div>
          </div>

          {/* Lead panel */}
          <div className="asl__live-panel asl__live-panel--lead">
            <div className="asl__live-lead-section">
              <div className="asl__live-lead-label">THIS CALL</div>
              <div className="asl__live-lead-field"><span className="asl__live-lead-k">GOAL</span><span className="asl__live-lead-v">Book a demo</span></div>
              <div className="asl__live-lead-field"><span className="asl__live-lead-k">TYPE</span><span className="asl__live-lead-v">Discovery</span></div>
            </div>
            <div className="asl__live-lead-divider" />
            <div className="asl__live-lead-section">
              <div className="asl__live-lead-prob-row">
                <span className="asl__live-lead-label">CLOSE PROB</span>
                <span className="asl__live-lead-prob-pct asl__live-lead-prob-pct--green">74%</span>
              </div>
              <div className="asl__live-prob-bar">
                <div className="asl__live-prob-fill" style={{ width: '74%' }} />
              </div>
            </div>
            <div className="asl__live-lead-divider" />
            <div className="asl__live-lead-section">
              <div className="asl__live-lead-label">CALL NOTES</div>
              <div className="asl__live-note">
                <span className="asl__live-note-ts">5:28</span>
                <span className="asl__live-note-body">£80K in stalled pipeline — quantified pain confirmed</span>
              </div>
              <div className="asl__live-note asl__live-note--objection">
                <span className="asl__live-note-ts">6:17</span>
                <span className="asl__live-note-body">Objection: Q3 priority freeze — product launch</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SlideWrapper>
  );
}

// ── Slide 4: Post-Call Review ─────────────────────────────────────────────────

function PostCallSlide() {
  return (
    <SlideWrapper
      label="POST-CALL REVIEW"
      title="Everything generated the moment you hang up"
      sub="AI summary, lead score, follow-up email — all ready before you close your laptop."
    >
      <div className="asl__postcall">

        {/* Header */}
        <div className="asl__pc-header">
          <div className="asl__pc-back">← Back to Dashboard</div>
          <div className="asl__pc-title-block">
            <div className="asl__pc-title">Call Review</div>
            <div className="asl__pc-meta">
              <span>Amara Osei</span>
              <span className="asl__pc-meta-sep">@</span>
              <span>Meridian Growth</span>
              <span className="asl__pc-meta-sep">·</span>
              <span>Thu, May 30, 2026</span>
            </div>
          </div>
          <span className="asl__pc-crm-badge">✓ Saved to CRM</span>
        </div>

        {/* Stats row */}
        <div className="asl__pc-stats">
          {[
            { val: '9m 11s',  lbl: 'Duration',     cls: '' },
            { val: '2',       lbl: 'Objections',   cls: 'red' },
            { val: '81%',     lbl: 'Close Score',  cls: 'green' },
            { val: '88',      lbl: 'Lead Score',   cls: 'green' },
            { val: '48%',     lbl: 'Talk Ratio',   cls: '' },
            { val: 'CLOSE',   lbl: 'Stage',        cls: 'stage' },
          ].map((s, i) => (
            <div key={i} className="asl__pc-stat">
              <div className={`asl__pc-stat-val${s.cls ? ` asl__pc-stat-val--${s.cls}` : ''}`}>{s.val}</div>
              <div className="asl__pc-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="asl__pc-tabs">
          {['Summary', 'Transcript', 'Follow-up Email', 'Scorecard', '↗ Share'].map((t, i) => (
            <button key={i} className={`asl__pc-tab${i === 0 ? ' asl__pc-tab--active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* Summary content */}
        <div className="asl__pc-body">
          <div className="asl__pc-summary-cols">
            <div className="asl__pc-summary-col">
              <div className="asl__pc-summary-heading">WHAT WENT WELL</div>
              <div className="asl__pc-summary-line">• Opened with a sharp question that surfaced a real pain point fast</div>
              <div className="asl__pc-summary-line">• Quantified the problem (£80K stalled pipeline) before pitching</div>
              <div className="asl__pc-summary-line">• Talk ratio strong — Amara spoke 52% of the time</div>

              <div className="asl__pc-summary-heading" style={{ marginTop: 14 }}>NEXT STEPS</div>
              <div className="asl__pc-summary-line">• Send Thursday 2pm+ calendar options by EOD today</div>
              <div className="asl__pc-summary-line">• Reference the £80K figure in the demo invite</div>
            </div>
            <div className="asl__pc-summary-col">
              <div className="asl__pc-ai-badge">
                <span className="asl__pc-ai-icon">✦</span>
                <span>AI-generated follow-up email ready</span>
              </div>
              <div className="asl__pc-email-preview">
                <div className="asl__pc-email-line asl__pc-email-line--subject">Re: Pitchr — Thursday slots</div>
                <div className="asl__pc-email-line">Hi Amara,</div>
                <div className="asl__pc-email-line asl__pc-email-line--muted">Really appreciated the conversation today — the point about 30% of conversations lost to friction is one I keep hearing...</div>
                <div className="asl__pc-email-copy-btn">Copy Email →</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </SlideWrapper>
  );
}

// ── Slide 5: Analytics ────────────────────────────────────────────────────────

function AnalyticsSlide() {
  const points = [35, 52, 41, 67, 29, 58, 74, 63, 81, 55, 78, 86];
  const max = 100;
  const w = 560;
  const h = 120;
  const pts = points.map((v, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - (v / max) * h,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L 0 ${h} Z`;

  return (
    <SlideWrapper
      label="ANALYTICS"
      title="Know exactly where you stand"
      sub="Track close probability, talk ratios, and objection patterns across every call."
    >
      <div className="asl__analytics">

        {/* KPI row */}
        <div className="asl__an-kpis">
          {[
            { val: '68%', lbl: 'Avg Close Prob', trend: '+12% this month', up: true },
            { val: '124', lbl: 'Calls This Month', trend: '+18 vs last month', up: true },
            { val: '4.8',  lbl: 'Avg Objections',  trend: '−0.6 vs last month', up: true },
            { val: '8m',   lbl: 'Avg Duration',     trend: 'Optimal range', up: true },
          ].map((k, i) => (
            <div key={i} className="asl__an-kpi">
              <div className="asl__an-kpi-val">{k.val}</div>
              <div className="asl__an-kpi-lbl">{k.lbl}</div>
              <div className={`asl__an-kpi-trend${k.up ? ' asl__an-kpi-trend--up' : ''}`}>{k.trend}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="asl__an-chart-wrap">
          <div className="asl__an-chart-label">CLOSE PROBABILITY — LAST 12 CALLS</div>
          <svg viewBox={`0 0 ${w} ${h}`} className="asl__an-chart" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#814ac8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#814ac8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#chartGrad)" />
            <path d={pathD} fill="none" stroke="#814ac8" strokeWidth="2" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={i === pts.length - 1 ? '#df7afe' : '#814ac8'} />
            ))}
          </svg>
          <div className="asl__an-chart-axis">
            {['28d', '21d', '14d', '7d', 'Today'].map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>

        {/* Team leaderboard */}
        <div className="asl__an-leaderboard">
          <div className="asl__an-lb-label">TEAM LEADERBOARD</div>
          {[
            { name: '[Demo] Alex Chen',  calls: 47, prob: 72, pos: 1 },
            { name: '[Demo] Sarah Kim',  calls: 38, prob: 68, pos: 2 },
            { name: 'You',               calls: 24, prob: 66, pos: 3, isYou: true },
            { name: '[Demo] Marcus J.',  calls: 29, prob: 61, pos: 4 },
          ].map((r, i) => (
            <div key={i} className={`asl__an-lb-row${r.isYou ? ' asl__an-lb-row--you' : ''}`}>
              <span className="asl__an-lb-pos">{r.pos}</span>
              <span className="asl__an-lb-name">{r.name}</span>
              <span className="asl__an-lb-calls">{r.calls} calls</span>
              <span className="asl__an-lb-prob">{r.prob}%</span>
            </div>
          ))}
        </div>

      </div>
    </SlideWrapper>
  );
}

// ── Slide 6: Leads CRM ────────────────────────────────────────────────────────

function LeadsSlide() {
  return (
    <SlideWrapper
      label="LEADS CRM"
      title="Your built-in contact manager"
      sub="Every lead scored, every call logged. No Salesforce subscription needed."
    >
      <div className="asl__leads">

        {/* Package header */}
        <div className="asl__leads-top">
          <div className="asl__leads-packages">
            {['All Leads', 'Q2 Enterprise', 'Inbound Leads', 'SMB Pipeline'].map((p, i) => (
              <span key={i} className={`asl__leads-pkg${i === 0 ? ' asl__leads-pkg--active' : ''}`}>{p}</span>
            ))}
          </div>
          <button className="asl__leads-import">+ Import CSV</button>
        </div>

        {/* Lead cards */}
        <div className="asl__leads-list">
          {[
            { name: 'Sarah Mitchell',  co: 'Acme Corp',         title: 'VP of Sales',           calls: 3, score: 78, hot: true  },
            { name: 'James Chen',      co: 'TechFlow Inc.',      title: 'CTO',                   calls: 1, score: 64, hot: false },
            { name: 'Maria Rodriguez', co: 'Global Dynamics',    title: 'Head of Operations',    calls: 2, score: 71, hot: true  },
            { name: 'David Park',      co: 'ScaleUp Ventures',   title: 'Founder & CEO',         calls: 0, score: 45, hot: false },
            { name: 'Emily Watson',    co: 'Enterprise Solutions',title: 'Director of IT',       calls: 4, score: 82, hot: true  },
          ].map((l, i) => (
            <div key={i} className="asl__leads-row">
              <div className="asl__leads-avatar">{l.name[0]}</div>
              <div className="asl__leads-info">
                <div className="asl__leads-name">{l.name}</div>
                <div className="asl__leads-co">{l.title} · {l.co}</div>
              </div>
              <div className="asl__leads-calls">{l.calls} calls</div>
              <div className={`asl__leads-score${l.hot ? ' asl__leads-score--hot' : ''}`}>
                {l.score}
                {l.hot && <span className="asl__leads-hot">● HOT</span>}
              </div>
              <button className="asl__leads-call-btn">▶ Call</button>
            </div>
          ))}
        </div>

      </div>
    </SlideWrapper>
  );
}

// ── Slides array ─────────────────────────────────────────────────────────────

const SLIDES = [
  DashboardSlide,
  PreCallSlide,
  LiveCallSlide,
  PostCallSlide,
  AnalyticsSlide,
  LeadsSlide,
];

const SLIDE_LABELS = [
  'Dashboard',
  'Pre-Call',
  'Live Call',
  'Post-Call',
  'Analytics',
  'Leads CRM',
];

// ── Root ──────────────────────────────────────────────────────────────────────

export function AppSlidesScreen() {
  const [idx, setIdx] = useState(0);
  const SlideComponent = SLIDES[idx];

  function prev() { setIdx(i => (i - 1 + TOTAL_SLIDES) % TOTAL_SLIDES); }
  function next() { setIdx(i => (i + 1) % TOTAL_SLIDES); }

  return (
    <div className="asl">
      <SlideComponent />

      {/* Nav */}
      <div className="asl__nav">
        <button className="asl__nav-btn" onClick={prev}>← PREV</button>
        <div className="asl__nav-dots">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              className={`asl__nav-dot${i === idx ? ' asl__nav-dot--active' : ''}`}
              onClick={() => setIdx(i)}
              title={SLIDE_LABELS[i]}
            />
          ))}
        </div>
        <button className="asl__nav-btn" onClick={next}>NEXT →</button>
      </div>
    </div>
  );
}
