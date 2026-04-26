import { useState, useEffect, useRef, useCallback } from 'react';
import { useAICoach } from '../hooks/useAICoach';
import { useCallTimer } from '../hooks/useCallTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { classifySignal } from '../lib/keywords';
import { createHeyGenSession, startHeyGenSession, sendHeyGenText, stopHeyGenSession } from '../lib/heygen';
import { updateMeetingStatus } from '../lib/meetings';
import { genId } from '../lib/id';
import { useAuth } from '../hooks/useAuth';
import type { Meeting, TranscriptEntry } from '../types';
import './AvatarSession.css';

interface AvatarSessionProps {
  meeting: Meeting;
  onEnd: () => void;
}

type SessionPhase = 'connecting' | 'active' | 'ending' | 'ended';

export function AvatarSession({ meeting, onEnd }: AvatarSessionProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<SessionPhase>('connecting');
  const [statusText, setStatusText] = useState('Connecting to meeting…');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [heyGenSessionId, setHeyGenSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharePromptDismissed, setSharePromptDismissed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const isSpeakingRef = useRef(false);

  const { elapsedSeconds, formattedTime, startTimer, stopTimer } = useCallTimer();
  const { suggestions, closeProbability, callStage, objectionsCount, processEntry, reset: resetCoach } = useAICoach();

  // When the AI generates a suggestion, speak it via HeyGen
  const lastSuggestionId = suggestions.length > 0 ? suggestions[suggestions.length - 1].id : null;
  const lastSuggestionBody = suggestions.length > 0 ? suggestions[suggestions.length - 1].body : null;
  const spokenSuggestionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastSuggestionId || !lastSuggestionBody || !heyGenSessionId) return;
    if (spokenSuggestionRef.current === lastSuggestionId) return;
    if (isSpeakingRef.current) return;

    spokenSuggestionRef.current = lastSuggestionId;
    isSpeakingRef.current = true;

    // Extract just the verbatim line (before the double newline tactical note)
    const line = lastSuggestionBody.split('\n\n')[0].trim();
    sendHeyGenText(heyGenSessionId, line)
      .catch(console.error)
      .finally(() => { isSpeakingRef.current = false; });
  }, [lastSuggestionId, lastSuggestionBody, heyGenSessionId]);

  const handleFinalTranscript = useCallback((text: string) => {
    const entry: TranscriptEntry = {
      id: genId(),
      speaker: 'prospect',
      text,
      timestampSeconds: elapsedSeconds,
      signal: classifySignal(text),
    };
    const updated = [...transcriptRef.current, entry];
    transcriptRef.current = updated;
    setTranscript(updated);
    processEntry(entry, updated, elapsedSeconds, {
      prospectName:  meeting.prospectName,
      company:       meeting.company ?? '',
      yourPitch:     '',
      callGoal:      '',
      language:      'en-US',
      prospectTitle: meeting.prospectTitle,
      callType:      'demo',
      priorContext:  meeting.context,
    });
  }, [elapsedSeconds, processEntry, meeting]);

  const { startListening, stopListening } = useSpeechRecognition({
    onFinalTranscript: handleFinalTranscript,
    language: 'en-US',
  });

  // Boot sequence: HeyGen → WebRTC → Recall bot → start listening
  useEffect(() => {
    resetCoach();
    let cancelled = false;

    async function boot() {
      try {
        setStatusText('Starting avatar session…');
        const session = await createHeyGenSession();
        if (cancelled) return;
        setHeyGenSessionId(session.sessionId);

        // WebRTC setup
        const pc = new RTCPeerConnection({ iceServers: session.iceServers });
        peerRef.current = pc;

        pc.ontrack = (ev) => {
          if (videoRef.current && ev.streams[0]) {
            videoRef.current.srcObject = ev.streams[0];
          }
        };

        await pc.setRemoteDescription({ type: 'offer', sdp: session.sdpOffer });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await startHeyGenSession(session.sessionId, answer.sdp ?? '');
        if (cancelled) return;

        setPhase('active');
        setStatusText('');
        startTimer();
        startListening();

        // Greet the prospect
        await sendHeyGenText(session.sessionId,
          `Hi ${meeting.prospectName}, thanks for making time today. I'm the Pitch Plus assistant. Let's dive right in.`
        );

        if (user) {
          updateMeetingStatus(meeting.id, user.id, 'in-progress').catch(console.error);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    boot();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEnd() {
    setPhase('ending');
    stopListening();
    stopTimer();
    if (heyGenSessionId) {
      await sendHeyGenText(heyGenSessionId, 'Thank you for your time. I\'ll follow up shortly.').catch(() => {});
      await stopHeyGenSession(heyGenSessionId).catch(() => {});
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    if (user) {
      updateMeetingStatus(meeting.id, user.id, 'completed').catch(console.error);
    }
    setPhase('ended');
    onEnd();
  }

  const stageLabelMap: Record<string, string> = {
    opener: 'OPENER', discovery: 'DISCOVERY', pitch: 'PITCH', close: 'CLOSE',
  };

  return (
    <div className="av-session">
      {/* ── Status overlay (connecting phase) ── */}
      {phase === 'connecting' && (
        <div className="av-session__overlay">
          <div className="av-session__spinner" />
          <p className="av-session__status-text">{statusText}</p>
          {error && (
            <div className="av-session__error">
              <p>{error}</p>
              <button className="av-session__btn-back" onClick={onEnd}>← Back to Meetings</button>
            </div>
          )}
        </div>
      )}

      {/* ── Main layout ── */}
      {phase === 'active' && (
        <div className="av-session__layout">

          {/* ── Screenshare prompt ── */}
          {!sharePromptDismissed && (
            <div className="av-session__share-banner">
              <span className="av-session__share-icon">🖥</span>
              <div className="av-session__share-text">
                <strong>Share this tab in your {meeting.platform === 'meet' ? 'Google Meet' : meeting.platform === 'teams' ? 'Teams' : 'Zoom'} call</strong>
                <span>Your prospect will see the avatar and hear its voice. Use your platform's screenshare → "This Tab" option.</span>
              </div>
              <a
                className="av-session__share-open"
                href={meeting.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open meeting ↗
              </a>
              <button className="av-session__share-dismiss" onClick={() => setSharePromptDismissed(true)}>
                Got it ✓
              </button>
            </div>
          )}

          {/* Avatar feed */}
          <div className="av-session__avatar-wrap">
            <video
              ref={videoRef}
              className="av-session__avatar-video"
              autoPlay
              playsInline
              muted={false}
            />
            <div className="av-session__avatar-badge">
              <span className="av-session__avatar-dot" />
              LIVE
            </div>
          </div>

          {/* Side panel */}
          <div className="av-session__panel">

            {/* Header */}
            <div className="av-session__panel-header">
              <div className="av-session__panel-info">
                <span className="av-session__prospect-name">{meeting.prospectName}</span>
                {meeting.company && <span className="av-session__company">{meeting.company}</span>}
              </div>
              <div className="av-session__timer">{formattedTime}</div>
            </div>

            {/* Stats bar */}
            <div className="av-session__stats">
              <div className="av-session__stat">
                <span className="av-session__stat-label">STAGE</span>
                <span className="av-session__stat-value">{stageLabelMap[callStage] ?? callStage.toUpperCase()}</span>
              </div>
              <div className="av-session__stat">
                <span className="av-session__stat-label">CLOSE</span>
                <span className="av-session__stat-value av-session__stat-value--prob">{closeProbability}%</span>
              </div>
              <div className="av-session__stat">
                <span className="av-session__stat-label">OBJECTIONS</span>
                <span className="av-session__stat-value">{objectionsCount}</span>
              </div>
            </div>

            {/* Live transcript */}
            <div className="av-session__transcript">
              <div className="av-session__transcript-label">LIVE TRANSCRIPT</div>
              {transcript.length === 0 && (
                <p className="av-session__transcript-empty">Listening for prospect…</p>
              )}
              {transcript.map(e => (
                <div key={e.id} className={`av-session__entry av-session__entry--${e.speaker}`}>
                  <span className="av-session__entry-speaker">
                    {e.speaker === 'prospect' ? meeting.prospectName : 'Avatar'}
                  </span>
                  <span className="av-session__entry-text">{e.text}</span>
                </div>
              ))}
            </div>

            {/* Latest AI action */}
            {suggestions.length > 0 && (
              <div className="av-session__last-action">
                <span className="av-session__last-action-label">LAST ACTION</span>
                <span className="av-session__last-action-text">
                  {suggestions[suggestions.length - 1].body.split('\n\n')[0]}
                </span>
              </div>
            )}

            {/* End button */}
            <button className="av-session__end-btn" onClick={handleEnd}>
              ■ End Session
            </button>
          </div>
        </div>
      )}

      {phase === 'ending' && (
        <div className="av-session__overlay">
          <div className="av-session__spinner" />
          <p className="av-session__status-text">Wrapping up session…</p>
        </div>
      )}
    </div>
  );
}
