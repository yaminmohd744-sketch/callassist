import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    // Receives a URL query fragment (everything after #) with access_token & refresh_token.
    // Validates basic JWT shape and exp claim before calling setSession.
    async function handleOAuthFragment(fragment: string) {
      const params = new URLSearchParams(fragment);
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      // Minimal JWT structure check: three base64url segments separated by dots
      const isJwt = (t: string) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t);
      if (!accessToken || !refreshToken || !isJwt(accessToken)) return;
      // Decode payload and verify token is not already expired
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
        const exp = typeof payload.exp === 'number' ? payload.exp : 0;
        if (exp > 0 && exp * 1000 < Date.now()) return; // token already expired — ignore
      } catch {
        return; // malformed payload — ignore
      }
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }

    // Fallback: redirect landed in browser.
    // PKCE flow: code arrives as ?code=... query param — Supabase's detectSessionInUrl
    // exchanges it automatically; just clean the URL so the code isn't bookmarked.
    // Implicit flow (legacy): access_token arrives in the hash fragment.
    const search = window.location.search;
    const hash   = window.location.hash;
    if (search && search.includes('code=')) {
      window.history.replaceState(null, '', window.location.pathname);
    } else if (hash && hash.includes('access_token')) {
      void handleOAuthFragment(hash.slice(1));
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Listen for OAuth fragment forwarded from Electron main process.
    let removeOAuthListener: (() => void) | undefined;
    if (window.electronAPI?.onOAuthCallback) {
      removeOAuthListener = window.electronAPI.onOAuthCallback((fragment) => void handleOAuthFragment(fragment));
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err: unknown) => {
      if (!mounted) return;
      setUser(null);
      setError(err instanceof Error ? err : new Error('Failed to load session'));
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

  return { user, loading, error };
}
