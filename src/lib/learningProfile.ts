import { STORAGE_KEYS } from './storageKeys';
import type { CallSession, RepLearningProfile, WeaknessScores, Trajectory, SuggestionType, SuggestionOutcomes } from '../types';

const ANALYSIS_WINDOW = 15;
const MIN_SESSIONS_FOR_TRAJECTORY = 4;

export function loadLearningProfile(): RepLearningProfile | null {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.learningProfile) || 'null');
    if (!raw || typeof raw.callsAnalyzed !== 'number') return null;
    return raw as RepLearningProfile;
  } catch {
    return null;
  }
}

export function saveLearningProfile(profile: RepLearningProfile): void {
  localStorage.setItem(STORAGE_KEYS.learningProfile, JSON.stringify(profile));
}

export function updateLearningProfile(allSessions: CallSession[]): RepLearningProfile | null {
  if (allSessions.length === 0) return null;
  const profile = computeLearningProfile(allSessions);
  saveLearningProfile(profile);
  return profile;
}

export function computeLearningProfile(sessions: CallSession[]): RepLearningProfile {
  const window = sessions.slice(0, ANALYSIS_WINDOW);

  // ── Weakness scores ───────────────────────────────────────────────────────

  const handlingRates = window.map(s => {
    if (s.objectionsCount <= 0) return 1;
    const handled = s.suggestions.filter(sg => sg.type === 'objection-response').length;
    return Math.min(handled / s.objectionsCount, 1);
  });
  const avgHandled = mean(handlingRates);
  const objectionHandling = Math.round((1 - avgHandled) * 100);

  const sessionsWithRatio = window.filter(s => typeof s.talkRatio === 'number');
  const talkRatio = sessionsWithRatio.length > 0
    ? Math.round(mean(sessionsWithRatio.map(s => s.talkRatio!)) * 100)
    : 50;

  const closingConfidence = Math.round(
    (window.filter(s => s.callStage !== 'close').length / window.length) * 100,
  );

  const discoveryDepth = Math.round(
    (window.filter(s => s.callStage === 'opener').length / window.length) * 100,
  );

  const weaknesses: WeaknessScores = { objectionHandling, talkRatio, closingConfidence, discoveryDepth };

  // ── Top objection types ───────────────────────────────────────────────────

  const improvementTexts = window.flatMap(s => s.coaching?.areasToImprove?.map(a => a.point) ?? []);
  const objectionCategoryKeywords: Record<string, string[]> = {
    'Price / Budget':    ['price', 'budget', 'cost', 'expensive', 'afford', 'money'],
    'Timing':            ['timing', 'time', 'now', 'later', 'busy', 'quarter', 'next year'],
    'Existing Vendor':   ['vendor', 'competitor', 'already using', 'current solution', 'contract'],
    'Interest / Need':   ['interest', 'need', 'relevant', 'priority', 'value', 'benefit'],
  };

  const categoryCounts: Record<string, number> = {};
  for (const text of improvementTexts) {
    const lower = text.toLowerCase();
    for (const [cat, kws] of Object.entries(objectionCategoryKeywords)) {
      if (kws.some(kw => lower.includes(kw))) {
        categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
      }
    }
  }
  const topObjectionTypes = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // ── Recurring improvement areas ───────────────────────────────────────────

  const allPoints = window.flatMap(s => s.coaching?.areasToImprove?.map(a => a.point) ?? []);
  const recurringImprovementAreas = deduplicateNearMatches(allPoints).slice(0, 5);

  // ── Trajectories ──────────────────────────────────────────────────────────

  const trajectories = computeTrajectories(window);

  // ── Top weakness key ─────────────────────────────────────────────────────

  const priority: (keyof WeaknessScores)[] = [
    'objectionHandling', 'talkRatio', 'closingConfidence', 'discoveryDepth',
  ];
  const topWeaknessKey = priority.reduce((best, key) =>
    weaknesses[key] > weaknesses[best] ? key : best,
  );

  // ── Coaching focus & recommendation ──────────────────────────────────────

  const aiCoachingFocus = buildCoachingFocus(topWeaknessKey, weaknesses);
  const practiceRecommendation = buildPracticeRecommendation(topWeaknessKey);

  const suggestionOutcomes = computeSuggestionOutcomes(window);
  const avgCallProbabilityGain = computeAvgProbGain(window);

  return {
    updatedAt: new Date().toISOString(),
    callsAnalyzed: window.length,
    weaknesses,
    topObjectionTypes,
    recurringImprovementAreas,
    trajectories,
    aiCoachingFocus,
    practiceRecommendation,
    topWeaknessKey,
    suggestionOutcomes,
    avgCallProbabilityGain,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function computeTrajectories(sessions: CallSession[]): RepLearningProfile['trajectories'] {
  const stable: RepLearningProfile['trajectories'] = {
    closeProbability: 'stable',
    talkRatio: 'stable',
    objectionHandling: 'stable',
  };
  if (sessions.length < MIN_SESSIONS_FOR_TRAJECTORY) return stable;

  // Reverse to get chronological order (sessions arrive newest-first)
  const chron = [...sessions].reverse();
  const half = Math.floor(chron.length / 2);
  const first = chron.slice(0, half);
  const second = chron.slice(half);

  const trajectory = (firstMean: number, secondMean: number, higherIsBetter: boolean): Trajectory => {
    const delta = secondMean - firstMean;
    if (Math.abs(delta) < 5) return 'stable';
    const positive = delta > 0;
    return (higherIsBetter ? positive : !positive) ? 'improving' : 'declining';
  };

  const firstHandling = handlingRateMean(first);
  const secondHandling = handlingRateMean(second);

  const firstRatioSessions = first.filter(s => typeof s.talkRatio === 'number');
  const secondRatioSessions = second.filter(s => typeof s.talkRatio === 'number');

  return {
    closeProbability: trajectory(
      mean(first.map(s => s.finalCloseProbability)),
      mean(second.map(s => s.finalCloseProbability)),
      true,
    ),
    talkRatio: firstRatioSessions.length > 0 && secondRatioSessions.length > 0
      ? trajectory(
          mean(firstRatioSessions.map(s => s.talkRatio! * 100)),
          mean(secondRatioSessions.map(s => s.talkRatio! * 100)),
          false, // lower talk ratio is better
        )
      : 'stable',
    objectionHandling: trajectory(firstHandling * 100, secondHandling * 100, true),
  };
}

function handlingRateMean(sessions: CallSession[]): number {
  if (sessions.length === 0) return 0;
  const rates = sessions.map(s => {
    if (s.objectionsCount <= 0) return 1;
    return Math.min(s.suggestions.filter(sg => sg.type === 'objection-response').length / s.objectionsCount, 1);
  });
  return mean(rates);
}

function deduplicateNearMatches(texts: string[]): string[] {
  const seen: string[] = [];
  for (const text of texts) {
    const words = new Set(text.toLowerCase().split(/\s+/));
    const isDuplicate = seen.some(s => {
      const sWords = new Set(s.toLowerCase().split(/\s+/));
      const overlap = [...words].filter(w => sWords.has(w)).length;
      return overlap / Math.max(words.size, sWords.size) > 0.5;
    });
    if (!isDuplicate) seen.push(text);
  }
  return seen;
}

function buildCoachingFocus(key: keyof WeaknessScores, scores: WeaknessScores): string {
  switch (key) {
    case 'objectionHandling': {
      const rate = 100 - scores.objectionHandling;
      return `You're handling about ${rate}% of objections. Use the Acknowledge-Clarify-Reframe pattern — don't move forward until the objection is genuinely resolved.`;
    }
    case 'talkRatio':
      return `Your talk ratio is around ${scores.talkRatio}% — you're dominating the conversation. Ask an open-ended question then stay silent for at least 5 seconds after asking it.`;
    case 'closingConfidence':
      return `You rarely reach the closing stage. After your pitch lands, try an assumptive close: "Based on what you've told me, sounds like this could work — want to talk next steps?"`;
    case 'discoveryDepth':
      return `Most of your calls skip discovery. Always spend the first 5 minutes asking about their current situation and pain points before pitching anything.`;
  }
}

function buildPracticeRecommendation(key: keyof WeaknessScores): string {
  switch (key) {
    case 'objectionHandling':  return 'Practice objection handling — your responses are your weakest area right now.';
    case 'talkRatio':          return 'Let the prospect talk more — aim for under 50% talk time.';
    case 'closingConfidence':  return 'Work on your closing — you rarely reach the close stage.';
    case 'discoveryDepth':     return 'Start calls with more discovery questions before pitching.';
  }
}

function computeAvgProbGain(sessions: CallSession[]): number {
  if (sessions.length === 0) return 0;
  const gains = sessions.map(s => s.finalCloseProbability - 50); // baseline 50%
  return Math.round(mean(gains));
}

function computeSuggestionOutcomes(sessions: CallSession[]): SuggestionOutcomes | undefined {
  // Collect all suggestions that have probabilityAtTime set (new tracking field)
  const typed: Record<SuggestionType, number[]> = {
    'tip': [],
    'objection-response': [],
    'close-attempt': [],
    'discovery': [],
  };

  for (const session of sessions) {
    const finalProb = session.finalCloseProbability;
    const suggestions = session.suggestions.filter(s => typeof s.probabilityAtTime === 'number');
    if (suggestions.length === 0) continue;

    // Sort by timestamp so we can estimate the probability trajectory per suggestion
    const sorted = [...suggestions].sort((a, b) => a.timestampSeconds - b.timestampSeconds);

    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i];
      const probAtTime = s.probabilityAtTime!;
      // Estimate prob ~60s later: use next suggestion's probabilityAtTime if within 90s, else use finalProb
      const next = sorted[i + 1];
      const probAfter = next && (next.timestampSeconds - s.timestampSeconds) <= 90
        ? next.probabilityAtTime!
        : finalProb;
      const delta = probAfter - probAtTime;
      typed[s.type].push(delta);
    }
  }

  const totalSamples = Object.values(typed).reduce((sum, arr) => sum + arr.length, 0);
  if (totalSamples < 5) return undefined; // not enough data yet

  const avgs: Record<SuggestionType, number> = {
    'tip': typed['tip'].length > 0 ? Math.round(mean(typed['tip'])) : 0,
    'objection-response': typed['objection-response'].length > 0 ? Math.round(mean(typed['objection-response'])) : 0,
    'close-attempt': typed['close-attempt'].length > 0 ? Math.round(mean(typed['close-attempt'])) : 0,
    'discovery': typed['discovery'].length > 0 ? Math.round(mean(typed['discovery'])) : 0,
  };

  const mostEffectiveType = (Object.entries(avgs) as [SuggestionType, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    ...avgs,
    mostEffectiveType,
    sampleSize: totalSamples,
  };
}
