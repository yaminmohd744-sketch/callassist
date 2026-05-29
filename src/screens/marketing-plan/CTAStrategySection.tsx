const CTA_TABLE = [
  { situation: 'On Windows, ready to act',                         primary: 'Get for Windows — free trial',      secondary: '—' },
  { situation: 'On mobile / iPhone',                               primary: 'Join the waitlist',                 secondary: '—' },
  { situation: 'Skeptical (first touch)',                          primary: 'Join the waitlist — no card',       secondary: 'See how it works →' },
  { situation: 'Already warm (retarget / second view)',            primary: 'Get for Windows',                   secondary: '7-day money-back' },
  { situation: 'Sales Manager',                                    primary: 'Get for Windows — team plans',      secondary: 'Join the waitlist' },
];

const CTA_SCRIPTS = [
  {
    label: 'Download CTA (word-for-word)',
    text: '"Free trial at pitchr.org — link in bio. Windows 10 and 11. Takes 60 seconds."',
  },
  {
    label: 'Waitlist CTA (word-for-word)',
    text: '"Join 1,800+ reps on the waitlist at pitchr.org — link in bio. No card required."',
  },
  {
    label: 'Split CTA (end of carousel)',
    text: '"On Windows? Download free. Not yet? Join the waitlist. Either way — pitchr.org"',
  },
];

export function CTAStrategySection() {
  return (
    <section className="mplan__section">
      <div className="mplan__section-header">
        <span className="mplan__section-num">04</span>
        <h2>CTA Split Strategy</h2>
        <span className="mplan__section-note">Match CTA to where the viewer is</span>
      </div>

      <div className="mplan__cta-table">
        {CTA_TABLE.map(row => (
          <div key={row.situation} className="mplan__cta-row">
            <span className="mplan__cta-situation">{row.situation}</span>
            <span className="mplan__cta-primary">{row.primary}</span>
            <span className="mplan__cta-secondary">{row.secondary}</span>
          </div>
        ))}
      </div>

      <div className="mplan__cta-scripts">
        {CTA_SCRIPTS.map(s => (
          <div key={s.label} className="mplan__cta-script-card">
            <div className="mplan__cta-script-label">{s.label}</div>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
