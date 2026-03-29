import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getActivityDates } from '../lib/streak';
import type { CallSession } from '../types';
import type { User } from '@supabase/supabase-js';
import './AnalyticsScreen.css';

interface AnalyticsScreenProps {
  pastSessions: CallSession[];
  user: User | null;
}

type AnalyticsTab = 'performance' | 'training' | 'team';

interface TrainingRecord {
  lesson_id: string;
  score: number;
  completed_at: string;
}

export function AnalyticsScreen({ pastSessions, user }: AnalyticsScreenProps) {
  const [tab, setTab] = useState<AnalyticsTab>('performance');
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [teamCode, setTeamCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinedTeam, setJoinedTeam] = useState('');
  const [teamMsg, setTeamMsg] = useState('');

  useEffect(() => {
    setTeamCode(localStorage.getItem('callassist_team_code') ?? '');
    setJoinedTeam(localStorage.getItem('callassist_joined_team') ?? '');
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from('academy_progress')
        .select('lesson_id, score, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50);
      if (data) setTrainingRecords(data as TrainingRecord[]);
    })();
  }, [user]);

  async function copyTeamCode() {
    await navigator.clipboard.writeText(teamCode);
    setTeamMsg('Code copied!');
    setTimeout(() => setTeamMsg(''), 2000);
  }

  function generateTeamCode() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem('callassist_team_code', code);
    setTeamCode(code);
    setTeamMsg('Team code created. Share it with your reps.');
  }

  function handleJoinTeam() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    localStorage.setItem('callassist_joined_team', code);
    setJoinedTeam(code);
    setJoinCode('');
    setTeamMsg(`Joined team ${code}. Full team stats require the Supabase teams table.`);
  }

  // ── Performance data ───────────────────────────────────────────────────────
  const totalCalls = pastSessions.length;
  const sortedCalls = [...pastSessions].sort(
    (a, b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime()
  );
  const recentCalls = sortedCalls.slice(-10);

  const avgProb = totalCalls
    ? Math.round(pastSessions.reduce((s, c) => s + c.finalCloseProbability, 0) / totalCalls) : 0;
  const avgScore = totalCalls
    ? Math.round(pastSessions.reduce((s, c) => s + c.leadScore, 0) / totalCalls) : 0;
  const avgDurSec = totalCalls
    ? Math.round(pastSessions.reduce((s, c) => s + c.durationSeconds, 0) / totalCalls) : 0;

  const stageCount: Record<string, number> = { opener: 0, discovery: 0, pitch: 0, close: 0 };
  for (const s of pastSessions) stageCount[s.callStage] = (stageCount[s.callStage] ?? 0) + 1;
  const maxStage = Math.max(...Object.values(stageCount), 1);

  // ── Training data ──────────────────────────────────────────────────────────
  const avgTrain = trainingRecords.length
    ? Math.round(trainingRecords.reduce((s, r) => s + r.score, 0) / trainingRecords.length * 10) / 10 : 0;
  const bestTrain = trainingRecords.length ? Math.max(...trainingRecords.map(r => r.score)) : 0;
  const uniqueLessons = new Set(trainingRecords.map(r => r.lesson_id)).size;
  const lessonBest = new Map<string, number>();
  for (const r of trainingRecords) {
    if ((lessonBest.get(r.lesson_id) ?? 0) < r.score) lessonBest.set(r.lesson_id, r.score);
  }

  // ── Activity grid (last 28 days) ───────────────────────────────────────────
  const activitySet = new Set(getActivityDates());
  const today = new Date();
  const activityDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const ds = d.toISOString().split('T')[0];
    return {
      date: ds,
      training: activitySet.has(ds),
      call: pastSessions.some(s => s.endedAt.startsWith(ds)),
    };
  });

  function fmtDur(s: number) { return `${Math.floor(s / 60)}m ${s % 60}s`; }
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="analytics">
      <div className="analytics__topbar">
        <h1 className="analytics__title">Analytics</h1>
        <p className="analytics__subtitle">Performance trends across calls and training</p>
      </div>

      <div className="analytics__tabs">
        {(['performance', 'training', 'team'] as AnalyticsTab[]).map(t => (
          <button
            key={t}
            className={`analytics__tab ${tab === t ? 'analytics__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Performance ─────────────────────────────────────────────────────── */}
      {tab === 'performance' && (
        <div className="analytics__content">
          {totalCalls === 0 ? (
            <div className="analytics__empty">
              <div className="analytics__empty-icon">◎</div>
              <div className="analytics__empty-title">No call data yet</div>
              <div className="analytics__empty-desc">
                Complete your first call to see performance analytics here.
              </div>
            </div>
          ) : (
            <>
              <div className="analytics__stats">
                <div className="analytics__stat-card">
                  <div className="analytics__stat-val">{totalCalls}</div>
                  <div className="analytics__stat-label">TOTAL CALLS</div>
                </div>
                <div className="analytics__stat-card">
                  <div className={`analytics__stat-val analytics__stat-val--${avgProb >= 61 ? 'high' : avgProb >= 31 ? 'medium' : 'low'}`}>
                    {avgProb}%
                  </div>
                  <div className="analytics__stat-label">AVG CLOSE PROB</div>
                </div>
                <div className="analytics__stat-card">
                  <div className="analytics__stat-val">{avgScore}</div>
                  <div className="analytics__stat-label">AVG LEAD SCORE</div>
                </div>
                <div className="analytics__stat-card">
                  <div className="analytics__stat-val">{fmtDur(avgDurSec)}</div>
                  <div className="analytics__stat-label">AVG DURATION</div>
                </div>
              </div>

              <div className="analytics__charts">
                <div className="analytics__chart-card analytics__chart-card--wide">
                  <div className="analytics__chart-title">CLOSE PROBABILITY LAST {recentCalls.length} CALLS</div>
                  <div className="analytics__bars">
                    {recentCalls.map((s, i) => (
                      <div key={i} className="analytics__bar-row">
                        <div className="analytics__bar-label">{fmtDate(s.endedAt)}</div>
                        <div className="analytics__bar-track">
                          <div
                            className={`analytics__bar analytics__bar--${s.finalCloseProbability >= 61 ? 'high' : s.finalCloseProbability >= 31 ? 'medium' : 'low'}`}
                            style={{ width: `${s.finalCloseProbability}%` }}
                          />
                        </div>
                        <div className="analytics__bar-val">{s.finalCloseProbability}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics__chart-card">
                  <div className="analytics__chart-title">CALLS BY FINAL STAGE</div>
                  <div className="analytics__bars">
                    {(Object.entries(stageCount) as [string, number][]).map(([stage, count]) => (
                      <div key={stage} className="analytics__bar-row">
                        <div className="analytics__bar-label">{stage.toUpperCase()}</div>
                        <div className="analytics__bar-track">
                          <div
                            className={`analytics__bar analytics__bar--stage-${stage}`}
                            style={{ width: `${(count / maxStage) * 100}%` }}
                          />
                        </div>
                        <div className="analytics__bar-val">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics__chart-card">
                  <div className="analytics__chart-title">ACTIVITY LAST 28 DAYS</div>
                  <div className="analytics__activity-grid">
                    {activityDays.map((d, i) => (
                      <div
                        key={i}
                        className={`analytics__activity-cell ${
                          d.training && d.call ? 'analytics__activity-cell--both' :
                          d.training ? 'analytics__activity-cell--training' :
                          d.call ? 'analytics__activity-cell--call' : ''
                        }`}
                        title={d.date}
                      />
                    ))}
                  </div>
                  <div className="analytics__activity-legend">
                    <span className="analytics__activity-dot analytics__activity-dot--both" /> Both
                    <span className="analytics__activity-dot analytics__activity-dot--call" /> Call
                    <span className="analytics__activity-dot analytics__activity-dot--training" /> Training
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Training ─────────────────────────────────────────────────────────── */}
      {tab === 'training' && (
        <div className="analytics__content">
          {trainingRecords.length === 0 ? (
            <div className="analytics__empty">
              <div className="analytics__empty-icon">◈</div>
              <div className="analytics__empty-title">No training data yet</div>
              <div className="analytics__empty-desc">
                Complete Academy sessions to track your training progress here.
              </div>
            </div>
          ) : (
            <>
              <div className="analytics__stats">
                <div className="analytics__stat-card">
                  <div className="analytics__stat-val">{trainingRecords.length}</div>
                  <div className="analytics__stat-label">TOTAL SESSIONS</div>
                </div>
                <div className="analytics__stat-card">
                  <div className={`analytics__stat-val analytics__stat-val--${avgTrain >= 7.5 ? 'high' : avgTrain >= 5 ? 'medium' : 'low'}`}>
                    {avgTrain}/10
                  </div>
                  <div className="analytics__stat-label">AVG SCORE</div>
                </div>
                <div className="analytics__stat-card">
                  <div className="analytics__stat-val analytics__stat-val--high">
                    {bestTrain.toFixed(1)}
                  </div>
                  <div className="analytics__stat-label">BEST SCORE</div>
                </div>
                <div className="analytics__stat-card">
                  <div className="analytics__stat-val">{uniqueLessons}</div>
                  <div className="analytics__stat-label">LESSONS TRIED</div>
                </div>
              </div>

              <div className="analytics__charts">
                <div className="analytics__chart-card analytics__chart-card--wide">
                  <div className="analytics__chart-title">SCORE LAST 10 SESSIONS</div>
                  <div className="analytics__bars">
                    {trainingRecords.slice(0, 10).map((r, i) => (
                      <div key={i} className="analytics__bar-row">
                        <div className="analytics__bar-label">{fmtDate(r.completed_at)}</div>
                        <div className="analytics__bar-track">
                          <div
                            className={`analytics__bar analytics__bar--${r.score >= 7.5 ? 'high' : r.score >= 5 ? 'medium' : 'low'}`}
                            style={{ width: `${(r.score / 10) * 100}%` }}
                          />
                        </div>
                        <div className="analytics__bar-val">{r.score.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {lessonBest.size > 0 && (
                  <div className="analytics__chart-card analytics__chart-card--wide">
                    <div className="analytics__chart-title">BEST SCORE PER LESSON</div>
                    <div className="analytics__bars">
                      {[...lessonBest.entries()].map(([id, score]) => (
                        <div key={id} className="analytics__bar-row">
                          <div className="analytics__bar-label analytics__bar-label--mono">{id}</div>
                          <div className="analytics__bar-track">
                            <div
                              className={`analytics__bar analytics__bar--${score >= 7.5 ? 'high' : score >= 5 ? 'medium' : 'low'}`}
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                          <div className="analytics__bar-val">{score.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Team ─────────────────────────────────────────────────────────────── */}
      {tab === 'team' && (
        <div className="analytics__content">
          <div className="analytics__team-grid">
            <div className="analytics__team-card">
              <div className="analytics__chart-title">MANAGER CREATE TEAM</div>
              <p className="analytics__team-desc">
                Generate a team code and share it with your reps so they can join your team.
              </p>
              {teamCode ? (
                <div className="analytics__team-code-block">
                  <div className="analytics__team-code">{teamCode}</div>
                  <button className="analytics__team-btn" onClick={copyTeamCode}>
                    ⎘ Copy
                  </button>
                </div>
              ) : (
                <button className="analytics__team-btn analytics__team-btn--primary" onClick={generateTeamCode}>
                  Generate Team Code
                </button>
              )}
              {teamMsg && <div className="analytics__team-msg">{teamMsg}</div>}
              <div className="analytics__team-note">
                To view team members' call stats, run the following SQL in your Supabase dashboard:
                <pre className="analytics__team-sql">{`create table teams (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_by uuid references auth.users
);
create table team_members (
  team_id uuid references teams,
  user_id uuid references auth.users,
  role text default 'rep',
  primary key (team_id, user_id)
);`}</pre>
              </div>
            </div>

            <div className="analytics__team-card">
              <div className="analytics__chart-title">REP JOIN A TEAM</div>
              <p className="analytics__team-desc">
                Enter the code your manager shared to join their team.
              </p>
              {joinedTeam && (
                <div className="analytics__team-joined">
                  Currently in team: <strong>{joinedTeam}</strong>
                </div>
              )}
              <div className="analytics__team-join-row">
                <input
                  className="analytics__team-input"
                  placeholder="Team code (e.g. ABC123)"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <button
                  className="analytics__team-btn analytics__team-btn--primary"
                  onClick={handleJoinTeam}
                  disabled={!joinCode.trim()}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
