import { useState } from 'react';
import { Button } from '../components/ui/Button';
import type { CallConfig } from '../types';
import './PreCallScreen.css';

interface PreCallScreenProps {
  onStartCall: (config: CallConfig) => void;
  onBack: () => void;
}

export function PreCallScreen({ onStartCall, onBack }: PreCallScreenProps) {
  const [form, setForm] = useState<CallConfig>({
    prospectName: '',
    company: '',
    yourPitch: '',
    callGoal: '',
  });
  const [errors, setErrors] = useState<Partial<CallConfig>>({});

  function handleChange(field: keyof CallConfig, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
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
          <div className="precall__logo">◎ CALL<span>ASSIST</span></div>
        </div>

        <h2 className="precall__title">Pre-Call Setup</h2>
        <p className="precall__desc">Give the AI context before your call starts. The more detail, the better the coaching.</p>

        <div className="precall__form">
          <div className="precall__row">
            <div className={`precall__field ${errors.prospectName ? 'precall__field--error' : ''}`}>
              <label className="precall__label">PROSPECT NAME <span className="precall__required">*</span></label>
              <input
                className="precall__input"
                placeholder="e.g. Sarah Johnson"
                value={form.prospectName}
                onChange={e => handleChange('prospectName', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              {errors.prospectName && <span className="precall__error">{errors.prospectName}</span>}
            </div>

            <div className="precall__field">
              <label className="precall__label">COMPANY</label>
              <input
                className="precall__input"
                placeholder="e.g. Acme Corp"
                value={form.company}
                onChange={e => handleChange('company', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className={`precall__field ${errors.callGoal ? 'precall__field--error' : ''}`}>
            <label className="precall__label">CALL GOAL <span className="precall__required">*</span></label>
            <input
              className="precall__input"
              placeholder="e.g. Book a 30-min demo call"
              value={form.callGoal}
              onChange={e => handleChange('callGoal', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.callGoal && <span className="precall__error">{errors.callGoal}</span>}
          </div>

          <div className="precall__field">
            <label className="precall__label">YOUR PITCH / PRODUCT</label>
            <textarea
              className="precall__textarea"
              placeholder="e.g. We're a sales automation platform that helps SDRs book 3x more meetings through AI-powered outreach..."
              value={form.yourPitch}
              onChange={e => handleChange('yourPitch', e.target.value)}
              rows={4}
            />
          </div>

          <div className="precall__hints">
            <div className="precall__hint">
              <span className="precall__hint-icon">◎</span>
              The AI uses your pitch and goal to generate personalized objection responses
            </div>
            <div className="precall__hint">
              <span className="precall__hint-icon">◎</span>
              Voice recognition works best in Chrome — or use manual text input
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            className="precall__start"
          >
            ▶ START CALL
          </Button>
        </div>
      </div>
    </div>
  );
}
