
import './ProbabilityMeter.css';

interface ProbabilityMeterProps {
  value: number;
}

const LEVEL_LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' } as const;

export function ProbabilityMeter({ value }: ProbabilityMeterProps) {
  const level = value >= 61 ? 'high' : value >= 31 ? 'medium' : 'low';

  return (
    <div className="prob-meter">
      <div className="prob-meter__label">
        <span>CLOSE PROB</span>
        <span className={`prob-meter__value prob-meter__value--${level}`}>
          {value}%{' '}
          <span className="prob-meter__level-badge">{LEVEL_LABEL[level]}</span>
        </span>
      </div>
      <div
        className="prob-meter__track"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Close probability ${value}%, ${LEVEL_LABEL[level]}`}
      >
        <div
          className={`prob-meter__fill prob-meter__fill--${level}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
