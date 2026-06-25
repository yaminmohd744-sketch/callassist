
import type { CallStatus } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './StatusBar.css';

const PROB_HIGH = 61;
const PROB_MEDIUM = 31;

// Above this rep talk-share, nudge the rep to listen more.
const TALK_DOMINATING = 70;

interface StatusBarProps {
  status: CallStatus;
  formattedTime: string;
  objectionsCount: number;
  closeProbability: number;
  /** Rep's share of speaking time (0-100), or null until enough data. */
  repTalkPct?: number | null;
}

export function StatusBar({ status, formattedTime, objectionsCount, closeProbability, repTalkPct }: StatusBarProps) {
  const t = useTranslations();
  const probLevel = closeProbability >= PROB_HIGH ? 'high' : closeProbability >= PROB_MEDIUM ? 'medium' : 'low';
  const talkDominating = typeof repTalkPct === 'number' && repTalkPct >= TALK_DOMINATING;

  return (
    <div className={`status-bar status-bar--${status}`}>
      <div className="status-bar__left">
        <span className={`status-bar__dot status-bar__dot--${status}`} />
        <span className="status-bar__label">{status === 'active' ? t.liveCall.active : t.liveCall.standby}</span>
        <span className="status-bar__time">{formattedTime}</span>
      </div>

      <div className="status-bar__right" aria-live="polite" aria-atomic="true">
        {typeof repTalkPct === 'number' && (
          <>
            <span className="status-bar__stat" title={talkDominating ? 'You’re talking a lot — ask a question and let them speak' : 'Your share of the conversation'}>
              You <span className={`status-bar__stat-val ${talkDominating ? 'status-bar__stat-val--red' : ''}`} aria-label={`You are speaking ${repTalkPct} percent of the time`}>{repTalkPct}%</span>
            </span>
            <span className="status-bar__divider">·</span>
          </>
        )}
        <span className="status-bar__stat">
          {t.liveCall.objections} <span className={`status-bar__stat-val ${objectionsCount > 0 ? 'status-bar__stat-val--red' : ''}`}>{objectionsCount}</span>
        </span>
        <span className="status-bar__divider">·</span>
        <span className="status-bar__stat">
          {t.liveCall.closeProb} <span className={`status-bar__stat-val status-bar__stat-val--${probLevel}`} aria-label={`${closeProbability} percent, ${probLevel}`}>{closeProbability}%</span>
        </span>
      </div>
    </div>
  );
}
