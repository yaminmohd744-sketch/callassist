import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { loadMeetings, saveMeeting, deleteMeeting } from '../lib/meetings';
import type { Meeting, MeetingPlatform } from '../types';
import './MeetingsScreen.css';

interface MeetingsScreenProps {
  onJoin: (meeting: Meeting) => void;
}

const PLATFORMS: { value: MeetingPlatform; label: string; icon: string }[] = [
  { value: 'zoom',  label: 'Zoom',         icon: '📹' },
  { value: 'meet',  label: 'Google Meet',  icon: '📺' },
  { value: 'teams', label: 'Teams',        icon: '💼' },
  { value: 'other', label: 'Other',        icon: '🔗' },
];

interface FormState {
  prospectName: string;
  company: string;
  prospectTitle: string;
  platform: MeetingPlatform;
  meetingUrl: string;
  scheduledAt: string;
  context: string;
}

function emptyForm(): FormState {
  // Default scheduled time: next hour
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return {
    prospectName: '',
    company: '',
    prospectTitle: '',
    platform: 'zoom',
    meetingUrl: '',
    scheduledAt: local,
    context: '',
  };
}

function formatScheduledAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function isUpcoming(meeting: Meeting): boolean {
  return meeting.status === 'scheduled' || meeting.status === 'in-progress';
}

function statusBadge(status: Meeting['status']): string {
  const map: Record<string, string> = {
    scheduled:   'Scheduled',
    'in-progress': 'Live',
    completed:   'Completed',
    cancelled:   'Cancelled',
  };
  return map[status] ?? status;
}

export function MeetingsScreen({ onJoin }: MeetingsScreenProps) {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadMeetings(user.id)
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  function handleChange(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (formErrors[field]) setFormErrors(e => ({ ...e, [field]: '' }));
  }

  async function handleSave() {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.prospectName.trim()) errors.prospectName = 'Required';
    if (!form.meetingUrl.trim())   errors.meetingUrl = 'Required';
    if (!form.scheduledAt)         errors.scheduledAt = 'Required';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    if (!user) return;
    setSaving(true);
    try {
      const saved = await saveMeeting({
        prospectName:  form.prospectName.trim(),
        company:       form.company.trim() || undefined,
        prospectTitle: form.prospectTitle.trim() || undefined,
        platform:      form.platform,
        meetingUrl:    form.meetingUrl.trim(),
        scheduledAt:   new Date(form.scheduledAt).toISOString(),
        context:       form.context.trim() || undefined,
      }, user.id);
      setMeetings(prev => [...prev, saved].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      ));
      setShowForm(false);
      setForm(emptyForm());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    setMeetings(prev => prev.filter(m => m.id !== id));
    deleteMeeting(id, user.id).catch(console.error);
  }

  const upcoming = meetings.filter(isUpcoming);
  const past     = meetings.filter(m => !isUpcoming(m));

  return (
    <div className="meetings">

      {/* ── Header ── */}
      <div className="meetings__header">
        <div>
          <h1 className="meetings__title">Meetings</h1>
          <p className="meetings__sub">Schedule a meeting and the AI avatar joins automatically.</p>
        </div>
        <button className="meetings__add-btn" onClick={() => { setShowForm(true); setForm(emptyForm()); }}>
          + Schedule Meeting
        </button>
      </div>

      {/* ── Schedule form ── */}
      {showForm && (
        <div className="meetings__form-wrap">
          <div className="meetings__form">
            <div className="meetings__form-header">
              <span className="meetings__form-title">New Meeting</span>
              <button className="meetings__form-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="meetings__form-row">
              <div className={`meetings__field ${formErrors.prospectName ? 'meetings__field--error' : ''}`}>
                <label className="meetings__label">Prospect Name <span className="meetings__req">*</span></label>
                <input className="meetings__input" placeholder="e.g. Sarah Chen" value={form.prospectName}
                  onChange={e => handleChange('prospectName', e.target.value)} autoFocus />
                {formErrors.prospectName && <span className="meetings__error">{formErrors.prospectName}</span>}
              </div>
              <div className="meetings__field">
                <label className="meetings__label">Their Title</label>
                <input className="meetings__input" placeholder="e.g. VP of Sales" value={form.prospectTitle}
                  onChange={e => handleChange('prospectTitle', e.target.value)} />
              </div>
            </div>

            <div className="meetings__field">
              <label className="meetings__label">Company</label>
              <input className="meetings__input" placeholder="e.g. Acme Inc." value={form.company}
                onChange={e => handleChange('company', e.target.value)} />
            </div>

            <div className="meetings__field">
              <label className="meetings__label">Platform</label>
              <div className="meetings__platform-chips">
                {PLATFORMS.map(p => (
                  <button key={p.value} type="button"
                    className={`meetings__platform-chip ${form.platform === p.value ? 'meetings__platform-chip--active' : ''}`}
                    onClick={() => handleChange('platform', p.value)}
                  >
                    <span>{p.icon}</span> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`meetings__field ${formErrors.meetingUrl ? 'meetings__field--error' : ''}`}>
              <label className="meetings__label">Meeting Link <span className="meetings__req">*</span></label>
              <input className="meetings__input" placeholder="https://zoom.us/j/..." value={form.meetingUrl}
                onChange={e => handleChange('meetingUrl', e.target.value)} />
              {formErrors.meetingUrl && <span className="meetings__error">{formErrors.meetingUrl}</span>}
            </div>

            <div className={`meetings__field ${formErrors.scheduledAt ? 'meetings__field--error' : ''}`}>
              <label className="meetings__label">Date & Time <span className="meetings__req">*</span></label>
              <input className="meetings__input" type="datetime-local" value={form.scheduledAt}
                onChange={e => handleChange('scheduledAt', e.target.value)} />
              {formErrors.scheduledAt && <span className="meetings__error">{formErrors.scheduledAt}</span>}
            </div>

            <div className="meetings__field">
              <label className="meetings__label">Context / Notes</label>
              <textarea className="meetings__textarea" rows={3}
                placeholder="What's the goal? Pain points, background, what to focus on…"
                value={form.context} onChange={e => handleChange('context', e.target.value)} />
            </div>

            <div className="meetings__form-actions">
              <button className="meetings__btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="meetings__btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Scheduling…' : 'Schedule Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="meetings__loading">Loading meetings…</div>}

      {/* ── Upcoming ── */}
      {!loading && (
        <>
          <section className="meetings__section">
            <div className="meetings__section-label">
              UPCOMING
              <span className="meetings__section-count">{upcoming.length}</span>
            </div>

            {upcoming.length === 0 && (
              <div className="meetings__empty">
                <span className="meetings__empty-icon">📅</span>
                <p className="meetings__empty-text">No upcoming meetings.</p>
                <p className="meetings__empty-sub">Schedule one and the AI avatar will join automatically.</p>
              </div>
            )}

            <div className="meetings__list">
              {upcoming.map(m => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onJoin={onJoin}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>

          {past.length > 0 && (
            <section className="meetings__section">
              <div className="meetings__section-label">
                PAST
                <span className="meetings__section-count">{past.length}</span>
              </div>
              <div className="meetings__list">
                {past.map(m => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onJoin={onJoin}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (m: Meeting) => void;
  onDelete: (id: string) => void;
}

function MeetingCard({ meeting, onJoin, onDelete }: MeetingCardProps) {
  const platform = PLATFORMS.find(p => p.value === meeting.platform);
  const isLive = meeting.status === 'in-progress';
  const canJoin = meeting.status === 'scheduled' || meeting.status === 'in-progress';

  return (
    <div className={`meetings__card ${isLive ? 'meetings__card--live' : ''}`}>
      <div className="meetings__card-left">
        <span className="meetings__card-platform-icon">{platform?.icon ?? '🔗'}</span>
        <div className="meetings__card-info">
          <span className="meetings__card-name">{meeting.prospectName}</span>
          {meeting.company && <span className="meetings__card-company">{meeting.company}</span>}
          {meeting.prospectTitle && <span className="meetings__card-title">{meeting.prospectTitle}</span>}
          <span className="meetings__card-time">{formatScheduledAt(meeting.scheduledAt)}</span>
        </div>
      </div>
      <div className="meetings__card-right">
        <span className={`meetings__card-status meetings__card-status--${meeting.status}`}>
          {isLive && <span className="meetings__card-live-dot" />}
          {statusBadge(meeting.status)}
        </span>
        <div className="meetings__card-actions">
          {canJoin && (
            <button className="meetings__card-join-btn" onClick={() => onJoin(meeting)}>
              {isLive ? '↩ Rejoin' : '▶ Launch Avatar'}
            </button>
          )}
          <button className="meetings__card-delete-btn" onClick={() => onDelete(meeting.id)}
            title="Remove meeting" aria-label="Delete meeting">✕</button>
        </div>
      </div>
    </div>
  );
}
