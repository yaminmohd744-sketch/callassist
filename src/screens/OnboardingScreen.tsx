import { useState } from 'react';
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
  companyName: string;
  productDescription: string;
  language: LanguageCode;
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
  { title: 'Welcome to Pitchbase'         },
  { title: 'Who are you selling for?'      },
  { title: 'What do you sell?'             },
  { title: 'Tell us about it'              },
  { title: 'What language do you sell in?' },
  { title: "You're ready to close."        },
];

function flagUrl(code: LanguageCode) {
  return `https://flagcdn.com/w40/${code.split('-')[1].toLowerCase()}.png`;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [step, setStep]                   = useState(0);
  const [name, setName]                   = useState('');
  const [sellingFor, setSellingFor]       = useState<'self' | 'company' | ''>('');
  const [industry, setIndustry]           = useState('');
  const [industryOther, setIndustryOther] = useState('');
  const [companyName, setCompanyName]     = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [language, setLanguage]           = useState<LanguageCode>('en-US');

  const total    = STEPS.length;
  const progress = (step / (total - 1)) * 100;

  const categories = sellingFor === 'company' ? COMPANY_CATEGORIES : SELF_CATEGORIES;

  const effectiveIndustry = industry === 'other'
    ? industryOther.trim()
    : (categories.find(c => c.value === industry)?.label ?? '');

  const canNext = (() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return sellingFor !== '';
    if (step === 2) return industry !== '' && (industry !== 'other' || industryOther.trim().length > 0);
    if (step === 3) return productDescription.trim().length > 0;
    return true;
  })();

  function next() { setStep(s => Math.min(s + 1, total - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  function finish() {
    onDone({
      name,
      sellingFor: sellingFor as 'self' | 'company',
      industry: effectiveIndustry,
      companyName,
      productDescription,
      language,
    });
  }

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="ob">
      <div className="ob__orb ob__orb-a" />
      <div className="ob__orb ob__orb-b" />

      <div className="ob__progress-bar">
        <div className="ob__progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="ob__step-counter">{step + 1} / {total}</div>

      <div className="ob__card" key={step}>

        {/* ── Step 0: Name ── */}
        {step === 0 && (
          <div className="ob__slide">
            <div className="ob__logo">
              PITCH<span className="ob__logo-plus">PLUS</span><span className="ob__logo-sym">+</span>
            </div>
            <h1 className="ob__h1">Welcome aboard.</h1>
            <p className="ob__sub">Let's get to know you so your AI coach can actually help. Takes 60 seconds.</p>
            <div className="ob__field">
              <label className="ob__label">What's your first name?</label>
              <input
                className="ob__input"
                type="text"
                placeholder="e.g. Yamin"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && canNext && next()}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Self vs Company ── */}
        {step === 1 && (
          <div className="ob__slide">
            <h1 className="ob__h1">Who are you selling for, <span className="ob__name">{name}</span>?</h1>
            <p className="ob__sub">This helps us frame your coaching and scenarios correctly.</p>
            <div className="ob__who-grid">
              <button
                className={`ob__who-card${sellingFor === 'self' ? ' ob__who-card--active' : ''}`}
                onClick={() => setSellingFor('self')}
              >
                <span className="ob__who-emoji">🙋</span>
                <div className="ob__who-text">
                  <span className="ob__who-label">For myself</span>
                  <span className="ob__who-sub">I'm a freelancer, consultant, founder, or solopreneur</span>
                </div>
              </button>
              <button
                className={`ob__who-card${sellingFor === 'company' ? ' ob__who-card--active' : ''}`}
                onClick={() => setSellingFor('company')}
              >
                <span className="ob__who-emoji">🏢</span>
                <div className="ob__who-text">
                  <span className="ob__who-label">For a company</span>
                  <span className="ob__who-sub">I'm on a sales team or represent an employer</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Industry / Category ── */}
        {step === 2 && (
          <div className="ob__slide">
            <h1 className="ob__h1">
              {sellingFor === 'company' ? 'What does your company sell?' : 'What do you offer?'}
            </h1>
            <p className="ob__sub">Pick the closest fit — your AI coach will tailor its advice to your space.</p>
            <div className="ob__cat-grid">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`ob__cat-chip${industry === cat.value ? ' ob__cat-chip--active' : ''}`}
                  onClick={() => setIndustry(cat.value)}
                >
                  <span className="ob__cat-emoji">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            {industry === 'other' && (
              <div className="ob__field ob__field--mt">
                <label className="ob__label">Describe what you sell</label>
                <input
                  className="ob__input"
                  type="text"
                  placeholder="e.g. Cybersecurity auditing for SMBs"
                  value={industryOther}
                  onChange={e => setIndustryOther(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canNext && next()}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Details ── */}
        {step === 3 && (
          <div className="ob__slide">
            <h1 className="ob__h1">Tell us about it.</h1>
            <p className="ob__sub">
              The more specific you are, the more your AI coach can customise objection handling, pitches, and training to your actual deal.
            </p>
            <div className="ob__field">
              <label className="ob__label">
                {sellingFor === 'self' ? 'Your name or business name' : 'Company name'}
              </label>
              <input
                className="ob__input"
                type="text"
                placeholder={sellingFor === 'self' ? 'e.g. Yamin Consulting' : 'e.g. Acme Inc.'}
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="ob__field ob__field--mt">
              <label className="ob__label">What exactly do you sell?</label>
              <textarea
                className="ob__input ob__textarea"
                placeholder={
                  sellingFor === 'self'
                    ? 'e.g. Brand strategy and identity design for early-stage startups'
                    : 'e.g. AI-powered CRM that helps sales teams close 30% faster'
                }
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                rows={3}
              />
              <p className="ob__hint">Be specific — this goes straight into your AI coach's context.</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Language ── */}
        {step === 4 && (
          <div className="ob__slide">
            <h1 className="ob__h1">What language do you sell in?</h1>
            <p className="ob__sub">
              Sets the <strong>app's default language</strong> — coaching, training, and the interface. You can change it per call too.
            </p>
            <div className="ob__lang-grid">
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`ob__lang-chip${language === l.code ? ' ob__lang-chip--active' : ''}`}
                  onClick={() => setLanguage(l.code)}
                >
                  <img
                    className="ob__lang-flag"
                    src={flagUrl(l.code)}
                    alt={l.label}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 5: Ready ── */}
        {step === 5 && (
          <div className="ob__slide ob__slide--center">
            <div className="ob__ready-icon">✦</div>
            <h1 className="ob__h1">
              You're all set, <span className="ob__name">{name}</span>.
            </h1>
            <p className="ob__sub">
              Your AI coach knows your space. Here's what it's working with:
            </p>
            <div className="ob__ready-summary">
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon">{sellingFor === 'self' ? '🙋' : '🏢'}</span>
                <span className="ob__ready-row-label">Selling for</span>
                <span className="ob__ready-row-val">{sellingFor === 'self' ? 'Myself' : 'A company'}</span>
              </div>
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon">🎯</span>
                <span className="ob__ready-row-label">Industry</span>
                <span className="ob__ready-row-val">{effectiveIndustry}</span>
              </div>
              {companyName && (
                <div className="ob__ready-row">
                  <span className="ob__ready-row-icon">🏷</span>
                  <span className="ob__ready-row-label">{sellingFor === 'self' ? 'Business' : 'Company'}</span>
                  <span className="ob__ready-row-val">{companyName}</span>
                </div>
              )}
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon">💬</span>
                <span className="ob__ready-row-label">What you sell</span>
                <span className="ob__ready-row-val ob__ready-row-val--wrap">{productDescription}</span>
              </div>
              <div className="ob__ready-row">
                <img
                  className="ob__ready-row-icon ob__ready-row-flag"
                  src={flagUrl(selectedLang.code)}
                  alt={selectedLang.label}
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
