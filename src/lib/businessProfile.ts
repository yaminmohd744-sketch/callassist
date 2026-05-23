import { STORAGE_KEYS } from './storageKeys';
import type { BusinessProfile, RepLearningProfile } from '../types';

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

  if (learning && learning.callsAnalyzed >= 3 && learning.aiCoachingFocus) {
    if (parts.length > 0) parts.push('');
    parts.push(`REP COACHING PROFILE (based on last ${learning.callsAnalyzed} calls):`);
    parts.push(`- ${learning.aiCoachingFocus}`);
  }

  return parts.join('\n');
}
