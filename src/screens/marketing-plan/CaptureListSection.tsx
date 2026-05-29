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

export function CaptureListSection() {
  return (
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
  );
}
