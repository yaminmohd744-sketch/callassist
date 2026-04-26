import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import * as Sentry from '@sentry/react';
import { ThemeToggle }      from './components/ThemeToggle';
import { AppShell }         from './components/layout/AppShell';
import { ErrorBoundary }    from './components/ErrorBoundary';
import { LoginTransitionOverlay } from './components/LoginTransitionOverlay';
import { useAuth }          from './hooks/useAuth';
import { useAppLanguage }   from './hooks/useAppLanguage';
import { useToast }         from './lib/toast';
import type { LanguageCode } from './lib/languages';
import { supabase }         from './lib/supabase';
import { loadSessions, saveSession, updateOutcome, deleteSession } from './lib/sessions';
import { updateLeadAfterCall } from './lib/leads';
import type { CallConfig, CallSession, CallOutcome, Lead } from './types';

const LandingScreen    = lazy(() => import('./screens/LandingScreen').then(m => ({ default: m.LandingScreen })));
const IntroScreen      = lazy(() => import('./screens/IntroScreen').then(m => ({ default: m.IntroScreen })));
const DashboardScreen  = lazy(() => import('./screens/DashboardScreen').then(m => ({ default: m.DashboardScreen })));
const PreCallScreen    = lazy(() => import('./screens/PreCallScreen').then(m => ({ default: m.PreCallScreen })));
const LiveCallScreen   = lazy(() => import('./screens/LiveCallScreen').then(m => ({ default: m.LiveCallScreen })));
const PostCallScreen   = lazy(() => import('./screens/PostCallScreen').then(m => ({ default: m.PostCallScreen })));
const AnalyticsScreen  = lazy(() => import('./screens/AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
const UploadCallScreen = lazy(() => import('./screens/UploadCallScreen').then(m => ({ default: m.UploadCallScreen })));
const LeadsScreen      = lazy(() => import('./screens/LeadsScreen').then(m => ({ default: m.LeadsScreen })));
const AuthScreen       = lazy(() => import('./screens/AuthScreen').then(m => ({ default: m.AuthScreen })));
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })));

const OUTCOMES_KEY = 'callassist:outcomes';
function loadOutcomes(): Record<string, CallOutcome> {
  try { return JSON.parse(localStorage.getItem(OUTCOMES_KEY) ?? '{}'); } catch { return {}; }
}
function saveOutcomes(map: Record<string, CallOutcome>) {
  try { localStorage.setItem(OUTCOMES_KEY, JSON.stringify(map)); } catch { /* quota */ }
}

const PROFILE_PIC_KEY = 'pp-profile-pic';

interface OnboardingData {
  name?: string;
  language?: string;
  sellingFor?: string;
  industry?: string;
  companyName?: string;
  productDescription?: string;
}

function getOnboardingData(): OnboardingData {
  try {
    const raw = JSON.parse(localStorage.getItem('pp-onboarding') || '{}') as Record<string, unknown>;
    return {
      name:               typeof raw.name               === 'string' ? raw.name               : undefined,
      language:           typeof raw.language           === 'string' ? raw.language           : undefined,
      sellingFor:         typeof raw.sellingFor         === 'string' ? raw.sellingFor         : undefined,
      industry:           typeof raw.industry           === 'string' ? raw.industry           : undefined,
      companyName:        typeof raw.companyName        === 'string' ? raw.companyName        : undefined,
      productDescription: typeof raw.productDescription === 'string' ? raw.productDescription : undefined,
    };
  } catch {
    return {};
  }
}

// True when running inside the Electron desktop app
const isElectron = navigator.userAgent.includes('Electron');

// Read once at module scope for FOUC prevention and React state initialisation
const INITIAL_THEME = (localStorage.getItem('theme') ?? 'dark') as 'dark' | 'light';
document.documentElement.dataset.theme = INITIAL_THEME === 'light' ? 'light' : '';

type Screen = 'landing' | 'auth' | 'dashboard' | 'analytics' | 'leads' | 'upload-call' | 'pre-call' | 'live-call' | 'post-call';

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {

  const { user, loading: authLoading } = useAuth();
  const { appLanguage, setAppLanguage, currentLang } = useAppLanguage();
  const toast = useToast();

  const [theme, setTheme] = useState<'dark' | 'light'>(INITIAL_THEME);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* storage full */ }
    document.documentElement.dataset.theme = next === 'light' ? 'light' : '';
  }

  const [screen, setScreen]             = useState<Screen>(isElectron ? 'auth' : 'landing');
  const [showIntro, setShowIntro]       = useState(true);
  const [callConfig, setCallConfig]     = useState<CallConfig | null>(null);
  const [callSession, setCallSession]   = useState<CallSession | null>(null);
  const [pastSessions, setPastSessions] = useState<CallSession[]>([]);
  const [outcomeMap, setOutcomeMap]     = useState<Record<string, CallOutcome>>(loadOutcomes);
  const [showTransition, setShowTransition] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const transitionShown = useRef(false);
  const [profilePic, setProfilePic] = useState<string | null>(
    () => localStorage.getItem(PROFILE_PIC_KEY)
  );
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  function handleProfilePicChange(dataUrl: string) {
    setProfilePic(dataUrl);
    if (dataUrl.length > 500_000) return;
    try { localStorage.setItem(PROFILE_PIC_KEY, dataUrl); } catch { /* storage full */ }
  }

  const totalCallSeconds = pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalCallCount = pastSessions.length;

  const currentScreen: Screen = (user && (screen === 'landing' || screen === 'auth'))
    ? 'dashboard'
    : screen;

  useEffect(() => {
    if (user) Sentry.setUser({ id: user.id, email: user.email ?? undefined });
    else Sentry.setUser(null);

    if (!authLoading && user && !transitionShown.current) {
      const hasOnboarded = !!localStorage.getItem('pp-onboarding');
      if (!hasOnboarded) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowOnboarding(true);
      } else {
        setShowTransition(true);
      }
      transitionShown.current = true;
    }
  }, [user, authLoading]);

  // Load sessions — show a toast if it fails so the user knows history is unavailable
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setPastSessions([]); return; }
    loadSessions(user.id, loadOutcomes())
      .then(sessions => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPastSessions(sessions);
      })
      .catch(() => {
        toast.error('Failed to load your call history. Check your connection and refresh.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleStartCall(config: CallConfig) {
    setCallConfig(config);
    setCallSession(null);
    setScreen('live-call');
  }

  async function handleEndCall(session: CallSession) {
    setCallSession(session);
    setScreen('post-call');
    if (user) {
      try {
        const saved = await saveSession(session, user.id);
        setPastSessions(prev => [saved, ...prev]);
      } catch {
        toast.error('Call ended but failed to save. Your data is safe locally.');
      }
      if (selectedLead) {
        updateLeadAfterCall(selectedLead.id, user.id, selectedLead.callCount)
          .catch(() => { /* silent — lead sync is non-critical */ });
        setSelectedLead(null);
      }
    }
  }

  function handleViewSession(session: CallSession) {
    setCallSession(session);
    setScreen('post-call');
  }

  function handleUpdateOutcome(endedAt: string, outcome: CallOutcome) {
    const next = { ...outcomeMap, [endedAt]: outcome };
    setOutcomeMap(next);
    saveOutcomes(next);
    setPastSessions(prev => prev.map(s => s.endedAt === endedAt ? { ...s, outcome } : s));
    setCallSession(prev => prev && prev.endedAt === endedAt ? { ...prev, outcome } : prev);
    if (user) {
      updateOutcome(user.id, endedAt, outcome)
        .catch(() => toast.error('Failed to save outcome.'));
    }
  }

  async function handleDeleteSession(endedAt: string) {
    // Optimistic update — roll back on failure
    setPastSessions(prev => prev.filter(s => s.endedAt !== endedAt));
    if (user) {
      deleteSession(user.id, endedAt).catch(() => {
        toast.error('Failed to delete session.');
        // Reload sessions to restore correct state
        loadSessions(user.id, loadOutcomes())
          .then(sessions => setPastSessions(sessions))
          .catch(() => { /* already toasted above */ });
      });
    }
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (authLoading) return <div className="app-loading">LOADING...</div>;

  if (!user) {
    if (isElectron || screen === 'auth') return (
      <>
        <Suspense fallback={<div className="app-loading" />}>
          <AuthScreen onBack={isElectron ? () => {} : () => setScreen('landing')} />
        </Suspense>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
    return (
      <>
        <Suspense fallback={<div className="app-loading" />}>
          <LandingScreen onDownload={() => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'pitchplus://open';
            document.body.appendChild(iframe);
            setTimeout(() => document.body.removeChild(iframe), 2000);
            setTimeout(() => setScreen('auth'), 1800);
          }} />
        </Suspense>
        {showIntro && (
          <Suspense fallback={null}>
            <IntroScreen onDone={() => setShowIntro(false)} />
          </Suspense>
        )}
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
  }

  const isShell = currentScreen === 'dashboard' || currentScreen === 'analytics' || currentScreen === 'leads';

  const onboardingData = getOnboardingData();

  const loginUserName =
    onboardingData.name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    '';

  return (
    <>
      {showOnboarding && (
        <Suspense fallback={<div className="app-loading" />}>
          <OnboardingScreen onDone={data => {
            try { localStorage.setItem('pp-onboarding', JSON.stringify(data)); } catch { /* storage full */ }
            setAppLanguage(data.language as LanguageCode);
            setShowOnboarding(false);
            setShowTransition(true);
          }} />
        </Suspense>
      )}
      {showTransition && !showOnboarding && (
        <LoginTransitionOverlay
          userName={loginUserName}
          onDone={() => setShowTransition(false)}
        />
      )}
      {!isShell && <ThemeToggle theme={theme} onToggle={toggleTheme} />}

      {isShell && (
        <AppShell
          activeScreen={currentScreen as 'dashboard' | 'analytics' | 'leads'}
          onNavigate={s => setScreen(s)}
          onStartCall={() => setScreen('pre-call')}
          onUploadCall={() => setScreen('upload-call')}
          onSignOut={() => supabase.auth.signOut()}
          appLanguage={appLanguage}
          onChangeLanguage={setAppLanguage}
          currentLangFlag={currentLang.flag}
          currentLangLabel={currentLang.label}
          userName={loginUserName}
          userEmail={user?.email ?? ''}
          theme={theme}
          onToggleTheme={toggleTheme}
          totalCallSeconds={totalCallSeconds}
          totalCallCount={totalCallCount}
          profilePic={profilePic}
          onProfilePicChange={handleProfilePicChange}
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
                  userName={
                    user?.user_metadata?.full_name?.split(' ')[0] ||
                    user?.user_metadata?.name?.split(' ')[0] ||
                    user?.email?.split('@')[0] ||
                    ''
                  }
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
                <LeadsScreen onCallLead={lead => {
                  setSelectedLead(lead);
                  setScreen('pre-call');
                }} />
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
              defaultCompany={onboardingData.companyName ?? ''}
              defaultPitch={onboardingData.productDescription ?? ''}
              defaultConfig={selectedLead ? {
                prospectName:  selectedLead.name,
                company:       selectedLead.company ?? '',
                prospectTitle: selectedLead.title ?? '',
                priorContext:  selectedLead.priorContext ?? '',
              } : undefined}
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
              onUpdateOutcome={(outcome) => handleUpdateOutcome(callSession.endedAt, outcome)}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}

export default App;
