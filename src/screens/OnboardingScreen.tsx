import { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import './OnboardingScreen.css';

interface OnboardingScreenProps {
  onDone: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  experience: string;
  language: LanguageCode;
}

const EXPERIENCE_OPTIONS = [
  { value: 'under-6m',  label: 'Under 6 months',     sub: "I'm just getting started" },
  { value: '6m-1y',     label: '6 months – 1 year',   sub: 'Building my foundations'  },
  { value: '1y-3y',     label: '1 – 3 years',         sub: 'Getting comfortable'       },
  { value: '3y-5y',     label: '3 – 5 years',         sub: 'Confident rep'             },
  { value: '5y-plus',   label: '5+ years',             sub: 'Seasoned professional'     },
  { value: 'manager',   label: 'Sales manager',        sub: 'I lead a team'            },
];

const STEPS = [
  { title: 'Welcome to Pitch Plus'          },
  { title: 'How deep into sales are you?'   },
  { title: 'What language do you sell in?'  },
  { title: "You're ready to close."         },
];

function flagUrl(code: LanguageCode) {
  return `https://flagcdn.com/w40/${code.split('-')[1].toLowerCase()}.png`;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [step, setStep]             = useState(0);
  const [name, setName]             = useState('');
  const [experience, setExperience] = useState('');
  const [language, setLanguage]     = useState<LanguageCode>('en-US');

  const total    = STEPS.length;
  const progress = (step / (total - 1)) * 100;

  const canNext = (() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return experience !== '';
    return true;
  })();

  function next() { setStep(s => Math.min(s + 1, total - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  function finish() {
    onDone({ name, experience, language });
  }

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="ob">
      <div className="ob__orb ob__orb-a" />
      <div className="ob__orb ob__orb-b" />

      {/* Progress */}
      <div className="ob__progress-bar">
        <div className="ob__progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="ob__step-counter">{step + 1} / {total}</div>

      {/* Card */}
      <div className="ob__card" key={step}>

        {/* ── Step 0: Name ── */}
        {step === 0 && (
          <div className="ob__slide">
            <div className="ob__logo">
              PITCH<span className="ob__logo-plus">PLUS</span><span className="ob__logo-sym">+</span>
            </div>
            <h1 className="ob__h1">Welcome aboard.</h1>
            <p className="ob__sub">Let's personalise your experience. Takes 60 seconds.</p>
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

        {/* ── Step 1: Experience ── */}
        {step === 1 && (
          <div className="ob__slide">
            <h1 className="ob__h1">How deep into sales are you, <span className="ob__name">{name}</span>?</h1>
            <p className="ob__sub">We'll calibrate the coaching difficulty and training scenarios to match where you are.</p>
            <div className="ob__exp-grid">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`ob__exp-card${experience === opt.value ? ' ob__exp-card--active' : ''}`}
                  onClick={() => setExperience(opt.value)}
                >
                  <span className="ob__exp-label">{opt.label}</span>
                  <span className="ob__exp-sub">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Language ── */}
        {step === 2 && (
          <div className="ob__slide">
            <h1 className="ob__h1">What language do you sell in?</h1>
            <p className="ob__sub">
              This sets the <strong>app's default language</strong> — coaching, training, and the interface.
              You can always change it inside the app or pick a different language for individual calls.
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

        {/* ── Step 3: Ready ── */}
        {step === 3 && (
          <div className="ob__slide ob__slide--center">
            <div className="ob__ready-icon">✦</div>
            <h1 className="ob__h1">
              You're all set, <span className="ob__name">{name}</span>.
            </h1>
            <p className="ob__sub">
              Your coaching is calibrated, your app language is set to{' '}
              <strong>
                <img
                  className="ob__ready-flag"
                  src={flagUrl(selectedLang.code)}
                  alt={selectedLang.label}
                />{' '}
                {selectedLang.label}
              </strong>,
              and your first training scenario is ready.
            </p>
            <div className="ob__ready-summary">
              <div className="ob__ready-row">
                <span className="ob__ready-row-icon">⏱</span>
                <span className="ob__ready-row-label">Experience</span>
                <span className="ob__ready-row-val">
                  {EXPERIENCE_OPTIONS.find(e => e.value === experience)?.label}
                </span>
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
            <div className="ob__ready-tips">
              <div className="ob__ready-tip">
                <span className="ob__ready-tip-icon">▶</span>
                <div>
                  <strong>Start a live call</strong>
                  <p>Hit "New Call" to get real-time coaching on your next prospect call.</p>
                </div>
              </div>
              <div className="ob__ready-tip">
                <span className="ob__ready-tip-icon">◈</span>
                <div>
                  <strong>Try training first</strong>
                  <p>Practice against an AI prospect — no pressure, full feedback.</p>
                </div>
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
