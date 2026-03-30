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
type Tier = 'high' | 'medium' | 'low';

interface TrainingRecord {
  lesson_id: string;
  score: number;
  completed_at: string;
}

// ── Mock datasets ─────────────────────────────────────────────────────────────

const MOCK_CALLS = [
  { date: '2026-03-01T09:22:00Z', prob: 35, score: 58, dur: 4 * 60 + 22, stage: 'discovery', objections: 2 },
  { date: '2026-03-03T14:10:00Z', prob: 52, score: 64, dur: 7 * 60 + 15, stage: 'pitch',     objections: 1 },
  { date: '2026-03-05T11:44:00Z', prob: 41, score: 55, dur: 5 * 60 + 44, stage: 'discovery', objections: 3 },
  { date: '2026-03-07T15:33:00Z', prob: 67, score: 72, dur: 9 * 60 + 33, stage: 'close',     objections: 1 },
  { date: '2026-03-10T10:12:00Z', prob: 29, score: 48, dur: 3 * 60 + 12, stage: 'opener',    objections: 4 },
  { date: '2026-03-12T13:05:00Z', prob: 58, score: 69, dur: 8 * 60 + 5,  stage: 'pitch',     objections: 2 },
  { date: '2026-03-14T16:22:00Z', prob: 74, score: 78, dur: 11 * 60 + 22, stage: 'close',    objections: 1 },
  { date: '2026-03-17T09:48:00Z', prob: 63, score: 71, dur: 9 * 60 + 48, stage: 'pitch',     objections: 2 },
  { date: '2026-03-19T14:17:00Z', prob: 81, score: 85, dur: 13 * 60 + 17, stage: 'close',    objections: 0 },
  { date: '2026-03-22T11:56:00Z', prob: 55, score: 67, dur: 7 * 60 + 56, stage: 'discovery', objections: 2 },
  { date: '2026-03-26T15:08:00Z', prob: 78, score: 82, dur: 12 * 60 + 8,  stage: 'close',    objections: 1 },
  { date: '2026-03-29T10:33:00Z', prob: 86, score: 89, dur: 14 * 60 + 33, stage: 'close',    objections: 0 },
];

const MOCK_TRAINING: TrainingRecord[] = [
  { lesson_id: 'l1-opener',         score: 5.5, completed_at: '2026-03-01T08:00:00Z' },
  { lesson_id: 'l2-not-interested', score: 4.8, completed_at: '2026-03-01T08:30:00Z' },
  { lesson_id: 'l1-opener',         score: 7.2, completed_at: '2026-03-03T09:00:00Z' },
  { lesson_id: 'l3-skeptic',        score: 6.1, completed_at: '2026-03-05T07:45:00Z' },
  { lesson_id: 'l2-not-interested', score: 6.9, completed_at: '2026-03-05T08:15:00Z' },
  { lesson_id: 'l4-price',          score: 5.3, completed_at: '2026-03-07T08:00:00Z' },
  { lesson_id: 'l1-opener',         score: 8.4, completed_at: '2026-03-10T07:30:00Z' },
  { lesson_id: 'l3-skeptic',        score: 7.8, completed_at: '2026-03-10T08:00:00Z' },
  { lesson_id: 'l5-think-over',     score: 6.7, completed_at: '2026-03-12T09:00:00Z' },
  { lesson_id: 'l4-price',          score: 7.5, completed_at: '2026-03-14T08:30:00Z' },
  { lesson_id: 'l6-status-quo',     score: 5.9, completed_at: '2026-03-17T07:45:00Z' },
  { lesson_id: 'l5-think-over',     score: 8.1, completed_at: '2026-03-19T08:00:00Z' },
  { lesson_id: 'l7-discovery',      score: 7.3, completed_at: '2026-03-22T09:15:00Z' },
  { lesson_id: 'l6-status-quo',     score: 7.6, completed_at: '2026-03-26T08:00:00Z' },
  { lesson_id: 'l8-trial-close',    score: 8.7, completed_at: '2026-03-29T09:00:00Z' },
];

const MOCK_TEAM = [
  { name: 'Alex Chen',  calls: 47, avgProb: 72, trainScore: 8.4, streak: 12, isYou: false },
  { name: 'Sarah Kim',  calls: 38, avgProb: 68, trainScore: 7.9, streak: 8,  isYou: false },
  { name: 'You',        calls: 12, avgProb: 66, trainScore: 7.8, streak: 5,  isYou: true  },
  { name: 'Marcus J.',  calls: 29, avgProb: 61, trainScore: 7.1, streak: 3,  isYou: false },
  { name: 'Priya P.',   calls: 22, avgProb: 54, trainScore: 6.8, streak: 2,  isYou: false },
];

const LESSON_NAMES: Record<string, string> = {
  'l1-opener':         'Perfect Opener',
  'l2-not-interested': 'Not Interested',
  'l3-skeptic':        'Skeptical Prospect',
  'l4-price':          'Price Objection',
  'l5-think-over':     'Think It Over',
  'l6-status-quo':     'Status Quo',
  'l7-discovery':      'Discovery',
  'l8-trial-close':    'Trial Close',
  'l9-hard-close':     'Hard Close',
};

function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function scoreTier(val: number, hi = 61, mid = 31): Tier { return val >= hi ? 'high' : val >= mid ? 'medium' : 'low'; }

// ── Component ─────────────────────────────────────────────────────────────────

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
    setTeamMsg(`Joined team ${code}.`);
  }

  // ── Data sources (real or mock) ───────────────────────────────────────────
  const useMockPerf     = pastSessions.length === 0;
  const useMockTraining = trainingRecords.length === 0;

  // ── Performance metrics ───────────────────────────────────────────────────
  const totalCalls = useMockPerf ? MOCK_CALLS.length : pastSessions.length;
  const avgProb    = useMockPerf
    ? Math.round(avg(MOCK_CALLS.map(c => c.prob)))
    : totalCalls ? Math.round(avg(pastSessions.map(s => s.finalCloseProbability))) : 0;
  const avgScore   = useMockPerf
    ? Math.round(avg(MOCK_CALLS.map(c => c.score)))
    : totalCalls ? Math.round(avg(pastSessions.map(s => s.leadScore))) : 0;
  const avgDurSec  = useMockPerf
    ? Math.round(avg(MOCK_CALLS.map(c => c.dur)))
    : totalCalls ? Math.round(avg(pastSessions.map(s => s.durationSeconds))) : 0;

  // ── Bar data: close probability per call ──────────────────────────────────
  const probBars = useMockPerf
    ? MOCK_CALLS.map(c => ({ label: fmtDate(c.date), pct: c.prob, tier: scoreTier(c.prob) }))
    : [...pastSessions]
        .sort((a, b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime())
        .slice(-12)
        .map(s => ({ label: fmtDate(s.endedAt), pct: s.finalCloseProbability, tier: scoreTier(s.finalCloseProbability) }));

  // ── Stage breakdown ───────────────────────────────────────────────────────
  const stageCount: Record<string, number> = { opener: 0, discovery: 0, pitch: 0, close: 0 };
  if (useMockPerf) {
    for (const c of MOCK_CALLS) stageCount[c.stage] = (stageCount[c.stage] ?? 0) + 1;
  } else {
    for (const s of pastSessions) stageCount[s.callStage] = (stageCount[s.callStage] ?? 0) + 1;
  }
  const maxStage = Math.max(...Object.values(stageCount), 1);

  // ── Activity grid (last 28 days) ──────────────────────────────────────────
  const realActivitySet  = new Set(getActivityDates());
  const mockCallDates    = new Set(MOCK_CALLS.map(c => c.date.split('T')[0]));
  const mockTrainDates   = new Set(MOCK_TRAINING.map(r => r.completed_at.split('T')[0]));
  const today = new Date();
  const activityDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const ds = d.toISOString().split('T')[0];
    return {
      date: ds,
      training: useMockPerf ? mockTrainDates.has(ds) : realActivitySet.has(ds),
      call:     useMockPerf ? mockCallDates.has(ds)  : pastSessions.some(s => s.endedAt.startsWith(ds)),
    };
  });

  // ── Training metrics ──────────────────────────────────────────────────────
  const tRecs     = useMockTraining ? MOCK_TRAINING : trainingRecords;
  const avgTrain  = tRecs.length ? Math.round(avg(tRecs.map(r => r.score)) * 10) / 10 : 0;
  const bestTrain = tRecs.length ? Math.max(...tRecs.map(r => r.score)) : 0;
  const uniqLess  = new Set(tRecs.map(r => r.lesson_id)).size;

  const lessonBest = new Map<string, number>();
  for (const r of tRecs) {
    if ((lessonBest.get(r.lesson_id) ?? 0) < r.score) lessonBest.set(r.lesson_id, r.score);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmtDur(s: number) { return `${Math.floor(s / 60)}m ${s % 60}s`; }
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  function an(delay: number) { return { '--an-delay': `${delay}ms` } as React.CSSProperties; }

  const isMock = useMockPerf || useMockTraining;

  return (
    <div className="analytics">
      <div className="analytics__topbar">
        <div>
          <h1 className="analytics__title">Analytics</h1>
          <p className="analytics__subtitle">Performance trends across calls and training</p>
        </div>
        {isMock && <span className="analytics__demo-badge">DEMO DATA</span>}
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

      {/* ── Performance ────────────────────────────────────────────────────── */}
      {tab === 'performance' && (
        <div className="analytics__content">

          <div className="analytics__stats">
            {[
              { val: String(totalCalls),  label: 'TOTAL CALLS',    cls: '' },
              { val: `${avgProb}%`,        label: 'AVG CLOSE PROB', cls: `analytics__stat-val--${scoreTier(avgProb)}` },
              { val: String(avgScore),     label: 'AVG LEAD SCORE', cls: `analytics__stat-val--${scoreTier(avgScore, 70, 40)}` },
              { val: fmtDur(avgDurSec),    label: 'AVG DURATION',   cls: '' },
            ].map((item, i) => (
              <div key={i} className="analytics__stat-card" style={an(i * 70)}>
                <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                <div className="analytics__stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="analytics__charts">

            <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
              <div className="analytics__chart-title">CLOSE PROBABILITY — LAST {probBars.length} CALLS</div>
              <div className="analytics__bars">
                {probBars.map((b, i) => (
                  <div key={i} className="analytics__bar-row">
                    <div className="analytics__bar-label">{b.label}</div>
                    <div className="analytics__bar-track">
                      <div
                        className={`analytics__bar analytics__bar--${b.tier}`}
                        style={{ width: `${b.pct}%`, ...an(320 + i * 45) }}
                      />
                    </div>
                    <div className="analytics__bar-val">{b.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics__chart-card" style={an(400)}>
              <div className="analytics__chart-title">CALLS BY FINAL STAGE</div>
              <div className="analytics__bars">
                {(Object.entries(stageCount) as [string, number][]).map(([stage, count], i) => (
                  <div key={stage} className="analytics__bar-row">
                    <div className="analytics__bar-label">{stage.toUpperCase()}</div>
                    <div className="analytics__bar-track">
                      <div
                        className={`analytics__bar analytics__bar--stage-${stage}`}
                        style={{ width: `${(count / maxStage) * 100}%`, ...an(440 + i * 60) }}
                      />
                    </div>
                    <div className="analytics__bar-val">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics__chart-card" style={an(450)}>
              <div className="analytics__chart-title">ACTIVITY — LAST 28 DAYS</div>
              <div className="analytics__activity-grid">
                {activityDays.map((d, i) => (
                  <div
                    key={i}
                    className={`analytics__activity-cell ${
                      d.training && d.call ? 'analytics__activity-cell--both'     :
                      d.training           ? 'analytics__activity-cell--training' :
                      d.call               ? 'analytics__activity-cell--call'     : ''
                    }`}
                    style={an(490 + i * 16)}
                    title={d.date}
                  />
                ))}
              </div>
              <div className="analytics__activity-legend">
                <span className="analytics__activity-dot analytics__activity-dot--both" />Both
                <span className="analytics__activity-dot analytics__activity-dot--call" />Call
                <span className="analytics__activity-dot analytics__activity-dot--training" />Training
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Training ───────────────────────────────────────────────────────── */}
      {tab === 'training' && (
        <div className="analytics__content">

          <div className="analytics__stats">
            {[
              { val: String(tRecs.length), label: 'TOTAL SESSIONS', cls: '' },
              { val: `${avgTrain}/10`,      label: 'AVG SCORE',      cls: `analytics__stat-val--${scoreTier(avgTrain * 10, 75, 50)}` },
              { val: bestTrain.toFixed(1),  label: 'BEST SCORE',     cls: 'analytics__stat-val--high' },
              { val: String(uniqLess),      label: 'LESSONS TRIED',  cls: '' },
            ].map((item, i) => (
              <div key={i} className="analytics__stat-card" style={an(i * 70)}>
                <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                <div className="analytics__stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="analytics__charts">

            <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
              <div className="analytics__chart-title">SCORE — LAST {Math.min(tRecs.length, 10)} SESSIONS</div>
              <div className="analytics__bars">
                {tRecs.slice(0, 10).map((r, i) => (
                  <div key={i} className="analytics__bar-row">
                    <div className="analytics__bar-label">{fmtDate(r.completed_at)}</div>
                    <div className="analytics__bar-track">
                      <div
                        className={`analytics__bar analytics__bar--${scoreTier(r.score * 10, 75, 50)}`}
                        style={{ width: `${(r.score / 10) * 100}%`, ...an(320 + i * 50) }}
                      />
                    </div>
                    <div className="analytics__bar-val">{r.score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            {lessonBest.size > 0 && (
              <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
                <div className="analytics__chart-title">BEST SCORE PER LESSON</div>
                <div className="analytics__bars">
                  {[...lessonBest.entries()].map(([id, score], i) => (
                    <div key={id} className="analytics__bar-row analytics__bar-row--lesson">
                      <div className="analytics__bar-label analytics__bar-label--lesson">
                        {LESSON_NAMES[id] ?? id}
                      </div>
                      <div className="analytics__bar-track">
                        <div
                          className={`analytics__bar analytics__bar--${scoreTier(score * 10, 75, 50)}`}
                          style={{ width: `${(score / 10) * 100}%`, ...an(460 + i * 45) }}
                        />
                      </div>
                      <div className="analytics__bar-val">{score.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Team ───────────────────────────────────────────────────────────── */}
      {tab === 'team' && (
        <div className="analytics__content">

          <div className="analytics__chart-card" style={an(0)}>
            <div className="analytics__chart-title-row">
              <span className="analytics__chart-title">TEAM LEADERBOARD — THIS MONTH</span>
              <span className="analytics__demo-inline">DEMO</span>
            </div>
            <div className="analytics__leaderboard">
              <div className="analytics__lb-header">
                <span className="analytics__lb-cell analytics__lb-cell--rank">#</span>
                <span className="analytics__lb-cell analytics__lb-cell--name">REP</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">CALLS</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">CLOSE %</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">TRAINING</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">STREAK</span>
              </div>
              {MOCK_TEAM.map((rep, i) => (
                <div
                  key={i}
                  className={`analytics__lb-row ${rep.isYou ? 'analytics__lb-row--you' : ''}`}
                  style={an(60 + i * 75)}
                >
                  <span className="analytics__lb-cell analytics__lb-cell--rank analytics__lb-rank">{i + 1}</span>
                  <span className="analytics__lb-cell analytics__lb-cell--name analytics__lb-name">
                    {rep.name}
                    {rep.isYou && <span className="analytics__lb-you-badge">YOU</span>}
                  </span>
                  <span className="analytics__lb-cell analytics__lb-cell--num">{rep.calls}</span>
                  <span className={`analytics__lb-cell analytics__lb-cell--num analytics__lb-val--${scoreTier(rep.avgProb)}`}>
                    {rep.avgProb}%
                  </span>
                  <span className={`analytics__lb-cell analytics__lb-cell--num analytics__lb-val--${scoreTier(rep.trainScore * 10, 75, 50)}`}>
                    {rep.trainScore}/10
                  </span>
                  <span className="analytics__lb-cell analytics__lb-cell--num analytics__lb-streak">
                    {rep.streak}d 🔥
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics__team-grid">
            <div className="analytics__team-card" style={an(500)}>
              <div className="analytics__chart-title">MANAGER — CREATE TEAM</div>
              <p className="analytics__team-desc">
                Generate a team code and share it with your reps to connect everyone's stats.
              </p>
              {teamCode ? (
                <div className="analytics__team-code-block">
                  <div className="analytics__team-code">{teamCode}</div>
                  <button className="analytics__team-btn" onClick={copyTeamCode}>⎘ Copy</button>
                </div>
              ) : (
                <button className="analytics__team-btn analytics__team-btn--primary" onClick={generateTeamCode}>
                  Generate Team Code
                </button>
              )}
              {teamMsg && <div className="analytics__team-msg">{teamMsg}</div>}
            </div>

            <div className="analytics__team-card" style={an(580)}>
              <div className="analytics__chart-title">REP — JOIN A TEAM</div>
              <p className="analytics__team-desc">
                Enter the code your manager shared to join their team and appear in the leaderboard.
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
