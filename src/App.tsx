import { useState, useEffect } from 'react';
import { LandingScreen }    from './screens/LandingScreen';
import { DashboardScreen }  from './screens/DashboardScreen';
import { PreCallScreen }    from './screens/PreCallScreen';
import { LiveCallScreen }   from './screens/LiveCallScreen';
import { PostCallScreen }   from './screens/PostCallScreen';
import { TrainingScreen }   from './screens/TrainingScreen';
import { AnalyticsScreen }  from './screens/AnalyticsScreen';
import { UploadCallScreen } from './screens/UploadCallScreen';
import { AuthScreen }       from './screens/AuthScreen';
import { ThemeToggle }     from './components/ThemeToggle';
import { AppShell }        from './components/layout/AppShell';
import { useAuth }         from './hooks/useAuth';
import './screens/AuthScreen.css';
import { supabase }        from './lib/supabase';
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
  const [callConfig, setCallConfig]     = useState<CallConfig | null>(null);
  const [callSession, setCallSession]   = useState<CallSession | null>(null);
  const [pastSessions, setPastSessions] = useState<CallSession[]>([]);

  // Auto-redirect authenticated users away from landing/auth to dashboard
  useEffect(() => {
    if (user && (screen === 'landing' || screen === 'auth')) {
      setScreen('dashboard');
    }
  }, [user, screen]);

  // Load sessions from Supabase whenever the authenticated user changes
  useEffect(() => {
    if (!user) { setPastSessions([]); return; }
    supabase
      .from('call_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('ended_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPastSessions(data.map(rowToSession));
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
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </>
    );
  }

  const isShell = screen === 'dashboard' || screen === 'training' || screen === 'analytics';

  return (
    <>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {isShell && (
        <AppShell
          activeScreen={screen as 'dashboard' | 'training' | 'analytics'}
          onNavigate={s => setScreen(s)}
          onStartCall={() => setScreen('pre-call')}
          onUploadCall={() => setScreen('upload-call')}
          onSignOut={() => supabase.auth.signOut()}
        >
          {screen === 'dashboard' && (
            <DashboardScreen
              pastSessions={pastSessions}
              onStartCall={() => setScreen('pre-call')}
              onUploadCall={() => setScreen('upload-call')}
              onViewSession={handleViewSession}
              onDeleteSession={handleDeleteSession}
            />
          )}
          {screen === 'training' && (
            <TrainingScreen onBack={() => setScreen('dashboard')} />
          )}
          {screen === 'analytics' && (
            <AnalyticsScreen pastSessions={pastSessions} user={user} />
          )}
        </AppShell>
      )}

      {screen === 'pre-call' && (
        <PreCallScreen
          onStartCall={handleStartCall}
          onBack={() => setScreen('dashboard')}
        />
      )}
      {screen === 'live-call' && callConfig && (
        <LiveCallScreen config={callConfig} onEndCall={handleEndCall} />
      )}
      {screen === 'upload-call' && (
        <UploadCallScreen
          onEndCall={handleEndCall}
          onBack={() => setScreen('dashboard')}
        />
      )}
      {screen === 'post-call' && callSession && (
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
