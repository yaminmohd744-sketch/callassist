import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../components/ui/Button';
import { SUPPORTED_LANGUAGES } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { loadLeads } from '../lib/leads';
import { genId } from '../lib/id';
import type { CallConfig, CallPlatform, Lead, BusinessProfile, RepLearningProfile } from '../types';
import { buildEnrichedContext } from '../lib/businessProfile';
import { generateBattleCard, type BattleCard } from '../lib/ai';
import { useTranslations } from '../hooks/useTranslations';
import './PreCallScreen.css';

type StringConfigField = 'callGoal' | 'language' | 'prospectName' | 'meetingUrl';
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

const PLATFORM_URL_PLACEHOLDER: Partial<Record<CallPlatform, string>> = {
  zoom:  'https://zoom.us/j/...',
  meet:  'https://meet.google.com/xxx-xxx-xxx',
  teams: 'https://teams.microsoft.com/l/meetup-join/...',
};

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

const GOAL_PLACEHOLDER = 'e.g. What do you want to walk away with from this call?';

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

  const [platform, setPlatform]   = useState<CallPlatform | undefined>(defaultConfig?.platform);
  const [meetingUrl, setMeetingUrl] = useState(defaultConfig?.meetingUrl ?? '');
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
  const [battleCard, setBattleCard] = useState<BattleCard | null>(null);
  const [battleCardOpen, setBattleCardOpen] = useState(false);
  const [battleCardLoading, setBattleCardLoading] = useState(false);
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
      platform,
      meetingUrl:    meetingUrl.trim() || undefined,
      callGoal,
      yourPitch:     filledPerks.join('\n'),
      language,
      repContext,
    };
  }, [perks, selectedLead, platform, meetingUrl, callGoal, language, businessProfile, learningProfile]);

  const handleSubmit = useCallback(() => {
    const newErrors: StringConfigErrors = {};
    if (!callGoal.trim()) newErrors.callGoal = t.errors?.required ?? 'Required';
    if (inCrm === true && !selectedLead) newErrors.prospectName = t.precall.crmRequired;
    if (platform && platform !== 'phone' && !meetingUrl.trim()) newErrors.meetingUrl = t.errors?.required ?? 'Required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onStartCall(buildConfig());
  }, [callGoal, inCrm, selectedLead, platform, meetingUrl, t, onStartCall, buildConfig]);

  // Bypasses validation — starts the call with whatever has been filled in so far
  const handleSkip = useCallback(() => {
    onStartCall(buildConfig());
  }, [onStartCall, buildConfig]);

  const handleToggleBattleCard = useCallback(async () => {
    if (battleCardOpen) { setBattleCardOpen(false); return; }
    setBattleCardOpen(true);
    if (battleCard) return; // already generated
    setBattleCardLoading(true);
    try {
      const filledPerks = perks.filter(p => p.text.trim()).map(p => p.text);
      const card = await generateBattleCard(
        selectedLead?.name ?? '',
        selectedLead?.title ?? '',
        selectedLead?.company ?? '',
        'discovery',
        callGoal,
        filledPerks.join('\n'),
        selectedLead?.priorContext ?? '',
      );
      setBattleCard(card);
    } catch {
      setBattleCardOpen(false);
    } finally {
      setBattleCardLoading(false);
    }
  }, [battleCardOpen, battleCard, perks, selectedLead, callGoal]);

  const filteredLeads = useMemo(() =>
    leads.filter(l =>
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.company ?? '').toLowerCase().includes(leadSearch.toLowerCase()),
    ),
  [leads, leadSearch]);

  const goalPlaceholder = GOAL_PLACEHOLDER;

  return (
    <div className="precall">
      <div className="precall__card">

        <div className="precall__header">
          <button className="precall__back" onClick={onBack}>← {t.common.back}</button>
          <div className="precall__logo">PITCHR</div>
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

          {/* ── 1. Platform ── */}
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

          {/* ── Meeting URL (always shown unless Phone is explicitly selected) ── */}
          {platform !== 'phone' && (
            <div className="precall__meeting-url-field">
              <label htmlFor="precall-meeting-url" className="precall__section-label">
                MEETING LINK{platform
                  ? <span className="precall__required" aria-hidden="true"> *</span>
                  : <span className="precall__optional"> (optional)</span>}
              </label>
              <div className={`precall__field${errors.meetingUrl ? ' precall__field--error' : ''}`}>
                <input
                  id="precall-meeting-url"
                  className="precall__input precall__meeting-url-input"
                  type="url"
                  placeholder={(platform ? PLATFORM_URL_PLACEHOLDER[platform] : undefined) ?? 'https://...'}
                  value={meetingUrl}
                  aria-required="true"
                  aria-invalid={!!errors.meetingUrl}
                  aria-describedby={errors.meetingUrl ? 'precall-meeting-url-error' : undefined}
                  onChange={e => {
                    setMeetingUrl(e.target.value);
                    if (errors.meetingUrl) setErrors(prev => { const next = { ...prev }; delete next.meetingUrl; return next; });
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.meetingUrl && (
                  <span id="precall-meeting-url-error" className="precall__error" role="alert">
                    {errors.meetingUrl}
                  </span>
                )}
              </div>
              <p className="precall__meeting-url-hint">
                Pitchr will open the meeting inside the app when the call starts
              </p>
            </div>
          )}

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

          {/* ── Pre-call intel / battle card ── */}
          {(callGoal.trim() || selectedLead) && (
            <div className="precall__battlecard">
              <button
                type="button"
                className={`precall__battlecard-trigger${battleCardOpen ? ' precall__battlecard-trigger--open' : ''}`}
                onClick={handleToggleBattleCard}
                aria-expanded={battleCardOpen}
              >
                <span className="precall__battlecard-trigger-icon" aria-hidden="true">◈</span>
                PRE-CALL INTEL
                <em className="precall__battlecard-trigger-chevron" aria-hidden="true">▾</em>
              </button>
              {battleCardOpen && (
                battleCardLoading ? (
                  <div className="precall__battlecard-loading">
                    <div className="precall__battlecard-spinner" aria-hidden="true" />
                    Preparing your battle card…
                  </div>
                ) : battleCard ? (
                  <div className="precall__battlecard-body">
                    {battleCard.suggestedOpener && (
                      <div>
                        <div className="precall__bc-section-label">Suggested opener</div>
                        <div className="precall__bc-opener">"{battleCard.suggestedOpener}"</div>
                      </div>
                    )}
                    {battleCard.contextInsight && (
                      <div>
                        <div className="precall__bc-section-label">Context insight</div>
                        <div className="precall__bc-insight">{battleCard.contextInsight}</div>
                      </div>
                    )}
                    {battleCard.powerQuestions.length > 0 && (
                      <div>
                        <div className="precall__bc-section-label">Power questions to ask</div>
                        <ul className="precall__bc-questions" role="list">
                          {battleCard.powerQuestions.map((q, i) => (
                            <li key={i} className="precall__bc-question">
                              <span className="precall__bc-question-num">{i + 1}.</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {battleCard.likelyObjections.length > 0 && (
                      <div>
                        <div className="precall__bc-section-label">Likely objections + responses</div>
                        <div className="precall__bc-objections">
                          {battleCard.likelyObjections.map((obj, i) => (
                            <div key={i} className="precall__bc-objection">
                              <div className="precall__bc-obj-q">⚡ {obj.objection}</div>
                              <div className="precall__bc-obj-a">{obj.response}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              )}
            </div>
          )}

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
