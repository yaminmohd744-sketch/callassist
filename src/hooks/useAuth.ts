import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Receives a URL query fragment (everything after #) with access_token & refresh_token.
    // Validates basic JWT shape before calling setSession.
    function handleOAuthFragment(fragment: string) {
      const params = new URLSearchParams(fragment);
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      // Minimal JWT structure check: three base64url segments separated by dots
      const isJwt = (t: string) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t);
      if (accessToken && refreshToken && isJwt(accessToken)) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }

    // Fallback: redirect landed in browser — extract fragment and clean URL immediately.
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      handleOAuthFragment(hash.slice(1));
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Listen for OAuth fragment forwarded from Electron main process.
    let removeOAuthListener: (() => void) | undefined;
    if (window.electronAPI?.onOAuthCallback) {
      removeOAuthListener = window.electronAPI.onOAuthCallback(handleOAuthFragment);
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
      try { removeOAuthListener?.(); } finally { subscription.unsubscribe(); }
    };
  }, []);

  return { user, loading };
}
