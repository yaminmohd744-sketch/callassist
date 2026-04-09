// ─── Milestone definitions ────────────────────────────────────────────────────
// Each milestone requires the user to have at least `minCalls` real calls AND
// `minSessions` training sessions. Current milestone = highest tier where
// BOTH thresholds are satisfied. Gaps are intentionally large.

export interface Milestone {
  id: string;
  label: string;
  badge: string;   // emoji badge shown beside the tier name everywhere
  minCalls: number;
  minSessions: number;
  color: string;
  description: string; // flavour text shown on the tiers page
}

export const MILESTONES: Milestone[] = [
  {
    id: 'rookie',
    label: 'Rookie',
    badge: '🔰',
    minCalls: 0,
    minSessions: 0,
    color: '#7c8fa6',
    description: 'Just getting started. Every legend began here.',
  },
  {
    id: 'prospect-hunter',
    label: 'Prospect Hunter',
    badge: '🎯',
    minCalls: 10,
    minSessions: 5,
    color: '#34d399',
    description: 'You\'re in the game. Consistent activity is building the foundation.',
  },
  {
    id: 'power-dialer',
    label: 'Power Dialer',
    badge: '⚡',
    minCalls: 50,
    minSessions: 20,
    color: '#60a5fa',
    description: 'Volume and volume only. You dial when others sleep.',
  },
  {
    id: 'cold-closer',
    label: 'Cold Closer',
    badge: '🧊',
    minCalls: 150,
    minSessions: 60,
    color: '#67e8f9',
    description: 'Ice in your veins. Objections don\'t rattle you anymore.',
  },
  {
    id: 'sales-pro',
    label: 'Sales Pro',
    badge: '💼',
    minCalls: 400,
    minSessions: 150,
    color: '#a78bfa',
    description: 'This is your craft. You read rooms, control frames, and close on demand.',
  },
  {
    id: 'elite-closer',
    label: 'Elite Closer',
    badge: '💎',
    minCalls: 750,
    minSessions: 300,
    color: '#df7afe',
    description: 'Top 1%. Your pipeline is a machine. Prospects feel the difference.',
  },
  {
    id: 'legend',
    label: 'Legend',
    badge: '👑',
    minCalls: 1500,
    minSessions: 600,
    color: '#fbbf24',
    description: 'Untouchable. Your name gets brought up in rooms you\'re not even in.',
  },
];

export interface MilestoneResult {
  current: Milestone;
  next: Milestone | null;
  /** 0–1 progress toward the next tier (bottlenecked by the lagging dimension) */
  progress: number;
}

export function getMilestone(totalCalls: number, totalSessions: number): MilestoneResult {
  let current = MILESTONES[0];
  for (const m of MILESTONES) {
    if (totalCalls >= m.minCalls && totalSessions >= m.minSessions) {
      current = m;
    }
  }

  const currentIdx = MILESTONES.indexOf(current);
  const next = currentIdx < MILESTONES.length - 1 ? MILESTONES[currentIdx + 1] : null;

  let progress = 0;
  if (next) {
    const callProgress  = next.minCalls    > 0 ? Math.min(totalCalls    / next.minCalls,    1) : 1;
    const trainProgress = next.minSessions > 0 ? Math.min(totalSessions / next.minSessions, 1) : 1;
    progress = Math.min(callProgress, trainProgress);
  }

  return { current, next, progress };
}

/** Format total seconds as "Xh Ym" or "Ym" */
export function formatTotalTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '<1m';
}
