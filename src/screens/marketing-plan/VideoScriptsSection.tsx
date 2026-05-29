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

export function VideoScriptsSection() {
  return (
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
  );
}
