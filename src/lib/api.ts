import { supabase } from './supabase';

export const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
export const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? ANON_KEY;
}

export function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 30_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  (init.signal as AbortSignal | undefined)?.addEventListener('abort', () => controller.abort(), { once: true });
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}
