import { useState, useRef, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES } from '../../lib/languages';
import { formatTotalTime } from '../../lib/formatters';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../contexts/AppContext';
import { PitchrLogo } from '../ui/PitchrLogo';
import { STORAGE_KEYS } from '../../lib/storageKeys';
import './AppShell.css';

// ── Connected accounts ────────────────────────────────────────────────────────

type AccountId = 'google-meet' | 'zoom' | 'teams';

interface ConnectedAccount {
  id: AccountId;
  label: string;
  icon: string;
  connectUrl: string;
}

const ACCOUNTS: ConnectedAccount[] = [
  { id: 'google-meet', label: 'Google Meet', icon: '▶', connectUrl: 'https://meet.google.com' },
  { id: 'zoom',        label: 'Zoom',        icon: '⬤', connectUrl: 'https://zoom.us/signin'  },
  { id: 'teams',       label: 'Teams',       icon: '⊞', connectUrl: 'https://teams.microsoft.com' },
];

function loadConnected(): Set<AccountId> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.connectedAccounts) ?? '[]') as AccountId[];
    return new Set(raw);
  } catch { return new Set(); }
}

function saveConnected(set: Set<AccountId>) {
  localStorage.setItem(STORAGE_KEYS.connectedAccounts, JSON.stringify([...set]));
}

type ShellScreen = 'dashboard' | 'analytics' | 'leads';

const NAV_IDS: ShellScreen[] = ['dashboard', 'analytics', 'leads'];

interface AppShellProps {
  activeScreen: ShellScreen;
  onNavigate: (screen: ShellScreen) => void;
  onStartCall: () => void;
  onUploadCall: () => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

export function AppShell({
  activeScreen, onNavigate, onStartCall, onUploadCall, onSignOut,
  children,
}: AppShellProps) {
  const t = useTranslations();
  const {
    appLanguage, onChangeLanguage, currentLangLabel,
    userName, userEmail,
    totalCallSeconds, totalCallCount,
    profilePic, onProfilePicChange, onProfilePicError,
  } = useAppContext();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [connected, setConnected] = useState<Set<AccountId>>(() => loadConnected());
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const picInputRef = useRef<HTMLInputElement>(null);

  const toggleAccount = useCallback((id: AccountId) => {
    setConnected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveConnected(next);
      return next;
    });
  }, []);

  function handlePicClick() { picInputRef.current?.click(); }
  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      if (result) onProfilePicChange(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // Close dropdowns on outside click
  useEffect(() => {
    if (!langOpen && !profileOpen) return;
    function handle(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [langOpen, profileOpen]);

  return (
    <div className="app-shell">

      {/* ── Top nav ── */}
      <header className="app-shell__topnav">
        <div className="app-shell__logo">
          <PitchrLogo size="sm" />
        </div>

        <nav className="app-shell__tabs" role="navigation">
          {NAV_IDS.map(id => (
            <button
              key={id}
              className={`app-shell__tab${activeScreen === id ? ' app-shell__tab--active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              {t.nav[id]}
              {activeScreen === id && <span className="app-shell__tab-bar" />}
            </button>
          ))}
        </nav>

        <div className="app-shell__actions">

          {/* ── Language switcher ── */}
          <div className="app-shell__lang-wrap" ref={langRef}>
            <button
              className="app-shell__lang-btn"
              onClick={() => { setProfileOpen(false); setLangOpen(o => !o); }}
              title={`${t.profile.appLanguage}: ${currentLangLabel}`}
              aria-label={`${t.profile.appLanguage}: ${currentLangLabel}`}
              aria-expanded={langOpen}
              aria-haspopup="true"
            >
              <img
                className="app-shell__lang-flag-img"
                src={`https://flagcdn.com/w20/${(appLanguage.split('-')[1] ?? appLanguage).toLowerCase()}.png`}
                alt={currentLangLabel}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="app-shell__lang-label">{currentLangLabel}</span>
              <span className={`app-shell__lang-caret${langOpen ? ' app-shell__lang-caret--open' : ''}`}>▾</span>
            </button>

            {langOpen && (
              <div className="app-shell__lang-dropdown">
                <div className="app-shell__lang-dropdown-label">{t.profile.appLanguage}</div>
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`app-shell__lang-option${appLanguage === l.code ? ' app-shell__lang-option--active' : ''}`}
                    onClick={() => { onChangeLanguage(l.code); setLangOpen(false); }}
                  >
                    <img
                      className="app-shell__lang-option-flag-img"
                      src={`https://flagcdn.com/w20/${(l.code.split('-')[1] ?? l.code).toLowerCase()}.png`}
                      alt={l.label}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="app-shell__lang-option-label">{l.label}</span>
                    {appLanguage === l.code && <span className="app-shell__lang-option-check">✓</span>}
                  </button>
                ))}
                <div className="app-shell__lang-dropdown-note">{t.profile.langNote}</div>
              </div>
            )}
          </div>

          <button className="app-shell__btn-ghost" onClick={onUploadCall}>{t.nav.upload}</button>
          <button className="app-shell__btn-primary" onClick={onStartCall}>{t.nav.newCall}</button>

          {/* ── Profile avatar + dropdown ── */}
          <div className="app-shell__profile-wrap" ref={profileRef}>
            <button
              className="app-shell__avatar"
              onClick={() => { setLangOpen(false); setProfileOpen(o => !o); }}
              title={userName || userEmail}
              aria-label={`Profile: ${userName || userEmail}`}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              {profilePic
                ? <img
                    src={profilePic}
                    alt="Profile"
                    className="app-shell__avatar-img"
                    onError={() => onProfilePicError?.()}
                  />
                : getInitials(userName || userEmail)
              }
            </button>

            {profileOpen && (
                <div className="app-shell__profile-dropdown">

                  {/* Hidden file input for pic upload */}
                  <input
                    ref={picInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePicChange}
                  />

                  {/* User info */}
                  <div className="app-shell__profile-header">
                    <button type="button" className="app-shell__profile-avatar-lg" onClick={handlePicClick} title="Change photo" aria-label="Change profile photo">
                      {profilePic
                        ? <img src={profilePic} alt="Profile" className="app-shell__avatar-img" />
                        : getInitials(userName || userEmail)
                      }
                      <div className="app-shell__avatar-edit-overlay">
                        <span aria-hidden="true">✎</span>
                      </div>
                    </button>
                    <div className="app-shell__profile-info">
                      {userName && <div className="app-shell__profile-name">{userName}</div>}
                      <div className="app-shell__profile-email">{userEmail}</div>
                    </div>
                  </div>

                  <div className="app-shell__profile-divider" />

                  {/* Activity stats */}
                  <div className="app-shell__profile-section-label">{t.profile.activity}</div>
                  <div className="app-shell__profile-stats">
                    <div className="app-shell__profile-stat">
                      <span className="app-shell__profile-stat-icon">◉</span>
                      <span className="app-shell__profile-stat-text">
                        <strong>{totalCallCount}</strong> {t.profile.calls(totalCallCount)} · {formatTotalTime(totalCallSeconds)}
                      </span>
                    </div>
                    <div className="app-shell__profile-stat app-shell__profile-stat--total">
                      <span className="app-shell__profile-stat-icon">⏱</span>
                      <span className="app-shell__profile-stat-text">
                        <strong>{formatTotalTime(totalCallSeconds)}</strong> {t.profile.totalOnPlatform}
                      </span>
                    </div>
                  </div>

                  <div className="app-shell__profile-divider" />

                  {/* Connected accounts */}
                  <div className="app-shell__profile-section-label">CONNECTED ACCOUNTS</div>
                  <div className="app-shell__accounts">
                    {ACCOUNTS.map(acc => {
                      const isConnected = connected.has(acc.id);
                      return (
                        <div key={acc.id} className="app-shell__account-row">
                          <span className="app-shell__account-icon">{acc.icon}</span>
                          <span className="app-shell__account-label">{acc.label}</span>
                          {isConnected ? (
                            <button
                              className="app-shell__account-badge app-shell__account-badge--connected"
                              onClick={() => toggleAccount(acc.id)}
                              title="Click to disconnect"
                            >
                              ✓ Connected
                            </button>
                          ) : (
                            <button
                              className="app-shell__account-badge app-shell__account-badge--disconnected"
                              onClick={() => {
                                window.open(acc.connectUrl, '_blank');
                                toggleAccount(acc.id);
                              }}
                            >
                              Connect now
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="app-shell__profile-divider" />

                  {/* Sign out */}
                  <button
                    className="app-shell__profile-signout"
                    onClick={() => { setProfileOpen(false); onSignOut(); }}
                  >
                    {t.common.signOut}
                  </button>

                </div>
            )}
          </div>

        </div>
      </header>

      {/* ── Page content ── */}
      <div className="app-shell__content">
        {children}
      </div>

    </div>
  );
}
