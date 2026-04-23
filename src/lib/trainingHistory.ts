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

export const MOCK_TRAINING_HISTORY: TrainingHistoryEntry[] = [
  { id: 'm01', scenarioId: 'po-easy',   scenarioLabel: 'Sticker Shock',      difficulty: 'easy',   overallScore: 8.2, headline: 'Good anchor on value — could have used a specific ROI number earlier.',         exchanges: 6,  date: '2026-01-15T10:20:00Z' },
  { id: 'm02', scenarioId: 'co-medium', scenarioLabel: 'Skeptical Pro',       difficulty: 'medium', overallScore: 7.4, headline: 'Strong opener but lost momentum when prospect pushed back on timing.',           exchanges: 8,  date: '2026-01-18T14:05:00Z' },
  { id: 'm03', scenarioId: 'ni-medium', scenarioLabel: 'Status Quo',          difficulty: 'medium', overallScore: 6.8, headline: 'Struggled to surface the hidden pain — try more open-ended questions first.',    exchanges: 7,  date: '2026-01-22T09:40:00Z' },
  { id: 'm04', scenarioId: 'cl-easy',   scenarioLabel: 'Almost There',        difficulty: 'easy',   overallScore: 9.1, headline: 'Clean close — didn\'t oversell and asked for the commitment at the right moment.', exchanges: 5, date: '2026-01-28T16:30:00Z' },
  { id: 'm05', scenarioId: 'po-hard',   scenarioLabel: 'Cheaper Competitor',  difficulty: 'hard',   overallScore: 5.5, headline: 'Price comparison got away from you — lead with differentiation before defending price.', exchanges: 9, date: '2026-02-03T11:15:00Z' },
  { id: 'm06', scenarioId: 'di-medium', scenarioLabel: 'Guarded',             difficulty: 'medium', overallScore: 7.9, headline: 'Patience paid off — you unlocked the real objection by the 4th exchange.',      exchanges: 8,  date: '2026-02-08T13:00:00Z' },
  { id: 'm07', scenarioId: 'tio-medium',scenarioLabel: 'Team Sign-Off',       difficulty: 'medium', overallScore: 7.1, headline: 'Solid multi-stakeholder framing but missed the chance to offer a trial close.',  exchanges: 7,  date: '2026-02-14T10:50:00Z' },
  { id: 'm08', scenarioId: 'smi-medium',scenarioLabel: 'Email Deflector',     difficulty: 'medium', overallScore: 6.3, headline: 'Good urgency attempt — next time quantify the cost of waiting more specifically.', exchanges: 6, date: '2026-02-19T15:20:00Z' },
  { id: 'm09', scenarioId: 'co-hard',   scenarioLabel: 'Ten Seconds',         difficulty: 'hard',   overallScore: 5.9, headline: 'Hook was too generic — a one-line relevance statement would have bought more time.', exchanges: 4, date: '2026-02-25T09:10:00Z' },
  { id: 'm10', scenarioId: 'po-medium', scenarioLabel: 'Over Budget',         difficulty: 'medium', overallScore: 7.6, headline: 'Smart ROI reframe — pushed back on the budget constraint without being dismissive.', exchanges: 8, date: '2026-03-04T14:45:00Z' },
  { id: 'm11', scenarioId: 'cl-medium', scenarioLabel: 'Last-Minute Doubts',  difficulty: 'medium', overallScore: 8.4, headline: 'Excellent job surfacing the real fear behind the hesitation and resolving it.',   exchanges: 7,  date: '2026-03-10T11:30:00Z' },
  { id: 'm12', scenarioId: 'ni-easy',   scenarioLabel: 'Bad Timing',          difficulty: 'easy',   overallScore: 8.7, headline: 'Perfectly reframed urgency without applying pressure — prospect warmed up fast.',  exchanges: 6,  date: '2026-03-15T16:00:00Z' },
  { id: 'm13', scenarioId: 'di-hard',   scenarioLabel: 'Deflector',           difficulty: 'hard',   overallScore: 6.1, headline: 'You held the discovery frame longer than most — try mirroring before redirecting.', exchanges: 9, date: '2026-03-20T10:20:00Z' },
  { id: 'm14', scenarioId: 'po-easy',   scenarioLabel: 'Sticker Shock',       difficulty: 'easy',   overallScore: 9.0, headline: 'Much sharper value anchor this time — the competitor comparison landed perfectly.', exchanges: 5, date: '2026-03-27T13:40:00Z' },
  { id: 'm15', scenarioId: 'co-easy',   scenarioLabel: 'Open Listener',       difficulty: 'easy',   overallScore: 9.4, headline: 'Textbook opener — relevant, concise, and left space for the prospect to engage.',  exchanges: 6,  date: '2026-04-02T09:55:00Z' },
  { id: 'm16', scenarioId: 'cl-hard',   scenarioLabel: 'Moving Goalposts',    difficulty: 'hard',   overallScore: 6.8, headline: 'Good job not capitulating on price — could have pattern-interrupted the loop earlier.', exchanges: 11, date: '2026-04-08T14:10:00Z' },
  { id: 'm17', scenarioId: 'tio-hard',  scenarioLabel: 'Serial Staller',      difficulty: 'hard',   overallScore: 7.2, headline: 'Creative urgency framing — the mutual action plan idea was the right move.',       exchanges: 8,  date: '2026-04-14T11:00:00Z' },
  { id: 'm18', scenarioId: 'di-easy',   scenarioLabel: 'Opens Up',            difficulty: 'easy',   overallScore: 9.5, headline: 'Outstanding discovery — you found the pain point by the 2nd exchange.',             exchanges: 5,  date: '2026-04-18T15:30:00Z' },
  { id: 'm19', scenarioId: 'smi-hard',  scenarioLabel: 'Brush-Off',           difficulty: 'hard',   overallScore: 5.8, headline: 'The pattern interrupt helped — work on a stronger fallback when they fully disengage.', exchanges: 5, date: '2026-04-20T10:45:00Z' },
  { id: 'm20', scenarioId: 'po-easy',   scenarioLabel: 'Sticker Shock',       difficulty: 'easy',   overallScore: 9.2, headline: 'Consistent improvement — leading with value before mentioning price is now a habit.',  exchanges: 5, date: '2026-04-22T13:20:00Z' },
];

const KEY = 'pp-training-history';
const MAX = 30;

export function saveTrainingSession(entry: TrainingHistoryEntry): void {
  const history = getTrainingHistory();
  const updated = [entry, ...history].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* storage full — history not saved */ }
}

export function getTrainingHistory(): TrainingHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return MOCK_TRAINING_HISTORY;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) return MOCK_TRAINING_HISTORY;
    return data.filter((item): item is TrainingHistoryEntry =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.scenarioId === 'string' &&
      typeof item.date === 'string'
    );
  } catch {
    return MOCK_TRAINING_HISTORY;
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
