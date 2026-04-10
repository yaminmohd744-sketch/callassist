
import type { CallStatus } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './StatusBar.css';

interface StatusBarProps {
  status: CallStatus;
  formattedTime: string;
  objectionsCount: number;
  closeProbability: number;
}

export function StatusBar({ status, formattedTime, objectionsCount, closeProbability }: StatusBarProps) {
  const t = useTranslations();
  const probLevel = closeProbability >= 61 ? 'high' : closeProbability >= 31 ? 'medium' : 'low';

  return (
    <div className={`status-bar status-bar--${status}`}>
      <div className="status-bar__left">
        <span className={`status-bar__dot status-bar__dot--${status}`} />
        <span className="status-bar__label">{status === 'active' ? t.liveCall.active : t.liveCall.standby}</span>
        <span className="status-bar__time">{formattedTime}</span>
      </div>

      <div className="status-bar__right">
        <span className="status-bar__stat">
          {t.liveCall.objections} <span className={`status-bar__stat-val ${objectionsCount > 0 ? 'status-bar__stat-val--red' : ''}`}>{objectionsCount}</span>
        </span>
        <span className="status-bar__divider">·</span>
        <span className="status-bar__stat">
          {t.liveCall.closeProb} <span className={`status-bar__stat-val status-bar__stat-val--${probLevel}`}>{closeProbability}%</span>
        </span>
      </div>
    </div>
  );
}
