import { supabase } from './supabase';
import type { Meeting, MeetingReport, MeetingPlatform, MeetingStatus } from '../types';

const LS_KEY = 'pitchbase:meetings';

interface MeetingRow {
  id: string;
  user_id: string;
  prospect_name: string;
  company: string | null;
  prospect_title: string | null;
  platform: string;
  meeting_url: string;
  scheduled_at: string;
  goal: string;
  context: string | null;
  pitch: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  report: unknown;
  notify_email: boolean;
  created_at: string;
}

function rowToMeeting(r: MeetingRow): Meeting {
  return {
    id:              r.id,
    prospectName:    r.prospect_name,
    company:         r.company ?? undefined,
    prospectTitle:   r.prospect_title ?? undefined,
    platform:        r.platform as MeetingPlatform,
    meetingUrl:      r.meeting_url,
    scheduledAt:     r.scheduled_at,
    goal:            r.goal,
    context:         r.context ?? undefined,
    pitch:           r.pitch ?? undefined,
    status:          r.status as MeetingStatus,
    startedAt:       r.started_at ?? undefined,
    endedAt:         r.ended_at ?? undefined,
    durationSeconds: r.duration_seconds ?? undefined,
    report:          r.report as MeetingReport ?? undefined,
    notifyEmail:     r.notify_email,
    createdAt:       r.created_at,
  };
}

function meetingToRow(m: Meeting, userId: string): Omit<MeetingRow, 'created_at'> {
  return {
    id:               m.id,
    user_id:          userId,
    prospect_name:    m.prospectName,
    company:          m.company ?? null,
    prospect_title:   m.prospectTitle ?? null,
    platform:         m.platform,
    meeting_url:      m.meetingUrl,
    scheduled_at:     m.scheduledAt,
    goal:             m.goal,
    context:          m.context ?? null,
    pitch:            m.pitch ?? null,
    status:           m.status,
    started_at:       m.startedAt ?? null,
    ended_at:         m.endedAt ?? null,
    duration_seconds: m.durationSeconds ?? null,
    report:           m.report ?? null,
    notify_email:     m.notifyEmail,
  };
}

async function migrateFromLocalStorage(userId: string): Promise<void> {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;
  try {
    const meetings = JSON.parse(raw) as Meeting[];
    if (meetings.length === 0) { localStorage.removeItem(LS_KEY); return; }
    const rows = meetings.map(m => meetingToRow(m, userId));
    const { error } = await supabase.from('meetings').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (!error) localStorage.removeItem(LS_KEY);
  } catch {
    // Migration failed silently — localStorage data stays intact
  }
}

export async function loadMeetings(userId: string): Promise<Meeting[]> {
  await migrateFromLocalStorage(userId);
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => rowToMeeting(r as MeetingRow));
}

export async function saveMeeting(meeting: Meeting, userId: string): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meetingToRow(meeting, userId))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToMeeting(data as MeetingRow);
}

export async function updateMeeting(id: string, userId: string, patch: Partial<Meeting>): Promise<void> {
  const patchRow: Record<string, unknown> = {};
  if (patch.prospectName    !== undefined) patchRow.prospect_name    = patch.prospectName;
  if (patch.company         !== undefined) patchRow.company          = patch.company ?? null;
  if (patch.prospectTitle   !== undefined) patchRow.prospect_title   = patch.prospectTitle ?? null;
  if (patch.platform        !== undefined) patchRow.platform         = patch.platform;
  if (patch.meetingUrl      !== undefined) patchRow.meeting_url      = patch.meetingUrl;
  if (patch.scheduledAt     !== undefined) patchRow.scheduled_at     = patch.scheduledAt;
  if (patch.goal            !== undefined) patchRow.goal             = patch.goal;
  if (patch.context         !== undefined) patchRow.context          = patch.context ?? null;
  if (patch.pitch           !== undefined) patchRow.pitch            = patch.pitch ?? null;
  if (patch.status          !== undefined) patchRow.status           = patch.status;
  if (patch.startedAt       !== undefined) patchRow.started_at       = patch.startedAt ?? null;
  if (patch.endedAt         !== undefined) patchRow.ended_at         = patch.endedAt ?? null;
  if (patch.durationSeconds !== undefined) patchRow.duration_seconds = patch.durationSeconds ?? null;
  if (patch.report          !== undefined) patchRow.report           = patch.report ?? null;
  if (patch.notifyEmail     !== undefined) patchRow.notify_email     = patch.notifyEmail;
  const { error } = await supabase
    .from('meetings')
    .update(patchRow)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function deleteMeeting(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
