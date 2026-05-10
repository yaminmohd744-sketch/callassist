import { useState, useEffect, useRef, useCallback } from 'react';
import { PrivacyPolicy } from './legal/PrivacyPolicy';
import { TermsOfService } from './legal/TermsOfService';
import { CookiePolicy } from './legal/CookiePolicy';
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
    cardBadge: 'HANDLE OBJECTION',
    badgeType: 'red',
    stage: 'DISCOVERY',
    tone: 'DEFENSIVE',
    prospect: '"We already have a tool for that..."',
    say: 'What do you love most about it? And what\'s the one thing you wish it did better?',
    why: 'Turns the competitor into a pain-finder — they name the gap for you.',
    time: '04:32',
  },
  {
    cardBadge: 'GO DEEPER',
    badgeType: 'green',
    stage: 'DISCOVERY',
    tone: 'CURIOUS',
    prospect: '"Honestly, the reporting could be better..."',
    say: 'So if I showed you exactly how we fix that, would you be open to a 20-min demo this week?',
    why: 'Pain confirmed — bridge directly to the next step while urgency is live.',
    time: '06:17',
  },
  {
    cardBadge: 'CLOSE',
    badgeType: 'purple',
    stage: 'CLOSE',
    tone: 'WARM',
    prospect: '"That actually sounds really interesting..."',
    say: 'Based on what we\'ve covered, does this solve the problem you described at the start?',
    why: 'Trial close while intent is high — gets a yes or surfaces a final objection.',
    time: '09:04',
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
  const [demoPhase, setDemoPhase]               = useState<'expanded' | 'clicking' | 'minimized' | 'endclicking' | 'postcall'>('expanded');
  const [desktopSceneIdx, setDesktopSceneIdx]   = useState(0);
  const [desktopShowSuggestion, setDesktopShowSuggestion] = useState(false);
  const [postcallTab, setPostcallTab]           = useState<'summary' | 'transcript' | 'email' | 'scorecard' | 'share'>('summary');

  // Named demo steps — step 0 is the live-call screen; suggestion fades in automatically after 1.8s
  type DemoStep = { phase: typeof demoPhase; tab: typeof postcallTab };
  const DEMO_STEPS: DemoStep[] = [
    { phase: 'expanded',  tab: 'summary' },    // live call (suggestion auto-appears within)
    { phase: 'minimized', tab: 'summary' },    // minimized bubble
    { phase: 'postcall',  tab: 'summary' },
    { phase: 'postcall',  tab: 'transcript' },
    { phase: 'postcall',  tab: 'email' },
    { phase: 'postcall',  tab: 'scorecard' },
    { phase: 'postcall',  tab: 'share' },
  ];
  const [demoStep, setDemoStep] = useState(0);
  const autoTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sugTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyStep = useCallback((idx: number) => {
    const s = DEMO_STEPS[idx];
    setDemoPhase(s.phase);
    setPostcallTab(s.tab);
    setDemoStep(idx);
    // Step 0: start with no suggestion, auto-show it after 1.8s
    if (idx === 0) {
      setDesktopShowSuggestion(false);
      if (sugTimer.current) clearTimeout(sugTimer.current);
      sugTimer.current = setTimeout(() => setDesktopShowSuggestion(true), 1800);
    } else {
      setDesktopShowSuggestion(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleNext = useCallback((fromIdx: number) => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    const nextIdx = (fromIdx + 1) % DEMO_STEPS.length;
    const isLastOfScene = nextIdx === 0;
    autoTimer.current = setTimeout(() => {
      if (isLastOfScene) {
        setDesktopSceneIdx(i => (i + 1) % DEMO_SCENES.length);
      } else {
        applyStep(nextIdx);
        scheduleNext(nextIdx);
      }
    }, 3500);
  }, [applyStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to step 0 whenever the scene changes
  useEffect(() => {
    applyStep(0);
    scheduleNext(0);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (sugTimer.current)  clearTimeout(sugTimer.current);
    };
  }, [desktopSceneIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (visibleFrames >= DEMO_FRAMES.length) return;
    const t = setTimeout(() => setVisibleFrames(v => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visibleFrames]);

  function handleDemoNav(dir: -1 | 1) {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (sugTimer.current)  clearTimeout(sugTimer.current);
    const next = (demoStep + dir + DEMO_STEPS.length) % DEMO_STEPS.length;
    applyStep(next);
    scheduleNext(next);
  }

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
    return <PrivacyPolicy nav={nav} goSection={id => goSection(id as SectionId)} />;
  }

  // ─── Terms of Service section view ─────────────────────────────────────────

  if (activeSection === 'terms') {
    return <TermsOfService nav={nav} goSection={id => goSection(id as SectionId)} />;
  }

  // ─── Cookie Policy section view ────────────────────────────────────────────

  if (activeSection === 'cookies') {
    return <CookiePolicy nav={nav} goSection={id => goSection(id as SectionId)} />;
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

          {/* ── EXPANDED: exact replica of real live-call UI ── */}
          <div className={`lp__dd-expanded${demoPhase !== 'expanded' ? ' lp__dd-expanded--hiding' : ''}`}>

            {/* Header — exact match of real Header component */}
            <div className="lp__dd-header">
              <div className="lp__dd-header-left">
                <span className="lp__dd-logo">PITCH<span className="lp__dd-logo-plus">PLUS</span><span className="lp__dd-logo-sym">+</span></span>
                <span className="lp__dd-prospect">Sarah Chen</span>
                <span className="lp__dd-prospect-sep">@</span>
                <span className="lp__dd-prospect-co">CloudBridge Inc.</span>
              </div>
              <div className="lp__dd-header-center">● LIVE MODE</div>
              <div className="lp__dd-header-right">
                <button className={`lp__dd-share-btn${demoPhase === 'clicking' ? ' lp__dd-share-btn--active' : ''}`}>
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M4 9.5L7 6.5L10 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 6.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Share Screen
                </button>
                <button className="lp__dd-end-btn">■ END CALL</button>
              </div>
            </div>

            {/* Status bar — exact match of real StatusBar component */}
            <div className="lp__dd-statusbar">
              <div className="lp__dd-statusbar-left">
                <span className="lp__dd-status-dot" />
                <span className="lp__dd-status-label">ACTIVE</span>
                <span className="lp__dd-status-time">{DEMO_SCENES[desktopSceneIdx].time}</span>
              </div>
              <div className="lp__dd-statusbar-right">
                <span className="lp__dd-stat">OBJECTIONS <span className={`lp__dd-stat-val${desktopSceneIdx > 0 ? ' lp__dd-stat-val--red' : ''}`}>{desktopSceneIdx === 0 ? 0 : desktopSceneIdx === 1 ? 1 : 2}</span></span>
                <span className="lp__dd-stat-sep">·</span>
                <span className="lp__dd-stat">CLOSE PROB <span className={`lp__dd-stat-val lp__dd-stat-val--${desktopSceneIdx === 0 ? 'yellow' : desktopSceneIdx === 1 ? 'green' : 'green'}`}>{desktopSceneIdx === 0 ? 50 : desktopSceneIdx === 1 ? 68 : 81}%</span></span>
              </div>
            </div>

            {/* 3-panel layout */}
            <div className="lp__dd-panels">

              {/* Left: Transcript Feed */}
              <div className="lp__dd-panel lp__dd-panel--transcript">
                <div className="lp__dd-panel-hdr">
                  <div className="lp__dd-panel-hdr-left">
                    <span className="lp__dd-panel-hdr-dot lp__dd-panel-hdr-dot--active" />
                    TRANSCRIPT FEED
                  </div>
                  {desktopShowSuggestion && <span className="lp__dd-panel-hdr-live">● LIVE</span>}
                </div>
                {desktopSceneIdx === 0 && !desktopShowSuggestion && (
                  <div className="lp__dd-transcript-error">Speech service unavailable — use the text input below.</div>
                )}
                <div className="lp__dd-transcript">
                  {desktopShowSuggestion ? (
                    <>
                      <div className="lp__dd-entry lp__dd-entry--rep">
                        <div className="lp__dd-entry-meta">
                          <span className="lp__dd-entry-who lp__dd-entry-who--rep">You</span>
                          <span className="lp__dd-entry-time">00:08</span>
                        </div>
                        <div className="lp__dd-entry-text">What's your biggest challenge with your current reporting setup?</div>
                      </div>
                      <div className="lp__dd-entry lp__dd-entry--prospect">
                        <div className="lp__dd-entry-meta">
                          <span className="lp__dd-entry-who lp__dd-entry-who--prospect">Prospect</span>
                          <span className="lp__dd-entry-time">00:15</span>
                        </div>
                        <div className="lp__dd-entry-text">{DEMO_SCENES[desktopSceneIdx].prospect}</div>
                      </div>
                    </>
                  ) : (
                    <div className="lp__dd-transcript-empty">
                      Mic starting… or type prospect dialogue below.
                    </div>
                  )}
                </div>
              </div>

              {/* Middle: AI Intelligence Feed */}
              <div className="lp__dd-panel lp__dd-panel--ai">
                <div className="lp__dd-panel-hdr lp__dd-panel-hdr--ai">
                  <div className="lp__dd-panel-hdr-left">
                    AI INTELLIGENCE FEED<span className="lp__dd-ai-cursor">▋</span>
                  </div>
                  <span className={`lp__dd-stage-badge lp__dd-stage-badge--${DEMO_SCENES[desktopSceneIdx].stage.toLowerCase()}`}>
                    {DEMO_SCENES[desktopSceneIdx].stage}
                  </span>
                </div>
                <div className="lp__dd-ai-body">
                  {desktopShowSuggestion ? (
                    <div className="lp__dd-suggestion lp__dd-suggestion--show">
                      <div className="lp__dd-suggestion-top">
                        <span className={`lp__dd-badge lp__dd-badge--${DEMO_SCENES[desktopSceneIdx].badgeType}`}>
                          {DEMO_SCENES[desktopSceneIdx].cardBadge}
                        </span>
                        <span className="lp__dd-suggestion-time">{DEMO_SCENES[desktopSceneIdx].time}</span>
                      </div>
                      <div className="lp__dd-suggestion-say">
                        <span className="lp__dd-say-label">SAY</span>
                        <span className="lp__dd-say-text">&ldquo;{DEMO_SCENES[desktopSceneIdx].say}&rdquo;</span>
                      </div>
                      <div className="lp__dd-suggestion-why">
                        <span className="lp__dd-why-label">WHY</span>
                        <span className="lp__dd-why-text">{DEMO_SCENES[desktopSceneIdx].why}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="lp__dd-ai-empty">
                      <div className="lp__dd-ai-empty-icon">◎</div>
                      <div className="lp__dd-ai-empty-title">Ready to Assist</div>
                      <div className="lp__dd-ai-empty-desc">Click Listen in the transcript panel to start your mic. I'll detect objections, buying signals, and coach you in real-time.</div>
                      <div className="lp__dd-ai-empty-dots"><span /><span /><span /></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Lead Panel — exact match of real LeadProfilePanel */}
              <div className="lp__dd-panel lp__dd-panel--lead">
                <div className="lp__dd-lead-body">
                  {/* This Call section */}
                  <div className="lp__dd-lead-section">
                    <div className="lp__dd-lead-section-title">THIS CALL</div>
                    <div className="lp__dd-lead-fields">
                      <div className="lp__dd-field"><span className="lp__dd-field-k">GOAL</span><span className="lp__dd-field-v lp__dd-field-v--muted">Book a demo</span></div>
                    </div>
                  </div>
                  <div className="lp__dd-lead-divider" />
                  {/* Close Probability */}
                  <div className="lp__dd-lead-section">
                    <div className="lp__dd-lead-prob-row">
                      <span className="lp__dd-lead-section-title">CLOSE PROB</span>
                      <span className={`lp__dd-lead-prob-pct lp__dd-lead-prob-pct--${desktopSceneIdx === 0 ? 'yellow' : 'green'}`}>{desktopSceneIdx === 0 ? 50 : desktopSceneIdx === 1 ? 68 : 81}%</span>
                    </div>
                    <div className="lp__dd-lead-section-title lp__dd-lead-section-title--sub">CLOSE PROB</div>
                    <div className="lp__dd-lead-prob-row lp__dd-lead-prob-row--bar">
                      <span className={`lp__dd-lead-prob-pct lp__dd-lead-prob-pct--${desktopSceneIdx === 0 ? 'yellow' : 'green'}`}>{desktopSceneIdx === 0 ? 50 : desktopSceneIdx === 1 ? 68 : 81}%</span>
                    </div>
                    <div className="lp__dd-prob-bar">
                      <div className={`lp__dd-prob-fill lp__dd-prob-fill--${desktopSceneIdx === 0 ? 'yellow' : 'green'}`} style={{ width: `${desktopSceneIdx === 0 ? 50 : desktopSceneIdx === 1 ? 68 : 81}%` }} />
                    </div>
                  </div>
                  <div className="lp__dd-lead-divider" />
                  {/* Call Notes */}
                  <div className="lp__dd-lead-section lp__dd-lead-section--notes">
                    <div className="lp__dd-lead-section-title">CALL NOTES</div>
                    <div className="lp__dd-notes-empty">
                      Notes will appear here automatically when the prospect mentions dates, commitments, tools, or next steps.
                    </div>
                    <div className="lp__dd-note-input-row">
                      <span className="lp__dd-note-input-fake">Add note…</span>
                      <span className="lp__dd-note-btn">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── MINIMIZED: bubble + cursor in one sled so they always move together ── */}
          <div className={`lp__dd-minimized${demoPhase === 'minimized' ? ' lp__dd-minimized--visible' : ''}`}>
            {/* Sled: single element that slides left/right — bubble and cursor ride inside it */}
            <div className="lp__dd-sled" key={desktopSceneIdx}>
              <div className="lp__dd-bubble">
                {/* Drag handle row */}
                <div className="lp__dd-bubble-bar">
                  <div className="lp__dd-bubble-brand">
                    <span className="lp__dd-bubble-dot" />
                    <span className="lp__dd-bubble-logo">PITCH<span className="lp__dd-bubble-logo-plus">PLUS</span>+</span>
                    <span className="lp__dd-bubble-prospect">Sarah Chen · CloudBridge Inc.</span>
                  </div>
                  <div className="lp__dd-bubble-stats">
                    <span className="lp__dd-bubble-stage">{DEMO_SCENES[desktopSceneIdx].stage}</span>
                    <span className="lp__dd-bubble-prob">{desktopSceneIdx === 0 ? 50 : desktopSceneIdx === 1 ? 68 : 81}%</span>
                  </div>
                  <div className="lp__dd-bubble-actions">
                    <button className="lp__dd-bubble-restore">↗</button>
                    <button className="lp__dd-bubble-end">End</button>
                  </div>
                </div>
                {/* Suggestion row */}
                <div className="lp__dd-bubble-suggestion">
                  <div className="lp__dd-bubble-do">
                    <span className="lp__dd-bubble-do-label">DO</span>
                    <span className="lp__dd-bubble-do-text">{DEMO_SCENES[desktopSceneIdx].cardBadge}</span>
                  </div>
                  <div className="lp__dd-bubble-say">
                    <span className="lp__dd-bubble-say-label">SAY</span>
                    <span className="lp__dd-bubble-say-text">&ldquo;{DEMO_SCENES[desktopSceneIdx].say}&rdquo;</span>
                  </div>
                </div>
              </div>
              {/* Cursor sits on the drag bar — moves with the sled, never drifts */}
              <div className="lp__dd-cursor lp__dd-cursor--grab" />
            </div>
          </div>

          {/* ── END-CLICKING: cursor moves to End button and clicks ── */}
          {(demoPhase === 'endclicking') && (
            <div className="lp__dd-cursor lp__dd-cursor--endclick" />
          )}

          {/* ── POSTCALL: self-contained pixel-perfect replica ── */}
          <div className={`lp__dd-postcall${demoPhase === 'postcall' ? ' lp__dd-postcall--visible' : ''}`}>
            <div className="lp__dd-pc-wrap">

              {/* Header */}
              <div className="lp__dd-pc-hdr">
                <div className="lp__dd-pc-back">← Back to Dashboard</div>
                <div className="lp__dd-pc-title-block">
                  <div className="lp__dd-pc-title">Call Review</div>
                  <div className="lp__dd-pc-meta">
                    <span>Sarah Chen</span>
                    <span className="lp__dd-pc-meta-sep">@</span>
                    <span>CloudBridge Inc.</span>
                    <span className="lp__dd-pc-meta-sep">·</span>
                    <span>Sat, May 9, 2026, 9:04 AM</span>
                  </div>
                </div>
                <div className="lp__dd-pc-hdr-right">
                  <div className="lp__dd-pc-crm-badge">✓ Saved to CRM</div>
                  <button className="lp__dd-pc-newcall-btn">▶ NEW CALL</button>
                </div>
              </div>

              {/* Stats row — horizontal with border dividers */}
              <div className="lp__dd-pc-stats">
                <div className="lp__dd-pc-stat"><div className="lp__dd-pc-stat-val">9m 4s</div><div className="lp__dd-pc-stat-label">Duration</div></div>
                <div className="lp__dd-pc-stat"><div className="lp__dd-pc-stat-val lp__dd-pc-stat-val--red">2</div><div className="lp__dd-pc-stat-label">Objections</div></div>
                <div className="lp__dd-pc-stat"><div className="lp__dd-pc-stat-val lp__dd-pc-stat-val--medium">81%</div><div className="lp__dd-pc-stat-label">Close Score</div></div>
                <div className="lp__dd-pc-stat"><div className="lp__dd-pc-stat-val lp__dd-pc-stat-val--medium">74</div><div className="lp__dd-pc-stat-label">Lead Score</div></div>
                <div className="lp__dd-pc-stat"><div className="lp__dd-pc-stat-val">14</div><div className="lp__dd-pc-stat-label">Entries</div></div>
                <div className="lp__dd-pc-stat"><div className="lp__dd-pc-stat-val lp__dd-pc-stat-val--stage">CLOSE</div><div className="lp__dd-pc-stat-label">Stage Reached</div></div>
              </div>

              {/* Tabs — exact match of real app */}
              <div className="lp__dd-pc-tabs">
                {(['summary','transcript','email','scorecard','share'] as const).map(tab => (
                  <button key={tab} className={`lp__dd-pc-tab${postcallTab === tab ? ' lp__dd-pc-tab--active' : ''}`}>
                    {tab === 'summary' ? 'Summary' : tab === 'transcript' ? 'Transcript' : tab === 'email' ? 'Follow-up Email' : tab === 'scorecard' ? 'Scorecard' : '↗ Share'}
                  </button>
                ))}
              </div>

              {/* Tab content — pixel-perfect match of real PostCallScreen */}
              <div className="lp__dd-pc-content">

                {postcallTab === 'summary' && (
                  <div className="lp__dd-pc-summary">
                    <div className="lp__dd-pc-s-outcome">CALL OUTCOME: Strong prospect — demo booked. Follow up within the hour.</div>
                    <div className="lp__dd-pc-s-heading">WHAT WENT WELL:</div>
                    <div className="lp__dd-pc-s-bullet">• Outstanding discovery — prospect self-diagnosed the exact problem before the product was presented.</div>
                    <div className="lp__dd-pc-s-bullet">• Competitor objection handled cleanly — redirected to a pain-finder question that named the gap.</div>
                    <div className="lp__dd-pc-s-bullet">• Closed on a specific next step (20-min demo) while intent was live — no vague "I'll send info."</div>
                    <div className="lp__dd-pc-s-heading">AREAS TO IMPROVE:</div>
                    <div className="lp__dd-pc-s-bullet">• No timeline established — should have asked "When do you need this solved by?"</div>
                    <div className="lp__dd-pc-s-bullet">• Pricing was mentioned before value was fully anchored — next time reverse the order.</div>
                    <div className="lp__dd-pc-s-heading">NEXT STEPS:</div>
                    <div className="lp__dd-pc-s-bullet">1. Send follow-up email with demo booking link within the hour.</div>
                    <div className="lp__dd-pc-s-bullet">2. Reference the reporting gap they described — personalise the subject line.</div>
                    <div className="lp__dd-pc-s-heading">CALL NOTES</div>
                    <div className="lp__dd-pc-s-bullet">• 04:32 Competitor objection — "we already have a tool for that"</div>
                    <div className="lp__dd-pc-s-bullet">• 06:17 Pain confirmed — reporting gap identified</div>
                  </div>
                )}

                {postcallTab === 'transcript' && (
                  <div className="lp__dd-pc-transcript">
                    <button className="lp__dd-pc-dl-btn">↓ DOWNLOAD .TXT</button>
                    {[
                      { who: 'YOU',      time: '00:05', text: "Hi Sarah, this is Alex from Pitchbase — do you have about two minutes?", cls: '' },
                      { who: 'PROSPECT', time: '00:12', text: "Yeah, sure, go ahead.", cls: '' },
                      { who: 'YOU',      time: '00:18', text: "We work with growth-stage firms to help reps close more consistently using real-time AI coaching.", cls: '' },
                      { who: 'PROSPECT', time: '00:42', text: "Our top two are crushing it but the other six are all over the place.", cls: ' lp__dd-pc-entry--buying-signal' },
                      { who: 'YOU',      time: '01:04', text: "That's classic 80/20. They have the knowledge — they just can't execute under pressure.", cls: '' },
                      { who: 'PROSPECT', time: '01:58', text: "We already have a tool for that, though.", cls: ' lp__dd-pc-entry--objection' },
                      { who: 'YOU',      time: '02:14', text: "Totally fair — what does it do when someone says 'too expensive' mid-call?", cls: '' },
                      { who: 'PROSPECT', time: '02:38', text: "That actually sounds really interesting. Can you send me more?", cls: ' lp__dd-pc-entry--buying-signal' },
                    ].map((e, i) => (
                      <div key={i} className={`lp__dd-pc-entry${e.cls}`}>
                        <div className="lp__dd-pc-entry-meta">
                          <span className={`lp__dd-pc-entry-who lp__dd-pc-entry-who--${e.who === 'YOU' ? 'rep' : 'prospect'}`}>{e.who}</span>
                          <span className="lp__dd-pc-entry-time">{e.time}</span>
                        </div>
                        <div className="lp__dd-pc-entry-text">{e.text}</div>
                      </div>
                    ))}
                  </div>
                )}

                {postcallTab === 'email' && (
                  <div className="lp__dd-pc-email">
                    <div className="lp__dd-pc-email-actions">
                      <button className="lp__dd-pc-action-btn">⎘ COPY EMAIL</button>
                      <button className="lp__dd-pc-action-btn">↓ DOWNLOAD .TXT</button>
                      <button className="lp__dd-pc-action-btn">✉ OPEN IN EMAIL</button>
                      <button className="lp__dd-pc-action-btn">⎘ COPY JSON</button>
                    </div>
                    <div className="lp__dd-pc-email-body">
                      <div className="lp__dd-pc-email-subject">Subject: Friday 10am confirmed — your personalised Pitchbase demo</div>
                      <div className="lp__dd-pc-email-line lp__dd-pc-email-line--gap">Hi Sarah,</div>
                      <div className="lp__dd-pc-email-line lp__dd-pc-email-line--gap">Really enjoyed our conversation — it's clear you've thought carefully about what systematic coaching needs to look like as CloudBridge scales.</div>
                      <div className="lp__dd-pc-email-line lp__dd-pc-email-line--gap">As promised, Friday at 10am is confirmed. I've sent a calendar invite with the Zoom link.</div>
                      <div className="lp__dd-pc-email-line lp__dd-pc-email-line--gap">Here's what I'll cover, tailored to what you shared: real-time objection handling, new rep onboarding, and the manager dashboard.</div>
                      <div className="lp__dd-pc-email-line">Best, Alex</div>
                    </div>
                    <div className="lp__dd-pc-email-integrations">
                      <span>▶</span> Integrations (Zapier / Webhook)
                    </div>
                  </div>
                )}

                {postcallTab === 'scorecard' && (
                  <div className="lp__dd-pc-scorecard">
                    <div className="lp__dd-pc-sc-ring-wrap">
                      <div className="lp__dd-pc-sc-ring">
                        <div className="lp__dd-pc-sc-score-num">74</div>
                        <div className="lp__dd-pc-sc-score-label">REP SCORE</div>
                      </div>
                    </div>
                    <div className="lp__dd-pc-sc-metric">
                      <div className="lp__dd-pc-sc-metric-hdr">
                        <span className="lp__dd-pc-sc-metric-name">TALK RATIO</span>
                        <span className="lp__dd-pc-sc-metric-val lp__dd-pc-sc-metric-val--green">You 48% · Prospect 52%</span>
                      </div>
                      <div className="lp__dd-pc-sc-gauge">
                        <div className="lp__dd-pc-sc-gauge-rep" style={{width:'48%'}} />
                        <div className="lp__dd-pc-sc-gauge-prospect" style={{width:'52%'}} />
                      </div>
                      <div className="lp__dd-pc-sc-hint">✓ Good — you let the prospect talk more than half the time</div>
                    </div>
                    <div className="lp__dd-pc-sc-metric">
                      <div className="lp__dd-pc-sc-metric-hdr">
                        <span className="lp__dd-pc-sc-metric-name">OBJECTION HANDLING RATE</span>
                        <span className="lp__dd-pc-sc-metric-val lp__dd-pc-sc-metric-val--green">2/2 handled (100%)</span>
                      </div>
                      <div className="lp__dd-pc-sc-gauge">
                        <div className="lp__dd-pc-sc-gauge-fill lp__dd-pc-sc-gauge-fill--green" style={{width:'100%'}} />
                      </div>
                    </div>
                    <div className="lp__dd-pc-sc-metric">
                      <div className="lp__dd-pc-sc-metric-hdr">
                        <span className="lp__dd-pc-sc-metric-name">BUYING SIGNALS DETECTED</span>
                        <span className="lp__dd-pc-sc-metric-val lp__dd-pc-sc-metric-val--green">2 signals</span>
                      </div>
                      <div className="lp__dd-pc-sc-pills">
                        <span className="lp__dd-pc-sc-pill">Demo booked</span>
                        <span className="lp__dd-pc-sc-pill">Pain confirmed</span>
                      </div>
                    </div>
                    <div className="lp__dd-pc-sc-metric">
                      <div className="lp__dd-pc-sc-metric-hdr">
                        <span className="lp__dd-pc-sc-metric-name">CLOSE PROBABILITY</span>
                        <span className="lp__dd-pc-sc-metric-val lp__dd-pc-sc-metric-val--green">81%</span>
                      </div>
                      <div className="lp__dd-pc-sc-gauge">
                        <div className="lp__dd-pc-sc-gauge-fill lp__dd-pc-sc-gauge-fill--green" style={{width:'81%'}} />
                      </div>
                    </div>
                  </div>
                )}

                {postcallTab === 'share' && (
                  <div className="lp__dd-pc-share">
                    <div className="lp__dd-pc-share-title">Prospect Summary</div>
                    <div className="lp__dd-pc-share-desc">A clean, context-aware recap written for Sarah Chen. Copy it and send via email, WhatsApp, or however you follow up.</div>
                    <div className="lp__dd-pc-share-body">
                      <div className="lp__dd-pc-share-line">Hi Sarah — great speaking with you today.</div>
                      <div className="lp__dd-pc-share-line lp__dd-pc-share-line--gap">You mentioned your top two reps are crushing it while the rest are inconsistent under pressure. That's exactly the gap Pitchbase closes — it surfaces the right response the moment an objection lands, so every rep performs like your best one.</div>
                      <div className="lp__dd-pc-share-line lp__dd-pc-share-line--gap">Friday at 10am I'll show you exactly how it handles the "too expensive" moment in real time.</div>
                      <div className="lp__dd-pc-share-line lp__dd-pc-share-line--gap">— Alex</div>
                    </div>
                    <div className="lp__dd-pc-share-actions">
                      <button className="lp__dd-pc-share-copy-btn">⎘ Copy to clipboard</button>
                      <button className="lp__dd-pc-share-regen-btn">↺ Regenerate</button>
                    </div>
                    <div className="lp__dd-pc-share-hint">Paste this anywhere — email, LinkedIn DM, WhatsApp, Notion, your CRM notes.</div>
                  </div>
                )}

              </div>
            </div>

            {/* Cursor auto-clicks tabs */}
            <div className={`lp__dd-cursor lp__dd-cursor--pc lp__dd-cursor--pc-${postcallTab}`} />
          </div>

        </div>

        {/* ── Demo nav ── */}
        <div className="lp__demo-nav">
          <button className="lp__demo-nav-btn" onClick={() => handleDemoNav(-1)} aria-label="Previous step">
            ← PREV
          </button>
          <div className="lp__demo-nav-dots">
            {DEMO_STEPS.map((_, i) => (
              <button
                key={i}
                className={`lp__demo-nav-dot${demoStep === i ? ' lp__demo-nav-dot--active' : ''}`}
                onClick={() => { if (autoTimer.current) clearTimeout(autoTimer.current); applyStep(i); scheduleNext(i); }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
          <button className="lp__demo-nav-btn" onClick={() => handleDemoNav(1)} aria-label="Next step">
            NEXT →
          </button>
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
