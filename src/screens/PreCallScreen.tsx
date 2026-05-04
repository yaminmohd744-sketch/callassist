import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { loadLeads } from '../lib/leads';
import type { CallConfig, CallType, Lead } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import './PreCallScreen.css';

type StringConfigField = 'callGoal' | 'callType' | 'language' | 'prospectName';
type StringConfigErrors = Partial<Record<StringConfigField, string>>;

interface PreCallScreenProps {
  onStartCall: (config: CallConfig) => void;
  onBack: () => void;
  defaultLanguage?: LanguageCode;
  defaultCompany?: string;
  defaultPitch?: string;
  defaultConfig?: Partial<CallConfig & { prospectTitle?: string }>;
  userId?: string;
}

const CALL_TYPES: { value: CallType; label: string }[] = [
  { value: 'cold',        label: 'Cold call'      },
  { value: 'warm',        label: 'Warm follow-up' },
  { value: 'referral',    label: 'Referral'        },
  { value: 'discovery',   label: 'Discovery'       },
  { value: 'demo',        label: 'Demo'            },
  { value: 'negotiation', label: 'Negotiation'     },
  { value: 'close',       label: 'Closing call'    },
];

export function PreCallScreen({
  onStartCall,
  onBack,
  defaultLanguage = 'en-US',
  defaultConfig,
  userId,
}: PreCallScreenProps) {
  const t = useTranslations();

  const [callType, setCallType] = useState<CallType | undefined>(defaultConfig?.callType);
  const [inCrm, setInCrm]       = useState<boolean | null>(null);
  const [leads, setLeads]        = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(
    defaultConfig?.prospectName
      ? ({ name: defaultConfig.prospectName, company: defaultConfig.company, title: defaultConfig.prospectTitle, priorContext: defaultConfig.priorContext } as Lead)
      : null,
  );
  const [leadSearch, setLeadSearch] = useState('');
  const [callGoal, setCallGoal]     = useState(defaultConfig?.callGoal ?? '');
  const [perks, setPerks]           = useState<string[]>(['']);
  const [language, setLanguage]     = useState<string>(defaultLanguage);
  const [errors, setErrors]         = useState<StringConfigErrors>({});
  const loadedRef = useRef(false);

  // Load CRM leads when user taps Yes
  useEffect(() => {
    if (inCrm !== true || loadedRef.current) return;
    loadedRef.current = true;
    if (!userId) return;
    setLeadsLoading(true);
    loadLeads(userId)
      .then(setLeads)
      .catch(() => {})
      .finally(() => setLeadsLoading(false));
  }, [inCrm, userId]);

  function handleCallType(value: CallType) {
    setCallType(prev => prev === value ? undefined : value);
  }

  function handlePerkChange(index: number, value: string) {
    setPerks(prev => {
      const next = [...prev];
      next[index] = value;
      if (index === prev.length - 1 && value.trim()) next.push('');
      return next;
    });
  }

  function handlePerkKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setPerks(prev => {
        const next = [...prev];
        if (index === prev.length - 1 && prev[index].trim()) next.push('');
        return next;
      });
      // Focus next input
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>('.precall__perk-input');
        inputs[index + 1]?.focus();
      }, 0);
    }
    if (e.key === 'Backspace' && perks[index] === '' && perks.length > 1) {
      e.preventDefault();
      setPerks(prev => prev.filter((_, i) => i !== index));
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>('.precall__perk-input');
        inputs[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  }

  function handleRemovePerk(index: number) {
    setPerks(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [''] : next;
    });
  }

  function handleInCrm(value: boolean) {
    setInCrm(value);
    if (!value) setSelectedLead(null);
  }

  function handleSelectLead(lead: Lead) {
    setSelectedLead(lead);
    if (errors.prospectName) setErrors(e => ({ ...e, prospectName: '' }));
  }

  function handleSubmit() {
    const newErrors: StringConfigErrors = {};
    if (!callGoal.trim()) newErrors.callGoal = 'Required';
    if (inCrm === true && !selectedLead) newErrors.prospectName = 'Please select a lead from your CRM';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const filledPerks = perks.filter(p => p.trim());
    const yourPitch = filledPerks.join('\n');

    onStartCall({
      prospectName:  selectedLead?.name ?? '',
      company:       selectedLead?.company ?? '',
      prospectTitle: selectedLead?.title ?? '',
      priorContext:  selectedLead?.priorContext ?? '',
      callType,
      callGoal,
      yourPitch,
      language,
    });
  }

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.company ?? '').toLowerCase().includes(leadSearch.toLowerCase()),
  );

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
  const goalPlaceholder = GOAL_PLACEHOLDERS[callType ?? ''] ?? GOAL_PLACEHOLDERS.default;

  return (
    <div className="precall">
      <div className="precall__card">

        <div className="precall__header">
          <button className="precall__back" onClick={onBack}>← BACK</button>
          <div className="precall__logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>
        </div>

        <h2 className="precall__title">Pre-Call Setup</h2>
        <p className="precall__desc">Give the AI context before your call. The more specific you are, the sharper the coaching.</p>

        <div className="precall__form">

          {/* ── 1. Call Type ── */}
          <div className="precall__section-label">What type of call is this?</div>
          <div className="precall__chips">
            {CALL_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                className={`precall__chip${callType === ct.value ? ' precall__chip--active' : ''}`}
                onClick={() => handleCallType(ct.value)}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* ── 2. Is the lead in CRM? ── */}
          <div className="precall__section-label">Is this lead in your CRM?</div>
          <div className="precall__crm-toggle">
            <button
              type="button"
              className={`precall__crm-btn${inCrm === true ? ' precall__crm-btn--active' : ''}`}
              onClick={() => handleInCrm(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`precall__crm-btn${inCrm === false ? ' precall__crm-btn--active' : ''}`}
              onClick={() => handleInCrm(false)}
            >
              No
            </button>
          </div>

          {/* ── CRM lead picker ── */}
          {inCrm === true && (
            <div className={`precall__crm-picker${errors.prospectName ? ' precall__crm-picker--error' : ''}`}>
              {selectedLead ? (
                <div className="precall__crm-selected">
                  <div className="precall__crm-selected-info">
                    <span className="precall__crm-selected-name">{selectedLead.name}</span>
                    {selectedLead.company && (
                      <span className="precall__crm-selected-company">{selectedLead.company}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="precall__crm-clear"
                    onClick={() => setSelectedLead(null)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    className="precall__input precall__crm-search"
                    placeholder="Search by name or company…"
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="precall__crm-list">
                    {leadsLoading ? (
                      <div className="precall__crm-empty">Loading…</div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="precall__crm-empty">No leads found</div>
                    ) : filteredLeads.map(lead => (
                      <button
                        key={lead.id}
                        type="button"
                        className="precall__crm-lead"
                        onClick={() => handleSelectLead(lead)}
                      >
                        <span className="precall__crm-lead-name">{lead.name}</span>
                        {lead.company && (
                          <span className="precall__crm-lead-company">{lead.company}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {errors.prospectName && <span className="precall__error">{errors.prospectName}</span>}
            </div>
          )}

          {/* ── 3. Call Goal ── */}
          <div className="precall__section-label">Call Goal <span className="precall__required">*</span></div>
          <div className={`precall__field ${errors.callGoal ? 'precall__field--error' : ''}`}>
            <input
              className="precall__input"
              placeholder={goalPlaceholder}
              value={callGoal}
              onChange={e => { setCallGoal(e.target.value); if (errors.callGoal) setErrors(e2 => ({ ...e2, callGoal: '' })); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.callGoal && <span className="precall__error">{errors.callGoal}</span>}
          </div>

          {/* ── 4. Your Perks ── */}
          <div className="precall__section-label">Your Perks</div>
          <p className="precall__perks-desc">List everything great about your service — features, guarantees, pricing, differentiators. The AI will use this during the call.</p>
          <div className="precall__perks-list">
            {perks.map((perk, i) => (
              <div key={i} className="precall__perk-row">
                <span className="precall__perk-bullet">◆</span>
                <input
                  className="precall__input precall__perk-input"
                  placeholder={i === 0 ? 'e.g. 14-day free trial, no credit card required' : 'Add another perk…'}
                  value={perk}
                  onChange={e => handlePerkChange(i, e.target.value)}
                  onKeyDown={e => handlePerkKeyDown(i, e)}
                />
                {perks.length > 1 && perk.trim() && (
                  <button
                    type="button"
                    className="precall__perk-remove"
                    onClick={() => handleRemovePerk(i)}
                    aria-label="Remove"
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          {/* ── 5. Language ── */}
          <div className="precall__section-label">{t.precall.language}</div>
          <div className="precall__lang-grid">
            {SUPPORTED_LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                className={`precall__lang-btn ${language === l.code ? 'precall__lang-btn--active' : ''}`}
                onClick={() => setLanguage(l.code)}
              >
                <img
                  className="precall__lang-flag"
                  src={`https://flagcdn.com/w20/${l.code.split('-')[1].toLowerCase()}.png`}
                  alt={l.label}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="precall__actions">
            <Button variant="primary" size="lg" onClick={handleSubmit} className="precall__start">
              ▶ {t.precall.startCall}
            </Button>
            <button type="button" className="precall__skip" onClick={handleSubmit}>
              {t.common.skip}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
