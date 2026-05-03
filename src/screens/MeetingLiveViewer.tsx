import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { Meeting } from '../types';
import './MeetingLiveViewer.css';

interface MeetingLiveViewerProps {
  meeting: Meeting;
  onBack: () => void;
}

interface TranscriptLine {
  id: string;
  speaker: 'bot' | 'prospect';
  text: string;
  time: string;
}

interface AiMove {
  label: string;
  description: string;
  type: 'objection' | 'buying-signal' | 'tip' | 'close';
}

const TRANSCRIPT_LINE_INTERVAL_MS = 3500; // simulates natural speech pacing

const MOCK_LINES: TranscriptLine[] = [
  { id: 'l1', speaker: 'bot',      time: '00:12', text: "Hi Marcus, thanks for making time today. I wanted to pick up on the proposal we discussed last week. Is now still a good moment?" },
  { id: 'l2', speaker: 'prospect', time: '00:22', text: "Yeah, go ahead. I've had a chance to review the numbers." },
  { id: 'l3', speaker: 'bot',      time: '00:30', text: "Great. I know the headline price is higher than what you're used to, but I want to walk through the ROI case — there's a meaningful difference in what you get." },
  { id: 'l4', speaker: 'prospect', time: '00:48', text: "The ROI is fine, I get it. My issue is the 12-month lock-in. What if it doesn't work out for us?" },
  { id: 'l5', speaker: 'bot',      time: '01:02', text: "That's a fair concern. We offer a 60-day success guarantee — if you're not seeing results in 60 days, we'll restructure or refund. We haven't had to do that yet, but it exists." },
  { id: 'l6', speaker: 'prospect', time: '01:18', text: "Okay. What does onboarding look like? Last tool we brought in took three months to roll out." },
  { id: 'l7', speaker: 'bot',      time: '01:28', text: "Typically one week for your team to be fully live. I can share the onboarding doc — most teams are making calls on day two." },
  { id: 'l8', speaker: 'prospect', time: '01:42', text: "That's actually pretty good. What about API access for our CRM?" },
];

const MOCK_MOVES: AiMove[] = [
  { label: 'Buying signal detected', description: 'Prospect asking about API/CRM integration — strong purchase intent. Pivot to close.', type: 'buying-signal' },
  { label: 'Suggested close', description: 'Offer to send contract today with onboarding doc attached. Create urgency around Q4 pricing.', type: 'close' },
  { label: 'Objection handled', description: 'Lock-in concern resolved with 60-day guarantee. Prospect did not push back further.', type: 'tip' },
];

function formatElapsed(startedAt: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function MeetingLiveViewer({ meeting, onBack }: MeetingLiveViewerProps) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(meeting.startedAt ?? new Date().toISOString()));
  const [visibleLines, setVisibleLines] = useState<TranscriptLine[]>(MOCK_LINES.slice(0, 4));
  const [currentMove, setCurrentMove] = useState<AiMove>(MOCK_MOVES[0]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(meeting.startedAt ?? new Date().toISOString());

  useEffect(() => {
    const t = setInterval(() => setElapsed(formatElapsed(startedAtRef.current)), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate transcript lines arriving
  useEffect(() => {
    if (visibleLines.length >= MOCK_LINES.length) return;
    const t = setTimeout(() => {
      setVisibleLines(prev => [...prev, MOCK_LINES[prev.length]]);
    }, TRANSCRIPT_LINE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [visibleLines]);

  // Simulate AI move updates
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % MOCK_MOVES.length;
      setCurrentMove(MOCK_MOVES[i]);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const MOVE_COLORS: Record<AiMove['type'], string> = {
    'buying-signal': 'var(--color-accent-green)',
    'close':         'var(--color-accent-purple)',
    'objection':     'var(--color-accent-red)',
    'tip':           'var(--color-accent-yellow)',
  };

  return (
    <div className="mlv">

      {/* Header */}
      <header className="mlv__header">
        <button className="mlv__back" onClick={onBack}>
          ← Back
        </button>
        <div className="mlv__meeting-info">
          <span className="mlv__prospect-name">{meeting.prospectName}</span>
          {meeting.company && <span className="mlv__company">{meeting.company}</span>}
        </div>
        <div className="mlv__header-right">
          <span className="mlv__timer">{elapsed}</span>
          <span className="mlv__live-badge">
            <span className="mlv__live-dot" />
            LIVE
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="mlv__body">

        {/* Left: video + transcript */}
        <div className="mlv__left">

          {/* Video tiles */}
          <div className="mlv__tiles">
            <div className="mlv__tile mlv__tile--bot">
              <div className="mlv__tile-avatar">
                <div className="mlv__bot-ring" />
                <span className="mlv__tile-initials">AI</span>
              </div>
              <span className="mlv__tile-label">Your AI</span>
            </div>
            <div className="mlv__tile mlv__tile--prospect">
              <div className="mlv__tile-avatar mlv__tile-avatar--prospect">
                <span className="mlv__tile-initials">{getInitials(meeting.prospectName)}</span>
              </div>
              <span className="mlv__tile-label">{meeting.prospectName}</span>
            </div>
          </div>

          {/* Transcript */}
          <div className="mlv__transcript-wrap">
            <div className="mlv__transcript-label">LIVE TRANSCRIPT</div>
            <div className="mlv__transcript" ref={transcriptRef}>
              {visibleLines.map((line, i) => (
                <div
                  key={line.id}
                  className={`mlv__line mlv__line--${line.speaker}`}
                  style={{ '--line-i': i } as CSSProperties}
                >
                  <span className="mlv__line-time">{line.time}</span>
                  <span className="mlv__line-speaker">{line.speaker === 'bot' ? 'AI' : meeting.prospectName.split(' ')[0]}</span>
                  <span className="mlv__line-text">{line.text}</span>
                </div>
              ))}
              {visibleLines.length < MOCK_LINES.length && (
                <div className="mlv__typing">
                  <span /><span /><span />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI intelligence */}
        <div className="mlv__right">
          <div className="mlv__intel-label">AI NEXT MOVE</div>

          <div className="mlv__move-card" style={{ '--move-color': MOVE_COLORS[currentMove.type] } as CSSProperties}>
            <div className="mlv__move-badge">{currentMove.label}</div>
            <p className="mlv__move-desc">{currentMove.description}</p>
          </div>

          <div className="mlv__intel-divider" />
          <div className="mlv__intel-label">MEETING GOAL</div>
          <p className="mlv__goal-text">{meeting.goal}</p>

          {meeting.context && (
            <>
              <div className="mlv__intel-divider" />
              <div className="mlv__intel-label">CONTEXT</div>
              <p className="mlv__goal-text">{meeting.context}</p>
            </>
          )}

          <div className="mlv__intel-divider" />
          <div className="mlv__signals">
            <div className="mlv__signal mlv__signal--green">
              <span className="mlv__signal-dot" />
              <span>1 buying signal</span>
            </div>
            <div className="mlv__signal mlv__signal--yellow">
              <span className="mlv__signal-dot" />
              <span>1 objection handled</span>
            </div>
          </div>

          <div className="mlv__view-only">
            <span className="mlv__view-only-icon">👁</span>
            View only — you are not in this meeting
          </div>
        </div>
      </div>
    </div>
  );
}
