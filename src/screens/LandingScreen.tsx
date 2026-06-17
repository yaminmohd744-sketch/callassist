import { useState, useEffect, useRef, useCallback } from 'react';
import { PrivacyPolicy } from './legal/PrivacyPolicy';
import { TermsOfService } from './legal/TermsOfService';
import { CookiePolicy } from './legal/CookiePolicy';
import { PricingSection } from './landing/PricingSection';
import { BlogSection } from './landing/BlogSection';
import { CarouselLibrarySection } from './landing/CarouselLibrarySection';
import { AppDemo } from './landing/AppDemo';
import { PitchrLogo } from '../components/ui/PitchrLogo';
import { WaitlistModal } from '../components/waitlist/WaitlistModal';
import './LandingScreen.css';

interface LandingScreenProps {
  onDownload: () => void;
  onWaitlist?: () => void;
  onMarketingPlan?: () => void;
}

type SectionId = 'features' | 'languages' | 'pricing' | 'download' | 'changelog' | 'help' | 'about' | 'blog' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'carousels';

const SPOTLIGHT_STEP_MS    = 1400; // stagger between spotlight phases
const DEMO_ADVANCE_LONG_MS = 6500; // normal demo step delay (step 0 includes spotlight sequence)
const DEMO_ADVANCE_SHORT_MS = 3500; // fast step delay (subsequent scenes)
const FRAME_ADVANCE_MS     = 1400; // terminal frame tick speed

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
    prospect: '"Honestly it\'s probably not a priority until Q3 — we\'re heads-down on a product launch right now."',
    say: 'That makes sense. If the manual reporting is costing your team two hours a week, what\'s the cost of waiting another quarter?',
    why: 'Reframes delay as an active cost — makes the status quo more painful than the change.',
    time: '02:03',
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



export function LandingScreen({ onDownload, onWaitlist: _onWaitlist, onMarketingPlan }: LandingScreenProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pitchr-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('pitchr-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const [showWaitlist, setShowWaitlist]         = useState(false);
  const openWaitlist = () => setShowWaitlist(true);
  const [visibleFrames, setVisibleFrames]       = useState(1);
  const [menuOpen, setMenuOpen]                 = useState(false);
  const [featureTabIdx, setFeatureTabIdx]       = useState(0);
  const [activeSection, setActiveSection]       = useState<SectionId | null>(null);
  const [openFaq, setOpenFaq]                   = useState<number | null>(null);
  const [billingCycle, setBillingCycle]         = useState<'monthly' | 'yearly'>('monthly');
  const [langIdx, setLangIdx]                   = useState(0);
  const [demoPhase, setDemoPhase]               = useState<'expanded' | 'clicking' | 'minimized' | 'endclicking' | 'postcall'>('expanded');
  const [desktopSceneIdx, setDesktopSceneIdx]   = useState(0);
  const [desktopShowSuggestion, setDesktopShowSuggestion] = useState(false);
  const [postcallTab, setPostcallTab]           = useState<'summary' | 'transcript' | 'email' | 'scorecard' | 'share'>('summary');
  const [spotlight, setSpotlight]               = useState<'transcript' | 'ai' | 'notes' | null>(null);

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
  const autoTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sugTimer          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spotTimers        = useRef<ReturnType<typeof setTimeout>[]>([]);
  const featureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSpotTimers = useCallback(() => {
    spotTimers.current.forEach(t => clearTimeout(t));
    spotTimers.current = [];
  }, []);

  const applyStep = useCallback((idx: number) => {
    const s = DEMO_STEPS[idx];
    setDemoPhase(s.phase);
    setPostcallTab(s.tab);
    setDemoStep(idx);
    clearSpotTimers();
    if (idx === 0) {
      // Spotlight sequence: transcript → ai → notes → suggestion
      setDesktopShowSuggestion(false);
      setSpotlight('transcript');
      if (sugTimer.current) clearTimeout(sugTimer.current);
      const t1 = setTimeout(() => setSpotlight('ai'),        SPOTLIGHT_STEP_MS);
      const t2 = setTimeout(() => setSpotlight('notes'),     SPOTLIGHT_STEP_MS * 2);
      const t3 = setTimeout(() => { setSpotlight(null); setDesktopShowSuggestion(true); }, SPOTLIGHT_STEP_MS * 3);
      spotTimers.current = [t1, t2, t3];
    } else {
      setSpotlight(null);
      setDesktopShowSuggestion(true);
    }
  }, [clearSpotTimers]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleNext = useCallback((fromIdx: number) => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    const nextIdx = (fromIdx + 1) % DEMO_STEPS.length;
    const isLastOfScene = nextIdx === 0;
    // Step 0 gets extra time for the spotlight sequence (4.2s) + suggestion (2s) = 6.5s total
    const delay = fromIdx === 0 ? DEMO_ADVANCE_LONG_MS : DEMO_ADVANCE_SHORT_MS;
    autoTimer.current = setTimeout(() => {
      if (isLastOfScene) {
        setDesktopSceneIdx(i => (i + 1) % DEMO_SCENES.length);
      } else {
        applyStep(nextIdx);
        scheduleNext(nextIdx);
      }
    }, delay);
  }, [applyStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to step 0 whenever the scene changes
  useEffect(() => {
    applyStep(0);
    scheduleNext(0);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (sugTimer.current)  clearTimeout(sugTimer.current);
      clearSpotTimers();
    };
  }, [desktopSceneIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (visibleFrames >= DEMO_FRAMES.length) return;
    const t = setTimeout(() => setVisibleFrames(v => v + 1), FRAME_ADVANCE_MS);
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
    // Immediately reveal anything already in the viewport
    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transitionDelay = '0s';
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [activeSection]);

  // Drive nav CTA visibility via rAF — bypasses scroll event uncertainty and
  // React state batching entirely by writing opacity directly to the DOM node.
  useEffect(() => {
    if (activeSection !== null) return;

    const hero = document.querySelector<Element>('.lp__hero-actions');
    const cta  = document.querySelector<Element>('.lp__cta-banner');
    const btn  = document.querySelector<HTMLElement>('.lp__nav-cta-win');
    if (!hero || !btn) return;

    let rafId: number;
    let lastOpacity = '';

    const tick = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const ctaTop     = cta ? cta.getBoundingClientRect().top : Infinity;
      const show = heroBottom < 0 && ctaTop > window.innerHeight * 0.85;
      const next = show ? '1' : '0';
      if (next !== lastOpacity) {
        btn.style.opacity       = next;
        btn.style.pointerEvents = show ? 'auto' : 'none';
        lastOpacity = next;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeSection]);

  // Auto-advance feature tabs
  function restartFeatureInterval() {
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    featureIntervalRef.current = setInterval(() => {
      setFeatureTabIdx(i => (i + 1) % FEATURE_TABS.length);
    }, 3800);
  }

  useEffect(() => {
    restartFeatureInterval();
    return () => { if (featureIntervalRef.current) clearInterval(featureIntervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function goFeatureTab(idx: number) {
    setFeatureTabIdx(idx);
    restartFeatureInterval();
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
          <PitchrLogo size="sm" />
        </button>

        {activeSection !== null ? (
          <div className="lp__nav-links lp__nav-links--sections">
            <button
              className={activeSection === 'features' ? 'lp__nav-link--active' : ''}
              onClick={() => goSection('features')}
            >
              Features
            </button>
            <button
              className={activeSection === 'pricing' ? 'lp__nav-link--active' : ''}
              onClick={() => goSection('pricing')}
            >
              Pricing
            </button>
          </div>
        ) : (
          <div className={`lp__nav-links ${menuOpen ? 'lp__nav-links--open' : ''}`}>
            <button onClick={() => goSection('features')}>Features</button>
            <button onClick={() => goSection('pricing')}>Pricing</button>
            <button onClick={() => goSection('carousels')}>Content Kit</button>
          </div>
        )}

        <div className="lp__nav-actions">
          <button
            className="lp__theme-toggle"
            onClick={() => setIsDark(d => !d)}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀' : '☽'}
          </button>
          <button
            className="lp__win-btn lp__nav-cta-win"
            onClick={onDownload}
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
            <p className="lp__sv-sub lp__sv-sub--aside">Five tools that work together, live on every call.</p>
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
              While every competitor limits coaching to English, Pitchr coaches in 10 languages 
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
            <span className="lp__sv-lang-vs-us">Pitchr: 10 languages</span>
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
    return <PricingSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} openFaq={openFaq} setOpenFaq={setOpenFaq} onDownload={onDownload} nav={nav} />;
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
              Pitchr is a native Windows desktop app. Install it once and it's always a click away —
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
              { num: '03', title: 'Allow microphone', desc: 'Grant microphone permission once. Pitchr never records without your explicit start.' },
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
            <p className="lp__sv-cta-note" style={{ marginTop: '0.5rem', opacity: 0.55, fontSize: '0.75rem' }}>
              Windows may show a security warning on first run — click <strong>More info</strong> then <strong>Run anyway</strong>. This is normal for new apps.
            </p>
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
            <h2 className="lp__sv-h2">What's new in Pitchr</h2>
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
              Everything you need to get the most out of Pitchr — from your first call to advanced coaching techniques.
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
            <div className="lp__sv-label">ABOUT PITCHR</div>
            <h2 className="lp__sv-h2">Built by salespeople,<br />for salespeople.</h2>
            <p className="lp__sv-sub">
              We spent years losing deals in the last 30 seconds because we said the wrong thing.
              Pitchr is the tool we always wished existed.
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
              Today, Pitchr coaches reps in 10 languages across 40+ countries. We're a small team of
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

  // ─── Carousel Library section view ────────────────────────────────────────

  if (activeSection === 'carousels') {
    return (
      <div className="lp">
        {nav}
        <CarouselLibrarySection />
      </div>
    );
  }

  // ─── Blog section view ─────────────────────────────────────────────────────

  if (activeSection === 'blog') {
    return <BlogSection nav={nav} />;
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
              <a className="lp__contact-link" href="mailto:support@pitchr.org">support@pitchr.org</a>
              <div className="lp__contact-sla">Avg. response: &lt; 4 hours</div>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">◈</div>
              <div className="lp__contact-card-title">Sales & partnerships</div>
              <p className="lp__contact-card-desc">Team plans, reseller deals, API access, or white-label enquiries. Let's talk numbers.</p>
              <a className="lp__contact-link" href="mailto:sales@pitchr.org">sales@pitchr.org</a>
              <div className="lp__contact-sla">Avg. response: &lt; 1 business day</div>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">✦</div>
              <div className="lp__contact-card-title">Press & media</div>
              <p className="lp__contact-card-desc">Writing about AI in sales, multilingual tools, or the future of coaching? We'll make it easy.</p>
              <a className="lp__contact-link" href="mailto:press@pitchr.org">press@pitchr.org</a>
              <div className="lp__contact-sla">Avg. response: &lt; 1 business day</div>
            </div>
            <div className="lp__contact-card">
              <div className="lp__contact-card-icon">▣</div>
              <div className="lp__contact-card-title">Legal & privacy</div>
              <p className="lp__contact-card-desc">Data subject requests, GDPR enquiries, DPA requests, or legal correspondence.</p>
              <a className="lp__contact-link" href="mailto:privacy@pitchr.org">privacy@pitchr.org</a>
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
            <button className="lp__btn lp__btn--ghost" onClick={openWaitlist}>
              Join the waitlist →
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
              <span className="lp__terminal-title">PITCHR - LIVE</span>
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
          Competitors coach only in English. Pitchr coaches in your language 
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

      {/* ── Comparison ── */}
      <section className="lp__section">
        <div className="lp__section-label reveal">COMPARISON</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Why Pitchr over the alternatives?</h2>
        <div className="lp__compare-wrap reveal" data-delay="0.18">
          <table className="lp__compare">
            <thead>
              <tr>
                <th className="lp__compare-feature-col">Feature</th>
                <th className="lp__compare-us-col">Pitchr</th>
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


      {/* ── Live Demo ── */}
      <section id="features" className="lp__section lp__section--demo-scene">
        <div className="lp__section-label reveal">SEE IT IN ACTION</div>
        <h2 className="lp__section-h2 reveal" data-delay="0.1">Your AI co-pilot, live on every call</h2>
        <p className="lp__section-sub reveal" data-delay="0.18">
          Pitchr listens in real time, transcribes every word, and surfaces the right response the moment your prospect speaks — objection handlers, close prompts, and buying signal alerts.
        </p>
        <AppDemo />
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

          {/* BASIC */}
          <div className="lp__pricing-card">
            <div className="lp__pricing-tier">BASIC</div>
            <div className="lp__pricing-price">${billingCycle === 'yearly' ? 12.99 : 14.99}<span>/month</span></div>
            {billingCycle === 'yearly' && <div className="lp__pricing-billed-note">billed $155.88/yr</div>}
            <div className="lp__pricing-desc">For reps learning the ropes</div>
            <div className="lp__pricing-divider" />
            <ul className="lp__pricing-features">
              {['30 live calls / month','English & Spanish only','Basic post-call summary','Community support'].map((f,i) => (
                <li key={i} className="lp__pricing-feature lp__pricing-feature--yes"><span className="lp__pricing-check">✓</span>{f}</li>
              ))}
            </ul>
            <button className="lp__win-btn lp__win-btn--outline lp__pricing-cta" onClick={onDownload}><WinLogo /> Get for Windows</button>
          </div>

          {/* PLUS */}
          <div className="lp__pricing-card lp__pricing-card--pro">
            <div className="lp__pricing-badge">MOST POPULAR</div>
            <div className="lp__pricing-tier">PLUS</div>
            <div className="lp__pricing-price">${billingCycle === 'yearly' ? 32.99 : 39}<span>/month</span></div>
            {billingCycle === 'yearly' && <div className="lp__pricing-billed-note">billed $395.88/yr</div>}
            <div className="lp__pricing-desc">For reps ready to level up</div>
            <div className="lp__pricing-divider" />
            <ul className="lp__pricing-features">
              {['100 live calls / month','6 languages','Full post-call analysis + follow-up email','Basic analytics','Email support'].map((f,i) => (
                <li key={i} className="lp__pricing-feature lp__pricing-feature--yes"><span className="lp__pricing-check">✓</span>{f}</li>
              ))}
            </ul>
            <button className="lp__win-btn lp__pricing-cta" onClick={onDownload}><WinLogo /> Get for Windows</button>
          </div>

          {/* PRO */}
          <div className="lp__pricing-card">
            <div className="lp__pricing-tier">PRO</div>
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
        <div className="lp__cta-banner-actions">
          <button className="lp__win-btn lp__win-btn--lg" onClick={onDownload}>
            <WinLogo /> Get for Windows
          </button>
          <button className="lp__btn lp__btn--ghost lp__cta-banner-wl" onClick={openWaitlist}>
            Join the waitlist →
          </button>
        </div>
        <p className="lp__cta-banner-note">No credit card · 7-day money-back · Windows 10 &amp; 11</p>
      </section>

      {/* ── Footer ── */}
      <footer className="lp__footer reveal">
        <div className="lp__footer-top">

          {/* Brand */}
          <div className="lp__footer-brand">
            <div className="lp__footer-logo"><PitchrLogo /></div>
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
            <button className="lp__footer-link" onClick={() => goSection('carousels')}>Content Kit</button>
          </div>

          {/* Company */}
          <div className="lp__footer-col">
            <div className="lp__footer-col-title">Company</div>
            <button className="lp__footer-link" onClick={() => goSection('about')}>About</button>
            <button className="lp__footer-link" onClick={() => goSection('blog')}>Blog</button>
            <button className="lp__footer-link" onClick={() => goSection('contact')}>Contact</button>
            {onMarketingPlan && (
              <button className="lp__footer-link" onClick={onMarketingPlan}>Marketing Plan</button>
            )}
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
          <div className="lp__footer-copy">© 2025 Pitchr. All rights reserved.</div>
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

      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}

    </div>
  );
}
