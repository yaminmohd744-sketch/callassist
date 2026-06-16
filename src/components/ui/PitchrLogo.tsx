import { useId } from 'react';
import './PitchrLogo.css';

interface PitchrLogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export function PitchrLogo({ size = 'md', iconOnly = false }: PitchrLogoProps) {
  const uid = useId();
  const gId = `plg-${uid.replace(/:/g, '')}`;
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 34 : 26;

  const stopLightA = `#333333`;
  const stopLightB = `#000000`;
  const stopDarkA  = `#aaaaaa`;
  const stopDarkB  = `#ffffff`;

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pitchr-logo__icon"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${gId}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stopLightA} />
          <stop offset="100%" stopColor={stopLightB} />
        </linearGradient>
        <linearGradient id={`${gId}-dark`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stopDarkA} />
          <stop offset="100%" stopColor={stopDarkB} />
        </linearGradient>
        <style>{`
          .pitchr-logo__icon .logo-bg   { fill: #111111; }
          .pitchr-logo__icon .logo-mark { fill: url(#${gId}-light); }
          [data-theme="dark"] .pitchr-logo__icon .logo-bg   { fill: #f0f0f0; }
          [data-theme="dark"] .pitchr-logo__icon .logo-mark { fill: url(#${gId}-dark); }
        `}</style>
      </defs>
      <rect className="logo-bg" width="100" height="100" rx="22" />
      <path
        className="logo-mark"
        fillRule="evenodd"
        d="M 26 22 Q 26 14 32 14 L 54 14 C 78 14 78 62 54 62 L 44 62 L 44 82 Q 44 88 37 88 Q 26 88 26 82 Z M 44 28 L 53 28 C 65 28 65 50 53 50 L 44 50 Z"
      />
    </svg>
  );

  if (iconOnly) {
    return <div className={`pitchr-logo pitchr-logo--${size}`}>{icon}</div>;
  }

  return (
    <div className={`pitchr-logo pitchr-logo--${size}`}>
      <span className="pitchr-logo__word">PITCHR</span>
    </div>
  );
}
