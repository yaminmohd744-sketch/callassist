import type { CallSession } from '../types';

const WEIGHT_CLOSE_PROB     = 0.4;
const WEIGHT_OBJ_HANDLING   = 0.25;
const WEIGHT_BUYING_SIGNALS = 0.2;
const BASELINE_SCORE        = 20;
const SIGNAL_POINTS         = 10;
const SIGNAL_CAP            = 30;
const TALK_RATIO_THRESHOLD  = 0.6;
const TIER_HIGH             = 70;
const TIER_MEDIUM           = 45;

export function computeRepScore(session: CallSession): number {
  const objHandlingRate = session.objectionsCount > 0
    ? Math.min(session.suggestions.filter(s => s.type === 'objection-response').length / session.objectionsCount, 1)
    : 1;
  const buyingSignalCount = session.suggestions.filter(s => s.type === 'close-attempt').length;
  const ratio = session.talkRatio ?? 0.5;
  const talkPenalty = ratio > TALK_RATIO_THRESHOLD ? Math.round((ratio - TALK_RATIO_THRESHOLD) * 100) : 0;
  const raw = Math.round(
    (session.finalCloseProbability * WEIGHT_CLOSE_PROB) +
    (objHandlingRate * 100 * WEIGHT_OBJ_HANDLING) +
    (Math.min(buyingSignalCount * SIGNAL_POINTS, SIGNAL_CAP) * WEIGHT_BUYING_SIGNALS) +
    BASELINE_SCORE - talkPenalty
  );
  return Math.min(Math.max(raw, 0), 100);
}

export function scoreTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= TIER_HIGH) return 'high';
  if (score >= TIER_MEDIUM) return 'medium';
  return 'low';
}
