import { useState, useEffect } from 'react';
import './LandingScreen.css';

interface LandingScreenProps {
  onGetStarted: () => void;
}

type SectionId = 'features' | 'training' | 'languages' | 'pricing' | 'download' | 'changelog' | 'help' | 'about' | 'blog' | 'careers' | 'contact' | 'privacy' | 'terms' | 'cookies';

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

const CHANGELOG_ENTRIES = [
  {
    version: 'v2.4.0', date: 'March 2025', tag: 'NEW', tagColor: 'green',
    changes: [
      { type: 'new',         text: 'Team leaderboard — generate a team code and compete with colleagues' },
      { type: 'new',         text: 'Arabic coaching support (10th language reached)' },
      { type: 'new',         text: '28-day activity heatmap on the Analytics screen' },
      { type: 'fix',         text: 'Fixed close probability stalling mid-call in Firefox' },
    ],
  },
  {
    version: 'v2.3.0', date: 'January 2025', tag: 'MAJOR', tagColor: 'purple',
    changes: [
      { type: 'new',         text: 'AI Sales Academy — 9 structured lessons across 3 modules' },
      { type: 'new',         text: 'Module unlock progression: Beginner → Intermediate → Advanced' },
      { type: 'new',         text: 'Per-lesson score tracking and improvement history' },
      { type: 'improvement', text: 'Coaching prompts are now stage-aware (opener, discovery, close)' },
    ],
  },
  {
    version: 'v2.2.0', date: 'November 2024', tag: 'UPDATE', tagColor: 'yellow',
    changes: [
      { type: 'new',         text: 'Post-call AI summary with ready-to-send follow-up email' },
      { type: 'new',         text: 'Lead score assigned to every contact after each call' },
      { type: 'improvement', text: 'Transcripts are now editable before saving' },
      { type: 'fix',         text: 'Fixed speech recognition dropping words on slower connections' },
    ],
  },
  {
    version: 'v2.1.0', date: 'September 2024', tag: 'UPDATE', tagColor: 'yellow',
    changes: [
      { type: 'new',         text: 'Mandarin, Japanese, Dutch, and Italian coaching added' },
      { type: 'new',         text: 'Custom scenario builder — describe any prospect in plain text' },
      { type: 'improvement', text: 'Training mode scoring algorithm fully rewritten for accuracy' },
    ],
  },
  {
    version: 'v2.0.0', date: 'July 2024', tag: 'MAJOR', tagColor: 'purple',
    changes: [
      { type: 'new', text: 'Built-in CRM — every call saved with transcript and lead score' },
      { type: 'new', text: 'Dashboard with contact list, lead scores, and timestamped notes' },
      { type: 'new', text: 'Analytics screen with close probability trends and training history' },
      { type: 'new', text: 'French, Portuguese, German, and Spanish coaching support' },
    ],
  },
];

const HELP_TOPICS = [
  {
    icon: '▶', title: 'Getting started',
    articles: ['How to set up your first live call', 'Configuring your microphone for best accuracy', 'Choosing your coaching language', 'Understanding the live coaching panel'],
  },
  {
    icon: '◎', title: 'Live calls',
    articles: ['How objection detection works', 'What buying signals look like', 'Using the quick-reference objection sheet', 'Reading your close probability in real time'],
  },
  {
    icon: '◈', title: 'Training mode',
    articles: ['Choosing the right scenario and difficulty', 'How the AI prospect generates responses', 'Understanding your per-response score', 'Tracking your AI Sales Academy progress'],
  },
  {
    icon: '◷', title: 'CRM & call history',
    articles: ['Where to find your saved calls', 'Reading your post-call AI summary', 'Sending the auto-generated follow-up email', 'Exporting your call transcripts'],
  },
  {
    icon: '▣', title: 'Billing & account',
    articles: ['Upgrading from Free to Pro', 'How the 7-day money-back guarantee works', 'Cancelling your subscription', 'What happens to my data after cancellation'],
  },
];

const BLOG_POSTS = [
  {
    tag: 'TECHNIQUE', tagColor: 'purple',
    title: 'The 3-second rule that turns "think it over" into a closed deal',
    excerpt: 'Most reps go silent after a stall — and lose. Here\'s the counter-intuitive pause technique that flips hesitation into commitment.',
    date: 'Mar 18, 2025', readTime: '5 min',
  },
  {
    tag: 'TRAINING', tagColor: 'green',
    title: 'Why practicing on real prospects is killing your close rate',
    excerpt: 'Every time you rehearse on a live call, you\'re paying tuition to someone who isn\'t buying. AI roleplay changes the math.',
    date: 'Feb 28, 2025', readTime: '4 min',
  },
  {
    tag: 'MULTILINGUAL', tagColor: 'blue',
    title: 'How to close in a language that isn\'t your first',
    excerpt: 'Non-native speakers have a hidden advantage in sales. Real-time AI coaching amplifies it. Here\'s how to use it.',
    date: 'Feb 10, 2025', readTime: '6 min',
  },
  {
    tag: 'DATA', tagColor: 'yellow',
    title: 'We analysed 10,000 sales calls. Here\'s what separates the top 5%.',
    excerpt: 'Objection timing, question frequency, and silence patterns — the data reveals what elite reps do differently.',
    date: 'Jan 22, 2025', readTime: '8 min',
  },
];

const JOB_LISTINGS = [
  { title: 'Senior Full-Stack Engineer',      team: 'Engineering',       location: 'Remote (EU / US)',   type: 'Full-time' },
  { title: 'AI/ML Engineer — Speech & NLP',   team: 'Engineering',       location: 'Remote (Worldwide)', type: 'Full-time' },
  { title: 'Head of Sales',                   team: 'Go-to-Market',      location: 'Remote (US)',        type: 'Full-time' },
  { title: 'Customer Success Manager',        team: 'Customer Success',  location: 'Remote (EU / US)',   type: 'Full-time' },
];

const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'features',  label: 'Features'  },
  { id: 'training',  label: 'Training'  },
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

  // ─── Download section view ────────────────────────────────────────────────

  if (activeSection === 'download') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--download">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">DOWNLOAD</div>
            <h2 className="lp__sv-h2">No download. No install.<br />Just open and sell.</h2>
            <p className="lp__sv-sub">
              Pitch Plus runs entirely in your browser. No Chrome extension, no desktop app,
              no setup wizard. Open a tab, enter your prospect's details, and you're live in under 30 seconds.
            </p>
          </div>

          <div className="lp__info-grid">
            {[
              { icon: '◎', title: 'Any browser', desc: 'Works on Chrome, Firefox, Safari, and Edge. Nothing to install — just sign in and go.' },
              { icon: '◈', title: 'Any device', desc: 'Laptop, desktop, or tablet. If your browser supports Web Speech API, Pitch Plus works.' },
              { icon: '✦', title: 'Any call type', desc: 'Phone calls, Zoom, Teams, Google Meet — anything you can speak into your microphone.' },
              { icon: '▣', title: 'Any OS', desc: 'Windows, macOS, Linux, ChromeOS. No platform restrictions, ever.' },
            ].map((item, i) => (
              <div key={i} className="lp__info-card">
                <div className="lp__info-card-icon">{item.icon}</div>
                <div className="lp__info-card-title">{item.title}</div>
                <p className="lp__info-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="lp__sv-howto">
            {[
              { num: '01', title: 'Sign up free', desc: 'Create your account in 30 seconds. No credit card required for the free plan.' },
              { num: '02', title: 'Open a new tab', desc: 'Navigate to Pitch Plus in any supported browser. Bookmark it for one-click access.' },
              { num: '03', title: 'Allow microphone', desc: 'Grant microphone permission once. Pitch Plus never records without your explicit start.' },
              { num: '04', title: 'Start your call', desc: 'Enter your prospect\'s details, hit Start, and get live coaching the moment they speak.' },
            ].map((step, i) => (
              <div key={i} className="lp__sv-tstep" style={{ '--i': i } as React.CSSProperties}>
                <div className="lp__sv-tstep-num">{step.num}</div>
                <div className="lp__sv-tstep-title">{step.title}</div>
                <div className="lp__sv-tstep-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="lp__sv-cta">
            <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={onGetStarted}>
              ▶ Get Started Free
            </button>
            <p className="lp__sv-cta-note">No credit card · No downloads · Live in 30 seconds</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Changelog section view ────────────────────────────────────────────────

  if (activeSection === 'changelog') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--changelog">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">CHANGELOG</div>
            <h2 className="lp__sv-h2">What's new in Pitch Plus</h2>
            <p className="lp__sv-sub">New features, improvements, and fixes — published as they ship.</p>
          </div>

          <div className="lp__changelog-list">
            {CHANGELOG_ENTRIES.map((entry, i) => (
              <div key={i} className="lp__cl-entry">
                <div className="lp__cl-meta">
                  <span className="lp__cl-version">{entry.version}</span>
                  <span className="lp__cl-date">{entry.date}</span>
                  <span className={`lp__cl-tag lp__cl-tag--${entry.tagColor}`}>{entry.tag}</span>
                </div>
                <ul className="lp__cl-changes">
                  {entry.changes.map((c, j) => (
                    <li key={j} className={`lp__cl-change lp__cl-change--${c.type}`}>
                      <span className="lp__cl-change-dot" />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Help Center section view ──────────────────────────────────────────────

  if (activeSection === 'help') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--help">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">HELP CENTER</div>
            <h2 className="lp__sv-h2">How can we help?</h2>
            <p className="lp__sv-sub">
              Everything you need to get the most out of Pitch Plus — from your first call to advanced coaching techniques.
            </p>
          </div>

          <div className="lp__help-grid">
            {HELP_TOPICS.map((topic, i) => (
              <div key={i} className="lp__help-card">
                <div className="lp__help-card-icon">{topic.icon}</div>
                <div className="lp__help-card-title">{topic.title}</div>
                <ul className="lp__help-articles">
                  {topic.articles.map((a, j) => (
                    <li key={j} className="lp__help-article">
                      <span className="lp__help-article-arrow">›</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lp__help-contact">
            <div className="lp__help-contact-text">Can't find what you need?</div>
            <button className="lp__btn lp__btn--outline" onClick={() => goSection('contact')}>
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── About section view ────────────────────────────────────────────────────

  if (activeSection === 'about') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--about">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">ABOUT</div>
            <h2 className="lp__sv-h2">Built by salespeople,<br />for salespeople.</h2>
            <p className="lp__sv-sub">
              Pitch Plus was born from a simple frustration: the best sales coaches in the world
              can't be on every call. AI can.
            </p>
          </div>

          <div className="lp__about-story">
            <p>
              We spent years in outbound sales — cold calls, objection after objection, deals lost in the last
              30 seconds because we said the wrong thing. Every post-mortem pointed to the same problem: by the
              time a manager gave feedback, the moment was long gone.
            </p>
            <p>
              So we built the tool we always wished existed. An AI that listens in real time, detects objections
              the instant they're spoken, and whispers the right response before the silence gets awkward.
              No lag. No judgment. Just the right words, right now.
            </p>
            <p>
              Today, Pitch Plus coaches reps in 10 languages across 40+ countries. We're a small team of
              engineers, salespeople, and linguists who believe that the best salespeople aren't born —
              they're built, rep by rep.
            </p>
          </div>

          <div className="lp__info-grid">
            {[
              { icon: '✦', title: 'Real-time, always', desc: 'Feedback 3 hours after a call is a post-mortem. We built coaching that lands in the moment it matters.' },
              { icon: '◈', title: 'No English bias', desc: 'Sales happens in every language. We coached in 10 from the start — competitors still haven\'t caught up.' },
              { icon: '◎', title: 'Reps first', desc: 'Every feature ships when it helps the person on the call, not when it helps the dashboard look impressive.' },
              { icon: '▣', title: 'Simple pricing', desc: 'No enterprise quotes, no seat negotiations, no hidden fees. A price you can read on one screen.' },
            ].map((item, i) => (
              <div key={i} className="lp__info-card">
                <div className="lp__info-card-icon">{item.icon}</div>
                <div className="lp__info-card-title">{item.title}</div>
                <p className="lp__info-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="lp__sv-cta">
            <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={onGetStarted}>
              ▶ Try it yourself
            </button>
            <p className="lp__sv-cta-note">Free plan available · No credit card required</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Blog section view ─────────────────────────────────────────────────────

  if (activeSection === 'blog') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--blog">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">BLOG</div>
            <h2 className="lp__sv-h2">The Pitch Plus Sales Blog</h2>
            <p className="lp__sv-sub">Techniques, data, and ideas for reps who want to close more.</p>
          </div>

          <div className="lp__blog-grid">
            {BLOG_POSTS.map((post, i) => (
              <div key={i} className="lp__blog-card">
                <div className="lp__blog-card-top">
                  <span className={`lp__blog-tag lp__blog-tag--${post.tagColor}`}>{post.tag}</span>
                  <span className="lp__blog-meta">{post.date} · {post.readTime} read</span>
                </div>
                <div className="lp__blog-title">{post.title}</div>
                <p className="lp__blog-excerpt">{post.excerpt}</p>
                <button className="lp__blog-read">Read article →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Careers section view ──────────────────────────────────────────────────

  if (activeSection === 'careers') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--careers">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">CAREERS</div>
            <h2 className="lp__sv-h2">Build the future of sales</h2>
            <p className="lp__sv-sub">
              We're a small, remote team working on a problem that matters to millions of people.
              No politics, no nonsense — just good work and ambitious goals.
            </p>
          </div>

          <div className="lp__info-grid lp__info-grid--3">
            {[
              { icon: '◎', title: 'Fully remote', desc: 'Work from anywhere. We operate async-first and hire the best people regardless of timezone.' },
              { icon: '✦', title: 'Ownership from day one', desc: 'Everyone ships. There are no layers between your work and the product customers use.' },
              { icon: '◈', title: 'Competitive comp', desc: 'Market-rate salary, equity, and a home-office stipend. We don\'t underpay to test commitment.' },
            ].map((item, i) => (
              <div key={i} className="lp__info-card">
                <div className="lp__info-card-icon">{item.icon}</div>
                <div className="lp__info-card-title">{item.title}</div>
                <p className="lp__info-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="lp__careers-section-title">Open roles</div>
          <div className="lp__jobs-list">
            {JOB_LISTINGS.map((job, i) => (
              <div key={i} className="lp__job-row">
                <div className="lp__job-info">
                  <div className="lp__job-title">{job.title}</div>
                  <div className="lp__job-meta">{job.team} · {job.location} · {job.type}</div>
                </div>
                <button className="lp__btn lp__btn--outline lp__btn--sm">Apply →</button>
              </div>
            ))}
          </div>

          <div className="lp__help-contact">
            <div className="lp__help-contact-text">Don't see the right role? Send us a speculative application.</div>
            <button className="lp__btn lp__btn--outline" onClick={() => goSection('contact')}>
              Get in touch →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Contact section view ──────────────────────────────────────────────────

  if (activeSection === 'contact') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--contact">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">CONTACT</div>
            <h2 className="lp__sv-h2">Get in touch</h2>
            <p className="lp__sv-sub">We're a small team — we read every message ourselves and respond within one business day.</p>
          </div>

          <div className="lp__contact-grid">
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">◎</div>
              <div className="lp__contact-card-title">Support</div>
              <p className="lp__contact-card-desc">Questions about your account, billing, or how something works? We've got you.</p>
              <a className="lp__contact-link" href="mailto:support@pitchplus.ai">support@pitchplus.ai</a>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">◈</div>
              <div className="lp__contact-card-title">Sales & partnerships</div>
              <p className="lp__contact-card-desc">Interested in team plans, reseller partnerships, or API access? Let's talk.</p>
              <a className="lp__contact-link" href="mailto:sales@pitchplus.ai">sales@pitchplus.ai</a>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">✦</div>
              <div className="lp__contact-card-title">Press & media</div>
              <p className="lp__contact-card-desc">Writing about AI in sales, multilingual tools, or the future of sales coaching?</p>
              <a className="lp__contact-link" href="mailto:press@pitchplus.ai">press@pitchplus.ai</a>
            </div>
          </div>

          <div className="lp__contact-note">
            <span className="lp__contact-note-icon">◷</span>
            Typical response time: <strong>under 4 hours</strong> during business hours (Mon–Fri, 9am–6pm GMT).
          </div>
        </div>
      </div>
    );
  }

  // ─── Privacy Policy section view ───────────────────────────────────────────

  if (activeSection === 'privacy') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--legal">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">LEGAL</div>
            <h2 className="lp__sv-h2">Privacy Policy</h2>
            <p className="lp__sv-sub">Last updated: 1 March 2025</p>
          </div>
          <div className="lp__legal-body">
            <div className="lp__legal-section">
              <h3>1. What we collect</h3>
              <p>We collect information you provide directly: your name, email address, and payment information when you sign up. During live calls and training sessions, we process microphone audio locally in your browser using the Web Speech API — raw audio is never transmitted to our servers. We receive transcribed text only. We also collect standard usage data: pages visited, features used, session duration, and error logs.</p>
            </div>
            <div className="lp__legal-section">
              <h3>2. How we use it</h3>
              <p>We use your data to operate and improve Pitch Plus, to process payments, to send transactional emails (receipts, password resets), and to provide customer support. We do not sell your data to third parties. We do not use your call transcripts to train AI models without your explicit consent.</p>
            </div>
            <div className="lp__legal-section">
              <h3>3. Data storage and retention</h3>
              <p>Your data is stored on servers located in the EU (Frankfurt) and US (Virginia) using industry-standard encryption at rest (AES-256) and in transit (TLS 1.3). Call transcripts, lead scores, and CRM data are retained for as long as your account is active. After cancellation, data is accessible for 30 days and then permanently deleted.</p>
            </div>
            <div className="lp__legal-section">
              <h3>4. Third-party services</h3>
              <p>We use Stripe for payment processing, Supabase for database and authentication, and standard cloud infrastructure providers. Each processes data only as required to deliver their service and under strict data-processing agreements.</p>
            </div>
            <div className="lp__legal-section">
              <h3>5. Your rights</h3>
              <p>You have the right to access, correct, or delete your personal data at any time. EU/UK residents have additional rights under GDPR/UK GDPR including data portability and the right to object to processing. To exercise any right, email <a href="mailto:privacy@pitchplus.ai">privacy@pitchplus.ai</a> and we will respond within 30 days.</p>
            </div>
            <div className="lp__legal-section">
              <h3>6. Cookies</h3>
              <p>We use strictly necessary cookies for authentication and session management, and optional analytics cookies to understand how the product is used. See our Cookie Policy for full details.</p>
            </div>
            <div className="lp__legal-section">
              <h3>7. Contact</h3>
              <p>Questions about this policy? Email <a href="mailto:privacy@pitchplus.ai">privacy@pitchplus.ai</a>. Our registered address is available on request.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Terms of Service section view ─────────────────────────────────────────

  if (activeSection === 'terms') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--legal">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">LEGAL</div>
            <h2 className="lp__sv-h2">Terms of Service</h2>
            <p className="lp__sv-sub">Last updated: 1 March 2025</p>
          </div>
          <div className="lp__legal-body">
            <div className="lp__legal-section">
              <h3>1. Acceptance</h3>
              <p>By creating a Pitch Plus account or using the service, you agree to these Terms. If you are using Pitch Plus on behalf of a company, you represent that you have authority to bind that company.</p>
            </div>
            <div className="lp__legal-section">
              <h3>2. Subscription and billing</h3>
              <p>Paid plans are billed monthly in advance. Prices are listed in USD. You can cancel at any time from your account settings — your plan remains active until the end of the billing period. The Pro plan includes a 7-day money-back guarantee from the date of first purchase. Refund requests must be submitted within 7 days to support@pitchplus.ai.</p>
            </div>
            <div className="lp__legal-section">
              <h3>3. Acceptable use</h3>
              <p>You may use Pitch Plus for lawful sales and business communication purposes. You may not use the service to deceive prospects in ways that violate applicable consumer protection or telemarketing laws, to record or store conversations without consent where required by law, or to reverse-engineer, resell, or redistribute the service.</p>
            </div>
            <div className="lp__legal-section">
              <h3>4. Intellectual property</h3>
              <p>Pitch Plus and all associated software, design, and content are owned by us. Your call transcripts and CRM data are yours — we claim no ownership over content you generate. You grant us a limited licence to store and process your data solely to provide the service.</p>
            </div>
            <div className="lp__legal-section">
              <h3>5. Limitation of liability</h3>
              <p>Pitch Plus is provided "as is." We are not liable for missed coaching cues, speech recognition errors, or outcomes on individual sales calls. Our total liability to you for any claim is capped at the amount you paid us in the 12 months prior to the claim.</p>
            </div>
            <div className="lp__legal-section">
              <h3>6. Termination</h3>
              <p>We may suspend or terminate your account for material breach of these Terms, including non-payment or misuse. We will provide notice before termination except where immediate action is required to protect other users or the service.</p>
            </div>
            <div className="lp__legal-section">
              <h3>7. Governing law</h3>
              <p>These Terms are governed by the laws of England and Wales. Disputes will be resolved in the courts of London, UK, unless applicable law requires otherwise.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cookie Policy section view ────────────────────────────────────────────

  if (activeSection === 'cookies') {
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--legal">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">LEGAL</div>
            <h2 className="lp__sv-h2">Cookie Policy</h2>
            <p className="lp__sv-sub">Last updated: 1 March 2025</p>
          </div>
          <div className="lp__legal-body">
            <div className="lp__legal-section">
              <h3>1. What are cookies?</h3>
              <p>Cookies are small text files stored in your browser when you visit a website. They allow the site to remember information about your visit and are used widely to make websites work more efficiently.</p>
            </div>
            <div className="lp__legal-section">
              <h3>2. Strictly necessary cookies</h3>
              <p>These cookies are essential for Pitch Plus to function and cannot be disabled. They include your authentication session token (so you stay logged in), CSRF protection tokens (to prevent cross-site request forgery), and user preference cookies (language and theme settings). These cookies do not track you across other websites.</p>
            </div>
            <div className="lp__legal-section">
              <h3>3. Analytics cookies</h3>
              <p>With your consent, we use analytics cookies to understand how users interact with Pitch Plus — which features are used most, where users encounter friction, and how the product can be improved. This data is aggregated and anonymised. We do not use third-party advertising networks or behavioural tracking cookies.</p>
            </div>
            <div className="lp__legal-section">
              <h3>4. Managing cookies</h3>
              <p>You can control and delete cookies through your browser settings. Disabling strictly necessary cookies will prevent you from logging in. Disabling analytics cookies has no effect on your experience. Instructions for managing cookies in <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a>, <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Firefox</a>, and <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a> are available on each browser's support site.</p>
            </div>
            <div className="lp__legal-section">
              <h3>5. Contact</h3>
              <p>Questions about our cookie usage? Email <a href="mailto:privacy@pitchplus.ai">privacy@pitchplus.ai</a>.</p>
            </div>
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
        <div className="lp__footer-top">

          {/* Brand */}
          <div className="lp__footer-brand">
            <div className="lp__footer-logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>
            <p className="lp__footer-tagline">AI-powered sales coaching that listens, analyzes, and coaches you in real time — so every call is your best call.</p>
          </div>

          {/* Product */}
          <div className="lp__footer-col">
            <div className="lp__footer-col-title">Product</div>
            <button className="lp__footer-link" onClick={() => goSection('features')}>Features</button>
            <button className="lp__footer-link" onClick={() => goSection('pricing')}>Pricing</button>
            <button className="lp__footer-link" onClick={() => goSection('download')}>Download</button>
            <button className="lp__footer-link" onClick={() => goSection('changelog')}>Changelog</button>
          </div>

          {/* Resources */}
          <div className="lp__footer-col">
            <div className="lp__footer-col-title">Resources</div>
            <button className="lp__footer-link" onClick={() => goSection('languages')}>Languages</button>
            <button className="lp__footer-link" onClick={() => goSection('help')}>Help Center</button>
          </div>

          {/* Company */}
          <div className="lp__footer-col">
            <div className="lp__footer-col-title">Company</div>
            <button className="lp__footer-link" onClick={() => goSection('about')}>About</button>
            <button className="lp__footer-link" onClick={() => goSection('blog')}>Blog</button>
            <button className="lp__footer-link" onClick={() => goSection('careers')}>Careers</button>
            <button className="lp__footer-link" onClick={() => goSection('contact')}>Contact</button>
          </div>

          {/* Legal */}
          <div className="lp__footer-col">
            <div className="lp__footer-col-title">Legal</div>
            <button className="lp__footer-link" onClick={() => goSection('privacy')}>Privacy Policy</button>
            <button className="lp__footer-link" onClick={() => goSection('terms')}>Terms of Service</button>
            <button className="lp__footer-link" onClick={() => goSection('cookies')}>Cookie Policy</button>
          </div>

        </div>

        <div className="lp__footer-bottom">
          <div className="lp__footer-copy">© 2025 Pitch Plus. All rights reserved.</div>
          <div className="lp__footer-socials">
            <a className="lp__footer-social" href="#" aria-label="Twitter / X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a className="lp__footer-social" href="#" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
