import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    function handleOAuthUrl(url: string) {
      // Extract tokens from pitchbase://auth#access_token=...&refresh_token=...
      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) return;
      const params = new URLSearchParams(url.slice(hashIndex + 1));
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }

    // If the URL has OAuth tokens in the hash (fallback: redirect landed in browser),
    // extract and set the session, then clean the URL.
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      handleOAuthUrl('pitchbase://auth' + hash);
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Listen for OAuth callback forwarded from Electron main process
    // (pitchbase:// deep-link intercepted via second-instance handler)
    let removeOAuthListener: (() => void) | undefined;
    if (window.electronAPI?.onOAuthCallback) {
      removeOAuthListener = window.electronAPI.onOAuthCallback(handleOAuthUrl);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      removeOAuthListener?.();
    };
  }, []);

  return { user, loading };
}
