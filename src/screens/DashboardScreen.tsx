import { Button } from '../components/ui/Button';
import type { CallSession } from '../types';
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

interface DashboardScreenProps {
  pastSessions: CallSession[];
  onStartCall: () => void;
  onViewSession: (session: CallSession) => void;
}

export function DashboardScreen({ pastSessions, onStartCall, onViewSession }: DashboardScreenProps) {
  const totalCalls = pastSessions.length;
  const avgProb = totalCalls
    ? Math.round(pastSessions.reduce((sum, s) => sum + s.finalCloseProbability, 0) / totalCalls)
    : 0;
  const totalObjections = pastSessions.reduce((sum, s) => sum + s.objectionsCount, 0);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__logo">◎ CALL<span>ASSIST</span></div>

        <nav className="dashboard__nav">
          <div className="dashboard__nav-item dashboard__nav-item--active">
            <span className="dashboard__nav-icon">⊞</span>
            Dashboard
          </div>
          <div className="dashboard__nav-item" onClick={onStartCall}>
            <span className="dashboard__nav-icon">◉</span>
            New Call
          </div>
        </nav>

        <div className="dashboard__sidebar-footer">
          <div className="dashboard__version">v1.0 MVP</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard__main">
        <div className="dashboard__topbar">
          <div>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Manage and start your cold calls</p>
          </div>
          <Button variant="primary" size="md" onClick={onStartCall}>
            ▶ START NEW CALL
          </Button>
        </div>

        {/* Stats row */}
        <div className="dashboard__stats">
          <div className="dashboard__stat-card">
            <div className="dashboard__stat-val">{totalCalls}</div>
            <div className="dashboard__stat-label">TOTAL CALLS</div>
          </div>
          <div className="dashboard__stat-card">
            <div className={`dashboard__stat-val ${avgProb >= 61 ? 'dashboard__stat-val--high' : avgProb >= 31 ? 'dashboard__stat-val--medium' : totalCalls ? 'dashboard__stat-val--low' : ''}`}>
              {totalCalls ? `${avgProb}%` : '—'}
            </div>
            <div className="dashboard__stat-label">AVG CLOSE PROB</div>
          </div>
          <div className="dashboard__stat-card">
            <div className={`dashboard__stat-val ${totalObjections > 0 ? 'dashboard__stat-val--low' : ''}`}>
              {totalCalls ? totalObjections : '—'}
            </div>
            <div className="dashboard__stat-label">TOTAL OBJECTIONS</div>
          </div>
          <div className="dashboard__stat-card">
            <div className="dashboard__stat-val dashboard__stat-val--high">
              {totalCalls ? formatDuration(Math.round(pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / totalCalls)) : '—'}
            </div>
            <div className="dashboard__stat-label">AVG DURATION</div>
          </div>
        </div>

        {/* Recent calls */}
        <div className="dashboard__section">
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
                        {session.config.company || '—'} · {session.config.callGoal}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
