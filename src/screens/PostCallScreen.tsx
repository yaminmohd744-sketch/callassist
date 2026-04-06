import { useState } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession } from '../types';
import './PostCallScreen.css';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildTranscriptText(session: CallSession): string {
  const header = [
    `CALL ASSIST - TRANSCRIPT`,
    `═══════════════════════════════════════`,
    `Prospect : ${session.config.prospectName || '-'}`,
    `Company  : ${session.config.company || '-'}`,
    `Goal     : ${session.config.callGoal}`,
    `Date     : ${formatDate(session.endedAt)}`,
    `Duration : ${formatDuration(session.durationSeconds)}`,
    `Close %  : ${session.finalCloseProbability}%`,
    `═══════════════════════════════════════`,
    '',
  ].join('\n');

  const lines = session.transcript.map(e => {
    const speaker = e.speaker === 'prospect' ? 'PROSPECT' : e.speaker === 'rep' ? 'YOU' : 'SYSTEM';
    const time = `${String(Math.floor(e.timestampSeconds / 60)).padStart(2, '0')}:${String(e.timestampSeconds % 60).padStart(2, '0')}`;
    return `[${time}] ${speaker}: ${e.text}`;
  }).join('\n');

  return header + (lines || '(no transcript entries)');
}

interface PostCallScreenProps {
  session: CallSession;
  onBack: () => void;
  onNewCall: () => void;
}

function renderSummary(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    // Detect ALL-CAPS subheadings like "WHAT WENT WELL:" or "NEXT STEPS:"
    const isHeading = /^[A-Z][A-Z\s]+:$/.test(trimmed);
    if (isHeading) {
      return <div key={i} className="postcall__summary-heading">{trimmed}</div>;
    }
    if (trimmed === '') {
      return <div key={i} className="postcall__summary-spacer" />;
    }
    return <div key={i} className="postcall__summary-line">{line}</div>;
  });
}

export function PostCallScreen({ session, onBack, onNewCall }: PostCallScreenProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'email'>('summary');

  const slug = (session.config.prospectName || 'call').toLowerCase().replace(/\s+/g, '-');

  async function handleCopyEmail() {
    await navigator.clipboard.writeText(session.followUpEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadEmail() {
    downloadFile(`followup-${slug}.txt`, session.followUpEmail);
  }

  function handleDownloadTranscript() {
    downloadFile(`transcript-${slug}.txt`, buildTranscriptText(session));
  }

  const probLevel = session.finalCloseProbability >= 61 ? 'high' : session.finalCloseProbability >= 31 ? 'medium' : 'low';
  const scoreLevel = session.leadScore >= 70 ? 'high' : session.leadScore >= 40 ? 'medium' : 'low';

  return (
    <div className="postcall">
      <div className="postcall__header">
        <button className="postcall__back" onClick={onBack}>← DASHBOARD</button>
        <div className="postcall__title-section">
          <h1 className="postcall__title">Call Complete</h1>
          <div className="postcall__meta">
            {session.config.prospectName && <span>{session.config.prospectName}</span>}
            {session.config.company && <><span className="postcall__sep">@</span><span>{session.config.company}</span></>}
            <span className="postcall__sep">·</span>
            <span>{formatDate(session.endedAt)}</span>
          </div>
        </div>
        <div className="postcall__header-actions">
          <div className="postcall__crm-badge">✓ Saved to CRM</div>
          <Button variant="primary" size="md" onClick={onNewCall}>
            ▶ NEW CALL
          </Button>
        </div>
      </div>

      <div className="postcall__stats-row">
        <div className="postcall__stat">
          <div className="postcall__stat-val">{formatDuration(session.durationSeconds)}</div>
          <div className="postcall__stat-label">DURATION</div>
        </div>
        <div className="postcall__stat">
          <div className={`postcall__stat-val postcall__stat-val--${session.objectionsCount > 0 ? 'red' : 'default'}`}>
            {session.objectionsCount}
          </div>
          <div className="postcall__stat-label">OBJECTIONS</div>
        </div>
        <div className="postcall__stat">
          <div className={`postcall__stat-val postcall__stat-val--${probLevel}`}>
            {session.finalCloseProbability}%
          </div>
          <div className="postcall__stat-label">CLOSE PROB</div>
        </div>
        <div className="postcall__stat">
          <div className={`postcall__stat-val postcall__stat-val--${scoreLevel}`}>
            {session.leadScore}
          </div>
          <div className="postcall__stat-label">LEAD SCORE</div>
        </div>
        <div className="postcall__stat">
          <div className="postcall__stat-val">{session.transcript.length}</div>
          <div className="postcall__stat-label">ENTRIES</div>
        </div>
        <div className="postcall__stat">
          <div className="postcall__stat-val postcall__stat-stage">{session.callStage.toUpperCase()}</div>
          <div className="postcall__stat-label">STAGE REACHED</div>
        </div>
      </div>

      <div className="postcall__tabs">
        <button className={`postcall__tab ${activeTab === 'summary' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('summary')}>AI SUMMARY</button>
        <button className={`postcall__tab ${activeTab === 'transcript' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('transcript')}>TRANSCRIPT</button>
        <button className={`postcall__tab ${activeTab === 'email' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('email')}>FOLLOW-UP EMAIL</button>
      </div>

      <div className="postcall__content">
        {activeTab === 'summary' && (
          <div className="postcall__summary">
            {renderSummary(session.aiSummary)}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="postcall__transcript-section">
            <div className="postcall__tab-actions">
              <Button variant="secondary" size="sm" onClick={handleDownloadTranscript}>
                ↓ DOWNLOAD .TXT
              </Button>
            </div>
            <div className="postcall__transcript">
              {session.transcript.length === 0 ? (
                <div className="postcall__empty">No transcript entries recorded.</div>
              ) : (
                session.transcript.map(entry => (
                  <div key={entry.id} className={`postcall__entry postcall__entry--${entry.signal}`}>
                    <div className="postcall__entry-meta">
                      <span className={`postcall__entry-speaker postcall__entry-speaker--${entry.speaker}`}>
                        {entry.speaker === 'prospect' ? 'PROSPECT' : entry.speaker === 'rep' ? 'YOU' : 'SYSTEM'}
                      </span>
                      <span className="postcall__entry-time">
                        {String(Math.floor(entry.timestampSeconds / 60)).padStart(2, '0')}:{String(entry.timestampSeconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="postcall__entry-text">{entry.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="postcall__email-section">
            <div className="postcall__tab-actions">
              <Button variant="secondary" size="sm" onClick={handleCopyEmail}>
                {copied ? '✓ COPIED' : '⎘ COPY'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownloadEmail}>
                ↓ DOWNLOAD .TXT
              </Button>
            </div>
            <pre className="postcall__pre postcall__pre--email">{session.followUpEmail}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
