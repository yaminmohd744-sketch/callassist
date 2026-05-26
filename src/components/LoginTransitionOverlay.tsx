import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './LoginTransitionOverlay.css';

interface Props {
  userName: string;
  onDone: () => void;
}

export function LoginTransitionOverlay({ userName, onDone }: Props) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  // Ref so timers and event listeners always call the latest onDone
  // without re-registering when the parent re-renders with a new inline function.
  const onDoneRef = useRef(onDone);
  useLayoutEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2300);
    const t3 = setTimeout(() => onDoneRef.current(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Allow users to skip the overlay immediately with Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onDoneRef.current(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`lto lto--${phase}`} aria-hidden="true">
      <div className="lto__bg" />
      <div className="lto__grid" />
      <div className="lto__orbs">
        <div className="lto__orb lto__orb-a" />
        <div className="lto__orb lto__orb-b" />
        <div className="lto__orb lto__orb-c" />
      </div>
      <div className="lto__content">
        <div className="lto__logo">
          PITCHR
        </div>
        <div className="lto__welcome">
          Welcome back, <strong>{userName || 'there'}</strong>
        </div>
        <p className="lto__tagline">Your AI sales coach is ready</p>
        <div className="lto__progress">
          <div className="lto__progress-fill" />
        </div>
      </div>
    </div>
  );
}
