import type { CallSession } from '../types';

export type MoveAction = 'close' | 'call-back' | 'follow-up' | 're-engage';

export interface NextMove {
  sessionId: string;
  action: MoveAction;
  prospectName: string;
  company?: string;
  body: string;
  callDate: string;
  probability: number;
}

const MS_PER_DAY = 86_400_000;

function sessionAgeInDays(endedAt: string): number {
  return (Date.now() - new Date(endedAt).getTime()) / MS_PER_DAY;
}

function pickAction(session: CallSession, ageInDays: number): MoveAction {
  if (session.callStage === 'close' || session.finalCloseProbability >= 70) return 'close';
  if (ageInDays < 3) return 'call-back';
  if (ageInDays <= 7) return 'follow-up';
  return 're-engage';
}

const FALLBACK_BODY: Record<MoveAction, (s: CallSession) => string> = {
  'close':     s => `Close probability is at ${s.finalCloseProbability}% — now is the time to push for a decision.`,
  'call-back': s => `Your ${s.config.callType ?? 'last'} call showed real interest — follow up while it's still fresh.`,
  'follow-up': () => 'Reach out to keep the deal warm and move it to the next stage.',
  're-engage': () => "It's been a while — a quick check-in could restart the conversation.",
};

export function generateNextMoves(sessions: CallSession[]): NextMove[] {
  const seen = new Set<string>();
  const moves: NextMove[] = [];

  for (const session of sessions) {
    // Skip resolved sessions and sessions without a prospect name
    if (session.outcome === 'converted' || session.outcome === 'no-deal') continue;
    const name = session.config.prospectName?.trim();
    if (!name) continue;

    // One suggestion per prospect — keep the most recent
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const age = sessionAgeInDays(session.endedAt);
    const action = pickAction(session, age);

    // Use the AI's own nextCallTip when available — this is the "AI was present" moment
    const body =
      session.coaching?.nextCallTip?.trim() ||
      FALLBACK_BODY[action](session);

    moves.push({
      sessionId:    session.id ?? session.endedAt,
      action,
      prospectName: name,
      company:      session.config.company || undefined,
      body,
      callDate:     session.endedAt,
      probability:  session.finalCloseProbability,
    });

    if (moves.length >= 4) break;
  }

  return moves;
}
