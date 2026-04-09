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
  localStorage.setItem(KEY, JSON.stringify(updated));
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
