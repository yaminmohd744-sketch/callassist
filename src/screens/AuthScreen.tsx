import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './AuthScreen.css';

type Mode = 'sign-in' | 'sign-up';

interface AuthScreenProps {
  onBack?: () => void;
  onSignedUp?: () => void;
}

export function AuthScreen({ onBack, onSignedUp }: AuthScreenProps) {
  const [mode, setMode]           = useState<Mode>('sign-in');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === 'sign-up' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (mode === 'sign-up') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); }
      else {
        setMessage('Check your email to confirm your account.');
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      // on success, useAuth picks up the session change automatically
    }

    setLoading(false);
  }

  async function handleGoogle() {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (err) setError(err.message);
  }

  function switchMode() {
    setMode(m => m === 'sign-in' ? 'sign-up' : 'sign-in');
    setError(null);
    setMessage(null);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {onBack && (
          <button className="auth-back" onClick={onBack}>← Back</button>
        )}
        <div className="auth-logo">
          PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span>
        </div>

        <h1 className="auth-title">
          {mode === 'sign-in' ? 'Welcome back.' : 'Create an account.'}
        </h1>

        {error   && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">EMAIL</label>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">PASSWORD</label>
            <input
              className="auth-input"
              type="password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'sign-up' && (
            <div className="auth-field">
              <label className="auth-label">CONFIRM PASSWORD</label>
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
          )}

          <button className="auth-btn auth-btn--primary" type="submit" disabled={loading}>
            {loading ? 'LOADING...' : mode === 'sign-in' ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="auth-btn auth-btn--google" type="button" onClick={handleGoogle} disabled={loading}>
          <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <p className="auth-toggle">
          {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" className="auth-toggle__link" onClick={switchMode}>
            {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
