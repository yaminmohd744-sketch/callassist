
import { Button } from '../ui/Button';
import { useTranslations } from '../../hooks/useTranslations';
import './Header.css';

interface HeaderProps {
  prospectName: string;
  company: string;
  onEndCall: () => void;
}

export function Header({ prospectName, company, onEndCall }: HeaderProps) {
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
        <Button variant="danger" size="sm" onClick={onEndCall}>
          ■ {t.liveCall.endCall}
        </Button>
      </div>
    </header>
  );
}
