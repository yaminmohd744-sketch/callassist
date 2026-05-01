const KEY = 'pitchbase_practice_dates';

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDates(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); }
  catch { return new Set(); }
}

export function getActivityDates(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

export function recordPracticeToday(): void {
  const today = toDateStr(new Date());
  const dates = getDates();
  if (!dates.has(today)) {
    dates.add(today);
    localStorage.setItem(KEY, JSON.stringify([...dates]));
  }
}

export function getStreak(): number {
  const dates = getDates();
  if (dates.size === 0) return 0;
  let streak = 0;
  const d = new Date();
  // Don't penalize if today hasn't been practiced yet carry forward from yesterday
  if (!dates.has(toDateStr(d))) d.setDate(d.getDate() - 1);
  while (dates.has(toDateStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
