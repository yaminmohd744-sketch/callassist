
import { Button } from '../ui/Button';
import './Header.css';

interface HeaderProps {
  prospectName: string;
  company: string;
  onEndCall: () => void;
}

export function Header({ prospectName, company, onEndCall }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__logo">+ PITCH<span className="header__logo-accent"> PLUS</span></div>
        <div className="header__prospect">
          <span className="header__prospect-name">{prospectName || 'No prospect'}</span>
          {company && <><span className="header__prospect-sep">@</span><span className="header__prospect-company">{company}</span></>}
        </div>
      </div>

      <div className="header__mode-badge">● LIVE MODE</div>

      <div className="header__right">
        <Button variant="danger" size="sm" onClick={onEndCall}>
          ■ END CALL
        </Button>
      </div>
    </header>
  );
}
