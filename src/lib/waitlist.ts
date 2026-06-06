const EMAIL_RE = /^[^\s@]+@[^\s@]{2,}\.[a-zA-Z]{2,}$/;

const FUNCTION_URL = `${(import.meta.env.VITE_SUPABASE_URL as string) || ''}/functions/v1/waitlist-signup`;

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'invalid-email' | 'already-on-list' | 'error' };

export async function joinWaitlist(email: string, source = 'landing'): Promise<WaitlistResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return { ok: false, reason: 'invalid-email' };

  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed, source }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (!res.ok || !data.success) {
      if (data.error?.toLowerCase().includes('already')) return { ok: false, reason: 'already-on-list' };
      return { ok: false, reason: 'error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
