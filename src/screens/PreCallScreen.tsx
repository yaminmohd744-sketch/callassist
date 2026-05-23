import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../components/ui/Button';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { loadLeads } from '../lib/leads';
import { genId } from '../lib/id';
import type { CallConfig, CallType, CallPlatform, Lead, BusinessProfile, RepLearningProfile } from '../types';
import { buildEnrichedContext } from '../lib/businessProfile';
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
  businessProfile?: BusinessProfile | null;
  learningProfile?: RepLearningProfile | null;
}

interface Perk {
  id: string;
  text: string;
}

const PLATFORMS: { value: CallPlatform; label: string; icon: string }[] = [
  { value: 'phone', label: 'Phone call',   icon: '☎' },
  { value: 'zoom',  label: 'Zoom',         icon: '⬤' },
  { value: 'meet',  label: 'Google Meet',  icon: '▶' },
  { value: 'teams', label: 'Teams',        icon: '⊞' },
];

const PLATFORM_CONTEXT: Record<CallPlatform, string> = {
  phone: 'This is a regular phone call — no video, no screen share, no meeting link involved.',
  zoom:  'This call is on Zoom — screen sharing and video are available if needed.',
  meet:  'This call is on Google Meet — screen sharing and video are available if needed.',
  teams: 'This call is on Microsoft Teams — screen sharing and video are available if needed.',
};

const CALL_TYPES: { value: CallType; label: string }[] = [
  { value: 'cold',        label: 'Cold call'      },
  { value: 'warm',        label: 'Warm follow-up' },
  { value: 'referral',    label: 'Referral'        },
  { value: 'discovery',   label: 'Discovery'       },
  { value: 'demo',        label: 'Demo'            },
  { value: 'negotiation', label: 'Negotiation'     },
  { value: 'close',       label: 'Closing call'    },
];

const EXP_SHORT: Record<string, string> = {
  beginner:     '🌱 Newcomer',
  intermediate: '📈 Getting confident',
  experienced:  '🎯 Battle-tested',
  veteran:      '🏆 Veteran',
};

const DEAL_SHORT: Record<string, string> = {
  transactional: '⚡ Quick wins',
  'mid-market':  '📊 Mid-market',
  enterprise:    '🏛 Enterprise',
};

function getGoalSuggestions(callType: CallType, dealType?: string): string[] {
  const d = dealType ?? 'default';
  const map: Record<string, Record<string, string[]>> = {
    cold: {
      transactional: ['Book a 15-min demo for later today', 'Qualify them and close on the spot if fit'],
      'mid-market':  ['Book a 20-min discovery call this week', 'Get the right decision maker on the line'],
      enterprise:    ['Secure a discovery call with the key stakeholder', 'Identify pain, budget range, and timeline'],
      default:       ['Book a discovery call', 'Qualify budget, authority, and need'],
    },
    warm: {
      transactional: ['Get a decision on this call', 'Follow up and close if they reviewed it'],
      'mid-market':  ['Follow up on the proposal and confirm next steps', 'Handle remaining objections and set a timeline'],
      enterprise:    ['Align all stakeholders on next steps', 'Surface and handle the final objection'],
      default:       ['Follow up and confirm next steps', 'Identify any remaining blockers'],
    },
    referral: {
      default:    ['Introduce myself and book a demo', 'Build rapport and qualify fit'],
      enterprise: ['Understand their specific pain and map stakeholders', 'Get a meeting with the full buying team'],
    },
    discovery: {
      transactional: ['Uncover the core need and propose a solution today'],
      'mid-market':  ['Uncover budget, timeline, and key pain points', 'Identify decision criteria and who else is involved'],
      enterprise:    ['Map all stakeholders and understand the buying process', 'Understand budget range and decision timeline'],
      default:       ['Uncover budget, timeline, and key pain points', 'Identify who else is involved in the decision'],
    },
    demo: {
      transactional: ['Show the core feature and close today'],
      'mid-market':  ['Walk through the ROI story and handle their main concern'],
      enterprise:    ['Demonstrate value to each stakeholder role and handle security questions'],
      default:       ['Show the core value and address their top objection'],
    },
    negotiation: {
      transactional: ['Close on price and confirm the deal on this call'],
      'mid-market':  ['Agree on pricing and contract length', 'Handle the discount request and confirm a start date'],
      enterprise:    ['Align on pricing, SLAs, and timeline', 'Handle procurement and legal requirements'],
      default:       ['Agree on pricing and confirm the next step'],
    },
    close: {
      transactional: ['Get a yes and confirm payment on this call'],
      'mid-market':  ['Get a verbal yes and confirm the start date', 'Handle the final "I need to think about it"'],
      enterprise:    ['Get a verbal commitment and align on contract timeline'],
      default:       ['Get a verbal yes and confirm the start date'],
    },
  };
  return map[callType]?.[d] ?? map[callType]?.['default'] ?? [];
}

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
  businessProfile,
  learningProfile,
}: PreCallScreenProps) {
  const t = useTranslations();

  const [callType, setCallType]   = useState<CallType | undefined>(defaultConfig?.callType);
  const [platform, setPlatform]   = useState<CallPlatform | undefined>(defaultConfig?.platform);
  const [inCrm, setInCrm]         = useState<boolean | null>(null);
  const [leads, setLeads]        = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(
    defaultConfig?.prospectName
      ? ({ name: defaultConfig.prospectName, company: defaultConfig.company, title: defaultConfig.prospectTitle, priorContext: defaultConfig.priorContext } as Lead)
      : null,
  );
  const [leadSearch, setLeadSearch] = useState('');
  const [callGoal, setCallGoal]     = useState(defaultConfig?.callGoal ?? '');
  const [perks, setPerks]           = useState<Perk[]>(() => {
    if (defaultConfig?.yourPitch) {
      return defaultConfig.yourPitch.split('\n').filter(Boolean).map(text => ({ id: genId(), text })).concat([{ id: genId(), text: '' }]);
    }
    if (businessProfile?.differentiators?.length) {
      return businessProfile.differentiators.map(text => ({ id: genId(), text })).concat([{ id: genId(), text: '' }]);
    }
    return [{ id: genId(), text: '' }];
  });
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
    const base = buildEnrichedContext(businessProfile ?? null, learningProfile ?? null);
    const platformNote = platform ? PLATFORM_CONTEXT[platform] : '';
    const repContext = [base, platformNote].filter(Boolean).join('\n') || undefined;
    return {
      prospectName:  selectedLead?.name ?? '',
      company:       selectedLead?.company ?? '',
      prospectTitle: selectedLead?.title ?? '',
      priorContext:  selectedLead?.priorContext ?? '',
      callType,
      platform,
      callGoal,
      yourPitch:     filledPerks.join('\n'),
      language,
      repContext,
    };
  }, [perks, selectedLead, callType, platform, callGoal, language, businessProfile, learningProfile]);

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
          <div className="precall__logo">Pitchr</div>
        </div>

        <h2 className="precall__title">{t.precall.title}</h2>
        <p className="precall__desc">{t.precall.desc}</p>

        <div className="precall__form">

          {/* ── Coaching context strip ── */}
          {businessProfile && (
            businessProfile.experienceLevel ||
            businessProfile.dealType ||
            (businessProfile.topChallenges?.length ?? 0) > 0 ||
            (businessProfile.commonObjections?.length ?? 0) > 0
          ) && (
            <div className="precall__context-strip">
              <span className="precall__context-title" aria-hidden="true">◎ COACHING PROFILE</span>
              <div className="precall__context-pills">
                {businessProfile.experienceLevel && (
                  <span className="precall__context-pill">{EXP_SHORT[businessProfile.experienceLevel]}</span>
                )}
                {businessProfile.dealType && (
                  <span className="precall__context-pill">{DEAL_SHORT[businessProfile.dealType]}</span>
                )}
                {businessProfile.topChallenges?.slice(0, 2).map(c => (
                  <span key={c} className="precall__context-pill precall__context-pill--focus">{c}</span>
                ))}
                {(businessProfile.commonObjections?.length ?? 0) > 0 && (
                  <span className="precall__context-pill precall__context-pill--objection">
                    ⚡ {businessProfile.commonObjections!.slice(0, 2).join(' · ')}
                  </span>
                )}
              </div>
            </div>
          )}

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

          {/* ── 2. Platform ── */}
          <div id="precall-platform-label" className="precall__section-label">WHERE IS THIS CALL HAPPENING?</div>
          <div className="precall__chips" role="group" aria-labelledby="precall-platform-label">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                type="button"
                aria-pressed={platform === p.value}
                className={`precall__chip precall__chip--platform${platform === p.value ? ' precall__chip--active' : ''}`}
                onClick={() => setPlatform(prev => prev === p.value ? undefined : p.value)}
              >
                <span className="precall__chip-icon" aria-hidden="true">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* ── 3. Is the lead in CRM? ── */}
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

          {/* ── 4. Call Goal ── */}
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

          {callType && callGoal.trim() === '' && getGoalSuggestions(callType, businessProfile?.dealType).length > 0 && (
            <div className="precall__goal-suggestions">
              <span className="precall__goal-suggestions-label">Quick fill</span>
              {getGoalSuggestions(callType, businessProfile?.dealType).map((s, i) => (
                <button key={i} type="button" className="precall__goal-suggestion" onClick={() => setCallGoal(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── 5. Your Perks ── */}
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

          {/* ── 6. Language ── */}
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
