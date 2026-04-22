// ─── Configuration ───────────────────────────────────────────────────────────

export interface BattlecardEntry {
  id: string;
  type: 'differentiator' | 'competitor' | 'pricing-objection';
  text: string;
}

export interface Battlecard {
  entries: BattlecardEntry[];
}

export interface CallConfig {
  prospectName: string;
  company: string;
  yourPitch: string;
  callGoal: string;
  language: string; // BCP 47 language code, e.g. 'en-US', 'es-ES'
  transparentMode?: boolean;
  battlecard?: Battlecard;
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

export type SuggestionType = 'tip' | 'objection-response' | 'close-attempt' | 'discovery';

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  headline: string;
  body: string;
  triggeredBy: string;
  timestampSeconds: number;
  streaming?: boolean;
  isFallback?: boolean;
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

// ─── Training ────────────────────────────────────────────────────────────────

export type TrainingScenario =
  | 'price-objection'
  | 'not-interested'
  | 'think-it-over'
  | 'send-me-info'
  | 'cold-opener'
  | 'discovery'
  | 'closing'
  | 'random'
  | 'custom';

export type ProspectTone =
  | 'Skeptical'
  | 'Curious'
  | 'Defensive'
  | 'Warm'
  | 'Disengaged'
  | 'Frustrated'
  | 'Excited'
  | 'Hesitant'
  | 'Neutral';

export interface ToneCoaching {
  tone: ProspectTone;
  move: string;
  say: string;
}

export interface TrainingFeedback {
  score: number;
  pros: string[];
  cons: string[];
  idealResponse: string;
  idealReason: string;
  toneCoach?: ToneCoaching;
}

export interface TrainingMessage {
  id: string;
  role: 'prospect' | 'rep';
  text: string;
  prospectTone?: ProspectTone;
  feedback?: TrainingFeedback;
}

export interface TrainingSession {
  scenario: TrainingScenario;
  scenarioDescription: string;
  messages: TrainingMessage[];
  overallScore?: number;
}

export interface SessionSummary {
  headline: string;
  assessment: string;
  strengths: string[];
  improvements: string[];
  keyTakeaway: string;
}

// ─── Coaching ────────────────────────────────────────────────────────────────

export interface CoachingKeyMoment {
  timestampSeconds: number;
  label: string;
  note: string;
}

export interface CoachingItem {
  point: string;
  salesNote: string;
}

export interface CoachingWalkthrough {
  overallVerdict: string;
  whatWentWell: CoachingItem[];
  areasToImprove: CoachingItem[];
  keyMoments: CoachingKeyMoment[];
  nextCallTip: string;
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
  notes: string[];
  talkRatio?: number;
  coaching?: CoachingWalkthrough;
}
