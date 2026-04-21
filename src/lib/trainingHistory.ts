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
    const data = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter((item): item is TrainingHistoryEntry =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.scenarioId === 'string' &&
      typeof item.date === 'string'
    );
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
