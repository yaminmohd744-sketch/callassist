import { useState, useRef, useEffect } from 'react';
import { joinWaitlist } from '../lib/waitlist';
import './FOMOLandingScreen.css';

function StatCounter({ stat }: { stat: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const match = stat.match(/(\d+)/);
    if (!match) { setDisplay(stat); return; }

    const target = parseInt(match[1]);
    const prefix = stat.slice(0, match.index ?? 0);
    const suffix = stat.slice((match.index ?? 0) + match[1].length);

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasRun.current) return;
      hasRun.current = true;
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(`${prefix}${Math.round(eased * target)}${suffix}`);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [stat]);

  return <span ref={ref}>{display}</span>;
}


const WITHOUT = [
  { stat: '67%',  label: 'of objections kill the deal on the spot' },
  { stat: '52%',  label: 'of reps miss quota every single quarter' },
  { stat: '4 hrs', label: 'wasted per week on post-call admin and notes' },
  { stat: '$18k', label: 'in pipeline lost per rep per month to poor follow-up' },
  { stat: '1 in 3', label: 'calls end with no next step ever booked' },
];

const WITH = [
  { stat: '+41%', label: 'close rate increase within the first 30 days' },
  { stat: '3x',   label: 'more pipeline moved to closed-won per week' },
  { stat: '89%',  label: 'of objections handled confidently, first time' },
  { stat: '2x',   label: 'faster deal cycles on AI-coached calls' },
  { stat: '100%', label: 'of calls followed up with a ready-to-send email' },
];

const PAIN_POINTS = [
  {
    icon: '⊘',
    headline: 'You freeze.',
    body: 'They say "we already have something." Your brain goes blank. Three seconds of silence. The deal dies.',
  },
  {
    icon: '◎',
    headline: 'You miss it.',
    body: '"The reporting could be better." That was a buying signal. You didn\'t catch it. They went cold.',
  },
  {
    icon: '↺',
    headline: 'You realise too late.',
    body: 'The perfect response comes to you 20 minutes after the call. Gong confirms what went wrong the next morning.',
  },
];

const OUTCOMES = [
  {
    headline: 'The rebuttal appears before the silence.',
    body: 'Pitchr hears the objection the moment they say it — and puts the exact response on your screen. No freeze. No scramble.',
  },
  {
    headline: 'You never miss a signal to close.',
    body: 'Buying signals flagged in real time. Close probability tracked live. You always know when you\'re winning and when to push.',
  },
  {
    headline: 'Every call saved automatically.',
    body: 'Full transcript, AI summary, lead score, and a ready-to-send follow-up email — the moment you hang up.',
  },
];

function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;
    setErrorMsg('');
    setStatus('loading');
    const result = await joinWaitlist(email, source);
    if (result.ok) { setStatus('success'); return; }
    setStatus('error');
    if (result.reason === 'invalid-email') setErrorMsg('Please enter a valid email address.');
    else if (result.reason === 'already-on-list') setErrorMsg("You're already on the list.");
    else setErrorMsg('Something went wrong. Try again.');
    setTimeout(() => { setStatus('idle'); inputRef.current?.focus(); }, 2000);
  }

  if (status === 'success') {
    return (
      <div className="fl__success">
        <span className="fl__success-icon">✓</span>
        <div>
          <div className="fl__success-title">You're on the list.</div>
          <div className="fl__success-sub">We'll email you the moment access opens.</div>
        </div>
      </div>
    );
  }

  return (
    <form className="fl__form" onSubmit={handleSubmit} noValidate>
      <div className="fl__input-row">
        <input
          ref={inputRef}
          className={`fl__input${status === 'error' ? ' fl__input--error' : ''}`}
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={status === 'loading'}
        />
        <button className="fl__btn" type="submit" disabled={status === 'loading' || !email.trim()}>
          {status === 'loading' ? <span className="fl__spinner" /> : 'Get early access →'}
        </button>
      </div>
      {errorMsg && <p className="fl__error" role="alert">{errorMsg}</p>}
      <p className="fl__fine">No spam. No credit card. Just early access.</p>
    </form>
  );
}

export function FOMOLandingScreen() {
  return (
    <div className="fl">

      {/* Background */}
      <div className="fl__bg" aria-hidden="true">
        <div className="fl__bg-orb fl__bg-orb--1" />
        <div className="fl__bg-orb fl__bg-orb--2" />
        <div className="fl__bg-orb fl__bg-orb--3" />
      </div>

      {/* Nav */}
      <nav className="fl__nav">
        <div className="fl__nav-logo">PITCHR</div>
        <div className="fl__nav-tag">Early Access</div>
      </nav>

      {/* Hero */}
      <section className="fl__hero">

        {/* Left — red floating boxes */}
        <div className="fl__floats fl__floats--left">
          {WITHOUT.map((item, i) => (
            <div key={i} className="fl__float fl__float--bad" style={{ '--i': i } as React.CSSProperties}>
              <span className="fl__float-stat"><StatCounter stat={item.stat} /></span>
              <span className="fl__float-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Center — hero content */}
        <div className="fl__hero-inner">
          <h1 className="fl__hero-h1">
            The best salespeople<br />
            in your market<br />
            <span className="fl__hero-accent">found this before you.</span>
          </h1>

          <p className="fl__hero-sub">
            Pitchr is real-time AI coaching that tells you exactly what to say the moment an objection hits —
            mid-call, not post-mortem. Early access. Not open forever.
          </p>

          <WaitlistForm source="fomo-hero" />
        </div>

        {/* Right — green floating boxes */}
        <div className="fl__floats fl__floats--right">
          {WITH.map((item, i) => (
            <div key={i} className="fl__float fl__float--good" style={{ '--i': i } as React.CSSProperties}>
              <span className="fl__float-stat"><StatCounter stat={item.stat} /></span>
              <span className="fl__float-label">{item.label}</span>
            </div>
          ))}
        </div>

      </section>

      {/* Pain */}
      <section className="fl__pain">
        <div className="fl__section-label">WHAT'S HAPPENING ON YOUR CALLS RIGHT NOW</div>
        <div className="fl__pain-grid">
          {PAIN_POINTS.map((p, i) => (
            <div key={i} className="fl__pain-card" style={{ '--i': i } as React.CSSProperties}>
              <div className="fl__pain-icon">{p.icon}</div>
              <div className="fl__pain-headline">{p.headline}</div>
              <p className="fl__pain-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="fl__divider">
        <span>What changes when you get access</span>
      </div>

      {/* Outcomes */}
      <section className="fl__outcomes">
        {OUTCOMES.map((o, i) => (
          <div key={i} className="fl__outcome" style={{ '--i': i } as React.CSSProperties}>
            <div className="fl__outcome-num">0{i + 1}</div>
            <div className="fl__outcome-body">
              <div className="fl__outcome-headline">{o.headline}</div>
              <p className="fl__outcome-sub">{o.body}</p>
            </div>
          </div>
        ))}
      </section>


    </div>
  );
}
