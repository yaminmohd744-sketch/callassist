import { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { enhancePitch, generateBattleCard } from '../lib/ai';
import type { BattleCard } from '../lib/ai';
import type { CallConfig } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import './PreCallScreen.css';

type StringConfigField = 'prospectName' | 'company' | 'prospectTitle' | 'yourPitch' | 'callGoal' | 'callType' | 'priorContext' | 'language';
type StringConfigErrors = Partial<Record<StringConfigField, string>>;

interface PreCallScreenProps {
  onStartCall: (config: CallConfig) => void;
  onBack: () => void;
  defaultLanguage?: LanguageCode;
  defaultCompany?: string;
  defaultPitch?: string;
  defaultConfig?: Partial<CallConfig & { prospectTitle?: string }>;
}

const CALL_TYPES = [
  { value: 'cold',        label: 'Cold call'       },
  { value: 'warm',        label: 'Warm follow-up'  },
  { value: 'referral',    label: 'Referral'         },
  { value: 'discovery',   label: 'Discovery'        },
  { value: 'demo',        label: 'Demo'             },
  { value: 'negotiation', label: 'Negotiation'      },
  { value: 'close',       label: 'Closing call'     },
];

const GOAL_PLACEHOLDERS: Record<string, string> = {
  cold:        'e.g. Get them to agree to a 20-minute discovery call',
  warm:        'e.g. Follow up on the proposal and confirm next steps',
  referral:    'e.g. Introduce yourself and schedule a demo',
  discovery:   'e.g. Uncover budget, timeline, and key pain points',
  demo:        'e.g. Show the dashboard, address their data security concern',
  negotiation: 'e.g. Agree on pricing, handle the contract length objection',
  close:       'e.g. Get a verbal yes and confirm the start date',
  default:     'e.g. What do you want to walk away with from this call?',
};

export function PreCallScreen({ onStartCall, onBack, defaultLanguage = 'en-US', defaultCompany = '', defaultPitch = '', defaultConfig }: PreCallScreenProps) {
  const [prevTip] = useState<string | null>(() => localStorage.getItem('callassist:nextCallTip'));
  const [tipDismissed, setTipDismissed] = useState(false);
  const [form, setForm] = useState<CallConfig>({
    prospectName: defaultConfig?.prospectName ?? '',
    company:      defaultConfig?.company ?? defaultCompany,
    prospectTitle: defaultConfig?.prospectTitle ?? '',
    callType:     defaultConfig?.callType ?? '',
    callGoal:     defaultConfig?.callGoal ?? '',
    priorContext: defaultConfig?.priorContext ?? '',
    yourPitch:    defaultPitch,
    language:     defaultLanguage,
  });
  const t = useTranslations();
  const [errors, setErrors] = useState<StringConfigErrors>({});
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const enhancingRef = useRef(false);
  const [battleCard, setBattleCard] = useState<BattleCard | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardExpanded, setCardExpanded] = useState(false);
  const generatingCardRef = useRef(false);

  function handleChange(field: StringConfigField, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    if (field === 'yourPitch') setEnhanced(false);
  }

  function handleCallType(value: string) {
    setForm(f => ({ ...f, callType: f.callType === value ? '' : value }));
  }

  async function handleGenerateBattleCard() {
    if (generatingCardRef.current) return;
    generatingCardRef.current = true;
    setGeneratingCard(true);
    try {
      const card = await generateBattleCard(
        form.prospectName, form.prospectTitle ?? '', form.company,
        form.callType ?? '', form.callGoal, form.yourPitch, form.priorContext ?? '',
      );
      setBattleCard(card);
      setCardExpanded(true);
    } finally {
      generatingCardRef.current = false;
      setGeneratingCard(false);
    }
  }

  async function handleEnhancePitch() {
    if (!form.yourPitch.trim() || enhancingRef.current) return;
    enhancingRef.current = true;
    setEnhancing(true);
    setEnhanced(false);
    try {
      const result = await enhancePitch(form.yourPitch, form.company, form.callGoal);
      setForm(f => ({ ...f, yourPitch: result }));
      setEnhanced(true);
    } finally {
      enhancingRef.current = false;
      setEnhancing(false);
    }
  }

  function handleSubmit() {
    const newErrors: StringConfigErrors = {};
    if (!form.prospectName.trim()) newErrors.prospectName = t.errors?.required ?? 'Required';
    if (!form.callGoal.trim())     newErrors.callGoal = t.errors?.required ?? 'Required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onStartCall(form);
  }

  function handleSkip() {
    onStartCall(form);
  }

  const goalPlaceholder = GOAL_PLACEHOLDERS[form.callType ?? ''] ?? GOAL_PLACEHOLDERS.default;

  return (
    <div className="precall">
      <div className="precall__card">
        <div className="precall__header">
          <button className="precall__back" onClick={onBack}>← BACK</button>
          <div className="precall__logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>
        </div>

        {prevTip && !tipDismissed && (
          <div className="precall__tip-banner">
            <div className="precall__tip-banner-inner">
              <span className="precall__tip-banner-label">TIP FROM LAST CALL</span>
              <span className="precall__tip-banner-text">{prevTip}</span>
            </div>
            <button className="precall__tip-dismiss" onClick={() => setTipDismissed(true)} aria-label="Dismiss">✕</button>
          </div>
        )}

        <h2 className="precall__title">{t.precall.title}</h2>
        <p className="precall__desc">Give the AI context before your call. The more specific you are, the sharper the coaching.</p>

        <div className="precall__form">

          {/* ── Who are you calling? ── */}
          <div className="precall__section-label">Who are you calling?</div>

          <div className="precall__row">
            <div className={`precall__field ${errors.prospectName ? 'precall__field--error' : ''}`}>
              <label className="precall__label">{t.precall.prospectName} <span className="precall__required">*</span></label>
              <input
                className="precall__input"
                placeholder={t.precall.prospectNamePlaceholder}
                value={form.prospectName}
                onChange={e => handleChange('prospectName', e.target.value)}
                autoFocus
              />
              {errors.prospectName && <span className="precall__error">{errors.prospectName}</span>}
            </div>

            <div className="precall__field">
              <label className="precall__label">Their Title / Role</label>
              <input
                className="precall__input"
                placeholder="e.g. VP of Sales, CFO, Head of Marketing"
                value={form.prospectTitle ?? ''}
                onChange={e => handleChange('prospectTitle', e.target.value)}
              />
            </div>
          </div>

          <div className="precall__field">
            <label className="precall__label">{t.precall.company}</label>
            <input
              className="precall__input"
              placeholder={t.precall.companyPlaceholder}
              value={form.company}
              onChange={e => handleChange('company', e.target.value)}
            />
          </div>

          {/* ── About this call ── */}
          <div className="precall__section-label">About this call</div>

          <div className="precall__field">
            <label className="precall__label">Call Type</label>
            <div className="precall__chips">
              {CALL_TYPES.map(ct => (
                <button
                  key={ct.value}
                  type="button"
                  className={`precall__chip${form.callType === ct.value ? ' precall__chip--active' : ''}`}
                  onClick={() => handleCallType(ct.value)}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`precall__field ${errors.callGoal ? 'precall__field--error' : ''}`}>
            <label className="precall__label">{t.precall.callGoal} <span className="precall__required">*</span></label>
            <input
              className="precall__input"
              placeholder={goalPlaceholder}
              value={form.callGoal}
              onChange={e => handleChange('callGoal', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.callGoal && <span className="precall__error">{errors.callGoal}</span>}
          </div>

          {/* ── Context (optional) ── */}
          <div className="precall__section-label">
            Context
            <span className="precall__section-optional">optional but powerful</span>
          </div>

          <div className="precall__field">
            <label className="precall__label">What do you know about them?</label>
            <textarea
              className="precall__textarea"
              placeholder="Pain points, research from LinkedIn, what they mentioned last time, objections you're expecting, trigger events (funding round, new hire, etc.)…"
              value={form.priorContext ?? ''}
              onChange={e => handleChange('priorContext', e.target.value)}
              rows={3}
            />
          </div>

          {/* ── Your pitch ── */}
          <div className="precall__section-label">Your pitch</div>

          <div className="precall__field">
            <div className="precall__label-row">
              <label className="precall__label">{t.precall.yourPitch}</label>
              <button
                type="button"
                className={`precall__enhance-btn ${enhanced ? 'precall__enhance-btn--done' : ''}`}
                onClick={handleEnhancePitch}
                disabled={!form.yourPitch.trim() || enhancing}
                title="Let AI expand and structure your pitch for better coaching"
              >
                {enhancing ? (
                  <span className="precall__enhance-spinner" />
                ) : enhanced ? (
                  '✓ Enhanced'
                ) : (
                  '◈ Enhance'
                )}
              </button>
            </div>
            <textarea
              className="precall__textarea"
              placeholder={t.precall.yourPitchPlaceholder}
              value={form.yourPitch}
              onChange={e => handleChange('yourPitch', e.target.value)}
              rows={3}
            />
          </div>

          {/* ── Language ── */}
          <div className="precall__field">
            <label className="precall__label">{t.precall.language}</label>
            <div className="precall__lang-grid">
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={`precall__lang-btn ${form.language === l.code ? 'precall__lang-btn--active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, language: l.code }))}
                >
                  <img className="precall__lang-flag" src={`https://flagcdn.com/w20/${l.code.split('-')[1].toLowerCase()}.png`} alt={l.label} onError={e => { e.currentTarget.style.display = 'none'; }} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Battle Card ── */}
          <div className="precall__battlecard-wrap">
            <button
              type="button"
              className="precall__battlecard-trigger"
              onClick={battleCard ? () => setCardExpanded(e => !e) : handleGenerateBattleCard}
              disabled={generatingCard}
            >
              <span className="precall__battlecard-trigger-icon">
                {generatingCard ? <span className="precall__enhance-spinner" /> : '⚡'}
              </span>
              {generatingCard
                ? 'Generating battle card…'
                : battleCard
                ? `${cardExpanded ? '▾' : '▸'} Battle Card`
                : 'Generate Battle Card'}
              {!battleCard && !generatingCard && (
                <span className="precall__battlecard-hint">Likely objections · Power questions · Suggested opener</span>
              )}
            </button>

            {battleCard && cardExpanded && (
              <div className="precall__battlecard">

                <div className="precall__bc-section">
                  <div className="precall__bc-label">◈ CONTEXT INSIGHT</div>
                  <p className="precall__bc-insight">{battleCard.contextInsight}</p>
                </div>

                <div className="precall__bc-section">
                  <div className="precall__bc-label">▶ SUGGESTED OPENER</div>
                  <p className="precall__bc-opener">{battleCard.suggestedOpener}</p>
                </div>

                <div className="precall__bc-section">
                  <div className="precall__bc-label">? POWER QUESTIONS</div>
                  <ul className="precall__bc-list">
                    {battleCard.powerQuestions.map((q, i) => (
                      <li key={i} className="precall__bc-list-item">{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="precall__bc-section">
                  <div className="precall__bc-label">⚠ LIKELY OBJECTIONS</div>
                  {battleCard.likelyObjections.map((o, i) => (
                    <div key={i} className="precall__bc-objection">
                      <div className="precall__bc-obj-label">"{o.objection}"</div>
                      <div className="precall__bc-obj-response">{o.response}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="precall__bc-regen"
                  onClick={handleGenerateBattleCard}
                  disabled={generatingCard}
                >
                  ↺ Regenerate
                </button>
              </div>
            )}
          </div>

          <div className="precall__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              className="precall__start"
            >
              ▶ {t.precall.startCall}
            </Button>
            <button type="button" className="precall__skip" onClick={handleSkip}>
              {t.common.skip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
