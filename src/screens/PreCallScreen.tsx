import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../components/ui/Button';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { loadLeads } from '../lib/leads';
import { genId } from '../lib/id';
import type { CallConfig, CallType, Lead } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import './PreCallScreen.css';

type StringConfigField = 'callGoal' | 'callType' | 'language' | 'prospectName';
type StringConfigErrors = Partial<Record<StringConfigField, string>>;

interface PreCallScreenProps {
  onStartCall: (config: CallConfig) => void;
  onBack: () => void;
  defaultLanguage?: LanguageCode;
  defaultConfig?: Partial<CallConfig & { prospectTitle?: string }>;
  userId?: string;
}

interface Perk {
  id: string;
  text: string;
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

// Defined outside component — stable, depends on no props/state
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
  const [perks, setPerks]           = useState<Perk[]>([{ id: genId(), text: '' }]);
  const [language, setLanguage]     = useState<string>(defaultLanguage);
  const [errors, setErrors]         = useState<StringConfigErrors>({});
  const loadedRef      = useRef(false);
  const perkInputRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const crmSearchRef   = useRef<HTMLInputElement>(null);

  // Load CRM leads when user taps Yes — guard prevents duplicate fetches
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

  // Focus CRM search when the picker opens (avoids disorienting autoFocus)
  useEffect(() => {
    if (inCrm === true && !selectedLead) {
      crmSearchRef.current?.focus();
    }
  }, [inCrm, selectedLead]);

  const handleCallType = useCallback((value: CallType) => {
    setCallType(prev => prev === value ? undefined : value);
  }, []);

  const handlePerkChange = useCallback((index: number, value: string) => {
    setPerks(prev => {
      const next = prev.map((p, i) => i === index ? { ...p, text: value } : p);
      if (index === prev.length - 1 && value.trim()) next.push({ id: genId(), text: '' });
      return next;
    });
  }, []);

  const handlePerkKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // flushSync ensures the new perk row is in the DOM before we try to focus it
      flushSync(() => {
        setPerks(prev => {
          if (index === prev.length - 1 && prev[index].text.trim()) {
            return [...prev, { id: genId(), text: '' }];
          }
          return prev;
        });
      });
      perkInputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'Backspace' && perks[index].text === '' && perks.length > 1) {
      e.preventDefault();
      const targetIdx = Math.max(0, index - 1);
      flushSync(() => {
        setPerks(prev => {
          const next = prev.filter((_, i) => i !== index);
          return next.length === 0 ? [{ id: genId(), text: '' }] : next;
        });
      });
      // After flushSync, React has re-committed refs; splice the stale slot
      perkInputRefs.current.splice(index, 1);
      perkInputRefs.current[targetIdx]?.focus();
    }
  }, [perks]);

  const handleRemovePerk = useCallback((index: number) => {
    setPerks(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ id: genId(), text: '' }] : next;
    });
    // Trim the stale ref slot so the array stays in sync with the perks array
    perkInputRefs.current.splice(index, 1);
  }, []);

  const handleInCrm = useCallback((value: boolean) => {
    setInCrm(value);
    if (!value) {
      setSelectedLead(null);
      loadedRef.current = false;
    }
  }, []);

  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setErrors(e => { const next = { ...e }; delete next.prospectName; return next; });
  }, []);

  const buildConfig = useCallback((): CallConfig => {
    const filledPerks = perks.filter(p => p.text.trim()).map(p => p.text);
    return {
      prospectName:  selectedLead?.name ?? '',
      company:       selectedLead?.company ?? '',
      prospectTitle: selectedLead?.title ?? '',
      priorContext:  selectedLead?.priorContext ?? '',
      callType,
      callGoal,
      yourPitch:     filledPerks.join('\n'),
      language,
    };
  }, [perks, selectedLead, callType, callGoal, language]);

  const handleSubmit = useCallback(() => {
    const newErrors: StringConfigErrors = {};
    if (!callGoal.trim()) newErrors.callGoal = t.errors?.required ?? 'Required';
    if (inCrm === true && !selectedLead) newErrors.prospectName = t.precall.crmRequired;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onStartCall(buildConfig());
  }, [callGoal, inCrm, selectedLead, t, onStartCall, buildConfig]);

  // Bypasses validation — starts the call with whatever has been filled in so far
  const handleSkip = useCallback(() => {
    onStartCall(buildConfig());
  }, [onStartCall, buildConfig]);

  const filteredLeads = useMemo(() =>
    leads.filter(l =>
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.company ?? '').toLowerCase().includes(leadSearch.toLowerCase()),
    ),
  [leads, leadSearch]);

  const goalPlaceholder = GOAL_PLACEHOLDERS[callType ?? ''] ?? GOAL_PLACEHOLDERS.default;

  return (
    <div className="precall">
      <div className="precall__card">

        <div className="precall__header">
          <button className="precall__back" onClick={onBack}>← {t.common.back}</button>
          <div className="precall__logo">Pitchbase</div>
        </div>

        <h2 className="precall__title">{t.precall.title}</h2>
        <p className="precall__desc">{t.precall.desc}</p>

        <div className="precall__form">

          {/* ── 1. Call Type ── */}
          <div id="precall-calltype-label" className="precall__section-label">{t.precall.callTypeQuestion}</div>
          <div className="precall__chips" role="group" aria-labelledby="precall-calltype-label">
            {CALL_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                aria-pressed={callType === ct.value}
                className={`precall__chip${callType === ct.value ? ' precall__chip--active' : ''}`}
                onClick={() => handleCallType(ct.value)}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* ── 2. Is the lead in CRM? ── */}
          <div id="precall-crm-label" className="precall__section-label">{t.precall.inCrmQuestion}</div>
          <div className="precall__crm-toggle" role="group" aria-labelledby="precall-crm-label">
            <button
              type="button"
              aria-pressed={inCrm === true}
              className={`precall__crm-btn${inCrm === true ? ' precall__crm-btn--active' : ''}`}
              onClick={() => handleInCrm(true)}
            >
              {t.common.yes}
            </button>
            <button
              type="button"
              aria-pressed={inCrm === false}
              className={`precall__crm-btn${inCrm === false ? ' precall__crm-btn--active' : ''}`}
              onClick={() => handleInCrm(false)}
            >
              {t.common.no}
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
                    {t.common.change}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={crmSearchRef}
                    id="precall-crm-search"
                    className="precall__input precall__crm-search"
                    placeholder="Search by name or company…"
                    aria-label="Search by name or company"
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                  />
                  <div className="precall__crm-list">
                    {leadsLoading ? (
                      <div className="precall__crm-empty">{t.common.loading}</div>
                    ) : !userId ? (
                      <div className="precall__crm-empty">{t.precall.crmSignInRequired}</div>
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
              {errors.prospectName && (
                <span id="precall-crm-error" className="precall__error" role="alert">
                  {errors.prospectName}
                </span>
              )}
            </div>
          )}

          {/* ── 3. Call Goal ── */}
          <label htmlFor="precall-call-goal" className="precall__section-label">
            {t.precall.callGoal} <span className="precall__required" aria-hidden="true">*</span>
          </label>
          <div className={`precall__field ${errors.callGoal ? 'precall__field--error' : ''}`}>
            <input
              id="precall-call-goal"
              className="precall__input"
              placeholder={goalPlaceholder}
              value={callGoal}
              maxLength={300}
              aria-required="true"
              aria-invalid={!!errors.callGoal}
              aria-describedby={errors.callGoal ? 'precall-call-goal-error' : undefined}
              onChange={e => {
                setCallGoal(e.target.value);
                if (errors.callGoal) setErrors(prev => { const next = { ...prev }; delete next.callGoal; return next; });
              }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.callGoal && (
              <span id="precall-call-goal-error" className="precall__error" role="alert">
                {errors.callGoal}
              </span>
            )}
          </div>

          {/* ── 4. Your Perks ── */}
          <div id="precall-perks-label" className="precall__section-label">{t.precall.yourPerksLabel}</div>
          <p className="precall__perks-desc">{t.precall.yourPerksDesc}</p>
          <div className="precall__perks-list" role="group" aria-labelledby="precall-perks-label">
            {perks.map((perk, i) => (
              <div key={perk.id} className="precall__perk-row">
                <span className="precall__perk-bullet" aria-hidden="true">◆</span>
                <input
                  ref={el => { perkInputRefs.current[i] = el; }}
                  id={`precall-perk-${perk.id}`}
                  className="precall__input precall__perk-input"
                  placeholder={i === 0 ? 'e.g. 14-day free trial, no credit card required' : 'Add another perk…'}
                  aria-label={i === 0 ? 'First perk or differentiator' : `Perk ${i + 1}`}
                  value={perk.text}
                  onChange={e => handlePerkChange(i, e.target.value)}
                  onKeyDown={e => handlePerkKeyDown(i, e)}
                />
                {perks.length > 1 && perk.text.trim() && (
                  <button
                    type="button"
                    className="precall__perk-remove"
                    onClick={() => handleRemovePerk(i)}
                    aria-label={`Remove perk: ${perk.text}`}
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          {/* ── 5. Language ── */}
          <div id="precall-lang-label" className="precall__section-label">{t.precall.language}</div>
          <div className="precall__lang-grid" role="group" aria-labelledby="precall-lang-label">
            {SUPPORTED_LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                aria-pressed={language === l.code}
                className={`precall__lang-btn ${language === l.code ? 'precall__lang-btn--active' : ''}`}
                onClick={() => setLanguage(l.code)}
              >
                <img
                  className="precall__lang-flag"
                  src={`https://flagcdn.com/w20/${l.code.split('-').at(-1)!.toLowerCase()}.png`}
                  alt=""
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
            <button type="button" className="precall__skip" onClick={handleSkip}>
              {t.common.skip}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
