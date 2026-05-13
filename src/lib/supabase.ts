import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!url || !key) {
  // Log a warning but don't throw — a module-level throw prevents React from mounting,
  // causing a blank dark screen. The app should still render (landing page works without auth).
  console.error('[Pitchbase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — set these in your deployment environment variables');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-anon-key', {
  auth: {
    // Detect OAuth callback tokens in the URL hash/query and exchange them automatically.
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
