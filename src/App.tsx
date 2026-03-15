import { useState, useEffect } from 'react';
import { LandingScreen }   from './screens/LandingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { PreCallScreen }   from './screens/PreCallScreen';
import { LiveCallScreen }  from './screens/LiveCallScreen';
import { PostCallScreen }  from './screens/PostCallScreen';
import { AuthScreen }      from './screens/AuthScreen';
import { useAuth }         from './hooks/useAuth';
import './screens/AuthScreen.css';
import { supabase }        from './lib/supabase';
import type { CallConfig, CallSession, CallStage, TranscriptEntry, AISuggestion } from './types';

type Screen = 'landing' | 'dashboard' | 'pre-call' | 'live-call' | 'post-call';

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
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  const { user, loading: authLoading } = useAuth();

  const [screen, setScreen]             = useState<Screen>('landing');
  const [callConfig, setCallConfig]     = useState<CallConfig | null>(null);
  const [callSession, setCallSession]   = useState<CallSession | null>(null);
  const [pastSessions, setPastSessions] = useState<CallSession[]>([]);

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
  if (!user) return <AuthScreen />;

  return (
    <>
      {screen === 'landing' && (
        <LandingScreen onGetStarted={() => setScreen('dashboard')} />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen
          pastSessions={pastSessions}
          onStartCall={() => setScreen('pre-call')}
          onViewSession={handleViewSession}
          onDeleteSession={handleDeleteSession}
          onSignOut={() => supabase.auth.signOut()}
        />
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
