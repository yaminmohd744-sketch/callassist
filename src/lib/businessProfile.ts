import { STORAGE_KEYS } from './storageKeys';
import type { BusinessProfile, RepLearningProfile, SuggestionType, WeaknessScores } from '../types';

interface RawOnboardingData {
  industry?: string;
  productDescription?: string;
  companyName?: string;
  sellingFor?: 'self' | 'company';
  targetCustomer?: string;
  differentiators?: string[];
  commonObjections?: string[];
  experienceLevel?: string;
  dealType?: string;
  topChallenges?: string[];
}

export function loadBusinessProfile(): BusinessProfile | null {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.businessProfile) || 'null');
    if (!raw || typeof raw.industry !== 'string' || typeof raw.productDescription !== 'string') {
      return null;
    }
    return raw as BusinessProfile;
  } catch {
    return null;
  }
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  localStorage.setItem(STORAGE_KEYS.businessProfile, JSON.stringify(profile));
}

export function onboardingToBusinessProfile(data: RawOnboardingData): BusinessProfile {
  return {
    industry:           data.industry ?? '',
    productDescription: data.productDescription ?? '',
    companyName:        data.companyName,
    sellingFor:         data.sellingFor ?? 'self',
    targetCustomer:     data.targetCustomer ?? '',
    differentiators:    Array.isArray(data.differentiators) ? data.differentiators : [],
    commonObjections:   Array.isArray(data.commonObjections) ? data.commonObjections : [],
    experienceLevel:    data.experienceLevel as BusinessProfile['experienceLevel'] ?? undefined,
    dealType:           data.dealType as BusinessProfile['dealType'] ?? undefined,
    topChallenges:      Array.isArray(data.topChallenges) ? data.topChallenges : [],
  };
}

export function buildEnrichedContext(
  business: BusinessProfile | null,
  learning: RepLearningProfile | null,
): string {
  const parts: string[] = [];

  if (business && (business.industry || business.productDescription)) {
    parts.push('REP CONTEXT:');
    if (business.industry && business.productDescription) {
      parts.push(`- Business: ${business.industry} — selling ${business.productDescription}`);
    } else if (business.productDescription) {
      parts.push(`- Selling: ${business.productDescription}`);
    }
    if (business.targetCustomer) {
      parts.push(`- Target customer: ${business.targetCustomer}`);
    }
    if (business.differentiators.length > 0) {
      parts.push(`- Key differentiators: ${business.differentiators.join(' | ')}`);
    }
    if (business.commonObjections.length > 0) {
      parts.push(`- Common objections to expect: ${business.commonObjections.join(', ')}`);
    }

    const EXP_LABEL: Record<string, string> = {
      beginner:     'new to sales (under 1 year)',
      intermediate: '1–3 years experience',
      experienced:  '3–10 years experience',
      veteran:      '10+ years — sales veteran',
    };
    const DEAL_LABEL: Record<string, string> = {
      transactional: 'quick / transactional (same-day to 1 week)',
      'mid-market':  'mid-market (a few weeks)',
      enterprise:    'enterprise (months-long cycle)',
    };
    if (business.experienceLevel) {
      parts.push(`- Rep experience: ${EXP_LABEL[business.experienceLevel] ?? business.experienceLevel}`);
    }
    if (business.dealType) {
      parts.push(`- Typical deal: ${DEAL_LABEL[business.dealType] ?? business.dealType}`);
    }
    if (business.topChallenges && business.topChallenges.length > 0) {
      parts.push(`- Rep wants to improve: ${business.topChallenges.join(', ')}`);
    }
  }

  if (learning && learning.callsAnalyzed >= 3) {
    parts.push('');
    parts.push(`REP PERFORMANCE PROFILE (last ${learning.callsAnalyzed} calls):`);

    // Weakness scores — surface specific numbers so AI can calibrate intensity
    const w = learning.weaknesses;
    const weaknessLines: string[] = [];
    if (w.objectionHandling > 30) weaknessLines.push(`objection handling: handles only ${100 - w.objectionHandling}% of objections (weak)`);
    if (w.talkRatio > 55) weaknessLines.push(`talk ratio: talks ${w.talkRatio}% of the time (too high — needs to listen more)`);
    if (w.closingConfidence > 40) weaknessLines.push(`closing: ${w.closingConfidence}% of calls never reach close stage`);
    if (w.discoveryDepth > 30) weaknessLines.push(`discovery: ${w.discoveryDepth}% of calls stuck in opener stage`);
    if (weaknessLines.length > 0) {
      parts.push(`- Weak areas: ${weaknessLines.join('; ')}`);
    }

    // Trajectories — help AI understand momentum
    const tr = learning.trajectories;
    const trajLines: string[] = [];
    if (tr.closeProbability !== 'stable') trajLines.push(`close probability ${tr.closeProbability}`);
    if (tr.talkRatio !== 'stable') trajLines.push(`talk ratio ${tr.talkRatio}`);
    if (tr.objectionHandling !== 'stable') trajLines.push(`objection handling ${tr.objectionHandling}`);
    if (trajLines.length > 0) {
      parts.push(`- Trends: ${trajLines.join(', ')}`);
    }

    // Top objection types this rep faces
    if (learning.topObjectionTypes.length > 0) {
      parts.push(`- Most common objection categories: ${learning.topObjectionTypes.join(', ')}`);
    }

    // Recurring improvement areas from post-call coaching
    if (learning.recurringImprovementAreas.length > 0) {
      parts.push(`- Recurring coaching feedback: ${learning.recurringImprovementAreas.slice(0, 3).join('; ')}`);
    }

    // Average probability gain per call
    if (typeof learning.avgCallProbabilityGain === 'number') {
      const dir = learning.avgCallProbabilityGain >= 0 ? `+${learning.avgCallProbabilityGain}` : `${learning.avgCallProbabilityGain}`;
      parts.push(`- Avg close probability change per call: ${dir}%`);
    }

    // Suggestion effectiveness — what types of coaching actually move the needle for this rep
    if (learning.suggestionOutcomes && learning.suggestionOutcomes.sampleSize >= 5) {
      const so = learning.suggestionOutcomes;
      const TYPE_LABEL: Record<SuggestionType, string> = {
        'tip': 'general tips',
        'objection-response': 'objection responses',
        'close-attempt': 'close prompts',
        'discovery': 'discovery questions',
      };
      const effectLines = (
        [
          ['close-attempt', so['close-attempt']],
          ['discovery', so['discovery']],
          ['objection-response', so['objection-response']],
          ['tip', so['tip']],
        ] as [SuggestionType, number][]
      )
        .filter(([, v]) => typeof v === 'number')
        .sort((a, b) => b[1] - a[1])
        .map(([type, avg]) => `${TYPE_LABEL[type]} (avg ${avg >= 0 ? '+' : ''}${avg}% prob)`);
      parts.push(`- What works for this rep: ${effectLines.join(' > ')}`);
      parts.push(`- Most effective coaching type: ${TYPE_LABEL[so.mostEffectiveType]}`);
    }

    // Dominant coaching priority — the single most important directive for this rep
    parts.push('');
    parts.push(`COACHING PRIORITY FOR THIS REP: ${buildCoachingPriority(learning.topWeaknessKey, learning.weaknesses, learning.trajectories)}`);
  }

  return parts.join('\n');
}

function buildCoachingPriority(
  topKey: keyof WeaknessScores,
  scores: WeaknessScores,
  trajectories: RepLearningProfile['trajectories'],
): string {
  switch (topKey) {
    case 'closingConfidence': {
      const trend = trajectories.closeProbability === 'declining' ? ' Trend is DECLINING — act urgently.' : '';
      return `This rep rarely asks for the close (${scores.closingConfidence}% of calls never reach close stage).${trend} Watch for ANY moment of positive interest, agreement, or curiosity and IMMEDIATELY prompt a close or next-step question. Don't wait for permission — they need to be pushed here.`;
    }
    case 'objectionHandling': {
      const rate = 100 - scores.objectionHandling;
      const trend = trajectories.objectionHandling === 'declining' ? ' Getting worse.' : trajectories.objectionHandling === 'improving' ? ' Improving.' : '';
      return `This rep only handles ${rate}% of objections effectively.${trend} Every objection is critical — guide them through Acknowledge → Clarify → Reframe. Don't let any objection slide without a response suggestion.`;
    }
    case 'talkRatio': {
      const trend = trajectories.talkRatio === 'improving' ? ' Improving slightly.' : '';
      return `This rep is dominating the conversation (${scores.talkRatio}% talk time).${trend} Whenever they've been talking for more than 2 turns in a row, prompt them to ask a question and go silent. Discovery is their cure.`;
    }
    case 'discoveryDepth': {
      return `This rep pitches too early — ${scores.discoveryDepth}% of calls never leave the opener stage. Aggressively prompt discovery questions in the first half of the call. Hold off on close/pitch suggestions until the prospect has revealed at least one pain point.`;
    }
  }
}
