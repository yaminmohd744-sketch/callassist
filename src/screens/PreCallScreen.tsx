import { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { enhancePitch } from '../lib/ai';
import type { CallConfig } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import './PreCallScreen.css';

interface PreCallScreenProps {
  onStartCall: (config: CallConfig) => void;
  onBack: () => void;
  defaultLanguage?: LanguageCode;
}

export function PreCallScreen({ onStartCall, onBack, defaultLanguage = 'en-US' }: PreCallScreenProps) {
  const [prevTip] = useState<string | null>(() => localStorage.getItem('callassist:nextCallTip'));
  const [tipDismissed, setTipDismissed] = useState(false);
  const [form, setForm] = useState<CallConfig>({
    prospectName: '',
    company: '',
    yourPitch: '',
    callGoal: '',
    language: defaultLanguage,
  });
  const t = useTranslations();
  const [errors, setErrors] = useState<Partial<CallConfig>>({});
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const enhancingRef = useRef(false);

  function handleChange(field: keyof CallConfig, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    if (field === 'yourPitch') setEnhanced(false);
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
    const newErrors: Partial<CallConfig> = {};
    if (!form.prospectName.trim()) newErrors.prospectName = 'Required';
    if (!form.callGoal.trim())     newErrors.callGoal = 'Required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onStartCall(form);
  }

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
        <p className="precall__desc">Give the AI context before your call starts. The more detail, the better the coaching.</p>

        <div className="precall__form">
          <div className="precall__row">
            <div className={`precall__field ${errors.prospectName ? 'precall__field--error' : ''}`}>
              <label className="precall__label">{t.precall.prospectName} <span className="precall__required">*</span></label>
              <input
                className="precall__input"
                placeholder={t.precall.prospectNamePlaceholder}
                value={form.prospectName}
                onChange={e => handleChange('prospectName', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              {errors.prospectName && <span className="precall__error">{errors.prospectName}</span>}
            </div>

            <div className="precall__field">
              <label className="precall__label">{t.precall.company}</label>
              <input
                className="precall__input"
                placeholder={t.precall.companyPlaceholder}
                value={form.company}
                onChange={e => handleChange('company', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className={`precall__field ${errors.callGoal ? 'precall__field--error' : ''}`}>
            <label className="precall__label">{t.precall.callGoal} <span className="precall__required">*</span></label>
            <input
              className="precall__input"
              placeholder={t.precall.callGoalPlaceholder}
              value={form.callGoal}
              onChange={e => handleChange('callGoal', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.callGoal && <span className="precall__error">{errors.callGoal}</span>}
          </div>

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
                  '◈ Generate'
                )}
              </button>
            </div>
            <textarea
              className="precall__textarea"
              placeholder={t.precall.yourPitchPlaceholder}
              value={form.yourPitch}
              onChange={e => handleChange('yourPitch', e.target.value)}
              rows={4}
            />
          </div>

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

          <div className="precall__hints">
            <div className="precall__hint">
              <span className="precall__hint-icon">◎</span>
              The AI uses your pitch and goal to generate personalized objection responses
            </div>
            <div className="precall__hint">
              <span className="precall__hint-icon">◎</span>
              Voice recognition works best in Chrome - or use manual text input
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            className="precall__start"
          >
            ▶ {t.precall.startCall}
          </Button>
        </div>
      </div>
    </div>
  );
}
