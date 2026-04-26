import { supabase } from './supabase';
import { MOCK_SESSIONS } from './mockSessions';
import type { CallConfig, CallSession, CallStage, CallOutcome, TranscriptEntry, AISuggestion, CoachingWalkthrough } from '../types';

type DbRow = Record<string, unknown>;

export function rowToSession(row: DbRow): CallSession {
  return {
    config:                (row.config as CallConfig) ?? ({} as CallConfig),
    transcript:            Array.isArray(row.transcript) ? row.transcript as TranscriptEntry[] : [],
    suggestions:           Array.isArray(row.suggestions) ? row.suggestions as AISuggestion[] : [],
    durationSeconds:       typeof row.duration_seconds === 'number' ? row.duration_seconds : 0,
    finalCloseProbability: typeof row.final_close_prob === 'number' ? row.final_close_prob : 50,
    objectionsCount:       typeof row.objections_count === 'number' ? row.objections_count : 0,
    callStage:             (row.call_stage as CallStage) ?? 'opener',
    endedAt:               typeof row.ended_at === 'string' ? row.ended_at : new Date().toISOString(),
    aiSummary:             typeof row.ai_summary === 'string' ? row.ai_summary : '',
    followUpEmail:         typeof row.follow_up_email === 'string' ? row.follow_up_email : '',
    leadScore:             typeof row.lead_score === 'number' ? row.lead_score : 0,
    notes:                 Array.isArray(row.notes) ? row.notes as string[] : [],
    talkRatio:             typeof row.talk_ratio === 'number' ? row.talk_ratio : undefined,
    coaching:              row.coaching as CoachingWalkthrough ?? undefined,
    outcome:               (row.outcome as CallOutcome) ?? null,
  };
}

export function sessionToRow(s: CallSession, userId: string) {
  return {
    user_id:          userId,
    config:           s.config,
    transcript:       s.transcript,
    suggestions:      s.suggestions,
    duration_seconds: s.durationSeconds,
    final_close_prob: s.finalCloseProbability,
    objections_count: s.objectionsCount,
    call_stage:       s.callStage,
    ended_at:         s.endedAt,
    ai_summary:       s.aiSummary,
    follow_up_email:  s.followUpEmail,
    lead_score:       s.leadScore,
    notes:            s.notes,
    talk_ratio:       s.talkRatio ?? null,
    coaching:         s.coaching ?? null,
    outcome:          s.outcome ?? null,
  };
}

export async function loadSessions(userId: string, outcomeMap: Record<string, CallOutcome>): Promise<CallSession[]> {
  const { data, error } = await supabase
    .from('call_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('ended_at', { ascending: false });
  if (error) throw new Error(error.message);
  const real = data ? data.map(r => rowToSession(r as DbRow)) : [];
  const base = real.length > 0 ? real : MOCK_SESSIONS;
  return base.map(s => outcomeMap[s.endedAt] !== undefined ? { ...s, outcome: outcomeMap[s.endedAt] } : s);
}

export async function saveSession(session: CallSession, userId: string): Promise<CallSession> {
  const { data, error } = await supabase
    .from('call_sessions')
    .insert(sessionToRow(session, userId))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToSession(data as DbRow);
}

export async function updateOutcome(userId: string, endedAt: string, outcome: CallOutcome): Promise<void> {
  const { error } = await supabase
    .from('call_sessions')
    .update({ outcome })
    .eq('user_id', userId)
    .eq('ended_at', endedAt);
  if (error) throw new Error(error.message);
}

export async function deleteSession(userId: string, endedAt: string): Promise<void> {
  const { error } = await supabase
    .from('call_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('ended_at', endedAt);
  if (error) throw new Error(error.message);
}
