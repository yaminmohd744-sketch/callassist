import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppShell } from '../components/layout/AppShell';
import { DashboardScreen } from './DashboardScreen';
import './DashboardSlide.css';

// ── Mock context ──────────────────────────────────────────────────────────────

const MOCK_CTX = {
  appLanguage: 'en-US' as const,
  onChangeLanguage: () => {},
  currentLangLabel: 'English',
  userName: 'yamin',
  userEmail: 'yamin@pitchr.org',
  profilePic: null,
  onProfilePicChange: () => {},
  onProfilePicError: () => {},
  totalCallSeconds: 9_432,
  totalCallCount: 8,
};

// ── Step definitions ──────────────────────────────────────────────────────────

interface Annotation {
  label: string;
  body: string;
  side: 'top' | 'bottom' | 'left' | 'right';
}

interface Step {
  // CSS selector for the element to spotlight (null = overview, no ring)
  selector: string | null;
  // Where within the element to place the cursor, as fraction [0..1] of element size
  cursorAt: { dx: number; dy: number } | null;
  annotation: Annotation | null;
  click?: boolean;
  ms: number;
}

const STEPS: Step[] = [
  {
    selector: null,
    cursorAt: null,
    annotation: null,
    ms: 1100,
  },
  {
    // New Call button in the top nav
    selector: '.app-shell__topnav',
    cursorAt: { dx: 0.91, dy: 0.5 },
    annotation: {
      label: 'ONE-CLICK CALL LAUNCH',
      body: 'Hit New Call — Pitchr opens your pre-call brief and activates AI coaching the moment the prospect picks up.',
      side: 'bottom',
    },
    click: true,
    ms: 3600,
  },
  {
    // Stats row
    selector: '.dashboard__stats',
    cursorAt: { dx: 0.3, dy: 0.5 },
    annotation: {
      label: 'AUTO-TRACKED METRICS',
      body: 'Total calls, avg close %, objections, duration, and streak — updated automatically after every call. Zero manual entry.',
      side: 'bottom',
    },
    ms: 3600,
  },
  {
    // Streak stat card (last card)
    selector: '.dashboard__stat-card:last-child',
    cursorAt: { dx: 0.5, dy: 0.5 },
    annotation: {
      label: 'PRACTICE STREAK',
      body: 'Daily streaks build the habits that separate top performers. Pitchr tracks every day you make a call.',
      side: 'bottom',
    },
    ms: 3600,
  },
  {
    // Call list
    selector: '.dashboard__call-list',
    cursorAt: { dx: 0.5, dy: 0.25 },
    annotation: {
      label: 'AUTO-SAVED CALL HISTORY',
      body: 'Every session saved with full transcript, AI coaching summary, lead score, and a ready-to-send follow-up email.',
      side: 'right',
    },
    ms: 3600,
  },
  {
    // First call row
    selector: '.dashboard__call-row:first-child',
    cursorAt: { dx: 0.96, dy: 0.5 },
    annotation: {
      label: 'CLICK TO REVIEW',
      body: 'Open any call for the full post-call breakdown — AI coaching notes, scorecard, transcript, and follow-up email.',
      side: 'top',
    },
    ms: 3600,
  },
];

// ── Ring & cursor state ───────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number; }

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardSlide() {
  const [stepIdx, setStepIdx]     = useState(0);
  const [ring, setRing]           = useState<Rect | null>(null);
  const [cursorPx, setCursorPx]   = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [cursorReady, setCursorReady] = useState(false);
  const [clicking, setClicking]   = useState(false);
  const [annKey, setAnnKey]       = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure real DOM element positions
  const measure = useCallback((idx: number) => {
    const step = STEPS[idx];
    const frame = frameRef.current;
    if (!frame) return;

    if (!step.selector) {
      setRing(null);
      // Cursor parks at center of frame
      const fr = frame.getBoundingClientRect();
      setCursorPx({ top: fr.height * 0.48, left: fr.width * 0.57 });
      setCursorReady(true);
      return;
    }

    const el = frame.querySelector(step.selector) as HTMLElement | null;
    if (!el) return;

    const fr  = frame.getBoundingClientRect();
    const er  = el.getBoundingClientRect();
    const r: Rect = {
      top:    er.top    - fr.top,
      left:   er.left   - fr.left,
      width:  er.width,
      height: er.height,
    };
    setRing(r);

    const { dx = 0.5, dy = 0.5 } = step.cursorAt ?? {};
    setCursorPx({
      top:  r.top  + r.height * dy,
      left: r.left + r.width  * dx,
    });
    setCursorReady(true);
  }, []);

  // Re-measure after render when step changes
  useLayoutEffect(() => {
    // Small delay so AppShell finishes painting
    const t = setTimeout(() => measure(stepIdx), 80);
    return () => clearTimeout(t);
  }, [stepIdx, measure]);

  // Auto-advance
  const advance = useCallback((from: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = (from + 1) % STEPS.length;
      setStepIdx(next);
      setAnnKey(k => k + 1);
      setClicking(false);
      if (STEPS[next].click) {
        setTimeout(() => setClicking(true),  650);
        setTimeout(() => setClicking(false), 950);
      }
    }, STEPS[from].ms);
  }, []);

  useEffect(() => {
    advance(stepIdx);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stepIdx, advance]);

  function goStep(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClicking(false);
    setStepIdx(i);
    setAnnKey(k => k + 1);
  }

  const step = STEPS[stepIdx];
  const ann  = step.annotation;
  const hasRing = ring !== null;

  // Annotation position: attach to the correct side of the ring
  function annStyle(): React.CSSProperties {
    if (!ring || !ann) return {};
    const PAD = 12;
    switch (ann.side) {
      case 'bottom': return { top: ring.top + ring.height + PAD, left: ring.left + ring.width * 0.5, transform: 'translateX(-50%)' };
      case 'top':    return { top: ring.top - PAD, left: ring.left + ring.width * 0.5, transform: 'translate(-50%, -100%)' };
      case 'right':  return { top: ring.top + ring.height * 0.15, left: ring.left + ring.width + PAD };
      case 'left':   return { top: ring.top + ring.height * 0.15, left: ring.left - PAD, transform: 'translateX(-100%)' };
    }
  }

  return (
    <AppContext.Provider value={MOCK_CTX}>
      <div className="ds2">

        {/* The real app — AppShell + Dashboard */}
        <div className="ds2__frame" ref={frameRef}>

          <AppShell
            activeScreen="dashboard"
            onNavigate={() => {}}
            onStartCall={() => {}}
            onUploadCall={() => {}}
            onSignOut={() => {}}
          >
            <DashboardScreen
              pastSessions={[]}
              onStartCall={() => {}}
              onUploadCall={() => {}}
              onViewSession={() => {}}
              onDeleteSession={() => {}}
              userName="yamin"
              learningLog={[]}
            />
          </AppShell>

          {/* ── Overlay layer ── */}
          <div className={`ds2__overlay${hasRing ? ' ds2__overlay--active' : ''}`} />

          {/* ── Spotlight ring ── */}
          {ring && (
            <div
              key={`ring-${stepIdx}`}
              className="ds2__ring"
              style={{
                top:    ring.top,
                left:   ring.left,
                width:  ring.width,
                height: ring.height,
              }}
            />
          )}

          {/* ── Annotation card ── */}
          {ann && ring && (
            <div key={annKey} className={`ds2__ann ds2__ann--${ann.side}`} style={annStyle()}>
              <div className="ds2__ann-label">{ann.label}</div>
              <div className="ds2__ann-body">{ann.body}</div>
            </div>
          )}

          {/* ── Cursor ── */}
          {cursorReady && (
            <div
              className={`ds2__cursor${clicking ? ' ds2__cursor--clicking' : ''}`}
              style={{ top: cursorPx.top, left: cursorPx.left }}
            />
          )}

        </div>

        {/* ── Step nav ── */}
        <div className="ds2__nav">
          <button className="ds2__nav-btn" onClick={() => goStep((stepIdx - 1 + STEPS.length) % STEPS.length)}>← PREV</button>
          <div className="ds2__nav-dots">
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`ds2__nav-dot${i === stepIdx ? ' ds2__nav-dot--active' : ''}`}
                onClick={() => goStep(i)}
              />
            ))}
          </div>
          <button className="ds2__nav-btn" onClick={() => goStep((stepIdx + 1) % STEPS.length)}>NEXT →</button>
        </div>

      </div>
    </AppContext.Provider>
  );
}
