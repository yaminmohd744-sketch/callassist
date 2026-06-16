import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './AuthScreen.css';

type Mode = 'sign-in' | 'sign-up' | 'reset';

interface AuthScreenProps {
  onBack?: () => void;
}

// Local server URI used as the OAuth redirect target in Electron.
// A one-shot HTTP server on this port catches the code and forwards it via IPC.
const ELECTRON_REDIRECT_URI = 'http://127.0.0.1:3457';

// Maps Supabase error codes to safe, non-enumerating user-facing messages.
function safeAuthError(err: { message: string; code?: string }): string {
  switch (err.code) {
    case 'invalid_credentials':
      return 'Incorrect email or password.';
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with this email already exists.';
    case 'email_not_confirmed':
      return 'Please confirm your email address before signing in.';
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'weak_password':
      return 'Password is too weak. Please choose a stronger password.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]{2,}\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

export function AuthScreen({ onBack }: AuthScreenProps) {
  const [mode, setMode]           = useState<Mode>('sign-in');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setLoading(false);
      if (err) setError(safeAuthError(err));
      else setMessage('Check your email for a password reset link.');
      return;
    }

    if (mode === 'sign-up') {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    if (mode === 'sign-up') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(safeAuthError(err)); }
      else { setPassword(''); setConfirm(''); setMessage('Check your email to confirm your account.'); }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(safeAuthError(err));
      // on success, useAuth picks up the session change via onAuthStateChange automatically
    }

    setLoading(false);
  }

  async function handleGoogle() {
    clearMessages();
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: ELECTRON_REDIRECT_URI,
        skipBrowserRedirect: true,
      },
    });
    setLoading(false);
    if (err) { setError(safeAuthError(err)); return; }
    if (!data?.url) { setError('Something went wrong. Please try again.'); return; }
    // Validate the URL is a safe HTTPS URL before passing it to the system browser.
    try {
      const parsed = new URL(data.url);
      if (parsed.protocol !== 'https:') throw new Error('insecure');
    } catch {
      setError('Something went wrong. Please try again.');
      return;
    }
    if (window.electronAPI) {
      // Start the local callback server first, then open the browser via the
      // existing proven openExternal IPC. Server forwards ?code= via IPC →
      // useAuth calls exchangeCodeForSession automatically.
      window.electronAPI.startGoogleServer();
      window.electronAPI.openExternal(data.url);
      setMessage('A sign-in window has opened in your browser. Complete sign-in there to continue.');
    } else {
      window.open(data.url, '_blank');
    }
  }

  function switchMode() {
    setMode(m => m === 'sign-in' ? 'sign-up' : 'sign-in');
    clearMessages();
  }

  function goToReset() {
    setMode('reset');
    clearMessages();
  }

  function goToSignIn() {
    setMode('sign-in');
    clearMessages();
  }

  const passwordMismatch = mode === 'sign-up' && confirm.length > 0 && password !== confirm;

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {onBack && (
          <button className="auth-back" onClick={onBack}>← Back</button>
        )}
        <div className="auth-logo">
          PITCHR
        </div>

        <h1 className="auth-title">
          {mode === 'sign-in' ? 'Welcome back.' : mode === 'sign-up' ? 'Create an account.' : 'Reset your password.'}
        </h1>

        {error   && <div id="auth-error-banner" className="auth-error"   role="alert"  aria-live="polite">{error}</div>}
        {message && <div className="auth-message" role="status" aria-live="polite">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-label">EMAIL</label>
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="auth-field">
              <label htmlFor="auth-password" className="auth-label">PASSWORD</label>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {mode === 'sign-in' && (
                <button type="button" className="auth-forgot" onClick={goToReset}>
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {mode === 'sign-up' && (
            <div className="auth-field">
              <label htmlFor="auth-confirm" className="auth-label">CONFIRM PASSWORD</label>
              <input
                id="auth-confirm"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                aria-invalid={passwordMismatch}
                aria-describedby={passwordMismatch ? 'auth-error-banner' : undefined}
                required
              />
            </div>
          )}

          <button
            className="auth-btn auth-btn--primary"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'LOADING...' : mode === 'sign-in' ? 'SIGN IN' : mode === 'sign-up' ? 'SIGN UP' : 'SEND RESET LINK'}
          </button>
        </form>

        {mode !== 'reset' && <div className="auth-divider"><span>or</span></div>}

        {mode !== 'reset' && <button className="auth-btn auth-btn--google" type="button" onClick={handleGoogle} disabled={loading}>
          <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>}

        {mode !== 'reset' ? (
          <p className="auth-toggle">
            {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="auth-toggle__link" onClick={switchMode}>
              {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        ) : (
          <p className="auth-toggle">
            <button type="button" className="auth-toggle__link" onClick={goToSignIn}>
              ← Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
