import { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useAppLanguage } from '../hooks/useAppLanguage';
import type { CallSession } from '../types';
import { computeRepScore } from '../lib/repScore';
import './AnalyticsScreen.css';

interface AnalyticsScreenProps {
  pastSessions: CallSession[];
}

type AnalyticsTab = 'performance' | 'intel' | 'team';
type Tier = 'high' | 'medium' | 'low';

// ── Mock datasets ─────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

const MOCK_CALLS = [
  { date: daysAgo(28), prob: 35, score: 58, dur: 4 * 60 + 22, stage: 'discovery', objections: 2 },
  { date: daysAgo(26), prob: 52, score: 64, dur: 7 * 60 + 15, stage: 'pitch',     objections: 1 },
  { date: daysAgo(24), prob: 41, score: 55, dur: 5 * 60 + 44, stage: 'discovery', objections: 3 },
  { date: daysAgo(22), prob: 67, score: 72, dur: 9 * 60 + 33, stage: 'close',     objections: 1 },
  { date: daysAgo(19), prob: 29, score: 48, dur: 3 * 60 + 12, stage: 'opener',    objections: 4 },
  { date: daysAgo(17), prob: 58, score: 69, dur: 8 * 60 + 5,  stage: 'pitch',     objections: 2 },
  { date: daysAgo(15), prob: 74, score: 78, dur: 11 * 60 + 22, stage: 'close',    objections: 1 },
  { date: daysAgo(12), prob: 63, score: 71, dur: 9 * 60 + 48, stage: 'pitch',     objections: 2 },
  { date: daysAgo(10), prob: 81, score: 85, dur: 13 * 60 + 17, stage: 'close',    objections: 0 },
  { date: daysAgo(7),  prob: 55, score: 67, dur: 7 * 60 + 56, stage: 'discovery', objections: 2 },
  { date: daysAgo(3),  prob: 78, score: 82, dur: 12 * 60 + 8,  stage: 'close',    objections: 1 },
  { date: daysAgo(0),  prob: 86, score: 89, dur: 14 * 60 + 33, stage: 'close',    objections: 0 },
];

const MOCK_TEAM = [
  { name: '[Demo] Alex Chen',  calls: 47, avgProb: 72, streak: 12, isYou: false },
  { name: '[Demo] Sarah Kim',  calls: 38, avgProb: 68, streak: 8,  isYou: false },
  { name: 'You',               calls: 12, avgProb: 66, streak: 5,  isYou: true  },
  { name: '[Demo] Marcus J.',  calls: 29, avgProb: 61, streak: 3,  isYou: false },
  { name: '[Demo] Priya P.',   calls: 22, avgProb: 54, streak: 2,  isYou: false },
];


function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function scoreTier(val: number, hi = 61, mid = 31): Tier { return val >= hi ? 'high' : val >= mid ? 'medium' : 'low'; }

// ── Line chart ─────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<Tier, string> = {
  high: '#39d353',
  medium: '#f0e040',
  low: '#ff4444',
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

export function AnalyticsScreen({ pastSessions }: AnalyticsScreenProps) {
  const t = useTranslations();
  const { appLanguage } = useAppLanguage();
  const [tab, setTab] = useState<AnalyticsTab>('performance');
  const [detailView, setDetailView] = useState<string | null>(null);
  const [teamCode, setTeamCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinedTeam, setJoinedTeam] = useState('');
  const [teamMsg, setTeamMsg] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeamCode(localStorage.getItem('pitchbase_team_code') ?? '');
    setJoinedTeam(localStorage.getItem('pitchbase_joined_team') ?? '');
  }, []);

  async function copyTeamCode() {
    await navigator.clipboard.writeText(teamCode);
    setTeamMsg(t.analytics.codeCopied);
    setTimeout(() => setTeamMsg(''), 2000);
  }

  function generateTeamCode() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem('pitchbase_team_code', code);
    setTeamCode(code);
    setTeamMsg(t.analytics.teamCodeCreated);
  }

  function handleJoinTeam() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    localStorage.setItem('pitchbase_joined_team', code);
    setJoinedTeam(code);
    setJoinCode('');
    setTeamMsg(t.analytics.joinedTeamMsg(code));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmtDur(s: number) { return `${Math.floor(s / 60)}m ${s % 60}s`; }
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(appLanguage, { month: 'short', day: 'numeric' });
  }
  function an(delay: number) { return { '--an-delay': `${delay}ms` } as React.CSSProperties; }

  function translateStage(stage: string) {
    const map: Record<string, string> = {
      opener: t.liveCall.stageOpener,
      discovery: t.liveCall.stageDiscovery,
      pitch: t.liveCall.stagePitch,
      close: t.liveCall.stageClose,
    };
    return map[stage] ?? stage.toUpperCase();
  }

  // Localized short day names (Sun=0 … Sat=6), Jan 7 2024 is Sunday
  const DAY_NAMES = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(appLanguage, { weekday: 'short' })
  );

  // ── Data sources (real or mock) ───────────────────────────────────────────
  const useMockPerf = pastSessions.length === 0;

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

  // ── Rep score per call ────────────────────────────────────────────────────
  const repScoreBars = useMockPerf
    ? MOCK_CALLS.map(c => ({ label: fmtDate(c.date), pct: c.score, tier: scoreTier(c.score, 70, 45) }))
    : [...pastSessions]
        .sort((a, b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime())
        .slice(-12)
        .map(s => {
          const score = computeRepScore(s);
          return { label: fmtDate(s.endedAt), pct: score, tier: scoreTier(score, 70, 45) };
        });

  const avgRepScore = useMockPerf
    ? Math.round(avg(MOCK_CALLS.map(c => c.score)))
    : (pastSessions.length ? Math.round(avg(pastSessions.map(s => computeRepScore(s)))) : 0);

  const avgTalkRatioPct = useMockPerf
    ? 47
    : (pastSessions.length ? Math.round(avg(pastSessions.filter(s => s.talkRatio !== undefined).map(s => (s.talkRatio ?? 0.5) * 100))) : 50);

  // ── Stage breakdown ───────────────────────────────────────────────────────
  const stageCount: Record<string, number> = { opener: 0, discovery: 0, pitch: 0, close: 0 };
  if (useMockPerf) {
    for (const c of MOCK_CALLS) stageCount[c.stage] = (stageCount[c.stage] ?? 0) + 1;
  } else {
    for (const s of pastSessions) stageCount[s.callStage] = (stageCount[s.callStage] ?? 0) + 1;
  }
  const maxStage = Math.max(...Object.values(stageCount), 1);

  // ── Activity grid (last 28 days) ──────────────────────────────────────────
  const mockCallDates = new Set(MOCK_CALLS.map(c => c.date.split('T')[0]));
  const today = new Date();
  const activityDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const ds = d.toISOString().split('T')[0];
    return {
      date: ds,
      call: useMockPerf ? mockCallDates.has(ds) : pastSessions.some(s => s.endedAt.startsWith(ds)),
    };
  });

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

  const isMock = useMockPerf;

  // ── Insight 1: Top objections ─────────────────────────────────────────────
  interface ObjInsight { label: string; count: number; technique: string; successRate: number; }
  const objInsights: ObjInsight[] = (() => {
    const cats: Record<string, { count: number; techniques: string[]; won: number }> = {};
    const classify = (text: string) => {
      const tx = text.toLowerCase();
      if (tx.match(/expens|cost|price|budget|afford|money/))          return t.analytics.objPriceBudget;
      if (tx.match(/time|now|busy|bandwidth|later|month|quarter|contract|soon/)) return t.analytics.objNotRightTime;
      if (tx.match(/vendor|already|another|current|using|signed|compet/))        return t.analytics.objAlreadyVendor;
      if (tx.match(/interest|relevant|need|work for us/))              return t.analytics.objNotInterested;
      return null;
    };
    for (const session of pastSessions) {
      for (const s of session.suggestions ?? []) {
        if (s.type !== 'objection-response') continue;
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
      out.push({ icon: '⏱', stat: fmtDur(avgTopDur), label: t.analytics.winPatternDuration(fmtDur(avgBotDur)) });
    if (avgBotObj > avgTopObj + 0.3)
      out.push({ icon: '◎', stat: `${avgTopObj.toFixed(1)} obj`, label: t.analytics.winPatternObjections(avgBotObj.toFixed(1)) });
    if (closeS.length > 0 && avgCloseP > avgOtherP + 5)
      out.push({ icon: '◈', stat: `${avgCloseP}%`, label: t.analytics.winPatternCloseStage(avgOtherP) });
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
      { label: t.analytics.objZero,    fn: (o: number) => o === 0 },
      { label: t.analytics.objOne,     fn: (o: number) => o === 1 },
      { label: t.analytics.objTwoPlus, fn: (o: number) => o >= 2 },
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
            <p className="analytics__subtitle">{t.analytics.subtitle}</p>
          </div>
        )}
        {isMock && <span className="analytics__demo-badge">{t.analytics.demoData.toUpperCase()}</span>}
      </div>

      {!detailView && (
        <div className="analytics__tabs">
          {(['performance', 'intel', 'team'] as AnalyticsTab[]).map(tabId => (
            <button key={tabId} className={`analytics__tab ${tab === tabId ? 'analytics__tab--active' : ''}`} onClick={() => setTab(tabId)}>
              {tabId === 'performance' ? t.analytics.performance.toUpperCase()
               : tabId === 'intel' ? t.analytics.callIntel.toUpperCase()
               : t.analytics.team.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── Detail Views ───────────────────────────────────────────────────── */}

      {detailView === 'prob' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">{t.analytics.closeProbDetail}</h2>
            <p className="analytics__detail-view-sub">{t.analytics.closeProbDetailSub}</p>
          </div>
          <div className="analytics__stats">
            {[
              { val: `${totalCalls}`, label: t.analytics.totalCalls.toUpperCase(), cls: '' },
              { val: `${avgProb}%`, label: t.analytics.avgClosePercent.toUpperCase(), cls: `analytics__stat-val--${scoreTier(avgProb)}` },
              { val: `${Math.max(...perfDetail.map(r => r.prob))}%`, label: t.analytics.bestCall.toUpperCase(), cls: 'analytics__stat-val--high' },
              { val: `${perfDetail.filter(r => r.prob >= 61).length}`, label: t.analytics.callsWon.toUpperCase(), cls: 'analytics__stat-val--high' },
              { val: `${avgRepScore}`, label: t.analytics.avgRepScore.toUpperCase(), cls: `analytics__stat-val--${scoreTier(avgRepScore, 70, 45)}` },
              { val: `${avgTalkRatioPct}%`, label: t.analytics.avgTalkRatio.toUpperCase(), cls: avgTalkRatioPct <= 50 ? 'analytics__stat-val--high' : avgTalkRatioPct <= 65 ? 'analytics__stat-val--medium' : 'analytics__stat-val--low' },
            ].map((item, i) => (
              <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                <div className="analytics__stat-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
            <div className="analytics__chart-title">{t.analytics.closeProbOverTime.toUpperCase()}</div>
            <LineChart chartId="prob-d" points={perfDetail.map(r => ({ label: r.date, value: r.prob, tier: r.probTier }))} maxVal={100} unit="%" style={an(320)} />
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(360)}>
            <div className="analytics__chart-title">{t.analytics.repScoreTrend(repScoreBars.length).toUpperCase()}</div>
            <LineChart chartId="repscore-d" points={repScoreBars.map(r => ({ label: r.label, value: r.pct, tier: r.tier }))} maxVal={100} unit="" style={an(400)} />
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
            <div className="analytics__chart-title">{t.analytics.fullCallLog.toUpperCase()}</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>{t.analytics.colDate.toUpperCase()}</th><th>{t.analytics.colDuration.toUpperCase()}</th><th>{t.analytics.colClosePercent.toUpperCase()}</th><th>{t.analytics.colLeadScore.toUpperCase()}</th><th>{t.analytics.colStage.toUpperCase()}</th>{useMockPerf && <th>{t.analytics.colObjections.toUpperCase()}</th>}</tr></thead>
                <tbody>
                  {perfDetail.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td><td>{r.dur}</td>
                      <td className={`analytics__detail-val--${r.probTier}`}>{r.prob}%</td>
                      <td className={`analytics__detail-val--${r.scoreTier_}`}>{r.score}</td>
                      <td className="analytics__detail-stage">{translateStage(r.stage)}</td>
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
            <h2 className="analytics__detail-view-title">{t.analytics.callsByStageDetail}</h2>
            <p className="analytics__detail-view-sub">{t.analytics.callsByStageDetailSub}</p>
          </div>
          <div className="analytics__stats">
            {(() => {
              const topS = stageDetail.reduce((a, b) => b.count > a.count ? b : a, stageDetail[0] ?? { stage: '—', count: 0, avgProb: 0, avgDur: 0, probTier: 'low' as Tier });
              const bestS = stageDetail.reduce((a, b) => b.avgProb > a.avgProb ? b : a, stageDetail[0] ?? { stage: '—', count: 0, avgProb: 0, avgDur: 0, probTier: 'low' as Tier });
              return [
                { val: `${stageDetail.length}`, label: t.analytics.activeStages.toUpperCase(), cls: '' },
                { val: translateStage(topS.stage), label: t.analytics.mostCalls.toUpperCase(), cls: '' },
                { val: `${bestS.avgProb}%`, label: t.analytics.bestStageAvg.toUpperCase(), cls: `analytics__stat-val--${bestS.probTier}` },
                { val: fmtDur(avgDurSec), label: t.analytics.avgDuration.toUpperCase(), cls: '' },
              ].map((item, i) => (
                <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                  <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                  <div className="analytics__stat-label">{item.label}</div>
                </div>
              ));
            })()}
          </div>
          <div className="analytics__chart-card" style={an(280)}>
            <div className="analytics__chart-title">{t.analytics.callVolumeByStage.toUpperCase()}</div>
            <div className="analytics__bars">
              {(Object.entries(stageCount) as [string, number][]).map(([stage, count], i) => (
                <div key={stage} className="analytics__bar-row">
                  <div className="analytics__bar-label">{translateStage(stage)}</div>
                  <div className="analytics__bar-track"><div className={`analytics__bar analytics__bar--stage-${stage}`} style={{ width: `${(count / maxStage) * 100}%`, ...an(320 + i * 60) }} /></div>
                  <div className="analytics__bar-val">{count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(400)}>
            <div className="analytics__chart-title">{t.analytics.perStageBreakdown.toUpperCase()}</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>{t.analytics.colStage.toUpperCase()}</th><th>{t.analytics.colCalls.toUpperCase()}</th><th>{t.analytics.colAvgClosePercent.toUpperCase()}</th><th>{t.analytics.colAvgDuration.toUpperCase()}</th></tr></thead>
                <tbody>
                  {stageDetail.map((r, i) => (
                    <tr key={i}>
                      <td className="analytics__detail-stage">{translateStage(r.stage)}</td>
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

      {detailView === 'activity' && (
        <div className="analytics__detail-view">
          <div className="analytics__detail-view-header">
            <h2 className="analytics__detail-view-title">{t.analytics.activityLogDetail}</h2>
            <p className="analytics__detail-view-sub">{t.analytics.activityLogDetailSub}</p>
          </div>
          <div className="analytics__stats">
            {(() => {
              const callDays = activityDays.filter(d => d.call).length;
              return [
                { val: `${callDays}`, label: t.analytics.activeDays.toUpperCase(), cls: callDays > 15 ? 'analytics__stat-val--high' : '' },
                { val: `${28 - callDays}`, label: t.analytics.daysOff.toUpperCase(), cls: '' },
              ].map((item, i) => (
                <div key={i} className="analytics__stat-card" style={an(i * 60)}>
                  <div className={`analytics__stat-val ${item.cls}`}>{item.val}</div>
                  <div className="analytics__stat-label">{item.label}</div>
                </div>
              ));
            })()}
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(280)}>
            <div className="analytics__chart-title">{t.analytics.dayGrid28.toUpperCase()}</div>
            <div className="analytics__activity-grid analytics__activity-grid--large">
              {activityDays.map((d, i) => (
                <div key={i} className={`analytics__activity-cell ${d.call ? 'analytics__activity-cell--call' : ''}`} style={an(300 + i * 12)} title={d.date}>
                  <span className="analytics__activity-day">{new Date(d.date).getDate()}</span>
                </div>
              ))}
            </div>
            <div className="analytics__activity-legend" style={{ marginTop: '12px' }}>
              <span className="analytics__activity-dot analytics__activity-dot--call" />{t.analytics.callDay}
            </div>
          </div>
          <div className="analytics__chart-card analytics__chart-card--wide" style={an(420)}>
            <div className="analytics__chart-title">{t.analytics.dailyBreakdown.toUpperCase()}</div>
            <div className="analytics__detail-scroll">
              <table className="analytics__detail-table">
                <thead><tr><th>{t.analytics.colDate.toUpperCase()}</th><th>{t.analytics.call.toUpperCase()}</th></tr></thead>
                <tbody>
                  {[...activityDays].reverse().filter(d => d.call).map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.date).toLocaleDateString(appLanguage, { month: 'short', day: 'numeric', weekday: 'short' })}</td>
                      <td><span className="analytics__detail-val--high">✓</span></td>
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
              { val: String(totalCalls),  label: t.analytics.totalCalls.toUpperCase(),    cls: '' },
              { val: `${avgProb}%`,        label: t.analytics.avgCloseProb.toUpperCase(), cls: `analytics__stat-val--${scoreTier(avgProb)}` },
              { val: String(avgScore),     label: t.analytics.avgLeadScore.toUpperCase(), cls: `analytics__stat-val--${scoreTier(avgScore, 70, 40)}` },
              { val: fmtDur(avgDurSec),    label: t.analytics.avgDuration.toUpperCase(),  cls: '' },
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
                <span className="analytics__chart-title">{t.analytics.closeProbChart(probBars.length)}</span>
                <span className="analytics__chart-hint">{t.analytics.viewDetails}</span>
              </div>
              <LineChart chartId="prob" points={probBars.map(b => ({ label: b.label, value: b.pct, tier: b.tier }))} maxVal={100} unit="%" style={an(320)} />
            </div>

            <div className="analytics__chart-card analytics__chart-card--wide" style={an(380)}>
              <div className="analytics__chart-title-row">
                <span className="analytics__chart-title">{t.analytics.repScoreTrend(repScoreBars.length).toUpperCase()}</span>
              </div>
              <LineChart chartId="repscore" points={repScoreBars.map(b => ({ label: b.label, value: b.pct, tier: b.tier }))} maxVal={100} unit="" style={an(420)} />
            </div>

            <div className="analytics__chart-card analytics__chart-card--clickable" style={an(400)} onClick={() => setDetailView('stage')}>
              <div className="analytics__chart-title-row">
                <span className="analytics__chart-title">{t.analytics.callsByStage.toUpperCase()}</span>
                <span className="analytics__chart-hint">{t.analytics.viewDetails}</span>
              </div>
              <div className="analytics__bars">
                {(Object.entries(stageCount) as [string, number][]).map(([stage, count], i) => (
                  <div key={stage} className="analytics__bar-row">
                    <div className="analytics__bar-label">{translateStage(stage)}</div>
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
                <span className="analytics__chart-title">{t.analytics.activityDays.toUpperCase()}</span>
                <span className="analytics__chart-hint">{t.analytics.viewDetails}</span>
              </div>
              <div className="analytics__activity-grid">
                {activityDays.map((d, i) => (
                  <div
                    key={i}
                    className={`analytics__activity-cell ${d.call ? 'analytics__activity-cell--call' : ''}`}
                    style={an(490 + i * 16)}
                    title={d.date}
                  >
                    <span className="analytics__activity-day">{new Date(d.date).getDate()}</span>
                  </div>
                ))}
              </div>
              <div className="analytics__activity-legend">
                <span className="analytics__activity-dot analytics__activity-dot--call" />{t.analytics.call}
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
            <div className="analytics__chart-title">{t.analytics.topObjections.toUpperCase()}</div>
            <div className="analytics__obj-list">
              {(objInsights.length > 0 ? objInsights : [
                { label: t.analytics.objPriceBudget,   count: 4, technique: t.analytics.techAnchorROI, successRate: 62 },
                { label: t.analytics.objNotRightTime,  count: 3, technique: t.analytics.techFuturePace, successRate: 48 },
                { label: t.analytics.objAlreadyVendor, count: 2, technique: t.analytics.techContrast,   successRate: 35 },
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
                    <span className="analytics__obj-rate-val">{t.analytics.successWhenHandled(o.successRate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Winning Patterns */}
          <div className="analytics__insight-card" style={an(160)}>
            <div className="analytics__chart-title">{t.analytics.winningPatterns.toUpperCase()}</div>
            <div className="analytics__patterns-list">
              {(winningPatterns.length > 0 ? winningPatterns : [
                { icon: '⏱', stat: '11m 2s', label: t.analytics.winPatternDuration('5m 8s') },
                { icon: '◎', stat: '0.8 obj', label: t.analytics.winPatternObjections('2.3') },
                { icon: '◈', stat: '76%',     label: t.analytics.winPatternCloseStage(41) },
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
            <div className="analytics__chart-title">{t.analytics.stageDistribution.toUpperCase()}</div>
            <div className="analytics__stage-dist">
              {stagePcts.map((s, i) => (
                <div key={i} className="analytics__stage-dist-row">
                  <span className="analytics__stage-dist-label">{translateStage(s.stage)}</span>
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
            <div className="analytics__chart-title">{t.analytics.bestDayToCall.toUpperCase()}</div>
            {bestDay && (
              <div className="analytics__bestday">
                <span className="analytics__bestday-name">{bestDay.name}</span>
                <span className="analytics__bestday-stat">{bestDay.avgProb}% {t.analytics.avgCloseProbLabel}</span>
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
            <div className="analytics__chart-title">{t.analytics.objectionToCloseRate.toUpperCase()}</div>
            <p className="analytics__insight-desc">{t.analytics.objectionCloseRateDesc}</p>
            <div className="analytics__obj-close-list">
              {(objCloseGroups.length > 0 ? objCloseGroups : [
                { label: t.analytics.objZero,    count: 3, avgClose: 81, tier: 'high'   as const },
                { label: t.analytics.objOne,     count: 5, avgClose: 57, tier: 'medium' as const },
                { label: t.analytics.objTwoPlus, count: 4, avgClose: 33, tier: 'low'    as const },
              ]).map((g, i) => (
                <div key={i} className="analytics__obj-close-item">
                  <div className="analytics__obj-close-top">
                    <span className="analytics__obj-close-label">{g.label}</span>
                    <span className="analytics__obj-close-count">{g.count} {t.analytics.callsUnit}</span>
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

      {/* ── Team ───────────────────────────────────────────────────────────── */}
      {!detailView && tab === 'team' && (
        <div className="analytics__content">

          <div className="analytics__chart-card" style={an(0)}>
            <div className="analytics__chart-title-row">
              <span className="analytics__chart-title">{t.analytics.teamLeaderboard.toUpperCase()}</span>
              <span className="analytics__demo-inline">DEMO</span>
            </div>
            <div className="analytics__leaderboard">
              <div className="analytics__lb-header">
                <span className="analytics__lb-cell analytics__lb-cell--rank">#</span>
                <span className="analytics__lb-cell analytics__lb-cell--name">{t.analytics.colRep.toUpperCase()}</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">{t.analytics.colCalls.toUpperCase()}</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">{t.analytics.colClosePercent.toUpperCase()}</span>
                <span className="analytics__lb-cell analytics__lb-cell--num">{t.analytics.colStreak.toUpperCase()}</span>
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
                  <span className="analytics__lb-cell analytics__lb-cell--num analytics__lb-streak">
                    {rep.streak}d 🔥
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics__team-grid">
            <div className="analytics__team-card" style={an(500)}>
              <div className="analytics__chart-title">{t.analytics.managerCreateTeam.toUpperCase()}</div>
              <p className="analytics__team-desc">{t.analytics.teamCodeDesc}</p>
              {teamCode ? (
                <div className="analytics__team-code-block">
                  <div className="analytics__team-code">{teamCode}</div>
                  <button className="analytics__team-btn" onClick={copyTeamCode}>{t.analytics.copyBtn}</button>
                </div>
              ) : (
                <button className="analytics__team-btn analytics__team-btn--primary" onClick={generateTeamCode}>
                  {t.analytics.generateTeamCode}
                </button>
              )}
              {teamMsg && <div className="analytics__team-msg">{teamMsg}</div>}
            </div>

            <div className="analytics__team-card" style={an(580)}>
              <div className="analytics__chart-title">{t.analytics.repJoinTeam.toUpperCase()}</div>
              <p className="analytics__team-desc">{t.analytics.teamJoinDesc}</p>
              {joinedTeam && (
                <div className="analytics__team-joined">
                  {t.analytics.currentlyInTeam}<strong>{joinedTeam}</strong>
                </div>
              )}
              <div className="analytics__team-join-row">
                <input
                  className="analytics__team-input"
                  placeholder={t.analytics.teamCodePlaceholder}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <button
                  className="analytics__team-btn analytics__team-btn--primary"
                  onClick={handleJoinTeam}
                  disabled={!joinCode.trim()}
                >
                  {t.analytics.joinBtn}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
