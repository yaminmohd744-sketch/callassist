import { useState } from 'react';
import { VideoScriptsSection }   from './marketing-plan/VideoScriptsSection';
import { HookBankSection }        from './marketing-plan/HookBankSection';
import { PostingScheduleSection } from './marketing-plan/PostingScheduleSection';
import { CTAStrategySection }     from './marketing-plan/CTAStrategySection';
import { CaptureListSection }     from './marketing-plan/CaptureListSection';
import './MarketingPlanScreen.css';

interface MarketingPlanScreenProps {
  onBack: () => void;
}

const SECTIONS = [
  { num: '01', title: 'Video Scripts',      sub: 'AI UGC · HeyGen / Arcads / Creatify' },
  { num: '02', title: 'Hook Bank',           sub: '15 opening lines for videos & carousels' },
  { num: '03', title: 'Posting Schedule',   sub: 'Weekly cadence · 3-month plan' },
  { num: '04', title: 'CTA Strategy',       sub: 'Download vs waitlist split' },
  { num: '05', title: 'Capture List',       sub: 'Screen recordings to produce' },
] as const;

type SectionIndex = 0 | 1 | 2 | 3 | 4;

export function MarketingPlanScreen({ onBack }: MarketingPlanScreenProps) {
  const [active, setActive] = useState<SectionIndex>(0);

  return (
    <div className="mplan">
      <div className="mplan__header">
        <button className="mplan__back" onClick={onBack}>← Back</button>
        <div className="mplan__header-title">
          <div className="mplan__badge">INTERNAL</div>
          <h1>Pitchr Marketing Plan</h1>
        </div>
      </div>

      {/* Section navigator */}
      <nav className="mplan__nav" aria-label="Marketing plan sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.num}
            className={`mplan__nav-btn${active === i ? ' mplan__nav-btn--active' : ''}`}
            onClick={() => setActive(i as SectionIndex)}
          >
            <span className="mplan__nav-num">{s.num}</span>
            <span className="mplan__nav-info">
              <span className="mplan__nav-title">{s.title}</span>
              <span className="mplan__nav-sub">{s.sub}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="mplan__body">
        {active === 0 && <VideoScriptsSection />}
        {active === 1 && <HookBankSection />}
        {active === 2 && <PostingScheduleSection />}
        {active === 3 && <CTAStrategySection />}
        {active === 4 && <CaptureListSection />}
      </div>
    </div>
  );
}
