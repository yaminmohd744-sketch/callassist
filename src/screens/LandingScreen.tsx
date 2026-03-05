
import { Button } from '../components/ui/Button';
import './LandingScreen.css';

interface LandingScreenProps {
  onGetStarted: () => void;
}

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
  return (
    <div className="landing">
      <div className="landing__content">
        <div className="landing__logo">
          <span className="landing__logo-icon">◎</span>
          <span className="landing__logo-text">CALL<span className="landing__logo-accent">ASSIST</span></span>
        </div>

        <h1 className="landing__headline">
          Close more deals.<br />
          <span className="landing__headline-accent">In real time.</span>
        </h1>

        <p className="landing__sub">
          AI-powered coaching during your live calls. Detect objections, surface the right responses,
          and guide every conversation toward a close — as it happens.
        </p>

        <div className="landing__features">
          <div className="landing__feature">
            <span className="landing__feature-icon">◉</span>
            <span>Live voice transcription</span>
          </div>
          <div className="landing__feature">
            <span className="landing__feature-icon">◉</span>
            <span>Real-time objection handling</span>
          </div>
          <div className="landing__feature">
            <span className="landing__feature-icon">◉</span>
            <span>Dynamic closing prompts</span>
          </div>
          <div className="landing__feature">
            <span className="landing__feature-icon">◉</span>
            <span>Close probability tracking</span>
          </div>
          <div className="landing__feature">
            <span className="landing__feature-icon">◉</span>
            <span>Post-call AI summary</span>
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={onGetStarted} className="landing__cta">
          ▶ START A CALL
        </Button>

        <p className="landing__note">No sign-up required. Works in your browser.</p>
      </div>

      <div className="landing__preview">
        <div className="landing__terminal">
          <div className="landing__terminal-bar">
            <span className="landing__dot landing__dot--red" />
            <span className="landing__dot landing__dot--yellow" />
            <span className="landing__dot landing__dot--green" />
            <span className="landing__terminal-title">CALL ASSIST — LIVE</span>
          </div>
          <div className="landing__terminal-body">
            <div className="landing__log landing__log--system">● ACTIVE  01:42  OBJECTIONS 1  CLOSE PROB 72%</div>
            <div className="landing__log landing__log--prospect">PROSPECT: "I already have a tool for that..."</div>
            <div className="landing__log landing__log--ai">
              <span className="landing__ai-badge">OBJECTION DETECTED</span>
              <br />
              Competitor Objection: What do you like most about<br />
              your current solution? And is there anything it<br />
              doesn't do well that you'd love to fix?
            </div>
            <div className="landing__log landing__log--system">Signal: Positive  +8% close probability</div>
            <div className="landing__log landing__log--prospect">PROSPECT: "Tell me more about the pricing..."</div>
            <div className="landing__log landing__log--ai">
              <span className="landing__ai-badge landing__ai-badge--green">BUYING SIGNAL</span>
              <br />
              Pricing inquiry detected — ask 2 qualifying questions<br />
              before quoting. "What's your team size?"
            </div>
            <div className="landing__cursor">_</div>
          </div>
        </div>
      </div>
    </div>
  );
}
