import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Button } from '../components/ui/Button';
import type { Meeting, MeetingPlatform, MeetingFollowUp } from '../types';
import {
  loadMeetings, saveMeeting, updateMeeting, deleteMeeting,
} from '../lib/meetingsSupabase';
import { formatScheduledAt } from '../lib/formatters';
import { useToast } from '../lib/toast';
import './MeetingsScreen.css';

// ─── Constants ────────────────────────────────────────────────────────────────

interface MeetingsScreenProps {
  userId: string;
  onWatchLive: (meeting: Meeting) => void;
  onViewReport: (meeting: Meeting) => void;
}

const PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  zoom: 'Zoom', meet: 'Google Meet', teams: 'Microsoft Teams', other: 'Other',
};
const PLATFORM_ICONS: Record<MeetingPlatform, string> = {
  zoom: '📹', meet: '📞', teams: '💼', other: '🔗',
};

// ─── Demo data ────────────────────────────────────────────────────────────────

function daysFromNow(n: number) { return new Date(Date.now() + n * 86_400_000).toISOString(); }
function daysAgo(n: number)     { return new Date(Date.now() - n * 86_400_000).toISOString(); }

const DEMO_MEETINGS: Meeting[] = [
  {
    id: 'demo-1', prospectName: 'Marcus Thompson', company: 'Nexus Ventures',
    prospectTitle: 'VP Sales', platform: 'zoom', meetingUrl: 'https://zoom.us/j/demo',
    scheduledAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    goal: 'Close enterprise deal — £24k ARR', status: 'live',
    startedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    notifyEmail: true, createdAt: daysAgo(1),
  },
  {
    id: 'demo-2', prospectName: 'Sarah Chen', company: 'TechFlow Inc.',
    prospectTitle: 'CTO', platform: 'meet', meetingUrl: 'https://meet.google.com/demo',
    scheduledAt: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    goal: 'Discovery and product demo', context: 'Warm intro via LinkedIn. Uses Salesforce.',
    status: 'scheduled', notifyEmail: true, createdAt: daysAgo(2),
  },
  {
    id: 'demo-3', prospectName: 'James Parker', company: 'Orbit Systems',
    prospectTitle: 'Head of Revenue', platform: 'teams', meetingUrl: 'https://teams.microsoft.com/demo',
    scheduledAt: daysFromNow(1), goal: 'Negotiate contract renewal',
    status: 'scheduled', notifyEmail: false, createdAt: daysAgo(3),
  },
  {
    id: 'demo-4', prospectName: 'Amara Okafor', company: 'Vertex Capital',
    prospectTitle: 'CEO', platform: 'zoom', meetingUrl: 'https://zoom.us/j/demo2',
    scheduledAt: daysAgo(1), goal: 'Pitch Series A partnership', status: 'completed',
    startedAt: daysAgo(1), endedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    durationSeconds: 28 * 60, notifyEmail: true, createdAt: daysAgo(4),
    report: {
      outcome: 'converted',
      summary: 'Strong meeting. Amara was highly engaged and asked detailed questions about the integration roadmap. Pricing was accepted at £18k ARR. She requested a formal proposal by Friday for her investment committee.',
      notes: [
        'Budget confirmed: £18k ARR within existing procurement budget',
        'Decision by end of quarter — investment committee meets 15th',
        'Key concern: onboarding time. Wants dedicated support for first 30 days',
        'Integration with existing HubSpot setup is a hard requirement',
      ],
      followUps: [
        { id: 'fu-1', task: 'Send formal proposal to Amara and CC investment committee', dueLabel: 'by Friday', done: false },
        { id: 'fu-2', task: 'Share onboarding case study (Nexus Ventures)', dueLabel: 'tomorrow', done: false },
        { id: 'fu-3', task: 'Book 30-min technical call with their IT lead', dueLabel: 'next week', done: false },
      ],
      followUpEmail: `Subject: Proposal + next steps — Pitchbase × Vertex Capital\n\nHi Amara,\n\nReally enjoyed our conversation today. As discussed, I'm attaching the formal proposal for the £18k ARR arrangement.\n\nKey points:\n• Full platform access for your team of 12\n• Dedicated onboarding support for the first 30 days\n• HubSpot integration included\n\nI'll also send the onboarding case study from Nexus Ventures.\n\nBest,\nAlex`,
    },
  },
  {
    id: 'demo-5', prospectName: 'Priya Sharma', company: 'CloudNine SaaS',
    prospectTitle: 'VP Growth', platform: 'meet', meetingUrl: 'https://meet.google.com/demo2',
    scheduledAt: daysAgo(3), goal: 'Upsell from Starter to Growth plan', status: 'completed',
    startedAt: daysAgo(3), endedAt: new Date(Date.now() - 3 * 86_400_000 + 35 * 60 * 1000).toISOString(),
    durationSeconds: 35 * 60, notifyEmail: true, createdAt: daysAgo(5),
    report: {
      outcome: 'pipeline',
      summary: 'Priya was interested but not yet ready to commit. Budget approval requires CFO sign-off. She liked the Growth plan features but wants utilisation data before upgrading. Follow-up in two weeks.',
      notes: [
        'CFO approval required for any plan upgrade above £500/mo',
        'Current Starter plan: 3 seats, 60% utilisation',
        'Growth features she flagged: team analytics, call recording, API access',
        'Timeline: revisit in 2 weeks once she has usage report',
      ],
      followUps: [
        { id: 'fu-4', task: 'Pull utilisation report and send to Priya', dueLabel: 'this week', done: true },
        { id: 'fu-5', task: 'Schedule follow-up call in 2 weeks', dueLabel: 'in 2 weeks', done: false },
      ],
      followUpEmail: `Subject: Usage data + Growth plan summary — as discussed\n\nHi Priya,\n\nAs promised, I'm attaching your usage report alongside a Growth plan breakdown.\n\nHighlights:\n• 3 seats, avg 18 calls/month per rep\n• 60% platform utilisation\n\nGrowth adds: team analytics, full call recording, API access.\n\nI'll reach out in two weeks.\n\nBest,\nAlex`,
    },
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatElapsed(startedAt: string): string {
  const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)} min`;
}

function formatTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function dayLabel(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const tomorrow  = new Date(today.getTime() + 86_400_000);
  const dFloor    = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dFloor.getTime() === today.getTime())     return 'Today';
  if (dFloor.getTime() === yesterday.getTime()) return 'Yesterday';
  if (dFloor.getTime() === tomorrow.getTime())  return 'Tomorrow';
  const diff = dFloor.getTime() - today.getTime();
  if (diff > 0 && diff < 7 * 86_400_000) return d.toLocaleDateString('en-GB', { weekday: 'long' });
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function groupByDay(meetings: Meeting[]): { label: string; meetings: Meeting[] }[] {
  const map = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const label = dayLabel(m.scheduledAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(m);
  }
  return [...map.entries()].map(([label, meetings]) => ({ label, meetings }));
}

function localDateTimeValue(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface ScheduleFormData {
  prospectName: string; company: string; prospectTitle: string;
  platform: MeetingPlatform; meetingUrl: string; scheduledAt: string;
  goal: string; context: string; pitch: string; notifyEmail: boolean;
}
const EMPTY_FORM: ScheduleFormData = {
  prospectName: '', company: '', prospectTitle: '', platform: 'zoom',
  meetingUrl: '', scheduledAt: '', goal: '', context: '', pitch: '', notifyEmail: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MeetingsScreen({ userId, onWatchLive, onViewReport }: MeetingsScreenProps) {
  const toast = useToast();
  const [loading,     setLoading]     = useState(true);
  const [isDemoMode,  setIsDemoMode]  = useState(false);
  const [meetings,    setMeetings]    = useState<Meeting[]>([]);
  const [showPanel,   setShowPanel]   = useState(false);
  const [form,        setForm]        = useState<ScheduleFormData>({ ...EMPTY_FORM, scheduledAt: localDateTimeValue() });
  const [formError,   setFormError]   = useState('');
  const [editId,      setEditId]      = useState<string | null>(null);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [ticker,      setTicker]      = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load meetings from Supabase on mount
  useEffect(() => {
    loadMeetings(userId)
      .then(data => {
        setMeetings(data.length ? data : DEMO_MEETINGS);
        setIsDemoMode(data.length === 0);
      })
      .catch(() => {
        toast.error('Failed to load meetings. Check your connection.');
        setMeetings(DEMO_MEETINGS);
        setIsDemoMode(true);
      })
      .finally(() => setLoading(false));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick every second for live elapsed display
  useEffect(() => {
    tickRef.current = setInterval(() => setTicker(t => t + 1), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const liveMeetings = meetings.filter(m => m.status === 'live');
  const upcoming = meetings
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = meetings
    .filter(m => m.status === 'completed' || m.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const upcomingGroups = groupByDay(upcoming);
  const pastGroups     = groupByDay(past);

  // All follow-ups from all meetings that have reports
  const allFollowUps = meetings
    .filter(m => m.report?.followUps?.length)
    .flatMap(m => (m.report!.followUps).map(fu => ({
      ...fu,
      meetingId:  m.id,
      clientName: m.prospectName,
      company:    m.company,
    })));

  async function toggleFollowUp(meetingId: string, followUpId: string) {
    const mtg = meetings.find(m => m.id === meetingId);
    if (!mtg?.report?.followUps) return;
    const updatedFollowUps = mtg.report.followUps.map((fu): MeetingFollowUp =>
      fu.id === followUpId ? { ...fu, done: !fu.done } : fu
    );
    const updatedReport = { ...mtg.report, followUps: updatedFollowUps };
    // Optimistic update
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, report: updatedReport } : m));
    try {
      await updateMeeting(meetingId, userId, { report: updatedReport });
    } catch {
      toast.error('Failed to save follow-up status.');
      // Rollback
      setMeetings(prev => prev.map(m => m.id === meetingId ? mtg : m));
    }
  }

  // ── Schedule panel handlers ──────────────────────────────────────────────────

  function openSchedulePanel() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, scheduledAt: localDateTimeValue() });
    setFormError('');
    setShowPanel(true);
  }

  function openEditPanel(m: Meeting) {
    setEditId(m.id);
    setForm({
      prospectName: m.prospectName, company: m.company ?? '',
      prospectTitle: m.prospectTitle ?? '', platform: m.platform,
      meetingUrl: m.meetingUrl, scheduledAt: m.scheduledAt.slice(0, 16),
      goal: m.goal, context: m.context ?? '', pitch: m.pitch ?? '', notifyEmail: m.notifyEmail,
    });
    setFormError('');
    setShowPanel(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prospectName.trim())               { setFormError('Prospect name is required.'); return; }
    if (!form.meetingUrl.trim())                 { setFormError('Meeting link is required.'); return; }
    if (!form.meetingUrl.startsWith('https://')) { setFormError('Meeting link must start with https://'); return; }
    if (!form.scheduledAt)                       { setFormError('Date and time are required.'); return; }
    if (!form.goal.trim())                       { setFormError('Meeting goal is required.'); return; }

    const patch = {
      prospectName:  form.prospectName.trim(),
      company:       form.company.trim() || undefined,
      prospectTitle: form.prospectTitle.trim() || undefined,
      platform:      form.platform,
      meetingUrl:    form.meetingUrl.trim(),
      scheduledAt:   new Date(form.scheduledAt).toISOString(),
      goal:          form.goal.trim(),
      context:       form.context.trim() || undefined,
      pitch:         form.pitch.trim() || undefined,
      notifyEmail:   form.notifyEmail,
    };

    setShowPanel(false);

    if (editId) {
      setMeetings(prev => prev.map(m => m.id === editId ? { ...m, ...patch } : m));
      try {
        await updateMeeting(editId, userId, patch);
      } catch {
        toast.error('Failed to save meeting changes.');
      }
    } else {
      const meeting: Meeting = {
        id: `m-${Date.now()}`,
        ...patch,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };
      setMeetings(prev => [meeting, ...prev]);
      if (isDemoMode) {
        setIsDemoMode(false);
        setMeetings([meeting]);
      }
      try {
        const saved = await saveMeeting(meeting, userId);
        setMeetings(prev => prev.map(m => m.id === meeting.id ? saved : m));
      } catch {
        toast.error('Failed to save meeting. Check your connection.');
      }
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) return <div className="app-loading">LOADING...</div>;

  return (
    <div className="meetings">

      {/* Schedule panel backdrop */}
      {showPanel && <div className="meetings__backdrop" onClick={() => setShowPanel(false)} />}

      {/* Schedule / Edit panel */}
      <aside className={`meetings__panel${showPanel ? ' meetings__panel--open' : ''}`}>
        <div className="meetings__panel-header">
          <span className="meetings__panel-title">{editId ? 'Edit Meeting' : 'Schedule Meeting'}</span>
          <button className="meetings__panel-close" onClick={() => setShowPanel(false)}>✕</button>
        </div>
        <form className="meetings__form" onSubmit={handleSubmit}>
          <div className="meetings__form-section">
            <div className="meetings__form-label">PROSPECT</div>
            <div className="meetings__form-row">
              <div className="meetings__field">
                <label className="meetings__field-label">Name <span className="meetings__required">*</span></label>
                <input className="meetings__input" value={form.prospectName} onChange={e => setForm(f => ({ ...f, prospectName: e.target.value }))} placeholder="Full name" autoFocus />
              </div>
              <div className="meetings__field">
                <label className="meetings__field-label">Company</label>
                <input className="meetings__input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" />
              </div>
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Job Title</label>
              <input className="meetings__input" value={form.prospectTitle} onChange={e => setForm(f => ({ ...f, prospectTitle: e.target.value }))} placeholder="e.g. VP Sales, CTO" />
            </div>
          </div>
          <div className="meetings__form-section">
            <div className="meetings__form-label">MEETING</div>
            <div className="meetings__field">
              <label className="meetings__field-label">Platform</label>
              <div className="meetings__platform-chips">
                {(['zoom', 'meet', 'teams', 'other'] as MeetingPlatform[]).map(p => (
                  <button key={p} type="button" className={`meetings__chip${form.platform === p ? ' meetings__chip--active' : ''}`} onClick={() => setForm(f => ({ ...f, platform: p }))}>
                    {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Meeting link <span className="meetings__required">*</span></label>
              <input className="meetings__input" value={form.meetingUrl} onChange={e => setForm(f => ({ ...f, meetingUrl: e.target.value }))} placeholder="https://zoom.us/j/..." type="url" />
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Date & Time <span className="meetings__required">*</span></label>
              <input className="meetings__input" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} type="datetime-local" />
            </div>
          </div>
          <div className="meetings__form-section">
            <div className="meetings__form-label">AI BRIEFING</div>
            <div className="meetings__field">
              <label className="meetings__field-label">Meeting goal <span className="meetings__required">*</span></label>
              <textarea className="meetings__textarea" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="What should the AI try to achieve?" rows={2} />
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Prior context</label>
              <textarea className="meetings__textarea" value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} placeholder="Research, previous conversations, known objections..." rows={2} />
            </div>
            <div className="meetings__field">
              <label className="meetings__field-label">Pitch / script <span className="meetings__field-hint">(optional)</span></label>
              <textarea className="meetings__textarea" value={form.pitch} onChange={e => setForm(f => ({ ...f, pitch: e.target.value }))} placeholder="Key talking points or a script for the AI to follow..." rows={3} />
            </div>
          </div>
          <div className="meetings__form-section">
            <div className="meetings__form-label">NOTIFICATIONS</div>
            <label className="meetings__checkbox-row">
              <input type="checkbox" className="meetings__checkbox" checked={form.notifyEmail} onChange={e => setForm(f => ({ ...f, notifyEmail: e.target.checked }))} />
              <span>Email me the full report when the meeting ends</span>
            </label>
          </div>
          {formError && <p className="meetings__form-error">{formError}</p>}
          <div className="meetings__form-actions">
            <Button type="button" variant="ghost" size="md" onClick={() => setShowPanel(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md">{editId ? 'Save Changes' : 'Schedule & Deploy Bot'}</Button>
          </div>
        </form>
      </aside>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="meetings__page-header">
        <div>
          <h1 className="meetings__page-title">Meetings</h1>
          <p className="meetings__page-sub">Your AI deploys to meetings on your behalf</p>
        </div>
        <Button variant="primary" size="md" onClick={openSchedulePanel}>+ SCHEDULE MEETING</Button>
      </div>

      {isDemoMode && (
        <div className="meetings__demo-banner">
          <span className="meetings__demo-icon">🎭</span>
          <span>Demo data — schedule your first meeting to get started</span>
          <button className="meetings__demo-dismiss" onClick={() => setIsDemoMode(false)}>Dismiss</button>
        </div>
      )}

      {/* ── Two-panel layout ─────────────────────────────────────────────────── */}
      <div className="meetings__layout">

        {/* ── LEFT SIDEBAR — timeline ────────────────────────────────────────── */}
        <aside className="meetings__sidebar">

          {/* Live Now */}
          {liveMeetings.length > 0 && (
            <div className="msb__section">
              <div className="msb__section-header msb__section-header--live">
                <span className="msb__live-dot" />
                LIVE NOW
                <span className="msb__count">{liveMeetings.length}</span>
              </div>
              {liveMeetings.map(m => (
                <div key={m.id} className="msb__item msb__item--live" onClick={() => onWatchLive(m)}>
                  <div className="msb__item-avatar msb__item-avatar--live">{getInitials(m.prospectName)}</div>
                  <div className="msb__item-body">
                    <div className="msb__item-name">{m.prospectName}</div>
                    <div className="msb__item-meta">{m.company ?? ''}</div>
                    <div className="msb__item-goal">{m.goal}</div>
                  </div>
                  <div className="msb__item-time msb__item-time--live">
                    {m.startedAt ? formatElapsed(m.startedAt) : '—'}
                    {/* ticker dependency so it re-renders */}
                    <span style={{ display: 'none' }}>{ticker}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div className="msb__section">
            <div className="msb__section-header">
              UPCOMING
              <span className="msb__count">{upcoming.length}</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="msb__empty">
                <span>No meetings scheduled</span>
                <button className="msb__empty-cta" onClick={openSchedulePanel}>Schedule one →</button>
              </div>
            ) : upcomingGroups.map(group => (
              <div key={group.label}>
                <div className="msb__day-label">{group.label}</div>
                {group.meetings.map(m => (
                  <div key={m.id} className="msb__item">
                    <div className="msb__item-avatar">{getInitials(m.prospectName)}</div>
                    <div className="msb__item-body">
                      <div className="msb__item-name">{m.prospectName}</div>
                      <div className="msb__item-meta">{m.company ?? ''}</div>
                      <div className="msb__item-goal">{m.goal}</div>
                    </div>
                    <div className="msb__item-right">
                      <div className="msb__item-time">{formatTimeOnly(m.scheduledAt)}</div>
                      <div className="msb__item-platform">{PLATFORM_ICONS[m.platform]}</div>
                      <button className="msb__edit-btn" title="Edit" onClick={e => { e.stopPropagation(); openEditPanel(m); }}>✎</button>
                      <button className="msb__del-btn" title="Cancel" onClick={async e => {
                        e.stopPropagation();
                        setMeetings(prev => prev.filter(x => x.id !== m.id));
                        try { await deleteMeeting(m.id, userId); }
                        catch { toast.error('Failed to cancel meeting.'); setMeetings(prev => [...prev, m]); }
                      }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div className="msb__section">
              <div className="msb__section-header">
                PAST
                <span className="msb__count">{past.length}</span>
              </div>
              {pastGroups.map(group => (
                <div key={group.label}>
                  <div className="msb__day-label">{group.label}</div>
                  {group.meetings.map(m => {
                    const outcome = m.report?.outcome;
                    return (
                      <div
                        key={m.id}
                        className={`msb__item msb__item--past${expandedId === m.id ? ' msb__item--selected' : ''}`}
                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                      >
                        <div className="msb__item-avatar msb__item-avatar--past">{getInitials(m.prospectName)}</div>
                        <div className="msb__item-body">
                          <div className="msb__item-name">{m.prospectName}</div>
                          <div className="msb__item-meta">{m.company ?? ''}</div>
                          <div className="msb__item-goal">{m.goal}</div>
                        </div>
                        <div className="msb__item-right">
                          {outcome && (
                            <span className={`msb__outcome msb__outcome--${outcome}`}>
                              {outcome === 'converted' ? '✓' : outcome === 'pipeline' ? '◷' : '✗'}
                            </span>
                          )}
                          {m.durationSeconds && (
                            <div className="msb__item-dur">{formatDuration(m.durationSeconds)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── RIGHT MAIN PANEL ───────────────────────────────────────────────── */}
        <div className="meetings__main">

          {/* ── SECTION 1: Notes & To-dos ──────────────────────────────────── */}
          <section className="mpanel__section" style={{ '--i': 0 } as CSSProperties}>
            <div className="mpanel__section-header">
              <span className="mpanel__section-title">NOTES & TO-DOS</span>
              <span className="mpanel__section-sub">Follow-ups across all clients</span>
            </div>

            {allFollowUps.length === 0 ? (
              <div className="mpanel__empty">
                No follow-ups yet — they'll appear here after completed meetings.
              </div>
            ) : (
              <div className="mpanel__todo-list">
                {allFollowUps.map(fu => (
                  <div key={`${fu.meetingId}-${fu.id}`} className={`mpanel__todo${fu.done ? ' mpanel__todo--done' : ''}`}>
                    <div className="mpanel__todo-left">
                      <span className={`mpanel__todo-client${fu.done ? ' mpanel__todo-client--done' : ''}`}>
                        {fu.clientName}
                      </span>
                      {fu.company && <span className="mpanel__todo-company"> · {fu.company}</span>}
                    </div>
                    <div className="mpanel__todo-body">
                      <span className={`mpanel__todo-task${fu.done ? ' mpanel__todo-task--done' : ''}`}>
                        {fu.task}
                      </span>
                      {fu.dueLabel && (
                        <span className="mpanel__todo-due">{fu.dueLabel}</span>
                      )}
                    </div>
                    <div className="mpanel__todo-actions">
                      <button
                        className={`mpanel__todo-btn mpanel__todo-btn--yes${fu.done ? ' mpanel__todo-btn--active' : ''}`}
                        onClick={() => toggleFollowUp(fu.meetingId, fu.id)}
                        title="Mark done"
                      >
                        ✓ Done
                      </button>
                      <button
                        className={`mpanel__todo-btn mpanel__todo-btn--no${!fu.done ? ' mpanel__todo-btn--active-no' : ''}`}
                        onClick={() => { if (fu.done) toggleFollowUp(fu.meetingId, fu.id); }}
                        title="Mark not done"
                      >
                        ✗ No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── SECTION 2: Client History ──────────────────────────────────── */}
          <section className="mpanel__section" style={{ '--i': 1 } as CSSProperties}>
            <div className="mpanel__section-header">
              <span className="mpanel__section-title">CLIENT HISTORY</span>
              <span className="mpanel__section-sub">{past.length} completed meeting{past.length !== 1 ? 's' : ''}</span>
            </div>

            {past.length === 0 ? (
              <div className="mpanel__empty">
                No completed meetings yet.
              </div>
            ) : (
              <div className="mpanel__history-list">
                {past.map(m => {
                  const isExpanded = expandedId === m.id;
                  const outcome = m.report?.outcome;
                  return (
                    <div key={m.id} className={`mpanel__history-card${isExpanded ? ' mpanel__history-card--open' : ''}`}>
                      {/* Collapsed header — always visible */}
                      <div
                        className="mpanel__history-header"
                        onClick={() => setExpandedId(isExpanded ? null : m.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setExpandedId(isExpanded ? null : m.id)}
                      >
                        <span className="mpanel__history-chevron">{isExpanded ? '▼' : '▶'}</span>
                        <div className="mpanel__history-avatar">{getInitials(m.prospectName)}</div>
                        <div className="mpanel__history-ident">
                          <span className="mpanel__history-name">{m.prospectName}</span>
                          {m.company && <span className="mpanel__history-company"> · {m.company}</span>}
                          <div className="mpanel__history-goal">{m.goal}</div>
                        </div>
                        <div className="mpanel__history-badges">
                          {outcome && (
                            <span className={`mpanel__outcome mpanel__outcome--${outcome}`}>
                              {outcome === 'converted' ? 'Converted' : outcome === 'pipeline' ? 'Pipeline' : 'No Deal'}
                            </span>
                          )}
                          {m.durationSeconds && (
                            <span className="mpanel__history-dur">{formatDuration(m.durationSeconds)}</span>
                          )}
                          <span className="mpanel__history-date">{formatScheduledAt(m.scheduledAt)}</span>
                        </div>
                      </div>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div className="mpanel__history-body">
                          {/* Meeting meta */}
                          <div className="mpanel__history-meta-row">
                            <span className="mpanel__meta-chip">
                              {PLATFORM_ICONS[m.platform]} {PLATFORM_LABELS[m.platform]}
                            </span>
                            {m.prospectTitle && (
                              <span className="mpanel__meta-chip">{m.prospectTitle}</span>
                            )}
                            {m.durationSeconds && (
                              <span className="mpanel__meta-chip">⏱ {formatDuration(m.durationSeconds)}</span>
                            )}
                          </div>

                          {/* Summary */}
                          {m.report?.summary && (
                            <div className="mpanel__history-summary">
                              <div className="mpanel__history-block-title">SUMMARY</div>
                              <p className="mpanel__history-summary-text">{m.report.summary}</p>
                            </div>
                          )}

                          {/* Notes */}
                          {m.report?.notes && m.report.notes.length > 0 && (
                            <div className="mpanel__history-notes">
                              <div className="mpanel__history-block-title">NOTES</div>
                              <ul className="mpanel__history-notes-list">
                                {m.report.notes.map((note, i) => (
                                  <li key={i} className="mpanel__history-note">{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Pending follow-ups */}
                          {m.report?.followUps && m.report.followUps.some(f => !f.done) && (
                            <div className="mpanel__history-pending">
                              <div className="mpanel__history-block-title">PENDING FOLLOW-UPS</div>
                              {m.report.followUps.filter(f => !f.done).map(fu => (
                                <div key={fu.id} className="mpanel__pending-item">
                                  <span className="mpanel__pending-dot">○</span>
                                  <span className="mpanel__pending-task">{fu.task}</span>
                                  <span className="mpanel__pending-due">{fu.dueLabel}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* View post-call summary */}
                          {m.report && (
                            <button
                              className="mpanel__history-report-btn"
                              onClick={() => onViewReport(m)}
                            >
                              View Post-call Summary →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
