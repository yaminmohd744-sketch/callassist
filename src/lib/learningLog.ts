import { STORAGE_KEYS } from './storageKeys';
import { FUNCTIONS_BASE, ANON_KEY, getAuthToken } from './api';
import { genId } from './id';
import type { LearningLogEntry, LogCategory, LogSeverity, RepLearningProfile } from '../types';

const MAX_LOG_ENTRIES = 50;

export function loadLearningLog(): LearningLogEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.learningLog) || '[]');
    return Array.isArray(raw) ? raw as LearningLogEntry[] : [];
  } catch {
    return [];
  }
}

export function saveLearningLog(entries: LearningLogEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.learningLog, JSON.stringify(entries.slice(0, MAX_LOG_ENTRIES)));
}

export function appendLogEntries(newEntries: LearningLogEntry[]): void {
  const existing = loadLearningLog();
  saveLearningLog([...newEntries, ...existing]);
}

// ── Change detection ──────────────────────────────────────────────────────────

interface ProfileChange {
  dimension: string;
  previousValue: number | string | null;
  currentValue: number | string | null;
  direction: 'worse' | 'better' | 'new' | 'changed';
  description: string;
}

const CHANGE_THRESHOLD = 8; // minimum point shift to count as meaningful

export function detectMeaningfulChanges(
  current: RepLearningProfile,
  previous: RepLearningProfile | null,
): ProfileChange[] {
  const changes: ProfileChange[] = [];

  if (!previous) {
    // First profile — report the dominant weakness
    changes.push({
      dimension: current.topWeaknessKey,
      previousValue: null,
      currentValue: current.weaknesses[current.topWeaknessKey],
      direction: 'new',
      description: `First profile generated after ${current.callsAnalyzed} calls. Top weakness: ${current.topWeaknessKey} (score: ${current.weaknesses[current.topWeaknessKey]}).`,
    });
    return changes;
  }

  // Weakness score shifts
  const dims = ['objectionHandling', 'talkRatio', 'closingConfidence', 'discoveryDepth'] as const;
  for (const dim of dims) {
    const prev = previous.weaknesses[dim];
    const curr = current.weaknesses[dim];
    const delta = curr - prev;
    if (Math.abs(delta) >= CHANGE_THRESHOLD) {
      // For talkRatio and weakness scores, higher = worse
      const worse = delta > 0;
      changes.push({
        dimension: dim,
        previousValue: prev,
        currentValue: curr,
        direction: worse ? 'worse' : 'better',
        description: `${dim} score shifted from ${prev} to ${curr} (${delta > 0 ? '+' : ''}${delta} points). ${worse ? 'Getting worse.' : 'Improving.'}`,
      });
    }
  }

  // Trajectory changes
  const trajDims = ['closeProbability', 'talkRatio', 'objectionHandling'] as const;
  for (const dim of trajDims) {
    const prev = previous.trajectories[dim];
    const curr = current.trajectories[dim];
    if (prev !== curr) {
      changes.push({
        dimension: `trajectory.${dim}`,
        previousValue: prev,
        currentValue: curr,
        direction: curr === 'improving' ? 'better' : curr === 'declining' ? 'worse' : 'changed',
        description: `${dim} trajectory changed from ${prev} to ${curr}.`,
      });
    }
  }

  // New recurring improvement areas
  const newAreas = current.recurringImprovementAreas.filter(
    a => !previous.recurringImprovementAreas.includes(a),
  );
  if (newAreas.length > 0) {
    changes.push({
      dimension: 'recurringAreas',
      previousValue: null,
      currentValue: newAreas.join(', '),
      direction: 'new',
      description: `New recurring improvement area detected: ${newAreas.join(', ')}.`,
    });
  }

  return changes;
}

// ── AI-generated entries ──────────────────────────────────────────────────────

export async function generateAndAppendLogEntries(
  current: RepLearningProfile,
  previous: RepLearningProfile | null,
): Promise<void> {
  const changes = detectMeaningfulChanges(current, previous);
  if (changes.length === 0) return;

  try {
    const authToken = await getAuthToken();
    const res = await fetch(`${FUNCTIONS_BASE}/generate-learning-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ currentProfile: current, previousProfile: previous, changes }),
    });

    if (!res.ok) return;

    const data = await res.json() as { entries?: Array<{ headline: string; body: string; category: string; severity: string }> };
    if (!Array.isArray(data.entries)) return;

    const VALID_CATEGORIES: LogCategory[] = ['talk-ratio', 'objection-handling', 'closing', 'discovery', 'trajectory', 'general'];
    const VALID_SEVERITIES: LogSeverity[] = ['finding', 'improvement', 'warning'];

    const stamped: LearningLogEntry[] = data.entries.map(e => ({
      id: genId(),
      timestamp: new Date().toISOString(),
      callsAnalyzed: current.callsAnalyzed,
      category: VALID_CATEGORIES.includes(e.category as LogCategory) ? e.category as LogCategory : 'general',
      severity: VALID_SEVERITIES.includes(e.severity as LogSeverity) ? e.severity as LogSeverity : 'finding',
      headline: e.headline ?? '',
      body: e.body ?? '',
    }));

    appendLogEntries(stamped);
  } catch {
    // Non-critical — log generation failure should never break the app
  }
}
