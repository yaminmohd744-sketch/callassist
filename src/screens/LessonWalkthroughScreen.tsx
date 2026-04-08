import { useState } from 'react';
import type { CurriculumLesson, CurriculumModule } from '../lib/curriculum';
import type { LessonStats } from '../hooks/useAcademy';
import { getSavedContexts } from '../lib/saleContexts';
import './LessonWalkthroughScreen.css';

interface LessonWalkthroughScreenProps {
  lesson: CurriculumLesson;
  module: CurriculumModule;
  lessonNumber: number;
  stats: LessonStats | null;
  onStart: (saleContext: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

// ── Slide definitions ─────────────────────────────────────────────────────────

const SLIDE_COUNT = 7; // 0=intro 1=concept 2=doSay 3=dontSay 4=objectives 5=tip 6=ready

export function LessonWalkthroughScreen({
  lesson, module, lessonNumber, stats, onStart, onBack, isLoading, error,
}: LessonWalkthroughScreenProps) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [saleContext, setSaleContext] = useState('');
  const [animKey, setAnimKey] = useState(0);

  const savedContexts = getSavedContexts();

  function goTo(next: number) {
    setDirection(next > slide ? 'forward' : 'back');
    setAnimKey(k => k + 1);
    setSlide(next);
  }

  function next() { if (slide < SLIDE_COUNT - 1) goTo(slide + 1); }
  function prev() { if (slide > 0) goTo(slide - 1); }

  const levelColor = module.color === 'green' ? '#22c55e'
    : module.color === 'yellow' ? '#eab308'
    : '#ef4444';

  const progress = (slide / (SLIDE_COUNT - 1)) * 100;

  return (
    <div className="lw">
      {/* Ambient background */}
      <div className="lw__orb lw__orb-a" />
      <div className="lw__orb lw__orb-b" />
      <div className="lw__orb lw__orb-c" />

      {/* Top bar */}
      <header className="lw__topbar">
        <button className="lw__close" onClick={onBack}>✕ Exit lesson</button>
        <div className="lw__progress-track">
          <div className="lw__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="lw__slide-counter">{slide + 1} / {SLIDE_COUNT}</div>
      </header>

      {/* Slide content */}
      <div
        className={`lw__slide lw__slide--${direction}`}
        key={animKey}
      >
        {slide === 0 && <SlideIntro lesson={lesson} module={module} lessonNumber={lessonNumber} levelColor={levelColor} stats={stats} />}
        {slide === 1 && <SlideConcept lesson={lesson} />}
        {slide === 2 && <SlideDoSay lesson={lesson} />}
        {slide === 3 && <SlideDontSay lesson={lesson} />}
        {slide === 4 && <SlideObjectives lesson={lesson} />}
        {slide === 5 && <SlideTip lesson={lesson} />}
        {slide === 6 && (
          <SlideReady
            lesson={lesson}
            module={module}
            saleContext={saleContext}
            setSaleContext={setSaleContext}
            savedContexts={savedContexts}
            onStart={() => onStart(saleContext)}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="lw__nav">
        <button
          className="lw__nav-back"
          onClick={prev}
          disabled={slide === 0}
        >
          ← Back
        </button>

        {/* Dot indicators */}
        <div className="lw__dots">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              className={`lw__dot ${i === slide ? 'lw__dot--active' : i < slide ? 'lw__dot--done' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {slide < SLIDE_COUNT - 1 ? (
          <button className="lw__nav-next" onClick={next}>
            Continue →
          </button>
        ) : (
          <div style={{ width: 120 }} /> // balance layout on last slide
        )}
      </nav>
    </div>
  );
}

// ── Individual slides ─────────────────────────────────────────────────────────

function SlideIntro({ lesson, module, lessonNumber, levelColor, stats }: {
  lesson: CurriculumLesson;
  module: CurriculumModule;
  lessonNumber: number;
  levelColor: string;
  stats: LessonStats | null;
}) {
  return (
    <div className="lw__content lw__content--center">
      <div className="lw__intro-badge" style={{ color: levelColor, borderColor: levelColor }}>
        {module.level.toUpperCase()} · LESSON {lessonNumber} OF {module.lessons.length}
      </div>
      <h1 className="lw__intro-title">{lesson.title}</h1>
      <p className="lw__intro-concept">{lesson.concept}</p>
      {stats && (
        <div className="lw__intro-attempts">
          {stats.attempts} attempt{stats.attempts !== 1 ? 's' : ''} · Best score: {stats.bestScore.toFixed(1)}/10
          {stats.passed && ' · ✓ Passed'}
        </div>
      )}
      <p className="lw__intro-hint">Use the Continue button below to walk through the lesson</p>
    </div>
  );
}

function SlideConcept({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <div className="lw__content">
      <div className="lw__section-tag">THE CONCEPT</div>
      <h2 className="lw__section-title">{lesson.concept}</h2>
      <p className="lw__body-text">{lesson.lessonBody}</p>
    </div>
  );
}

function SlideDoSay({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <div className="lw__content">
      <div className="lw__section-tag lw__section-tag--green">WHAT TO SAY</div>
      <h2 className="lw__section-title">Say this</h2>
      <p className="lw__section-sub">These are examples — adapt them to your own voice.</p>
      <ul className="lw__example-list lw__example-list--do">
        {lesson.doSay.map((text, i) => (
          <li
            key={i}
            className="lw__example-item lw__example-item--do"
            style={{ '--i': i } as React.CSSProperties}
          >
            <span className="lw__example-icon">✓</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlideDontSay({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <div className="lw__content">
      <div className="lw__section-tag lw__section-tag--red">WHAT NOT TO SAY</div>
      <h2 className="lw__section-title">Avoid these</h2>
      <p className="lw__section-sub">These patterns hurt more than they help — and they're common.</p>
      <ul className="lw__example-list lw__example-list--dont">
        {lesson.dontSay.map((text, i) => (
          <li
            key={i}
            className="lw__example-item lw__example-item--dont"
            style={{ '--i': i } as React.CSSProperties}
          >
            <span className="lw__example-icon">✗</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlideObjectives({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <div className="lw__content">
      <div className="lw__section-tag">YOUR OBJECTIVES</div>
      <h2 className="lw__section-title">Hit these in the test</h2>
      <p className="lw__section-sub">These are the things the AI will evaluate. Not rigid rules — goals to aim for.</p>
      <ol className="lw__objectives">
        {lesson.objectives.map((obj, i) => (
          <li
            key={i}
            className="lw__objective"
            style={{ '--i': i } as React.CSSProperties}
          >
            <span className="lw__objective-num">{i + 1}</span>
            <span>{obj}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SlideTip({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <div className="lw__content">
      <div className="lw__section-tag lw__section-tag--purple">COACH'S NOTE</div>
      <h2 className="lw__section-title">The insight behind this lesson</h2>
      <div className="lw__tip-card">
        <div className="lw__tip-icon">◈</div>
        <p className="lw__tip-text">{lesson.tip}</p>
      </div>
    </div>
  );
}

function SlideReady({ lesson, module, saleContext, setSaleContext, savedContexts, onStart, isLoading, error }: {
  lesson: CurriculumLesson;
  module: CurriculumModule;
  saleContext: string;
  setSaleContext: (v: string) => void;
  savedContexts: string[];
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="lw__content lw__content--ready">
      <div className="lw__ready-icon">▶</div>
      <h2 className="lw__ready-title">Time to put it into practice</h2>
      <p className="lw__ready-sub">
        The AI plays a real prospect. Apply what you just learned.
        You need at least <strong>{lesson.minExchanges} exchanges</strong> before ending —
        then you get your full coaching report.
      </p>

      <div className="lw__ready-meta">
        <span className={`lw__diff-badge lw__diff-badge--${lesson.difficulty}`}>
          {lesson.difficulty.toUpperCase()}
        </span>
        <span className="lw__ready-pass">Pass: {lesson.passScore}/10 to unlock next lesson</span>
      </div>

      <div className="lw__ready-context">
        <label className="lw__ready-context-label">WHAT ARE YOU SELLING?</label>
        <textarea
          className="lw__ready-context-input"
          placeholder="e.g. a $485k 3-bedroom house in Miami, FL"
          value={saleContext}
          onChange={e => setSaleContext(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onStart(); } }}
          rows={2}
          autoFocus
        />
        {savedContexts.length > 0 && (
          <div className="lw__ready-presets">
            <span className="lw__ready-presets-label">RECENT</span>
            {savedContexts.map((c, i) => (
              <button key={i} className="lw__ready-preset" onClick={() => setSaleContext(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="lw__error">{error}</div>}

      <button
        className="lw__start-btn"
        onClick={onStart}
        disabled={isLoading}
      >
        {isLoading ? 'Setting up your scenario...' : `Start ${module.level} Test →`}
      </button>
    </div>
  );
}
