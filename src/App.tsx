import { useState, useEffect, useRef } from 'react';
import { LandingScreen }    from './screens/LandingScreen';
import { IntroScreen }      from './screens/IntroScreen';
import { DashboardScreen }  from './screens/DashboardScreen';
import { PreCallScreen }    from './screens/PreCallScreen';
import { LiveCallScreen }   from './screens/LiveCallScreen';
import { PostCallScreen }   from './screens/PostCallScreen';
import { TrainingScreen }   from './screens/TrainingScreen';
import { AnalyticsScreen }  from './screens/AnalyticsScreen';
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
import { getTrainingHistory } from './lib/trainingHistory';
import type { CallConfig, CallSession, CallStage, TranscriptEntry, AISuggestion, CoachingWalkthrough } from './types';

const PROFILE_PIC_KEY = 'pp-profile-pic';
// Estimated seconds per training exchange (~90s avg per rep turn)
const SECONDS_PER_EXCHANGE = 90;

interface OnboardingData {
  name?: string;
  language?: string;
  role?: string;
  product?: string;
}

function getOnboardingData(): OnboardingData {
  try {
    const raw = JSON.parse(localStorage.getItem('pp-onboarding') || '{}') as Record<string, unknown>;
    return {
      name:     typeof raw.name     === 'string' ? raw.name     : undefined,
      language: typeof raw.language === 'string' ? raw.language : undefined,
      role:     typeof raw.role     === 'string' ? raw.role     : undefined,
      product:  typeof raw.product  === 'string' ? raw.product  : undefined,
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

type Screen = 'landing' | 'auth' | 'dashboard' | 'training' | 'analytics' | 'upload-call' | 'pre-call' | 'live-call' | 'post-call';

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
  const [showTransition, setShowTransition] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const transitionShown = useRef(false);
  const [profilePic, setProfilePic] = useState<string | null>(
    () => localStorage.getItem(PROFILE_PIC_KEY)
  );

  function handleProfilePicChange(dataUrl: string) {
    setProfilePic(dataUrl);
    try { localStorage.setItem(PROFILE_PIC_KEY, dataUrl); } catch { /* storage full — pic not persisted */ }
  }

  // Derived activity stats
  const totalCallSeconds = pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalCallCount = pastSessions.length;
  const trainingHistory = getTrainingHistory();
  const totalTrainingSessions = trainingHistory.length;
  const totalTrainingSeconds = trainingHistory.reduce((sum, h) => sum + h.exchanges * SECONDS_PER_EXCHANGE, 0);

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
        setPastSessions(real.length > 0 ? real : MOCK_SESSIONS);
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

  const isShell = currentScreen === 'dashboard' || currentScreen === 'training' || currentScreen === 'analytics';

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
          activeScreen={currentScreen as 'dashboard' | 'training' | 'analytics'}
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
          totalTrainingSessions={totalTrainingSessions}
          totalTrainingSeconds={totalTrainingSeconds}
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
          {currentScreen === 'training' && (
            <ErrorBoundary>
              <TrainingScreen onBack={() => setScreen('dashboard')} appLanguage={appLanguage} />
            </ErrorBoundary>
          )}
          {currentScreen === 'analytics' && (
            <ErrorBoundary>
              <AnalyticsScreen pastSessions={pastSessions} />
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
          <PostCallScreen
            session={callSession}
            onBack={() => setScreen('dashboard')}
            onNewCall={() => setScreen('pre-call')}
          />
        </ErrorBoundary>
      )}
    </>
  );
}

export default App;
