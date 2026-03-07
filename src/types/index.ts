// ─── Configuration ───────────────────────────────────────────────────────────

export interface CallConfig {
  prospectName: string;
  company: string;
  yourPitch: string;
  callGoal: string;
}

// ─── Transcript ──────────────────────────────────────────────────────────────

export type TranscriptSpeaker = 'rep' | 'prospect' | 'system';
export type TranscriptSignal = 'objection' | 'buying-signal' | 'neutral';

export interface TranscriptEntry {
  id: string;
  speaker: TranscriptSpeaker;
  text: string;
  timestampSeconds: number;
  signal: TranscriptSignal;
}

// ─── AI Suggestions ──────────────────────────────────────────────────────────

export type SuggestionType = 'objection-handler' | 'closing-prompt' | 'tip' | 'alert';

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  headline: string;
  body: string;
  triggeredBy: string;
  timestampSeconds: number;
  streaming?: boolean;
}

// ─── Call State ──────────────────────────────────────────────────────────────

export type CallStage = 'opener' | 'discovery' | 'pitch' | 'close';
export type CallStatus = 'standby' | 'active';
export type QuickAction = 'summarize' | 'follow-up-email' | 'export-lead' | 'score-lead';

// ─── AI Analysis Result ───────────────────────────────────────────────────────

export interface AIAnalysisResult {
  suggestions: AISuggestion[];
  updatedProbability: number;
  updatedStage: CallStage;
  updatedObjectionsCount: number;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface CallSession {
  config: CallConfig;
  transcript: TranscriptEntry[];
  suggestions: AISuggestion[];
  durationSeconds: number;
  finalCloseProbability: number;
  objectionsCount: number;
  callStage: CallStage;
  endedAt: string;
  aiSummary: string;
  followUpEmail: string;
  leadScore: number;
}
