import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../../lib/languages';
import type { LanguageCode } from '../../lib/languages';
import { getMilestone, formatTotalTime } from '../../lib/milestones';
import { TiersOverlay } from '../TiersOverlay';
import { TierBadge } from '../TierBadge';
import { useTranslations } from '../../hooks/useTranslations';
import './AppShell.css';

type ShellScreen = 'dashboard' | 'analytics';

const NAV_IDS: ShellScreen[] = ['dashboard', 'analytics'];

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
  userName: string;
  userEmail: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalCallSeconds: number;
  totalCallCount: number;
  profilePic: string | null;
  onProfilePicChange: (dataUrl: string) => void;
  children: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

export function AppShell({
  activeScreen, onNavigate, onStartCall, onUploadCall, onSignOut,
  appLanguage, onChangeLanguage, currentLangLabel,
  userName, userEmail, theme, onToggleTheme,
  totalCallSeconds, totalCallCount,
  profilePic, onProfilePicChange,
  children,
}: AppShellProps) {
  const t = useTranslations();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tiersOpen, setTiersOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const picInputRef = useRef<HTMLInputElement>(null);

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
      {tiersOpen && (
        <TiersOverlay
          totalCalls={totalCallCount}
          onClose={() => setTiersOpen(false)}
        />
      )}

      {/* ── Top nav ── */}
      <header className="app-shell__topnav">
        <div className="app-shell__logo">
          PITCH<span className="app-shell__logo-word">PLUS</span><span className="app-shell__logo-plus">+</span>
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
              onClick={() => setLangOpen(o => !o)}
              title={`${t.profile.appLanguage}: ${currentLangLabel}`}
              aria-expanded={langOpen}
            >
              <img
                className="app-shell__lang-flag-img"
                src={`https://flagcdn.com/w20/${appLanguage.split('-')[1].toLowerCase()}.png`}
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
                      src={`https://flagcdn.com/w20/${l.code.split('-')[1].toLowerCase()}.png`}
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
              onClick={() => setProfileOpen(o => !o)}
              title={userName || userEmail}
              aria-expanded={profileOpen}
            >
              {profilePic
                ? <img
                    src={profilePic}
                    alt="Profile"
                    className="app-shell__avatar-img"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                : getInitials(userName || userEmail)
              }
            </button>

            {profileOpen && (() => {
              const { current: milestone, next, progress } = getMilestone(totalCallCount);

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

              return (
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
                    <div className="app-shell__profile-avatar-lg" onClick={handlePicClick} title="Change photo">
                      {profilePic
                        ? <img src={profilePic} alt="Profile" className="app-shell__avatar-img" />
                        : getInitials(userName || userEmail)
                      }
                      <div className="app-shell__avatar-edit-overlay">
                        <span>✎</span>
                      </div>
                    </div>
                    <div className="app-shell__profile-info">
                      {userName && <div className="app-shell__profile-name">{userName}</div>}
                      <div className="app-shell__profile-email">{userEmail}</div>
                      <button
                        className="app-shell__profile-status"
                        style={{ color: milestone.color }}
                        onClick={() => { setProfileOpen(false); setTiersOpen(true); }}
                        title="View all tiers"
                      >
                        <TierBadge tierId={milestone.id} color={milestone.color} size={16} unlocked />
                        {milestone.label}
                        <span className="app-shell__profile-status-arrow">›</span>
                      </button>
                    </div>
                  </div>

                  {/* Next milestone progress */}
                  {next && (
                    <div className="app-shell__milestone-progress">
                      <div className="app-shell__milestone-track">
                        <div
                          className="app-shell__milestone-fill"
                          style={{ width: `${Math.round(progress * 100)}%`, background: next.color }}
                        />
                      </div>
                      <div className="app-shell__milestone-label">
                        {Math.round(progress * 100)}% to <span style={{ color: next.color }}>{next.label}</span>
                      </div>
                    </div>
                  )}
                  {!next && (
                    <div className="app-shell__milestone-progress">
                      <div className="app-shell__milestone-label" style={{ color: milestone.color }}>
                        {t.profile.maxRank}
                      </div>
                    </div>
                  )}

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

                  {/* Appearance */}
                  <div className="app-shell__profile-section-label">{t.profile.appearance}</div>
                  <div className="app-shell__profile-appearance">
                    <span className={`app-shell__theme-label${theme === 'dark' ? ' app-shell__theme-label--active' : ''}`}>{t.profile.dark}</span>
                    <button
                      className={`app-shell__theme-toggle${theme === 'light' ? ' app-shell__theme-toggle--light' : ''}`}
                      onClick={onToggleTheme}
                      aria-label="Toggle theme"
                    >
                      <span className="app-shell__theme-knob" />
                    </button>
                    <span className={`app-shell__theme-label${theme === 'light' ? ' app-shell__theme-label--active' : ''}`}>{t.profile.light}</span>
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
              );
            })()}
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
