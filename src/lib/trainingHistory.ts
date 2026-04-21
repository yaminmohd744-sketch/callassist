export interface TrainingHistoryEntry {
  id: string;
  scenarioId: string;
  scenarioLabel: string;
  difficulty: string;
  overallScore: number | null;
  headline: string;
  exchanges: number;
  date: string;
}

const KEY = 'pp-training-history';
const MAX = 30;

export function saveTrainingSession(entry: TrainingHistoryEntry): void {
  const history = getTrainingHistory();
  const updated = [entry, ...history].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* storage full — history not saved */ }
}

export function getTrainingHistory(): TrainingHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as TrainingHistoryEntry[];
  } catch {
    return [];
  }
}

export function clearTrainingHistory(): void {
  localStorage.removeItem(KEY);
}

export function getMonthlySessionCount(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return getTrainingHistory().filter(entry => {
    const d = new Date(entry.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}
