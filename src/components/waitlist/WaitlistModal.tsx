import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './WaitlistModal.css';

interface WaitlistResult {
  referral_code: string;
  position: number;
  referral_count: number;
  already_joined?: boolean;
}

interface Props {
  onClose: () => void;
}

// Read ?ref=CODE from URL on first load
function getRefFromUrl(): string {
  try {
    return new URLSearchParams(window.location.search).get('ref') ?? '';
  } catch { return ''; }
}

const FUNCTION_URL = 'https://ovxajejzqaktpomyadgo.supabase.co/functions/v1/waitlist-signup';

export function WaitlistModal({ onClose }: Props) {
  const [step, setStep]         = useState<'form' | 'success'>('form');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [result, setResult]     = useState<WaitlistResult | null>(null);
  const [copied, setCopied]     = useState(false);
  const emailRef                = useRef<HTMLInputElement>(null);

  // Pre-fill email if the user is logged in via Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
      if (data.user?.user_metadata?.full_name) setName(data.user.user_metadata.full_name);
    }).catch(() => {});
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          ref: getRefFromUrl(),
          source: 'landing',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setResult(data);
        setStep('success');
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(`https://pitchr.org?ref=${result.referral_code}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const referralUrl = result ? `https://pitchr.org?ref=${result.referral_code}` : '';

  return (
    <div className="wl-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Join the Pitchr waitlist">
      <div className="wl-modal">
        <button className="wl-close" onClick={onClose} aria-label="Close">✕</button>

        {step === 'form' && (
          <>
            <div className="wl-badge">Early access</div>
            <h2 className="wl-title">Join the waitlist</h2>
            <p className="wl-sub">Be first in line when Pitchr opens. Early members get a founding discount locked in for life.</p>

            <form className="wl-form" onSubmit={handleSubmit}>
              <div className="wl-field">
                <label className="wl-label" htmlFor="wl-name">Name <span className="wl-optional">(optional)</span></label>
                <input
                  id="wl-name"
                  className="wl-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="wl-field">
                <label className="wl-label" htmlFor="wl-email">Email</label>
                <input
                  id="wl-email"
                  ref={emailRef}
                  className="wl-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && <p className="wl-error">{error}</p>}
              <button className="wl-submit" type="submit" disabled={loading}>
                {loading ? <span className="wl-spinner" /> : 'Reserve my spot →'}
              </button>
            </form>

            <p className="wl-note">No spam. One email to confirm your spot, updates when we launch.</p>
          </>
        )}

        {step === 'success' && result && (
          <>
            <div className="wl-success-icon">✓</div>
            <h2 className="wl-title">
              {result.already_joined ? "You're already on the list!" : "You're in!"}
            </h2>

            <div className="wl-position-card">
              <span className="wl-position-label">Your waitlist position</span>
              <span className="wl-position-num">#{result.position}</span>
              {result.referral_count > 0 && (
                <span className="wl-referred">
                  +{result.referral_count} referred — you've moved up!
                </span>
              )}
            </div>

            <div className="wl-referral-block">
              <p className="wl-referral-title">Move up the list →</p>
              <p className="wl-referral-sub">Share your link. Every signup through it bumps you higher.</p>
              <div className="wl-referral-url">{referralUrl}</div>
              <div className="wl-referral-actions">
                <button className="wl-copy-btn" onClick={copyLink}>
                  {copied ? '✓ Copied!' : 'Copy link'}
                </button>
                <a
                  className="wl-share-btn wl-share-btn--twitter"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just joined the @pitchrdotorg waitlist — the AI coach that tells you what to say on every call, in real time.\n\nJoin me: ${referralUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on X
                </a>
                <a
                  className="wl-share-btn wl-share-btn--linkedin"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="wl-perks">
              <div className="wl-perk">→ App preview before anyone else</div>
              <div className="wl-perk">→ Early access 2 weeks before public launch</div>
              <div className="wl-perk">→ Founding member discount locked in for life</div>
            </div>

            <button className="wl-done-btn" onClick={onClose}>Done</button>
          </>
        )}
      </div>
    </div>
  );
}
