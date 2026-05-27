import { supabase } from './supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]{2,}\.[a-zA-Z]{2,}$/;

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'invalid-email' | 'already-on-list' | 'error' };

export async function joinWaitlist(email: string, source = 'landing'): Promise<WaitlistResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return { ok: false, reason: 'invalid-email' };

  const { error } = await supabase
    .from('waitlist')
    .insert({ email: trimmed, source });

  if (!error) return { ok: true };

  // Postgres unique-violation code
  if (error.code === '23505') return { ok: false, reason: 'already-on-list' };

  return { ok: false, reason: 'error' };
}
