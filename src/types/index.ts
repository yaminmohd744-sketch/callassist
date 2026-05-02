// ─── Configuration ───────────────────────────────────────────────────────────

export interface CallConfig {
  prospectName: string;
  company: string;
  yourPitch: string;
  callGoal: string;
  language: string; // BCP 47 language code, e.g. 'en-US', 'es-ES'
  // Optional enrichment fields — set during pre-call setup
  prospectTitle?: string;  // their job title / role
  callType?: string;       // 'cold' | 'warm' | 'referral' | 'discovery' | 'demo' | 'negotiation' | 'close'
  priorContext?: string;   // research, previous interactions, expected objections
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
  physicalAction?: string;
  physicalIcon?: string;
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
  phaseLabel?: string;
  prospectTone?: ProspectTone;
}

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

export type CallOutcome = 'converted' | 'pipeline' | 'no-deal' | null;

// ─── Lead ─────────────────────────────────────────────────────────────────────

// ─── CRM Package ──────────────────────────────────────────────────────────────

export type CrmSource = 'salesforce' | 'hubspot' | 'pipedrive' | 'apollo' | 'zoho' | 'custom';

export interface CrmPackage {
  id: string;
  name: string;
  source: CrmSource;
  createdAt: string;
}


export interface Lead {
  id: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  priorContext?: string;
  lastCalledAt?: string;
  callCount: number;
  createdAt: string;
}

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
  outcome?: CallOutcome;
  recordingKey?: string;
}
