import { useId } from 'react';
import type { CSSProperties } from 'react';

interface Props {
  tierId: string;
  color: string;
  size?: number;
  unlocked?: boolean;
}

interface B { c: string; dim: number; id: string; }

function Glow({ id, color, blur = 3 }: { id: string; color: string; blur?: number }) {
  return (
    <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation={blur} floodColor={color} floodOpacity="0.8" />
    </filter>
  );
}

/* ── ROOKIE – Pentagon shield ─────────────────────────────────── */
function Rookie({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={2} />
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.95" />
          <stop offset="100%" stopColor={c} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`gh-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Shield body */}
      <path d="M24 4L40 11V29C40 38.5 24 45 24 45C24 45 8 38.5 8 29V11Z"
        fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Top facet highlight */}
      <path d="M24 4L40 11L24 16L8 11Z" fill={`url(#gh-${id})`} />
      {/* Inner shield */}
      <path d="M24 10L34 15V28C34 35 24 40 24 40C24 40 14 35 14 28V15Z"
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Center seam lines */}
      <path d="M24 16V38M14 15L24 20L34 15" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Shine */}
      <path d="M16 12L25 8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center plus */}
      <path d="M24 22V30M20 26H28" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── PROSPECT HUNTER – Diamond crosshair ────────────────────── */
function ProspectHunter({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={2} />
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.95" />
          <stop offset="100%" stopColor={c} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`gh-${id}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Outer diamond */}
      <path d="M24 4L44 24L24 44L4 24Z" fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Top-left facet highlight */}
      <path d="M24 4L44 24L24 18L4 24Z" fill={`url(#gh-${id})`} />
      {/* Inner diamond */}
      <path d="M24 12L36 24L24 36L12 24Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Facet lines */}
      <path d="M24 4L24 18M4 24L12 24M36 24L44 24M24 36L24 44" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Crosshair */}
      <circle cx="24" cy="24" r="5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      <path d="M24 16V20M24 28V32M16 24H20M28 24H32" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Shine */}
      <path d="M13 13L21 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── POWER DIALER – Lightning bolt in starburst ─────────────── */
function PowerDialer({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={3} />
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="1" />
          <stop offset="100%" stopColor={c} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`gh-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* 8-point starburst */}
      <path d="M24 3L27.5 16H40.5L30 24L34 37L24 29.5L14 37L18 24L7.5 16H20.5Z"
        fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Top-left highlight */}
      <path d="M24 3L27.5 16H20.5L7.5 16L24 12Z" fill={`url(#gh-${id})`} />
      {/* Inner star lines */}
      <path d="M24 3L24 29.5M7.5 16L30 24M40.5 16L18 24M14 37L30 24M34 37L18 24"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Lightning bolt */}
      <path d="M27 11L19 25.5H25.5L21 37L29 22.5H22.5Z" fill="rgba(255,255,255,0.92)" />
    </svg>
  );
}

/* ── COLD CLOSER – Hexagonal ice crystal ─────────────────────── */
function ColdCloser({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={3} />
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`gh-${id}`} x1="0" y1="0" x2="0.8" y2="0.5">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Hexagon base */}
      <path d="M24 5L39 13.5V30.5L24 39L9 30.5V13.5Z"
        fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Top highlight */}
      <path d="M24 5L39 13.5L24 18L9 13.5Z" fill={`url(#gh-${id})`} />
      {/* Snowflake arms */}
      <path d="M24 8V40M8.5 16L39.5 28M39.5 16L8.5 28" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Inner hexagon */}
      <path d="M24 17L31 21V29L24 33L17 29V21Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      {/* Arm tip diamonds */}
      <path d="M24 5L25.5 8L24 11L22.5 8Z" fill="rgba(255,255,255,0.9)" />
      <path d="M24 37L25.5 40L24 43L22.5 40Z" fill="rgba(255,255,255,0.9)" />
      <path d="M8.5 16L10.5 17.2L10.5 14.8Z" fill="rgba(255,255,255,0.9)" />
      <path d="M39.5 28L37.5 26.8L37.5 29.2Z" fill="rgba(255,255,255,0.9)" />
      {/* Center */}
      <circle cx="24" cy="25" r="2.5" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

/* ── SALES PRO – Faceted octagon gem ─────────────────────────── */
function SalesPro({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={3} />
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="1" />
          <stop offset="100%" stopColor={c} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`gt-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
        <linearGradient id={`gm-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Octagon */}
      <path d="M16 5H32L43 16V32L32 43H16L5 32V16Z"
        fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Top-left facet – highlight */}
      <path d="M16 5H32L38 11L24 19L10 11Z" fill={`url(#gt-${id})`} />
      {/* Mid facets */}
      <path d="M10 11L24 19L38 11" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M5 16L10 11M5 32L10 37M43 16L38 11M43 32L38 37M16 43L10 37M32 43L38 37" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <path d="M10 11L10 37M38 11L38 37M24 19L24 37" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M10 37L24 29L38 37" fill={`url(#gm-${id})`} />
      {/* Center hexagon ring */}
      <path d="M24 15L31.5 19V27L24 31L16.5 27V19Z" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      {/* Center dot */}
      <circle cx="24" cy="23" r="2.5" fill="rgba(255,255,255,0.85)" />
      {/* Shine line */}
      <path d="M14 12L21 8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── ELITE CLOSER – LoL-inspired crystal ─────────────────────── */
function EliteCloser({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={4} />
        <linearGradient id={`gg-${id}`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="30%" stopColor={c} stopOpacity="1" />
          <stop offset="100%" stopColor={c} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`ginner-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Outer spiky crystal – 4-pointed star with extra side notches */}
      <path d="M24 2L29 17L44 17L33 26L37 41L24 33L11 41L15 26L4 17L19 17Z"
        fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Crystal facet lines */}
      <path d="M24 2L19 17L24 26L29 17Z" fill={`url(#ginner-${id})`} />
      <path d="M24 2L19 17M24 2L29 17" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <path d="M4 17L19 17L24 26L15 26ZM44 17L29 17L24 26L33 26Z" fill="rgba(255,255,255,0.08)" />
      <path d="M4 17L19 17M29 17L44 17M15 26L24 33M33 26L24 33" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M11 41L15 26L24 33L13 38ZM37 41L33 26L24 33L35 38Z" fill="rgba(255,255,255,0.05)" />
      {/* Inner diamond */}
      <path d="M24 13L31 22L24 31L17 22Z" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {/* Core crystal */}
      <path d="M24 17L28 22L24 27L20 22Z" fill="rgba(255,255,255,0.6)" />
      {/* Top shine */}
      <path d="M20 7L27 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── LEGEND – Crown with gems ────────────────────────────────── */
function Legend({ c, dim, id }: B) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none">
      <defs>
        <Glow id={`gf-${id}`} color={c} blur={4} />
        <linearGradient id={`gg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="1" />
          <stop offset="100%" stopColor={c} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`gh-${id}`} x1="0" y1="0" x2="0.7" y2="0.5">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id={`gb-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Crown body */}
      <path d="M6 34L10 15L18 27L24 9L30 27L38 15L42 34Z"
        fill={`url(#gg-${id})`} filter={`url(#gf-${id})`} />
      {/* Crown highlight – left half */}
      <path d="M6 34L10 15L18 27L24 9L24 20Z" fill={`url(#gh-${id})`} />
      {/* Crown base band */}
      <rect x="6" y="34" width="36" height="7" rx="2" fill={`url(#gb-${id})`} filter={`url(#gf-${id})`} />
      {/* Band highlight */}
      <rect x="6" y="34" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      {/* Facet lines on crown */}
      <path d="M6 34L10 15M42 34L38 15M24 9V34M10 15L18 27M38 15L30 27M18 27L24 20M30 27L24 20"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Crown tip gems */}
      <circle cx="24" cy="9" r="3.5" fill="rgba(255,255,255,0.95)" />
      <circle cx="10" cy="15" r="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="38" cy="15" r="2.5" fill="rgba(255,255,255,0.85)" />
      {/* Band gem */}
      <circle cx="24" cy="37.5" r="2" fill="rgba(255,255,255,0.9)" />
      {/* Top gem inner sparkle */}
      <path d="M24 7L24.8 9L24 11L23.2 9Z" fill={c} opacity="0.6" />
      {/* Shine */}
      <path d="M13 17L19 12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TierBadge({ tierId, color, size = 48, unlocked = true }: Props) {
  const uid = useId();
  const id = `tb-${tierId}-${uid.replace(/:/g, '')}`;
  const lockedStyle: CSSProperties = { filter: 'grayscale(1) brightness(0.4)', opacity: 0.55 };
  const style = unlocked ? undefined : lockedStyle;
  const props = { c: color, dim: size, id };

  const badge = (() => {
    switch (tierId) {
      case 'rookie':          return <Rookie {...props} />;
      case 'prospect-hunter': return <ProspectHunter {...props} />;
      case 'power-dialer':    return <PowerDialer {...props} />;
      case 'cold-closer':     return <ColdCloser {...props} />;
      case 'sales-pro':       return <SalesPro {...props} />;
      case 'elite-closer':    return <EliteCloser {...props} />;
      case 'legend':          return <Legend {...props} />;
      default:                return null;
    }
  })();

  return style ? <span style={style}>{badge}</span> : <>{badge}</>;
}
