import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession, CallOutcome } from '../types';
import { loadRecording } from '../hooks/useCallRecorder';
import { formatDuration, formatDateLong } from '../lib/formatters';
import { useTranslations } from '../hooks/useTranslations';
import { computeRepScore } from '../lib/repScore';
import { generateProspectSummary } from '../lib/ai';
import './PostCallScreen.css';

function isValidWebhookUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  onUpdateOutcome?: (outcome: CallOutcome) => void;
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

export function PostCallScreen({ session, onBack, onNewCall, onUpdateOutcome }: PostCallScreenProps) {
  const [outcome, setOutcome] = useState<CallOutcome>(session.outcome ?? null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'coaching' | 'summary' | 'transcript' | 'email' | 'scorecard' | 'replay' | 'share'>(session.coaching ? 'coaching' : 'summary');
  const [prospectSummary, setProspectSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [replayCurrentTime, setReplayCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [emailDraft, setEmailDraft] = useState(session.followUpEmail);
  const emailEdited = emailDraft !== session.followUpEmail;

  // Phase 4: CRM export state
  const [jsonCopied, setJsonCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('callassist:zapier-webhook') ?? '');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [webhookUrlError, setWebhookUrlError] = useState<string | null>(null);
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

  useEffect(() => {
    if (activeTab !== 'replay' || !session.recordingKey || recordingUrl) return;
    loadRecording(session.recordingKey).then(blob => {
      if (blob) setRecordingUrl(URL.createObjectURL(blob));
    }).catch(() => {});
    return () => { if (recordingUrl) URL.revokeObjectURL(recordingUrl); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session.recordingKey]);

  async function handleGenerateProspectSummary() {
    if (generatingSummary) return;
    setGeneratingSummary(true);
    try {
      const summary = await generateProspectSummary(session);
      setProspectSummary(summary);
    } finally {
      setGeneratingSummary(false);
    }
  }

  async function handleCopyProspectSummary() {
    if (!prospectSummary) return;
    await navigator.clipboard.writeText(prospectSummary);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  }

  function handleShareTab() {
    setActiveTab('share');
    if (!prospectSummary && !generatingSummary) handleGenerateProspectSummary();
  }

  function handleOutcome(o: CallOutcome) {
    const next = outcome === o ? null : o;
    setOutcome(next);
    onUpdateOutcome?.(next);
  }

  async function handleCopyEmail() {
    await navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadEmail() {
    downloadFile(`followup-${slug}.txt`, emailDraft);
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
    const body = encodeURIComponent(emailDraft);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }

  async function handleSendZapier() {
    if (!webhookUrl.trim()) return;
    if (!isValidWebhookUrl(webhookUrl)) {
      setWebhookStatus('error');
      setTimeout(() => setWebhookStatus('idle'), 3000);
      return;
    }
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
        followUpEmail: emailDraft,
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

      <div className="postcall__outcome-row">
        <span className="postcall__outcome-label">Did this convert?</span>
        <button
          className={`postcall__outcome-btn postcall__outcome-btn--won${outcome === 'converted' ? ' postcall__outcome-btn--active' : ''}`}
          onClick={() => handleOutcome('converted')}
        >✓ Converted</button>
        <button
          className={`postcall__outcome-btn postcall__outcome-btn--pipeline${outcome === 'pipeline' ? ' postcall__outcome-btn--active' : ''}`}
          onClick={() => handleOutcome('pipeline')}
        >◷ Pipeline</button>
        <button
          className={`postcall__outcome-btn postcall__outcome-btn--lost${outcome === 'no-deal' ? ' postcall__outcome-btn--active' : ''}`}
          onClick={() => handleOutcome('no-deal')}
        >✗ No Deal</button>
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

      <div className="postcall__tabs" role="tablist">
        {session.coaching && (
          <button
            role="tab"
            aria-selected={activeTab === 'coaching'}
            id="postcall-tab-coaching"
            aria-controls="postcall-panel-coaching"
            className={`postcall__tab ${activeTab === 'coaching' ? 'postcall__tab--active' : ''}`}
            onClick={() => setActiveTab('coaching')}
          >COACHING</button>
        )}
        <button
          role="tab"
          aria-selected={activeTab === 'summary'}
          id="postcall-tab-summary"
          aria-controls="postcall-panel-summary"
          className={`postcall__tab ${activeTab === 'summary' ? 'postcall__tab--active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >{t.postcall.summary}</button>
        <button
          role="tab"
          aria-selected={activeTab === 'transcript'}
          id="postcall-tab-transcript"
          aria-controls="postcall-panel-transcript"
          className={`postcall__tab ${activeTab === 'transcript' ? 'postcall__tab--active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >{t.postcall.transcript}</button>
        <button
          role="tab"
          aria-selected={activeTab === 'email'}
          id="postcall-tab-email"
          aria-controls="postcall-panel-email"
          className={`postcall__tab ${activeTab === 'email' ? 'postcall__tab--active' : ''}`}
          onClick={() => setActiveTab('email')}
        >{t.postcall.followUp}</button>
        {session.recordingKey && (
          <button
            role="tab"
            aria-selected={activeTab === 'replay'}
            id="postcall-tab-replay"
            aria-controls="postcall-panel-replay"
            className={`postcall__tab ${activeTab === 'replay' ? 'postcall__tab--active' : ''}`}
            onClick={() => setActiveTab('replay')}
          >▶ REPLAY</button>
        )}
        <button
          role="tab"
          aria-selected={activeTab === 'scorecard'}
          id="postcall-tab-scorecard"
          aria-controls="postcall-panel-scorecard"
          className={`postcall__tab ${activeTab === 'scorecard' ? 'postcall__tab--active' : ''}`}
          onClick={() => setActiveTab('scorecard')}
        >SCORECARD</button>
        <button
          role="tab"
          aria-selected={activeTab === 'share'}
          id="postcall-tab-share"
          aria-controls="postcall-panel-share"
          className={`postcall__tab ${activeTab === 'share' ? 'postcall__tab--active' : ''}`}
          onClick={handleShareTab}
        >↗ SHARE</button>
      </div>

      <div className="postcall__content">
        {activeTab === 'coaching' && session.coaching && (
          <div className="coaching" role="tabpanel" id="postcall-panel-coaching" aria-labelledby="postcall-tab-coaching" tabIndex={0}>
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
          <div className="postcall__summary" role="tabpanel" id="postcall-panel-summary" aria-labelledby="postcall-tab-summary" tabIndex={0}>
            {renderSummary(session.aiSummary)}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="postcall__transcript-section" role="tabpanel" id="postcall-panel-transcript" aria-labelledby="postcall-tab-transcript" tabIndex={0}>
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
          <div className="postcall__email-section" role="tabpanel" id="postcall-panel-email" aria-labelledby="postcall-tab-email" tabIndex={0}>
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
              {emailEdited && (
                <Button variant="secondary" size="sm" onClick={() => setEmailDraft(session.followUpEmail)}>
                  ↺ Reset to AI version
                </Button>
              )}
            </div>
            {emailEdited && (
              <div className="postcall__email-edited-badge">✎ Edited — copy or download to save your changes</div>
            )}
            <textarea
              className="postcall__email-editor"
              value={emailDraft}
              onChange={e => setEmailDraft(e.target.value)}
              spellCheck={false}
            />

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
                  {webhookUrlError && (
                    <p className="postcall__webhook-status postcall__webhook-status--error">{webhookUrlError}</p>
                  )}
                  <div className="postcall__webhook-row">
                    <input
                      className="postcall__webhook-input"
                      type="url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={webhookUrl}
                      onChange={e => { setWebhookUrl(e.target.value); setWebhookUrlError(null); }}
                      onBlur={e => {
                        const val = e.target.value.trim();
                        if (!val) { setWebhookUrlError(null); return; }
                        if (!isValidWebhookUrl(val)) {
                          setWebhookUrlError('Must be a valid https:// URL');
                        } else {
                          setWebhookUrlError(null);
                          try { localStorage.setItem('callassist:zapier-webhook', val); } catch { /* storage full */ }
                        }
                      }}
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
          <div className="scorecard" role="tabpanel" id="postcall-panel-scorecard" aria-labelledby="postcall-tab-scorecard" tabIndex={0}>
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

        {activeTab === 'replay' && (
          <div className="postcall__replay" role="tabpanel" id="postcall-panel-replay" aria-labelledby="postcall-tab-replay" tabIndex={0}>
            {!recordingUrl ? (
              <div className="postcall__replay-loading">
                <div className="postcall__replay-loading-icon">▶</div>
                <div>Loading recording…</div>
              </div>
            ) : (
              <>
                <audio
                  ref={audioRef}
                  src={recordingUrl}
                  controls
                  className="postcall__replay-audio"
                  onTimeUpdate={e => setReplayCurrentTime((e.target as HTMLAudioElement).currentTime)}
                />
                <div className="postcall__replay-timeline">
                  {session.transcript.map((entry, i) => {
                    const isActive = replayCurrentTime >= entry.timestampSeconds &&
                      (i === session.transcript.length - 1 || replayCurrentTime < session.transcript[i + 1].timestampSeconds);
                    const mins = String(Math.floor(entry.timestampSeconds / 60)).padStart(2, '0');
                    const secs = String(entry.timestampSeconds % 60).padStart(2, '0');
                    return (
                      <div
                        key={entry.id}
                        className={`postcall__replay-entry postcall__replay-entry--${entry.speaker}${isActive ? ' postcall__replay-entry--active' : ''}`}
                        onClick={() => { if (audioRef.current) audioRef.current.currentTime = entry.timestampSeconds; }}
                      >
                        <span className="postcall__replay-ts">{mins}:{secs}</span>
                        <span className="postcall__replay-speaker">{entry.speaker === 'rep' ? 'YOU' : 'PROSPECT'}</span>
                        <span className="postcall__replay-text">{entry.text}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="postcall__share" role="tabpanel" id="postcall-panel-share" aria-labelledby="postcall-tab-share" tabIndex={0}>
            <div className="postcall__share-header">
              <div className="postcall__share-title">Prospect Summary</div>
              <p className="postcall__share-desc">
                A clean, context-aware recap of this call — written for {session.config.prospectName || 'your prospect'}.
                Copy it and send via email, WhatsApp, or however you follow up.
              </p>
            </div>

            {generatingSummary && (
              <div className="postcall__share-loading">
                <span className="postcall__share-spinner" />
                <span>Analysing your call and crafting the summary…</span>
              </div>
            )}

            {!generatingSummary && prospectSummary && (
              <>
                <div className="postcall__share-body">
                  {prospectSummary.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (trimmed === '') return <div key={i} className="postcall__share-spacer" />;
                    return <p key={i} className="postcall__share-line">{line}</p>;
                  })}
                </div>
                <div className="postcall__share-actions">
                  <button className="postcall__share-copy-btn" onClick={handleCopyProspectSummary}>
                    {summaryCopied ? '✓ Copied!' : '⎘ Copy to clipboard'}
                  </button>
                  <button className="postcall__share-regen-btn" onClick={handleGenerateProspectSummary}>
                    ↺ Regenerate
                  </button>
                </div>
                <p className="postcall__share-hint">
                  Paste this anywhere — email, LinkedIn DM, WhatsApp, Notion, your CRM notes.
                </p>
              </>
            )}

            {!generatingSummary && !prospectSummary && (
              <div className="postcall__share-empty">
                <button className="postcall__share-generate-btn" onClick={handleGenerateProspectSummary}>
                  ◈ Generate Prospect Summary
                </button>
                <p className="postcall__share-empty-hint">
                  AI will analyse the call and write a personalised recap you can send directly to {session.config.prospectName || 'the prospect'}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
