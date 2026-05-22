import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession, RepLearningProfile, Trajectory, LearningLogEntry, LogSeverity } from '../types';
import { getStreak } from '../lib/streak';
import { formatDuration, formatDateShort } from '../lib/formatters';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';
import './DashboardScreen.css';

function trajectoryArrow(t: Trajectory): string {
  if (t === 'improving') return '↑';
  if (t === 'declining') return '↓';
  return '→';
}

const HIGH_PROB_THRESHOLD = 61;
const MED_PROB_THRESHOLD  = 31;

function probLevel(prob: number): 'high' | 'medium' | 'low' {
  return prob >= HIGH_PROB_THRESHOLD ? 'high' : prob >= MED_PROB_THRESHOLD ? 'medium' : 'low';
}

const animStyle = (i: number) => ({ '--i': i } as React.CSSProperties);

const SEVERITY_ICON: Record<LogSeverity, string> = {
  finding:     '◎',
  improvement: '↑',
  warning:     '!',
};

function formatLogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

interface DashboardScreenProps {
  pastSessions: CallSession[];
  onStartCall: () => void;
  onUploadCall: () => void;
  onViewSession: (session: CallSession) => void;
  onDeleteSession: (id: string) => void;
  userName: string;
  learningProfile?: RepLearningProfile | null;
  learningLog?: LearningLogEntry[];
}

export function DashboardScreen({
  pastSessions, onStartCall, onUploadCall, onViewSession, onDeleteSession,
  userName, learningProfile, learningLog = [],
}: DashboardScreenProps) {
  const t = useTranslations();
  const { appLanguage } = useAppContext();
  const [activeTab, setActiveTab] = useState<'calls' | 'insights'>('calls');

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

        {/* Coaching Focus Card */}
        {learningProfile && learningProfile.callsAnalyzed >= 3 && (
          <div className="dashboard__coaching-card db-anim" style={animStyle(2)}>
            <div className="dashboard__coaching-header">
              <span className="dashboard__coaching-icon" aria-hidden="true">◎</span>
              <span className="dashboard__coaching-title">COACHING FOCUS</span>
              <span className={`dashboard__coaching-trajectory dashboard__coaching-trajectory--${learningProfile.trajectories.closeProbability}`}>
                {trajectoryArrow(learningProfile.trajectories.closeProbability)} Close rate
              </span>
            </div>
            <p className="dashboard__coaching-text">{learningProfile.practiceRecommendation}</p>
            <div className="dashboard__coaching-meta">Based on your last {learningProfile.callsAnalyzed} calls</div>
          </div>
        )}

        {/* Tab bar */}
        <div className="dashboard__tabs db-anim" style={animStyle(3)}>
          <button
            className={`dashboard__tab${activeTab === 'calls' ? ' dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            {t.dashboard.recentCalls.toUpperCase()}
            <span className="dashboard__tab-count">{totalCalls}</span>
          </button>
          <button
            className={`dashboard__tab${activeTab === 'insights' ? ' dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            AI INSIGHTS
            {learningLog.length > 0 && (
              <span className="dashboard__tab-count dashboard__tab-count--accent">{learningLog.length}</span>
            )}
          </button>
        </div>

        {/* ── Calls tab ── */}
        {activeTab === 'calls' && (
          <div className="dashboard__section db-anim" style={animStyle(4)}>
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
        )}

        {/* ── Insights tab ── */}
        {activeTab === 'insights' && (
          <div className="dashboard__section db-anim" style={animStyle(4)}>
            {learningLog.length === 0 ? (
              <div className="dashboard__empty">
                <div className="dashboard__empty-icon">◎</div>
                <div className="dashboard__empty-title">No insights yet</div>
                <div className="dashboard__empty-desc">
                  After {totalCalls < 3 ? `${3 - totalCalls} more call${3 - totalCalls !== 1 ? 's' : ''}` : 'your next call'}, your AI coach will start logging what it's learning about you and what it's changing.
                </div>
                {totalCalls === 0 && (
                  <Button variant="primary" size="md" onClick={onStartCall}>
                    ▶ {t.dashboard.startCall.toUpperCase()}
                  </Button>
                )}
              </div>
            ) : (
              <div className="dashboard__log-list">
                {learningLog.map(entry => (
                  <div key={entry.id} className={`dashboard__log-entry dashboard__log-entry--${entry.severity}`}>
                    <div className="dashboard__log-icon" aria-hidden="true">
                      {SEVERITY_ICON[entry.severity]}
                    </div>
                    <div className="dashboard__log-content">
                      <div className="dashboard__log-header">
                        <span className="dashboard__log-headline">{entry.headline}</span>
                        <span className="dashboard__log-meta">{formatLogDate(entry.timestamp)} · {entry.callsAnalyzed} calls</span>
                      </div>
                      <p className="dashboard__log-body">{entry.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
