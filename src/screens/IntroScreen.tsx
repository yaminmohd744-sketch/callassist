import { useState, useEffect } from 'react';
import './IntroScreen.css';

interface IntroScreenProps {
  onDone: () => void;
}

type Phase = 'dark' | 'plus' | 'words' | 'tag' | 'exit';

const PITCH = ['P', 'I', 'T', 'C', 'H'];
const PLUS  = ['P', 'L', 'U', 'S'];

export function IntroScreen({ onDone }: IntroScreenProps) {
  const [phase, setPhase] = useState<Phase>('dark');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('plus'),  200);
    const t2 = setTimeout(() => setPhase('words'), 800);
    const t3 = setTimeout(() => setPhase('tag'),   2000);
    const t4 = setTimeout(() => setPhase('exit'),  3300);
    const t5 = setTimeout(onDone,                  4150);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onDone]);

  const wordsIn = phase === 'words' || phase === 'tag' || phase === 'exit';

  return (
    <div className={`intro${phase === 'exit' ? ' intro--exit' : ''}`}>
      <div className="intro__bg-grid" />
      <div className="intro__glow" />

      <div className="intro__center">

        {/* "+" laser-drawn bar by bar */}
        <div className={`intro__icon-wrap${phase !== 'dark' ? ' intro__icon-wrap--draw' : ''}`}>
          <div className="intro__icon">
            <div className="intro__icon-v" />
            <div className="intro__icon-h" />
          </div>
        </div>

        {/* Wordmark always correct, staggers in letter by letter */}
        <div className={`intro__wordmark${wordsIn ? ' intro__wordmark--visible' : ''}`}>
          <span className="intro__word">
            {PITCH.map((ch, i) => (
              <span
                key={i}
                className="intro__char intro__char--pitch"
                style={{ '--delay': `${i * 0.07}s` } as React.CSSProperties}
              >
                {ch}
              </span>
            ))}
          </span>
          <span className="intro__word">
            {PLUS.map((ch, i) => (
              <span
                key={i}
                className="intro__char intro__char--plus"
                style={{ '--delay': `${0.42 + i * 0.07}s` } as React.CSSProperties}
              >
                {ch}
              </span>
            ))}
          </span>
        </div>

        <p className={`intro__tagline${phase === 'tag' || phase === 'exit' ? ' intro__tagline--in' : ''}`}>
          Your AI sales coach.
        </p>

      </div>

      <button className="intro__skip" onClick={onDone}>SKIP →</button>
    </div>
  );
}
