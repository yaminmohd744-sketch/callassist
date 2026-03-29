import './AppShell.css';

type ShellScreen = 'dashboard' | 'training' | 'analytics';

interface AppShellProps {
  activeScreen: ShellScreen;
  onNavigate: (screen: ShellScreen) => void;
  onStartCall: () => void;
  onUploadCall: () => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppShell({ activeScreen, onNavigate, onStartCall, onUploadCall, onSignOut, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>

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
          <div
            className={`app-shell__nav-item ${activeScreen === 'analytics' ? 'app-shell__nav-item--active' : ''}`}
            onClick={() => onNavigate('analytics')}
          >
            <span className="app-shell__nav-icon">▦</span>Analytics
          </div>

          <div className="app-shell__nav-divider" />

          <div className="app-shell__nav-item" onClick={onStartCall}>
            <span className="app-shell__nav-icon">▶</span>New Call
          </div>
          <div className="app-shell__nav-item" onClick={onUploadCall}>
            <span className="app-shell__nav-icon">⬆</span>Upload Call
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
