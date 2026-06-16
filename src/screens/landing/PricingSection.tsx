import type { ReactNode } from 'react';

const PRICING_FAQ = [
  {
    q: 'Can my prospect hear or tell that I\'m using AI coaching during the call?',
    a: 'No. Pitchr runs silently in a separate browser tab your prospect only hears you speaking normally. The coaching suggestions appear as text on your screen, so there\'s nothing audible on their end. It works the same way a physical cheat sheet would, except it updates in real time based on what\'s actually being said.',
  },
  {
    q: 'How accurate is the speech recognition, and what happens if it mishears something?',
    a: 'Pitchr uses your browser\'s native Web Speech API, which performs best in a quiet environment with a decent microphone. In good conditions accuracy is high enough to reliably catch objection keywords and buying signals. If a word is misheard, the coaching panel may occasionally miss a cue but it won\'t interrupt the call or show anything incorrect to the prospect. The full transcript is editable after the call before it\'s saved.',
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

interface PricingSectionProps {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  openFaq: number | null;
  setOpenFaq: (i: number | null) => void;
  onDownload: () => void;
  onDownloadMac?: () => void;
  nav: ReactNode;
}

export function PricingSection({ billingCycle, setBillingCycle, openFaq, setOpenFaq, onDownload, onDownloadMac, nav }: PricingSectionProps) {
  const yearly = billingCycle === 'yearly';
  const PLANS = [
    {
      tier: 'BASIC',
      monthlyPrice: 14.99,
      yearlyPrice: 12.99,
      desc: 'For reps learning the ropes.',
      cta: 'Get for Windows',
      ctaStyle: 'outline' as const,
      badge: null,
      highlight: false,
      features: [
        '30 live calls / month',
        'English & Spanish only',
        'Basic post-call summary',
        'Community support',
      ],
      missing: ['More languages', 'Analytics', 'Call upload'],
    },
    {
      tier: 'PLUS',
      monthlyPrice: 39,
      yearlyPrice: 32.99,
      desc: 'For reps ready to level up.',
      cta: 'Get for Windows',
      ctaStyle: 'primary' as const,
      badge: 'MOST POPULAR',
      highlight: true,
      features: [
        '100 live calls / month',
        '6 languages',
        'Full post-call analysis + follow-up email',
        'Basic analytics',
        'Email support',
      ],
      missing: ['All 10 languages', 'Advanced analytics', 'Call upload'],
    },
    {
      tier: 'PRO',
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
              <div className="lp__dl-btns lp__dl-btns--pricing lp__pricing-cta">
                <button className={`lp__btn lp__btn--${plan.ctaStyle}`} onClick={onDownload}>
                  Windows
                </button>
                {onDownloadMac && (
                  <button className={`lp__btn lp__btn--${plan.ctaStyle}`} onClick={onDownloadMac}>
                    Mac
                  </button>
                )}
              </div>
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
