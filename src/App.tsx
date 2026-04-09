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
import { LoginTransitionOverlay } from './components/LoginTransitionOverlay';
import { useAuth }          from './hooks/useAuth';
import { useAppLanguage }   from './hooks/useAppLanguage';
import type { LanguageCode } from './lib/languages';
import './screens/AuthScreen.css';
import { supabase }         from './lib/supabase';
import { MOCK_SESSIONS }    from './lib/mockSessions';
import type { CallConfig, CallSession, CallStage, TranscriptEntry, AISuggestion } from './types';

// Prevent flash of wrong theme on initial load
const _savedTheme = localStorage.getItem('theme');
if (_savedTheme === 'light') document.documentElement.dataset.theme = 'light';

type Screen = 'landing' | 'auth' | 'dashboard' | 'training' | 'analytics' | 'upload-call' | 'pre-call' | 'live-call' | 'post-call';

// ─── DB row ↔ CallSession helpers ────────────────────────────────────────────

type DbRow = Record<string, unknown>;

function rowToSession(row: DbRow): CallSession {
  return {
    config:                row.config              as CallConfig,
    transcript:            row.transcript          as TranscriptEntry[],
    suggestions:           row.suggestions         as AISuggestion[],
    durationSeconds:       row.duration_seconds    as number,
    finalCloseProbability: row.final_close_prob    as number,
    objectionsCount:       row.objections_count    as number,
    callStage:             row.call_stage          as CallStage,
    endedAt:               row.ended_at            as string,
    aiSummary:             row.ai_summary          as string,
    followUpEmail:         row.follow_up_email     as string,
    leadScore:             row.lead_score          as number,
    notes:                 (row.notes              as string[] | null) ?? [],
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
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {

  const { user, loading: authLoading } = useAuth();
  const { appLanguage, setAppLanguage, currentLang } = useAppLanguage();

  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('theme') ?? 'dark') as 'dark' | 'light'
  );

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.dataset.theme = next === 'light' ? 'light' : '';
  }

  const [screen, setScreen]             = useState<Screen>('landing');
  const [showIntro, setShowIntro]       = useState(true);
  const [callConfig, setCallConfig]     = useState<CallConfig | null>(null);
  const [callSession, setCallSession]   = useState<CallSession | null>(null);
  const [pastSessions, setPastSessions] = useState<CallSession[]>([]);
  const [showTransition, setShowTransition] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const transitionShown = useRef(false);

  // Derive the effective screen: authenticated users on landing/auth go to dashboard
  const currentScreen: Screen = (user && (screen === 'landing' || screen === 'auth'))
    ? 'dashboard'
    : screen;

  // Show onboarding for first-time users (no saved onboarding data)
  useEffect(() => {
    if (!authLoading && user && !transitionShown.current) {
      const hasOnboarded = !!localStorage.getItem('pp-onboarding');
      if (!hasOnboarded) {
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
      .then(({ data }) => {
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
      const { data } = await supabase
        .from('call_sessions')
        .insert(sessionToRow(session, user.id))
        .select()
        .single();
      if (data) setPastSessions(prev => [rowToSession(data as DbRow), ...prev]);
    }
  }

  function handleViewSession(session: CallSession) {
    setCallSession(session);
    setScreen('post-call');
  }

  async function handleDeleteSession(endedAt: string) {
    setPastSessions(prev => prev.filter(s => s.endedAt !== endedAt));
    if (user) {
      await supabase
        .from('call_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('ended_at', endedAt);
    }
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (authLoading) return <div className="app-loading">LOADING...</div>;

  if (!user) {
    if (screen === 'auth') return (
      <>
        <AuthScreen onBack={() => setScreen('landing')} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
    return (
      <>
        <LandingScreen onGetStarted={() => setScreen('auth')} />
        {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
  }

  const isShell = currentScreen === 'dashboard' || currentScreen === 'training' || currentScreen === 'analytics';

  const onboardingData = (() => {
    try { return JSON.parse(localStorage.getItem('pp-onboarding') || '{}'); }
    catch { return {}; }
  })();

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
          localStorage.setItem('pp-onboarding', JSON.stringify(data));
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
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

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
        >
          {currentScreen === 'dashboard' && (
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
          )}
          {currentScreen === 'training' && (
            <TrainingScreen onBack={() => setScreen('dashboard')} appLanguage={appLanguage} />
          )}
          {currentScreen === 'analytics' && (
            <AnalyticsScreen pastSessions={pastSessions} user={user} />
          )}
        </AppShell>
      )}

      {currentScreen === 'pre-call' && (
        <PreCallScreen
          onStartCall={handleStartCall}
          onBack={() => setScreen('dashboard')}
          defaultLanguage={appLanguage}
        />
      )}
      {currentScreen === 'live-call' && callConfig && (
        <LiveCallScreen config={callConfig} onEndCall={handleEndCall} />
      )}
      {currentScreen === 'upload-call' && (
        <UploadCallScreen
          onEndCall={handleEndCall}
          onBack={() => setScreen('dashboard')}
        />
      )}
      {currentScreen === 'post-call' && callSession && (
        <PostCallScreen
          session={callSession}
          onBack={() => setScreen('dashboard')}
          onNewCall={() => setScreen('pre-call')}
        />
      )}
    </>
  );
}

export default App;
