
import './ProbabilityMeter.css';

interface ProbabilityMeterProps {
  value: number;
}

export function ProbabilityMeter({ value }: ProbabilityMeterProps) {
  const level = value >= 61 ? 'high' : value >= 31 ? 'medium' : 'low';

  return (
    <div className="prob-meter">
      <div className="prob-meter__label">
        <span>CLOSE PROB</span>
        <span className={`prob-meter__value prob-meter__value--${level}`}>{value}%</span>
      </div>
      <div className="prob-meter__track">
        <div
          className={`prob-meter__fill prob-meter__fill--${level}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
