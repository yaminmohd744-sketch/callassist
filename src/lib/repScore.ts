import type { CallSession } from '../types';

export function computeRepScore(session: CallSession): number {
  const objHandlingRate = session.objectionsCount > 0
    ? Math.min(session.suggestions.filter(s => s.type === 'objection-response').length / session.objectionsCount, 1)
    : 1;
  const buyingSignalCount = session.suggestions.filter(s => s.type === 'close-attempt').length;
  const ratio = session.talkRatio ?? 0.5;
  const talkPenalty = ratio > 0.6 ? Math.round((ratio - 0.6) * 100) : 0;
  const raw = Math.round(
    (session.finalCloseProbability * 0.4) +
    (objHandlingRate * 100 * 0.25) +
    (Math.min(buyingSignalCount * 10, 30) * 0.2) +
    20 - talkPenalty
  );
  return Math.min(Math.max(raw, 0), 100);
}

export function scoreTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}
