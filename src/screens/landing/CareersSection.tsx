import type { ReactNode } from 'react';

const JOB_LISTINGS = [
  { title: 'Senior Full-Stack Engineer',      team: 'Engineering',       location: 'Remote (EU / US)',   type: 'Full-time' },
  { title: 'AI/ML Engineer — Speech & NLP',   team: 'Engineering',       location: 'Remote (Worldwide)', type: 'Full-time' },
  { title: 'Head of Sales',                   team: 'Go-to-Market',      location: 'Remote (US)',        type: 'Full-time' },
  { title: 'Customer Success Manager',        team: 'Customer Success',  location: 'Remote (EU / US)',   type: 'Full-time' },
];

const PERKS = [
  { icon: '◎', title: 'Fully remote', desc: 'Work from anywhere. Async-first culture — no mandatory stand-ups, no HQ politics.' },
  { icon: '✦', title: 'Ship from day one', desc: "No layers between you and the product. Week one you're in the codebase or talking to customers." },
  { icon: '◈', title: 'Competitive pay & equity', desc: 'Market-rate salary, meaningful equity, and a $1,500 home-office stipend. We don\'t underpay to test commitment.' },
  { icon: '▣', title: 'Learning budget', desc: '$1,200/year for courses, books, conferences, or tools that make you better at your job.' },
  { icon: '◷', title: 'Unlimited leave', desc: 'Take the time you need. We measure output, not hours. Minimum 25 days encouraged.' },
  { icon: '↗', title: 'Transparent roadmap', desc: 'Everyone sees the full product roadmap and P&L. No information silos.' },
];

interface CareersSectionProps {
  nav: ReactNode;
  goSection: (id: string) => void;
}

export function CareersSection({ nav, goSection }: CareersSectionProps) {
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
