import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession } from '../types';
import { getStreak } from '../lib/streak';
import { formatDuration, formatDateShort } from '../lib/formatters';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';
import './DashboardScreen.css';

const HIGH_PROB_THRESHOLD = 61;
const MED_PROB_THRESHOLD  = 31;

function probLevel(prob: number): 'high' | 'medium' | 'low' {
  return prob >= HIGH_PROB_THRESHOLD ? 'high' : prob >= MED_PROB_THRESHOLD ? 'medium' : 'low';
}

const animStyle = (i: number) => ({ '--i': i } as React.CSSProperties);

interface DashboardScreenProps {
  pastSessions: CallSession[];
  onStartCall: () => void;
  onUploadCall: () => void;
  onViewSession: (session: CallSession) => void;
  onDeleteSession: (id: string) => void;
  userName: string;
}

export function DashboardScreen({
  pastSessions, onStartCall, onUploadCall, onViewSession, onDeleteSession, userName,
}: DashboardScreenProps) {
  const t = useTranslations();
  const { appLanguage } = useAppContext();
  const totalCalls = pastSessions.length;
  const avgProb = totalCalls
    ? Math.round(pastSessions.reduce((sum, s) => sum + s.finalCloseProbability, 0) / totalCalls)
    : 0;
  const totalObjections = pastSessions.reduce((sum, s) => sum + s.objectionsCount, 0);
  const streak = getStreak();
  const sortedSessions = useMemo(() => [...pastSessions].reverse(), [pastSessions]);

  return (
    <div className="dashboard">
      <main className="dashboard__main">

        {/* Greeting */}
        <div className="dashboard__greeting db-anim" style={animStyle(0)}>
          <div>
            <h1 className="dashboard__greeting-text">{t.dashboard.greeting(userName)}</h1>
            <p className="dashboard__subtitle">
              {streak > 0 ? t.dashboard.streakMessage(streak) : t.dashboard.tagline}
            </p>
          </div>
          <Button variant="ghost" size="md" onClick={onUploadCall}>⬆ {t.dashboard.uploadCall.toUpperCase()}</Button>
        </div>

        {/* Stats row */}
        <div className="dashboard__stats db-anim" style={animStyle(1)}>
          <div className="dashboard__stat-card">
            <div className="dashboard__stat-val">{totalCalls}</div>
            <div className="dashboard__stat-label">{t.dashboard.totalCalls.toUpperCase()}</div>
          </div>
          <div className="dashboard__stat-card">
            <div className={`dashboard__stat-val ${totalCalls ? `dashboard__stat-val--${probLevel(avgProb)}` : ''}`}>
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
        <div className="dashboard__section db-anim" style={animStyle(2)}>
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
              {sortedSessions.map((session) => {
                const probLvl = probLevel(session.finalCloseProbability);
                return (
                  <div key={session.id ?? session.endedAt} className="dashboard__call-row" onClick={() => onViewSession(session)} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onViewSession(session)}>
                    <div className="dashboard__call-prospect">
                      <div className="dashboard__call-name">
                        {session.config.prospectName || 'Unknown prospect'}
                      </div>
                      <div className="dashboard__call-company">
                        {session.config.company || '-'} · {session.config.callGoal}
                      </div>
                    </div>

                    <div className="dashboard__call-meta">
                      <span className="dashboard__call-date">{formatDateShort(session.endedAt, appLanguage)}</span>
                    </div>

                    <div className="dashboard__call-stats">
                      <span className={`dashboard__call-prob dashboard__call-prob--${probLvl}`}>
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
                        aria-label={t.dashboard.deleteSession}
                        title={t.dashboard.deleteSession}
                        onClick={e => { e.stopPropagation(); onDeleteSession(session.id ?? session.endedAt); }}
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
    </div>
  );
}
