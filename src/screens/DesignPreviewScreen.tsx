import { useState } from 'react';
import './DesignPreviewScreen.css';

type PreviewTab = 'dashboard' | 'pre-call' | 'live-call' | 'post-call' | 'analytics';
type PostTab = 'summary' | 'transcript' | 'follow-up';

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ active, onNav }: { active: PreviewTab; onNav: (t: PreviewTab) => void }) {
  const nav: { id: PreviewTab; icon: string; label: string }[] = [
    { id: 'dashboard',  icon: '⊞', label: 'Dashboard'  },
    { id: 'analytics',  icon: '↗', label: 'Analytics'  },
    { id: 'pre-call',   icon: '○', label: 'New Call'    },
    { id: 'live-call',  icon: '●', label: 'Live Call'   },
    { id: 'post-call',  icon: '◇', label: 'Review'      },
  ];

  return (
    <nav className="dp-sidebar">
      <div className="dp-logo">
        <div className="dp-logo-mark">P</div>
        <span className="dp-logo-text">Pitchr</span>
      </div>

      <div className="dp-nav">
        <div className="dp-nav-section-label">Workspace</div>
        {nav.slice(0, 2).map(n => (
          <button
            key={n.id}
            className={`dp-nav-item${active === n.id ? ' dp-active' : ''}`}
            onClick={() => onNav(n.id)}
          >
            <span className="dp-nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <div className="dp-nav-section-label" style={{ marginTop: 4 }}>Calls</div>
        {nav.slice(2).map(n => (
          <button
            key={n.id}
            className={`dp-nav-item${active === n.id ? ' dp-active' : ''}`}
            onClick={() => onNav(n.id)}
          >
            <span className="dp-nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <div className="dp-sidebar-user">
        <div className="dp-user-avatar">YM</div>
        <div>
          <div className="dp-user-name">Yamin M.</div>
          <div className="dp-user-plan">Pro plan</div>
        </div>
      </div>
    </nav>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
function DashboardView() {
  const calls = [
    { name: 'Amara Osei',     co: 'Meridian Growth', dur: '9:11', score: 88, outcome: 'pipeline', date: 'Jun 14' },
    { name: 'James Whitfield',co: 'Apex Ventures',   dur: '5:12', score: 52, outcome: 'no deal',  date: 'Jun 13' },
    { name: 'Priya Menon',    co: 'Luma Health',     dur: '11:34',score: 76, outcome: 'pipeline', date: 'Jun 12' },
    { name: 'Tom Rafferty',   co: 'Beacon IO',       dur: '7:48', score: 91, outcome: 'won',      date: 'Jun 11' },
    { name: 'Sara Kimani',    co: 'Vertex Labs',     dur: '4:22', score: 43, outcome: 'no deal',  date: 'Jun 10' },
  ];

  const outcomeBadge = (o: string) => {
    if (o === 'won')      return <span className="dp-badge green">Won</span>;
    if (o === 'pipeline') return <span className="dp-badge blue">Pipeline</span>;
    return                       <span className="dp-badge muted">No deal</span>;
  };

  const scoreBadge = (s: number) => {
    const cls = s >= 80 ? 'green' : s >= 60 ? 'yellow' : 'red';
    return <span className={`dp-badge ${cls}`}>{s}</span>;
  };

  return (
    <div className="dp-screen">
      <div className="dp-page-header">
        <div className="dp-page-eyebrow">Monday, June 16</div>
        <div className="dp-page-title">Good morning, Yamin</div>
        <div className="dp-page-sub">3 calls scheduled today · 2 follow-ups pending</div>
      </div>

      <div className="dp-stats-row">
        <div className="dp-stat-card">
          <div className="dp-stat-label">Total Calls</div>
          <div className="dp-stat-value">47</div>
          <div className="dp-stat-change up">↑ 12% this week</div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-label">Avg Close Prob.</div>
          <div className="dp-stat-value">67%</div>
          <div className="dp-stat-change up">↑ 5pts vs last week</div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-label">Win Rate</div>
          <div className="dp-stat-value">28%</div>
          <div className="dp-stat-change neu">Same as last month</div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-label">Talk Ratio</div>
          <div className="dp-stat-value">48%</div>
          <div className="dp-stat-change up">↑ Optimal range</div>
        </div>
      </div>

      <div className="dp-quick-row">
        <button className="dp-btn primary lg">+ Start New Call</button>
        <button className="dp-btn sec">↑ Upload Recording</button>
        <button className="dp-btn sec">⬡ Leads</button>
      </div>

      <div className="dp-section">
        <div className="dp-section-header">
          <span className="dp-section-title">Recent Calls</span>
          <button className="dp-link">View all</button>
        </div>
        <div className="dp-table">
          <div className="dp-table-row dp-th dp-tr-calls">
            <div>Prospect</div>
            <div>Company</div>
            <div>Duration</div>
            <div>Score</div>
            <div>Outcome</div>
            <div>Date</div>
          </div>
          {calls.map((c, i) => (
            <div key={i} className="dp-table-row dp-tr dp-tr-calls">
              <div className="dp-cell dp-cell-name">{c.name}</div>
              <div className="dp-cell dp-dim">{c.co}</div>
              <div className="dp-cell dp-dim">{c.dur}</div>
              <div className="dp-cell">{scoreBadge(c.score)}</div>
              <div className="dp-cell">{outcomeBadge(c.outcome)}</div>
              <div className="dp-cell dp-dim">{c.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Pre-Call Form ───────────────────────────────────────────────────────── */
function PreCallView() {
  const [platform, setPlatform] = useState('Zoom');
  const platforms = ['Zoom', 'Google Meet', 'Phone', 'Teams', 'Loom'];

  return (
    <div className="dp-screen">
      <div className="dp-form-wrap">
        <div className="dp-form-title">New Call</div>
        <div className="dp-form-sub">Set up your call context so Pitchr can coach you in real time.</div>

        <div className="dp-form-card">
          <div className="dp-form-card-title">Prospect</div>
          <div className="dp-field-row cols-2">
            <div className="dp-field">
              <label className="dp-label">Name</label>
              <input className="dp-input" placeholder="Sarah Chen" defaultValue="Sarah Chen" readOnly />
            </div>
            <div className="dp-field">
              <label className="dp-label">Company</label>
              <input className="dp-input" placeholder="Acme Corp" defaultValue="Acme Corp" readOnly />
            </div>
          </div>
          <div className="dp-field-row cols-2">
            <div className="dp-field">
              <label className="dp-label">Title</label>
              <input className="dp-input" placeholder="VP of Sales" defaultValue="VP of Sales" readOnly />
            </div>
            <div className="dp-field">
              <label className="dp-label">Language</label>
              <select className="dp-select dp-input">
                <option>English (UK)</option>
                <option>English (US)</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        </div>

        <div className="dp-form-card">
          <div className="dp-form-card-title">Call Setup</div>
          <div className="dp-field">
            <label className="dp-label">Platform</label>
            <div className="dp-pill-row">
              {platforms.map(p => (
                <button
                  key={p}
                  className={`dp-pill${platform === p ? ' dp-active' : ''}`}
                  onClick={() => setPlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="dp-field">
            <label className="dp-label">Goal</label>
            <select className="dp-select dp-input">
              <option>Book a demo</option>
              <option>Qualify budget</option>
              <option>Close deal</option>
              <option>Discovery</option>
            </select>
          </div>
        </div>

        <div className="dp-form-card">
          <div className="dp-form-card-title">Context</div>
          <div className="dp-field">
            <label className="dp-label">Prior context (optional)</label>
            <textarea
              className="dp-input dp-textarea"
              placeholder="Any background on this prospect, company, or previous conversations…"
              defaultValue="Met at SaaStr EU. Mentioned their reps are struggling with follow-up consistency."
              readOnly
            />
          </div>
        </div>

        <div className="dp-form-footer">
          <button className="dp-btn sec">Cancel</button>
          <button className="dp-btn primary lg">Start Call →</button>
        </div>
      </div>
    </div>
  );
}

/* ── Live Call ───────────────────────────────────────────────────────────── */
function LiveCallView() {
  const transcript = [
    { speaker: 'rep' as const,      time: '0:12', text: "Hi Sarah, thanks for jumping on. Quick scene-setter — what's the biggest friction point in your reps' day-to-day right now?", signal: null },
    { speaker: 'prospect' as const, time: '0:31', text: "Honestly, follow-up. We have no consistent process. Some reps are great, others ghost prospects for a week.", signal: 'buy' },
    { speaker: 'rep' as const,      time: '1:04', text: "How much pipeline do you think stalls because of that? Just a rough figure.", signal: null },
    { speaker: 'prospect' as const, time: '1:18', text: "Our head of sales estimates maybe £80K in stalled deals per quarter.", signal: 'buy' },
    { speaker: 'rep' as const,      time: '2:05', text: "That's a real number. I'd love to show you how teams like yours have cut follow-up time by 70% — can we get 30 min Thursday?", signal: null },
    { speaker: 'prospect' as const, time: '2:24', text: "We already renewed our sales stack in January. Budget is pretty locked.", signal: 'obj' },
  ];

  const suggestions = [
    { type: 'obj', label: 'Objection', head: 'Budget locked → reframe to ROI', body: 'She just gave you the £80K stalled pipeline figure. Reframe cost as a fraction of that. "If we recovered even 20% of that £80K, the tool pays for itself in the first month."', hi: true },
    { type: 'disc', label: 'Discovery', head: 'Ask about current follow-up process', body: 'Dig into what they use today — manual, CRM sequences, or nothing? Surfaces the pain more before you pitch.', hi: false },
    { type: 'cls', label: 'Close', head: 'Soft close: propose a pilot', body: 'A low-risk pilot on one team is easier to approve than a full rollout when budget is cited.', hi: false },
    { type: 'tip', label: 'Coaching', head: 'Talk ratio: 58% — slow down', body: 'You\'re speaking too much. Let her fill the silence after the ROI question.', hi: false },
  ];

  return (
    <div className="dp-live-root">
      {/* Header */}
      <div className="dp-live-header">
        <div className="dp-live-dot" />
        <div>
          <div className="dp-live-name">Sarah Chen</div>
          <div className="dp-live-co">VP of Sales · Acme Corp</div>
        </div>
        <div className="dp-live-sep" />
        <div className="dp-live-timer">02:31</div>
        <span className="dp-live-badge">Live</span>
        <div className="dp-spacer" />
        <button className="dp-btn sec sm">Minimize</button>
        <button className="dp-btn danger sm">End Call</button>
      </div>

      {/* 3-panel body */}
      <div className="dp-live-panels">
        {/* Transcript */}
        <div className="dp-panel">
          <div className="dp-panel-head">
            Transcript
            <span className="dp-panel-head-tag">Auto</span>
          </div>
          <div className="dp-panel-body">
            {transcript.map((t, i) => (
              <div key={i} className="dp-t-entry">
                <div className="dp-t-meta">
                  <span className={`dp-t-speaker ${t.speaker}`}>
                    {t.speaker === 'rep' ? 'You' : 'Sarah'}
                  </span>
                  <span className="dp-t-time">{t.time}</span>
                  {t.signal === 'buy' && <span className="dp-t-signal buy">signal</span>}
                  {t.signal === 'obj' && <span className="dp-t-signal obj">objection</span>}
                </div>
                <div className="dp-t-text">{t.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Coach */}
        <div className="dp-panel">
          <div className="dp-panel-head">
            AI Coach
            <span className="dp-panel-head-tag">4 suggestions</span>
          </div>
          <div className="dp-panel-body">
            {suggestions.map((s, i) => (
              <div key={i} className={`dp-sug${s.hi ? ' dp-hi' : ''}`}>
                <div className={`dp-sug-type ${s.type}`}>{s.label}</div>
                <div className="dp-sug-head">{s.head}</div>
                <div className="dp-sug-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead profile */}
        <div className="dp-panel">
          <div className="dp-panel-head">Lead Profile</div>
          <div className="dp-panel-body">
            <div className="dp-lead-block">
              <div className="dp-lead-head">Contact</div>
              <div className="dp-lead-name">Sarah Chen</div>
              <div className="dp-lead-title">VP of Sales · Acme Corp</div>
            </div>
            <div className="dp-lead-block">
              <div className="dp-lead-head">Call</div>
              <div className="dp-kv-row">
                <div className="dp-kv"><span className="dp-kv-k">Goal</span><span className="dp-kv-v">Book demo</span></div>
                <div className="dp-kv"><span className="dp-kv-k">Platform</span><span className="dp-kv-v">Zoom</span></div>
                <div className="dp-kv"><span className="dp-kv-k">Language</span><span className="dp-kv-v">English (UK)</span></div>
              </div>
            </div>
            <div className="dp-lead-block">
              <div className="dp-lead-head">Context</div>
              <div style={{ fontSize: 12, color: 'var(--dp-t2)', lineHeight: 1.55 }}>
                Met at SaaStr EU. Mentioned reps struggling with follow-up consistency.
              </div>
            </div>
            <div className="dp-lead-block">
              <div className="dp-lead-head">Key Numbers</div>
              <div className="dp-kv-row">
                <div className="dp-kv"><span className="dp-kv-k">Stalled pipeline</span><span className="dp-kv-v" style={{ color: 'var(--dp-accent)' }}>£80K/qtr</span></div>
                <div className="dp-kv"><span className="dp-kv-k">Team size</span><span className="dp-kv-v">~18 reps</span></div>
                <div className="dp-kv"><span className="dp-kv-k">Budget status</span><span className="dp-kv-v" style={{ color: 'var(--dp-red)' }}>Locked</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="dp-status-bar">
        <div className="dp-s-item">
          <span className="dp-s-lbl">Stage</span>
          <span className="dp-s-val">Pitch</span>
        </div>
        <div className="dp-s-item">
          <span className="dp-s-lbl">Talk ratio</span>
          <span className="dp-s-val">58%</span>
        </div>
        <div className="dp-s-item">
          <span className="dp-s-lbl">Close prob.</span>
          <span className="dp-s-val">42%</span>
          <div className="dp-prob-track"><div className="dp-prob-fill" style={{ width: '42%' }} /></div>
        </div>
        <div className="dp-s-item">
          <span className="dp-s-lbl">Objections</span>
          <span className="dp-s-val">1</span>
        </div>
      </div>
    </div>
  );
}

/* ── Post-Call ───────────────────────────────────────────────────────────── */
function PostCallView() {
  const [tab, setTab] = useState<PostTab>('summary');

  const transcriptItems = [
    { speaker: 'You',   time: '0:12', text: "Hi Sarah, thanks for jumping on. What's the biggest friction point in your reps' day right now?" },
    { speaker: 'Sarah', time: '0:31', text: "Follow-up. We have no consistent process. Some reps are great, others ghost prospects for a week." },
    { speaker: 'You',   time: '1:04', text: "How much pipeline do you think stalls because of that? Rough figure." },
    { speaker: 'Sarah', time: '1:18', text: "Our head of sales estimates maybe £80K in stalled deals per quarter." },
    { speaker: 'You',   time: '2:05', text: "That's a real number. I'd love to show you how teams like yours cut follow-up time by 70% — Thursday 30 min?" },
    { speaker: 'Sarah', time: '2:24', text: "We already renewed in January. Budget is pretty locked." },
    { speaker: 'You',   time: '2:41', text: "Understood. Quick question — if we could recover even 20% of that £80K stall, would the ROI conversation be easier to have in Q3?" },
    { speaker: 'Sarah', time: '2:59', text: "Probably, yes. October is when our next cycle opens." },
  ];

  return (
    <div className="dp-post-root">
      <div className="dp-post-top">
        <div className="dp-score-ring">
          <div className="dp-score-inner">74</div>
        </div>
        <div className="dp-post-meta">
          <div className="dp-post-title">Sarah Chen · Acme Corp</div>
          <div className="dp-post-info">
            <span>Discovery call</span>
            <span className="dp-post-info-dot">·</span>
            <span>7m 42s</span>
            <span className="dp-post-info-dot">·</span>
            <span>Jun 16, 2026</span>
          </div>
          <div className="dp-post-stats">
            <div className="dp-mini-stat">
              <div className="dp-mini-stat-label">Close Prob.</div>
              <div className="dp-mini-stat-val">42%</div>
            </div>
            <div className="dp-mini-stat">
              <div className="dp-mini-stat-label">Talk Ratio</div>
              <div className="dp-mini-stat-val">58%</div>
            </div>
            <div className="dp-mini-stat">
              <div className="dp-mini-stat-label">Objections</div>
              <div className="dp-mini-stat-val">1</div>
            </div>
            <div className="dp-mini-stat">
              <div className="dp-mini-stat-label">Outcome</div>
              <div className="dp-mini-stat-val" style={{ fontSize: 12 }}>
                <span className="dp-badge blue">Pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dp-post-actions">
        <button className="dp-btn primary sm">Send Follow-up Email</button>
        <button className="dp-btn sec sm">Export PDF</button>
        <button className="dp-btn sec sm">+ New Call</button>
      </div>

      <div className="dp-tabs-row">
        {(['summary', 'transcript', 'follow-up'] as PostTab[]).map(t => (
          <button
            key={t}
            className={`dp-tab${tab === t ? ' dp-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="dp-post-content">
        {tab === 'summary' && (
          <>
            <div className="dp-ai-block">
              <div className="dp-ai-block-title">AI Summary</div>
              <div className="dp-ai-h">What went well</div>
              <div className="dp-ai-p">Opened with a sharp pain question — surfaced real cost data (£80K/qtr) in under 2 minutes.</div>
              <div className="dp-ai-p">Stayed calm when budget objection hit and pivoted to ROI framing.</div>
              <div className="dp-ai-p">Got a concrete future anchor (October budget cycle).</div>
              <div className="dp-ai-h">Areas to improve</div>
              <div className="dp-ai-p">Talk ratio 58% — you spoke too much in the pitch phase. Let the silence work.</div>
              <div className="dp-ai-p">Budget objection came late — surface budget earlier in discovery.</div>
              <div className="dp-ai-h">Next steps</div>
              <div className="dp-check-row">
                {[
                  'Send follow-up email referencing the £80K figure by EOD today',
                  'Calendar reminder for September 15 — 3 weeks before October budget cycle opens',
                  'Connect on LinkedIn and mention the SaaStr meetup',
                ].map((s, i) => (
                  <div key={i} className="dp-check-item">
                    <div className="dp-checkbox" />
                    <div className="dp-check-text">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'transcript' && (
          <div className="dp-ai-block">
            <div className="dp-ai-block-title">Full Transcript</div>
            {transcriptItems.map((t, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--dp-border-sub)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: t.speaker === 'You' ? 'var(--dp-accent)' : 'var(--dp-blue)',
                  }}>{t.speaker}</span>
                  <span style={{ fontSize: 10, color: 'var(--dp-t3)', fontFamily: 'var(--dp-mono)' }}>{t.time}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--dp-t1)', lineHeight: 1.55 }}>{t.text}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'follow-up' && (
          <div className="dp-ai-block">
            <div className="dp-ai-block-title">AI-drafted Follow-up Email</div>
            <div style={{ fontFamily: 'var(--dp-mono)', fontSize: 12, lineHeight: 1.7, color: 'var(--dp-t1)', whiteSpace: 'pre-wrap' }}>
              {`Hi Sarah,

Really appreciated the chat today — the £80K stalled pipeline figure is one I keep hearing from heads of sales scaling past 15 reps.

As you mentioned October is when your next budget cycle opens, I'll send a calendar reminder for mid-September so we can pick up the conversation at the right time. In the meantime I'll share a quick case study on how a team similar to yours got that stall rate down by 70% in the first 6 weeks.

One question before I send that over — is it purely a budget question for now, or is there a specific outcome you'd need to see to make the internal case easier?

Best,
Yamin`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Analytics ───────────────────────────────────────────────────────────── */
function AnalyticsView() {
  const weekData = [38, 52, 45, 67, 71, 58, 74];
  const maxW = Math.max(...weekData);

  const objections = [
    { label: 'Budget',   pct: 68 },
    { label: 'Timing',   pct: 52 },
    { label: 'Incumbent',pct: 44 },
    { label: 'Need',     pct: 31 },
    { label: 'Authority',pct: 18 },
  ];

  const leaderboard = [
    { initials: 'YM', name: 'Yamin M.',   calls: 47, win: '31%' },
    { initials: 'PK', name: 'Priya K.',   calls: 38, win: '28%' },
    { initials: 'TR', name: 'Tom R.',     calls: 33, win: '24%' },
    { initials: 'SC', name: 'Sara C.',    calls: 29, win: '21%' },
  ];

  const rankClass = (i: number) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

  return (
    <div className="dp-screen">
      <div className="dp-analytics-root">
        <div className="dp-analytics-header">
          <div>
            <div className="dp-page-title" style={{ fontSize: 18 }}>Analytics</div>
            <div className="dp-page-sub">Last 30 days</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['7d', '30d', '90d'].map((p, i) => (
              <button key={p} className={`dp-btn ${i === 1 ? 'sec' : 'ghost'} sm`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Stat row */}
        <div className="dp-stats-row" style={{ padding: 0, marginBottom: 12 }}>
          {[
            { label: 'Calls Made', v: '47', ch: '↑ 12%', cls: 'up' },
            { label: 'Avg Score',  v: '71', ch: '↑ 4pts', cls: 'up' },
            { label: 'Win Rate',   v: '28%',ch: '→ Same', cls: 'neu' },
            { label: 'Avg Duration',v: '8:24', ch: '↓ 22s', cls: 'down' },
          ].map(s => (
            <div key={s.label} className="dp-stat-card">
              <div className="dp-stat-label">{s.label}</div>
              <div className="dp-stat-value" style={{ fontSize: 22 }}>{s.v}</div>
              <div className={`dp-stat-change ${s.cls}`}>{s.ch}</div>
            </div>
          ))}
        </div>

        <div className="dp-grid-2">
          {/* Close prob chart */}
          <div className="dp-chart-card">
            <div className="dp-chart-title">Close Probability — This Week</div>
            <div className="dp-sparkline">
              {weekData.map((v, i) => (
                <div
                  key={i}
                  className={`dp-spark-bar${i === weekData.length - 1 ? ' dp-hi' : ''}`}
                  style={{ height: `${(v / maxW) * 100}%` }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <span key={d} style={{ fontSize: 10, color: 'var(--dp-t3)' }}>{d}</span>
              ))}
            </div>
          </div>

          {/* Top objections */}
          <div className="dp-chart-card">
            <div className="dp-chart-title">Top Objections</div>
            {objections.map(o => (
              <div key={o.label} className="dp-bar-row">
                <div className="dp-bar-lbl">{o.label}</div>
                <div className="dp-bar-track">
                  <div className="dp-bar-fill" style={{ width: `${o.pct}%` }} />
                </div>
                <div className="dp-bar-val">{o.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="dp-chart-card">
          <div className="dp-chart-title">Team Leaderboard</div>
          {leaderboard.map((r, i) => (
            <div key={r.name} className="dp-lb-row">
              <div className={`dp-lb-rank ${rankClass(i)}`}>{i + 1}</div>
              <div className="dp-lb-av">{r.initials}</div>
              <div className="dp-lb-name">{r.name}</div>
              <div className="dp-lb-stat">{r.calls} calls</div>
              <div className="dp-lb-stat" style={{ width: 54, textAlign: 'right' }}>
                <strong>{r.win}</strong> win
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Root Preview Component ──────────────────────────────────────────────── */
export function DesignPreviewScreen() {
  const [active, setActive] = useState<PreviewTab>('dashboard');

  const TABS: { id: PreviewTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pre-call',  label: 'Pre-Call'  },
    { id: 'live-call', label: 'Live Call' },
    { id: 'post-call', label: 'Post-Call' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="dp-root">
      <Sidebar active={active} onNav={setActive} />

      <div className="dp-main">
        {/* Preview switcher */}
        <div className="dp-preview-bar">
          <span className="dp-preview-label">Design Preview</span>
          <div className="dp-preview-divider" />
          <div className="dp-preview-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`dp-preview-tab${active === t.id ? ' dp-active' : ''}`}
                onClick={() => setActive(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screens */}
        {active === 'dashboard'  && <DashboardView />}
        {active === 'pre-call'   && <PreCallView />}
        {active === 'live-call'  && <LiveCallView />}
        {active === 'post-call'  && <PostCallView />}
        {active === 'analytics'  && <AnalyticsView />}
      </div>
    </div>
  );
}
