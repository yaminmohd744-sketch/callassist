import { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { supabase } from '../lib/supabase';
import { getActivityDates } from '../lib/streak';
import type { CallSession } from '../types';
import type { User } from '@supabase/supabase-js';
import './AnalyticsScreen.css';

interface AnalyticsScreenProps {
  pastSessions: CallSession[];
  user: User | null;
}

type AnalyticsTab = 'performance' | 'intel' | 'training' | 'team';
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


function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function scoreTier(val: number, hi = 61, mid = 31): Tier { return val >= hi ? 'high' : val >= mid ? 'medium' : 'low'; }

// ── Line chart ─────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<Tier, string> = {
  high: '#39d353',
  medium: '#f0e040',
  low: '#ff4444',
};

const LESSON_ORDER = [
  'l1-opener', 'l2-not-interested', 'l3-skeptic',
  'l4-price',  'l5-think-over',     'l6-status-quo',
  'l7-discovery', 'l8-trial-close', 'l9-hard-close',
];

const LESSON_SHORT: Record<string, string> = {
  'l1-opener':         'Opener',
  'l2-not-interested': 'Not Int.',
  'l3-skeptic':        'Skeptic',
  'l4-price':          'Price',
  'l5-think-over':     'Think It',
  'l6-status-quo':     'Status Q.',
  'l7-discovery':      'Discovery',
  'l8-trial-close':    'Trial Cl.',
  'l9-hard-close':     'Hard Cl.',
};

const LESSON_FULL: Record<string, string> = {
  'l1-opener':         'The Perfect Opener',
  'l2-not-interested': 'Handling Not Interested',
  'l3-skeptic':        'The Skeptical Prospect',
  'l4-price':          'Price Objections',
  'l5-think-over':     'The Think It Over Trap',
  'l6-status-quo':     'Breaking the Status Quo',
  'l7-discovery':      'Discovery That Reveals Pain',
  'l8-trial-close':    'The Trial Close',
  'l9-hard-close':     'Closing the Hard Prospect',
};

interface ChartPoint { label: string; value: number; tier: Tier; }

function fmtVal(v: number, unit: string) {
  return `${v % 1 !== 0 ? v.toFixed(1) : v}${unit}`;
}

function LineChart({ chartId, points, maxVal, unit = '', style }: {
  chartId: string;
  points: ChartPoint[];
  maxVal: number;
  unit?: string;
  style?: React.CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(800);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setW(el.clientWidth || 800);
    const obs = new ResizeObserver(e => setW(e[0].contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const H = 180;
  const P = { t: 24, r: 10, b: 28, l: 10 };
  const pw = W - P.l - P.r;
  const ph = H - P.t - P.b;
  const canDraw = points.length >= 2 && pw > 0;

  const pts = canDraw
    ? points.map((p, i) => ({
        x: P.l + (i / (points.length - 1)) * pw,
        y: P.t + ph - (p.value / maxVal) * ph,
        color: TIER_COLORS[p.tier],
        label: p.label,
        value: p.value,
      }))
    : [];

  const areaD = pts.length >= 2
    ? [`M ${pts[0].x} ${P.t + ph}`, ...pts.map(p => `L ${p.x} ${p.y}`), `L ${pts[pts.length - 1].x} ${P.t + ph}`, 'Z'].join(' ')
    : '';

  return (
    <div ref={wrapRef} className="analytics__linechart-wrap" style={style}>
      {canDraw && (
        <svg width={W} height={H} className="analytics__linechart" overflow="visible">
          <defs>
            <linearGradient id={`${chartId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(129,74,200,0.15)" />
              <stop offset="100%" stopColor="rgba(129,74,200,0)" />
            </linearGradient>
            {pts.slice(0, -1).map((p, i) => (
              <linearGradient key={i} id={`${chartId}-s${i}`}
                gradientUnits="userSpaceOnUse"
                x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y}>
                <stop offset="0%" stopColor={p.color} />
                <stop offset="100%" stopColor={pts[i + 1].color} />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f}
              x1={P.l} y1={P.t + ph * (1 - f)} x2={W - P.r} y2={P.t + ph * (1 - f)}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill={`url(#${chartId}-area)`} />

          {/* Colored line segments */}
          {pts.slice(0, -1).map((p, i) => (
            <line key={i}
              x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y}
              stroke={`url(#${chartId}-s${i})`} strokeWidth={2.5} strokeLinecap="round"
            />
          ))}

          {/* Dots + value labels */}
          {pts.map((p, i) => (
            <g key={i}>
              <title>{p.label}: {fmtVal(p.value, unit)}</title>
              <text
                x={p.x} y={p.y - 9}
                textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
                fill={p.color} fontSize={9} fontWeight="700"
                fontFamily="'Fragment Mono','JetBrains Mono',monospace"
              >
                {fmtVal(p.value, unit)}
              </text>
              <circle cx={p.x} cy={p.y} r={4} fill={p.color} stroke="#0a0a0a" strokeWidth={1.5} />
            </g>
          ))}

          {/* X-axis labels */}
          {pts.map((p, i) => {
            const every = points.length >= 10 ? 3 : points.length >= 6 ? 2 : 1;
            if (i % every !== 0 && i !== pts.length - 1) return null;
            return (
              <text key={i}
                x={p.x} y={H - 4}
                textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
                fill="rgba(255,255,255,0.28)" fontSize={10}
                fontFamily="Figtree, system-ui, sans-serif"
              >
                {p.label}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AnalyticsScreen({ pastSessions, user }: AnalyticsScreenProps) {
  const t = useTranslations();
  const [tab, setTab] = useState<AnalyticsTab>('performance');
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [detailView, setDetailView] = useState<string | null>(null);
  const [teamCode, setTeamCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinedTeam, setJoinedTeam] = useState('');
  const [teamMsg, setTeamMsg] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // ── Detail panel data ──────────────────────────────────────────────────────
  const perfDetail = useMockPerf
    ? MOCK_CALLS.map(c => ({
        date: fmtDate(c.date), dur: fmtDur(c.dur),
        prob: c.prob, probTier: scoreTier(c.prob),
        score: c.score, scoreTier_: scoreTier(c.score, 70, 40),
        stage: c.stage, objections: c.objections,
      }))
    : [...pastSessions]
        .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())
        .map(s => ({
          date: fmtDate(s.endedAt), dur: fmtDur(s.durationSeconds),
          prob: s.finalCloseProbability, probTier: scoreTier(s.finalCloseProbability),
          score: s.leadScore, scoreTier_: scoreTier(s.leadScore, 70, 40),
          stage: s.callStage, objections: null as number | null,
        }));

  const stageDetail = (Object.entries(stageCount) as [string, number][])
    .filter(([, c]) => c > 0)
    .map(([stage, count]) => {
      const probs = useMockPerf
        ? MOCK_CALLS.filter(c => c.stage === stage).map(c => c.prob)
        : pastSessions.filter(s => s.callStage === stage).map(s => s.finalCloseProbability);
      const durs = useMockPerf
        ? MOCK_CALLS.filter(c => c.stage === stage).map(c => c.dur)
        : pastSessions.filter(s => s.callStage === stage).map(s => s.durationSeconds);
      const ap = probs.length ? Math.round(avg(probs)) : 0;
      return { stage, count, avgProb: ap, avgDur: Math.round(avg(durs)), probTier: scoreTier(ap) };
    });

  const trainDetail = tRecs.map(r => ({
    date: fmtDate(r.completed_at),
    lesson: LESSON_FULL[r.lesson_id] ?? r.lesson_id,
    score: r.score,
    tier: scoreTier(r.score * 10, 75, 50),
  }));

  const lessonDetail = LESSON_ORDER.filter(id => lessonBest.has(id)).map(id => {
    const recs = tRecs.filter(r => r.lesson_id === id);
    const scores = recs.map(r => r.score);
    const best = Math.max(...scores);
    const last = scores[0] ?? 0;
    const trend = scores.length >= 2
      ? (scores[0] > scores[scores.length - 1] ? 'up' : scores[0] < scores[scores.length - 1] ? 'down' : 'flat')
      : 'flat';
    return {
      name: LESSON_FULL[id] ?? id,
      attempts: scores.length, best, last,
      bestTier: scoreTier(best * 10, 75, 50),
      lastTier: scoreTier(last * 10, 75, 50),
      trend,
    };
  });

  const isMock = useMockPerf || useMockTraining;

  // ── Insight 1: Top objections ─────────────────────────────────────────────
  interface ObjInsight { label: string; count: number; technique: string; successRate: number; }
  const objInsights: ObjInsight[] = (() => {
    const cats: Record<string, { count: number; techniques: string[]; won: number }> = {};
    const classify = (text: string) => {
      const t = text.toLowerCase();
      if (t.match(/expens|cost|price|budget|afford|money/))          return 'Price / budget concern';
      if (t.match(/time|now|busy|bandwidth|later|month|quarter|contract|soon/)) return 'Not the right time';
      if (t.match(/vendor|already|another|current|using|signed|compet/))        return 'Already have a vendor';
      if (t.match(/interest|relevant|need|work for us/))              return 'Not interested';
      return null;
    };
    for (const session of pastSessions) {
      for (const s of session.suggestions ?? []) {
        if (s.type !== 'objection-handler') continue;
        const cat = classify(s.triggeredBy ?? '');
        if (!cat) continue;
        if (!cats[cat]) cats[cat] = { count: 0, techniques: [], won: 0 };
        cats[cat].count++;
        if (s.headline) cats[cat].techniques.push(s.headline);
        if (session.finalCloseProbability >= 50) cats[cat].won++;
      }
    }
    return Object.entries(cats)
      .map(([label, d]) => ({
        label,
        count: d.count,
        technique: d.techniques[0] ?? '—',
        successRate: Math.round((d.won / d.count) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  })();

  // ── Insight 2: Winning patterns ───────────────────────────────────────────
  const winningPatterns = (() => {
    if (pastSessions.length < 2) return [];
    const sorted = [...pastSessions].sort((a, b) => b.finalCloseProbability - a.finalCloseProbability);
    const half = Math.ceil(sorted.length / 2);
    const top = sorted.slice(0, half);
    const bot = sorted.slice(half);
    const avgTopDur = Math.round(avg(top.map(s => s.durationSeconds)));
    const avgBotDur = Math.round(avg(bot.map(s => s.durationSeconds)));
    const avgTopObj = avg(top.map(s => s.objectionsCount));
    const avgBotObj = avg(bot.map(s => s.objectionsCount));
    const closeS = pastSessions.filter(s => s.callStage === 'close');
    const otherS = pastSessions.filter(s => s.callStage !== 'close');
    const avgCloseP = closeS.length ? Math.round(avg(closeS.map(s => s.finalCloseProbability))) : 0;
    const avgOtherP = otherS.length ? Math.round(avg(otherS.map(s => s.finalCloseProbability))) : 0;
    const out: { icon: string; stat: string; label: string }[] = [];
    if (Math.abs(avgTopDur - avgBotDur) > 60)
      out.push({ icon: '⏱', stat: fmtDur(avgTopDur), label: `avg duration on your top-performing calls vs ${fmtDur(avgBotDur)} on lower-performing ones` });
    if (avgBotObj > avgTopObj + 0.3)
      out.push({ icon: '◎', stat: `${avgTopObj.toFixed(1)} obj`, label: `avg objections on winning calls vs ${avgBotObj.toFixed(1)} on losing ones — handling early matters` });
    if (closeS.length > 0 && avgCloseP > avgOtherP + 5)
      out.push({ icon: '◈', stat: `${avgCloseP}%`, label: `avg close probability on calls that reached Close stage vs ${avgOtherP}% on earlier-stage calls` });
    return out.slice(0, 3);
  })();

  // ── Insight 3: Stage distribution (%) ────────────────────────────────────
  const totalCallsForStage = Object.values(stageCount).reduce((a, b) => a + b, 0) || 1;
  const stagePcts = (['opener', 'discovery', 'pitch', 'close'] as const).map(stage => ({
    stage,
    count: stageCount[stage] ?? 0,
    pct: Math.round(((stageCount[stage] ?? 0) / totalCallsForStage) * 100),
  }));

  // ── Insight 4: Best call time (by day of week) ────────────────────────────
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const callsByDay = (() => {
    const src = useMockPerf
      ? MOCK_CALLS.map(c => ({ date: c.date, prob: c.prob }))
      : pastSessions.map(s => ({ date: s.endedAt, prob: s.finalCloseProbability }));
    const map: Record<number, { total: number; count: number }> = {};
    for (const { date, prob } of src) {
      const d = new Date(date).getDay();
      if (!map[d]) map[d] = { total: 0, count: 0 };
      map[d].total += prob; map[d].count++;
    }
    return DAY_NAMES.map((name, i) =>
      map[i] ? { name, avgProb: Math.round(map[i].total / map[i].count), count: map[i].count } : null
    ).filter(Boolean) as { name: string; avgProb: number; count: number }[];
  })();
  const bestDay  = callsByDay.length ? callsByDay.reduce((a, b) => b.avgProb > a.avgProb ? b : a) : null;
  const maxDayProb = callsByDay.length ? Math.max(...callsByDay.map(d => d.avgProb)) : 100;

  // ── Insight 5: Objection-to-close rate ────────────────────────────────────
  const objCloseGroups = (() => {
    const src = useMockPerf
      ? MOCK_CALLS.map(c => ({ objections: c.objections, prob: c.prob }))
      : pastSessions.map(s => ({ objections: s.objectionsCount, prob: s.finalCloseProbability }));
    return [
      { label: '0 objections', fn: (o: number) => o === 0 },
      { label: '1 objection',  fn: (o: number) => o === 1 },
      { label: '2+ objections', fn: (o: number) => o >= 2 },
    ].map(g => {
      const m = src.filter(s => g.fn(s.objections));
      const ap = m.length ? Math.round(avg(m.map(s => s.prob))) : null;
      return { label: g.label, count: m.length, avgClose: ap, tier: ap ? scoreTier(ap) : 'low' as Tier };
    }).filter(g => g.count > 0);
  })();

  return (
    <div className="analytics">
      <div className="analytics__topbar">
        {detailView ? (
          <button className="analytics__back-btn" onClick={() => setDetailView(null)}>← {t.analytics.title}</button>
        ) : (
          <div>
            <h1 className="analytics__title">{t.analytics.title}</h1>
            <p className="analytics__subtitle">Performance trends across calls and training</p>
          </div>
        )}
        {isMock && <span className="analytics__demo-badge">DEMO DATA</span>}
      </div>

      {!detailView && (
        <div className="analytics__tabs">
          {(['performance', 'intel', 'training', 'team'] as AnalyticsTab[]).map(tabId => (
            <button key={tabId} className={`analytics__tab ${tab === tabId ? 'analytics__tab--active' : ''}`} onClick={() => setTab(tabId)}>
              {tabId === 'intel' ? 'CALL INTEL' : tabId.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── Detail Views ───────────────────────────────────────────────────── */}

      {detailView === 'prob' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">Close Probability</h2>
            <p className="analytics__detail-view-sub">Win-rate trend across every recorded call</p>
          </div>
          <div className="analytics__stats">
            {[
              { val: `${totalCalls}`, label: 'TOTAL CALLS', cls: '' },
              { val: `${avgProb}%`, label: 'AVG CLOSE %', cls: `analytics__stat-val--${scoreTier(avgProb)}` },
              { val: `${Math.max(...perfDetail.map(r => r.prob))}%`, label: 'BEST CALL', cls: 'analytics__stat-val--high' },
              { val: `${perfDetail.filter(r => r.prob >= 61).length}`, label: 'CALLS WON', cls: 'analytics__stat-val--high' },
            ].map((item, i) => (
              <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                <div className="analytics__stat-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
            <div className="analytics__chart-title">CLOSE PROBABILITY OVER TIME</div>
            <LineChart chartId="prob-d" points={perfDetail.map(r => ({ label: r.date, value: r.prob, tier: r.probTier }))} maxVal={100} unit="%" style={an(320)} />
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
            <div className="analytics__chart-title">FULL CALL LOG</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>DATE</th><th>DURATION</th><th>CLOSE %</th><th>LEAD SCORE</th><th>STAGE</th>{useMockPerf && <th>OBJECTIONS</th>}</tr></thead>
                <tbody>
                  {perfDetail.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td><td>{r.dur}</td>
                      <td className={`analytics__detail-val--${r.probTier}`}>{r.prob}%</td>
                      <td className={`analytics__detail-val--${r.scoreTier_}`}>{r.score}</td>
                      <td className="analytics__detail-stage">{r.stage.toUpperCase()}</td>
                      {useMockPerf && <td className={r.objections && r.objections > 2 ? 'analytics__detail-val--low' : ''}>{r.objections}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailView === 'stage' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">Calls by Stage</h2>
            <p className="analytics__detail-view-sub">Where your calls are ending — and how they perform at each stage</p>
          </div>
          <div className="analytics__stats">
            {(() => {
              const topS = stageDetail.reduce((a, b) => b.count > a.count ? b : a, stageDetail[0] ?? { stage: '—', count: 0, avgProb: 0, avgDur: 0, probTier: 'low' as Tier });
              const bestS = stageDetail.reduce((a, b) => b.avgProb > a.avgProb ? b : a, stageDetail[0] ?? { stage: '—', count: 0, avgProb: 0, avgDur: 0, probTier: 'low' as Tier });
              return [
                { val: `${stageDetail.length}`, label: 'ACTIVE STAGES', cls: '' },
                { val: topS.stage.toUpperCase(), label: 'MOST CALLS', cls: '' },
                { val: `${bestS.avgProb}%`, label: 'BEST STAGE AVG', cls: `analytics__stat-val--${bestS.probTier}` },
                { val: fmtDur(avgDurSec), label: 'AVG DURATION', cls: '' },
              ].map((item, i) => (
                <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                  <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                  <div className="analytics__stat-label">{item.label}</div>
                </div>
              ));
            })()}
          </div>
          <div className="analytics__chart-card" style={an(280)}>
            <div className="analytics__chart-title">CALL VOLUME BY STAGE</div>
            <div className="analytics__bars">
              {(Object.entries(stageCount) as [string, number][]).map(([stage, count], i) => (
                <div key={stage} className="analytics__bar-row">
                  <div className="analytics__bar-label">{stage.toUpperCase()}</div>
                  <div className="analytics__bar-track"><div className={`analytics__bar analytics__bar--stage-${stage}`} style={{ width: `${(count / maxStage) * 100}%`, ...an(320 + i * 60) }} /></div>
                  <div className="analytics__bar-val">{count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(400)}>
            <div className="analytics__chart-title">PER-STAGE BREAKDOWN</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>STAGE</th><th>CALLS</th><th>AVG CLOSE %</th><th>AVG DURATION</th></tr></thead>
                <tbody>
                  {stageDetail.map((r, i) => (
                    <tr key={i}>
                      <td className="analytics__detail-stage">{r.stage.toUpperCase()}</td>
                      <td>{r.count}</td>
                      <td className={`analytics__detail-val--${r.probTier}`}>{r.avgProb}%</td>
                      <td>{fmtDur(r.avgDur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailView === 'score' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">Training Score History</h2>
            <p className="analytics__detail-view-sub">Your performance across every Academy session</p>
          </div>
          <div className="analytics__stats">
            {[
              { val: `${tRecs.length}`, label: 'TOTAL SESSIONS', cls: '' },
              { val: `${avgTrain}/10`, label: 'AVG SCORE', cls: `analytics__stat-val--${scoreTier(avgTrain * 10, 75, 50)}` },
              { val: `${bestTrain.toFixed(1)}`, label: 'BEST SCORE', cls: 'analytics__stat-val--high' },
              { val: `${tRecs.filter(r => r.score >= 7.5).length}`, label: 'HIGH SCORES', cls: 'analytics__stat-val--high' },
            ].map((item, i) => (
              <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                <div className="analytics__stat-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
            <div className="analytics__chart-title">SCORE OVER TIME — ALL SESSIONS</div>
            <LineChart chartId="score-d" points={[...tRecs].reverse().map(r => ({ label: fmtDate(r.completed_at), value: r.score, tier: scoreTier(r.score * 10, 75, 50) }))} maxVal={10} style={an(320)} />
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
            <div className="analytics__chart-title">SESSION LOG</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>DATE</th><th>LESSON</th><th>SCORE</th></tr></thead>
                <tbody>
                  {trainDetail.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td className="analytics__detail-lesson">{r.lesson}</td>
                      <td className={`analytics__detail-val--${r.tier}`}>{r.score.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailView === 'lesson' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">Lesson Progress</h2>
            <p className="analytics__detail-view-sub">Best scores and improvement trends across the curriculum</p>
          </div>
          <div className="analytics__stats">
            {[
              { val: `${uniqLess}`, label: 'LESSONS TRIED', cls: '' },
              { val: `${lessonDetail.filter(r => r.best >= 7.5).length}`, label: 'MASTERED', cls: 'analytics__stat-val--high' },
              { val: `${lessonDetail.length ? (lessonDetail.reduce((s, r) => s + r.best, 0) / lessonDetail.length).toFixed(1) : '0'}/10`, label: 'AVG BEST', cls: '' },
              { val: `${tRecs.length}`, label: 'TOTAL ATTEMPTS', cls: '' },
            ].map((item, i) => (
              <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                <div className="analytics__stat-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
            <div className="analytics__chart-title">BEST SCORE ACROSS CURRICULUM</div>
            <LineChart chartId="lesson-d" points={LESSON_ORDER.filter(id => lessonBest.has(id)).map(id => ({ label: LESSON_SHORT[id] ?? id, value: lessonBest.get(id)!, tier: scoreTier(lessonBest.get(id)! * 10, 75, 50) }))} maxVal={10} style={an(320)} />
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
            <div className="analytics__chart-title">PER-LESSON BREAKDOWN</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>LESSON</th><th>ATTEMPTS</th><th>BEST</th><th>LAST</th><th>TREND</th></tr></thead>
                <tbody>
                  {lessonDetail.map((r, i) => (
                    <tr key={i}>
                      <td className="analytics__detail-lesson">{r.name}</td>
                      <td>{r.attempts}</td>
                      <td className={`analytics__detail-val--${r.bestTier}`}>{r.best.toFixed(1)}</td>
                      <td className={`analytics__detail-val--${r.lastTier}`}>{r.last.toFixed(1)}</td>
                      <td className={`analytics__detail-trend--${r.trend}`}>{r.trend === 'up' ? '↑ Improving' : r.trend === 'down' ? '↓ Declining' : '→ Steady'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailView === 'activity' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">Activity Log</h2>
            <p className="analytics__detail-view-sub">Daily practice and call activity over the last 28 days</p>
          </div>
          <div className="analytics__stats">
            {(() => {
              const activeDays   = activityDays.filter(d => d.call || d.training).length;
              const bothDays     = activityDays.filter(d => d.call && d.training).length;
              const callDays     = activityDays.filter(d => d.call && !d.training).length;
              const trainDays    = activityDays.filter(d => d.training && !d.call).length;
              return [
                { val: `${activeDays}`, label: 'ACTIVE DAYS', cls: '' },
                { val: `${bothDays}`, label: 'CALL + TRAINING', cls: bothDays > 5 ? 'analytics__stat-val--high' : '' },
                { val: `${callDays}`, label: 'CALL ONLY', cls: '' },
                { val: `${trainDays}`, label: 'TRAINING ONLY', cls: '' },
              ].map((item, i) => (
                <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                  <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                  <div className="analytics__stat-label">{item.label}</div>
                </div>
              ));
            })()}
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
            <div className="analytics__chart-title">28-DAY GRID</div>
            <div className="analytics__activity-grid analytics__activity-grid--large">
              {activityDays.map((d, i) => (
                <div key={i} className={`analytics__activity-cell ${d.training && d.call ? 'analytics__activity-cell--both' : d.training ? 'analytics__activity-cell--training' : d.call ? 'analytics__activity-cell--call' : ''}`} style={an(300 + i * 12)} title={d.date}>
                  <span className="analytics__activity-day">{new Date(d.date).getDate()}</span>
                </div>
              ))}
            </div>
            <div className="analytics__activity-legend" style={{ marginTop: '12px' }}>
              <span className="analytics__activity-dot analytics__activity-dot--both" />Both
              <span className="analytics__activity-dot analytics__activity-dot--call" />Call
              <span className="analytics__activity-dot analytics__activity-dot--training" />Training
            </div>
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
            <div className="analytics__chart-title">DAILY BREAKDOWN</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>DATE</th><th>CALL</th><th>TRAINING</th><th>STATUS</th></tr></thead>
                <tbody>
                  {[...activityDays].reverse().filter(d => d.call || d.training).map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</td>
                      <td>{d.call ? <span className="analytics__detail-val--high">✓</span> : <span className="analytics__detail-trend--flat">—</span>}</td>
                      <td>{d.training ? <span style={{ color: '#df7afe', fontWeight: 700 }}>✓</span> : <span className="analytics__detail-trend--flat">—</span>}</td>
                      <td>{d.call && d.training ? <span style={{ color: '#00cfff', fontWeight: 700 }}>BOTH</span> : d.call ? <span className="analytics__detail-val--high">CALL</span> : <span style={{ color: '#df7afe', fontWeight: 700 }}>TRAINING</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Performance ────────────────────────────────────────────────────── */}
      {!detailView && tab === 'performance' && (
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

            <div className="analytics__chart-card analytics__chart-card--wide analytics__chart-card--clickable" style={an(280)} onClick={() => setDetailView('prob')}>
              <div className="analytics__chart-title-row">
                <span className="analytics__chart-title">CLOSE PROBABILITY — LAST {probBars.length} CALLS</span>
                <span className="analytics__chart-hint">VIEW DETAILS →</span>
              </div>
              <LineChart chartId="prob" points={probBars.map(b => ({ label: b.label, value: b.pct, tier: b.tier }))} maxVal={100} unit="%" style={an(320)} />
            </div>

            <div className="analytics__chart-card analytics__chart-card--clickable" style={an(400)} onClick={() => setDetailView('stage')}>
              <div className="analytics__chart-title-row">
                <span className="analytics__chart-title">CALLS BY FINAL STAGE</span>
                <span className="analytics__chart-hint">VIEW DETAILS →</span>
              </div>
              <div className="analytics__bars">
                {(Object.entries(stageCount) as [string, number][]).map(([stage, count], i) => (
                  <div key={stage} className="analytics__bar-row">
                    <div className="analytics__bar-label">{stage.toUpperCase()}</div>
                    <div className="analytics__bar-track">
                      <div className={`analytics__bar analytics__bar--stage-${stage}`} style={{ width: `${(count / maxStage) * 100}%`, ...an(440 + i * 60) }} />
                    </div>
                    <div className="analytics__bar-val">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics__chart-card analytics__chart-card--clickable" style={an(450)} onClick={() => setDetailView('activity')}>
              <div className="analytics__chart-title-row">
                <span className="analytics__chart-title">ACTIVITY — LAST 28 DAYS</span>
                <span className="analytics__chart-hint">VIEW DETAILS →</span>
              </div>
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
                  >
                    <span className="analytics__activity-day">{new Date(d.date).getDate()}</span>
                  </div>
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

      {/* ── Call Intel ─────────────────────────────────────────────────────── */}
      {!detailView && tab === 'intel' && (
        <div className="analytics__content">

          {/* 1. Top Objections */}
          <div className="analytics__insight-card" style={an(80)}>
            <div className="analytics__chart-title">TOP OBJECTIONS &amp; TECHNIQUES</div>
            <div className="analytics__obj-list">
              {(objInsights.length > 0 ? objInsights : [
                { label: 'Price / budget concern',   count: 4, technique: 'Anchor to ROI — tie cost to the value saved or problem avoided', successRate: 62 },
                { label: 'Not the right time',        count: 3, technique: 'Future-pace the delay cost — show what waiting costs them',       successRate: 48 },
                { label: 'Already have a vendor',     count: 2, technique: 'Contrast positioning — isolate the one thing you do better',      successRate: 35 },
              ] as typeof objInsights).map((o, i) => (
                <div key={i} className="analytics__obj-item">
                  <div className="analytics__obj-top">
                    <span className="analytics__obj-rank">#{i + 1}</span>
                    <span className="analytics__obj-label">{o.label}</span>
                    <span className="analytics__obj-count">{o.count}×</span>
                  </div>
                  <div className="analytics__obj-technique">{o.technique}</div>
                  <div className="analytics__obj-rate">
                    <div className="analytics__obj-bar-track">
                      <div className="analytics__obj-bar" style={{ width: `${o.successRate}%` }} />
                    </div>
                    <span className="analytics__obj-rate-val">{o.successRate}% success when handled</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Winning Patterns */}
          <div className="analytics__insight-card" style={an(160)}>
            <div className="analytics__chart-title">WINNING PATTERNS</div>
            <div className="analytics__patterns-list">
              {(winningPatterns.length > 0 ? winningPatterns : [
                { icon: '⏱', stat: '11m 2s', label: 'avg duration on your top-performing calls vs 5m 8s on lower-performing ones' },
                { icon: '◎', stat: '0.8 obj', label: 'avg objections on winning calls vs 2.3 on losing ones — handling objections early matters' },
                { icon: '◈', stat: '76%', label: 'avg close probability on calls that reached Close stage vs 41% on earlier-stage calls' },
              ]).map((p, i) => (
                <div key={i} className="analytics__pattern-item">
                  <span className="analytics__pattern-icon">{p.icon}</span>
                  <div>
                    <span className="analytics__pattern-stat">{p.stat}</span>{' '}
                    <span className="analytics__pattern-label">{p.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Stage distribution */}
          <div className="analytics__insight-card" style={an(240)}>
            <div className="analytics__chart-title">STAGE DISTRIBUTION</div>
            <div className="analytics__stage-dist">
              {stagePcts.map((s, i) => (
                <div key={i} className="analytics__stage-dist-row">
                  <span className="analytics__stage-dist-label">{s.stage.toUpperCase()}</span>
                  <div className="analytics__stage-dist-track">
                    <div className={`analytics__stage-dist-bar analytics__bar--stage-${s.stage}`} style={{ width: `${Math.max(s.pct, 2)}%`, ...an(260 + i * 50) }} />
                  </div>
                  <span className="analytics__stage-dist-pct">{s.pct}%</span>
                  <span className="analytics__stage-dist-count">({s.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Best call time */}
          <div className="analytics__insight-card" style={an(320)}>
            <div className="analytics__chart-title">BEST DAY TO CALL</div>
            {bestDay && (
              <div className="analytics__bestday">
                <span className="analytics__bestday-name">{bestDay.name}</span>
                <span className="analytics__bestday-stat">{bestDay.avgProb}% avg close probability</span>
              </div>
            )}
            <div className="analytics__day-bars">
              {callsByDay.map((d, i) => (
                <div key={i} className={`analytics__day-bar-col ${bestDay?.name === d.name ? 'analytics__day-bar-col--best' : ''}`}>
                  <div className="analytics__day-bar-wrap">
                    <div className="analytics__day-bar" style={{ height: `${(d.avgProb / maxDayProb) * 100}%`, ...an(360 + i * 30) }} />
                  </div>
                  <span className="analytics__day-bar-label">{d.name}</span>
                  <span className="analytics__day-bar-val">{d.avgProb}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Objection-to-close rate */}
          <div className="analytics__insight-card" style={an(400)}>
            <div className="analytics__chart-title">OBJECTION-TO-CLOSE RATE</div>
            <p className="analytics__insight-desc">How your close probability shifts based on how many objections came up on a call.</p>
            <div className="analytics__obj-close-list">
              {(objCloseGroups.length > 0 ? objCloseGroups : [
                { label: '0 objections',  count: 3, avgClose: 81, tier: 'high'   as const },
                { label: '1 objection',   count: 5, avgClose: 57, tier: 'medium' as const },
                { label: '2+ objections', count: 4, avgClose: 33, tier: 'low'    as const },
              ]).map((g, i) => (
                <div key={i} className="analytics__obj-close-item">
                  <div className="analytics__obj-close-top">
                    <span className="analytics__obj-close-label">{g.label}</span>
                    <span className="analytics__obj-close-count">{g.count} calls</span>
                  </div>
                  <div className="analytics__obj-close-bar-row">
                    <div className="analytics__obj-close-track">
                      <div className={`analytics__obj-close-bar analytics__obj-close-bar--${g.tier}`} style={{ width: `${g.avgClose ?? 0}%`, ...an(420 + i * 40) }} />
                    </div>
                    <span className={`analytics__obj-close-val analytics__detail-val--${g.tier}`}>{g.avgClose !== null ? `${g.avgClose}%` : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Training ───────────────────────────────────────────────────────── */}
      {!detailView && tab === 'training' && (
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

            <div className="analytics__chart-card analytics__chart-card--wide analytics__chart-card--clickable" style={an(280)} onClick={() => setDetailView('score')}>
              <div className="analytics__chart-title-row">
                <span className="analytics__chart-title">SCORE — LAST {Math.min(tRecs.length, 10)} SESSIONS</span>
                <span className="analytics__chart-hint">VIEW DETAILS →</span>
              </div>
              <LineChart chartId="score" points={tRecs.slice(0, 10).map(r => ({ label: fmtDate(r.completed_at), value: r.score, tier: scoreTier(r.score * 10, 75, 50) }))} maxVal={10} style={an(320)} />
            </div>

            {lessonBest.size > 0 && (
              <div className="analytics__chart-card analytics__chart-card--wide analytics__chart-card--clickable" style={an(420)} onClick={() => setDetailView('lesson')}>
                <div className="analytics__chart-title-row">
                  <span className="analytics__chart-title">BEST SCORE PER LESSON</span>
                  <span className="analytics__chart-hint">VIEW DETAILS →</span>
                </div>
                <LineChart chartId="lesson" points={LESSON_ORDER.filter(id => lessonBest.has(id)).map(id => ({ label: LESSON_SHORT[id] ?? id, value: lessonBest.get(id)!, tier: scoreTier(lessonBest.get(id)! * 10, 75, 50) }))} maxVal={10} style={an(460)} />
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Team ───────────────────────────────────────────────────────────── */}
      {!detailView && tab === 'team' && (
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
