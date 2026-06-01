import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { AppContext } from './contexts/AppContext';
import * as Sentry from '@sentry/react';
import { AppShell }         from './components/layout/AppShell';
import { ErrorBoundary }    from './components/ErrorBoundary';
import { useAuth }          from './hooks/useAuth';
import { useAppLanguage }   from './hooks/useAppLanguage';
import { useToast }         from './lib/toast';
import type { LanguageCode } from './lib/languages';
import { supabase }         from './lib/supabase';
import { loadSessions, saveSession, deleteSession, updateOutcome } from './lib/sessions';
import { saveProfilePic, loadProfilePic, deleteProfilePic } from './lib/profilePic';
import { clearDeepgramTokenCache } from './hooks/useSpeechRecognition';
import { updateLeadAfterCall } from './lib/leads';
import { STORAGE_KEYS } from './lib/storageKeys';
import { loadBusinessProfile, saveBusinessProfile, onboardingToBusinessProfile } from './lib/businessProfile';
import { loadLearningProfile, updateLearningProfile } from './lib/learningProfile';
import { loadLearningLog, generateAndAppendLogEntries } from './lib/learningLog';
import type { CallConfig, CallSession, CallOutcome, Lead, BusinessProfile, RepLearningProfile, LearningLogEntry } from './types';

import { MarketingPlanScreen } from './screens/MarketingPlanScreen';
import { FOMOLandingScreen } from './screens/FOMOLandingScreen';
import { LandingScreen } from './screens/LandingScreen';
import { DemoTourScreen } from './screens/DemoTourScreen';
import { AppSlidesScreen } from './screens/AppSlidesScreen';
import { DashboardSlide } from './screens/DashboardSlide';
const DashboardScreen  = lazy(() => import('./screens/DashboardScreen').then(m => ({ default: m.DashboardScreen })));
const PreCallScreen    = lazy(() => import('./screens/PreCallScreen').then(m => ({ default: m.PreCallScreen })));
const LiveCallScreen   = lazy(() => import('./screens/LiveCallScreen').then(m => ({ default: m.LiveCallScreen })));
const PostCallScreen   = lazy(() => import('./screens/PostCallScreen').then(m => ({ default: m.PostCallScreen })));
const AnalyticsScreen  = lazy(() => import('./screens/AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
const UploadCallScreen = lazy(() => import('./screens/UploadCallScreen').then(m => ({ default: m.UploadCallScreen })));
const LeadsScreen      = lazy(() => import('./screens/LeadsScreen').then(m => ({ default: m.LeadsScreen })));
const AuthScreen       = lazy(() => import('./screens/AuthScreen').then(m => ({ default: m.AuthScreen })));
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })));

// One-time migration: move localStorage outcomes into Supabase call_sessions rows
async function migrateOutcomes(userId: string): Promise<void> {
  const raw = localStorage.getItem(STORAGE_KEYS.legacyOutcomes);
  if (!raw) return;
  let map: Record<string, CallOutcome>;
  try { map = JSON.parse(raw) as Record<string, CallOutcome>; } catch { return; }
  const entries = Object.entries(map).filter(([, v]) => v !== null);
  let allSucceeded = true;
  for (const [endedAt, outcome] of entries) {
    try { await updateOutcome(userId, endedAt, outcome); }
    catch { allSucceeded = false; }
  }
  if (allSucceeded) localStorage.removeItem(STORAGE_KEYS.legacyOutcomes);
}

interface OnboardingData {
  name?: string;
  language?: string;
  sellingFor?: string;
  industry?: string;
  companyName?: string;
  productDescription?: string;
  targetCustomer?: string;
  differentiators?: string[];
  commonObjections?: string[];
  experienceLevel?: string;
  dealType?: string;
  topChallenges?: string[];
}

function getOnboardingData(): OnboardingData {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.onboarding) || '{}') as Record<string, unknown>;
    return {
      name:               typeof raw.name               === 'string' ? raw.name               : undefined,
      language:           typeof raw.language           === 'string' ? raw.language           : undefined,
      sellingFor:         typeof raw.sellingFor         === 'string' ? raw.sellingFor         : undefined,
      industry:           typeof raw.industry           === 'string' ? raw.industry           : undefined,
      companyName:        typeof raw.companyName        === 'string' ? raw.companyName        : undefined,
      productDescription: typeof raw.productDescription === 'string' ? raw.productDescription : undefined,
      targetCustomer:     typeof raw.targetCustomer     === 'string' ? raw.targetCustomer     : undefined,
      differentiators:    Array.isArray(raw.differentiators) ? raw.differentiators as string[] : undefined,
      commonObjections:   Array.isArray(raw.commonObjections) ? raw.commonObjections as string[] : undefined,
      experienceLevel:    typeof raw.experienceLevel    === 'string' ? raw.experienceLevel    : undefined,
      dealType:           typeof raw.dealType           === 'string' ? raw.dealType           : undefined,
      topChallenges:      Array.isArray(raw.topChallenges) ? raw.topChallenges as string[] : undefined,
    };
  } catch {
    return {};
  }
}

// True when running inside the Electron desktop app
const isElectron = navigator.userAgent.includes('Electron');


const ALLOWED_IMAGE_REGEX = /^data:image\/(png|jpeg|webp|gif);base64,/;

function getDisplayName(
  user: { user_metadata?: Record<string, string>; email?: string | null } | null,
  onboardingName?: string,
): string {
  return (
    onboardingName ||
    user?.user_metadata?.['full_name']?.split(' ')[0] ||
    user?.user_metadata?.['name']?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    ''
  );
}

// Clear any stale theme preference from old installs
document.documentElement.removeAttribute('data-theme');
try { localStorage.removeItem('theme'); } catch { /* storage unavailable */ }

type Screen = 'landing' | 'preview' | 'auth' | 'dashboard' | 'analytics' | 'leads' | 'upload-call' | 'pre-call' | 'live-call' | 'post-call' | 'marketing-plan';

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {

  const { user, loading: authLoading } = useAuth();
  const { appLanguage, setAppLanguage, currentLang } = useAppLanguage();
  const toast = useToast();

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(() => loadBusinessProfile());
  const [learningProfile, setLearningProfile] = useState<RepLearningProfile | null>(() => loadLearningProfile());
  const [learningLog, setLearningLog] = useState<LearningLogEntry[]>(() => loadLearningLog());

  const [screen, setScreen]             = useState<Screen>(isElectron ? 'auth' : 'landing');
  const [callConfig, setCallConfig]     = useState<CallConfig | null>(null);
  const [callSession, setCallSession]   = useState<CallSession | null>(null);
  const [pastSessions, setPastSessions] = useState<CallSession[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingVersion, setOnboardingVersion] = useState(0);
  const transitionShown = useRef(false); // prevents double-firing onboarding check
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Load profile pic from IndexedDB on mount
  useEffect(() => {
    loadProfilePic()
      .then(pic => { if (pic) setProfilePic(pic); })
      .catch(() => { /* IndexedDB unavailable — no pic shown */ });
  }, []);

  const handleProfilePicChange = useCallback((dataUrl: string) => {
    if (!ALLOWED_IMAGE_REGEX.test(dataUrl)) {
      toast.error('Invalid image format — use PNG, JPEG, WebP or GIF');
      return;
    }
    if (dataUrl.length > 500_000) { toast.error('Image too large (max ~375 KB)'); return; }
    setProfilePic(dataUrl);
    saveProfilePic(dataUrl).catch(() => toast.error('Storage full — photo not saved'));
  }, [toast]);

  const totalCallSeconds = pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalCallCount = pastSessions.length;

  // In the browser (non-Electron), always stay on the landing page regardless of auth state.
  // The full app only runs inside Electron.
  const currentScreen: Screen = (!isElectron && screen === 'landing')
      ? 'landing'
      : (user && (screen === 'landing' || screen === 'auth'))
        ? 'dashboard'
        : screen;

  useEffect(() => {
    if (user) Sentry.setUser({ id: user.id, email: user.email ?? undefined });
    else Sentry.setUser(null);

    if (!authLoading && user && !transitionShown.current && isElectron) {
      transitionShown.current = true;
      const hasOnboarded = !!localStorage.getItem(STORAGE_KEYS.onboarding);
      if (!hasOnboarded) setShowOnboarding(true);
    }
  }, [user, authLoading]);

  const lastFetchedRef = useRef<number>(0);

  // Load sessions and run one-time outcome migration on login
  useEffect(() => {
    if (!user) { setPastSessions([]); return; }
    async function load() {
      // Migrate legacy localStorage outcomes to Supabase — guarded by a per-user flag
      // so it only runs once even if the user logs out and back in mid-migration.
      const MIGRATED_KEY = STORAGE_KEYS.migratedV1(user!.id);
      if (!localStorage.getItem(MIGRATED_KEY)) {
        await migrateOutcomes(user!.id);
        try { localStorage.setItem(MIGRATED_KEY, '1'); } catch { /* storage full — retries next login */ }
      }
      try {
        const sessions = await loadSessions(user!.id);
        setPastSessions(sessions);
        lastFetchedRef.current = Date.now();
      } catch {
        toast.error('Failed to load your call history. Check your connection and refresh.');
      }
    }
    load();
  }, [user]); // toast is a stable context reference

  // Re-fetch sessions when the tab regains focus (debounced to once per 60s)
  useEffect(() => {
    if (!user) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchedRef.current < 60_000) return;
      loadSessions(user.id)
        .then(sessions => { setPastSessions(sessions); lastFetchedRef.current = Date.now(); })
        .catch(() => { /* silent — user already has a copy */ });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user]);

  // Guard: in the web app (non-Electron) bounce any non-landing screen back to landing.
  useEffect(() => {
    if (!isElectron && screen !== 'landing' && screen !== 'preview' && screen !== 'auth' && screen !== 'marketing-plan') setScreen('landing');
  }, [screen]);

  // Guard: if we land on live-call or post-call without required state, go to dashboard.
  useEffect(() => {
    if (screen === 'live-call' && !callConfig) setScreen('dashboard');
    if (screen === 'post-call' && !callSession) setScreen('dashboard');
  }, [screen, callConfig, callSession]);

  const handleStartCall = useCallback((config: CallConfig) => {
    setCallConfig(config);
    setCallSession(null);
    setScreen('live-call');
  }, []);

  const handleEndCall = useCallback(async (session: CallSession) => {
    setCallSession(session);
    setScreen('post-call');
    if (user) {
      try {
        const saved = await saveSession(session, user.id);
        setPastSessions(prev => {
          const next = [saved, ...prev];
          try {
            const previous = loadLearningProfile();
            const updated = updateLearningProfile(next);
            if (updated) {
              setLearningProfile(updated);
              // Fire-and-forget: generate AI log entries for meaningful changes
              generateAndAppendLogEntries(updated, previous)
                .then(() => setLearningLog(loadLearningLog()))
                .catch(() => {});
            }
          } catch { /* non-critical */ }
          return next;
        });
      } catch {
        toast.error('Call ended but failed to save. Your data is safe locally.');
      }
      if (selectedLead) {
        updateLeadAfterCall(selectedLead.id, user.id, selectedLead.callCount)
          .catch(() => toast.error('Failed to sync lead call count. It will update next time.'));
        setSelectedLead(null);
      }
    }
  }, [user, selectedLead, toast]);

  const handleViewSession = useCallback((session: CallSession) => {
    setCallSession(session);
    setScreen('post-call');
  }, []);

  const handleDeleteSession = useCallback(async (id: string) => {
    // Optimistic update — roll back on failure.
    // Only match by the Supabase-assigned id (never endedAt) to avoid accidentally
    // removing the wrong session when two calls end in the same second.
    setPastSessions(prev => prev.filter(s => s.id !== id));
    if (user) {
      deleteSession(user.id, id).catch(() => {
        toast.error('Failed to delete session.');
        loadSessions(user.id)
          .then(sessions => setPastSessions(sessions))
          .catch(() => { /* already toasted above */ });
      });
    }
  }, [user, toast]);

  // Must be above all early returns — hooks cannot be called conditionally.
  const onboardingData = useMemo(() => getOnboardingData(), [onboardingVersion]);

  // ── Demo tour (no auth required) — access via ?demo=1 ────────────────────
  if (window.location.search.includes('demo=1')) return <DemoTourScreen />;

  // ── App slides / carousel assets — access via ?slides=1 ──────────────────
  if (window.location.search.includes('slides=1')) return <AppSlidesScreen />;

  // ── Dashboard interactive slide — access via ?db-slide=1 ─────────────────
  if (window.location.search.includes('db-slide=1')) return <DashboardSlide />;

  // ── Auth gate ──────────────────────────────────────────────────────────────
  // In the browser, never block on auth — just show the landing page immediately.
  if (authLoading && isElectron) return <div className="app-loading" />;

  // In the web app, always show the landing page (or marketing plan page).
  if (!isElectron && screen === 'marketing-plan') {
    return <MarketingPlanScreen onBack={() => setScreen('landing')} />;
  }

  if (!isElectron && screen === 'preview') {
    return (
      <>
        <ErrorBoundary>
          <LandingScreen
            onDownload={() => {
              const DESKTOP_PROTOCOL = 'pitchr://open' as const;
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.src = DESKTOP_PROTOCOL;
              document.body.appendChild(iframe);
              setTimeout(() => document.body.removeChild(iframe), 2000);
              setTimeout(() => setScreen('auth'), 1800);
            }}
            onMarketingPlan={() => setScreen('marketing-plan')}
          />
        </ErrorBoundary>
      </>
    );
  }

  if (!isElectron && screen === 'landing') {
    return (
      <ErrorBoundary>
        <FOMOLandingScreen onUnlock={() => setScreen('preview')} />
      </ErrorBoundary>
    );
  }

  if (!user) {
    return (
      <>
        <Suspense fallback={<div className="app-loading" />}>
          <AuthScreen onBack={isElectron ? () => {} : () => setScreen('landing')} />
        </Suspense>
      </>
    );
  }

  const isShell = currentScreen === 'dashboard' || currentScreen === 'analytics' || currentScreen === 'leads';

  const loginUserName = getDisplayName(user, onboardingData.name);

  if (showOnboarding) {
    return (
      <Suspense fallback={<div className="app-loading" />}>
        <OnboardingScreen onDone={data => {
          try {
            localStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(data));
            const profile = onboardingToBusinessProfile(data);
            saveBusinessProfile(profile);
            setBusinessProfile(profile);
          } catch { toast.error('Storage full — your preferences may not be saved.'); }
          setOnboardingVersion(v => v + 1);
          setAppLanguage(data.language as LanguageCode);
          setShowOnboarding(false);
        }} />
      </Suspense>
    );
  }

  const appContextValue = {
    appLanguage,
    onChangeLanguage: setAppLanguage,
    currentLangLabel: currentLang.label,
    userName: loginUserName,
    userEmail: user?.email ?? '',
    profilePic,
    onProfilePicChange: handleProfilePicChange,
    onProfilePicError: () => { setProfilePic(null); deleteProfilePic().catch(() => {}); },
    totalCallSeconds,
    totalCallCount,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {isShell && (
        <AppShell
          activeScreen={currentScreen}
          onNavigate={s => setScreen(s)}
          onStartCall={() => setScreen('pre-call')}
          onUploadCall={() => setScreen('upload-call')}
          onSignOut={() => { clearDeepgramTokenCache(); supabase.auth.signOut(); }}
        >
          {currentScreen === 'dashboard' && (
            <ErrorBoundary>
              <Suspense fallback={<div className="app-loading" />}>
                <DashboardScreen
                  pastSessions={pastSessions}
                  onStartCall={() => setScreen('pre-call')}
                  onUploadCall={() => setScreen('upload-call')}
                  onViewSession={handleViewSession}
                  onDeleteSession={handleDeleteSession}
                  userName={loginUserName}
                  learningLog={learningLog}
                />
              </Suspense>
            </ErrorBoundary>
          )}
          {currentScreen === 'analytics' && (
            <ErrorBoundary>
              <Suspense fallback={<div className="app-loading" />}>
                <AnalyticsScreen pastSessions={pastSessions} />
              </Suspense>
            </ErrorBoundary>
          )}
          {currentScreen === 'leads' && (
            <ErrorBoundary>
              <Suspense fallback={<div className="app-loading" />}>
                <LeadsScreen
                  userId={user.id}
                  pastSessions={pastSessions}
                  onCallLead={lead => {
                    setSelectedLead(lead);
                    setScreen('pre-call');
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </AppShell>
      )}

      {currentScreen === 'pre-call' && (
        <ErrorBoundary>
          <Suspense fallback={<div className="app-loading" />}>
            <PreCallScreen
              onStartCall={config => { setSelectedLead(null); handleStartCall(config); }}
              onBack={() => { setSelectedLead(null); setScreen(selectedLead ? 'leads' : 'dashboard'); }}
              defaultLanguage={appLanguage}
              defaultConfig={selectedLead ? {
                prospectName:  selectedLead.name,
                company:       selectedLead.company ?? '',
                prospectTitle: selectedLead.title ?? '',
                priorContext:  selectedLead.priorContext ?? '',
              } : undefined}
              userId={user.id}
              businessProfile={businessProfile}
              learningProfile={learningProfile}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {currentScreen === 'live-call' && callConfig && (
        <ErrorBoundary>
          <Suspense fallback={<div className="app-loading" />}>
            <LiveCallScreen config={callConfig} onEndCall={handleEndCall} />
          </Suspense>
        </ErrorBoundary>
      )}
      {currentScreen === 'upload-call' && (
        <ErrorBoundary>
          <Suspense fallback={<div className="app-loading" />}>
            <UploadCallScreen
              onEndCall={handleEndCall}
              onBack={() => setScreen('dashboard')}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {currentScreen === 'post-call' && callSession && (
        <ErrorBoundary>
          <Suspense fallback={<div className="app-loading" />}>
            <PostCallScreen
              session={callSession}
              onBack={() => setScreen('dashboard')}
              onNewCall={() => setScreen('pre-call')}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </AppContext.Provider>
  );
}

export default App;
