import * as Sentry from '@sentry/react';
import {
  analyzeTranscript as mockAnalyzeTranscript,
  generateSessionSummary as mockGenerateSessionSummary,
  detectStage,
  STAGE_TIPS,
  getQuickActionSuggestion,
  type Memory,
} from './mockAI';
import type { TranscriptEntry, CallStage, CallConfig, AISuggestion, AIAnalysisResult, TranscriptSignal, CoachingWalkthrough } from '../types';
import { FUNCTIONS_BASE, ANON_KEY, getAuthToken, fetchWithTimeout } from './api';

export { detectStage, STAGE_TIPS, getQuickActionSuggestion, type Memory };

async function callFunction(name: string, body: unknown): Promise<unknown> {
  const authToken = await getAuthToken();
  const res = await fetchWithTimeout(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${name} returned ${res.status}: ${text}`);
  }
  return res.json();
}

import { genId } from './id';

type StreamCallback = (s: AISuggestion) => void;

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export async function analyzeTranscript(
  newEntry: TranscriptEntry,
  fullTranscript: TranscriptEntry[],
  currentStage: CallStage,
  elapsedSeconds: number,
  currentProbability: number,
  currentObjectionsCount: number,
  recentTriggers: Map<string, number>,
  config?: CallConfig,
  memory?: Memory,
  onStream?: StreamCallback,
  externalSignal?: AbortSignal
): Promise<AIAnalysisResult> {
  let suggestionId = '';
  let streamingShown = false;
  try {
    const streamController = new AbortController();
    // Propagate caller's abort signal — check already-aborted state first to avoid the race
    // where the signal fires before the listener is attached.
    if (externalSignal?.aborted) {
      streamController.abort();
    } else {
      externalSignal?.addEventListener('abort', () => streamController.abort(), { once: true });
    }
    const streamTimer = setTimeout(() => streamController.abort(), 50_000);
    const authToken = await getAuthToken();
    const res = await fetch(`${FUNCTIONS_BASE}/analyze-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        entry: newEntry,
        transcript: fullTranscript,
        stage: currentStage,
        elapsedSeconds,
        probability: currentProbability,
        objectionsCount: currentObjectionsCount,
        config,
        lastLabel: memory?.lastLabel ?? null,
        language: config?.language ?? 'en-US',
        currentPhaseLabel: memory?.phaseLabel ?? null,
        // Compress entries older than the last 8 into a short summary string so
        // the AI retains full-call context without ballooning the token count.
        callSummary: fullTranscript.length > 8
          ? fullTranscript.slice(0, -8)
              .map(e => `${e.speaker === 'rep' ? 'R' : 'P'}: ${e.text.slice(0, 80)}`)
              .join(' | ')
              .slice(0, 400)
          : '',
      }),
      signal: streamController.signal,
    });
    clearTimeout(streamTimer);

    if (!res.ok || !res.body) throw new Error(`analyze-transcript returned ${res.status}`);

    suggestionId = genId();
    let accumulated = '';
    streamingShown = false;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Parse OpenAI SSE lines: "data: {...}" or "data: [DONE]"
      for (const line of chunk.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
          const token = parsed.choices?.[0]?.delta?.content;
          if (!token) continue;
          accumulated += token;

          // Start streaming as soon as we have enough body text to show.
          // We intentionally do NOT extract type/headline from partial JSON —
          // those fields are only set once the stream is complete (see below).
          if (onStream && accumulated.includes('"body":')) {
            // Strip a trailing bare backslash (incomplete escape at chunk boundary)
            // before running the regex so it doesn't fail to match.
            const safeAccum = accumulated.endsWith('\\') ? accumulated.slice(0, -1) : accumulated;
            const bodyMatch = safeAccum.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
            if (bodyMatch) {
              const partialBody = bodyMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');

              if (!streamingShown && partialBody.length > 6) {
                streamingShown = true;
              }
              if (streamingShown) {
                onStream({
                  id: suggestionId,
                  type: 'tip',   // placeholder — replaced by final parse below
                  headline: '...', // placeholder — replaced by final parse below
                  body: partialBody,
                  triggeredBy: newEntry.text,
                  timestampSeconds: elapsedSeconds,
                  streaming: true,
                });
              }
            }
          }
        } catch { /* incomplete JSON chunk — continue */ }
      }
    }

    // Parse the complete accumulated JSON.
    // Try direct parse first (the stream content should be a single JSON object).
    // Fall back to a minimal bracket-scan only if the response has surrounding whitespace or noise.
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(accumulated.trim()) as Record<string, unknown>;
    } catch {
      const start = accumulated.indexOf('{');
      const end = accumulated.lastIndexOf('}');
      if (start === -1 || end === -1 || end <= start) throw new Error('No JSON in response');
      data = JSON.parse(accumulated.slice(start, end + 1)) as Record<string, unknown>;
    }

    if (typeof data !== 'object' || data === null) throw new Error('Malformed AI response structure');

    const VALID_STAGES: CallStage[] = ['opener', 'discovery', 'pitch', 'close'];
    const aiDetectedStage = VALID_STAGES.includes(data.detectedStage as CallStage)
      ? data.detectedStage as CallStage
      : detectStage(elapsedSeconds);
    const aiPhaseLabel = typeof data.phaseLabel === 'string' ? data.phaseLabel : undefined;
    const VALID_TONES = ['Skeptical','Curious','Defensive','Warm','Disengaged','Frustrated','Excited','Hesitant','Neutral'];
    const aiProspectTone = VALID_TONES.includes(data.prospectTone as string)
      ? data.prospectTone as import('../types').ProspectTone
      : undefined;

    if (!data.shouldShow) {
      if (streamingShown && onStream) {
        onStream({
          id: suggestionId,
          type: 'tip',
          headline: '',
          body: '',
          triggeredBy: newEntry.text,
          timestampSeconds: elapsedSeconds,
          streaming: false,
        });
      }
      return {
        suggestions: [],
        updatedProbability: currentProbability,
        updatedStage: aiDetectedStage,
        updatedObjectionsCount: currentObjectionsCount,
        phaseLabel: aiPhaseLabel,
        prospectTone: aiProspectTone,
      };
    }

    const VALID_TYPES: AISuggestion['type'][] = ['tip', 'objection-response', 'close-attempt', 'discovery'];
    const suggestion: AISuggestion = {
      id: suggestionId,
      type: VALID_TYPES.includes(data.type as AISuggestion['type']) ? data.type as AISuggestion['type'] : 'tip',
      headline: typeof data.headline === 'string' ? data.headline : '',
      body: typeof data.body === 'string' ? data.body : '',
      triggeredBy: newEntry.text,
      timestampSeconds: elapsedSeconds,
      streaming: false,
    };

    if (onStream) onStream(suggestion);

    return {
      suggestions: [suggestion],
      updatedProbability: clamp(currentProbability + ((data.probabilityDelta as number) ?? 0), 5, 95),
      updatedStage: aiDetectedStage,
      updatedObjectionsCount: currentObjectionsCount + ((data.objectionsCountDelta as number) ?? 0),
      phaseLabel: aiPhaseLabel,
      prospectTone: aiProspectTone,
    };
  } catch (err) {
    if (streamingShown && onStream && suggestionId) {
      onStream({ id: suggestionId, type: 'tip', headline: '', body: '', triggeredBy: newEntry.text, timestampSeconds: elapsedSeconds, streaming: false });
    }
    console.error('[Pitchbase] AI call failed, using fallback:', err instanceof Error ? err.message : err);
    Sentry.captureException(err, { tags: { section: 'analyze-transcript' } });
    const fallback = await mockAnalyzeTranscript(
      newEntry, fullTranscript, currentStage, elapsedSeconds,
      currentProbability, currentObjectionsCount, recentTriggers, config, memory, onStream
    );
    return {
      ...fallback,
      suggestions: fallback.suggestions.map((s: AISuggestion) => ({ ...s, isFallback: true })),
    };
  }
}

export async function enhancePitch(
  pitch: string,
  company: string,
  callGoal: string
): Promise<string> {
  try {
    const data = await callFunction('enhance-pitch', { pitch, company, callGoal }) as Record<string, unknown>;
    return (data.enhancedPitch as string) ?? pitch;
  } catch (err) {
    console.error('[Pitchbase] Pitch enhancement failed:', err instanceof Error ? err.message : err);
    Sentry.captureException(err, { tags: { section: 'enhance-pitch' } });
    return pitch;
  }
}

export async function classifySignalAI(text: string, language: string, abortSignal?: AbortSignal): Promise<TranscriptSignal> {
  try {
    const res = await fetchWithTimeout(
      `${FUNCTIONS_BASE}/classify-signal`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${await getAuthToken()}` },
        body: JSON.stringify({ text, language }),
        signal: abortSignal,
      }
    );
    if (!res.ok) return 'neutral';
    const data = await res.json() as Record<string, unknown>;
    const signal = data.signal as string;
    if (signal === 'objection' || signal === 'buying-signal' || signal === 'neutral') return signal;
    return 'neutral';
  } catch {
    return 'neutral';
  }
}

export async function generateSessionSummary(
  config: CallConfig,
  transcript: TranscriptEntry[],
  suggestions: AISuggestion[],
  closeProbability: number,
  objectionsCount: number
): Promise<{ aiSummary: string; followUpEmail: string; leadScore: number; coaching: CoachingWalkthrough }> {
  const fallback = mockGenerateSessionSummary(config, transcript, suggestions, closeProbability, objectionsCount);
  try {
    const data = await callFunction('generate-summary', {
      config, transcript, suggestions, closeProbability, objectionsCount,
      language: config.language ?? 'en-US',
    }) as Record<string, unknown>;

    return {
      aiSummary: (data.aiSummary as string) ?? '',
      followUpEmail: (data.followUpEmail as string) ?? '',
      leadScore: typeof data.leadScore === 'number' ? clamp(data.leadScore, 0, 100) : 50,
      coaching: fallback.coaching,
    };
  } catch (err) {
    console.error('[Pitchbase] Summary call failed, using fallback:', err instanceof Error ? err.message : err);
    Sentry.captureException(err, { tags: { section: 'generate-summary' } });
    return fallback;
  }
}

export interface BattleCard {
  likelyObjections: { objection: string; response: string }[];
  powerQuestions: string[];
  suggestedOpener: string;
  contextInsight: string;
}

export async function generateBattleCard(
  prospectName: string,
  prospectTitle: string,
  company: string,
  callType: string,
  callGoal: string,
  yourPitch: string,
  priorContext: string,
): Promise<BattleCard> {
  const fallback = mockGenerateBattleCard(prospectName, prospectTitle, company, callType, callGoal, yourPitch, priorContext);
  try {
    const data = await callFunction('generate-battle-card', {
      prospectName, prospectTitle, company, callType, callGoal, yourPitch, priorContext,
    }) as Record<string, unknown>;
    if (Array.isArray(data.likelyObjections)) return data as unknown as BattleCard;
    return fallback;
  } catch {
    return fallback;
  }
}

export async function generateProspectSummary(
  session: import('../types').CallSession,
): Promise<string> {
  const fallback = mockGenerateProspectSummary(session);
  try {
    const data = await callFunction('generate-prospect-summary', {
      config: session.config,
      transcript: session.transcript,
      aiSummary: session.aiSummary,
      closeProbability: session.finalCloseProbability,
      callStage: session.callStage,
      durationSeconds: session.durationSeconds,
    }) as Record<string, unknown>;
    return typeof data.summary === 'string' ? data.summary : fallback;
  } catch {
    return fallback;
  }
}

import { mockGenerateBattleCard, mockGenerateProspectSummary } from './mockAI';
