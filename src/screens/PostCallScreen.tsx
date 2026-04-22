import { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession } from '../types';
import { formatDuration, formatDateLong } from '../lib/formatters';
import { useTranslations } from '../hooks/useTranslations';
import { computeRepScore } from '../lib/repScore';
import './PostCallScreen.css';

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
    `Date     : ${formatDateLong(session.endedAt)}`,
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
  const [activeTab, setActiveTab] = useState<'coaching' | 'summary' | 'transcript' | 'email' | 'scorecard'>(session.coaching ? 'coaching' : 'summary');

  // Phase 4: CRM export state
  const [jsonCopied, setJsonCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('callassist:zapier-webhook') ?? '');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [integrationsOpen, setIntegrationsOpen] = useState(false);

  const t = useTranslations();
  const slug = (session.config.prospectName || 'call').toLowerCase().replace(/\s+/g, '-');

  // Phase 3: scorecard metrics
  const repScore = useMemo(() => computeRepScore(session), [session]);
  const talkRatio = session.talkRatio ?? 0.5;
  const repPct = Math.round(talkRatio * 100);
  const objHandled = session.suggestions.filter(s => s.type === 'objection-response').length;
  const objHandlingRate = session.objectionsCount > 0
    ? Math.round((Math.min(objHandled / session.objectionsCount, 1)) * 100)
    : 100;
  const buyingSignals = session.suggestions.filter(s => s.type === 'close-attempt').length;

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

  async function handleCopyJson() {
    const payload = {
      prospect: session.config.prospectName,
      company: session.config.company,
      date: session.endedAt,
      duration: session.durationSeconds,
      closeProbability: session.finalCloseProbability,
      leadScore: session.leadScore,
      repScore,
      talkRatioPct: repPct,
      objectionsCount: session.objectionsCount,
      stage: session.callStage,
      keyObjections: session.suggestions.filter(s => s.type === 'objection-response').map(s => s.headline),
      buyingSignals: session.suggestions.filter(s => s.type === 'close-attempt').map(s => s.headline),
      aiSummary: session.aiSummary,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  }

  function handleOpenMailto() {
    const subject = encodeURIComponent(`Follow-up: ${session.config.prospectName}${session.config.company ? ` @ ${session.config.company}` : ''}`);
    const body = encodeURIComponent(session.followUpEmail);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }

  async function handleSendZapier() {
    if (!webhookUrl.trim()) return;
    setWebhookStatus('sending');
    try {
      const payload = {
        prospect: session.config.prospectName,
        company: session.config.company,
        date: session.endedAt,
        duration: session.durationSeconds,
        closeProbability: session.finalCloseProbability,
        leadScore: session.leadScore,
        repScore,
        objectionsCount: session.objectionsCount,
        aiSummary: session.aiSummary,
        followUpEmail: session.followUpEmail,
      };
      await fetch(webhookUrl.trim(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setWebhookStatus('ok');
      setTimeout(() => setWebhookStatus('idle'), 3000);
    } catch {
      setWebhookStatus('error');
      setTimeout(() => setWebhookStatus('idle'), 3000);
    }
  }

  const probLevel = session.finalCloseProbability >= 61 ? 'high' : session.finalCloseProbability >= 31 ? 'medium' : 'low';
  const scoreLevel = session.leadScore >= 70 ? 'high' : session.leadScore >= 40 ? 'medium' : 'low';

  return (
    <div className="postcall">
      <div className="postcall__header">
        <button className="postcall__back" onClick={onBack}>← {t.postcall.backToDashboard}</button>
        <div className="postcall__title-section">
          <h1 className="postcall__title">{t.postcall.title}</h1>
          <div className="postcall__meta">
            {session.config.prospectName && <span>{session.config.prospectName}</span>}
            {session.config.company && <><span className="postcall__sep">@</span><span>{session.config.company}</span></>}
            <span className="postcall__sep">·</span>
            <span>{formatDateLong(session.endedAt)}</span>
          </div>
        </div>
        <div className="postcall__header-actions">
          <div className="postcall__crm-badge">✓ {t.postcall.savedToCrm}</div>
          <Button variant="primary" size="md" onClick={onNewCall}>
            ▶ {t.postcall.newCall}
          </Button>
        </div>
      </div>

      <div className="postcall__stats-row">
        <div className="postcall__stat">
          <div className="postcall__stat-val">{formatDuration(session.durationSeconds)}</div>
          <div className="postcall__stat-label">{t.postcall.duration}</div>
        </div>
        <div className="postcall__stat">
          <div className={`postcall__stat-val postcall__stat-val--${session.objectionsCount > 0 ? 'red' : 'default'}`}>
            {session.objectionsCount}
          </div>
          <div className="postcall__stat-label">{t.postcall.objections}</div>
        </div>
        <div className="postcall__stat">
          <div className={`postcall__stat-val postcall__stat-val--${probLevel}`}>
            {session.finalCloseProbability}%
          </div>
          <div className="postcall__stat-label">{t.postcall.score}</div>
        </div>
        <div className="postcall__stat">
          <div className={`postcall__stat-val postcall__stat-val--${scoreLevel}`}>
            {session.leadScore}
          </div>
          <div className="postcall__stat-label">{t.postcall.leadScore}</div>
        </div>
        <div className="postcall__stat">
          <div className="postcall__stat-val">{session.transcript.length}</div>
          <div className="postcall__stat-label">{t.postcall.entries.toUpperCase()}</div>
        </div>
        <div className="postcall__stat">
          <div className="postcall__stat-val postcall__stat-stage">{session.callStage.toUpperCase()}</div>
          <div className="postcall__stat-label">{t.postcall.stageReached.toUpperCase()}</div>
        </div>
      </div>

      <div className="postcall__tabs">
        {session.coaching && (
          <button className={`postcall__tab ${activeTab === 'coaching' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('coaching')}>COACHING</button>
        )}
        <button className={`postcall__tab ${activeTab === 'summary' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('summary')}>{t.postcall.summary}</button>
        <button className={`postcall__tab ${activeTab === 'transcript' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('transcript')}>{t.postcall.transcript}</button>
        <button className={`postcall__tab ${activeTab === 'email' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('email')}>{t.postcall.followUp}</button>
        <button className={`postcall__tab ${activeTab === 'scorecard' ? 'postcall__tab--active' : ''}`} onClick={() => setActiveTab('scorecard')}>SCORECARD</button>
      </div>

      <div className="postcall__content">
        {activeTab === 'coaching' && session.coaching && (
          <div className="coaching">
            <div className="coaching__verdict">
              <span className="coaching__verdict-icon">{session.finalCloseProbability >= 55 ? '◆' : session.finalCloseProbability >= 35 ? '◇' : '△'}</span>
              <span className="coaching__verdict-text">{session.coaching.overallVerdict}</span>
            </div>

            <div className="coaching__grid">
              <div className="coaching__section coaching__section--green">
                <div className="coaching__section-title">WHAT WENT WELL</div>
                <ul className="coaching__list">
                  {session.coaching.whatWentWell.map((item, i) => (
                    <li key={i} className="coaching__list-item coaching__list-item--green">
                      <div className="coaching__item-point">{item.point}</div>
                      <div className="coaching__item-note">{item.salesNote}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="coaching__section coaching__section--orange">
                <div className="coaching__section-title">AREAS TO IMPROVE</div>
                <ul className="coaching__list">
                  {session.coaching.areasToImprove.map((item, i) => (
                    <li key={i} className="coaching__list-item coaching__list-item--orange">
                      <div className="coaching__item-point">{item.point}</div>
                      <div className="coaching__item-note">{item.salesNote}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {session.coaching.keyMoments.length > 0 && (
              <div className="coaching__moments">
                <div className="coaching__section-title">KEY MOMENTS</div>
                <div className="coaching__moments-list">
                  {session.coaching.keyMoments.map((m, i) => {
                    const mins = String(Math.floor(m.timestampSeconds / 60)).padStart(2, '0');
                    const secs = String(m.timestampSeconds % 60).padStart(2, '0');
                    return (
                      <div key={i} className={`coaching__moment coaching__moment--${m.label === 'Objection' ? 'objection' : 'signal'}`}>
                        <span className="coaching__moment-time">{mins}:{secs}</span>
                        <span className="coaching__moment-label">{m.label}</span>
                        <span className="coaching__moment-note">{m.note}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="coaching__tip">
              <div className="coaching__tip-label">TIP FOR NEXT CALL</div>
              <div className="coaching__tip-text">{session.coaching.nextCallTip}</div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="postcall__summary">
            {renderSummary(session.aiSummary)}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="postcall__transcript-section">
            <div className="postcall__tab-actions">
              <Button variant="secondary" size="sm" onClick={handleDownloadTranscript}>
                ↓ {t.postcall.download}
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
                {copied ? `✓ ${t.postcall.copyEmail}` : `⎘ ${t.postcall.copyEmail}`}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownloadEmail}>
                ↓ {t.postcall.download}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleOpenMailto}>
                ✉ Open in Email
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopyJson}>
                {jsonCopied ? '✓ Copied' : '⎘ Copy JSON'}
              </Button>
            </div>
            <pre className="postcall__pre postcall__pre--email">{session.followUpEmail}</pre>

            {/* Integrations / Zapier */}
            <div className="postcall__integrations">
              <button className="postcall__integrations-toggle" onClick={() => setIntegrationsOpen(v => !v)}>
                <span style={{ transform: integrationsOpen ? 'rotate(90deg)' : undefined, display: 'inline-block', transition: 'transform 0.15s' }}>▶</span>
                Integrations (Zapier / Webhook)
              </button>
              {integrationsOpen && (
                <div className="postcall__integrations-body">
                  <p className="postcall__integrations-desc">
                    Paste a Zapier Webhook URL to push this call summary to your CRM, Slack, or any connected app.
                  </p>
                  <p className="postcall__integrations-disclaimer">
                    ⚠ Call data sent to this URL includes prospect name, company, and AI summary. Only use trusted endpoints.
                  </p>
                  <div className="postcall__webhook-row">
                    <input
                      className="postcall__webhook-input"
                      type="url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      onBlur={e => localStorage.setItem('callassist:zapier-webhook', e.target.value)}
                    />
                    <button
                      className="postcall__webhook-btn"
                      onClick={handleSendZapier}
                      disabled={!webhookUrl.trim() || webhookStatus === 'sending'}
                    >
                      {webhookStatus === 'sending' ? 'Sending…' : 'Send'}
                    </button>
                  </div>
                  {webhookStatus !== 'idle' && (
                    <p className={`postcall__webhook-status postcall__webhook-status--${webhookStatus}`}>
                      {webhookStatus === 'ok' && '✓ Sent successfully'}
                      {webhookStatus === 'error' && '✕ Send failed — check the URL and try again'}
                      {webhookStatus === 'sending' && '…'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'scorecard' && (
          <div className="scorecard">
            <div className="scorecard__score-block">
              <div className={`scorecard__score-ring scorecard__score-ring--${repScore >= 70 ? 'high' : repScore >= 45 ? 'medium' : 'low'}`}
                style={{ '--score-pct': `${repScore}%` } as React.CSSProperties}>
                <span className="scorecard__score-num">{repScore}</span>
                <span className="scorecard__score-label">REP SCORE</span>
              </div>
            </div>

            <div className="scorecard__metrics">
              <div className="scorecard__metric">
                <div className="scorecard__metric-header">
                  <span className="scorecard__metric-name">TALK RATIO</span>
                  <span className={`scorecard__metric-value ${repPct > 65 ? 'scorecard__metric-value--low' : repPct > 50 ? 'scorecard__metric-value--medium' : 'scorecard__metric-value--high'}`}>
                    You {repPct}% · Prospect {100 - repPct}%
                  </span>
                </div>
                <div className="scorecard__ratio-bar">
                  <div className="scorecard__ratio-rep" style={{ width: `${repPct}%` }} />
                  <div className="scorecard__ratio-prospect" style={{ width: `${100 - repPct}%` }} />
                </div>
                <p className="scorecard__metric-hint">
                  {repPct <= 50 ? '✓ Good — you let the prospect talk more than half the time' :
                   repPct <= 65 ? '◎ Slightly high — aim for under 50% talk time' :
                   '⚠ High — you\'re talking too much. Ask more questions.'}
                </p>
              </div>

              <div className="scorecard__metric">
                <div className="scorecard__metric-header">
                  <span className="scorecard__metric-name">OBJECTION HANDLING RATE</span>
                  <span className={`scorecard__metric-value ${objHandlingRate >= 70 ? 'scorecard__metric-value--high' : objHandlingRate >= 40 ? 'scorecard__metric-value--medium' : 'scorecard__metric-value--low'}`}>
                    {objHandled}/{session.objectionsCount} handled ({objHandlingRate}%)
                  </span>
                </div>
                <div className="scorecard__gauge">
                  <div className={`scorecard__gauge-fill scorecard__gauge-fill--${objHandlingRate >= 70 ? 'high' : objHandlingRate >= 40 ? 'medium' : 'low'}`}
                    style={{ width: `${objHandlingRate}%` }} />
                </div>
              </div>

              <div className="scorecard__metric">
                <div className="scorecard__metric-header">
                  <span className="scorecard__metric-name">BUYING SIGNALS DETECTED</span>
                  <span className={`scorecard__metric-value ${buyingSignals >= 3 ? 'scorecard__metric-value--high' : buyingSignals >= 1 ? 'scorecard__metric-value--medium' : 'scorecard__metric-value--low'}`}>
                    {buyingSignals} signal{buyingSignals !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="scorecard__signals">
                  {session.suggestions.filter(s => s.type === 'close-attempt').map(s => (
                    <span key={s.id} className="scorecard__signal-pill">{s.headline}</span>
                  ))}
                  {buyingSignals === 0 && <span className="scorecard__no-signals">None detected this call</span>}
                </div>
              </div>

              <div className="scorecard__metric">
                <div className="scorecard__metric-header">
                  <span className="scorecard__metric-name">CLOSE PROBABILITY</span>
                  <span className={`scorecard__metric-value scorecard__metric-value--${probLevel}`}>
                    {session.finalCloseProbability}%
                  </span>
                </div>
                <div className="scorecard__gauge">
                  <div className={`scorecard__gauge-fill scorecard__gauge-fill--${probLevel}`}
                    style={{ width: `${session.finalCloseProbability}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
