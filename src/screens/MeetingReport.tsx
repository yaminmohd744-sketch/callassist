import { useState, type CSSProperties } from 'react';
import { Button } from '../components/ui/Button';
import type { Meeting, MeetingFollowUp } from '../types';
import { updateMeeting } from '../lib/meetingsStore';
import './MeetingReport.css';

interface MeetingReportProps {
  meeting: Meeting;
  onBack: () => void;
}

type Outcome = 'converted' | 'pipeline' | 'no-deal';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function MeetingReport({ meeting, onBack }: MeetingReportProps) {
  const report = meeting.report;
  const [outcome, setOutcome] = useState<Outcome | null>(report?.outcome ?? null);
  const [followUps, setFollowUps] = useState<MeetingFollowUp[]>(report?.followUps ?? []);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  if (!report) {
    return (
      <div className="mreport mreport--empty">
        <button className="mreport__back" onClick={onBack}>← Back</button>
        <div className="mreport__no-report">
          <span className="mreport__no-report-icon">📋</span>
          <p>No report available for this meeting yet.</p>
        </div>
      </div>
    );
  }

  // TypeScript narrows report to MeetingReport after the guard above.
  // Use this alias in closures to keep the narrowing explicit.
  const safeReport = report;

  function handleOutcome(o: Outcome) {
    setOutcome(o);
    updateMeeting(meeting.id, { report: { ...safeReport, outcome: o } });
  }

  function toggleFollowUp(id: string) {
    setFollowUps(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, done: !f.done } : f);
      updateMeeting(meeting.id, { report: { ...safeReport, followUps: updated } });
      return updated;
    });
  }

  function copyEmail() {
    navigator.clipboard.writeText(safeReport.followUpEmail)
      .then(() => { setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000); })
      .catch(() => { /* text is visible — user can select manually */ });
  }

  const pendingFollowUps = followUps.filter(f => !f.done).length;

  return (
    <div className="mreport">

      {/* Header */}
      <header className="mreport__header">
        <button className="mreport__back" onClick={onBack}>← Back</button>
        <div className="mreport__meeting-info">
          <div className="mreport__prospect">
            <span className="mreport__prospect-name">{meeting.prospectName}</span>
            {meeting.prospectTitle && <span className="mreport__prospect-title">{meeting.prospectTitle}</span>}
            {meeting.company && <span className="mreport__prospect-company">{meeting.company}</span>}
          </div>
          <div className="mreport__meta">
            {meeting.scheduledAt && <span>{formatDate(meeting.scheduledAt)}</span>}
            {meeting.durationSeconds && <span>{formatDuration(meeting.durationSeconds)}</span>}
          </div>
        </div>
        <div className="mreport__outcome-row">
          {(['converted', 'pipeline', 'no-deal'] as Outcome[]).map(o => (
            <button
              key={o}
              className={`mreport__outcome-btn mreport__outcome-btn--${o}${outcome === o ? ' mreport__outcome-btn--active' : ''}`}
              onClick={() => handleOutcome(o)}
            >
              {o === 'converted' ? 'Converted' : o === 'pipeline' ? 'Pipeline' : 'No Deal'}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="mreport__body">

        {/* Main column */}
        <div className="mreport__main">

          {/* Summary */}
          <section className="mreport__section db-anim" style={{ '--i': 0 } as CSSProperties}>
            <div className="mreport__section-label">SUMMARY</div>
            <div className="mreport__card">
              <p className="mreport__summary-text">{report.summary}</p>
            </div>
          </section>

          {/* Notes */}
          <section className="mreport__section db-anim" style={{ '--i': 1 } as CSSProperties}>
            <div className="mreport__section-label">KEY NOTES</div>
            <div className="mreport__card">
              <ul className="mreport__notes">
                {report.notes.map((note, i) => (
                  <li key={i} className="mreport__note">{note}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Transcript */}
          <section className="mreport__section db-anim" style={{ '--i': 2 } as CSSProperties}>
            <button
              className="mreport__transcript-toggle"
              onClick={() => setShowTranscript(s => !s)}
            >
              <span className="mreport__section-label">FULL TRANSCRIPT</span>
              <span className="mreport__toggle-caret">{showTranscript ? '▲' : '▼'}</span>
            </button>
            {showTranscript && (
              <div className="mreport__card mreport__card--transcript">
                <p className="mreport__transcript-placeholder">
                  Transcript will be available once Recall.ai integration is active. The live transcript captured during the meeting will appear here.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="mreport__sidebar">

          {/* Follow-ups */}
          <section className="mreport__section db-anim" style={{ '--i': 1 } as CSSProperties}>
            <div className="mreport__section-header-row">
              <div className="mreport__section-label">FOLLOW-UPS</div>
              {pendingFollowUps > 0 && (
                <span className="mreport__pending-badge">{pendingFollowUps} pending</span>
              )}
            </div>
            <div className="mreport__card mreport__card--followups">
              {followUps.map(f => (
                <label key={f.id} className={`mreport__followup${f.done ? ' mreport__followup--done' : ''}`}>
                  <input
                    type="checkbox"
                    className="mreport__checkbox"
                    checked={f.done}
                    onChange={() => toggleFollowUp(f.id)}
                  />
                  <div className="mreport__followup-content">
                    <span className="mreport__followup-task">{f.task}</span>
                    <span className="mreport__followup-due">{f.dueLabel}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Follow-up email */}
          <section className="mreport__section db-anim" style={{ '--i': 2 } as CSSProperties}>
            <div className="mreport__section-header-row">
              <div className="mreport__section-label">FOLLOW-UP EMAIL</div>
              <Button variant="ghost" size="sm" onClick={copyEmail}>
                {emailCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="mreport__card mreport__card--email">
              <pre className="mreport__email-text">{safeReport.followUpEmail}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
