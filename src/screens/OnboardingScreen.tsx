import { useState, useEffect, useRef, useMemo } from 'react';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import './OnboardingScreen.css';

interface OnboardingScreenProps {
  onDone: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  sellingFor: 'self' | 'company';
  industry: string;
  companyName?: string;
  productDescription: string;
  language: LanguageCode;
  targetCustomer: string;
  differentiators: string[];
  commonObjections: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'experienced' | 'veteran';
  dealType?: 'transactional' | 'mid-market' | 'enterprise';
  topChallenges: string[];
}

// ── Category options ──────────────────────────────────────────────────────────

interface Category { value: string; emoji: string; label: string; }

const SELF_CATEGORIES: Category[] = [
  { value: 'consulting',   emoji: '🧠', label: 'Consulting / Coaching'     },
  { value: 'creative',     emoji: '🎨', label: 'Creative Services'          },
  { value: 'tech-services',emoji: '💻', label: 'Tech / Dev Services'        },
  { value: 'real-estate',  emoji: '🏠', label: 'Real Estate'                },
  { value: 'finance',      emoji: '💰', label: 'Finance / Insurance'        },
  { value: 'physical',     emoji: '📦', label: 'Physical Products'          },
  { value: 'digital-saas', emoji: '🚀', label: 'Digital Products / SaaS'   },
  { value: 'recruiting',   emoji: '🤝', label: 'Recruiting / Staffing'      },
  { value: 'health',       emoji: '🏃', label: 'Health & Wellness'          },
  { value: 'events',       emoji: '🎤', label: 'Events / Speaking'          },
  { value: 'legal',        emoji: '⚖️', label: 'Legal / Compliance'         },
  { value: 'other',        emoji: '✏️', label: 'Something else…'            },
];

const COMPANY_CATEGORIES: Category[] = [
  { value: 'saas',          emoji: '💻', label: 'SaaS / Software'           },
  { value: 'agency',        emoji: '🏢', label: 'Agency / Services'         },
  { value: 'finance',       emoji: '💰', label: 'Financial Services'        },
  { value: 'healthcare',    emoji: '🏥', label: 'Healthcare / MedTech'      },
  { value: 'real-estate',   emoji: '🏠', label: 'Real Estate'               },
  { value: 'ecommerce',     emoji: '🛒', label: 'E-commerce / Retail'       },
  { value: 'manufacturing', emoji: '🏭', label: 'Manufacturing / Hardware'  },
  { value: 'media',         emoji: '📡', label: 'Media / Advertising'       },
  { value: 'logistics',     emoji: '🚚', label: 'Logistics / Supply Chain'  },
  { value: 'education',     emoji: '📚', label: 'EdTech / Education'        },
  { value: 'legal',         emoji: '⚖️', label: 'Legal / Compliance'        },
  { value: 'other',         emoji: '✏️', label: 'Something else…'           },
];

const STEPS = [
  { title: 'Welcome to Pitchr'              },  // 0
  { title: 'How long have you been selling?'},  // 1 NEW
  { title: 'Who are you selling for?'       },  // 2
  { title: 'What do you sell?'              },  // 3
  { title: 'Tell us about it'               },  // 4
  { title: 'Who do you sell to?'            },  // 5
  { title: 'Your competitive edge'          },  // 6
  { title: 'What do you want to improve?'   },  // 7 NEW
  { title: 'What language do you sell in?'  },  // 8
  { title: "You're ready to close."         },  // 9
];

interface ExperienceOption {
  value: 'beginner' | 'intermediate' | 'experienced' | 'veteran';
  emoji: string;
  label: string;
  sub: string;
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { value: 'beginner',     emoji: '🌱', label: 'Just starting out',  sub: 'Under 1 year in sales'  },
  { value: 'intermediate', emoji: '📈', label: 'Getting confident',  sub: '1–3 years'               },
  { value: 'experienced',  emoji: '🎯', label: 'Battle-tested',      sub: '3–10 years'              },
  { value: 'veteran',      emoji: '🏆', label: 'Sales veteran',      sub: '10+ years'               },
];

interface ChallengeOption { value: string; emoji: string; label: string; }
const CHALLENGE_OPTIONS: ChallengeOption[] = [
  { value: 'Handling objections',  emoji: '🛡', label: 'Handling objections' },
  { value: 'Closing more deals',   emoji: '🔑', label: 'Closing more deals'  },
  { value: 'Better discovery',     emoji: '🔍', label: 'Better discovery'    },
  { value: 'Building rapport',     emoji: '🤝', label: 'Building rapport'    },
  { value: 'Staying confident',    emoji: '💪', label: 'Staying confident'   },
  { value: 'Consistent process',   emoji: '📋', label: 'Consistent process'  },
];

const EXP_SUMMARY_LABEL: Record<string, string> = {
  beginner:     '🌱 Just starting out',
  intermediate: '📈 Getting confident',
  experienced:  '🎯 Battle-tested',
  veteran:      '🏆 Sales veteran',
};

function flagUrl(code: LanguageCode) {
  return `https://flagcdn.com/w40/${code.split('-')[1].toLowerCase()}.png`;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [step, setStep]                   = useState(0);
  const [name, setName]                   = useState('');
  const [sellingFor, setSellingFor]       = useState<'self' | 'company' | null>(null);
  const [industry, setIndustry]           = useState('');
  const [industryOther, setIndustryOther] = useState('');
  const [companyName, setCompanyName]     = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [language, setLanguage]           = useState<LanguageCode>('en-US');
  // Phase 2 fields
  const [targetCustomer, setTargetCustomer]   = useState('');
  const [differentiators, setDifferentiators] = useState<[string, string, string]>(['', '', '']);
  const [commonObjectionsRaw, setCommonObjectionsRaw] = useState('');
  // Personalization fields
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'experienced' | 'veteran' | null>(null);
  const [dealType, setDealType]               = useState<'transactional' | 'mid-market' | 'enterprise' | null>(null);
  const [topChallenges, setTopChallenges]     = useState<string[]>([]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const total    = STEPS.length;
  const progress = (step / (total - 1)) * 100;

  const categories = sellingFor === 'company' ? COMPANY_CATEGORIES : SELF_CATEGORIES;

  const effectiveIndustry = industry === 'other'
    ? industryOther.trim()
    : (categories.find(c => c.value === industry)?.label ?? '');

  const filledDifferentiators = differentiators.filter(d => d.trim());

  const canNext = (() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return experienceLevel !== null;
    if (step === 2) return sellingFor !== null;
    if (step === 3) return industry !== '' && (industry !== 'other' || industryOther.trim().length > 0);
    if (step === 4) return productDescription.trim().length > 0;
    if (step === 5) return targetCustomer.trim().length > 0;
    return true; // steps 6, 7, 8, 9
  })();

  const selectedLang = useMemo(
    () => SUPPORTED_LANGUAGES.find(l => l.code === language) ?? SUPPORTED_LANGUAGES[0],
    [language],
  );

  function next() { setStep(s => Math.min(s + 1, total - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  function handleSellingFor(val: 'self' | 'company') {
    setSellingFor(val);
    setIndustry('');
    setIndustryOther('');
  }

  function toggleChallenge(val: string) {
    setTopChallenges(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : prev.length < 3 ? [...prev, val] : prev,
    );
  }

  function updateDifferentiator(index: 0 | 1 | 2, value: string) {
    setDifferentiators(prev => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  }

  function finish() {
    if (!sellingFor || !experienceLevel) return;
    const commonObjections = commonObjectionsRaw
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean);
    onDone({
      name,
      sellingFor,
      industry: effectiveIndustry,
      companyName: companyName || undefined,
      productDescription,
      language,
      targetCustomer,
      differentiators: filledDifferentiators,
      commonObjections,
      experienceLevel,
      dealType: dealType ?? undefined,
      topChallenges,
    });
  }

  return (
    <div className="ob">
      <div className="ob__orb ob__orb-a" />
      <div className="ob__orb ob__orb-b" />

      <div className="ob__progress-bar">
        <div className="ob__progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        className="ob__step-counter"
        aria-live="polite"
        aria-label={`Step ${step + 1} of ${total}`}
      >
        {step + 1} / {total}
      </div>

      <div className="ob__card" key={step}>

        {/* ── Step 0: Name ── */}
        {step === 0 && (
          <div className="ob__slide">
            <div className="ob__logo">PITCHR</div>
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>Welcome aboard.</h1>
            <p className="ob__sub">Let's get to know you so your AI coach can actually help. Takes 60 seconds.</p>
            <div className="ob__field">
              <label htmlFor="ob-name" className="ob__label">What's your first name?</label>
              <input
                id="ob-name"
                className="ob__input"
                type="text"
                placeholder="e.g. Yamin"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && canNext && next()}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Experience level ── */}
        {step === 1 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>
              How long have you been selling, <span className="ob__name">{name}</span>?
            </h1>
            <p className="ob__sub">Your AI coach adjusts its style based on your experience — tougher love for veterans, more guidance for newcomers.</p>
            <div className="ob__exp-grid">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`ob__exp-card${experienceLevel === opt.value ? ' ob__exp-card--active' : ''}`}
                  onClick={() => setExperienceLevel(opt.value)}
                  aria-pressed={experienceLevel === opt.value}
                >
                  <span className="ob__exp-emoji" aria-hidden="true">{opt.emoji}</span>
                  <span className="ob__exp-label">{opt.label}</span>
                  <span className="ob__exp-sub">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Self vs Company ── */}
        {step === 2 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>
              Who are you selling for, <span className="ob__name">{name}</span>?
            </h1>
            <p className="ob__sub">This helps us frame your coaching and scenarios correctly.</p>
            <div className="ob__who-grid">
              <button
                className={`ob__who-card${sellingFor === 'self' ? ' ob__who-card--active' : ''}`}
                onClick={() => handleSellingFor('self')}
                aria-pressed={sellingFor === 'self'}
              >
                <span className="ob__who-emoji" aria-hidden="true">🙋</span>
                <div className="ob__who-text">
                  <span className="ob__who-label">For myself</span>
                  <span className="ob__who-sub">I'm a freelancer, consultant, founder, or solopreneur</span>
                </div>
              </button>
              <button
                className={`ob__who-card${sellingFor === 'company' ? ' ob__who-card--active' : ''}`}
                onClick={() => handleSellingFor('company')}
                aria-pressed={sellingFor === 'company'}
              >
                <span className="ob__who-emoji" aria-hidden="true">🏢</span>
                <div className="ob__who-text">
                  <span className="ob__who-label">For a company</span>
                  <span className="ob__who-sub">I'm on a sales team or represent an employer</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Industry / Category ── */}
        {step === 3 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>
              {sellingFor === 'company' ? 'What does your company sell?' : 'What do you offer?'}
            </h1>
            <p className="ob__sub">Pick the closest fit — your AI coach will tailor its advice to your space.</p>
            <div className="ob__cat-grid">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`ob__cat-chip${industry === cat.value ? ' ob__cat-chip--active' : ''}`}
                  onClick={() => setIndustry(cat.value)}
                  aria-pressed={industry === cat.value}
                >
                  <span className="ob__cat-emoji" aria-hidden="true">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            {industry === 'other' && (
              <div className="ob__field ob__field--mt">
                <label htmlFor="ob-industry-other" className="ob__label">Describe what you sell</label>
                <input
                  id="ob-industry-other"
                  className="ob__input"
                  type="text"
                  placeholder="e.g. Cybersecurity auditing for SMBs"
                  value={industryOther}
                  onChange={e => setIndustryOther(e.target.value)}
                  maxLength={120}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canNext && next()}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Details ── */}
        {step === 4 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>Tell us about it.</h1>
            <p className="ob__sub">
              The more specific you are, the more your AI coach can customise objection handling, pitches, and training to your actual deal.
            </p>
            <div className="ob__field">
              <label htmlFor="ob-company" className="ob__label">
                {sellingFor === 'self' ? 'Your name or business name' : 'Company name'}
                <span className="ob__label-optional"> (optional)</span>
              </label>
              <input
                id="ob-company"
                className="ob__input"
                type="text"
                placeholder={sellingFor === 'self' ? 'e.g. Yamin Consulting' : 'e.g. Acme Inc.'}
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                maxLength={80}
                autoFocus
              />
            </div>
            <div className="ob__field ob__field--mt">
              <label htmlFor="ob-product" className="ob__label">What exactly do you sell?</label>
              <textarea
                id="ob-product"
                className="ob__input ob__textarea"
                placeholder={
                  sellingFor === 'self'
                    ? 'e.g. Brand strategy and identity design for early-stage startups'
                    : 'e.g. AI-powered CRM that helps sales teams close 30% faster'
                }
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="ob__hint">Be specific — this goes straight into your AI coach's context.</p>
            </div>
            <div className="ob__field ob__field--mt">
              <label className="ob__label">How long is a typical deal?<span className="ob__label-optional"> (optional)</span></label>
              <div className="ob__deal-row">
                {([
                  { value: 'transactional', label: 'Quick win', sub: 'Same-day – 1 week' },
                  { value: 'mid-market',    label: 'A few weeks', sub: '1–4 weeks' },
                  { value: 'enterprise',    label: 'Long cycle', sub: 'Months' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    className={`ob__deal-btn${dealType === opt.value ? ' ob__deal-btn--active' : ''}`}
                    onClick={() => setDealType(prev => prev === opt.value ? null : opt.value)}
                    aria-pressed={dealType === opt.value}
                  >
                    <span className="ob__deal-label">{opt.label}</span>
                    <span className="ob__deal-sub">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Target Customer ── */}
        {step === 5 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>Who do you sell to?</h1>
            <p className="ob__sub">
              Describe your typical buyer. Your AI coach will tailor objection responses and closing tactics to this specific person.
            </p>
            <div className="ob__field">
              <label htmlFor="ob-target" className="ob__label">Your ideal customer</label>
              <textarea
                id="ob-target"
                className="ob__input ob__textarea"
                placeholder="e.g. CTOs at Series B SaaS companies with 50–500 employees"
                value={targetCustomer}
                onChange={e => setTargetCustomer(e.target.value)}
                maxLength={300}
                rows={2}
                autoFocus
              />
              <p className="ob__hint">The more specific, the sharper your coaching will be.</p>
            </div>
          </div>
        )}

        {/* ── Step 6: Competitive Edge ── */}
        {step === 6 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>Your competitive edge.</h1>
            <p className="ob__sub">
              Help your AI coach understand what makes you stand out — and what pushback to expect.
            </p>
            <div className="ob__field">
              <label className="ob__label">What makes you stand out?<span className="ob__label-optional"> (up to 3)</span></label>
              {([0, 1, 2] as const).map(i => (
                <div key={i} className="ob__diff-row">
                  <span className="ob__diff-bullet" aria-hidden="true">◆</span>
                  <input
                    className="ob__input ob__diff-input"
                    type="text"
                    placeholder={
                      i === 0 ? 'e.g. 30-day money back guarantee' :
                      i === 1 ? 'e.g. 2x faster onboarding than competitors' :
                                'e.g. Dedicated account manager included'
                    }
                    value={differentiators[i]}
                    onChange={e => updateDifferentiator(i, e.target.value)}
                    maxLength={120}
                    autoFocus={i === 0}
                  />
                </div>
              ))}
            </div>
            <div className="ob__field ob__field--mt">
              <label htmlFor="ob-objections" className="ob__label">
                Objections you usually face?
                <span className="ob__label-optional"> (optional)</span>
              </label>
              <textarea
                id="ob-objections"
                className="ob__input ob__textarea"
                placeholder="e.g. Too expensive, Not the right time, Already using a competitor"
                value={commonObjectionsRaw}
                onChange={e => setCommonObjectionsRaw(e.target.value)}
                maxLength={300}
                rows={2}
              />
              <p className="ob__hint">Separate with commas. Your coach will prepare responses for these.</p>
            </div>
          </div>
        )}

        {/* ── Step 7: Top challenges (NEW) ── */}
        {step === 7 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>What do you want to get better at?</h1>
            <p className="ob__sub">
              Pick up to 3. Your AI coach will focus on these areas from your very first call — no waiting.
            </p>
            <div className="ob__challenge-grid">
              {CHALLENGE_OPTIONS.map(opt => {
                const selected = topChallenges.includes(opt.value);
                const maxed    = !selected && topChallenges.length >= 3;
                return (
                  <button
                    key={opt.value}
                    className={`ob__challenge-chip${selected ? ' ob__challenge-chip--active' : ''}${maxed ? ' ob__challenge-chip--disabled' : ''}`}
                    onClick={() => !maxed && toggleChallenge(opt.value)}
                    aria-pressed={selected}
                    disabled={maxed}
                  >
                    <span className="ob__challenge-emoji" aria-hidden="true">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {topChallenges.length > 0 && (
              <p className="ob__hint ob__hint--center">
                {topChallenges.length} / 3 selected
                {topChallenges.length === 3 && ' — your coach is ready to focus on these.'}
              </p>
            )}
          </div>
        )}

        {/* ── Step 8: Language ── */}
        {step === 8 && (
          <div className="ob__slide">
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>What language do you sell in?</h1>
            <p className="ob__sub">
              Sets the <strong>app's default language</strong> — coaching, training, and the interface. You can change it per call too.
            </p>
            <div className="ob__lang-grid">
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`ob__lang-chip${language === l.code ? ' ob__lang-chip--active' : ''}`}
                  onClick={() => setLanguage(l.code)}
                  aria-pressed={language === l.code}
                >
                  <img
                    className="ob__lang-flag"
                    src={flagUrl(l.code)}
                    alt=""
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 9: Ready ── */}
        {step === 9 && (
          <div className="ob__slide ob__slide--center">
            <div className="ob__ready-icon" aria-hidden="true">✦</div>
            <h1 className="ob__h1" ref={headingRef} tabIndex={-1}>
              You're all set, <span className="ob__name">{name}</span>.
            </h1>
            <p className="ob__sub">
              Your AI coach knows your world. Here's what it's working with:
            </p>
            <div className="ob__ready-summary">
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon" aria-hidden="true">{sellingFor === 'self' ? '🙋' : '🏢'}</span>
                <span className="ob__ready-row-label">Selling for</span>
                <span className="ob__ready-row-val">{sellingFor === 'self' ? 'Myself' : 'A company'}</span>
              </div>
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon" aria-hidden="true">🎯</span>
                <span className="ob__ready-row-label">Industry</span>
                <span className="ob__ready-row-val">{effectiveIndustry}</span>
              </div>
              {companyName && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon" aria-hidden="true">🏷</span>
                  <span className="ob__ready-row-label">{sellingFor === 'self' ? 'Business' : 'Company'}</span>
                  <span className="ob__ready-row-val">{companyName}</span>
                </div>
              )}
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon" aria-hidden="true">💬</span>
                <span className="ob__ready-row-label">What you sell</span>
                <span className="ob__ready-row-val ob__ready-row-val--wrap">{productDescription}</span>
              </div>
              {targetCustomer && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon" aria-hidden="true">👤</span>
                  <span className="ob__ready-row-label">Selling to</span>
                  <span className="ob__ready-row-val ob__ready-row-val--wrap">{targetCustomer}</span>
                </div>
              )}
              {filledDifferentiators.length > 0 && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon" aria-hidden="true">⚡</span>
                  <span className="ob__ready-row-label">Your edge</span>
                  <span className="ob__ready-row-val ob__ready-row-val--wrap">{filledDifferentiators.join(' · ')}</span>
                </div>
              )}
              {experienceLevel && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon" aria-hidden="true">
                    {EXP_SUMMARY_LABEL[experienceLevel].split(' ')[0]}
                  </span>
                  <span className="ob__ready-row-label">Experience</span>
                  <span className="ob__ready-row-val">
                    {EXP_SUMMARY_LABEL[experienceLevel].split(' ').slice(1).join(' ')}
                  </span>
                </div>
              )}
              {dealType && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon" aria-hidden="true">💼</span>
                  <span className="ob__ready-row-label">Deal type</span>
                  <span className="ob__ready-row-val">
                    {dealType === 'transactional' ? 'Quick wins' : dealType === 'mid-market' ? 'A few weeks' : 'Long cycle'}
                  </span>
                </div>
              )}
              {topChallenges.length > 0 && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon" aria-hidden="true">🎯</span>
                  <span className="ob__ready-row-label">Focus areas</span>
                  <span className="ob__ready-row-val ob__ready-row-val--wrap">{topChallenges.join(' · ')}</span>
                </div>
              )}
              <div className="ob__ready-row">
                <img
                  className="ob__ready-row-icon ob__ready-row-flag"
                  src={flagUrl(selectedLang.code)}
                  alt=""
                />
                <span className="ob__ready-row-label">Language</span>
                <span className="ob__ready-row-val">{selectedLang.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="ob__nav">
          {step > 0 && step < total - 1 && (
            <button className="ob__btn ob__btn--back" onClick={back}>← Back</button>
          )}
          <div className="ob__nav-spacer" />
          {step < total - 1 ? (
            <button className="ob__btn ob__btn--next" onClick={next} disabled={!canNext}>
              {step === total - 2 ? 'Finish setup →' : 'Continue →'}
            </button>
          ) : (
            <button className="ob__btn ob__btn--finish" onClick={finish}>
              ▶ Go to my dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
