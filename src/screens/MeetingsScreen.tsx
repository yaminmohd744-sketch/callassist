import { useState, type CSSProperties } from 'react';
import { Button } from '../components/ui/Button';
import type { Meeting, MeetingPlatform } from '../types';
import { loadMeetings, addMeeting, deleteMeeting, updateMeeting } from '../lib/meetingsStore';
import { formatScheduledAt } from '../lib/formatters';
import './MeetingsScreen.css';

interface MeetingsScreenProps {
  onWatchLive: (meeting: Meeting) => void;
  onViewReport: (meeting: Meeting) => void;
}

const PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  teams: 'Microsoft Teams',
  other: 'Other',
};

const PLATFORM_ICONS: Record<MeetingPlatform, string> = {
  zoom: '📹',
  meet: '📞',
  teams: '💼',
  other: '🔗',
};

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

const DEMO_MEETINGS: Meeting[] = [
  {
    id: 'demo-1',
    prospectName: 'Marcus Thompson',
    company: 'Nexus Ventures',
    prospectTitle: 'VP Sales',
    platform: 'zoom',
    meetingUrl: 'https://zoom.us/j/demo',
    scheduledAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    goal: 'Close enterprise deal — £24k ARR',
    status: 'live',
    startedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    notifyEmail: true,
    createdAt: daysAgo(1),
  },
  {
    id: 'demo-2',
    prospectName: 'Sarah Chen',
    company: 'TechFlow Inc.',
    prospectTitle: 'CTO',
    platform: 'meet',
    meetingUrl: 'https://meet.google.com/demo',
    scheduledAt: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    goal: 'Discovery and product demo',
    context: 'Warm intro via LinkedIn. Uses Salesforce currently.',
    status: 'scheduled',
    notifyEmail: true,
    createdAt: daysAgo(2),
  },
  {
    id: 'demo-3',
    prospectName: 'James Parker',
    company: 'Orbit Systems',
    prospectTitle: 'Head of Revenue',
    platform: 'teams',
    meetingUrl: 'https://teams.microsoft.com/demo',
    scheduledAt: daysFromNow(1),
    goal: 'Negotiate contract renewal',
    status: 'scheduled',
    notifyEmail: false,
    createdAt: daysAgo(3),
  },
  {
    id: 'demo-4',
    prospectName: 'Amara Okafor',
    company: 'Vertex Capital',
    prospectTitle: 'CEO',
    platform: 'zoom',
    meetingUrl: 'https://zoom.us/j/demo2',
    scheduledAt: daysAgo(1),
    goal: 'Pitch Series A partnership',
    status: 'completed',
    startedAt: daysAgo(1),
    endedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    durationSeconds: 28 * 60,
    notifyEmail: true,
    createdAt: daysAgo(4),
    report: {
      outcome: 'converted',
      summary: 'Strong meeting. Amara was highly engaged throughout and asked detailed questions about the integration roadmap. Pricing was discussed without resistance — she accepted the proposed £18k ARR figure. She requested a formal proposal by Friday to share with her investment committee.',
      notes: [
        'Budget confirmed: £18k ARR within existing procurement budget',
        'Decision by end of quarter — investment committee meets 15th',
        'Key concern: onboarding time. Wants dedicated support for first 30 days',
        'Integration with their existing HubSpot setup is a hard requirement',
      ],
      followUps: [
        { id: 'fu-1', task: 'Send formal proposal to Amara and CC investment committee', dueLabel: 'by Friday', done: false },
        { id: 'fu-2', task: 'Share onboarding case study (Nexus Ventures)', dueLabel: 'tomorrow', done: false },
        { id: 'fu-3', task: 'Book 30-min technical call with their IT lead', dueLabel: 'next week', done: false },
      ],
      followUpEmail: `Subject: Proposal + next steps — Pitchbase × Vertex Capital\n\nHi Amara,\n\nReally enjoyed our conversation today. As discussed, I'm attaching the formal proposal for the £18k ARR arrangement.\n\nKey points covered:\n• Full platform access for your team of 12\n• Dedicated onboarding support for the first 30 days\n• HubSpot integration included in the base plan\n\nI'll also send over the onboarding case study from Nexus Ventures — I think it'll address the timeline questions from your committee.\n\nLet me know if you'd like to set up that technical call before the 15th.\n\nBest,\nAlex`,
    },
  },
  {
    id: 'demo-5',
    prospectName: 'Priya Sharma',
    company: 'CloudNine SaaS',
    prospectTitle: 'VP Growth',
    platform: 'meet',
    meetingUrl: 'https://meet.google.com/demo2',
    scheduledAt: daysAgo(3),
    goal: 'Upsell from Starter to Growth plan',
    status: 'completed',
    startedAt: daysAgo(3),
    endedAt: new Date(Date.now() - 3 * 86_400_000 + 35 * 60 * 1000).toISOString(),
    durationSeconds: 35 * 60,
    notifyEmail: true,
    createdAt: daysAgo(5),
    report: {
      outcome: 'pipeline',
      summary: 'Priya was interested but not yet ready to commit. Budget approval requires CFO sign-off. She liked the Growth plan feature set but wants to see utilisation data from the current plan before upgrading. Meeting ended positively — she asked for a follow-up in two weeks.',
      notes: [
        'CFO approval required for any plan upgrade above £500/mo',
        'Current Starter plan: 3 seats, 60% utilisation',
        'Growth plan features she flagged: team analytics, call recording, API access',
        'Timeline: revisit in 2 weeks once she has usage report',
      ],
      followUps: [
        { id: 'fu-4', task: 'Pull utilisation report and send to Priya', dueLabel: 'this week', done: true },
        { id: 'fu-5', task: 'Schedule follow-up call in 2 weeks', dueLabel: 'in 2 weeks', done: false },
      ],
      followUpEmail: `Subject: Usage data + Growth plan summary — as discussed\n\nHi Priya,\n\nAs promised, I'm attaching your current usage report alongside a breakdown of what Growth unlocks for your team.\n\nHighlights from your current usage:\n• 3 seats, avg 18 calls/month per rep\n• 60% platform utilisation — strong signal you're ready for more\n\nGrowth plan adds: team analytics dashboard, full call recording, API access for your CRM.\n\nI'll reach out in two weeks to reconnect. If the CFO needs anything from me directly, I'm happy to jump on a quick call.\n\nBest,\nAlex`,
    },
  },
];


function formatElapsed(startedAt: string): string {
  const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

interface ScheduleFormData {
  prospectName: string;
  company: string;
  prospectTitle: string;
  platform: MeetingPlatform;
  meetingUrl: string;
  scheduledAt: string;
  goal: string;
  context: string;
  pitch: string;
  notifyEmail: boolean;
}

const EMPTY_FORM: ScheduleFormData = {
  prospectName: '',
  company: '',
  prospectTitle: '',
  platform: 'zoom',
  meetingUrl: '',
  scheduledAt: '',
  goal: '',
  context: '',
  pitch: '',
  notifyEmail: true,
};

function localDateTimeValue(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

export function MeetingsScreen({ onWatchLive, onViewReport }: MeetingsScreenProps) {
  const stored = loadMeetings();
  const [isDemoMode, setIsDemoMode] = useState(stored.length === 0);
  const [meetings, setMeetings] = useState<Meeting[]>(stored.length ? stored : DEMO_MEETINGS);
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<ScheduleFormData>({ ...EMPTY_FORM, scheduledAt: localDateTimeValue() });
  const [formError, setFormError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const liveMeetings = meetings.filter(m => m.status === 'live');
  const upcoming = meetings.filter(m => m.status === 'scheduled').sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  const past = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled').sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  const totalMeetings = meetings.filter(m => m.status === 'completed').length;
  const convertedCount = meetings.filter(m => m.report?.outcome === 'converted').length;
  const conversionRate = totalMeetings ? Math.round((convertedCount / totalMeetings) * 100) : 0;
  const avgDuration = totalMeetings
    ? Math.round(meetings.filter(m => m.durationSeconds).reduce((s, m) => s + (m.durationSeconds ?? 0), 0) / totalMeetings / 60)
    : 0;

  function openSchedulePanel() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, scheduledAt: localDateTimeValue() });
    setFormError('');
    setShowPanel(true);
  }

  function openEditPanel(m: Meeting) {
    setEditId(m.id);
    setForm({
      prospectName: m.prospectName,
      company: m.company ?? '',
      prospectTitle: m.prospectTitle ?? '',
      platform: m.platform,
      meetingUrl: m.meetingUrl,
      scheduledAt: m.scheduledAt.slice(0, 16),
      goal: m.goal,
      context: m.context ?? '',
      pitch: m.pitch ?? '',
      notifyEmail: m.notifyEmail,
    });
    setFormError('');
    setShowPanel(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prospectName.trim()) { setFormError('Prospect name is required.'); return; }
    if (!form.meetingUrl.trim()) { setFormError('Meeting link is required.'); return; }
    if (!form.meetingUrl.startsWith('https://')) { setFormError('Meeting link must start with https://'); return; }
    if (!form.scheduledAt) { setFormError('Date and time are required.'); return; }
    if (!form.goal.trim()) { setFormError('Meeting goal is required.'); return; }

    if (editId) {
      const updated = updateMeeting(editId, {
        prospectName: form.prospectName.trim(),
        company: form.company.trim() || undefined,
        prospectTitle: form.prospectTitle.trim() || undefined,
        platform: form.platform,
        meetingUrl: form.meetingUrl.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        goal: form.goal.trim(),
        context: form.context.trim() || undefined,
        pitch: form.pitch.trim() || undefined,
        notifyEmail: form.notifyEmail,
      });
      setMeetings(updated);
    } else {
      const meeting: Meeting = {
        id: `m-${Date.now()}`,
        prospectName: form.prospectName.trim(),
        company: form.company.trim() || undefined,
        prospectTitle: form.prospectTitle.trim() || undefined,
        platform: form.platform,
        meetingUrl: form.meetingUrl.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        goal: form.goal.trim(),
        context: form.context.trim() || undefined,
        pitch: form.pitch.trim() || undefined,
        notifyEmail: form.notifyEmail,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };
      const updated = addMeeting(meeting);
      setMeetings(updated);
      if (isDemoMode) setIsDemoMode(false);
    }
    setShowPanel(false);
  }

  function handleDelete(id: string) {
    setMeetings(deleteMeeting(id));
  }

  return (
    <div className="meetings">

      {/* Schedule panel backdrop */}
      {showPanel && (
        <div className="meetings__backdrop" onClick={() => setShowPanel(false)} />
      )}

      {/* Schedule / Edit side panel */}
      <aside className={`meetings__panel${showPanel ? ' meetings__panel--open' : ''}`}>
        <div className="meetings__panel-header">
          <span className="meetings__panel-title">{editId ? 'Edit Meeting' : 'Schedule Meeting'}</span>
          <button aria-label="Close panel" className="meetings__panel-close" onClick={() => setShowPanel(false)}>✕</button>
        </div>

        <form className="meetings__form" onSubmit={handleSubmit}>
          <div className="meetings__form-section">
            <div className="meetings__form-label">PROSPECT</div>
            <div className="meetings__form-row">
              <div className="meetings__field">
                <label className="meetings__field-label">Name <span className="meetings__required">*</span></label>
                <input
                  className="meetings__input"
                  value={form.prospectName}
                  onChange={e => setForm(f => ({ ...f, prospectName: e.target.value }))}
                  placeholder="Full name"
                  autoFocus
                />
              </div>
              <div className="meetings__field">
                <label className="meetings__field-label">Company</label>
                <input
                  className="meetings__input"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Job Title</label>
              <input
                className="meetings__input"
                value={form.prospectTitle}
                onChange={e => setForm(f => ({ ...f, prospectTitle: e.target.value }))}
                placeholder="e.g. VP Sales, CTO"
              />
            </div>
          </div>

          <div className="meetings__form-section">
            <div className="meetings__form-label">MEETING</div>
            <div className="meetings__field">
              <label className="meetings__field-label">Platform</label>
              <div className="meetings__platform-chips">
                {(['zoom', 'meet', 'teams', 'other'] as MeetingPlatform[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`meetings__chip${form.platform === p ? ' meetings__chip--active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, platform: p }))}
                  >
                    {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Meeting link <span className="meetings__required">*</span></label>
              <input
                className="meetings__input"
                value={form.meetingUrl}
                onChange={e => setForm(f => ({ ...f, meetingUrl: e.target.value }))}
                placeholder="https://zoom.us/j/..."
                type="url"
              />
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Date & Time <span className="meetings__required">*</span></label>
              <input
                className="meetings__input"
                value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                type="datetime-local"
              />
            </div>
          </div>

          <div className="meetings__form-section">
            <div className="meetings__form-label">AI BRIEFING</div>
            <div className="meetings__field">
              <label className="meetings__field-label">Meeting goal <span className="meetings__required">*</span></label>
              <textarea
                className="meetings__textarea"
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                placeholder="What should the AI try to achieve?"
                rows={2}
              />
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Prior context</label>
              <textarea
                className="meetings__textarea"
                value={form.context}
                onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                placeholder="Research, previous conversations, known objections..."
                rows={2}
              />
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Pitch / script <span className="meetings__field-hint">(optional)</span></label>
              <textarea
                className="meetings__textarea"
                value={form.pitch}
                onChange={e => setForm(f => ({ ...f, pitch: e.target.value }))}
                placeholder="Key talking points or a script for the AI to follow..."
                rows={3}
              />
            </div>
          </div>

          <div className="meetings__form-section">
            <div className="meetings__form-label">NOTIFICATIONS</div>
            <label className="meetings__checkbox-row">
              <input
                type="checkbox"
                className="meetings__checkbox"
                checked={form.notifyEmail}
                onChange={e => setForm(f => ({ ...f, notifyEmail: e.target.checked }))}
              />
              <span>Email me the full report when the meeting ends</span>
            </label>
          </div>

          {formError && <p className="meetings__form-error">{formError}</p>}

          <div className="meetings__form-actions">
            <Button type="button" variant="ghost" size="md" onClick={() => setShowPanel(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md">
              {editId ? 'Save Changes' : 'Schedule & Deploy Bot'}
            </Button>
          </div>
        </form>
      </aside>

      {/* Main content */}
      <div className="meetings__main">

        {/* Page header */}
        <div className="meetings__page-header db-anim" style={{ '--i': 0 } as CSSProperties}>
          <div>
            <h1 className="meetings__page-title">Meetings</h1>
            <p className="meetings__page-sub">Your AI deploys to meetings on your behalf</p>
          </div>
          <Button variant="primary" size="md" onClick={openSchedulePanel}>
            + Schedule Meeting
          </Button>
        </div>

        {/* Demo banner */}
        {isDemoMode && (
          <div className="meetings__demo-banner db-anim" style={{ '--i': 1 } as CSSProperties}>
            <span className="meetings__demo-icon">🎭</span>
            <span>Demo data — schedule your first meeting to get started</span>
            <button className="meetings__demo-dismiss" onClick={() => setIsDemoMode(false)}>Dismiss</button>
          </div>
        )}

        {/* Stats row */}
        <div className="meetings__stats db-anim" style={{ '--i': isDemoMode ? 2 : 1 } as CSSProperties}>
          {[
            { val: String(meetings.length), label: 'Total Meetings' },
            { val: String(liveMeetings.length), label: 'Live Now', live: liveMeetings.length > 0 },
            { val: totalMeetings ? `${conversionRate}%` : '—', label: 'Conversion Rate' },
            { val: totalMeetings ? `${avgDuration}m` : '—', label: 'Avg Duration' },
          ].map(s => (
            <div key={s.label} className={`meetings__stat${s.live ? ' meetings__stat--live' : ''}`}>
              <span className="meetings__stat-val">{s.val}</span>
              <span className="meetings__stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Live Now */}
        {liveMeetings.length > 0 && (
          <section className="meetings__section db-anim" style={{ '--i': 2 } as CSSProperties}>
            <div className="meetings__section-header">
              <span className="meetings__live-badge"><span className="meetings__live-dot" />LIVE NOW</span>
              <span className="meetings__section-count">{liveMeetings.length}</span>
            </div>
            <div className="meetings__cards">
              {liveMeetings.map((m, i) => (
                <LiveMeetingCard key={m.id} meeting={m} index={i} onWatch={onWatchLive} onEnd={() => {
                  setMeetings(updateMeeting(m.id, {
                    status: 'completed',
                    endedAt: new Date().toISOString(),
                    durationSeconds: m.startedAt
                      ? Math.floor((Date.now() - new Date(m.startedAt).getTime()) / 1000)
                      : 0,
                  }));
                }} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section className="meetings__section db-anim" style={{ '--i': liveMeetings.length > 0 ? 3 : 2 } as CSSProperties}>
          <div className="meetings__section-header">
            <span className="meetings__section-title">Upcoming</span>
            <span className="meetings__section-count">{upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="meetings__empty">
              <span className="meetings__empty-icon">📅</span>
              <span className="meetings__empty-text">No meetings scheduled</span>
              <button className="meetings__empty-cta" onClick={openSchedulePanel}>Schedule one</button>
            </div>
          ) : (
            <div className="meetings__cards">
              {upcoming.map((m, i) => (
                <UpcomingMeetingCard key={m.id} meeting={m} index={i} onEdit={() => openEditPanel(m)} onDelete={() => handleDelete(m.id)} />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section className="meetings__section db-anim" style={{ '--i': 4 } as CSSProperties}>
            <div className="meetings__section-header">
              <span className="meetings__section-title">Past Meetings</span>
              <span className="meetings__section-count">{past.length}</span>
            </div>
            <div className="meetings__cards meetings__cards--past">
              {past.map((m, i) => (
                <PastMeetingCard key={m.id} meeting={m} index={i} onViewReport={() => onViewReport(m)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function LiveMeetingCard({ meeting: m, index, onWatch, onEnd }: {
  meeting: Meeting; index: number; onWatch: (m: Meeting) => void; onEnd: () => void;
}) {
  return (
    <div className="mcard mcard--live" style={{ '--card-i': index } as CSSProperties}>
      <div className="mcard__top">
        <div className="mcard__live-indicator">
          <span className="mcard__live-dot" />
          <span className="mcard__live-label">LIVE</span>
          {m.startedAt && <span className="mcard__elapsed">{formatElapsed(m.startedAt)}</span>}
        </div>
        <div className="mcard__actions">
          <Button variant="primary" size="sm" onClick={() => onWatch(m)}>Watch Live</Button>
          <button className="mcard__end-btn" onClick={onEnd}>End</button>
        </div>
      </div>
      <div className="mcard__prospect">
        <span className="mcard__name">{m.prospectName}</span>
        {m.prospectTitle && <span className="mcard__sep">·</span>}
        {m.prospectTitle && <span className="mcard__title">{m.prospectTitle}</span>}
        {m.company && <span className="mcard__sep">·</span>}
        {m.company && <span className="mcard__company">{m.company}</span>}
      </div>
      <div className="mcard__meta">
        <span className="mcard__platform">{PLATFORM_ICONS[m.platform]} {PLATFORM_LABELS[m.platform]}</span>
        <span className="mcard__sep">·</span>
        <span className="mcard__goal">{m.goal}</span>
      </div>
    </div>
  );
}

function UpcomingMeetingCard({ meeting: m, index, onEdit, onDelete }: {
  meeting: Meeting; index: number; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="mcard mcard--upcoming" style={{ '--card-i': index } as CSSProperties}>
      <div className="mcard__top">
        <span className="mcard__time">{formatScheduledAt(m.scheduledAt)}</span>
        <div className="mcard__actions">
          <button className="mcard__ghost-btn" onClick={onEdit}>Edit</button>
          <button className="mcard__ghost-btn mcard__ghost-btn--danger" onClick={onDelete}>Cancel</button>
        </div>
      </div>
      <div className="mcard__prospect">
        <span className="mcard__name">{m.prospectName}</span>
        {m.prospectTitle && <span className="mcard__sep">·</span>}
        {m.prospectTitle && <span className="mcard__title">{m.prospectTitle}</span>}
        {m.company && <span className="mcard__sep">·</span>}
        {m.company && <span className="mcard__company">{m.company}</span>}
      </div>
      <div className="mcard__meta">
        <span className="mcard__platform">{PLATFORM_ICONS[m.platform]} {PLATFORM_LABELS[m.platform]}</span>
        <span className="mcard__sep">·</span>
        <span className="mcard__goal">{m.goal}</span>
      </div>
    </div>
  );
}

function PastMeetingCard({ meeting: m, index, onViewReport }: {
  meeting: Meeting; index: number; onViewReport: () => void;
}) {
  const outcome = m.report?.outcome;
  return (
    <div className="mcard mcard--past" style={{ '--card-i': index } as CSSProperties}>
      <div className="mcard__top">
        <div className="mcard__past-left">
          <span className="mcard__time">{formatScheduledAt(m.scheduledAt)}</span>
          {m.durationSeconds && <span className="mcard__duration">{formatDuration(m.durationSeconds)}</span>}
          {outcome && (
            <span className={`mcard__outcome mcard__outcome--${outcome}`}>
              {outcome === 'converted' ? 'Converted' : outcome === 'pipeline' ? 'Pipeline' : 'No Deal'}
            </span>
          )}
        </div>
        {m.report && (
          <Button variant="ghost" size="sm" onClick={onViewReport}>View Report</Button>
        )}
      </div>
      <div className="mcard__prospect">
        <span className="mcard__name">{m.prospectName}</span>
        {m.prospectTitle && <span className="mcard__sep">·</span>}
        {m.prospectTitle && <span className="mcard__title">{m.prospectTitle}</span>}
        {m.company && <span className="mcard__sep">·</span>}
        {m.company && <span className="mcard__company">{m.company}</span>}
      </div>
      {m.report?.followUps && m.report.followUps.some(f => !f.done) && (
        <div className="mcard__followup-hint">
          {m.report.followUps.filter(f => !f.done).length} follow-up{m.report.followUps.filter(f => !f.done).length > 1 ? 's' : ''} pending
        </div>
      )}
    </div>
  );
}
