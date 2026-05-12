import { supabase } from './supabase';

export const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
export const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? ANON_KEY;
}

export function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 30_000): Promise<Response> {
  const controller = new AbortController();
  const callerSignal = init.signal as AbortSignal | undefined;
  // Check already-aborted state before attaching the listener to avoid the race
  // where the caller's signal fires before the listener is registered.
  if (callerSignal?.aborted) {
    controller.abort();
  } else {
    callerSignal?.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}
