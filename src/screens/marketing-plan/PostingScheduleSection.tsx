const POSTING_SCHEDULE = [
  { day: 'Monday',    platform: 'Instagram', format: 'Carousel',               angle: 'Educational (objection scripts / framework)' },
  { day: 'Tuesday',   platform: 'TikTok',    format: 'AI UGC Video',            angle: 'Pain/validation' },
  { day: 'Wednesday', platform: 'Instagram', format: 'Reel (repurpose video)',   angle: 'Product POV' },
  { day: 'Thursday',  platform: 'TikTok',    format: 'AI UGC Video',            angle: 'Price comparison or secret weapon' },
  { day: 'Friday',    platform: 'Instagram', format: 'Carousel',               angle: 'Competitor comparison or product walkthrough' },
  { day: 'Saturday',  platform: 'TikTok',    format: 'Screen recording',        angle: 'POV close probability / demo' },
  { day: 'Sunday',    platform: 'Instagram', format: 'Single image quote',      angle: 'Punchy one-liner (shareable)' },
];

const MONTHS = [
  {
    label: 'Month 1 — Warmup',
    items: [
      'Produce all 10 video scripts using HeyGen or Arcads',
      'Produce all 5 carousels in Canva Pro / Figma',
      'Post Monday–Friday only, 1x per platform per day',
      'Goal: find which hook type gets the most profile visits',
    ],
  },
  {
    label: 'Month 2 — Scale Up',
    items: [
      'Double posting frequency on the better-performing platform',
      'Introduce comment-trigger CTAs ("Comment PITCH and I\'ll DM you the script")',
      'A/B test waitlist CTA vs download CTA on same content',
    ],
  },
  {
    label: 'Month 3 — Optimise',
    items: [
      'Kill bottom 20% of content formats',
      'Double down on top 2 angles by engagement and link-in-bio conversions',
      'Introduce repost/collab with sales influencers (1–3 DMs per week)',
    ],
  },
];

export function PostingScheduleSection() {
  return (
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
        {MONTHS.map(m => (
          <div key={m.label} className="mplan__month-card">
            <div className="mplan__month-label">{m.label}</div>
            <ul>
              {m.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
