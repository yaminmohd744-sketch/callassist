
import { Button } from '../ui/Button';
import { useTranslations } from '../../hooks/useTranslations';
import './Header.css';

interface HeaderProps {
  prospectName: string;
  company: string;
  onEndCall: () => void;
  onMinimize?: () => void;
}

export function Header({ prospectName, company, onEndCall, onMinimize }: HeaderProps) {
  const t = useTranslations();
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>
        <div className="header__prospect">
          <span className="header__prospect-name">{prospectName || t.liveCall.noProspect}</span>
          {company && <><span className="header__prospect-sep">@</span><span className="header__prospect-company">{company}</span></>}
        </div>
      </div>

      <div className="header__mode-badge">● {t.liveCall.liveMode}</div>

      <div className="header__right">
        {onMinimize && (
          <button className="header__minimize" onClick={onMinimize} title="Share screen — minimize to bubble">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 9.5L7 6.5L10 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 6.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Share Screen
          </button>
        )}
        <Button variant="danger" size="sm" onClick={onEndCall}>
          ■ {t.liveCall.endCall}
        </Button>
      </div>
    </header>
  );
}
