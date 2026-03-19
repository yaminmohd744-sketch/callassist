import {
  analyzeTranscript as mockAnalyzeTranscript,
  generateSessionSummary as mockGenerateSessionSummary,
  detectStage,
  STAGE_TIPS,
  getQuickActionSuggestion,
  type Memory,
} from './mockAI';
import type { TranscriptEntry, CallStage, CallConfig, AISuggestion, AIAnalysisResult } from '../types';

export { detectStage, STAGE_TIPS, getQuickActionSuggestion, type Memory };

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function callFunction(name: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
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

type StreamCallback = (s: AISuggestion) => void;

function genId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

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
    const data = await callFunction('analyze-transcript', {
      entry: newEntry,
      transcript: fullTranscript,
      stage: currentStage,
      elapsedSeconds,
      probability: currentProbability,
      objectionsCount: currentObjectionsCount,
      config,
      lastLabel: memory?.lastLabel ?? null,
      language: config?.language ?? 'en-US',
    }) as Record<string, unknown>;

    if (!data.shouldShow) {
      return {
        suggestions: [],
        updatedProbability: currentProbability,
        updatedStage: detectStage(elapsedSeconds),
        updatedObjectionsCount: currentObjectionsCount,
      };
    }

    const suggestion: AISuggestion = {
      id: genId(),
      type: data.type as AISuggestion['type'],
      headline: data.headline as string,
      body: data.body as string,
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
    return mockAnalyzeTranscript(
      newEntry, fullTranscript, currentStage, elapsedSeconds,
      currentProbability, currentObjectionsCount, recentTriggers, config, memory, onStream
    );
  }
}

export async function generateSessionSummary(
  config: CallConfig,
  transcript: TranscriptEntry[],
  suggestions: AISuggestion[],
  closeProbability: number,
  objectionsCount: number
): Promise<{ aiSummary: string; followUpEmail: string; leadScore: number }> {
  try {
    const data = await callFunction('generate-summary', {
      config, transcript, suggestions, closeProbability, objectionsCount,
      language: config.language ?? 'en-US',
    }) as Record<string, unknown>;

    return {
      aiSummary: (data.aiSummary as string) ?? '',
      followUpEmail: (data.followUpEmail as string) ?? '',
      leadScore: typeof data.leadScore === 'number' ? clamp(data.leadScore, 0, 100) : 50,
    };
  } catch (err) {
    console.error('[CallAssist] Summary call failed, using fallback:', err instanceof Error ? err.message : err);
    return mockGenerateSessionSummary(config, transcript, suggestions, closeProbability, objectionsCount);
  }
}
