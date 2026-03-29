import { useState, useEffect } from 'react';
import './LandingScreen.css';

interface LandingScreenProps {
  onGetStarted: () => void;
}

type SectionId = 'features' | 'training' | 'languages' | 'pricing';

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
    icon: '✦',
    title: 'Real-time coaching',
    desc: 'AI whispers the perfect response the moment your prospect speaks. Objection handlers, closing prompts, and discovery questions live.',
    bullets: ['Objection detection & rebuttals', 'Buying signal alerts', 'Stage-aware prompts'],
  },
  {
    icon: '◈',
    title: 'Practice scenarios',
    desc: 'Practice against an AI prospect that fights back. 8 scenarios with 3 sub-scenarios each cold openers, objections, discovery, closing.',
    bullets: ['8 scenario types, 3 difficulties', 'Per-response scoring & feedback', 'Custom persona builder'],
  },
  {
    icon: '▣',
    title: 'AI Sales Academy',
    desc: 'Structured curriculum from beginner to advanced. 9 lessons across 3 modules. Track your score every rep.',
    bullets: ['3 modules, 9 lessons', 'Coaching tips before each lesson', 'Modules unlock as you progress'],
  },
  {
    icon: '⊕',
    title: '10 languages',
    desc: 'Sell in English, Spanish, French, Portuguese, German, Italian, Dutch, Mandarin, Japanese, or Arabic. AI coaches in your language.',
    bullets: ['Real-time coaching localised', 'Training in your language', 'Post-call analysis localised'],
  },
  {
    icon: '↗',
    title: 'Built-in CRM',
    desc: 'Every call saved automatically. View all contacts, lead scores, AI summaries, and follow-up emails in one place no third-party needed.',
    bullets: ['Auto-saved after every call', 'Lead scores & close probability', 'Timestamped call notes'],
  },
  {
    icon: '◎',
    title: 'Post-call analysis',
    desc: 'Full transcript, AI summary, lead score, and a ready-to-send personalised follow-up email generated the moment you hang up.',
    bullets: ['Full transcript saved', 'AI-generated follow-up email', 'Improvement suggestions'],
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

const FEATURE_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '⊞',
    title: 'Your sales command center',
    desc: 'Every call saved automatically. View all contacts, lead scores, and performance at a glance no separate CRM needed.',
    items: [
      { icon: '◷', title: 'Full call history & CRM', desc: 'Every session saved with transcript, AI summary, and a ready-to-send follow-up email.' },
      { icon: '◈', title: 'Lead scores & close probability', desc: 'Each contact scored automatically after every call.' },
      { icon: '✎', title: 'Call notes', desc: 'Add timestamped notes during a live call saved and shown per contact.' },
      { icon: '✦', title: 'Practice streak', desc: 'See your daily training streak and stay consistent over time.' },
    ],
  },
  {
    id: 'coaching',
    label: 'Live Coaching',
    icon: '◎',
    title: 'AI coaching on every call',
    desc: 'The AI listens in real time and surfaces the perfect response the moment your prospect speaks without missing a beat.',
    items: [
      { icon: '⚠', title: 'Objection detection', desc: 'Detects price, competitor, and stalling objections the instant they\'re spoken.' },
      { icon: '↑', title: 'Buying signal alerts', desc: 'Flags interest and urgency phrases so you know exactly when to close.' },
      { icon: '%', title: 'Live close probability', desc: 'Tracks your probability of closing as the call progresses.' },
      { icon: '☰', title: 'Objection quick-reference', desc: 'Built-in cheat sheet of rebuttals for the 6 most common objections.' },
    ],
  },
  {
    id: 'training',
    label: 'Training',
    icon: '◈',
    title: 'Practice until you never lose a deal',
    desc: 'AI plays the prospect. You pitch. Get scored and coached on every response before it matters on a real call.',
    items: [
      { icon: '◉', title: '8 scenarios, 3 difficulty levels', desc: 'Cold openers, objections, discovery, closing Easy, Medium, and Hard.' },
      { icon: '✎', title: 'Custom scenario builder', desc: 'Describe any prospect in plain text and the AI becomes them.' },
      { icon: '▣', title: 'AI Sales Academy', desc: '9 structured lessons from beginner to advanced with score tracking.' },
      { icon: '✓', title: 'Per-response feedback', desc: 'Every reply you send gets an instant score, pros, cons, and the ideal response.' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '▦',
    title: 'Know exactly where you stand',
    desc: 'Track performance across every live call and training session. Spot your weak spots and close the gap.',
    items: [
      { icon: '▦', title: '28-day activity grid', desc: 'Visual heatmap of every day you called or trained.' },
      { icon: '↗', title: 'Close probability trends', desc: 'See your average close probability move over the last 10 calls.' },
      { icon: '◎', title: 'Training score history', desc: 'Track your scores per lesson and watch yourself improve over time.' },
      { icon: '◈', title: 'Team leaderboard', desc: 'Generate a team code and compete with your colleagues.' },
    ],
  },
];

const TRAINING_SCENARIOS = [
  { icon: '◉', title: 'Cold Call Openers', desc: 'Break the ice and earn the right to talk' },
  { icon: '◈', title: 'Price Objections', desc: 'Turn "too expensive" into "worth every penny"' },
  { icon: '◷', title: 'Think It Over', desc: 'Convert stalls into commitment' },
  { icon: '↗', title: 'Not Interested', desc: 'Flip early rejections into curiosity' },
  { icon: '◎', title: 'Discovery', desc: 'Uncover the real pain behind polite answers' },
  { icon: '✓', title: 'Closing', desc: 'Ask for the deal and hold the silence' },
  { icon: '⚠', title: 'Competitor Objections', desc: 'Make the switch feel obvious, not risky' },
  { icon: '✎', title: 'Custom Scenario', desc: 'Describe any prospect AI becomes them' },
];

const ACADEMY_MODULES = [
  {
    level: 'BEGINNER',
    title: 'Cold Call Foundations',
    color: 'green',
    lessons: ['The Perfect Opener', 'Handling "Not Interested"', 'The Skeptical Prospect'],
  },
  {
    level: 'INTERMEDIATE',
    title: 'Objection Handling',
    color: 'yellow',
    lessons: ['Price Objections', 'The "Think It Over" Trap', 'Breaking the Status Quo'],
  },
  {
    level: 'ADVANCED',
    title: 'Discovery & Closing',
    color: 'red',
    lessons: ['Discovery That Reveals Pain', 'The Trial Close', 'Closing the Hard Prospect'],
  },
];

const PRICING_FAQ = [
  {
    q: 'Can my prospect hear or tell that I\'m using AI coaching during the call?',
    a: 'No. Pitch Plus runs silently in a separate browser tab your prospect only hears you speaking normally. The coaching suggestions appear as text on your screen, so there\'s nothing audible on their end. It works the same way a physical cheat sheet would, except it updates in real time based on what\'s actually being said.',
  },
  {
    q: 'How accurate is the speech recognition, and what happens if it mishears something?',
    a: 'Pitch Plus uses your browser\'s native Web Speech API, which performs best in a quiet environment with a decent microphone. In good conditions accuracy is high enough to reliably catch objection keywords and buying signals. If a word is misheard, the coaching panel may occasionally miss a cue but it won\'t interrupt the call or show anything incorrect to the prospect. The full transcript is editable after the call before it\'s saved.',
  },
  {
    q: 'Does it work for any product or industry, or is it only built for certain types of sales?',
    a: 'It works for any outbound or inbound sales scenario where you\'re speaking with a prospect one-on-one. Before each call you enter your own pitch, product description, and call goal so the AI coaches you in the context of what you\'re actually selling, not a generic script. Reps selling SaaS, financial products, real estate, recruitment, and insurance have all used it effectively. The custom scenario builder in training lets you replicate the exact objections specific to your market.',
  },
  {
    q: 'What happens to my transcripts and data if I downgrade or cancel?',
    a: 'Your data stays accessible for 30 days after cancellation so you can export anything you need. Transcripts, call notes, lead scores, and AI summaries can all be downloaded before that window closes. After 30 days the account and its data are permanently deleted. We don\'t sell or share your data with third parties at any point paid, free, or cancelled.',
  },
];

const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'features',  label: 'Features'  },
  { id: 'training',  label: 'Training'  },
  { id: 'languages', label: 'Languages' },
  { id: 'pricing',   label: 'Pricing'   },
];

const CARD_ANIMS = ['tl', 'tc', 'tr', 'bl', 'bc', 'br'] as const;

const LANG_PHRASES = [
  { flag: '🇺🇸', lang: 'English',    text: '"What specifically would you change?"' },
  { flag: '🇪🇸', lang: 'Spanish',    text: '"¿Qué cambiaría específicamente?"' },
  { flag: '🇫🇷', lang: 'French',     text: '"Que changeriez-vous?"' },
  { flag: '🇩🇪', lang: 'German',     text: '"Was würden Sie ändern?"' },
  { flag: '🇧🇷', lang: 'Portuguese', text: '"O que você mudaria?"' },
  { flag: '🇨🇳', lang: 'Mandarin',   text: '"您具体会改变什么？"' },
  { flag: '🇯🇵', lang: 'Japanese',   text: '"具体的に何を変えますか？"' },
];

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
  const [visibleFrames, setVisibleFrames]       = useState(1);
  const [menuOpen, setMenuOpen]                 = useState(false);
  const [featureTabIdx, setFeatureTabIdx]       = useState(0);
  const [featureAutoKey, setFeatureAutoKey]     = useState(0);
  const [activeSection, setActiveSection]       = useState<SectionId | null>(null);
  const [openFaq, setOpenFaq]                   = useState<number | null>(null);
  const [langIdx, setLangIdx]                   = useState(0);

  useEffect(() => {
    if (visibleFrames >= DEMO_FRAMES.length) return;
    const t = setTimeout(() => setVisibleFrames(v => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visibleFrames]);

  useEffect(() => {
    if (activeSection !== 'features') return;
    const t = setInterval(() => setLangIdx(i => (i + 1) % LANG_PHRASES.length), 2400);
    return () => clearInterval(t);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== null) return;
    const root = document.querySelector<HTMLElement>('.lp');
    const els  = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.transitionDelay = el.dataset.delay ? `${el.dataset.delay}s` : '0s';
            el.classList.add('revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -60px 0px', root }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection]);

  // Auto-advance feature tabs
  useEffect(() => {
    const t = setInterval(() => {
      setFeatureTabIdx(i => (i + 1) % FEATURE_TABS.length);
    }, 3800);
    return () => clearInterval(t);
  }, [featureAutoKey]);

  function goFeatureTab(idx: number) {
    setFeatureTabIdx(idx);
    setFeatureAutoKey(k => k + 1);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  function goSection(id: SectionId) {
    setActiveSection(id);
    setMenuOpen(false);
    setOpenFaq(null);
    document.querySelector('.lp')?.scrollTo(0, 0);
  }

  // ─── Nav (shared) ──────────────────────────────────────────────────────────

  const nav = (
    <nav className="lp__nav">
      <div className="lp__nav-inner">
        <button className="lp__nav-logo" onClick={() => setActiveSection(null)}>
          PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span>
        </button>

        {activeSection !== null ? (
          <div className="lp__nav-links lp__nav-links--sections">
            {NAV_SECTIONS.map(s => (
              <button
                key={s.id}
                className={activeSection === s.id ? 'lp__nav-link--active' : ''}
                onClick={() => goSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <div className={`lp__nav-links ${menuOpen ? 'lp__nav-links--open' : ''}`}>
            <button onClick={() => goSection('features')}>Features</button>
            <button onClick={() => goSection('training')}>Training</button>
            <button onClick={() => goSection('languages')}>Languages</button>
            <button onClick={() => goSection('pricing')}>Pricing</button>
          </div>
        )}

        <div className="lp__nav-actions">
          <button className="lp__nav-signin" onClick={onGetStarted}>Sign In</button>
          <button className="lp__nav-cta" onClick={onGetStarted}>Get Started Free</button>
          <button className="lp__nav-burger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );

  // ─── Features section view ─────────────────────────────────────────────────

  if (activeSection === 'features') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--features">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">FEATURES</div>
            <h2 className="lp__sv-h2">Everything you need<br />to win more deals</h2>
            <p className="lp__sv-sub">Six tools that work together, live on every call.</p>
          </div>

          <div className="lp__sv-features-grid">

            {/* 0 Real-time coaching */}
            <div className={`lp__sv-fcard lp__sv-fcard--${CARD_ANIMS[0]}`}>
              <div className="lp__feature-icon">{FEATURES[0].icon}</div>
              <div className="lp__feature-title">{FEATURES[0].title}</div>
              <div className="lp__feature-desc">{FEATURES[0].desc}</div>
              <div className="lp__sv-demo">
                <div className="demo-coach-prospect">PROSPECT: "We already have a tool for that..."</div>
                <div className="demo-coach-ai">
                  <span className="demo-coach-badge">OBJECTION DETECTED</span>
                  <span className="demo-coach-text">"What do you love most about it? And what's the one thing you'd change?"</span>
                </div>
              </div>
            </div>

            {/* 1 Practice scenarios */}
            <div className={`lp__sv-fcard lp__sv-fcard--${CARD_ANIMS[1]}`}>
              <div className="lp__feature-icon">{FEATURES[1].icon}</div>
              <div className="lp__feature-title">{FEATURES[1].title}</div>
              <div className="lp__feature-desc">{FEATURES[1].desc}</div>
              <div className="lp__sv-demo">
                <div className="demo-prac-prospect">PROSPECT: "It's too expensive."</div>
                <div className="demo-prac-you">YOU: "Is it the price, or the ROI?"</div>
                <div className="demo-prac-result">
                  <span className="demo-prac-score">8/10</span>
                  <span className="demo-prac-fb">✓ Good reframe</span>
                </div>
              </div>
            </div>

            {/* 2 AI Sales Academy */}
            <div className={`lp__sv-fcard lp__sv-fcard--${CARD_ANIMS[2]}`}>
              <div className="lp__feature-icon">{FEATURES[2].icon}</div>
              <div className="lp__feature-title">{FEATURES[2].title}</div>
              <div className="lp__feature-desc">{FEATURES[2].desc}</div>
              <div className="lp__sv-demo">
                <div className="demo-lesson demo-lesson--done">
                  <span className="demo-lesson-icon">✓</span>
                  <span className="demo-lesson-name">The Perfect Opener</span>
                  <span className="demo-lesson-score">8.5</span>
                </div>
                <div className="demo-lesson demo-lesson--active">
                  <span className="demo-lesson-icon">▶</span>
                  <span className="demo-lesson-name">Handling Objections</span>
                </div>
                <div className="demo-bar-track"><div className="demo-bar-fill" /></div>
                <div className="demo-lesson demo-lesson--locked">
                  <span className="demo-lesson-icon">○</span>
                  <span className="demo-lesson-name">The Skeptic</span>
                </div>
              </div>
            </div>

            {/* 3 10 languages */}
            <div className={`lp__sv-fcard lp__sv-fcard--${CARD_ANIMS[3]}`}>
              <div className="lp__feature-icon">{FEATURES[3].icon}</div>
              <div className="lp__feature-title">{FEATURES[3].title}</div>
              <div className="lp__feature-desc">{FEATURES[3].desc}</div>
              <div className="lp__sv-demo">
                <div className="demo-lang-header">AI COACHING IN</div>
                <div className="demo-lang-flag-row">
                  {LANG_PHRASES[langIdx].flag} {LANG_PHRASES[langIdx].lang}
                </div>
                <div key={langIdx} className="demo-lang-phrase">
                  {LANG_PHRASES[langIdx].text}
                </div>
              </div>
            </div>

            {/* 4 Built-in CRM */}
            <div className={`lp__sv-fcard lp__sv-fcard--${CARD_ANIMS[4]}`}>
              <div className="lp__feature-icon">{FEATURES[4].icon}</div>
              <div className="lp__feature-title">{FEATURES[4].title}</div>
              <div className="lp__feature-desc">{FEATURES[4].desc}</div>
              <div className="lp__sv-demo">
                <div className="demo-crm-row">
                  <span className="demo-crm-key">Name</span>
                  <span className="demo-crm-val demo-crm-val--1">Sarah Mitchell</span>
                </div>
                <div className="demo-crm-row">
                  <span className="demo-crm-key">Company</span>
                  <span className="demo-crm-val demo-crm-val--2">Acme Corp</span>
                </div>
                <div className="demo-crm-row">
                  <span className="demo-crm-key">Score</span>
                  <span className="demo-crm-val demo-crm-val--3 demo-crm-score">78</span>
                </div>
                <div className="demo-crm-row">
                  <span className="demo-crm-key">Status</span>
                  <span className="demo-crm-val demo-crm-val--4 demo-crm-hot">● HOT LEAD</span>
                </div>
              </div>
            </div>

            {/* 5 Post-call analysis */}
            <div className={`lp__sv-fcard lp__sv-fcard--${CARD_ANIMS[5]}`}>
              <div className="lp__feature-icon">{FEATURES[5].icon}</div>
              <div className="lp__feature-title">{FEATURES[5].title}</div>
              <div className="lp__feature-desc">{FEATURES[5].desc}</div>
              <div className="lp__sv-demo">
                <div className="demo-prob">
                  <div className="demo-prob-header">
                    <span className="demo-prob-label">Close probability</span>
                    <span className="demo-prob-pct">81%</span>
                  </div>
                  <div className="demo-prob-track"><div className="demo-prob-bar" /></div>
                </div>
                <div className="demo-check-item demo-check-1"><span className="demo-check-icon">✓</span> Transcript saved</div>
                <div className="demo-check-item demo-check-2"><span className="demo-check-icon">✓</span> AI summary generated</div>
                <div className="demo-check-item demo-check-3"><span className="demo-check-icon">✓</span> Follow-up email ready</div>
              </div>
            </div>

          </div>

          <div className="lp__sv-diffs">
            <div className="lp__sv-diff">◎ Works in any browser no extension needed</div>
            <div className="lp__sv-diff">◎ Phone calls, Zoom, Teams, and Meet</div>
            <div className="lp__sv-diff">◎ 10 languages competitors coach in English only</div>
          </div>

          <div className="lp__sv-cta">
            <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={onGetStarted}>
              ▶ Start for Free
            </button>
            <p className="lp__sv-cta-note">No credit card · 7-day money-back</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Training section view ─────────────────────────────────────────────────

  if (activeSection === 'training') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--training">

          <div className="lp__sv-hero">
            <div className="lp__sv-label">TRAINING</div>
            <h2 className="lp__sv-h2">Practice like it's real.<br />Win when it is.</h2>
            <p className="lp__sv-sub">
              Most reps practice on real prospects that's how deals get lost.
              Pitch Plus gives you a sparring partner that fights back, so you're
              sharp before it ever matters on a real call.
            </p>
          </div>

          <div className="lp__sv-howto">
            {[
              { num: '01', title: 'Pick a scenario', desc: 'Choose from 8 real-world situations at any difficulty, or describe your own prospect in plain text.' },
              { num: '02', title: 'AI becomes the prospect', desc: 'It stalls, objects, and pushes back exactly like the toughest calls you face every day.' },
              { num: '03', title: 'Get scored on every reply', desc: 'Each response rated 0–10 with pros, cons, and the ideal phrasing shown right away.' },
            ].map((step, i) => (
              <div key={i} className="lp__sv-tstep" style={{ '--i': i } as React.CSSProperties}>
                <div className="lp__sv-tstep-num">{step.num}</div>
                <div className="lp__sv-tstep-title">{step.title}</div>
                <div className="lp__sv-tstep-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="lp__sv-training-grid">
            <div className="lp__sv-col">
              <div className="lp__sv-col-title">◈ Practice Scenarios</div>
              <p className="lp__sv-col-sub">Jump straight into a live AI roleplay. Pick a situation, choose Easy / Medium / Hard, and go. No setup required.</p>
              {TRAINING_SCENARIOS.map((s, i) => (
                <div
                  key={i}
                  className="lp__sv-item"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span className="lp__sv-item-icon">{s.icon}</span>
                  <div>
                    <div className="lp__sv-item-title">{s.title}</div>
                    <div className="lp__sv-item-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lp__sv-col">
              <div className="lp__sv-col-title">▣ AI Sales Academy</div>
              <p className="lp__sv-col-sub">A structured 9-lesson curriculum from beginner to advanced. Each lesson scored watch your number climb session by session.</p>
              {ACADEMY_MODULES.map((m, mi) => (
                <div
                  key={mi}
                  className={`lp__sv-module lp__sv-module--${m.color}`}
                  style={{ '--i': mi + 2 } as React.CSSProperties}
                >
                  <div className="lp__sv-module-header">
                    <span className={`lp__sv-module-badge lp__sv-module-badge--${m.color}`}>
                      {m.level}
                    </span>
                    <span className="lp__sv-module-title">{m.title}</span>
                  </div>
                  <ul className="lp__sv-module-lessons">
                    {m.lessons.map((l, li) => (
                      <li
                        key={li}
                        style={{ '--i': mi * 3 + li + 4 } as React.CSSProperties}
                      >
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="lp__sv-mock-wrap">
            <div className="lp__sv-terminal">
              <div className="lp__sv-terminal-bar">
                ◈ TRAINING  ·  Price Objection  ·  🇪🇸 Spanish  ·  MEDIUM
              </div>
              <div className="lp__sv-tframe lp__sv-tframe--prospect">
                PROSPECT: "Honestamente, el precio está fuera de nuestro presupuesto ahora mismo."
              </div>
              <div className="lp__sv-tframe lp__sv-tframe--you">
                YOU: "Entiendo ¿es el total o el timing lo que es un obstáculo?"
              </div>
              <div className="lp__sv-tframe lp__sv-tframe--score">
                <span className="lp__sv-tscore">9/10</span>
                <span>✓ Perfect you isolated the real objection</span>
              </div>
              <div className="lp__sv-tframe lp__sv-tframe--ideal">
                <div className="lp__sv-tideal-label">IDEAL RESPONSE</div>
                "¿Qué parte del costo es el obstáculo principal? ¿Es el total o el timing?"
              </div>
            </div>
          </div>

          <div className="lp__sv-cta">
            <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={onGetStarted}>
              Start Training Free →
            </button>
            <p className="lp__sv-cta-note">No credit card · Free plan available</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Languages section view ────────────────────────────────────────────────

  if (activeSection === 'languages') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--languages">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">MULTILINGUAL</div>
            <h2 className="lp__sv-h2">Close deals in any language</h2>
            <p className="lp__sv-sub">
              While every competitor limits coaching to English, Pitch Plus coaches in 10 languages 
              real-time objection handling, training, and post-call analysis, all localised.
            </p>
          </div>

          <div className="lp__sv-lang-burst">
            {LANGUAGES.map((l, i) => (
              <div
                key={i}
                className="lp__lang-chip lp__sv-lang-chip"
                style={{ '--i': i } as React.CSSProperties}
              >
                <img className="lp__lang-flag" src={`https://flagcdn.com/w20/${l.country}.png`} alt={l.label} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          <div className="lp__sv-lang-features">
            <div className="lp__sv-lang-col">
              <div className="lp__sv-lang-col-icon">✦</div>
              <div className="lp__sv-lang-col-title">Real-time Coaching</div>
              <p>Objection detection, buying signal alerts, and coaching prompts all delivered in your language as you speak.</p>
            </div>
            <div className="lp__sv-lang-col">
              <div className="lp__sv-lang-col-icon">◈</div>
              <div className="lp__sv-lang-col-title">Training Mode</div>
              <p>Practice against an AI prospect who responds in your chosen language. Every scenario, every difficulty level.</p>
            </div>
            <div className="lp__sv-lang-col">
              <div className="lp__sv-lang-col-icon">◎</div>
              <div className="lp__sv-lang-col-title">Post-call Analysis</div>
              <p>Transcript, AI summary, lead score, and follow-up email all generated in your language after every call.</p>
            </div>
          </div>

          <div className="lp__sv-lang-vs">
            <span className="lp__sv-lang-vs-us">Pitch Plus: 10 languages</span>
            <span className="lp__sv-lang-vs-sep">vs</span>
            <span className="lp__sv-lang-vs-them">Competitors: English only</span>
          </div>

          <div className="lp__sv-cta">
            <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={onGetStarted}>
              ▶ Start for Free
            </button>
            <p className="lp__sv-cta-note">No credit card · 10 languages from day one</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pricing section view ──────────────────────────────────────────────────

  if (activeSection === 'pricing') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--pricing">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">PRICING</div>
            <h2 className="lp__sv-h2">Simple pricing, no catch</h2>
            <p className="lp__sv-sub">No sales call. No quote request. Sign up and start closing.</p>
          </div>

          <div className="lp__pricing-cards lp__sv-pricing-cards">
            <div
              className="lp__pricing-card lp__sv-pricing-card"
              style={{ '--i': 0 } as React.CSSProperties}
            >
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
              <button className="lp__btn lp__btn--outline" onClick={onGetStarted}>
                Get Started Free
              </button>
            </div>

            <div
              className="lp__pricing-card lp__pricing-card--pro lp__sv-pricing-card"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              <div className="lp__pricing-badge">MOST POPULAR</div>
              <div className="lp__pricing-tier">PRO</div>
              <div className="lp__pricing-price">$29<span>/month</span></div>
              <div className="lp__pricing-desc">Everything, unlimited</div>
              <ul className="lp__pricing-features">
                <li>✓ Unlimited live calls</li>
                <li>✓ Unlimited training sessions</li>
                <li>✓ All 10 languages</li>
                <li>✓ Built-in CRM &amp; contact history</li>
                <li>✓ Full post-call analysis</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="lp__btn lp__btn--primary" onClick={onGetStarted}>
                ▶ Start Pro Trial
              </button>
            </div>
          </div>

          <div className="lp__sv-faq">
            <div className="lp__sv-faq-title">FAQ</div>
            {PRICING_FAQ.map((item, i) => (
              <div
                key={i}
                className={`lp__sv-faq-item ${openFaq === i ? 'lp__sv-faq-item--open' : ''}`}
              >
                <button
                  className="lp__sv-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <span className="lp__sv-faq-toggle">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="lp__sv-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>

          <div className="lp__guarantee lp__sv-guarantee">
            ✓ 7-day money-back guarantee on Pro no questions asked
          </div>
        </div>
      </div>
    );
  }

  // ─── Landing page (home) ───────────────────────────────────────────────────

  return (
    <div className="lp">

      {nav}

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
              <span className="lp__terminal-title">PITCH PLUS - LIVE</span>
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
      <div className="lp__trust reveal">
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
        <div className="lp__section-label reveal">FEATURES</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Everything you need to close more deals</h2>
        <div className="lp__features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="lp__feature-card reveal" data-delay={String(i * 0.08)}>
              <div className="lp__feature-icon">{f.icon}</div>
              <div className="lp__feature-title">{f.title}</div>
              <div className="lp__feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="lp__section lp__section--alt">
        <div className="lp__section-label reveal">HOW IT WORKS</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">From setup to close in 3 steps</h2>
        <div className="lp__steps">
          {STEPS.map((s, i) => (
            <div key={i} className="lp__step reveal" data-delay={String(i * 0.12)}>
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
        <div className="lp__section-label reveal">TRAINING MODE</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Two ways to train. One goal: more closed deals.</h2>
        <div className="lp__training-modes">

          <div className="lp__training-mode-card reveal">
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

          <div className="lp__training-mode-card lp__training-mode-card--academy reveal" data-delay="0.12">
            <div className="lp__training-mode-badge">NEW</div>
            <div className="lp__training-mode-icon">▣</div>
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

        <div className="lp__training-demo reveal" data-delay="0.1">
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
        <div className="lp__section-label reveal">MULTILINGUAL</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Sell in 10 languages</h2>
        <p className="lp__section-sub reveal" data-delay="0.18">
          Competitors coach only in English. Pitch Plus coaches in your language 
          real-time objection handling, training, and post-call analysis, all localised.
        </p>
        <div className="lp__lang-grid reveal" data-delay="0.25">
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
        <div className="lp__section-label reveal">COMPARISON</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Why Pitch Plus over the alternatives?</h2>
        <div className="lp__compare-wrap reveal" data-delay="0.18">
          <table className="lp__compare">
            <thead>
              <tr>
                <th className="lp__compare-feature-col">Feature</th>
                <th className="lp__compare-us-col">Pitch Plus</th>
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

      {/* ── Feature tabs (auto-advance carousel) ── */}
      <section className="lp__ftab-section">
        <div className="lp__ftab-sticky">

          <div className="lp__ftab-header">
            <div className="lp__section-label">EVERYTHING IN ONE PLACE</div>
            <h2 className="lp__section-h2">Built for every part of your sales process</h2>
          </div>

          {/* Clickable step dots */}
          <div className="lp__ftab-stepdots">
            <div className="lp__ftab-stepdots-track">
              <div
                className="lp__ftab-stepdots-fill"
                style={{ width: `${(featureTabIdx / (FEATURE_TABS.length - 1)) * 100}%` }}
              />
            </div>
            {FEATURE_TABS.map((tab, i) => (
              <div
                key={tab.id}
                className={`lp__ftab-stepdot${i === featureTabIdx ? ' lp__ftab-stepdot--active' : ''}${i < featureTabIdx ? ' lp__ftab-stepdot--done' : ''}`}
                onClick={() => goFeatureTab(i)}
              >
                <div className="lp__ftab-stepdot-node" />
                <span className="lp__ftab-stepdot-label">{tab.icon} {tab.label}</span>
              </div>
            ))}

          </div>

          {/* Panel — key triggers re-mount animation on change */}
          <div key={featureTabIdx} className="lp__ftab-content">
            <div className="lp__ftab-left">
              <div className="lp__ftab-label">{FEATURE_TABS[featureTabIdx].icon} {FEATURE_TABS[featureTabIdx].label}</div>
              <h3 className="lp__ftab-title">{FEATURE_TABS[featureTabIdx].title}</h3>
              <p className="lp__ftab-desc">{FEATURE_TABS[featureTabIdx].desc}</p>
            </div>
            <div className="lp__ftab-right">
              {FEATURE_TABS[featureTabIdx].items.map((item, i) => (
                <div key={i} className="lp__ftab-item" style={{ '--i': i } as React.CSSProperties}>
                  <div className="lp__ftab-item-icon">{item.icon}</div>
                  <div className="lp__ftab-item-text">
                    <div className="lp__ftab-item-title">{item.title}</div>
                    <div className="lp__ftab-item-desc">{item.desc}</div>
                  </div>
                  <span className="lp__ftab-item-arrow">›</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp__section lp__section--alt">
        <div className="lp__section-label reveal">PRICING</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Simple, transparent pricing</h2>
        <p className="lp__section-sub reveal" data-delay="0.18">No sales call. No quote request. Sign up and start closing.</p>

        <div className="lp__pricing-cards">
          <div className="lp__pricing-card reveal">
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

          <div className="lp__pricing-card lp__pricing-card--pro reveal" data-delay="0.12">
            <div className="lp__pricing-badge">MOST POPULAR</div>
            <div className="lp__pricing-tier">PRO</div>
            <div className="lp__pricing-price">$29<span>/month</span></div>
            <div className="lp__pricing-desc">Everything, unlimited</div>
            <ul className="lp__pricing-features">
              <li>✓ Unlimited live calls</li>
              <li>✓ Unlimited training sessions</li>
              <li>✓ All 10 languages</li>
              <li>✓ Built-in CRM &amp; contact history</li>
              <li>✓ Full post-call analysis</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="lp__btn lp__btn--primary" onClick={onGetStarted}>▶ Start Pro Trial</button>
          </div>
        </div>

        <div className="lp__guarantee reveal" data-delay="0.2">
          ✓ 7-day money-back guarantee on Pro - no questions asked
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp__cta-banner reveal">
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
      <footer className="lp__footer reveal">
        <div className="lp__footer-logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>
        <div className="lp__footer-links">
          <button onClick={() => goSection('features')}>Features</button>
          <button onClick={() => goSection('pricing')}>Pricing</button>
          <button onClick={onGetStarted}>Sign In</button>
        </div>
        <div className="lp__footer-copy">© 2025 Pitch Plus. All rights reserved.</div>
      </footer>

    </div>
  );
}
