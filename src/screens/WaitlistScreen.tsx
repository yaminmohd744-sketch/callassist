import { useState, useRef } from 'react';
import { joinWaitlist } from '../lib/waitlist';
import './WaitlistScreen.css';

interface WaitlistScreenProps {
  onBack?: () => void;
}

const SOCIAL_PROOF_COUNT = 1_847;

const FEATURES = [
  { icon: '◎', text: 'Real-time objection coaching — mid-call, not post-mortem' },
  { icon: '✦', text: 'Works on phone calls, Zoom, Teams, and Meet' },
  { icon: '⊕', text: 'Coaches in 10 languages — not just English' },
  { icon: '◈', text: 'Body language AI reads your confidence in real time' },
  { icon: '↗', text: 'Built-in CRM — every call saved automatically' },
];

export function WaitlistScreen({ onBack }: WaitlistScreenProps) {
  const [email, setEmail]         = useState('');
  const [status, setStatus]       = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;
    setErrorMsg('');
    setStatus('loading');

    const result = await joinWaitlist(email, 'waitlist-page');

    if (result.ok) {
      setStatus('success');
      return;
    }

    setStatus('error');
    if (result.reason === 'invalid-email') {
      setErrorMsg('Please enter a valid email address.');
    } else if (result.reason === 'already-on-list') {
      setErrorMsg("You're already on the list. We'll be in touch.");
    } else {
      setErrorMsg('Something went wrong. Please try again.');
    }

    setTimeout(() => { setStatus('idle'); inputRef.current?.focus(); }, 2000);
  }

  return (
    <div className="wl">

      {onBack && (
        <button className="wl__back" onClick={onBack}>← Back</button>
      )}

      <div className="wl__bg">
        <div className="wl__bg-orb wl__bg-orb--1" />
        <div className="wl__bg-orb wl__bg-orb--2" />
      </div>

      <div className="wl__content">

        {/* Badge */}
        <div className="wl__badge">🎯 Coming to Windows — early access open</div>

        {/* Headline */}
        <h1 className="wl__headline">
          The unfair advantage<br />
          <span className="wl__headline-accent">on every sales call.</span>
        </h1>

        <p className="wl__sub">
          Real-time AI coaching. Mid-call, not post-mortem. Works on phone calls, Zoom, Teams —
          in 10 languages. Join the waitlist and be first in.
        </p>

        {/* Social proof */}
        <div className="wl__social-proof">
          <div className="wl__avatars">
            {['S','J','M','A','R'].map((letter, i) => (
              <div key={i} className={`wl__avatar wl__avatar--${i + 1}`}>{letter}</div>
            ))}
          </div>
          <span className="wl__social-text">
            <strong>{SOCIAL_PROOF_COUNT.toLocaleString()}</strong> sales reps already on the list
          </span>
        </div>

        {/* Form */}
        {status === 'success' ? (
          <div className="wl__success">
            <div className="wl__success-icon">✓</div>
            <div className="wl__success-title">You're on the list.</div>
            <p className="wl__success-body">
              We'll email you the moment early access opens. In the meantime — tell every rep you know.
            </p>
          </div>
        ) : (
          <form className="wl__form" onSubmit={handleSubmit} noValidate>
            <div className="wl__input-row">
              <input
                ref={inputRef}
                className={`wl__input${status === 'error' ? ' wl__input--error' : ''}`}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={status === 'loading'}
              />
              <button
                className="wl__btn"
                type="submit"
                disabled={status === 'loading' || !email.trim()}
              >
                {status === 'loading' ? (
                  <span className="wl__spinner" />
                ) : (
                  'Join the waitlist →'
                )}
              </button>
            </div>
            {errorMsg && (
              <p className="wl__error" role="alert">{errorMsg}</p>
            )}
            <p className="wl__fine">No spam. No credit card. Just early access.</p>
          </form>
        )}

        {/* Feature list */}
        <div className="wl__features">
          {FEATURES.map((f, i) => (
            <div key={i} className="wl__feature" style={{ '--i': i } as React.CSSProperties}>
              <span className="wl__feature-icon" aria-hidden="true">{f.icon}</span>
              <span className="wl__feature-text">{f.text}</span>
            </div>
          ))}
        </div>


      </div>

    </div>
  );
}
