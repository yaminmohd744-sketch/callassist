import { useState, useEffect } from 'react';
import { LandingScreen } from './screens/LandingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { PreCallScreen } from './screens/PreCallScreen';
import { LiveCallScreen } from './screens/LiveCallScreen';
import { PostCallScreen } from './screens/PostCallScreen';
import type { CallConfig, CallSession } from './types';

const STORAGE_KEY = 'callassist_sessions';

function loadSessions(): CallSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CallSession[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: CallSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // storage full or unavailable — fail silently
  }
}

type Screen = 'landing' | 'dashboard' | 'pre-call' | 'live-call' | 'post-call';

export function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [callConfig, setCallConfig] = useState<CallConfig | null>(null);
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [pastSessions, setPastSessions] = useState<CallSession[]>(loadSessions);

  // Persist to localStorage whenever pastSessions changes
  useEffect(() => {
    saveSessions(pastSessions);
  }, [pastSessions]);

  function handleStartCall(config: CallConfig) {
    setCallConfig(config);
    setCallSession(null);
    setScreen('live-call');
  }

  function handleEndCall(session: CallSession) {
    setPastSessions(prev => [...prev, session]);
    setCallSession(session);
    setScreen('post-call');
  }

  function handleViewSession(session: CallSession) {
    setCallSession(session);
    setScreen('post-call');
  }

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
