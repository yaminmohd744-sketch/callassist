import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../../lib/languages';
import type { LanguageCode } from '../../lib/languages';
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
  appLanguage: LanguageCode;
  onChangeLanguage: (code: LanguageCode) => void;
  currentLangFlag: string;
  currentLangLabel: string;
  children: React.ReactNode;
}

export function AppShell({
  activeScreen, onNavigate, onStartCall, onUploadCall, onSignOut,
  appLanguage, onChangeLanguage, currentLangFlag, currentLangLabel,
  children,
}: AppShellProps) {
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!langOpen) return;
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [langOpen]);

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

          {/* ── Language switcher ── */}
          <div className="app-shell__lang-wrap" ref={dropdownRef}>
            <button
              className="app-shell__lang-btn"
              onClick={() => setLangOpen(o => !o)}
              title={`App language: ${currentLangLabel}`}
              aria-expanded={langOpen}
            >
              <span className="app-shell__lang-flag">{currentLangFlag}</span>
              <span className="app-shell__lang-label">{currentLangLabel}</span>
              <span className={`app-shell__lang-caret${langOpen ? ' app-shell__lang-caret--open' : ''}`}>▾</span>
            </button>

            {langOpen && (
              <div className="app-shell__lang-dropdown">
                <div className="app-shell__lang-dropdown-label">App language</div>
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`app-shell__lang-option${appLanguage === l.code ? ' app-shell__lang-option--active' : ''}`}
                    onClick={() => { onChangeLanguage(l.code); setLangOpen(false); }}
                  >
                    <span className="app-shell__lang-option-flag">{l.flag}</span>
                    <span className="app-shell__lang-option-label">{l.label}</span>
                    {appLanguage === l.code && <span className="app-shell__lang-option-check">✓</span>}
                  </button>
                ))}
                <div className="app-shell__lang-dropdown-note">
                  Affects coaching, training & interface. Pick a different language per call in Pre-Call Setup.
                </div>
              </div>
            )}
          </div>

          <button className="app-shell__btn-ghost" onClick={onUploadCall}>↑ Upload</button>
          <button className="app-shell__btn-primary" onClick={onStartCall}>▶ New Call</button>
          <button className="app-shell__btn-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="app-shell__content">
        {children}
      </div>

    </div>
  );
}
