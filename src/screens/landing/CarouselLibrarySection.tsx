import { useState, useEffect, useCallback, useRef } from 'react';
import './CarouselLibrarySection.css';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface SlideItem {
  icon?: string;
  text: string;
  sub?: string;
}

interface Slide {
  bg: 'black' | 'surface' | 'elevated' | 'grad' | 'purple-dark';
  label?: string;
  labelVariant?: 'default' | 'red' | 'green' | 'white';
  num?: number;
  headline?: string;
  accentIdx?: number[];
  sub?: string;
  body?: string;
  stat?: { val: string; label: string };
  quote?: string;
  meaning?: string;
  response?: string;
  leftLabel?: string;
  leftText?: string;
  rightLabel?: string;
  rightText?: string;
  items?: SlideItem[];
  isCTA?: boolean;
  ctaHeadline?: string;
}

interface Carousel {
  id: string;
  num: string;
  title: string;
  category: string;
  persona: string;
  hookGoal: string;
  slideCount: number;
  slides: Slide[];
}

// ══════════════════════════════════════════════════════════════════════════════
// Carousel Data
// ══════════════════════════════════════════════════════════════════════════════

const CAROUSELS: Carousel[] = [
  {
    id: 'c01',
    num: '01',
    title: '5 Mistakes Killing Your Deals in Real-Time',
    category: 'Tactical',
    persona: 'SDR / AE',
    hookGoal: 'Educate sales reps + drive Pitchr signups',
    slideCount: 8,
    slides: [
      {
        bg: 'black',
        label: 'Sales Performance',
        headline: '5 mistakes\nkilling your deals\nin real-time',
        accentIdx: [1],
        sub: 'And what top closers do instead.',
      },
      {
        bg: 'surface',
        num: 1,
        stat: {
          val: '67%',
          label: "Average reps talk 67% of every call.\nTop closers talk 43%.\n\nYou're pitching when you should be listening.",
        },
      },
      {
        bg: 'black',
        num: 2,
        headline: 'You miss the signal\nwhen it matters most',
        body: '"Can we loop in our CFO?" is not a blocker.\nThat\'s your green flag.\n\nMost reps respond by pitching harder — and lose the deal.',
      },
      {
        bg: 'surface',
        num: 3,
        quote: '"I\'ll think about it."',
        meaning: "You didn't address my real concern. I'm not saying no — I'm waiting for you to dig.",
        response: '"What\'s the one thing you\'d need to feel confident moving forward?"',
      },
      {
        bg: 'black',
        num: 4,
        headline: 'You break the silence\ntoo soon',
        body: "After a close attempt, silence feels like 7 minutes. It's 7 seconds.\n\nThe next person to speak loses.\nStay quiet.",
      },
      {
        bg: 'surface',
        num: 5,
        stat: {
          val: '82%',
          label: "of lost deals could've been saved with better in-call adjustments.\n\nThe problem isn't your pitch — it's your read.",
        },
      },
      {
        bg: 'purple-dark',
        headline: 'What if your coach\nwas live on every call?',
        body: 'Pitchr listens in real-time. It spots objections, flags buying signals, and tells you exactly what to say — before the moment passes.',
      },
      {
        bg: 'grad',
        isCTA: true,
        ctaHeadline: 'Close more.\nGuess less.',
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Font injection — loads Syne + Figtree + Fragment Mono once
// ══════════════════════════════════════════════════════════════════════════════

let _fontsInjected = false;
function injectFonts() {
  if (_fontsInjected || document.getElementById('pitchr-carousel-fonts')) return;
  _fontsInjected = true;
  const l = document.createElement('link');
  l.id = 'pitchr-carousel-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Fragment+Mono:ital@0;1&display=swap';
  document.head.appendChild(l);
}

// ══════════════════════════════════════════════════════════════════════════════
// Brand palette
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  black:     '#05030f',
  surface:   '#0a0714',
  elevated:  '#100c1e',
  purple:    '#7c3aed',
  magenta:   '#c026d3',
  nearWhite: '#f0ebff',
  white:     '#ffffff',
  green:     '#22c55e',
  red:       '#ef4444',
  grad:      'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
  gradDark:  'linear-gradient(135deg, #05030f 0%, #2d1561 50%, #7c3aed 100%)',
};

// ══════════════════════════════════════════════════════════════════════════════
// getBg helper
// ══════════════════════════════════════════════════════════════════════════════

function getBg(bg: Slide['bg']): string {
  switch (bg) {
    case 'black':       return C.black;
    case 'surface':     return C.surface;
    case 'elevated':    return C.elevated;
    case 'grad':        return C.grad;
    case 'purple-dark': return C.gradDark;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Slide primitives (all sized for 1080×1080 canvas)
// ══════════════════════════════════════════════════════════════════════════════

// Inline gradient text span
function G({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: C.grad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>{children}</span>
  );
}

// Big decorative ambient glow blob
function Glow({ x, y, size = 480, color = C.purple, opacity = 0.28 }: {
  x: string; y: string; size?: number; color?: string; opacity?: number;
}) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${size * 0.25}px)`, opacity,
      left: x, top: y, pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

// Tag pill label
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '12px 28px', borderRadius: '100px',
      fontFamily: "'Figtree', sans-serif", fontSize: '20px', fontWeight: 700,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color: C.magenta,
      background: 'rgba(124,58,237,0.15)',
      border: '1px solid rgba(124,58,237,0.35)',
      width: 'fit-content', zIndex: 1,
    }}>{children}</div>
  );
}

// Number badge circle
function NumBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: '72px', height: '72px', borderRadius: '50%',
      background: C.grad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800,
      color: C.white, flexShrink: 0, zIndex: 1,
    }}>{n}</div>
  );
}

// Gradient divider bar
function Divider() {
  return <div style={{ width: '72px', height: '5px', borderRadius: '3px', background: C.grad, zIndex: 1 }} />;
}

// Dark card container
function Card({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'purple' | 'mono' | 'red' | 'green' }) {
  const borderColor = {
    default: 'rgba(255,255,255,0.07)',
    purple:  'rgba(124,58,237,0.4)',
    mono:    'rgba(255,255,255,0.06)',
    red:     'rgba(255,68,68,0.35)',
    green:   'rgba(57,211,83,0.35)',
  }[variant];
  const bg = {
    default: 'rgba(255,255,255,0.04)',
    purple:  'rgba(124,58,237,0.14)',
    mono:    'rgba(255,255,255,0.03)',
    red:     'rgba(255,68,68,0.08)',
    green:   'rgba(57,211,83,0.08)',
  }[variant];
  return (
    <div style={{
      background: bg, border: `1px solid ${borderColor}`,
      borderRadius: '24px', padding: '32px 40px', zIndex: 1,
    }}>{children}</div>
  );
}

// Card section label (THEY SAY / SAY THIS etc.)
function CardLabel({ children, color = C.magenta }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: "'Figtree', sans-serif", fontSize: '16px', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color, marginBottom: '14px', zIndex: 1,
    }}>{children}</div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Master SlideCard — 1080×1080 scaled to container
// ══════════════════════════════════════════════════════════════════════════════

function SlideCard({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    injectFonts();
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 1080);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isGrad    = slide.bg === 'grad' || slide.bg === 'purple-dark';
  const textPrimary = C.nearWhite;
  const textMuted   = 'rgba(240,235,255,0.55)';
  const textBody    = isGrad ? 'rgba(255,255,255,0.82)' : 'rgba(240,235,255,0.72)';

  // Shared root canvas
  const root: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0,
    width: '1080px', height: '1080px',
    background: getBg(slide.bg),
    padding: '80px',
    boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
  };

  // Brand mark — top right on every slide
  const brand = (
    <div style={{
      position: 'absolute', top: '56px', right: '72px',
      fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '28px',
      letterSpacing: '-0.02em', zIndex: 2,
      ...(isGrad
        ? { color: 'rgba(255,255,255,0.35)' }
        : {
            background: C.grad,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }),
    }}>Pitchr</div>
  );

  // Slide number — bottom right on every slide
  const slideNum = (
    <div style={{
      position: 'absolute', bottom: '56px', right: '72px',
      fontFamily: "'Fragment Mono', monospace", fontSize: '20px',
      color: isGrad ? 'rgba(255,255,255,0.22)' : 'rgba(240,235,255,0.18)',
      zIndex: 2,
    }}>{index + 1} / {total}</div>
  );

  // ── CTA SLIDE ──────────────────────────────────────────────────────────────
  if (slide.isCTA) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={{ ...root, background: C.grad, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0' }}>
          {/* Radial overlay for depth */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 80%, rgba(0,0,0,0.3) 0%, transparent 65%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 55%)', zIndex: 0 }} />
          {brand}
          {slideNum}
          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px' }}>
            <div style={{
              fontFamily: "'Figtree', sans-serif", fontSize: '20px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}>Start your free trial</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: '76px', lineHeight: 1.05, letterSpacing: '-0.025em',
              color: C.white, maxWidth: '860px', textAlign: 'center',
            }}>{slide.ctaHeadline}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '24px 60px', borderRadius: '100px',
              background: C.white, color: C.purple,
              fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800,
              letterSpacing: '-0.01em', marginTop: '8px',
            }}>Try Pitchr Free →</div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '20px', color: 'rgba(255,255,255,0.45)' }}>pitchr.org</div>
          </div>
        </div>
      </div>
    );
  }

  // ── STAT SLIDE ─────────────────────────────────────────────────────────────
  if (slide.stat && !slide.headline) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-160px" y="-120px" size={520} color={C.purple} opacity={0.32} />
          <Glow x="680px" y="680px" size={400} color={C.magenta} opacity={0.18} />
          {brand}{slideNum}
          {/* Giant decorative quote or symbol */}
          <div style={{
            position: 'absolute', bottom: '60px', left: '72px',
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: '320px', lineHeight: 1, opacity: 0.04,
            color: C.white, userSelect: 'none', zIndex: 0,
          }}>%</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '20px' }}>
            <Divider />
            <div style={{
              fontFamily: "'Fragment Mono', monospace", fontWeight: 400,
              fontSize: '148px', lineHeight: 1, letterSpacing: '-0.03em',
              background: C.grad,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{slide.stat.val}</div>
            <div style={{
              fontFamily: "'Figtree', sans-serif", fontSize: '30px', fontWeight: 500,
              lineHeight: 1.5, color: textBody, maxWidth: '780px',
              whiteSpace: 'pre-line',
            }}>{slide.stat.label}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── STAT + HEADLINE COMBO ──────────────────────────────────────────────────
  if (slide.stat && slide.headline) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-100px" y="-100px" size={500} color={C.purple} opacity={0.28} />
          {brand}{slideNum}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '16px' }}>
            <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '22px', fontWeight: 600, color: textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{slide.headline}</div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace", fontSize: '112px', lineHeight: 1,
              background: C.grad, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}>{slide.stat.val}</div>
            <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 500, color: textBody, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{slide.stat.label}</div>
            {slide.body && <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '24px', color: textMuted, lineHeight: 1.5, marginTop: '8px', whiteSpace: 'pre-line' }}>{slide.body}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ── QUOTE / MEANING / RESPONSE ─────────────────────────────────────────────
  if (slide.quote) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-120px" y="-80px" size={440} color={C.purple} opacity={0.22} />
          {brand}{slideNum}
          {slide.num !== undefined && <NumBadge n={slide.num} />}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '20px', marginTop: slide.num !== undefined ? '24px' : 0 }}>
            {/* They Say card */}
            <Card variant="mono">
              <CardLabel color="rgba(240,235,255,0.38)">They say</CardLabel>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '38px', lineHeight: 1.25, color: textPrimary,
                fontStyle: 'italic',
              }}>{slide.quote}</div>
            </Card>
            {/* They Mean */}
            {slide.meaning && (
              <Card variant="default">
                <CardLabel color="rgba(240,235,255,0.38)">They mean</CardLabel>
                <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '26px', lineHeight: 1.5, color: textBody }}>{slide.meaning}</div>
              </Card>
            )}
            {/* Say This */}
            {slide.response && (
              <Card variant="purple">
                <CardLabel color={C.magenta}>Say this instead</CardLabel>
                <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '26px', lineHeight: 1.5, color: textPrimary, fontWeight: 500 }}>{slide.response}</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SPLIT COLUMNS (left/right comparison) ──────────────────────────────────
  if (slide.leftLabel) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-100px" y="-80px" size={440} color={C.purple} opacity={0.2} />
          {brand}{slideNum}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '32px' }}>
            {slide.headline && (
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '52px', lineHeight: 1.1, color: textPrimary, letterSpacing: '-0.02em' }}>
                {slide.headline}
              </div>
            )}
            <div style={{ display: 'flex', gap: '24px' }}>
              <Card variant="red">
                <CardLabel color={C.red}>{slide.leftLabel}</CardLabel>
                <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 600, color: textPrimary, lineHeight: 1.35 }}>{slide.leftText}</div>
              </Card>
              <Card variant="green">
                <CardLabel color={C.green}>{slide.rightLabel}</CardLabel>
                <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 600, color: textPrimary, lineHeight: 1.35 }}>{slide.rightText}</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ITEMS LIST ─────────────────────────────────────────────────────────────
  if (slide.items && !slide.quote && !slide.leftLabel) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-100px" y="-80px" size={440} color={C.purple} opacity={0.22} />
          {brand}{slideNum}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '24px' }}>
            {slide.headline && (
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '56px', lineHeight: 1.1, letterSpacing: '-0.02em', color: textPrimary, marginBottom: '8px' }}>
                {slide.headline}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {slide.items.map((item, i) => (
                <Card key={i} variant="default">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {item.icon && (
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>{item.icon}</div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '26px', fontWeight: 700, color: textPrimary, lineHeight: 1.3 }}>{item.text}</div>
                      {item.sub && <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '20px', color: textMuted, marginTop: '4px' }}>{item.sub}</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STANDARD HEADLINE + BODY ───────────────────────────────────────────────
  return (
    <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
      <div style={root}>
        <Glow x="-140px" y="-100px" size={520} color={C.purple} opacity={isGrad ? 0 : 0.26} />
        {slide.bg === 'black' && <Glow x="640px" y="700px" size={380} color={C.magenta} opacity={0.14} />}
        {brand}{slideNum}

        {slide.num !== undefined && <NumBadge n={slide.num} />}
        {slide.label && !slide.num && <Tag>{slide.label}</Tag>}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '28px', marginTop: (slide.num !== undefined || slide.label) ? '32px' : 0 }}>
          <Divider />
          {/* Headline — key words wrapped in G() for gradient */}
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: slide.body ? '72px' : '88px',
            lineHeight: 1.05, letterSpacing: '-0.025em',
            color: isGrad ? C.white : textPrimary,
            whiteSpace: 'pre-line',
          }}>
            {slide.headline && (() => {
              const words = slide.headline.split(' ');
              const accents = new Set(slide.accentIdx ?? []);
              return words.map((w, wi) => (
                <span key={wi}>{wi > 0 && ' '}
                  {accents.has(wi) ? <G>{w}</G> : w}
                </span>
              ));
            })()}
          </div>

          {/* Sub-text / italic */}
          {slide.sub && !slide.body && (
            <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontStyle: 'italic', color: isGrad ? 'rgba(255,255,255,0.6)' : C.magenta, lineHeight: 1.5 }}>{slide.sub}</div>
          )}

          {/* Body */}
          {slide.body && (
            <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 500, color: textBody, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{slide.body}</div>
          )}

          {slide.body && slide.sub && (
            <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: '22px', fontStyle: 'italic', color: textMuted, lineHeight: 1.5 }}>{slide.sub}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Download helpers (loaded from CDN)
// ══════════════════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    html2canvas?: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
    JSZip?: new () => {
      file: (name: string, data: Blob) => void;
      generateAsync: (opts: { type: string }) => Promise<Blob>;
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureLibs() {
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
  ]);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ══════════════════════════════════════════════════════════════════════════════
// Modal component
// ══════════════════════════════════════════════════════════════════════════════

interface ModalProps {
  carousel: Carousel;
  onClose: () => void;
}

function CarouselModal({ carousel, onClose }: ModalProps) {
  const [idx, setIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const total = carousel.slides.length;

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function downloadOne() {
    if (!slideRef.current || !window.html2canvas) return;
    setDownloading(true);
    try {
      await ensureLibs();
      const canvas = await window.html2canvas!(slideRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      canvas.toBlob(blob => {
        if (blob) downloadBlob(blob, `pitchr-${carousel.num}-slide${idx + 1}.png`);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }

  async function downloadAll() {
    setDownloading(true);
    try {
      await ensureLibs();
      if (!window.html2canvas || !window.JSZip) return;
      const zip = new window.JSZip!();
      for (let i = 0; i < total; i++) {
        setIdx(i);
        await new Promise(r => setTimeout(r, 150)); // let React paint
        if (!slideRef.current) continue;
        const canvas = await window.html2canvas!(slideRef.current, { scale: 2, useCORS: true, backgroundColor: null });
        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob as Blob, `pitchr-carousel-${carousel.num}.zip`);
    } finally {
      setDownloading(false);
    }
  }

  const slide = carousel.slides[idx];

  return (
    <div className="cl-modal" role="dialog" aria-modal="true">
      {/* Toolbar */}
      <div className="cl-modal__toolbar">
        <div className="cl-modal__toolbar-left">
          <div className="cl-modal__toolbar-cat">{carousel.category} · {carousel.persona}</div>
          <div className="cl-modal__toolbar-title">{carousel.num}. {carousel.title}</div>
        </div>
        <div className="cl-modal__toolbar-right">
          <button className="cl-modal__dl-btn" onClick={downloadOne} disabled={downloading}>
            ⬇ This Slide
          </button>
          <button className="cl-modal__dl-btn" onClick={downloadAll} disabled={downloading}>
            ⬇ All (ZIP)
          </button>
          <button className="cl-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>

      {/* Body */}
      <div className="cl-modal__body">
        <button className="cl-modal__nav cl-modal__nav--prev" onClick={prev} aria-label="Previous slide">‹</button>

        <div className="cl-modal__slide-wrap">
          <div className="carousel-slide-export" ref={slideRef}>
            <SlideCard slide={slide} index={idx} total={total} />
          </div>
        </div>

        <button className="cl-modal__nav cl-modal__nav--next" onClick={next} aria-label="Next slide">›</button>
      </div>

      {/* Footer */}
      <div className="cl-modal__footer">
        <div className="cl-modal__counter">{idx + 1} / {total}</div>
        <div className="cl-modal__dots">
          {carousel.slides.map((_, i) => (
            <button
              key={i}
              className={`cl-modal__dot${i === idx ? ' cl-modal__dot--active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Gallery Section
// ══════════════════════════════════════════════════════════════════════════════

export function CarouselLibrarySection() {
  const [openCarousel, setOpenCarousel] = useState<Carousel | null>(null);
  const carousel = CAROUSELS[0];

  return (
    <>
      <section id="carousels" className="cl-section">
        <div className="cl-section__inner">
          <div className="cl-section__label">FREE CONTENT</div>
          <h2 className="cl-section__h2">Download the carousel</h2>
          <p className="cl-section__sub">A premium Instagram carousel for sales teams — free to post.</p>

          <div className="cl-hero-card" onClick={() => setOpenCarousel(carousel)}>
            <div className="cl-hero-card__preview">
              <SlideCard slide={carousel.slides[0]} index={0} total={carousel.slides.length} />
            </div>
            <div className="cl-hero-card__info">
              <div className="cl-card__cat">{carousel.category}</div>
              <h3 className="cl-hero-card__title">{carousel.title}</h3>
              <p className="cl-hero-card__desc">
                {carousel.slides.length} slides designed for Instagram. Preview every slide in the viewer, then download as PNG files ready to post.
              </p>
              <div className="cl-hero-card__meta">{carousel.persona} · {carousel.slides.length} slides</div>
              <button
                className="cl-hero-card__btn"
                onClick={e => { e.stopPropagation(); setOpenCarousel(carousel); }}
              >
                Preview &amp; Download →
              </button>
            </div>
          </div>
        </div>
      </section>

      {openCarousel && (
        <CarouselModal carousel={openCarousel} onClose={() => setOpenCarousel(null)} />
      )}
    </>
  );
}
