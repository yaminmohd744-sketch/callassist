import './AppShell.css';

type ShellScreen = 'dashboard' | 'training';

interface AppShellProps {
  activeScreen: ShellScreen;
  onNavigate: (screen: ShellScreen) => void;
  onStartCall: () => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppShell({ activeScreen, onNavigate, onStartCall, onSignOut, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__logo">◎ CALL<span>ASSIST</span></div>

        <nav className="app-shell__nav">
          <div
            className={`app-shell__nav-item ${activeScreen === 'dashboard' ? 'app-shell__nav-item--active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <span className="app-shell__nav-icon">⊞</span>Dashboard
          </div>
          <div
            className={`app-shell__nav-item ${activeScreen === 'training' ? 'app-shell__nav-item--active' : ''}`}
            onClick={() => onNavigate('training')}
          >
            <span className="app-shell__nav-icon">◈</span>Training
          </div>
          <div className="app-shell__nav-item" onClick={onStartCall}>
            <span className="app-shell__nav-icon">▶</span>New Call
          </div>
        </nav>

        <div className="app-shell__footer">
          <div className="app-shell__version">v1.0 MVP</div>
          <button className="app-shell__signout" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>

      <div className="app-shell__content">
        {children}
      </div>
    </div>
  );
}
