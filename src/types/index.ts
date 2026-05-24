// ─── Configuration ───────────────────────────────────────────────────────────

export type CallType = 'cold' | 'warm' | 'referral' | 'discovery' | 'demo' | 'negotiation' | 'close';
export type CallPlatform = 'phone' | 'zoom' | 'meet' | 'teams';

export interface CallConfig {
  prospectName: string;
  company: string;
  yourPitch: string;
  callGoal: string;
  language: string; // BCP 47 language code, e.g. 'en-US', 'es-ES'
  // Optional enrichment fields — set during pre-call setup
  prospectTitle?: string;  // their job title / role
  callType?: CallType;
  platform?: CallPlatform;
  priorContext?: string;   // research, previous interactions, expected objections
  repContext?: string;     // Business + learning profile block — ephemeral, not shown in UI
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
  createdAt?: number;
  streaming?: boolean;
  isFallback?: boolean;
  physicalAction?: string;
  physicalIcon?: string;
  probabilityAtTime?: number; // close probability when this suggestion fired
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

// ─── Meeting ──────────────────────────────────────────────────────────────────

export type MeetingPlatform = 'zoom' | 'meet' | 'teams' | 'other';
export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface MeetingFollowUp {
  id: string;
  task: string;
  dueLabel: string;
  done: boolean;
}

export interface MeetingReport {
  summary: string;
  notes: string[];
  followUps: MeetingFollowUp[];
  followUpEmail: string;
  outcome: 'converted' | 'pipeline' | 'no-deal' | null;
}

export interface Meeting {
  id: string;
  prospectName: string;
  company?: string;
  prospectTitle?: string;
  platform: MeetingPlatform;
  meetingUrl: string;
  scheduledAt: string;
  goal: string;
  context?: string;
  pitch?: string;
  status: MeetingStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  report?: MeetingReport;
  notifyEmail: boolean;
  createdAt: string;
}

// ─── Learning Log ────────────────────────────────────────────────────────────

export type LogSeverity = 'finding' | 'improvement' | 'warning';
export type LogCategory = 'talk-ratio' | 'objection-handling' | 'closing' | 'discovery' | 'trajectory' | 'general';

export interface LearningLogEntry {
  id: string;
  timestamp: string;
  callsAnalyzed: number;
  category: LogCategory;
  severity: LogSeverity;
  headline: string;
  body: string;
  expectedChange?: string;
  achieved?: boolean;
}

// ─── Lead & CRM ───────────────────────────────────────────────────────────────

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

// ─── Business Profile ─────────────────────────────────────────────────────────

export interface BusinessProfile {
  industry: string;
  productDescription: string;
  companyName?: string;
  sellingFor: 'self' | 'company';
  targetCustomer: string;
  differentiators: string[];
  commonObjections: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced' | 'veteran';
  dealType?: 'transactional' | 'mid-market' | 'enterprise';
  topChallenges?: string[];
}

// ─── Rep Learning Profile ─────────────────────────────────────────────────────

export interface WeaknessScores {
  objectionHandling: number;
  talkRatio: number;
  closingConfidence: number;
  discoveryDepth: number;
}

export type Trajectory = 'improving' | 'declining' | 'stable';

export interface SuggestionOutcomes {
  // For each suggestion type: avg probability delta observed in the 60s after the suggestion fired
  tip: number;
  'objection-response': number;
  'close-attempt': number;
  discovery: number;
  // Which type has been most effective for this rep
  mostEffectiveType: SuggestionType;
  sampleSize: number;
}

export interface RepLearningProfile {
  updatedAt: string;
  callsAnalyzed: number;
  weaknesses: WeaknessScores;
  topObjectionTypes: string[];
  recurringImprovementAreas: string[];
  trajectories: {
    closeProbability: Trajectory;
    talkRatio: Trajectory;
    objectionHandling: Trajectory;
  };
  aiCoachingFocus: string;
  practiceRecommendation: string;
  topWeaknessKey: keyof WeaknessScores;
  suggestionOutcomes?: SuggestionOutcomes;
  avgCallProbabilityGain?: number; // avg (finalProb - initialProb) across all calls
}

export function isCoachingWalkthrough(v: unknown): v is CoachingWalkthrough {
  return (
    !!v &&
    typeof v === 'object' &&
    typeof (v as Record<string, unknown>).overallVerdict === 'string' &&
    Array.isArray((v as Record<string, unknown>).whatWentWell) &&
    Array.isArray((v as Record<string, unknown>).areasToImprove)
  );
}

export interface CallSession {
  id?: string;
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
