import type { Meeting } from '../types';

const STORE_KEY = 'pitchbase:meetings';

export function loadMeetings(): Meeting[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as Meeting[];
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[Pitchbase] meetingsStore parse error:', err);
    return [];
  }
}

export function saveMeetings(meetings: Meeting[]): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(meetings)); } catch { /* storage full */ }
}

export function addMeeting(meeting: Meeting): Meeting[] {
  const updated = [meeting, ...loadMeetings()];
  saveMeetings(updated);
  return updated;
}

export function updateMeeting(id: string, patch: Partial<Meeting>): Meeting[] {
  const updated = loadMeetings().map(m => m.id === id ? { ...m, ...patch } : m);
  saveMeetings(updated);
  return updated;
}

export function deleteMeeting(id: string): Meeting[] {
  const updated = loadMeetings().filter(m => m.id !== id);
  saveMeetings(updated);
  return updated;
}
