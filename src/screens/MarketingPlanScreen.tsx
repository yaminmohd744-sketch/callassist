import './MarketingPlanScreen.css';

interface MarketingPlanScreenProps {
  onBack: () => void;
}

const VIDEO_SCRIPTS = [
  {
    id: '01',
    title: 'The Blank Mind',
    angle: 'Fear/validation — "I freeze up on objections."',
    target: 'SDR / BDR',
    cta: 'Waitlist',
    script: [
      { type: 'avatar', text: `"You've practiced the pitch a hundred times.\nYou're on the call, it's going well—\nand then they say 'we already use something for that.'\n\nAnd your brain just... stops.\n\nThree seconds of silence.\nYou ramble. They go cold. Call's dead."` },
      { type: 'screen', text: 'Pitchr live call screen, objection detected, coaching card appears' },
      { type: 'avatar', text: `"This tool hears the objection before your brain processes it—\nand puts the exact response on your screen.\nWord for word.\n\nNo freeze. No scramble.\nJust: say this."` },
      { type: 'avatar', text: `"It's called Pitchr.\nReal-time AI coaching, mid-call.\n\nFree to try. Link in bio."` },
    ],
  },
  {
    id: '02',
    title: 'The Post-Call Regret',
    angle: 'Universal sales pain — "I thought of the perfect response 20 minutes later."',
    target: 'SDR, AE',
    cta: 'Waitlist',
    script: [
      { type: 'avatar', text: `"You know that feeling—\nYou hang up, deal is dead,\nand then 20 minutes later the PERFECT response hits you?\n\n'I should have said THAT.'"` },
      { type: 'avatar', text: `"Gong doesn't fix that. Gong analyzes it after you've already lost.\nChorus plays back the call you already blew.\n\nThere's one tool that gives you the response while you're still on the call."` },
      { type: 'screen', text: 'Pitchr coaching card: "Competitor objection — say this: \'What do you love most about it? And what\'s the one thing you wish it did better?\'"' },
      { type: 'avatar', text: `"The perfect response. Before the silence goes awkward.\nThat's Pitchr. Link in bio. It's free to start."` },
    ],
  },
  {
    id: '03',
    title: 'Price Shock',
    angle: 'Brutal cost comparison',
    target: 'SDR, AE, Sales Manager',
    cta: 'Waitlist / Download',
    script: [
      { type: 'avatar', text: `"Gong: $240 per user per month.\nClari Copilot: $200 per user per month.\nSalesken: call to get a quote — which means it's more than all of them.\n\nAnd every single one of those only works after the call is over.\n\nThey coach you on the deal you just lost."` },
      { type: 'avatar', text: `"Pitchr: $39 a month.\nWorks on phone calls, Zoom, Teams, Meet.\nCoaches you in real time.\nNo enterprise contract. No minimum seats. Start free today."` },
      { type: 'screen', text: 'Pitchr live coaching panel, close probability climbing from 50% to 81%' },
      { type: 'avatar', text: `"I'm not saying they're bad.\nI'm saying you're probably paying 6x for a tool that arrives too late.\n\nLink in bio."` },
    ],
  },
  {
    id: '04',
    title: 'POV: Close Probability',
    angle: 'Aspirational — "what winning looks like"',
    target: 'All personas',
    cta: 'Download',
    script: [
      { type: 'screen', text: 'Screen recording only — no avatar. Desktop POV: user on a call.' },
      { type: 'overlay', text: 'POV: You\'re 8 minutes into a cold call.\nClose prob at 50%.\nProspect says "Honestly the reporting could be better..."\nOBJECTION DETECTED card appears.\nThe response appears before the silence fills.\nClose probability: 81% ↑\n\nThat\'s Pitchr.\nReal-time AI coaching. Mid-call. Not post-mortem.\n\nGet for Windows → pitchr.org' },
    ],
  },
  {
    id: '05',
    title: 'Phone Call Blind Spot',
    angle: 'Nobody built this for phone calls',
    target: 'SDR, AE',
    cta: 'Waitlist',
    script: [
      { type: 'avatar', text: `"Quick question.\nHow many of your deals start on a phone call?\n\nNot Zoom. Not Teams. An actual phone call.\n\nFor most SDRs, it's more than half."` },
      { type: 'avatar', text: `"Now—\nGong. Chorus. Clari. Salesloft.\nName one AI coaching tool that works on a phone call.\n\nI'll wait."` },
      { type: 'avatar', text: `"Pitchr is the only AI coaching tool that works on phone calls.\nBecause it listens through your microphone — not your calendar invite.\n\nDoesn't care if it's Zoom, Teams, Meet, or a dial.\nIt just listens. And coaches."` },
      { type: 'avatar', text: `"If your pipeline lives on the phone, your tool should too.\nLink in bio."` },
    ],
  },
  {
    id: '06',
    title: 'The Secret Weapon',
    angle: 'Curiosity + FOMO — "most reps don\'t know this exists"',
    target: 'All SDR / AE',
    cta: 'Download',
    script: [
      { type: 'avatar', text: `"Top SDRs have a tool most people in sales don't know about.\n\nAnd I'm going to show you exactly what it is."` },
      { type: 'screen', text: 'Pitchr opening, starting a call, coaching card appearing' },
      { type: 'avatar', text: `"It's called Pitchr.\nIt listens to your sales calls in real time.\nThe moment a prospect throws an objection—\nthe exact rebuttal appears on your screen.\n\nBuying signal? Close prompt fires automatically.\n\nIt's like having a sales coach who never sleeps\nwhispering in your ear on every single call."` },
      { type: 'avatar', text: `"This is what separates the reps closing 70% from the ones closing 20%.\n\nNot the script. Not the product. The coaching, in real time.\n\n$39 a month. Free trial in bio."` },
    ],
  },
  {
    id: '07',
    title: 'Real-Time vs Post-Mortem',
    angle: 'The definitive argument for real-time over post-call',
    target: 'AE, Sales Manager',
    cta: 'Download',
    script: [
      { type: 'avatar', text: `"Getting coached after you lose a deal is like getting a diagnosis after the funeral.\n\nVery accurate. Very useful.\nCompletely too late."` },
      { type: 'avatar', text: `"Gong tells you what went wrong on last Tuesday's call.\nChorus breaks down the deal you lost in Q3.\nClari shows you the pipeline you're about to miss.\n\nPitchr tells you what to say right now.\nMid-call. Before the prospect hangs up."` },
      { type: 'screen', text: 'Coaching card firing in real time during a demo call' },
      { type: 'avatar', text: `"There's a tool for post-call analysis.\nThere's a tool for real-time coaching.\n\nMost reps only know about the first category.\n\nNow you know about both."` },
    ],
  },
  {
    id: '08',
    title: '10 Languages',
    angle: 'The language gap competitors ignore',
    target: 'Multilingual reps, international teams',
    cta: 'Waitlist',
    script: [
      { type: 'avatar', text: `"Name one AI sales coaching tool that works in Spanish.\n\nNot transcription. Not translation.\nActual, real-time coaching in Spanish.\n\nObjection handler fires in Spanish.\nBuying signal alert in Spanish.\nClose probability tracked in Spanish."` },
      { type: 'screen', text: 'Pitchr coaching panel with Spanish language active' },
      { type: 'avatar', text: `"Gong does English.\nChorus does English.\nClari does English.\n\nPitchr coaches in 10 languages.\nIncluding yours."` },
      { type: 'avatar', text: `"Built for reps who close deals in the language they think in.\nLink in bio."` },
    ],
  },
  {
    id: '09',
    title: 'The Solo Rep',
    angle: 'Built for the individual, not the enterprise',
    target: 'SDR / BDR grinding solo',
    cta: 'Waitlist',
    script: [
      { type: 'avatar', text: `"Every AI tool in sales—\n10-seat minimum.\nAnnual contract.\n90-day implementation.\nDedicated IT onboarding team required.\n\nLike, I'm one rep trying to hit quota.\nI don't have an IT department."` },
      { type: 'avatar', text: `"Pitchr is the first AI coaching tool built for the solo rep.\nOne seat. One install. 60 seconds to set up.\n\nNo team required. No manager sign-off.\nJust you, your calls, and real-time AI coaching."` },
      { type: 'screen', text: 'Pitchr install → first call → coaching card in under 60 seconds' },
      { type: 'avatar', text: `"If you're grinding it out solo — this one's for you.\nFree trial. Link in bio."` },
    ],
  },
];

const HOOKS = [
  'The objection that kills 80% of cold calls — and the exact 9 words that fix it.',
  'I used to freeze up every time a prospect said "we already have something." Then I found this.',
  'Gong costs $240/user/month and only works after you lose the deal.',
  'POV: AI whispers the perfect response while you\'re still on the call.',
  'Every AI sales tool is built for Zoom. 60% of your deals start on a phone call.',
  'Most SDRs have never heard of this tool. Top closers use it every day.',
  'Stop practicing objection scripts. Start having the response appear on your screen.',
  'Your close rate is inconsistent because no one is coaching you in real time.',
  'This tool hears "too expensive" and puts the rebuttal on your screen before you panic.',
  'Getting coached after you lose a deal is like a doctor diagnosing you after the funeral.',
  '1,800 sales reps are on the waitlist for this. Here\'s why.',
  'Name one AI coaching tool that works on a phone call. I\'ll wait.',
  'The real reason top reps close 70% and bottom reps close 15% — it\'s not the product.',
  'Every competitor needs 90 days to set up. This one starts in 60 seconds.',
  'You don\'t need more objection training. You need the response appearing while they\'re talking.',
];

const POSTING_SCHEDULE = [
  { day: 'Monday', platform: 'Instagram', format: 'Carousel', angle: 'Educational (objection scripts / framework)' },
  { day: 'Tuesday', platform: 'TikTok', format: 'AI UGC Video', angle: 'Pain/validation' },
  { day: 'Wednesday', platform: 'Instagram', format: 'Reel (repurpose video)', angle: 'Product POV' },
  { day: 'Thursday', platform: 'TikTok', format: 'AI UGC Video', angle: 'Price comparison or secret weapon' },
  { day: 'Friday', platform: 'Instagram', format: 'Carousel', angle: 'Competitor comparison or product walkthrough' },
  { day: 'Saturday', platform: 'TikTok', format: 'Screen recording', angle: 'POV close probability / demo' },
  { day: 'Sunday', platform: 'Instagram', format: 'Single image quote', angle: 'Punchy one-liner (shareable)' },
];

const CAPTURE_LIST = [
  'Objection fires — red "OBJECTION DETECTED" badge appearing on coaching panel',
  'Buying signal alert — green "BUYING SIGNAL" card appearing mid-transcript',
  'Close probability climbing — counter animating from 50% → 68% → 81%',
  'Coaching card full text — rebuttal appearing word by word',
  'Post-call summary — AI summary tab loading after call ends',
  'Follow-up email — full drafted email appearing in the email tab',
  'Live transcript — words appearing in real time as speech happens',
  'Lead score — score appearing on contact card after call',
  'Pre-call setup — 30-second setup: name, pitch, language, start',
];

export function MarketingPlanScreen({ onBack }: MarketingPlanScreenProps) {
  return (
    <div className="mplan">
      <div className="mplan__header">
        <button className="mplan__back" onClick={onBack}>← Back</button>
        <div className="mplan__header-title">
          <div className="mplan__badge">INTERNAL</div>
          <h1>Pitchr Marketing Plan</h1>
          <p className="mplan__subtitle">AI UGC videos · Carousel briefs · Posting schedule · Hook bank · Screen capture list</p>
        </div>
      </div>

      <div className="mplan__body">

        {/* ── Section 1: Video Scripts ── */}
        <section className="mplan__section">
          <div className="mplan__section-header">
            <span className="mplan__section-num">01</span>
            <h2>AI UGC Video Scripts</h2>
            <span className="mplan__section-note">For HeyGen / Arcads / Creatify · 30–60 sec each</span>
          </div>

          <div className="mplan__videos">
            {VIDEO_SCRIPTS.map(v => (
              <div key={v.id} className="mplan__video-card">
                <div className="mplan__video-card-header">
                  <span className="mplan__video-num">{v.id}</span>
                  <div>
                    <div className="mplan__video-title">{v.title}</div>
                    <div className="mplan__video-meta">{v.angle}</div>
                  </div>
                  <div className="mplan__video-tags">
                    <span className="mplan__tag mplan__tag--target">{v.target}</span>
                    <span className="mplan__tag mplan__tag--cta">{v.cta}</span>
                  </div>
                </div>
                <div className="mplan__video-script">
                  {v.script.map((line, i) => (
                    <div key={i} className={`mplan__script-line mplan__script-line--${line.type}`}>
                      <span className="mplan__script-label">
                        {line.type === 'avatar' ? 'AVATAR' : line.type === 'screen' ? 'SCREEN' : 'OVERLAY'}
                      </span>
                      <span className="mplan__script-text">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Hook Bank ── */}
        <section className="mplan__section">
          <div className="mplan__section-header">
            <span className="mplan__section-num">02</span>
            <h2>One-Sentence Hook Bank</h2>
            <span className="mplan__section-note">Use as opening lines for videos or slide 1 text</span>
          </div>
          <div className="mplan__hooks">
            {HOOKS.map((hook, i) => (
              <div key={i} className="mplan__hook">
                <span className="mplan__hook-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mplan__hook-text">"{hook}"</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Posting Schedule ── */}
        <section className="mplan__section">
          <div className="mplan__section-header">
            <span className="mplan__section-num">03</span>
            <h2>Weekly Posting Schedule</h2>
            <span className="mplan__section-note">Repeat every week · TikTok bonus: post at 7am, 12pm, 6pm</span>
          </div>
          <div className="mplan__schedule">
            {POSTING_SCHEDULE.map(row => (
              <div key={row.day} className="mplan__schedule-row">
                <span className="mplan__schedule-day">{row.day}</span>
                <span className={`mplan__tag mplan__tag--platform mplan__tag--${row.platform.toLowerCase()}`}>{row.platform}</span>
                <span className="mplan__schedule-format">{row.format}</span>
                <span className="mplan__schedule-angle">{row.angle}</span>
              </div>
            ))}
          </div>

          <div className="mplan__months">
            <div className="mplan__month-card">
              <div className="mplan__month-label">Month 1 — Warmup</div>
              <ul>
                <li>Produce all 10 video scripts using HeyGen or Arcads</li>
                <li>Produce all 5 carousels in Canva Pro / Figma</li>
                <li>Post Monday–Friday only, 1x per platform per day</li>
                <li>Goal: find which hook type gets the most profile visits</li>
              </ul>
            </div>
            <div className="mplan__month-card">
              <div className="mplan__month-label">Month 2 — Scale Up</div>
              <ul>
                <li>Double posting frequency on the better-performing platform</li>
                <li>Introduce comment-trigger CTAs ("Comment PITCH and I'll DM you the script")</li>
                <li>A/B test waitlist CTA vs download CTA on same content</li>
              </ul>
            </div>
            <div className="mplan__month-card">
              <div className="mplan__month-label">Month 3 — Optimise</div>
              <ul>
                <li>Kill bottom 20% of content formats</li>
                <li>Double down on top 2 angles by engagement and link-in-bio conversions</li>
                <li>Introduce repost/collab with sales influencers (1–3 DMs per week)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Section 4: CTA Strategy ── */}
        <section className="mplan__section">
          <div className="mplan__section-header">
            <span className="mplan__section-num">04</span>
            <h2>CTA Split Strategy</h2>
            <span className="mplan__section-note">Match CTA to where the viewer is</span>
          </div>
          <div className="mplan__cta-table">
            {[
              { situation: 'On Windows, ready to act', primary: 'Get for Windows — free trial', secondary: '—' },
              { situation: 'On mobile / iPhone', primary: 'Join the waitlist', secondary: '—' },
              { situation: 'Skeptical (first touch)', primary: 'Join the waitlist — no card', secondary: 'See how it works →' },
              { situation: 'Already warm (retarget / second view)', primary: 'Get for Windows', secondary: '7-day money-back' },
              { situation: 'Sales Manager', primary: 'Get for Windows — team plans', secondary: 'Join the waitlist' },
            ].map(row => (
              <div key={row.situation} className="mplan__cta-row">
                <span className="mplan__cta-situation">{row.situation}</span>
                <span className="mplan__cta-primary">{row.primary}</span>
                <span className="mplan__cta-secondary">{row.secondary}</span>
              </div>
            ))}
          </div>

          <div className="mplan__cta-scripts">
            <div className="mplan__cta-script-card">
              <div className="mplan__cta-script-label">Download CTA (word-for-word)</div>
              <p>"Free trial at pitchr.org — link in bio. Windows 10 and 11. Takes 60 seconds."</p>
            </div>
            <div className="mplan__cta-script-card">
              <div className="mplan__cta-script-label">Waitlist CTA (word-for-word)</div>
              <p>"Join 1,800+ reps on the waitlist at pitchr.org — link in bio. No card required."</p>
            </div>
            <div className="mplan__cta-script-card">
              <div className="mplan__cta-script-label">Split CTA (end of carousel)</div>
              <p>"On Windows? Download free. Not yet? Join the waitlist. Either way — pitchr.org"</p>
            </div>
          </div>
        </section>

        {/* ── Section 5: Screen Capture List ── */}
        <section className="mplan__section">
          <div className="mplan__section-header">
            <span className="mplan__section-num">05</span>
            <h2>Screen Recording Capture List</h2>
            <span className="mplan__section-note">Record at 1080p min · Record at 2x and slow down for impact</span>
          </div>
          <div className="mplan__captures">
            {CAPTURE_LIST.map((item, i) => (
              <div key={i} className="mplan__capture-item">
                <span className="mplan__capture-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mplan__capture-text">{item}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
