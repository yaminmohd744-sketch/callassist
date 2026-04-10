import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession } from '../types';
import { getStreak } from '../lib/streak';
import { formatDuration, formatDateShort, formatDateFull } from '../lib/formatters';
import { useTranslations } from '../hooks/useTranslations';
import './DashboardScreen.css';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}


interface DerivedContact {
  name: string;
  company: string;
  totalCalls: number;
  latestLeadScore: number;
  bestCloseProbability: number;
  lastCallDate: string;
  sessions: CallSession[];
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function deriveContacts(sessions: CallSession[]): DerivedContact[] {
  const map = new Map<string, DerivedContact>();
  for (const s of sessions) {
    const key = `${(s.config.prospectName || '').toLowerCase()}||${(s.config.company || '').toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        name: toTitleCase(s.config.prospectName || 'Unknown'),
        company: toTitleCase(s.config.company || ''),
        totalCalls: 0,
        latestLeadScore: s.leadScore,
        bestCloseProbability: 0,
        lastCallDate: s.endedAt,
        sessions: [],
      });
    }
    const c = map.get(key)!;
    c.totalCalls++;
    c.sessions.push(s);
    if (new Date(s.endedAt) >= new Date(c.lastCallDate)) {
      c.lastCallDate = s.endedAt;
      c.latestLeadScore = s.leadScore;
    }
    if (s.finalCloseProbability > c.bestCloseProbability) {
      c.bestCloseProbability = s.finalCloseProbability;
    }
  }
  for (const c of map.values()) {
    c.sessions.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.lastCallDate).getTime() - new Date(a.lastCallDate).getTime()
  );
}

interface DashboardScreenProps {
  pastSessions: CallSession[];
  onStartCall: () => void;
  onUploadCall: () => void;
  onViewSession: (session: CallSession) => void;
  onDeleteSession: (endedAt: string) => void;
  userName: string;
}

export function DashboardScreen({
  pastSessions, onStartCall, onUploadCall, onViewSession, onDeleteSession, userName,
}: DashboardScreenProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'contacts'>('dashboard');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<DerivedContact | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const t = useTranslations();
  const totalCalls = pastSessions.length;
  const avgProb = totalCalls
    ? Math.round(pastSessions.reduce((sum, s) => sum + s.finalCloseProbability, 0) / totalCalls)
    : 0;
  const totalObjections = pastSessions.reduce((sum, s) => sum + s.objectionsCount, 0);
  const streak = getStreak();

  const contacts = useMemo(() => deriveContacts(pastSessions), [pastSessions]);
  const filteredContacts = contactSearch.trim()
    ? contacts.filter(c =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.company.toLowerCase().includes(contactSearch.toLowerCase())
      )
    : contacts;

  async function handleCopyEmail(email: string) {
    await navigator.clipboard.writeText(email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  }

  function scoreLevel(score: number) {
    return score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  }

  return (
    <div className="dashboard">
      {/* ── Internal tab bar ── */}
      <nav className="dashboard__tabnav">
        <button
          className={`dashboard__tab ${activeView === 'dashboard' ? 'dashboard__tab--active' : ''}`}
          onClick={() => { setActiveView('dashboard'); setSelectedContact(null); }}
        >
          <span className="dashboard__tab-icon">⊞</span>{t.dashboard.overview}
        </button>
        <button
          className={`dashboard__tab ${activeView === 'contacts' ? 'dashboard__tab--active' : ''}`}
          onClick={() => { setActiveView('contacts'); setSelectedContact(null); }}
        >
          <span className="dashboard__tab-icon">◉</span>{t.dashboard.contacts}
        </button>
      </nav>

      {/* ── Dashboard view ── */}
      {activeView === 'dashboard' && (
        <main className="dashboard__main">

          {/* Greeting */}
          <div className="dashboard__greeting db-anim" style={{ '--i': 0 } as CSSProperties}>
            <div>
              <h1 className="dashboard__greeting-text">{t.dashboard.greeting(userName)}</h1>
              <p className="dashboard__subtitle">
                {streak > 0 ? t.dashboard.streakMessage(streak) : t.dashboard.tagline}
              </p>
            </div>
            <Button variant="ghost" size="md" onClick={onUploadCall}>⬆ {t.dashboard.uploadCall.toUpperCase()}</Button>
          </div>

          {/* Stats row */}
          <div className="dashboard__stats db-anim" style={{ '--i': 1 } as CSSProperties}>
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val">{totalCalls}</div>
              <div className="dashboard__stat-label">{t.dashboard.totalCalls.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${avgProb >= 61 ? 'dashboard__stat-val--high' : avgProb >= 31 ? 'dashboard__stat-val--medium' : totalCalls ? 'dashboard__stat-val--low' : ''}`}>
                {totalCalls ? `${avgProb}%` : '-'}
              </div>
              <div className="dashboard__stat-label">{t.dashboard.avgCloseProb.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${totalObjections > 0 ? 'dashboard__stat-val--low' : ''}`}>
                {totalCalls ? totalObjections : '-'}
              </div>
              <div className="dashboard__stat-label">{t.dashboard.totalObjections.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val dashboard__stat-val--high">
                {totalCalls ? formatDuration(Math.round(pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / totalCalls)) : '-'}
              </div>
              <div className="dashboard__stat-label">{t.dashboard.avgDuration.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${streak > 0 ? 'dashboard__stat-val--high' : ''}`}>
                {streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '-'}
              </div>
              <div className="dashboard__stat-label">{t.dashboard.practiceStreak.toUpperCase()}</div>
            </div>
          </div>

          {/* Recent calls */}
          <div className="dashboard__section db-anim" style={{ '--i': 2 } as CSSProperties}>
            <div className="dashboard__section-header">
              <span className="dashboard__section-title">{t.dashboard.recentCalls.toUpperCase()}</span>
              <span className="dashboard__section-count">{totalCalls} {t.dashboard.total}</span>
            </div>

            {totalCalls === 0 ? (
              <div className="dashboard__empty">
                <div className="dashboard__empty-icon">◎</div>
                <div className="dashboard__empty-title">{t.dashboard.noCalls}</div>
                <div className="dashboard__empty-desc">{t.dashboard.noCallsSub}</div>
                <Button variant="primary" size="md" onClick={onStartCall}>
                  ▶ {t.dashboard.startCall.toUpperCase()}
                </Button>
              </div>
            ) : (
              <div className="dashboard__call-list">
                {[...pastSessions].reverse().map((session, i) => {
                  const probLevel = session.finalCloseProbability >= 61 ? 'high' : session.finalCloseProbability >= 31 ? 'medium' : 'low';
                  return (
                    <div key={i} className="dashboard__call-row" onClick={() => onViewSession(session)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onViewSession(session)}>
                      <div className="dashboard__call-prospect">
                        <div className="dashboard__call-name">
                          {session.config.prospectName || 'Unknown prospect'}
                        </div>
                        <div className="dashboard__call-company">
                          {session.config.company || '-'} · {session.config.callGoal}
                        </div>
                      </div>

                      <div className="dashboard__call-meta">
                        <span className="dashboard__call-date">{formatDateShort(session.endedAt)}</span>
                      </div>

                      <div className="dashboard__call-stats">
                        <span className={`dashboard__call-prob dashboard__call-prob--${probLevel}`}>
                          {session.finalCloseProbability}%
                        </span>
                        <span className="dashboard__call-duration">{formatDuration(session.durationSeconds)}</span>
                        {session.objectionsCount > 0 && (
                          <span className="dashboard__call-obj">{session.objectionsCount} obj</span>
                        )}
                        <span className={`dashboard__call-stage dashboard__call-stage--${session.callStage}`}>
                          {session.callStage.toUpperCase()}
                        </span>
                        <span className="dashboard__call-view">{t.dashboard.viewSession.toUpperCase()} →</span>
                        <button
                          className="dashboard__call-delete"
                          title={t.dashboard.deleteSession}
                          onClick={e => { e.stopPropagation(); onDeleteSession(session.endedAt); }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Contacts view ── */}
      {activeView === 'contacts' && !selectedContact && (
        <main className="dashboard__main">
          <div className="dashboard__topbar">
            <div>
              <h1 className="dashboard__title">{t.dashboard.contacts}</h1>
              <p className="dashboard__subtitle">{t.dashboard.contactsSub}</p>
            </div>
          </div>

          <div className="dashboard__crm-search-wrap">
            <input
              className="dashboard__crm-search"
              type="text"
              placeholder={t.dashboard.searchPlaceholder}
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
            />
          </div>

          {contacts.length === 0 ? (
            <div className="dashboard__empty">
              <div className="dashboard__empty-icon">◉</div>
              <div className="dashboard__empty-title">{t.dashboard.noContacts}</div>
              <div className="dashboard__empty-desc">{t.dashboard.noContactsSub}</div>
              <Button variant="primary" size="md" onClick={onStartCall}>
                ▶ {t.dashboard.startCall.toUpperCase()}
              </Button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="dashboard__empty">
              <div className="dashboard__empty-title">{t.dashboard.noResults}</div>
              <div className="dashboard__empty-desc">No contacts match "{contactSearch}"</div>
            </div>
          ) : (
            <div className="dashboard__crm-list">
              {filteredContacts.map((contact, i) => {
                const level = scoreLevel(contact.latestLeadScore);
                return (
                  <div key={i} className="dashboard__crm-card" onClick={() => setSelectedContact(contact)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelectedContact(contact)}>
                    <div className={`dashboard__crm-avatar dashboard__crm-avatar--${level}`}>
                      {getInitials(contact.name)}
                    </div>
                    <div className="dashboard__crm-info">
                      <div className="dashboard__crm-name">{contact.name}</div>
                      <div className="dashboard__crm-company">{contact.company || '-'}</div>
                    </div>
                    <div className="dashboard__crm-meta">
                      <span className={`dashboard__crm-score dashboard__crm-score--${level}`}>
                        {contact.latestLeadScore}
                      </span>
                      <span className="dashboard__crm-calls">{t.dashboard.callCount(contact.totalCalls)}</span>
                      <span className="dashboard__crm-date">{formatDateShort(contact.lastCallDate)}</span>
                      <span className="dashboard__call-view">{t.dashboard.viewSession.toUpperCase()} →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ── Contact detail view ── */}
      {activeView === 'contacts' && selectedContact && (
        <main className="dashboard__main">
          <div className="dashboard__topbar">
            <button className="dashboard__crm-back" onClick={() => setSelectedContact(null)}>
              ← {t.dashboard.contacts}
            </button>
          </div>

          <div className="dashboard__crm-detail-header">
            <div className={`dashboard__crm-avatar dashboard__crm-avatar--lg dashboard__crm-avatar--${scoreLevel(selectedContact.latestLeadScore)}`}>
              {getInitials(selectedContact.name)}
            </div>
            <div>
              <h2 className="dashboard__crm-detail-name">{selectedContact.name}</h2>
              {selectedContact.company && (
                <div className="dashboard__crm-detail-company">{selectedContact.company}</div>
              )}
            </div>
          </div>

          <div className="dashboard__stats">
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val">{selectedContact.totalCalls}</div>
              <div className="dashboard__stat-label">{t.dashboard.totalCalls.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val dashboard__stat-val--${scoreLevel(selectedContact.latestLeadScore)}`}>
                {selectedContact.latestLeadScore}
              </div>
              <div className="dashboard__stat-label">{t.dashboard.latestScore.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${selectedContact.bestCloseProbability >= 61 ? 'dashboard__stat-val--high' : selectedContact.bestCloseProbability >= 31 ? 'dashboard__stat-val--medium' : 'dashboard__stat-val--low'}`}>
                {selectedContact.bestCloseProbability}%
              </div>
              <div className="dashboard__stat-label">{t.dashboard.bestCloseProb.toUpperCase()}</div>
            </div>
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val">
                {selectedContact.sessions.reduce((sum, s) => sum + s.objectionsCount, 0)}
              </div>
              <div className="dashboard__stat-label">{t.dashboard.totalObjections.toUpperCase()}</div>
            </div>
          </div>

          {/* Latest AI Summary */}
          {selectedContact.sessions[0]?.aiSummary && (
            <div className="dashboard__section">
              <div className="dashboard__section-header">
                <span className="dashboard__section-title">{t.dashboard.latestSummary.toUpperCase()}</span>
              </div>
              <div className="dashboard__crm-text-card">
                <pre className="dashboard__crm-pre">{selectedContact.sessions[0].aiSummary}</pre>
              </div>
            </div>
          )}

          {/* Latest call notes */}
          {selectedContact.sessions[0]?.notes?.length > 0 && (
            <div className="dashboard__section">
              <div className="dashboard__section-header">
                <span className="dashboard__section-title">{t.dashboard.latestNotes.toUpperCase()}</span>
              </div>
              <div className="dashboard__crm-text-card">
                {selectedContact.sessions[0].notes.map((n, i) => (
                  <div key={i} className="dashboard__crm-note">{n}</div>
                ))}
              </div>
            </div>
          )}

          {/* Latest follow-up email */}
          {selectedContact.sessions[0]?.followUpEmail && (
            <div className="dashboard__section">
              <div className="dashboard__section-header">
                <span className="dashboard__section-title">{t.dashboard.latestEmail.toUpperCase()}</span>
                <button
                  className="dashboard__crm-copy-btn"
                  onClick={() => handleCopyEmail(selectedContact.sessions[0].followUpEmail)}
                >
                  {emailCopied ? `✓ ${t.dashboard.copied.toUpperCase()}` : `⎘ ${t.dashboard.copy.toUpperCase()}`}
                </button>
              </div>
              <div className="dashboard__crm-text-card">
                <pre className="dashboard__crm-pre">{selectedContact.sessions[0].followUpEmail}</pre>
              </div>
            </div>
          )}

          {/* Call history */}
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <span className="dashboard__section-title">{t.dashboard.callHistory.toUpperCase()}</span>
              <span className="dashboard__section-count">{t.dashboard.callCount(selectedContact.totalCalls)}</span>
            </div>
            <div className="dashboard__call-list">
              {selectedContact.sessions.map((session, i) => {
                const probLevel = session.finalCloseProbability >= 61 ? 'high' : session.finalCloseProbability >= 31 ? 'medium' : 'low';
                return (
                  <div key={i} className="dashboard__call-row" onClick={() => onViewSession(session)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onViewSession(session)}>
                    <div className="dashboard__call-prospect">
                      <div className="dashboard__call-name">{formatDateFull(session.endedAt)}</div>
                      <div className="dashboard__call-company">{session.config.callGoal}</div>
                    </div>
                    <div className="dashboard__call-stats">
                      <span className={`dashboard__call-prob dashboard__call-prob--${probLevel}`}>
                        {session.finalCloseProbability}%
                      </span>
                      <span className="dashboard__call-duration">{formatDuration(session.durationSeconds)}</span>
                      <span className={`dashboard__crm-score dashboard__crm-score--${scoreLevel(session.leadScore)}`} style={{ fontSize: '11px', minWidth: 'auto' }}>
                        score {session.leadScore}
                      </span>
                      <span className={`dashboard__call-stage dashboard__call-stage--${session.callStage}`}>
                        {session.callStage.toUpperCase()}
                      </span>
                      <span className="dashboard__call-view">{t.dashboard.viewSession.toUpperCase()} →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
