import { MILESTONES } from '../lib/milestones';
import { TierBadge } from './TierBadge';
import './TiersOverlay.css';

interface TiersOverlayProps {
  totalCalls: number;
  totalSessions: number;
  onClose: () => void;
}

export function TiersOverlay({ totalCalls, totalSessions, onClose }: TiersOverlayProps) {
  const ordered = [...MILESTONES].reverse();

  return (
    <div className="tiers-overlay" onClick={onClose}>
      <div className="tiers-panel" onClick={e => e.stopPropagation()}>

        <div className="tiers-header">
          <div className="tiers-title">Rank Tiers</div>
          <button className="tiers-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="tiers-subtitle">
          Unlock tiers by completing real calls <em>and</em> training sessions.
          Both must meet the threshold to advance.
        </p>

        <div className="tiers-list">
          {ordered.map((m) => {
            const unlocked = totalCalls >= m.minCalls && totalSessions >= m.minSessions;

            const callPct    = m.minCalls    > 0 ? Math.min(totalCalls    / m.minCalls,    1) : 1;
            const sessionPct = m.minSessions > 0 ? Math.min(totalSessions / m.minSessions, 1) : 1;
            const pct        = Math.round(Math.min(callPct, sessionPct) * 100);

            return (
              <div
                key={m.id}
                className={`tiers-card${unlocked ? ' tiers-card--unlocked' : ' tiers-card--locked'}`}
                style={unlocked ? { '--tier-color': m.color } as React.CSSProperties : undefined}
              >
                <div className="tiers-card__badge">
                  <TierBadge tierId={m.id} color={m.color} size={52} unlocked={unlocked} />
                </div>

                <div className="tiers-card__body">
                  <div className="tiers-card__label" style={unlocked ? { color: m.color } : undefined}>
                    {m.label}
                    {unlocked && <span className="tiers-card__unlocked-tag">Unlocked</span>}
                  </div>
                  <div className="tiers-card__desc">{m.description}</div>

                  <div className="tiers-card__reqs">
                    <span className={`tiers-card__req${totalCalls >= m.minCalls ? ' tiers-card__req--met' : ''}`}>
                      {totalCalls >= m.minCalls ? '✓' : '○'} {m.minCalls === 0 ? 'No calls required' : `${m.minCalls} calls`}
                    </span>
                    <span className={`tiers-card__req${totalSessions >= m.minSessions ? ' tiers-card__req--met' : ''}`}>
                      {totalSessions >= m.minSessions ? '✓' : '○'} {m.minSessions === 0 ? 'No sessions required' : `${m.minSessions} training sessions`}
                    </span>
                  </div>

                  {!unlocked && m.minCalls > 0 && (
                    <div className="tiers-card__progress">
                      <div className="tiers-card__progress-track">
                        <div
                          className="tiers-card__progress-fill"
                          style={{ width: `${pct}%`, background: m.color }}
                        />
                      </div>
                      <span className="tiers-card__progress-label">{pct}% there</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
