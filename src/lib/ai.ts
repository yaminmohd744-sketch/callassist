import {
  analyzeTranscript as mockAnalyzeTranscript,
  generateSessionSummary as mockGenerateSessionSummary,
  detectStage,
  STAGE_TIPS,
  getQuickActionSuggestion,
  type Memory,
} from './mockAI';
import type { TranscriptEntry, CallStage, CallConfig, AISuggestion, AIAnalysisResult, TranscriptSignal, CoachingWalkthrough } from '../types';

export { detectStage, STAGE_TIPS, getQuickActionSuggestion, type Memory };

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const FETCH_TIMEOUT_MS = 30_000;

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // If caller passed an external signal, propagate its abort into our controller
  (init.signal as AbortSignal | undefined)?.addEventListener('abort', () => controller.abort(), { once: true });
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function callFunction(name: string, body: unknown): Promise<unknown> {
  const res = await fetchWithTimeout(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
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
  onStream?: StreamCallback
): Promise<AIAnalysisResult> {
  try {
    const streamController = new AbortController();
    const streamTimer = setTimeout(() => streamController.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`${FUNCTIONS_BASE}/analyze-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
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
      }),
      signal: streamController.signal,
    });
    clearTimeout(streamTimer);

    if (!res.ok || !res.body) throw new Error(`analyze-transcript returned ${res.status}`);

    const suggestionId = genId();
    let accumulated = '';
    let streamingShown = false;

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
          if (onStream && accumulated.includes('"body"')) {
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

    if (!data.shouldShow) {
      // Remove any streaming placeholder we showed
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
        updatedStage: detectStage(elapsedSeconds),
        updatedObjectionsCount: currentObjectionsCount,
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
      updatedStage: detectStage(elapsedSeconds),
      updatedObjectionsCount: currentObjectionsCount + ((data.objectionsCountDelta as number) ?? 0),
    };
  } catch (err) {
    console.error('[CallAssist] AI call failed, using fallback:', err instanceof Error ? err.message : err);
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
    console.error('[CallAssist] Pitch enhancement failed:', err instanceof Error ? err.message : err);
    return pitch;
  }
}

export async function classifySignalAI(text: string, language: string, abortSignal?: AbortSignal): Promise<TranscriptSignal> {
  try {
    const res = await fetchWithTimeout(
      `${FUNCTIONS_BASE}/classify-signal`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
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
    console.error('[CallAssist] Summary call failed, using fallback:', err instanceof Error ? err.message : err);
    return fallback;
  }
}
