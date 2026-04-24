import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { LandingScreen }    from './screens/LandingScreen';
import { IntroScreen }      from './screens/IntroScreen';
import { DashboardScreen }  from './screens/DashboardScreen';
import { PreCallScreen }    from './screens/PreCallScreen';
import { LiveCallScreen }   from './screens/LiveCallScreen';
const PostCallScreen = lazy(() => import('./screens/PostCallScreen').then(m => ({ default: m.PostCallScreen })));
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
import { UploadCallScreen } from './screens/UploadCallScreen';
import { AuthScreen }       from './screens/AuthScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ThemeToggle }      from './components/ThemeToggle';
import { AppShell }         from './components/layout/AppShell';
import { ErrorBoundary }    from './components/ErrorBoundary';
import { LoginTransitionOverlay } from './components/LoginTransitionOverlay';
import { useAuth }          from './hooks/useAuth';
import { useAppLanguage }   from './hooks/useAppLanguage';
import type { LanguageCode } from './lib/languages';
import './screens/AuthScreen.css';
import { supabase }         from './lib/supabase';
import { MOCK_SESSIONS }    from './lib/mockSessions';
import type { CallConfig, CallSession, CallStage, CallOutcome, TranscriptEntry, AISuggestion, CoachingWalkthrough } from './types';

const OUTCOMES_KEY = 'callassist:outcomes';
function loadOutcomes(): Record<string, CallOutcome> {
  try { return JSON.parse(localStorage.getItem(OUTCOMES_KEY) ?? '{}'); } catch { return {}; }
}
function saveOutcomes(map: Record<string, CallOutcome>) {
  try { localStorage.setItem(OUTCOMES_KEY, JSON.stringify(map)); } catch { /* quota */ }
}
function mergeOutcomes(sessions: CallSession[], map: Record<string, CallOutcome>): CallSession[] {
  return sessions.map(s => map[s.endedAt] !== undefined ? { ...s, outcome: map[s.endedAt] } : s);
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

type Screen = 'landing' | 'auth' | 'dashboard' | 'analytics' | 'upload-call' | 'pre-call' | 'live-call' | 'post-call';

// ─── DB row ↔ CallSession helpers ────────────────────────────────────────────

type DbRow = Record<string, unknown>;

function rowToSession(row: DbRow): CallSession {
  return {
    config:                (row.config as CallConfig) ?? ({} as CallConfig),
    transcript:            Array.isArray(row.transcript) ? row.transcript as TranscriptEntry[] : [],
    suggestions:           Array.isArray(row.suggestions) ? row.suggestions as AISuggestion[] : [],
    durationSeconds:       typeof row.duration_seconds === 'number' ? row.duration_seconds : 0,
    finalCloseProbability: typeof row.final_close_prob === 'number' ? row.final_close_prob : 50,
    objectionsCount:       typeof row.objections_count === 'number' ? row.objections_count : 0,
    callStage:             (row.call_stage as CallStage) ?? 'opener',
    endedAt:               typeof row.ended_at === 'string' ? row.ended_at : new Date().toISOString(),
    aiSummary:             typeof row.ai_summary === 'string' ? row.ai_summary : '',
    followUpEmail:         typeof row.follow_up_email === 'string' ? row.follow_up_email : '',
    leadScore:             typeof row.lead_score === 'number' ? row.lead_score : 0,
    notes:                 Array.isArray(row.notes) ? row.notes as string[] : [],
    talkRatio:             typeof row.talk_ratio === 'number' ? row.talk_ratio : undefined,
    coaching:              row.coaching as CoachingWalkthrough ?? undefined,
  };
}

function sessionToRow(s: CallSession, userId: string) {
  return {
    user_id:          userId,
    config:           s.config,
    transcript:       s.transcript,
    suggestions:      s.suggestions,
    duration_seconds: s.durationSeconds,
    final_close_prob: s.finalCloseProbability,
    objections_count: s.objectionsCount,
    call_stage:       s.callStage,
    ended_at:         s.endedAt,
    ai_summary:       s.aiSummary,
    follow_up_email:  s.followUpEmail,
    lead_score:       s.leadScore,
    notes:            s.notes,
    talk_ratio:       s.talkRatio ?? null,
    coaching:         s.coaching ?? null,
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {

  const { user, loading: authLoading } = useAuth();
  const { appLanguage, setAppLanguage, currentLang } = useAppLanguage();

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
  const [outcomeMap, setOutcomeMap] = useState<Record<string, CallOutcome>>(loadOutcomes);
  const [showTransition, setShowTransition] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const transitionShown = useRef(false);
  const [profilePic, setProfilePic] = useState<string | null>(
    () => localStorage.getItem(PROFILE_PIC_KEY)
  );

  function handleProfilePicChange(dataUrl: string) {
    setProfilePic(dataUrl);
    // Skip persisting images over ~500KB to avoid filling localStorage quota
    if (dataUrl.length > 500_000) return;
    try { localStorage.setItem(PROFILE_PIC_KEY, dataUrl); } catch { /* storage full — pic not persisted */ }
  }

  // Derived activity stats
  const totalCallSeconds = pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalCallCount = pastSessions.length;

  // Derive the effective screen: authenticated users on landing/auth go to dashboard
  const currentScreen: Screen = (user && (screen === 'landing' || screen === 'auth'))
    ? 'dashboard'
    : screen;

  // Show onboarding for first-time users (no saved onboarding data).
  // setState calls here are intentional — they synchronize React with
  // localStorage state after auth resolves (a genuine external system read).
  useEffect(() => {
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

  // Load sessions from Supabase whenever the authenticated user changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setPastSessions([]); return; }
    supabase
      .from('call_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('ended_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[CallAssist] Failed to load sessions:', error.message); return; }
        const real = data ? data.map(rowToSession) : [];
        const merged = mergeOutcomes(real.length > 0 ? real : MOCK_SESSIONS, loadOutcomes());
        setPastSessions(merged);
      });
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
      const { data, error } = await supabase
        .from('call_sessions')
        .insert(sessionToRow(session, user.id))
        .select()
        .single();
      if (error) { console.error('[CallAssist] Failed to save session:', error.message); }
      else if (data) setPastSessions(prev => [rowToSession(data as DbRow), ...prev]);
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
    setPastSessions(prev => mergeOutcomes(prev, next));
    setCallSession(prev => prev && prev.endedAt === endedAt ? { ...prev, outcome } : prev);
  }

  async function handleDeleteSession(endedAt: string) {
    setPastSessions(prev => prev.filter(s => s.endedAt !== endedAt));
    if (user) {
      const { error } = await supabase
        .from('call_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('ended_at', endedAt);
      if (error) console.error('[CallAssist] Failed to delete session:', error.message);
    }
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (authLoading) return <div className="app-loading">LOADING...</div>;

  if (!user) {
    // Desktop app: skip landing, go straight to auth
    if (isElectron || screen === 'auth') return (
      <>
        <AuthScreen onBack={isElectron ? () => {} : () => setScreen('landing')} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
    // Web app: show landing page first
    return (
      <>
        <LandingScreen onDownload={() => {
          // Silently try to open the installed desktop app via the custom protocol.
          // Using a hidden iframe avoids the OS error dialog if the app isn't installed.
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = 'pitchplus://open';
          document.body.appendChild(iframe);
          setTimeout(() => document.body.removeChild(iframe), 2000);
          // Fallback: if app isn't installed, go to sign-in so they can still register
          setTimeout(() => setScreen('auth'), 1800);
        }} />
        {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
  }

  const isShell = currentScreen === 'dashboard' || currentScreen === 'analytics';

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
        <OnboardingScreen onDone={data => {
          try { localStorage.setItem('pp-onboarding', JSON.stringify(data)); } catch { /* storage full */ }
          setAppLanguage(data.language as LanguageCode);
          setShowOnboarding(false);
          setShowTransition(true);
        }} />
      )}
      {showTransition && !showOnboarding && (
        <LoginTransitionOverlay
          userName={loginUserName}
          onDone={() => setShowTransition(false)}
        />
      )}
      {/* ThemeToggle only shown outside the shell — inside it lives in the profile dropdown */}
      {!isShell && <ThemeToggle theme={theme} onToggle={toggleTheme} />}

      {isShell && (
        <AppShell
          activeScreen={currentScreen as 'dashboard' | 'analytics'}
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
            </ErrorBoundary>
          )}
          {currentScreen === 'analytics' && (
            <ErrorBoundary>
              <Suspense fallback={<div className="app-loading" />}>
                <AnalyticsScreen pastSessions={pastSessions} />
              </Suspense>
            </ErrorBoundary>
          )}
        </AppShell>
      )}

      {currentScreen === 'pre-call' && (
        <ErrorBoundary>
          <PreCallScreen
            onStartCall={handleStartCall}
            onBack={() => setScreen('dashboard')}
            defaultLanguage={appLanguage}
            defaultCompany={onboardingData.companyName ?? ''}
            defaultPitch={onboardingData.productDescription ?? ''}
          />
        </ErrorBoundary>
      )}
      {currentScreen === 'live-call' && callConfig && (
        <ErrorBoundary>
          <LiveCallScreen config={callConfig} onEndCall={handleEndCall} />
        </ErrorBoundary>
      )}
      {currentScreen === 'upload-call' && (
        <ErrorBoundary>
          <UploadCallScreen
            onEndCall={handleEndCall}
            onBack={() => setScreen('dashboard')}
          />
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
