import { useState, useEffect } from 'react';
import './LandingScreen.css';

interface LandingScreenProps {
  onGetStarted: () => void;
}

const DEMO_FRAMES = [
  { type: 'status',   text: '● ACTIVE  02:14  OBJECTIONS 2  CLOSE PROB 68%' },
  { type: 'prospect', text: 'PROSPECT: "We already have a tool for that..."' },
  { type: 'ai',       badge: 'OBJECTION DETECTED', badgeColor: 'red',
    body: 'Competitor Objection - "That\'s great, what do you love most about it? And what\'s the one thing you wish it did better?"' },
  { type: 'status',   text: 'Signal: Objection neutralized  +6% close probability' },
  { type: 'prospect', text: 'PROSPECT: "Honestly, the reporting could be better..."' },
  { type: 'ai',       badge: 'BUYING SIGNAL', badgeColor: 'green',
    body: 'Pain confirmed - "So if I showed you exactly how we fix that, would you be open to a 20-min demo this week?"' },
  { type: 'status',   text: 'Close probability: 81%  ↑  Stage: CLOSE' },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time coaching',
    desc: 'AI whispers the perfect response the moment your prospect speaks. Objection handlers, closing prompts, and discovery questions - live.',
  },
  {
    icon: '◈',
    title: 'Practice scenarios',
    desc: 'Practice against an AI prospect that fights back. 8 scenarios with 3 sub-scenarios each - cold openers, objections, discovery, closing - before every call.',
  },
  {
    icon: '🎓',
    title: 'AI Sales Academy',
    desc: 'Structured sales curriculum from beginner to advanced. Track your score across 9 lessons, watch your improvement over time, and master every skill.',
  },
  {
    icon: '🌍',
    title: '10 languages',
    desc: 'Sell in English, Spanish, French, Portuguese, German, Italian, Dutch, Mandarin, Japanese, or Arabic. AI coaches in your language.',
  },
  {
    icon: '↗',
    title: 'Built-in CRM',
    desc: 'Every call is automatically saved to your built-in CRM. View all contacts, lead scores, AI summaries, and follow-up emails in one place.',
  },
  {
    icon: '◎',
    title: 'Post-call analysis',
    desc: 'Full transcript, AI summary, lead score, and a ready-to-send personalised follow-up email - generated the moment you hang up.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Set up your call',
    desc: 'Enter the prospect\'s name, your pitch, call goal, and language. Takes 30 seconds.',
  },
  {
    num: '02',
    title: 'Start the call',
    desc: 'AI listens in real time. Objections, buying signals, and stage changes are detected automatically.',
  },
  {
    num: '03',
    title: 'Close the deal',
    desc: 'Act on live coaching prompts. End the call - get the AI summary and everything saved to your CRM automatically.',
  },
];

const LANGUAGES = [
  { country: 'us', label: 'English' },
  { country: 'es', label: 'Spanish' },
  { country: 'fr', label: 'French' },
  { country: 'br', label: 'Portuguese' },
  { country: 'de', label: 'German' },
  { country: 'it', label: 'Italian' },
  { country: 'nl', label: 'Dutch' },
  { country: 'cn', label: 'Mandarin' },
  { country: 'jp', label: 'Japanese' },
  { country: 'sa', label: 'Arabic' },
];

const COMPARE_ROWS = [
  { feature: 'Real-time objection coaching',   us: true,  them: true  },
  { feature: 'AI training / practice mode',    us: true,  them: true  },
  { feature: 'Multi-language coaching',        us: true,  them: false, note: 'English only' },
  { feature: 'Built-in CRM (no token needed)',  us: true,  them: false, note: 'Requires 3rd-party CRM' },
  { feature: 'Works on phone calls',           us: true,  them: false, note: 'Meetings only' },
  { feature: 'All browsers (no extension)',    us: true,  them: false, note: 'Chrome only' },
  { feature: '7-day money-back guarantee',     us: true,  them: false, note: 'No refunds ever' },
  { feature: 'Transparent pricing',            us: true,  them: true  },
];

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
  const [visibleFrames, setVisibleFrames] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (visibleFrames >= DEMO_FRAMES.length) return;
    const t = setTimeout(() => setVisibleFrames(v => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visibleFrames]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <div className="lp">

      {/* ── Nav ── */}
      <nav className="lp__nav">
        <div className="lp__nav-inner">
          <div className="lp__nav-logo">◎ CALL<span>ASSIST</span></div>

          <div className={`lp__nav-links ${menuOpen ? 'lp__nav-links--open' : ''}`}>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('training')}>Training</button>
            <button onClick={() => scrollTo('languages')}>Languages</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
          </div>

          <div className="lp__nav-actions">
            <button className="lp__nav-signin" onClick={onGetStarted}>Sign In</button>
            <button className="lp__nav-cta" onClick={onGetStarted}>Get Started Free</button>
            <button className="lp__nav-burger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp__hero">
        <div className="lp__hero-left">
          <div className="lp__badge">🎯 Real-time AI sales coaching</div>
          <h1 className="lp__hero-h1">
            Your AI wingman<br />
            <span className="lp__hero-accent">on every sales call.</span>
          </h1>
          <p className="lp__hero-sub">
            Real-time coaching. Training mode. Post-call AI analysis. Works on phone calls,
            Zoom, Teams, Meet - in 10 languages. No downloads, no extensions.
          </p>
          <div className="lp__hero-actions">
            <button className="lp__btn lp__btn--primary" onClick={onGetStarted}>
              ▶ Start for Free
            </button>
            <button className="lp__btn lp__btn--ghost" onClick={() => scrollTo('how-it-works')}>
              See how it works →
            </button>
          </div>
          <p className="lp__hero-note">
            ✓ No credit card required &nbsp;·&nbsp; ✓ 7-day money-back guarantee
          </p>
        </div>

        <div className="lp__hero-right">
          <div className="lp__terminal">
            <div className="lp__terminal-bar">
              <span className="lp__dot lp__dot--red" />
              <span className="lp__dot lp__dot--yellow" />
              <span className="lp__dot lp__dot--green" />
              <span className="lp__terminal-title">CALLASSIST - LIVE</span>
            </div>
            <div className="lp__terminal-body">
              {DEMO_FRAMES.slice(0, visibleFrames).map((frame, i) => (
                <div key={i} className={`lp__tline lp__tline--${frame.type} ${i === visibleFrames - 1 ? 'lp__tline--new' : ''}`}>
                  {frame.type === 'ai' ? (
                    <div className="lp__tline-ai-card">
                      <span className={`lp__tline-badge lp__tline-badge--${frame.badgeColor}`}>{frame.badge}</span>
                      <span className="lp__tline-ai-body">{frame.body}</span>
                    </div>
                  ) : (
                    frame.text
                  )}
                </div>
              ))}
              {visibleFrames < DEMO_FRAMES.length && <div className="lp__cursor">_</div>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="lp__trust">
        <div className="lp__trust-item">✓ Chrome · Firefox · Safari · Edge</div>
        <div className="lp__trust-sep" />
        <div className="lp__trust-item">✓ 7-day money-back guarantee</div>
        <div className="lp__trust-sep" />
        <div className="lp__trust-item">✓ No downloads or extensions</div>
        <div className="lp__trust-sep" />
        <div className="lp__trust-item">✓ 10 languages supported</div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp__section">
        <div className="lp__section-label">FEATURES</div>
        <h2 className="lp__section-h2">Everything you need to close more deals</h2>
        <div className="lp__features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="lp__feature-card">
              <div className="lp__feature-icon">{f.icon}</div>
              <div className="lp__feature-title">{f.title}</div>
              <div className="lp__feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="lp__section lp__section--alt">
        <div className="lp__section-label">HOW IT WORKS</div>
        <h2 className="lp__section-h2">From setup to close in 3 steps</h2>
        <div className="lp__steps">
          {STEPS.map((s, i) => (
            <div key={i} className="lp__step">
              <div className="lp__step-num">{s.num}</div>
              <div className="lp__step-title">{s.title}</div>
              <div className="lp__step-desc">{s.desc}</div>
              {i < STEPS.length - 1 && <div className="lp__step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Training mode highlight ── */}
      <section id="training" className="lp__section">
        <div className="lp__section-label">TRAINING MODE</div>
        <h2 className="lp__section-h2">Two ways to train. One goal: more closed deals.</h2>
        <div className="lp__training-modes">

          <div className="lp__training-mode-card">
            <div className="lp__training-mode-icon">◈</div>
            <div className="lp__training-mode-title">Practice Scenarios</div>
            <p className="lp__training-mode-desc">
              Pick any scenario and jump straight into a live AI roleplay. 8 scenarios with Easy / Medium / Hard sub-scenarios - cold openers, price objections, discovery, closing, and more.
            </p>
            <ul className="lp__split-list">
              <li>Cold call openers</li>
              <li>Price objection handling</li>
              <li>Think it over / stalling</li>
              <li>Discovery questions</li>
              <li>Closing techniques</li>
              <li>Random AI-generated scenarios</li>
            </ul>
          </div>

          <div className="lp__training-mode-card lp__training-mode-card--academy">
            <div className="lp__training-mode-badge">NEW</div>
            <div className="lp__training-mode-icon">🎓</div>
            <div className="lp__training-mode-title">AI Sales Academy</div>
            <p className="lp__training-mode-desc">
              A structured curriculum that teaches sales from scratch. Track your scores across 9 lessons, watch your improvement rep by rep, and unlock advanced modules as you master each skill.
            </p>
            <ul className="lp__split-list">
              <li>Cold Call Foundations (Beginner)</li>
              <li>Objection Handling (Intermediate)</li>
              <li>Discovery &amp; Closing (Advanced)</li>
              <li>Score tracking &amp; improvement analytics</li>
              <li>Coaching tips before every lesson</li>
              <li>Modules unlock as you progress</li>
            </ul>
          </div>

        </div>

        <div className="lp__training-demo">
          <div className="lp__mock-training">
            <div className="lp__mock-training-bar">
              <span>◈</span> TRAINING MODE &nbsp;·&nbsp; Price Objection &nbsp;·&nbsp; 🇪🇸 Spanish
            </div>
            <div className="lp__mock-msg lp__mock-msg--prospect">
              PROSPECT: "Honestamente, el precio está fuera de nuestro presupuesto ahora mismo."
            </div>
            <div className="lp__mock-msg lp__mock-msg--rep">
              YOU: "Entiendo, ¿puedo preguntarte qué parte del presupuesto es el obstáculo?"
            </div>
            <div className="lp__mock-feedback">
              <span className="lp__mock-score lp__mock-score--good">8/10</span>
              <span>✓ Good - you turned it into a discovery question</span>
            </div>
            <div className="lp__mock-ideal">
              <div className="lp__mock-ideal-label">IDEAL RESPONSE</div>
              "¿Qué parte del costo es el obstáculo principal? ¿Es el total o el timing?"
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
          <button className="lp__btn lp__btn--primary" onClick={onGetStarted}>
            Start Training Free →
          </button>
        </div>
      </section>

      {/* ── Languages ── */}
      <section id="languages" className="lp__section lp__section--alt">
        <div className="lp__section-label">MULTILINGUAL</div>
        <h2 className="lp__section-h2">Sell in 10 languages</h2>
        <p className="lp__section-sub">
          Competitors coach only in English. CallAssist coaches in your language -
          real-time objection handling, training, and post-call analysis, all localised.
        </p>
        <div className="lp__lang-grid">
          {LANGUAGES.map((l, i) => (
            <div key={i} className="lp__lang-chip">
              <img className="lp__lang-flag" src={`https://flagcdn.com/w20/${l.country}.png`} alt={l.label} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="lp__section">
        <div className="lp__section-label">COMPARISON</div>
        <h2 className="lp__section-h2">Why CallAssist over the alternatives?</h2>
        <div className="lp__compare-wrap">
          <table className="lp__compare">
            <thead>
              <tr>
                <th className="lp__compare-feature-col">Feature</th>
                <th className="lp__compare-us-col">CallAssist</th>
                <th className="lp__compare-them-col">Other Tools</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr key={i} className="lp__compare-row">
                  <td className="lp__compare-feature">{row.feature}</td>
                  <td className="lp__compare-us">
                    <span className="lp__check lp__check--yes">✓</span>
                  </td>
                  <td className="lp__compare-them">
                    {row.them
                      ? <span className="lp__check lp__check--yes">✓</span>
                      : <span className="lp__check lp__check--no" title={row.note}>✗ {row.note && <span className="lp__compare-note">{row.note}</span>}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp__section lp__section--alt">
        <div className="lp__section-label">PRICING</div>
        <h2 className="lp__section-h2">Simple, transparent pricing</h2>
        <p className="lp__section-sub">No sales call. No quote request. Sign up and start closing.</p>

        <div className="lp__pricing-cards">
          <div className="lp__pricing-card">
            <div className="lp__pricing-tier">FREE</div>
            <div className="lp__pricing-price">$0<span>/month</span></div>
            <div className="lp__pricing-desc">Try it out, no card needed</div>
            <ul className="lp__pricing-features">
              <li>✓ 5 live calls / month</li>
              <li>✓ Real-time coaching</li>
              <li>✓ Post-call summary</li>
              <li>✓ 3 training sessions / month</li>
              <li>✓ English + Spanish</li>
            </ul>
            <button className="lp__btn lp__btn--outline" onClick={onGetStarted}>Get Started Free</button>
          </div>

          <div className="lp__pricing-card lp__pricing-card--pro">
            <div className="lp__pricing-badge">MOST POPULAR</div>
            <div className="lp__pricing-tier">PRO</div>
            <div className="lp__pricing-price">$29<span>/month</span></div>
            <div className="lp__pricing-desc">Everything, unlimited</div>
            <ul className="lp__pricing-features">
              <li>✓ Unlimited live calls</li>
              <li>✓ Unlimited training sessions</li>
              <li>✓ All 10 languages</li>
              <li>✓ Built-in CRM & contact history</li>
              <li>✓ Full post-call analysis</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="lp__btn lp__btn--primary" onClick={onGetStarted}>▶ Start Pro Trial</button>
          </div>
        </div>

        <div className="lp__guarantee">
          ✓ 7-day money-back guarantee on Pro - no questions asked
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp__cta-banner">
        <h2 className="lp__cta-banner-h2">Ready to close more deals?</h2>
        <p className="lp__cta-banner-sub">
          Join sales reps using AI to win more calls - in any language, on any device.
        </p>
        <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={onGetStarted}>
          ▶ Start for Free
        </button>
        <p className="lp__cta-banner-note">No credit card · 7-day money-back · Works everywhere</p>
      </section>

      {/* ── Footer ── */}
      <footer className="lp__footer">
        <div className="lp__footer-logo">◎ CALL<span>ASSIST</span></div>
        <div className="lp__footer-links">
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
          <button onClick={onGetStarted}>Sign In</button>
        </div>
        <div className="lp__footer-copy">© 2025 CallAssist. All rights reserved.</div>
      </footer>

    </div>
  );
}
