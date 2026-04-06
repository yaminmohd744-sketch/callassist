import './AppShell.css';

type ShellScreen = 'dashboard' | 'training' | 'analytics';

const NAV_ITEMS: { id: ShellScreen; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'training',  label: 'Training'  },
  { id: 'analytics', label: 'Analytics' },
];

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

      {/* ── Top nav ── */}
      <header className="app-shell__topnav">
        <div className="app-shell__logo">
          PITCH<span className="app-shell__logo-word">PLUS</span><span className="app-shell__logo-plus">+</span>
        </div>

        <nav className="app-shell__tabs" role="navigation">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              className={`app-shell__tab${activeScreen === id ? ' app-shell__tab--active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              {label}
              {activeScreen === id && <span className="app-shell__tab-bar" />}
            </button>
          ))}
        </nav>

        <div className="app-shell__actions">
          <button className="app-shell__btn-ghost" onClick={onUploadCall}>
            ↑ Upload
          </button>
          <button className="app-shell__btn-primary" onClick={onStartCall}>
            ▶ New Call
          </button>
          <button className="app-shell__btn-signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="app-shell__content">
        {children}
      </div>

    </div>
  );
}
