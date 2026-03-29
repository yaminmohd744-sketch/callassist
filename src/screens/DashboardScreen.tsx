import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession } from '../types';
import { getStreak } from '../lib/streak';
import './DashboardScreen.css';

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
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

function deriveContacts(sessions: CallSession[]): DerivedContact[] {
  const map = new Map<string, DerivedContact>();
  for (const s of sessions) {
    const key = `${(s.config.prospectName || '').toLowerCase()}||${(s.config.company || '').toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        name: s.config.prospectName || 'Unknown',
        company: s.config.company || '',
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
  onGoTraining: () => void;
  onGoAnalytics: () => void;
}

export function DashboardScreen({
  pastSessions, onStartCall, onUploadCall, onViewSession, onDeleteSession, onGoTraining, onGoAnalytics,
}: DashboardScreenProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'contacts'>('dashboard');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<DerivedContact | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const totalCalls = pastSessions.length;
  const avgProb = totalCalls
    ? Math.round(pastSessions.reduce((sum, s) => sum + s.finalCloseProbability, 0) / totalCalls)
    : 0;
  const totalObjections = pastSessions.reduce((sum, s) => sum + s.objectionsCount, 0);
  const streak = getStreak();

  const contacts = deriveContacts(pastSessions);
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
          <span className="dashboard__tab-icon">⊞</span>Overview
        </button>
        <button
          className={`dashboard__tab ${activeView === 'contacts' ? 'dashboard__tab--active' : ''}`}
          onClick={() => { setActiveView('contacts'); setSelectedContact(null); }}
        >
          <span className="dashboard__tab-icon">◉</span>Contacts
        </button>
      </nav>

      {/* ── Dashboard view ── */}
      {activeView === 'dashboard' && (
        <main className="dashboard__main">

          {/* Greeting */}
          <div className="dashboard__greeting db-anim" style={{ '--i': 0 } as CSSProperties}>
            <div>
              <h1 className="dashboard__greeting-text">{getGreeting()} — Ready to close?</h1>
              <p className="dashboard__subtitle">
                {streak > 0 ? `${streak}-day practice streak — keep the momentum!` : 'Your personal AI sales coach'}
              </p>
            </div>
            <Button variant="ghost" size="md" onClick={onUploadCall}>⬆ UPLOAD CALL</Button>
          </div>

          {/* Quick Actions */}
          <div className="dashboard__quickactions db-anim" style={{ '--i': 1 } as CSSProperties}>
            <div
              className="dashboard__qa-card dashboard__qa-card--call"
              onClick={onStartCall}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onStartCall()}
            >
              <div className="dashboard__qa-icon">▶</div>
              <div className="dashboard__qa-body">
                <div className="dashboard__qa-label">START NEW CALL</div>
                <div className="dashboard__qa-desc">Launch a live AI coaching session</div>
              </div>
              <div className="dashboard__qa-arrow">→</div>
            </div>

            <div
              className="dashboard__qa-card dashboard__qa-card--practice"
              onClick={onGoTraining}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onGoTraining()}
            >
              <div className="dashboard__qa-icon">◎</div>
              <div className="dashboard__qa-body">
                <div className="dashboard__qa-label">PRACTICE SCENARIOS</div>
                <div className="dashboard__qa-desc">Train with AI prospect simulations</div>
              </div>
              <div className="dashboard__qa-arrow">→</div>
            </div>

            <div
              className="dashboard__qa-card dashboard__qa-card--academy"
              onClick={onGoTraining}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onGoTraining()}
            >
              <div className="dashboard__qa-icon">◈</div>
              <div className="dashboard__qa-body">
                <div className="dashboard__qa-label">AI ACADEMY</div>
                <div className="dashboard__qa-desc">Structured lessons to master sales</div>
              </div>
              <div className="dashboard__qa-arrow">→</div>
            </div>

            <div
              className="dashboard__qa-card dashboard__qa-card--analytics"
              onClick={onGoAnalytics}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onGoAnalytics()}
            >
              <div className="dashboard__qa-icon">▦</div>
              <div className="dashboard__qa-body">
                <div className="dashboard__qa-label">ANALYTICS</div>
                <div className="dashboard__qa-desc">Review performance &amp; insights</div>
              </div>
              <div className="dashboard__qa-arrow">→</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="dashboard__stats db-anim" style={{ '--i': 2 } as CSSProperties}>
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val">{totalCalls}</div>
              <div className="dashboard__stat-label">TOTAL CALLS</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${avgProb >= 61 ? 'dashboard__stat-val--high' : avgProb >= 31 ? 'dashboard__stat-val--medium' : totalCalls ? 'dashboard__stat-val--low' : ''}`}>
                {totalCalls ? `${avgProb}%` : '-'}
              </div>
              <div className="dashboard__stat-label">AVG CLOSE PROB</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${totalObjections > 0 ? 'dashboard__stat-val--low' : ''}`}>
                {totalCalls ? totalObjections : '-'}
              </div>
              <div className="dashboard__stat-label">TOTAL OBJECTIONS</div>
            </div>
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val dashboard__stat-val--high">
                {totalCalls ? formatDuration(Math.round(pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / totalCalls)) : '-'}
              </div>
              <div className="dashboard__stat-label">AVG DURATION</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${streak > 0 ? 'dashboard__stat-val--high' : ''}`}>
                {streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '-'}
              </div>
              <div className="dashboard__stat-label">PRACTICE STREAK</div>
            </div>
          </div>

          {/* Recent calls */}
          <div className="dashboard__section db-anim" style={{ '--i': 6 } as CSSProperties}>
            <div className="dashboard__section-header">
              <span className="dashboard__section-title">RECENT CALLS</span>
              <span className="dashboard__section-count">{totalCalls} total</span>
            </div>

            {totalCalls === 0 ? (
              <div className="dashboard__empty">
                <div className="dashboard__empty-icon">◎</div>
                <div className="dashboard__empty-title">No calls yet</div>
                <div className="dashboard__empty-desc">
                  Start your first call to see your history and performance here.
                </div>
                <Button variant="primary" size="md" onClick={onStartCall}>
                  ▶ START FIRST CALL
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
                        <span className="dashboard__call-date">{formatDate(session.endedAt)}</span>
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
                        <span className="dashboard__call-view">VIEW →</span>
                        <button
                          className="dashboard__call-delete"
                          title="Delete"
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
              <h1 className="dashboard__title">Contacts</h1>
              <p className="dashboard__subtitle">All prospects from your call history</p>
            </div>
          </div>

          <div className="dashboard__crm-search-wrap">
            <input
              className="dashboard__crm-search"
              type="text"
              placeholder="Search by name or company…"
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
            />
          </div>

          {contacts.length === 0 ? (
            <div className="dashboard__empty">
              <div className="dashboard__empty-icon">◉</div>
              <div className="dashboard__empty-title">No contacts yet</div>
              <div className="dashboard__empty-desc">
                Complete a call to see contacts appear here automatically.
              </div>
              <Button variant="primary" size="md" onClick={onStartCall}>
                ▶ START A CALL
              </Button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="dashboard__empty">
              <div className="dashboard__empty-title">No results</div>
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
                      <span className="dashboard__crm-calls">{contact.totalCalls} {contact.totalCalls === 1 ? 'call' : 'calls'}</span>
                      <span className="dashboard__crm-date">{formatDate(contact.lastCallDate)}</span>
                      <span className="dashboard__call-view">VIEW →</span>
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
              ← Contacts
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
              <div className="dashboard__stat-label">TOTAL CALLS</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val dashboard__stat-val--${scoreLevel(selectedContact.latestLeadScore)}`}>
                {selectedContact.latestLeadScore}
              </div>
              <div className="dashboard__stat-label">LATEST SCORE</div>
            </div>
            <div className="dashboard__stat-card">
              <div className={`dashboard__stat-val ${selectedContact.bestCloseProbability >= 61 ? 'dashboard__stat-val--high' : selectedContact.bestCloseProbability >= 31 ? 'dashboard__stat-val--medium' : 'dashboard__stat-val--low'}`}>
                {selectedContact.bestCloseProbability}%
              </div>
              <div className="dashboard__stat-label">BEST CLOSE PROB</div>
            </div>
            <div className="dashboard__stat-card">
              <div className="dashboard__stat-val">
                {selectedContact.sessions.reduce((sum, s) => sum + s.objectionsCount, 0)}
              </div>
              <div className="dashboard__stat-label">TOTAL OBJECTIONS</div>
            </div>
          </div>

          {/* Latest AI Summary */}
          {selectedContact.sessions[0]?.aiSummary && (
            <div className="dashboard__section">
              <div className="dashboard__section-header">
                <span className="dashboard__section-title">LATEST AI SUMMARY</span>
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
                <span className="dashboard__section-title">LATEST CALL NOTES</span>
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
                <span className="dashboard__section-title">LATEST FOLLOW-UP EMAIL</span>
                <button
                  className="dashboard__crm-copy-btn"
                  onClick={() => handleCopyEmail(selectedContact.sessions[0].followUpEmail)}
                >
                  {emailCopied ? '✓ COPIED' : '⎘ COPY'}
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
              <span className="dashboard__section-title">CALL HISTORY</span>
              <span className="dashboard__section-count">{selectedContact.totalCalls} {selectedContact.totalCalls === 1 ? 'call' : 'calls'}</span>
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
                      <span className="dashboard__call-view">VIEW →</span>
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
