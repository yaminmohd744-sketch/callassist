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

export function HookBankSection() {
  return (
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
  );
}
