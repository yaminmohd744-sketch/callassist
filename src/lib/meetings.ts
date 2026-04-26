import { supabase } from './supabase';
import type { Meeting, MeetingStatus } from '../types';

type DbRow = Record<string, unknown>;

function rowToMeeting(r: DbRow): Meeting {
  return {
    id:            r.id as string,
    prospectName:  r.prospect_name as string,
    company:       typeof r.company === 'string' ? r.company : undefined,
    prospectTitle: typeof r.prospect_title === 'string' ? r.prospect_title : undefined,
    platform:      r.platform as Meeting['platform'],
    meetingUrl:    r.meeting_url as string,
    scheduledAt:   r.scheduled_at as string,
    context:       typeof r.context === 'string' ? r.context : undefined,
    status:        r.status as MeetingStatus,
    recallBotId:   typeof r.recall_bot_id === 'string' ? r.recall_bot_id : undefined,
    createdAt:     r.created_at as string,
  };
}

export async function loadMeetings(userId: string): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => rowToMeeting(r as DbRow));
}

export async function saveMeeting(
  meeting: Omit<Meeting, 'id' | 'status' | 'recallBotId' | 'createdAt'>,
  userId: string,
): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id:        userId,
      prospect_name:  meeting.prospectName,
      company:        meeting.company || null,
      prospect_title: meeting.prospectTitle || null,
      platform:       meeting.platform,
      meeting_url:    meeting.meetingUrl,
      scheduled_at:   meeting.scheduledAt,
      context:        meeting.context || null,
      status:         'scheduled',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToMeeting(data as DbRow);
}

export async function updateMeetingStatus(
  id: string,
  userId: string,
  status: MeetingStatus,
  recallBotId?: string,
): Promise<void> {
  const { error } = await supabase
    .from('meetings')
    .update({ status, ...(recallBotId ? { recall_bot_id: recallBotId } : {}) })
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
