export interface Milestone {
  id: string;
  label: string;
  badge: string;
  minCalls: number;
  color: string;
  description: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'rookie',
    label: 'Rookie',
    badge: '🔰',
    minCalls: 0,
    color: '#7c8fa6',
    description: 'Just getting started. Every legend began here.',
  },
  {
    id: 'prospect-hunter',
    label: 'Prospect Hunter',
    badge: '🎯',
    minCalls: 10,
    color: '#34d399',
    description: 'You\'re in the game. Consistent activity is building the foundation.',
  },
  {
    id: 'power-dialer',
    label: 'Power Dialer',
    badge: '⚡',
    minCalls: 50,
    color: '#60a5fa',
    description: 'Volume and volume only. You dial when others sleep.',
  },
  {
    id: 'cold-closer',
    label: 'Cold Closer',
    badge: '🧊',
    minCalls: 150,
    color: '#67e8f9',
    description: 'Ice in your veins. Objections don\'t rattle you anymore.',
  },
  {
    id: 'sales-pro',
    label: 'Sales Pro',
    badge: '💼',
    minCalls: 400,
    color: '#a78bfa',
    description: 'This is your craft. You read rooms, control frames, and close on demand.',
  },
  {
    id: 'elite-closer',
    label: 'Elite Closer',
    badge: '💎',
    minCalls: 750,
    color: '#df7afe',
    description: 'Top 1%. Your pipeline is a machine. Prospects feel the difference.',
  },
  {
    id: 'legend',
    label: 'Legend',
    badge: '👑',
    minCalls: 1500,
    color: '#fbbf24',
    description: 'Untouchable. Your name gets brought up in rooms you\'re not even in.',
  },
];

export interface MilestoneResult {
  current: Milestone;
  next: Milestone | null;
  /** 0–1 progress toward the next tier */
  progress: number;
}

export function getMilestone(totalCalls: number): MilestoneResult {
  let current = MILESTONES[0];
  for (const m of MILESTONES) {
    if (totalCalls >= m.minCalls) current = m;
  }

  const currentIdx = MILESTONES.indexOf(current);
  const next = currentIdx < MILESTONES.length - 1 ? MILESTONES[currentIdx + 1] : null;

  const progress = next && next.minCalls > 0
    ? Math.min(totalCalls / next.minCalls, 1)
    : 0;

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
