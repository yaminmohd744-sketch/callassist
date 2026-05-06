import { useState, useEffect } from 'react';
import './LandingScreen.css';

interface LandingScreenProps {
  onDownload: () => void;
}

type SectionId = 'features' | 'languages' | 'pricing' | 'download' | 'changelog' | 'help' | 'about' | 'blog' | 'careers' | 'contact' | 'privacy' | 'terms' | 'cookies';

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

const DEMO_SCENES = [
  {
    badge: 'OBJECTION DETECTED',
    badgeType: 'red',
    prospect: '"We already have a tool for that..."',
    suggestion: 'What do you love most about it? And what\'s the one thing you wish it did better?',
    prob: 68,
  },
  {
    badge: 'BUYING SIGNAL',
    badgeType: 'green',
    prospect: '"Honestly, the reporting could be better..."',
    suggestion: 'Pain confirmed — "So if I showed you exactly how we fix that, would you be open to a 20-min demo this week?"',
    prob: 81,
  },
  {
    badge: 'CLOSE PROMPT',
    badgeType: 'purple',
    prospect: '"That actually sounds really interesting..."',
    suggestion: 'Trial close — "Based on what we\'ve covered, does this solve the problem you described at the start?"',
    prob: 89,
  },
];

const FEATURES = [
  {
    icon: '✦',
    title: 'Real-time coaching',
    desc: 'AI whispers the perfect response the moment your prospect speaks. Objection handlers, closing prompts, and discovery questions live.',
    bullets: ['Objection detection & rebuttals', 'Buying signal alerts', 'Stage-aware prompts'],
  },
  {
    icon: '⊕',
    title: '10 languages',
    desc: 'Sell in English, Spanish, French, Portuguese, German, Italian, Dutch, Mandarin, Japanese, or Arabic. AI coaches in your language.',
    bullets: ['Real-time coaching localised', 'Coach in your language', 'Post-call analysis localised'],
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
  { feature: 'Multi-language coaching',        us: true,  them: false, note: 'English only' },
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
      { icon: '✦', title: 'Call streak', desc: 'Track your daily call activity and build consistent habits.' },
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
    id: 'analytics',
    label: 'Analytics',
    icon: '▦',
    title: 'Know exactly where you stand',
    desc: 'Track performance across every live call. Spot your weak spots and close the gap.',
    items: [
      { icon: '▦', title: '28-day activity grid', desc: 'Visual heatmap of every day you called.' },
      { icon: '↗', title: 'Close probability trends', desc: 'See your average close probability move over the last 10 calls.' },
      { icon: '◎', title: 'Call intel', desc: 'Top objection patterns, winning call durations, and best days to call.' },
      { icon: '◈', title: 'Team leaderboard', desc: 'Generate a team code and compete with your colleagues.' },
    ],
  },
];


const PRICING_FAQ = [
  {
    q: 'Can my prospect hear or tell that I\'m using AI coaching during the call?',
    a: 'No. Pitchbase runs silently in a separate browser tab your prospect only hears you speaking normally. The coaching suggestions appear as text on your screen, so there\'s nothing audible on their end. It works the same way a physical cheat sheet would, except it updates in real time based on what\'s actually being said.',
  },
  {
    q: 'How accurate is the speech recognition, and what happens if it mishears something?',
    a: 'Pitchbase uses your browser\'s native Web Speech API, which performs best in a quiet environment with a decent microphone. In good conditions accuracy is high enough to reliably catch objection keywords and buying signals. If a word is misheard, the coaching panel may occasionally miss a cue but it won\'t interrupt the call or show anything incorrect to the prospect. The full transcript is editable after the call before it\'s saved.',
  },
  {
    q: 'Does it work for any product or industry, or is it only built for certain types of sales?',
    a: 'It works for any outbound or inbound sales scenario where you\'re speaking with a prospect one-on-one. Before each call you enter your own pitch, product description, and call goal so the AI coaches you in the context of what you\'re actually selling, not a generic script. Reps selling SaaS, financial products, real estate, recruitment, and insurance have all used it effectively. The custom scenario builder in training lets you replicate the exact objections specific to your market.',
  },
  {
    q: 'What happens to my transcripts and data if I cancel?',
    a: 'Your data stays accessible for 30 days after cancellation so you can export anything you need. Transcripts, call notes, lead scores, and AI summaries can all be downloaded before that window closes. After 30 days the account and its data are permanently deleted. We don\'t sell or share your data with third parties — paid, free, or cancelled.',
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
    icon: '◷', title: 'CRM & call history',
    articles: ['Where to find your saved calls', 'Reading your post-call AI summary', 'Sending the auto-generated follow-up email', 'Exporting your call transcripts'],
  },
  {
    icon: '▣', title: 'Billing & account',
    articles: ['Upgrading from Free to Pro or Team', 'How the 7-day free trial works', 'Cancelling your subscription', 'What happens to my data after cancellation'],
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
  { id: 'pricing',   label: 'Pricing'   },
];


const LANG_PHRASES = [
  { flag: '🇺🇸', lang: 'English',    text: '"What specifically would you change?"' },
  { flag: '🇪🇸', lang: 'Spanish',    text: '"¿Qué cambiaría específicamente?"' },
  { flag: '🇫🇷', lang: 'French',     text: '"Que changeriez-vous?"' },
  { flag: '🇩🇪', lang: 'German',     text: '"Was würden Sie ändern?"' },
  { flag: '🇧🇷', lang: 'Portuguese', text: '"O que você mudaria?"' },
  { flag: '🇨🇳', lang: 'Mandarin',   text: '"您具体会改变什么？"' },
  { flag: '🇯🇵', lang: 'Japanese',   text: '"具体的に何を変えますか？"' },
];

function WinLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M0 0h7.5v7.5H0z"/>
      <path d="M8.5 0H16v7.5H8.5z"/>
      <path d="M0 8.5h7.5V16H0z"/>
      <path d="M8.5 8.5H16V16H8.5z"/>
    </svg>
  );
}

export function LandingScreen({ onDownload }: LandingScreenProps) {
  const [visibleFrames, setVisibleFrames]       = useState(1);
  const [menuOpen, setMenuOpen]                 = useState(false);
  const [featureTabIdx, setFeatureTabIdx]       = useState(0);
  const [featureAutoKey, setFeatureAutoKey]     = useState(0);
  const [activeSection, setActiveSection]       = useState<SectionId | null>(null);
  const [openFaq, setOpenFaq]                   = useState<number | null>(null);
  const [billingCycle, setBillingCycle]         = useState<'monthly' | 'yearly'>('monthly');
  const [langIdx, setLangIdx]                   = useState(0);
  const [navCtaVisible, setNavCtaVisible]       = useState(false);
  const [demoSceneIdx, setDemoSceneIdx]         = useState(0);
  const [demoPhase, setDemoPhase]               = useState<'expanded' | 'clicking' | 'minimized'>('expanded');
  const [desktopSceneIdx, setDesktopSceneIdx]   = useState(0);
  const [desktopShowSuggestion, setDesktopShowSuggestion] = useState(false);

  useEffect(() => {
    if (visibleFrames >= DEMO_FRAMES.length) return;
    const t = setTimeout(() => setVisibleFrames(v => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visibleFrames]);

  useEffect(() => {
    const t2 = setTimeout(() => setDemoSceneIdx(i => (i + 1) % DEMO_SCENES.length), 4200);
    return () => { clearTimeout(t2); };
  }, [demoSceneIdx]);

  // Desktop demo loop: expanded (5s) → clicking (1.2s) → minimized (5s) → reset
  useEffect(() => {
    setDemoPhase('expanded');
    setDesktopShowSuggestion(false);
    const tSug  = setTimeout(() => setDesktopShowSuggestion(true), 1800);
    const tClick = setTimeout(() => setDemoPhase('clicking'), 5000);
    const tMin  = setTimeout(() => setDemoPhase('minimized'), 6200);
    const tNext  = setTimeout(() => {
      setDesktopSceneIdx(i => (i + 1) % DEMO_SCENES.length);
    }, 12000);
    return () => { clearTimeout(tSug); clearTimeout(tClick); clearTimeout(tMin); clearTimeout(tNext); };
  }, [desktopSceneIdx]);

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

  // Show nav CTA only after scrolling past the hero (≈ 80% of viewport height)
  useEffect(() => {
    if (activeSection !== null) return;
    const container = document.querySelector('.lp') ?? window;
    const threshold = window.innerHeight * 0.8;
    function onScroll() {
      const scrolled = container === window
        ? window.scrollY
        : (container as Element).scrollTop;
      setNavCtaVisible(scrolled > threshold);
    }
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
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
            <button onClick={() => goSection('pricing')}>Pricing</button>
          </div>
        )}

        <div className="lp__nav-actions">
          <button
            className="lp__win-btn lp__nav-cta-win"
            onClick={onDownload}
            style={{ opacity: navCtaVisible ? 1 : 0, pointerEvents: navCtaVisible ? 'auto' : 'none' }}
          >
            <WinLogo /> Get for Windows
          </button>
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
          <div className="lp__sv-hero lp__sv-hero--features">
            <div>
              <div className="lp__sv-label">FEATURES</div>
              <h2 className="lp__sv-h2 lp__sv-h2--solid">Everything you need<br />to win more deals</h2>
            </div>
            <p className="lp__sv-sub lp__sv-sub--aside">Four tools that work together, live on every call.</p>
          </div>

          <div className="lp__sv-flist">

            {/* 01 Real-time coaching */}
            <div className="lp__sv-frow" style={{ '--row-i': 0 } as React.CSSProperties}>
              <span className="lp__sv-frow-num">01</span>
              <div className="lp__sv-frow-body">
                <h3 className="lp__sv-frow-title">{FEATURES[0].title}</h3>
                <p className="lp__sv-frow-desc">{FEATURES[0].desc}</p>
                <ul className="lp__sv-frow-bullets">
                  {FEATURES[0].bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div className="lp__sv-demo lp__sv-frow-demo">
                <div className="demo-coach-prospect">PROSPECT: &quot;We already have a tool for that...&quot;</div>
                <div className="demo-coach-ai">
                  <span className="demo-coach-badge">OBJECTION DETECTED</span>
                  <span className="demo-coach-text">&quot;What do you love most about it? And what&apos;s the one thing you&apos;d change?&quot;</span>
                </div>
              </div>
            </div>

            {/* 02 10 languages */}
            <div className="lp__sv-frow" style={{ '--row-i': 1 } as React.CSSProperties}>
              <span className="lp__sv-frow-num">02</span>
              <div className="lp__sv-frow-body">
                <h3 className="lp__sv-frow-title">{FEATURES[1].title}</h3>
                <p className="lp__sv-frow-desc">{FEATURES[1].desc}</p>
                <ul className="lp__sv-frow-bullets">
                  {FEATURES[1].bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div className="lp__sv-demo lp__sv-frow-demo">
                <div className="demo-lang-header">AI COACHING IN</div>
                <div className="demo-lang-flag-row">{LANG_PHRASES[langIdx].flag} {LANG_PHRASES[langIdx].lang}</div>
                <div key={langIdx} className="demo-lang-phrase">{LANG_PHRASES[langIdx].text}</div>
              </div>
            </div>

            {/* 03 Built-in CRM */}
            <div className="lp__sv-frow" style={{ '--row-i': 2 } as React.CSSProperties}>
              <span className="lp__sv-frow-num">03</span>
              <div className="lp__sv-frow-body">
                <h3 className="lp__sv-frow-title">{FEATURES[2].title}</h3>
                <p className="lp__sv-frow-desc">{FEATURES[2].desc}</p>
                <ul className="lp__sv-frow-bullets">
                  {FEATURES[2].bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div className="lp__sv-demo lp__sv-frow-demo">
                <div className="demo-crm-row"><span className="demo-crm-key">Name</span><span className="demo-crm-val demo-crm-val--1">Sarah Mitchell</span></div>
                <div className="demo-crm-row"><span className="demo-crm-key">Company</span><span className="demo-crm-val demo-crm-val--2">Acme Corp</span></div>
                <div className="demo-crm-row"><span className="demo-crm-key">Score</span><span className="demo-crm-val demo-crm-val--3 demo-crm-score">78</span></div>
                <div className="demo-crm-row"><span className="demo-crm-key">Status</span><span className="demo-crm-val demo-crm-val--4 demo-crm-hot">● HOT LEAD</span></div>
              </div>
            </div>

            {/* 04 Post-call analysis */}
            <div className="lp__sv-frow" style={{ '--row-i': 3 } as React.CSSProperties}>
              <span className="lp__sv-frow-num">04</span>
              <div className="lp__sv-frow-body">
                <h3 className="lp__sv-frow-title">{FEATURES[3].title}</h3>
                <p className="lp__sv-frow-desc">{FEATURES[3].desc}</p>
                <ul className="lp__sv-frow-bullets">
                  {FEATURES[3].bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div className="lp__sv-demo lp__sv-frow-demo">
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
            <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
              <WinLogo /> Get for Windows
            </button>
            <p className="lp__sv-cta-note">No credit card · 7-day money-back</p>
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
              While every competitor limits coaching to English, Pitchbase coaches in 10 languages 
              real-time objection handling and post-call analysis, all localised.
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
              <div className="lp__sv-lang-col-icon">◎</div>
              <div className="lp__sv-lang-col-title">Post-call Analysis</div>
              <p>Transcript, AI summary, lead score, and follow-up email all generated in your language after every call.</p>
            </div>
          </div>

          <div className="lp__sv-lang-vs">
            <span className="lp__sv-lang-vs-us">Pitchbase: 10 languages</span>
            <span className="lp__sv-lang-vs-sep">vs</span>
            <span className="lp__sv-lang-vs-them">Competitors: English only</span>
          </div>

          <div className="lp__sv-cta">
            <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
              <WinLogo /> Get for Windows
            </button>
            <p className="lp__sv-cta-note">No credit card · 10 languages from day one</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pricing section view ──────────────────────────────────────────────────

  if (activeSection === 'pricing') {
    const yearly = billingCycle === 'yearly';
    const PLANS = [
      {
        tier: 'STARTER',
        monthlyPrice: 19,
        yearlyPrice: 16,
        desc: 'For reps learning the ropes.',
        cta: 'Get for Windows',
        ctaStyle: 'outline' as const,
        badge: null,
        highlight: false,
        features: [
          '15 live calls / month',
          'English & Spanish only',
          'Basic post-call summary',
          'Community support',
        ],
        missing: ['More languages', 'Analytics', 'Call upload'],
      },
      {
        tier: 'PRO',
        monthlyPrice: 49,
        yearlyPrice: 41,
        desc: 'For reps ready to level up.',
        cta: 'Get for Windows',
        ctaStyle: 'primary' as const,
        badge: 'MOST POPULAR',
        highlight: true,
        features: [
          '60 live calls / month',
          '6 languages',
          'Full post-call analysis + follow-up email',
          'Basic analytics',
          'Email support',
        ],
        missing: ['All 10 languages', 'Advanced analytics', 'Call upload'],
      },
      {
        tier: 'BUSINESS',
        monthlyPrice: 59,
        yearlyPrice: 49,
        desc: 'Full access. No ceilings.',
        cta: 'Get for Windows',
        ctaStyle: 'outline' as const,
        badge: null,
        highlight: false,
        features: [
          'Unlimited live calls',
          'All 10 languages',
          'Full post-call analysis + follow-up email',
          'Advanced analytics & trends',
          'Call upload & analysis',
          'Team leaderboard & shared call library',
          'Manager analytics dashboard',
          'Priority support',
        ],
        missing: [],
      },
    ];

    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--pricing">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">PRICING</div>
            <h2 className="lp__sv-h2">Simple pricing, no catch</h2>
            <p className="lp__sv-sub">No sales call. No quote request. Pick a plan and start closing in 60 seconds.</p>
          </div>

          <div className="lp__billing-toggle">
            <button
              className={`lp__billing-btn${!yearly ? ' lp__billing-btn--active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`lp__billing-btn${yearly ? ' lp__billing-btn--active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="lp__billing-save">Save ~16%</span>
            </button>
          </div>

          <div className="lp__pricing-grid">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`lp__pricing-card${plan.highlight ? ' lp__pricing-card--pro' : ''}`}
                style={{ '--i': i } as React.CSSProperties}
              >
                {plan.badge && <div className="lp__pricing-badge">{plan.badge}</div>}
                <div className="lp__pricing-tier">{plan.tier}</div>
                <div className="lp__pricing-price">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}<span>/month</span>
                </div>
                {yearly && (
                  <div className="lp__pricing-billed-note">billed ${plan.yearlyPrice * 12}/yr</div>
                )}
                <div className="lp__pricing-desc">{plan.desc}</div>
                <div className="lp__pricing-divider" />
                <ul className="lp__pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j} className="lp__pricing-feature lp__pricing-feature--yes">
                      <span className="lp__pricing-check">✓</span>{f}
                    </li>
                  ))}
                  {plan.missing.map((f, j) => (
                    <li key={j} className="lp__pricing-feature lp__pricing-feature--no">
                      <span className="lp__pricing-check">—</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`lp__btn lp__btn--${plan.ctaStyle} lp__pricing-cta`}
                  onClick={onDownload}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="lp__pricing-guarantee-row">
            <span className="lp__pricing-guarantee-badge">✓ 7-day free trial on all plans — no card charged upfront</span>
            <span className="lp__pricing-guarantee-sep">·</span>
            <span className="lp__pricing-guarantee-note">Cancel anytime · No questions asked</span>
          </div>

          <div className="lp__sv-faq">
            <div className="lp__sv-faq-title">Frequently asked questions</div>
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
            <h2 className="lp__sv-h2">One install.<br />Always ready to sell.</h2>
            <p className="lp__sv-sub">
              Pitchbase is a native Windows desktop app. Install it once and it's always a click away —
              no browser tab, no extension, no lag. Just open and coach.
            </p>
          </div>

          <div className="lp__info-grid">
            {[
              { icon: '◎', title: 'Windows native', desc: 'Built for Windows 10 & 11. Installs like any app and runs in the background — no browser needed.' },
              { icon: '◈', title: 'Lightweight', desc: 'Minimal CPU and memory footprint. Runs alongside Zoom, Teams, or any call software without slowdown.' },
              { icon: '✦', title: 'Any call type', desc: 'Phone calls, Zoom, Teams, Google Meet — anything you can speak into your microphone.' },
              { icon: '▣', title: 'Always on', desc: 'Stays in your system tray ready to launch. One click and you\'re live before the first ring.' },
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
              { num: '01', title: 'Download the app', desc: 'Click Download Free and run the installer. Takes under a minute on any Windows 10 or 11 machine.' },
              { num: '02', title: 'Create your account', desc: 'Sign up inside the app in 30 seconds. No credit card required for the free plan.' },
              { num: '03', title: 'Allow microphone', desc: 'Grant microphone permission once. Pitchbase never records without your explicit start.' },
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
            <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
              <WinLogo /> Get for Windows
            </button>
            <p className="lp__sv-cta-note">No credit card · Windows 10 &amp; 11 · Free to start</p>
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
            <h2 className="lp__sv-h2">What's new in Pitchbase</h2>
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
    const POPULAR = [
      'How to set up your first live call',
      'How objection detection works',
      'How the 7-day money-back guarantee works',
      'What happens to my data after cancellation',
      'How accurate is the speech recognition?',
    ];
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--help">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">HELP CENTER</div>
            <h2 className="lp__sv-h2">How can we help?</h2>
            <p className="lp__sv-sub">
              Everything you need to get the most out of Pitchbase — from your first call to advanced coaching techniques.
            </p>
          </div>

          {/* Popular articles */}
          <div className="lp__help-popular">
            <div className="lp__help-popular-label">Popular articles</div>
            <div className="lp__help-popular-list">
              {POPULAR.map((a, i) => (
                <div key={i} className="lp__help-popular-item">
                  <span className="lp__help-popular-icon">→</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic grid */}
          <div className="lp__help-grid">
            {HELP_TOPICS.map((topic, i) => (
              <div key={i} className="lp__help-card">
                <div className="lp__help-card-icon">{topic.icon}</div>
                <div className="lp__help-card-title">{topic.title}</div>
                <div className="lp__help-card-count">{topic.articles.length} articles</div>
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
            <div className="lp__help-contact-icon">◷</div>
            <div className="lp__help-contact-text">Can't find what you need?<br /><span>We respond within 4 hours on business days.</span></div>
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
    const STATS = [
      { value: '10',   label: 'Languages supported' },
      { value: '40+',  label: 'Countries with active users' },
      { value: '1',    label: 'Pricing tier (no tiers)' },
      { value: '< 1s', label: 'Median coaching latency' },
    ];
    const VALUES = [
      { icon: '✦', title: 'Real-time, always', desc: 'Feedback 3 hours after a call is a post-mortem. We built coaching that lands in the moment it matters — before the silence gets awkward.' },
      { icon: '◈', title: 'No English bias', desc: 'Sales happens in every language. We shipped 10 from the start. Most competitors still haven\'t caught up.' },
      { icon: '◎', title: 'Reps, not managers', desc: 'Every feature ships when it helps the person on the call. Not when it makes the manager dashboard look impressive.' },
      { icon: '▣', title: 'No hidden complexity', desc: 'No enterprise quotes. No per-seat negotiations. No SDK to install. A price on one screen and a tab in your browser.' },
    ];
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--about">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">ABOUT PITCHBASE</div>
            <h2 className="lp__sv-h2">Built by salespeople,<br />for salespeople.</h2>
            <p className="lp__sv-sub">
              We spent years losing deals in the last 30 seconds because we said the wrong thing.
              Pitchbase is the tool we always wished existed.
            </p>
          </div>

          {/* Stats bar */}
          <div className="lp__about-stats">
            {STATS.map((s, i) => (
              <div key={i} className="lp__about-stat">
                <div className="lp__about-stat-val">{s.value}</div>
                <div className="lp__about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="lp__about-story">
            <p>
              We spent years in outbound sales — cold calls, objection after objection, deals lost because
              we hesitated for two seconds too long. Every post-mortem pointed to the same problem: by the
              time a manager gave feedback, the moment was long gone.
            </p>
            <p>
              So we built the tool we always wished existed. An AI that listens in real time, detects objections
              the instant they're spoken, and surfaces the right response before the silence becomes rejection.
              No lag. No judgment. Just the right words, right now.
            </p>
            <p>
              Today, Pitchbase coaches reps in 10 languages across 40+ countries. We're a small team of
              engineers, salespeople, and linguists united by one belief: the best salespeople aren't born —
              they're built, rep by rep.
            </p>
          </div>

          {/* Values */}
          <div className="lp__info-grid">
            {VALUES.map((item, i) => (
              <div key={i} className="lp__info-card">
                <div className="lp__info-card-icon">{item.icon}</div>
                <div className="lp__info-card-title">{item.title}</div>
                <p className="lp__info-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="lp__sv-cta">
            <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
              <WinLogo /> Get for Windows
            </button>
            <p className="lp__sv-cta-note">Free plan · No credit card required</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Blog section view ─────────────────────────────────────────────────────

  if (activeSection === 'blog') {
    const [featured, ...rest] = BLOG_POSTS;
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--blog">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">BLOG</div>
            <h2 className="lp__sv-h2">The Pitchbase Sales Blog</h2>
            <p className="lp__sv-sub">Techniques, data, and ideas for reps who want to close more.</p>
          </div>

          {/* Featured post */}
          <div className="lp__blog-featured">
            <div className="lp__blog-featured-inner">
              <div className="lp__blog-featured-meta">
                <span className={`lp__blog-tag lp__blog-tag--${featured.tagColor}`}>{featured.tag}</span>
                <span className="lp__blog-meta">{featured.date} · {featured.readTime} read</span>
              </div>
              <div className="lp__blog-featured-title">{featured.title}</div>
              <p className="lp__blog-featured-excerpt">{featured.excerpt}</p>
              <button className="lp__blog-read lp__blog-read--featured">Read article →</button>
            </div>
          </div>

          {/* Remaining posts */}
          <div className="lp__blog-grid">
            {rest.map((post, i) => (
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
    const PERKS = [
      { icon: '◎', title: 'Fully remote', desc: 'Work from anywhere. Async-first culture — no mandatory stand-ups, no HQ politics.' },
      { icon: '✦', title: 'Ship from day one', desc: "No layers between you and the product. Week one you're in the codebase or talking to customers." },
      { icon: '◈', title: 'Competitive pay & equity', desc: 'Market-rate salary, meaningful equity, and a $1,500 home-office stipend. We don\'t underpay to test commitment.' },
      { icon: '▣', title: 'Learning budget', desc: '$1,200/year for courses, books, conferences, or tools that make you better at your job.' },
      { icon: '◷', title: 'Unlimited leave', desc: 'Take the time you need. We measure output, not hours. Minimum 25 days encouraged.' },
      { icon: '↗', title: 'Transparent roadmap', desc: 'Everyone sees the full product roadmap and P&L. No information silos.' },
    ];
    return (
      <div className="lp">
        {nav}
        <div className="lp__sv lp__sv--careers">
          <div className="lp__sv-hero">
            <div className="lp__sv-label">CAREERS</div>
            <h2 className="lp__sv-h2">Build the future of sales coaching</h2>
            <p className="lp__sv-sub">
              A small, remote team working on a problem that touches every sales rep on the planet.
              No politics, no nonsense — just great work and ambitious goals.
            </p>
          </div>

          {/* Perks grid */}
          <div className="lp__info-grid">
            {PERKS.map((item, i) => (
              <div key={i} className="lp__info-card">
                <div className="lp__info-card-icon">{item.icon}</div>
                <div className="lp__info-card-title">{item.title}</div>
                <p className="lp__info-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Open roles */}
          <div className="lp__careers-section-title">Open roles</div>
          <div className="lp__jobs-list">
            {JOB_LISTINGS.map((job, i) => (
              <div key={i} className="lp__job-row">
                <div className="lp__job-info">
                  <div className="lp__job-title">{job.title}</div>
                  <div className="lp__job-meta">
                    <span className="lp__job-team">{job.team}</span>
                    <span className="lp__job-sep">·</span>
                    <span>{job.location}</span>
                    <span className="lp__job-sep">·</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <button className="lp__btn lp__btn--outline lp__btn--sm" onClick={() => goSection('contact')}>Apply →</button>
              </div>
            ))}
          </div>

          <div className="lp__help-contact">
            <div className="lp__help-contact-icon">◈</div>
            <div className="lp__help-contact-text">
              Don't see the right role?<br />
              <span>Send a speculative application — we hire great people whenever we find them.</span>
            </div>
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
            <h2 className="lp__sv-h2">We read every message ourselves.</h2>
            <p className="lp__sv-sub">Small team, fast responses. Pick the right channel and we'll get back to you the same day.</p>
          </div>

          <div className="lp__contact-grid">
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">◎</div>
              <div className="lp__contact-card-title">Product support</div>
              <p className="lp__contact-card-desc">Questions about your account, billing, call quality, or how a feature works. We've got you.</p>
              <a className="lp__contact-link" href="mailto:support@pitchbase.ai">support@pitchbase.ai</a>
              <div className="lp__contact-sla">Avg. response: &lt; 4 hours</div>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">◈</div>
              <div className="lp__contact-card-title">Sales & partnerships</div>
              <p className="lp__contact-card-desc">Team plans, reseller deals, API access, or white-label enquiries. Let's talk numbers.</p>
              <a className="lp__contact-link" href="mailto:sales@pitchbase.ai">sales@pitchbase.ai</a>
              <div className="lp__contact-sla">Avg. response: &lt; 1 business day</div>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">✦</div>
              <div className="lp__contact-card-title">Press & media</div>
              <p className="lp__contact-card-desc">Writing about AI in sales, multilingual tools, or the future of coaching? We'll make it easy.</p>
              <a className="lp__contact-link" href="mailto:press@pitchbase.ai">press@pitchbase.ai</a>
              <div className="lp__contact-sla">Avg. response: &lt; 1 business day</div>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">▣</div>
              <div className="lp__contact-card-title">Legal & privacy</div>
              <p className="lp__contact-card-desc">Data subject requests, GDPR enquiries, DPA requests, or legal correspondence.</p>
              <a className="lp__contact-link" href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a>
              <div className="lp__contact-sla">GDPR response: within 30 days</div>
            </div>
          </div>

          <div className="lp__contact-note">
            <span className="lp__contact-note-icon">◷</span>
            Business hours: <strong>Mon–Fri, 9am–6pm GMT</strong>. Messages sent outside these hours are answered the next business morning.
          </div>
        </div>
      </div>
    );
  }

  // ─── Privacy Policy section view ───────────────────────────────────────────

  if (activeSection === 'privacy') {
    const toc = [
      { id: 'pp-1',  label: '1. Who we are' },
      { id: 'pp-2',  label: '2. Information we collect' },
      { id: 'pp-3',  label: '3. Legal bases for processing' },
      { id: 'pp-4',  label: '4. How we use your data' },
      { id: 'pp-5',  label: '5. Sharing & disclosure' },
      { id: 'pp-6',  label: '6. International transfers' },
      { id: 'pp-7',  label: '7. Data retention' },
      { id: 'pp-8',  label: '8. Security' },
      { id: 'pp-9',  label: '9. Your rights' },
      { id: 'pp-10', label: '10. Children\'s privacy' },
      { id: 'pp-11', label: '11. Cookies' },
      { id: 'pp-12', label: '12. Changes to this policy' },
      { id: 'pp-13', label: '13. Contact & complaints' },
    ];
    return (
      <div className="lp">
        {nav}
        <div className="lp__legal-page">
          <div className="lp__legal-header">
            <div className="lp__sv-label">LEGAL</div>
            <h1 className="lp__legal-title">Privacy Policy</h1>
            <p className="lp__legal-meta">Effective date: 1 April 2025 &nbsp;·&nbsp; Last updated: 6 April 2026</p>
            <p className="lp__legal-intro">
              Pitchbase ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains what information we collect, why we collect it, how we use it, and what rights you have in relation to it. It applies to all users of <strong>pitchbase.ai</strong> and the Pitchbase desktop and web application.
            </p>
            <div className="lp__legal-links">
              <button className="lp__legal-sibling" onClick={() => goSection('terms')}>Terms of Service →</button>
              <button className="lp__legal-sibling" onClick={() => goSection('cookies')}>Cookie Policy →</button>
            </div>
          </div>

          <div className="lp__legal-layout">
            <aside className="lp__legal-toc">
              <div className="lp__legal-toc-label">On this page</div>
              {toc.map(item => (
                <a key={item.id} className="lp__legal-toc-link" href={`#${item.id}`}>{item.label}</a>
              ))}
            </aside>

            <div className="lp__legal-content">

              <section id="pp-1" className="lp__legal-section">
                <h2>1. Who we are</h2>
                <p>Pitchbase is operated by <strong>Pitchbase Ltd</strong>, a company incorporated in England and Wales. We are the data controller for the personal data described in this policy. Our registered address is available upon written request to <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a>.</p>
              </section>

              <section id="pp-2" className="lp__legal-section">
                <h2>2. Information we collect</h2>
                <p><strong>Account data.</strong> When you create an account, we collect your name, email address, and (for paid plans) payment information. Payment card details are never stored by us — they are handled directly by Stripe, our PCI-DSS Level 1 certified payment processor.</p>
                <p><strong>Call and session data.</strong> During live calls and training sessions, speech recognition is performed locally in your browser using the Web Speech API. Raw audio is <em>never</em> transmitted to our servers. We receive only the transcribed text output. This text, along with AI suggestions, lead scores, call duration, and call stage, is saved to your account after each session.</p>
                <p><strong>Usage and technical data.</strong> We automatically collect standard technical information including your IP address, browser type and version, operating system, referring URL, pages visited within the application, feature interactions, session duration, and error logs. This information is used exclusively for product improvement and security monitoring.</p>
                <p><strong>Support communications.</strong> If you contact us for support, we retain the content of that communication and any information you choose to share to resolve your query.</p>
                <p><strong>Cookies and local storage.</strong> We use session cookies, local storage, and similar browser technologies. See Section 11 and our Cookie Policy for full details.</p>

                <div className="lp__privacy-summary">
                  <div className="lp__privacy-summary-title">◉ At a glance — what we store per call</div>
                  <div className="lp__privacy-summary-row lp__privacy-summary-row--safe">
                    <span className="lp__privacy-summary-icon">✓</span>
                    <span>Transcript text &amp; AI suggestions — stored per session, linked to your account only</span>
                  </div>
                  <div className="lp__privacy-summary-row lp__privacy-summary-row--safe">
                    <span className="lp__privacy-summary-icon">✓</span>
                    <span>Session stats (duration, objection count, close probability) — used for your Analytics</span>
                  </div>
                  <div className="lp__privacy-summary-row lp__privacy-summary-row--neutral">
                    <span className="lp__privacy-summary-icon">◎</span>
                    <span>Call config (prospect name, company, pitch) — stored locally in your browser &amp; in Supabase</span>
                  </div>
                  <div className="lp__privacy-summary-row lp__privacy-summary-row--never">
                    <span className="lp__privacy-summary-icon">✕</span>
                    <span>Audio — <strong>never</strong> recorded, never transmitted. Speech-to-text runs entirely in your browser</span>
                  </div>
                  <div className="lp__privacy-summary-row lp__privacy-summary-row--never">
                    <span className="lp__privacy-summary-icon">✕</span>
                    <span>Your data is <strong>never</strong> sold or shared with third parties for any commercial purpose</span>
                  </div>
                </div>
              </section>

              <section id="pp-3" className="lp__legal-section">
                <h2>3. Legal bases for processing (GDPR / UK GDPR)</h2>
                <p>For users in the European Economic Area (EEA) and the United Kingdom, we rely on the following legal bases under Article 6 of the GDPR / UK GDPR:</p>
                <ul className="lp__legal-list">
                  <li><strong>Contract (Art. 6(1)(b)):</strong> Processing your account data, call sessions, and CRM data is necessary to perform the contract (our Terms of Service) you have with us.</li>
                  <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> We process technical and usage data to detect fraud, secure our systems, and improve the product. Our legitimate interests do not override your rights where they would cause you harm.</li>
                  <li><strong>Legal obligation (Art. 6(1)(c)):</strong> We may process data where required to comply with applicable law, including tax and financial record-keeping obligations.</li>
                  <li><strong>Consent (Art. 6(1)(a)):</strong> Where we rely on consent (e.g., optional analytics cookies or marketing communications), you may withdraw that consent at any time without affecting the lawfulness of processing before withdrawal.</li>
                </ul>
              </section>

              <section id="pp-4" className="lp__legal-section">
                <h2>4. How we use your data</h2>
                <ul className="lp__legal-list">
                  <li>To provide, operate, and maintain the Pitchbase service.</li>
                  <li>To process payments and send transactional communications (receipts, billing alerts, password resets).</li>
                  <li>To generate and display AI-powered coaching suggestions, post-call analysis, lead scores, and follow-up emails within your account.</li>
                  <li>To provide customer support and respond to queries.</li>
                  <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                  <li>To monitor and improve the performance, security, and reliability of the service.</li>
                  <li>To send product update emails where you have opted in.</li>
                </ul>
                <p><strong>We do not sell your personal data.</strong> We do not share your call transcripts, CRM data, or any personally identifiable information with third parties for marketing or advertising purposes. We do not use your call transcripts to train our own or third-party AI models without your explicit, freely given consent.</p>
              </section>

              <section id="pp-5" className="lp__legal-section">
                <h2>5. Sharing & disclosure</h2>
                <p>We share data only in the following limited circumstances:</p>
                <ul className="lp__legal-list">
                  <li><strong>Service providers (processors).</strong> We use third-party vendors who act as data processors on our behalf: <strong>Supabase</strong> (database, authentication, and storage), <strong>Stripe</strong> (payment processing), and <strong>OpenAI</strong> (AI-generated coaching suggestions, post-call analysis, and follow-up email generation). Each vendor is bound by a Data Processing Agreement (DPA) and may not use your data for their own purposes. A full list of sub-processors is available on request.</li>
                  <li><strong>Legal requirements.</strong> We may disclose your data where required by law, court order, or to cooperate with law enforcement agencies, provided we are legally permitted to notify you before doing so.</li>
                  <li><strong>Business transfers.</strong> If Pitchbase Ltd is acquired by or merges with another company, your data may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website before any transfer and before your data becomes subject to a different privacy policy.</li>
                  <li><strong>With your consent.</strong> We may share information for any other purpose with your explicit prior consent.</li>
                </ul>
              </section>

              <section id="pp-6" className="lp__legal-section">
                <h2>6. International data transfers</h2>
                <p>Your data may be stored or processed in countries outside the EEA and UK, including the United States, where our service providers operate infrastructure. Where such transfers occur, we ensure they are protected by appropriate safeguards:</p>
                <ul className="lp__legal-list">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission and/or the UK Information Commissioner's Office (ICO).</li>
                  <li>Adequacy decisions where applicable.</li>
                  <li>Binding corporate rules where applicable.</li>
                </ul>
                <p>You may request a copy of the relevant transfer mechanism by contacting <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a>.</p>
              </section>

              <section id="pp-7" className="lp__legal-section">
                <h2>7. Data retention</h2>
                <p>We retain your personal data only for as long as necessary to fulfil the purposes described in this policy, or as required by law. Specifically:</p>
                <ul className="lp__legal-list">
                  <li><strong>Account and CRM data:</strong> Retained for the duration of your active account.</li>
                  <li><strong>Call transcripts and session data:</strong> Retained for the duration of your active account. You may delete individual sessions at any time from your dashboard.</li>
                  <li><strong>Post-cancellation:</strong> Following account cancellation, your data remains accessible for 30 days to allow data export. After 30 days, all personal data is permanently and irreversibly deleted from our systems, except where retention is required by applicable law (e.g., financial records required for 7 years under UK law).</li>
                  <li><strong>Support communications:</strong> Retained for 3 years from the date of last interaction.</li>
                  <li><strong>Anonymised usage analytics:</strong> May be retained indefinitely as they cannot be linked to you personally.</li>
                </ul>
              </section>

              <section id="pp-8" className="lp__legal-section">
                <h2>8. Security</h2>
                <p>We implement industry-standard technical and organisational measures to protect your data against accidental or unlawful destruction, loss, alteration, and unauthorised disclosure or access. These measures include:</p>
                <ul className="lp__legal-list">
                  <li>Encryption at rest using AES-256.</li>
                  <li>Encryption in transit using TLS 1.2 or higher (TLS 1.3 preferred).</li>
                  <li>Role-based access controls: only authorised personnel can access personal data, on a need-to-know basis.</li>
                  <li>Regular security reviews and dependency audits.</li>
                  <li>Supabase Row-Level Security (RLS) ensuring each user can only access their own data.</li>
                </ul>
                <p>In the event of a personal data breach that is likely to result in a high risk to your rights and freedoms, we will notify you without undue delay and in any event within 72 hours of becoming aware of it, in accordance with applicable law.</p>
              </section>

              <section id="pp-9" className="lp__legal-section">
                <h2>9. Your rights</h2>
                <p>Depending on your location, you have the following rights regarding your personal data. We will respond to all verified requests within <strong>30 days</strong> (extendable by a further two months for complex requests, with notice).</p>
                <ul className="lp__legal-list">
                  <li><strong>Right of access (Art. 15 GDPR):</strong> You may request a copy of all personal data we hold about you.</li>
                  <li><strong>Right to rectification (Art. 16 GDPR):</strong> You may ask us to correct inaccurate or incomplete data.</li>
                  <li><strong>Right to erasure / "right to be forgotten" (Art. 17 GDPR):</strong> You may request deletion of your data where it is no longer necessary, you withdraw consent, or you object to processing.</li>
                  <li><strong>Right to data portability (Art. 20 GDPR):</strong> You may request your data in a structured, commonly used, machine-readable format (JSON/CSV).</li>
                  <li><strong>Right to restriction of processing (Art. 18 GDPR):</strong> You may ask us to restrict processing of your data in certain circumstances.</li>
                  <li><strong>Right to object (Art. 21 GDPR):</strong> You may object to processing based on legitimate interests at any time. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests.</li>
                  <li><strong>Rights related to automated decision-making (Art. 22 GDPR):</strong> Our AI-generated lead scores and coaching suggestions are tools to assist you — they do not constitute automated decisions that produce legal or similarly significant effects about you.</li>
                  <li><strong>California residents (CCPA/CPRA):</strong> You have the right to know what personal information is collected, disclosed, or sold, the right to delete, the right to opt out of sale (we do not sell data), and the right to non-discrimination for exercising these rights.</li>
                </ul>
                <p>To exercise any of these rights, email <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a> from the email address associated with your account, or use the data export/deletion tools in your account settings.</p>
              </section>

              <section id="pp-10" className="lp__legal-section">
                <h2>10. Children's privacy</h2>
                <p>Pitchbase is a business-to-business sales tool. We do not knowingly collect personal data from anyone under the age of 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a> and we will delete the information promptly.</p>
              </section>

              <section id="pp-11" className="lp__legal-section">
                <h2>11. Cookies</h2>
                <p>We use cookies and similar tracking technologies to operate the service and, with your consent, to understand how it is used. Please see our <button className="lp__legal-inline-link" onClick={() => goSection('cookies')}>Cookie Policy</button> for a full list of cookies, their purposes, and instructions on how to control them.</p>
              </section>

              <section id="pp-12" className="lp__legal-section">
                <h2>12. Changes to this policy</h2>
                <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email (to the address associated with your account) and by posting a notice in the application at least 14 days before the changes take effect. The "Last updated" date at the top of this page will always reflect the most recent revision. Your continued use of Pitchbase after changes take effect constitutes acceptance of the updated policy.</p>
              </section>

              <section id="pp-13" className="lp__legal-section">
                <h2>13. Contact & complaints</h2>
                <p>For any questions, concerns, or requests relating to this Privacy Policy or your personal data, please contact us at:</p>
                <div className="lp__legal-contact-block">
                  <div><strong>Email:</strong> <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a></div>
                  <div><strong>Response time:</strong> Within 5 business days for general queries; within 30 days for formal rights requests.</div>
                </div>
                <p>If you are in the EEA or UK and are not satisfied with our response, you have the right to lodge a complaint with your local data protection supervisory authority. In the UK, this is the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">Information Commissioner's Office (ICO)</a>. In Ireland, it is the <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer">Data Protection Commission (DPC)</a>.</p>
              </section>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Terms of Service section view ─────────────────────────────────────────

  if (activeSection === 'terms') {
    const toc = [
      { id: 'tos-1',  label: '1. Acceptance & eligibility' },
      { id: 'tos-2',  label: '2. Description of service' },
      { id: 'tos-3',  label: '3. Account registration' },
      { id: 'tos-4',  label: '4. Subscription & billing' },
      { id: 'tos-5',  label: '5. Free plan' },
      { id: 'tos-6',  label: '6. Cancellation & refunds' },
      { id: 'tos-7',  label: '7. Acceptable use' },
      { id: 'tos-8',  label: '8. Prohibited conduct' },
      { id: 'tos-9',  label: '9. Intellectual property' },
      { id: 'tos-10', label: '10. User content & data' },
      { id: 'tos-11', label: '11. Third-party integrations' },
      { id: 'tos-12', label: '12. Disclaimers' },
      { id: 'tos-13', label: '13. Limitation of liability' },
      { id: 'tos-14', label: '14. Indemnification' },
      { id: 'tos-15', label: '15. Dispute resolution' },
      { id: 'tos-16', label: '16. Governing law' },
      { id: 'tos-17', label: '17. General provisions' },
      { id: 'tos-18', label: '18. Changes to these terms' },
      { id: 'tos-19', label: '19. Contact' },
    ];
    return (
      <div className="lp">
        {nav}
        <div className="lp__legal-page">
          <div className="lp__legal-header">
            <div className="lp__sv-label">LEGAL</div>
            <h1 className="lp__legal-title">Terms of Service</h1>
            <p className="lp__legal-meta">Effective date: 1 April 2025 &nbsp;·&nbsp; Last updated: 6 April 2026</p>
            <p className="lp__legal-intro">
              These Terms of Service ("Terms") form a legally binding agreement between <strong>Pitchbase Ltd</strong> ("Pitchbase", "we", "us") and you ("User", "you"). Please read them carefully before using the service. By creating an account or using Pitchbase, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <div className="lp__legal-links">
              <button className="lp__legal-sibling" onClick={() => goSection('privacy')}>Privacy Policy →</button>
              <button className="lp__legal-sibling" onClick={() => goSection('cookies')}>Cookie Policy →</button>
            </div>
          </div>

          <div className="lp__legal-layout">
            <aside className="lp__legal-toc">
              <div className="lp__legal-toc-label">On this page</div>
              {toc.map(item => (
                <a key={item.id} className="lp__legal-toc-link" href={`#${item.id}`}>{item.label}</a>
              ))}
            </aside>

            <div className="lp__legal-content">

              <section id="tos-1" className="lp__legal-section">
                <h2>1. Acceptance & eligibility</h2>
                <p>By accessing or using Pitchbase, you confirm that: (a) you are at least 18 years of age; (b) you have the legal capacity to enter into binding contracts; and (c) your use of the service complies with all applicable laws and regulations in your jurisdiction.</p>
                <p>If you are using Pitchbase on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms, and references to "you" shall include that organisation.</p>
              </section>

              <section id="tos-2" className="lp__legal-section">
                <h2>2. Description of service</h2>
                <p>Pitchbase is an AI-powered sales coaching platform that provides real-time coaching suggestions during sales calls, training scenarios, post-call analysis, CRM functionality, and related tools ("Service"). The Service is provided via a web application and optional desktop client.</p>
                <p>We reserve the right to modify, suspend, or discontinue any feature or aspect of the Service at any time with reasonable notice, except where immediate action is required for security, legal, or operational reasons.</p>
              </section>

              <section id="tos-3" className="lp__legal-section">
                <h2>3. Account registration & security</h2>
                <p>You must register for an account to use the Service. You agree to: (a) provide accurate, current, and complete registration information; (b) maintain and promptly update your information; (c) keep your password confidential and not share it with any third party; and (d) notify us immediately at <a href="mailto:support@pitchbase.ai">support@pitchbase.ai</a> if you suspect unauthorised access to your account.</p>
                <p>You are responsible for all activity that occurs under your account. Pitchbase will not be liable for any loss or damage arising from your failure to comply with these security obligations.</p>
              </section>

              <section id="tos-4" className="lp__legal-section">
                <h2>4. Subscription plans & billing</h2>
                <p><strong>Billing cycle.</strong> Paid plans are billed monthly in advance on the anniversary of your subscription start date. Prices are displayed in USD. All fees are exclusive of applicable taxes (VAT, GST, etc.), which are added at checkout where required by law.</p>
                <p><strong>Payment.</strong> You authorise us (via Stripe) to charge your designated payment method for all fees due. If payment fails, we will retry and may suspend your account after 7 days of non-payment, with prior notice.</p>
                <p><strong>Price changes.</strong> We may change subscription prices with at least 30 days' advance notice by email. Continued use of the Service after the notice period constitutes acceptance of the new pricing. If you do not accept the new price, you may cancel before the new pricing takes effect.</p>
                <p><strong>Taxes.</strong> You are responsible for all taxes associated with your purchase except those based on Pitchbase's net income. Where we are legally required to collect taxes, they will appear on your invoice.</p>
              </section>

              <section id="tos-5" className="lp__legal-section">
                <h2>5. Free plan</h2>
                <p>We may offer a free tier with limited functionality. Free plans are provided "as is" without service level commitments, and we reserve the right to modify or discontinue free tiers at any time with 30 days' notice. Accounts that are inactive for 12 consecutive months on the free plan may be deleted after notice.</p>
              </section>

              <section id="tos-6" className="lp__legal-section">
                <h2>6. Cancellation & refunds</h2>
                <p><strong>Cancellation.</strong> You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the end of the period for which you have already paid.</p>
                <p><strong>Money-back guarantee.</strong> Paid plans include a <strong>7-day money-back guarantee</strong> from the date of your first paid payment. To request a refund under this guarantee, email <a href="mailto:support@pitchbase.ai">support@pitchbase.ai</a> within 7 days of your initial charge. Refunds are not available after this period except where required by applicable consumer protection law (including UK Consumer Contracts Regulations 2013).</p>
                <p><strong>No partial refunds.</strong> We do not provide prorated refunds for unused time within a billing period, except where required by law.</p>
              </section>

              <section id="tos-7" className="lp__legal-section">
                <h2>7. Acceptable use</h2>
                <p>You agree to use Pitchbase only for lawful business sales and communication purposes and in accordance with these Terms. In particular:</p>
                <ul className="lp__legal-list">
                  <li>You must obtain all legally required consents before recording or processing any call or conversation involving a third party, in compliance with applicable wiretapping, recording, and data protection laws in your jurisdiction (including but not limited to the Electronic Communications Privacy Act (ECPA) in the US, the Regulation of Investigatory Powers Act (RIPA) in the UK, and equivalent laws elsewhere).</li>
                  <li>You must not use the Service to make misleading, deceptive, or fraudulent representations to prospects in violation of applicable consumer protection, telemarketing, or unfair commercial practices law.</li>
                  <li>You must not use the Service to contact individuals on Do Not Call registries in any jurisdiction where such registries apply.</li>
                </ul>
              </section>

              <section id="tos-8" className="lp__legal-section">
                <h2>8. Prohibited conduct</h2>
                <p>You must not, directly or indirectly:</p>
                <ul className="lp__legal-list">
                  <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service.</li>
                  <li>Copy, modify, distribute, sell, resell, or sublicense access to the Service.</li>
                  <li>Use automated scripts, bots, scrapers, or crawlers to access or extract data from the Service.</li>
                  <li>Attempt to probe, scan, or test the vulnerability of the Service or any related infrastructure.</li>
                  <li>Circumvent or disable any security, rate-limiting, or access control mechanism.</li>
                  <li>Upload, transmit, or store any content that is unlawful, harmful, threatening, abusive, defamatory, or that infringes third-party intellectual property rights.</li>
                  <li>Use the Service in any way that could damage, disable, overburden, or impair our infrastructure or interfere with other users.</li>
                  <li>Impersonate any person or entity, or falsely claim affiliation with any person or entity.</li>
                </ul>
                <p>Violation of this section may result in immediate account termination without refund and, where applicable, referral to law enforcement authorities.</p>
              </section>

              <section id="tos-9" className="lp__legal-section">
                <h2>9. Intellectual property</h2>
                <p><strong>Our IP.</strong> Pitchbase, its logo, software, design, code, algorithms, text, graphics, and all other content comprising the Service are owned by or licensed to Pitchbase Ltd and protected by copyright, trade mark, and other intellectual property laws. No rights are granted to you except as expressly set out in these Terms.</p>
                <p><strong>Feedback.</strong> If you provide us with feedback, suggestions, or ideas about the Service, you grant us an irrevocable, perpetual, royalty-free, worldwide licence to use that feedback for any purpose without compensation to you.</p>
              </section>

              <section id="tos-10" className="lp__legal-section">
                <h2>10. User content & data</h2>
                <p><strong>Ownership.</strong> You retain full ownership of all data you generate using the Service, including call transcripts, notes, CRM records, and follow-up emails ("User Data").</p>
                <p><strong>Licence to us.</strong> You grant Pitchbase a limited, non-exclusive, royalty-free licence to store, process, and display your User Data solely to the extent necessary to provide the Service to you. This licence terminates when you delete your account or the relevant data.</p>
                <p><strong>No training use.</strong> We will not use your User Data to train or fine-tune any AI model without your explicit, separately obtained written consent.</p>
                <p><strong>Data export.</strong> You may export your data at any time from your account settings in JSON format. Following account deletion, data is permanently deleted within 30 days as described in our Privacy Policy.</p>
              </section>

              <section id="tos-11" className="lp__legal-section">
                <h2>11. Third-party integrations</h2>
                <p>The Service uses third-party providers including OpenAI (AI model inference), Supabase (data storage), and Stripe (payment processing). These providers have their own terms and privacy policies. Pitchbase is not responsible for the acts or omissions of third-party providers. We select third-party processors carefully and hold them to strict data processing standards, but we cannot guarantee their continuous availability or service quality.</p>
                <p>Service availability may be affected by the availability of third-party APIs. We do not guarantee uninterrupted service and will not be liable for downtime caused by third-party dependencies.</p>
              </section>

              <section id="tos-12" className="lp__legal-section">
                <h2>12. Disclaimers & warranties</h2>
                <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
                <p>In particular, we make no warranty that: (a) speech recognition will be accurate or error-free; (b) AI coaching suggestions will be appropriate for every sales situation; (c) the Service will improve your individual sales results; or (d) the Service will be uninterrupted, timely, secure, or free from errors.</p>
                <p>Nothing in these Terms limits or excludes any warranties that cannot be excluded under applicable law (including the UK Consumer Rights Act 2015 where applicable).</p>
              </section>

              <section id="tos-13" className="lp__legal-section">
                <h2>13. Limitation of liability</h2>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PITCHBASE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES) ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
                <p>OUR AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID TO US IN THE <strong>12 MONTHS</strong> PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR £100 (GBP), WHICHEVER IS GREATER.</p>
                <p>Nothing in these Terms limits our liability for: (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability that cannot be limited or excluded by law.</p>
              </section>

              <section id="tos-14" className="lp__legal-section">
                <h2>14. Indemnification</h2>
                <p>You agree to indemnify, defend, and hold harmless Pitchbase Ltd, its officers, directors, employees, and agents from and against any third-party claims, liabilities, damages, judgments, awards, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to: (a) your violation of these Terms; (b) your use of the Service in breach of applicable law; or (c) any content you submit to or transmit through the Service that infringes third-party rights.</p>
              </section>

              <section id="tos-15" className="lp__legal-section">
                <h2>15. Dispute resolution</h2>
                <p><strong>Good faith resolution.</strong> Before initiating formal proceedings, you agree to contact us at <a href="mailto:legal@pitchbase.ai">legal@pitchbase.ai</a> and give us 30 days to attempt to resolve the dispute informally.</p>
                <p><strong>Consumer ADR.</strong> If you are a consumer located in the UK or EU and your dispute cannot be resolved informally, you may be entitled to use an Alternative Dispute Resolution (ADR) scheme. We are willing to participate in ADR proceedings conducted by the Centre for Effective Dispute Resolution (CEDR) or equivalent EU ADR entity.</p>
                <p><strong>Class action waiver.</strong> To the extent permitted by applicable law, you and Pitchbase agree that any dispute resolution proceedings will be conducted on an individual basis only, and not as a class, consolidated, or representative action.</p>
              </section>

              <section id="tos-16" className="lp__legal-section">
                <h2>16. Governing law & jurisdiction</h2>
                <p>These Terms are governed by and construed in accordance with the laws of <strong>England and Wales</strong>, without regard to its conflict of law principles. Subject to Section 15, each party submits to the exclusive jurisdiction of the courts of England and Wales.</p>
                <p>If you are a consumer residing in the EU, you may also bring proceedings in the courts of your country of residence under applicable EU consumer protection law. If you are a consumer residing in the UK, the mandatory consumer protection provisions of UK law apply regardless of the governing law chosen here.</p>
              </section>

              <section id="tos-17" className="lp__legal-section">
                <h2>17. General provisions</h2>
                <p><strong>Entire agreement.</strong> These Terms (together with the Privacy Policy and Cookie Policy) constitute the entire agreement between you and Pitchbase regarding the Service and supersede all prior agreements and understandings.</p>
                <p><strong>Severability.</strong> If any provision of these Terms is held invalid or unenforceable, the remaining provisions will continue in full force and effect.</p>
                <p><strong>No waiver.</strong> Our failure to enforce any provision of these Terms will not be construed as a waiver of our right to enforce that or any other provision in the future.</p>
                <p><strong>Assignment.</strong> You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights to any affiliate or successor in connection with a merger, acquisition, or sale of assets.</p>
                <p><strong>Force majeure.</strong> Neither party shall be liable for failure or delay in performance caused by circumstances beyond its reasonable control, including natural disasters, government actions, or third-party network failures.</p>
              </section>

              <section id="tos-18" className="lp__legal-section">
                <h2>18. Changes to these Terms</h2>
                <p>We may modify these Terms at any time. For material changes, we will provide at least <strong>14 days' notice</strong> via email and/or an in-app notification before changes take effect. Your continued use of the Service after the notice period constitutes your acceptance of the revised Terms. If you do not accept the changes, you must stop using the Service and cancel your subscription before they take effect.</p>
              </section>

              <section id="tos-19" className="lp__legal-section">
                <h2>19. Contact</h2>
                <p>For legal queries, please contact us at:</p>
                <div className="lp__legal-contact-block">
                  <div><strong>Legal matters:</strong> <a href="mailto:legal@pitchbase.ai">legal@pitchbase.ai</a></div>
                  <div><strong>Support:</strong> <a href="mailto:support@pitchbase.ai">support@pitchbase.ai</a></div>
                  <div><strong>Privacy matters:</strong> <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a></div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cookie Policy section view ────────────────────────────────────────────

  if (activeSection === 'cookies') {
    const toc = [
      { id: 'cp-1', label: '1. What are cookies?' },
      { id: 'cp-2', label: '2. Cookies we use' },
      { id: 'cp-3', label: '3. Cookie table' },
      { id: 'cp-4', label: '4. Third-party cookies' },
      { id: 'cp-5', label: '5. How to control cookies' },
      { id: 'cp-6', label: '6. Changes to this policy' },
      { id: 'cp-7', label: '7. Contact' },
    ];
    return (
      <div className="lp">
        {nav}
        <div className="lp__legal-page">
          <div className="lp__legal-header">
            <div className="lp__sv-label">LEGAL</div>
            <h1 className="lp__legal-title">Cookie Policy</h1>
            <p className="lp__legal-meta">Effective date: 1 April 2025 &nbsp;·&nbsp; Last updated: 6 April 2026</p>
            <p className="lp__legal-intro">
              This Cookie Policy explains what cookies are, which cookies Pitchbase uses, why we use them, and how you can control them. It should be read alongside our <button className="lp__legal-inline-link" onClick={() => goSection('privacy')}>Privacy Policy</button>.
            </p>
            <div className="lp__legal-links">
              <button className="lp__legal-sibling" onClick={() => goSection('privacy')}>Privacy Policy →</button>
              <button className="lp__legal-sibling" onClick={() => goSection('terms')}>Terms of Service →</button>
            </div>
          </div>

          <div className="lp__legal-layout">
            <aside className="lp__legal-toc">
              <div className="lp__legal-toc-label">On this page</div>
              {toc.map(item => (
                <a key={item.id} className="lp__legal-toc-link" href={`#${item.id}`}>{item.label}</a>
              ))}
            </aside>

            <div className="lp__legal-content">

              <section id="cp-1" className="lp__legal-section">
                <h2>1. What are cookies?</h2>
                <p>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, improve user experience, and provide information to site owners. Alongside cookies, we may also use similar technologies such as local storage and session storage, which are governed by this same policy.</p>
                <p>Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (remaining on your device for a set period or until you delete them). They can be set by us ("first-party") or by third-party services we embed.</p>
              </section>

              <section id="cp-2" className="lp__legal-section">
                <h2>2. Cookies we use</h2>
                <p>We use three categories of cookies:</p>
                <ul className="lp__legal-list">
                  <li><strong>Strictly necessary cookies</strong> — essential for the Service to function. These cannot be disabled without breaking core functionality (authentication, security). They do not require your consent under applicable law.</li>
                  <li><strong>Functional cookies</strong> — remember your preferences (theme, language) to improve your experience. These are set only if you have not disabled them in your browser.</li>
                  <li><strong>Analytics cookies</strong> — help us understand how users interact with the Service (pages visited, features used, session duration). These are set only with your consent, expressed when you first use the Service.</li>
                </ul>
                <p>We do <strong>not</strong> use advertising, behavioural targeting, or cross-site tracking cookies.</p>
              </section>

              <section id="cp-3" className="lp__legal-section">
                <h2>3. Cookie table</h2>
                <div className="lp__cookie-table-wrap">
                  <table className="lp__cookie-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Purpose</th>
                        <th>Duration</th>
                        <th>Party</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>sb-access-token</code></td>
                        <td><span className="lp__cookie-tag lp__cookie-tag--necessary">Necessary</span></td>
                        <td>Supabase authentication JWT — keeps you logged in</td>
                        <td>1 hour (auto-refreshed)</td>
                        <td>First-party</td>
                      </tr>
                      <tr>
                        <td><code>sb-refresh-token</code></td>
                        <td><span className="lp__cookie-tag lp__cookie-tag--necessary">Necessary</span></td>
                        <td>Supabase long-lived refresh token for session renewal</td>
                        <td>60 days</td>
                        <td>First-party</td>
                      </tr>
                      <tr>
                        <td><code>pp-theme</code></td>
                        <td><span className="lp__cookie-tag lp__cookie-tag--functional">Functional</span></td>
                        <td>Stores your dark/light mode preference (localStorage)</td>
                        <td>Persistent</td>
                        <td>First-party</td>
                      </tr>
                      <tr>
                        <td><code>pp-lang</code></td>
                        <td><span className="lp__cookie-tag lp__cookie-tag--functional">Functional</span></td>
                        <td>Stores your preferred coaching language (localStorage)</td>
                        <td>Persistent</td>
                        <td>First-party</td>
                      </tr>
                      <tr>
                        <td><code>pp-streak</code></td>
                        <td><span className="lp__cookie-tag lp__cookie-tag--functional">Functional</span></td>
                        <td>Tracks your daily practice streak (localStorage)</td>
                        <td>Persistent</td>
                        <td>First-party</td>
                      </tr>
                      <tr>
                        <td><code>_pp_analytics</code></td>
                        <td><span className="lp__cookie-tag lp__cookie-tag--analytics">Analytics</span></td>
                        <td>Aggregated, anonymised session analytics (feature usage, error rates). Set only with consent.</td>
                        <td>13 months</td>
                        <td>First-party</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="cp-4" className="lp__legal-section">
                <h2>4. Third-party cookies</h2>
                <p>Our payment provider <strong>Stripe</strong> may set cookies during checkout to prevent fraud and ensure payment security. These are strictly necessary for the transaction and are governed by <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">Stripe's Cookie Policy</a>.</p>
                <p>We do not embed any social media widgets, advertising networks, or other third-party tracking scripts that would set their own cookies on our domain.</p>
              </section>

              <section id="cp-5" className="lp__legal-section">
                <h2>5. How to control cookies</h2>
                <p><strong>Browser settings.</strong> You can control or delete cookies through your browser settings. Note that disabling strictly necessary cookies (Supabase session tokens) will prevent you from logging in. Disabling analytics or functional cookies will not affect the core service.</p>
                <p>Instructions for the most common browsers:</p>
                <ul className="lp__legal-list">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                </ul>
                <p><strong>Analytics opt-out.</strong> You may withdraw consent for analytics cookies at any time by clearing the <code>_pp_analytics</code> cookie in your browser and declining when prompted. This will not affect data collected before withdrawal.</p>
                <p><strong>Do Not Track.</strong> Some browsers allow you to set a "Do Not Track" signal. We respect this signal and do not set analytics cookies when it is active.</p>
              </section>

              <section id="cp-6" className="lp__legal-section">
                <h2>6. Changes to this policy</h2>
                <p>We may update this Cookie Policy when we add or remove cookies. Changes will be reflected with an updated "Last updated" date. For significant changes (e.g., adding new third-party cookies), we will provide in-app notice and, where required by law, ask for fresh consent.</p>
              </section>

              <section id="cp-7" className="lp__legal-section">
                <h2>7. Contact</h2>
                <p>Questions about our use of cookies? Email <a href="mailto:privacy@pitchbase.ai">privacy@pitchbase.ai</a>. We aim to respond within 5 business days.</p>
              </section>

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
            Real-time coaching. Post-call AI analysis. Works on phone calls,
            Zoom, Teams, Meet - in 10 languages. Native Windows desktop app.
          </p>
          <div className="lp__hero-actions">
            <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
              <WinLogo /> Get for Windows
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
              <span className="lp__terminal-title">PITCHBASE - LIVE</span>
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
        <div className="lp__trust-item">✓ Windows 10 &amp; 11</div>
        <div className="lp__trust-sep" />
        <div className="lp__trust-item">✓ 7-day money-back guarantee</div>
        <div className="lp__trust-sep" />
        <div className="lp__trust-item">✓ No browser needed</div>
        <div className="lp__trust-sep" />
        <div className="lp__trust-item">✓ 10 languages supported</div>
      </div>

      {/* ── Live Demo ── */}
      <section id="features" className="lp__section lp__section--demo-scene">
        <div className="lp__section-label reveal">SEE IT IN ACTION</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Your AI co-pilot, live on every call</h2>
        <p className="lp__section-sub reveal" data-delay="0.18">
          Pitchbase listens in real time, transcribes every word, and surfaces the right response the moment your prospect speaks — objection handlers, close prompts, and buying signal alerts.
        </p>

        {/* ── Desktop demo ── */}
        <div className={`lp__desktop-demo lp__desktop-demo--${demoPhase}`}>

          {/* Fake desktop wallpaper */}
          <div className="lp__desktop-bg" />

          {/* Fake system bar */}
          <div className="lp__desktop-bar">
            <div className="lp__desktop-bar-left">
              <span className="lp__desktop-bar-dot" />
              <span className="lp__desktop-bar-dot" />
              <span className="lp__desktop-bar-dot" />
              <span className="lp__desktop-bar-icon">⊞</span>
            </div>
            <div className="lp__desktop-bar-right">
              <span className="lp__desktop-bar-time">2:47 PM</span>
            </div>
          </div>

          {/* Pitchbase minimized pill (visible when minimized) */}
          <div className="lp__mini-pill">
            <span className="lp__mini-pill-logo">✦</span>
            <span className="lp__mini-pill-sep">›</span>
            <span className="lp__mini-pill-hide">Hide</span>
            <span className="lp__mini-pill-stop">◼</span>
          </div>

          {/* Minimized suggestion banner */}
          <div className="lp__mini-suggestion">
            <span className={`lp__mini-badge lp__mini-badge--${DEMO_SCENES[desktopSceneIdx].badgeType}`}>
              {DEMO_SCENES[desktopSceneIdx].badge}
            </span>
            <span className="lp__mini-text">&ldquo;{DEMO_SCENES[desktopSceneIdx].suggestion.slice(0, 72)}…&rdquo;</span>
          </div>

          {/* Video call window */}
          <div className="lp__vc-window">
            {/* Video tiles */}
            <div className="lp__vc-tiles">
              <div className="lp__vc-tile lp__vc-tile--a">
                <div className="lp__vc-avatar">JD</div>
                <span className="lp__vc-name">You</span>
              </div>
              <div className="lp__vc-tile lp__vc-tile--b">
                <div className="lp__vc-avatar lp__vc-avatar--b">SC</div>
                <span className="lp__vc-name">Sarah Chen</span>
              </div>
            </div>

            {/* Pitchbase overlay panel (expanded state) */}
            <div className="lp__pb-overlay">
              <div className="lp__pb-overlay-header">
                <span className="lp__pb-overlay-logo">✦ Pitchbase</span>
                <span className={`lp__pb-overlay-badge lp__pb-overlay-badge--${DEMO_SCENES[desktopSceneIdx].badgeType}`}>
                  {DEMO_SCENES[desktopSceneIdx].badge}
                </span>
              </div>
              <p className={`lp__pb-overlay-text${desktopShowSuggestion ? ' lp__pb-overlay-text--show' : ''}`}>
                &ldquo;{DEMO_SCENES[desktopSceneIdx].suggestion}&rdquo;
              </p>
              <div className="lp__pb-overlay-tabs">
                <span className="lp__pb-tab lp__pb-tab--active">Assist</span>
                <span className="lp__pb-tab-sep">·</span>
                <span className="lp__pb-tab">What should I say?</span>
                <span className="lp__pb-tab-sep">·</span>
                <span className="lp__pb-tab">Recap</span>
              </div>
              <div className="lp__pb-overlay-input">
                <span className="lp__pb-input-placeholder">Ask about your screen or conversation…</span>
                <button className="lp__pb-send">▶</button>
              </div>
            </div>

            {/* Call toolbar */}
            <div className="lp__vc-toolbar">
              <button className="lp__vc-btn">
                <span className="lp__vc-btn-icon">🎤</span>
                <span className="lp__vc-btn-label">Mute</span>
              </button>
              <button className="lp__vc-btn">
                <span className="lp__vc-btn-icon">📷</span>
                <span className="lp__vc-btn-label">Video</span>
              </button>
              <button className={`lp__vc-btn lp__vc-btn--share${demoPhase === 'clicking' ? ' lp__vc-btn--hovered' : ''}`}>
                <span className="lp__vc-btn-icon">⬆</span>
                <span className="lp__vc-btn-label">Share Screen</span>
              </button>
              <button className="lp__vc-btn lp__vc-btn--end">End</button>
            </div>
          </div>

          {/* Animated cursor */}
          <div className={`lp__cursor-dot lp__cursor-dot--${demoPhase}`} />
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

      {/* ── Languages ── */}
      <section id="languages" className="lp__section lp__section--alt">
        <div className="lp__section-label reveal">MULTILINGUAL</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Sell in 10 languages</h2>
        <p className="lp__section-sub reveal" data-delay="0.18">
          Competitors coach only in English. Pitchbase coaches in your language 
          real-time objection handling and post-call analysis, all localised.
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
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Why Pitchbase over the alternatives?</h2>
        <div className="lp__compare-wrap reveal" data-delay="0.18">
          <table className="lp__compare">
            <thead>
              <tr>
                <th className="lp__compare-feature-col">Feature</th>
                <th className="lp__compare-us-col">Pitchbase</th>
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

        <div className="lp__billing-toggle reveal" data-delay="0.08">
          <button
            className={`lp__billing-btn${billingCycle === 'monthly' ? ' lp__billing-btn--active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`lp__billing-btn${billingCycle === 'yearly' ? ' lp__billing-btn--active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className="lp__billing-save">Save ~16%</span>
          </button>
        </div>

        <div className="lp__pricing-grid reveal" data-delay="0.12">

          {/* STARTER */}
          <div className="lp__pricing-card">
            <div className="lp__pricing-tier">STARTER</div>
            <div className="lp__pricing-price">${billingCycle === 'yearly' ? 16 : 19}<span>/month</span></div>
            {billingCycle === 'yearly' && <div className="lp__pricing-billed-note">billed $192/yr</div>}
            <div className="lp__pricing-desc">For reps learning the ropes</div>
            <div className="lp__pricing-divider" />
            <ul className="lp__pricing-features">
              {['15 live calls / month','English & Spanish only','Basic post-call summary','Community support'].map((f,i) => (
                <li key={i} className="lp__pricing-feature lp__pricing-feature--yes"><span className="lp__pricing-check">✓</span>{f}</li>
              ))}
            </ul>
            <button className="lp__win-btn lp__win-btn--outline lp__pricing-cta" onClick={onDownload}><WinLogo /> Get for Windows</button>
          </div>

          {/* PRO */}
          <div className="lp__pricing-card lp__pricing-card--pro">
            <div className="lp__pricing-badge">MOST POPULAR</div>
            <div className="lp__pricing-tier">PRO</div>
            <div className="lp__pricing-price">${billingCycle === 'yearly' ? 41 : 49}<span>/month</span></div>
            {billingCycle === 'yearly' && <div className="lp__pricing-billed-note">billed $492/yr</div>}
            <div className="lp__pricing-desc">For reps ready to level up</div>
            <div className="lp__pricing-divider" />
            <ul className="lp__pricing-features">
              {['60 live calls / month','6 languages','Full post-call analysis + follow-up email','Basic analytics','Email support'].map((f,i) => (
                <li key={i} className="lp__pricing-feature lp__pricing-feature--yes"><span className="lp__pricing-check">✓</span>{f}</li>
              ))}
            </ul>
            <button className="lp__win-btn lp__pricing-cta" onClick={onDownload}><WinLogo /> Get for Windows</button>
          </div>

          {/* BUSINESS */}
          <div className="lp__pricing-card">
            <div className="lp__pricing-tier">BUSINESS</div>
            <div className="lp__pricing-price">${billingCycle === 'yearly' ? 49 : 59}<span>/month</span></div>
            {billingCycle === 'yearly' && <div className="lp__pricing-billed-note">billed $588/yr</div>}
            <div className="lp__pricing-desc">Full access. No ceilings.</div>
            <div className="lp__pricing-divider" />
            <ul className="lp__pricing-features">
              {['Unlimited live calls','All 10 languages','Advanced analytics & trends','Call upload & analysis','Team leaderboard & shared library','Manager dashboard','Priority support'].map((f,i) => (
                <li key={i} className="lp__pricing-feature lp__pricing-feature--yes"><span className="lp__pricing-check">✓</span>{f}</li>
              ))}
            </ul>
            <button className="lp__win-btn lp__win-btn--outline lp__pricing-cta" onClick={onDownload}><WinLogo /> Get for Windows</button>
          </div>

        </div>

        <div className="lp__guarantee reveal" data-delay="0.2">
          ✓ 7-day free trial on all plans — no card charged upfront · Cancel anytime
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp__cta-banner reveal">
        <h2 className="lp__cta-banner-h2">Ready to close more deals?</h2>
        <p className="lp__cta-banner-sub">
          Join sales reps using AI to win more calls - in any language, on any device.
        </p>
        <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
          <WinLogo /> Get for Windows
        </button>
        <p className="lp__cta-banner-note">No credit card · 7-day money-back · Windows 10 &amp; 11</p>
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
          <div className="lp__footer-copy">© 2025 Pitchbase. All rights reserved.</div>
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
