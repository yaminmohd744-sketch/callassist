import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import type { CallSession, LearningLogEntry } from '../types';
import { getStreak } from '../lib/streak';
import { formatDuration, formatDateShort } from '../lib/formatters';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';
import './DashboardScreen.css';

// ── Demo data shown when the user has no real sessions yet ────────────────────
const DEMO_SESSIONS: CallSession[] = [
  {
    id: 'demo-1',
    config: { prospectName: 'Amara Osei', company: 'Meridian Growth', callGoal: 'Book a demo', yourPitch: '', language: 'en-US', callType: 'discovery' },
    durationSeconds: 551, finalCloseProbability: 81,
    objectionsCount: 2, callStage: 'close', endedAt: '2026-05-22T09:38:00.000Z',
    leadScore: 88, talkRatio: 0.48, outcome: 'pipeline',
    transcript: [
      { id: 'd1-t1', speaker: 'rep', text: 'Hi Amara, thanks for taking the time today. Quick question to start: what\'s your biggest bottleneck with new business right now?', timestampSeconds: 12, signal: 'neutral' },
      { id: 'd1-t2', speaker: 'prospect', text: 'Honestly? Our reps spend half their day on admin and prep instead of actually selling. We\'re losing maybe 30% of potential conversations just to friction.', timestampSeconds: 28, signal: 'buying-signal' },
      { id: 'd1-t3', speaker: 'rep', text: 'That\'s significant. When you say friction — is it more the research side, the follow-up, or something in between?', timestampSeconds: 52, signal: 'neutral' },
      { id: 'd1-t4', speaker: 'prospect', text: 'Both, but follow-up is worse. We have no consistent process. Some reps send great emails, others ghost prospects for a week.', timestampSeconds: 68, signal: 'neutral' },
      { id: 'd1-t5', speaker: 'rep', text: 'What does that cost you in pipeline per quarter, roughly?', timestampSeconds: 94, signal: 'neutral' },
      { id: 'd1-t6', speaker: 'prospect', text: 'We haven\'t measured it precisely but our head of sales estimates maybe £80K in stalled deals that could have closed.', timestampSeconds: 112, signal: 'buying-signal' },
      { id: 'd1-t7', speaker: 'rep', text: '£80K sitting in stalled pipeline is a real number. I\'d love to show you how teams like yours have cut follow-up time by 70% — could we get 30 minutes this week?', timestampSeconds: 420, signal: 'neutral' },
      { id: 'd1-t8', speaker: 'prospect', text: 'Yeah, that makes sense. Send me Thursday afternoon options — I\'m free after 2pm.', timestampSeconds: 445, signal: 'buying-signal' },
    ],
    suggestions: [
      { id: 'd1-s1', type: 'objection-response', headline: 'Budget concern handled', body: 'Amara pushed back on cost; you reframed around the £80K stalled pipeline figure she gave you — strong ROI pivot.', triggeredBy: 'budget', timestampSeconds: 310, createdAt: Date.now() },
      { id: 'd1-s2', type: 'close-attempt', headline: 'Demo booked — Thursday confirmed', body: 'Prospect agreed to Thursday demo slot after pain was quantified. Strong close signal.', triggeredBy: 'Thursday', timestampSeconds: 445, createdAt: Date.now() },
      { id: 'd1-s3', type: 'discovery', headline: 'Quantified pain early', body: 'Good move asking "what does that cost you" — anchored the value conversation before the pitch.', triggeredBy: 'cost', timestampSeconds: 94, createdAt: Date.now() },
    ],
    notes: ['Mentioned head of sales is Alex — reference him in the demo invite', 'Budget review end of June — good timing window'],
    aiSummary: `WHAT WENT WELL
• Opened with a sharp question that surfaced a real pain point fast
• Quantified the problem (£80K stalled pipeline) before pitching
• Talk ratio was strong — Amara spoke more than 50% of the time

GAPS
• Took too long to bridge from pain to demo ask (~7 minutes before the close)
• Price objection could have been handled with a harder ROI frame

NEXT STEPS
• Send Thursday 2pm+ calendar options by EOD today
• Reference Alex (head of sales) and the £80K figure in the invite
• Prep ROI calculator slide for the demo itself`,
    followUpEmail: `Hi Amara,

Really appreciated the conversation this morning — the point about 30% of conversations lost to admin friction is one I keep hearing from heads of sales who are scaling fast.

As promised, here are a few slots for Thursday:
• 2:00 PM – 2:30 PM
• 3:00 PM – 3:30 PM
• 4:00 PM – 4:30 PM

In the 30-minute session I'll show you exactly how teams at your stage have cut follow-up time by 70% and got that stalled pipeline moving — I'll bring the numbers.

Just reply with which slot works and I'll send the invite straight over.

Best,
[Your name]`,
  },
  {
    id: 'demo-2',
    config: { prospectName: 'James Whitfield', company: 'Apex Ventures', callGoal: 'Qualify budget', yourPitch: '', language: 'en-US', callType: 'cold' },
    durationSeconds: 312, finalCloseProbability: 44,
    objectionsCount: 4, callStage: 'pitch', endedAt: '2026-05-21T14:12:00.000Z',
    leadScore: 52, talkRatio: 0.61, outcome: 'no-deal',
    transcript: [
      { id: 'd2-t1', speaker: 'rep', text: 'James, I\'ll be straight — I\'m calling because Apex came up in our research as a firm aggressively expanding its ops team. Do I have that right?', timestampSeconds: 8, signal: 'neutral' },
      { id: 'd2-t2', speaker: 'prospect', text: 'Sort of. We\'re not actively hiring right now actually.', timestampSeconds: 22, signal: 'objection' },
      { id: 'd2-t3', speaker: 'rep', text: 'Understood — not about hiring, my mistake for not being clearer. It\'s about the tools your ops and deal teams use day-to-day. Is that an area you\'re looking at?', timestampSeconds: 35, signal: 'neutral' },
      { id: 'd2-t4', speaker: 'prospect', text: 'We\'re always looking, but we just renewed our main stack in January. Budget\'s pretty locked for the year.', timestampSeconds: 55, signal: 'objection' },
      { id: 'd2-t5', speaker: 'rep', text: 'When does your next budget cycle open? Just so I know if there\'s a better time to have this conversation.', timestampSeconds: 78, signal: 'neutral' },
      { id: 'd2-t6', speaker: 'prospect', text: 'October probably. Look, I appreciate the call but I\'m in back-to-backs today.', timestampSeconds: 95, signal: 'objection' },
      { id: 'd2-t7', speaker: 'rep', text: 'No problem. One last thing — is there a specific pain point in your current stack that isn\'t being solved? Even just for my own notes.', timestampSeconds: 115, signal: 'neutral' },
      { id: 'd2-t8', speaker: 'prospect', text: 'Honestly our call coaching is basically nonexistent. But now\'s not the time.', timestampSeconds: 130, signal: 'buying-signal' },
    ],
    suggestions: [
      { id: 'd2-s1', type: 'objection-response', headline: 'Budget locked — pivoted to timeline', body: 'You correctly pivoted to budget cycle timing instead of pushing. Good exit with a future hook.', triggeredBy: 'budget', timestampSeconds: 78, createdAt: Date.now() },
      { id: 'd2-s2', type: 'tip', headline: 'Reduce talk time on cold calls', body: 'You spoke 61% of this call. Cold calls convert better when the prospect speaks first — ask one question then go quiet.', triggeredBy: 'talk ratio', timestampSeconds: 200, createdAt: Date.now() },
      { id: 'd2-s3', type: 'close-attempt', headline: 'Coaching pain surfaced at end', body: '"Call coaching is basically nonexistent" — strong signal. Re-engage in October with this angle.', triggeredBy: 'coaching', timestampSeconds: 130, createdAt: Date.now() },
    ],
    notes: ['Re-engage October — budget cycle opens then', 'Call coaching pain point is the hook — use it in the October outreach'],
    aiSummary: `WHAT WENT WELL
• Clean, confident opener that didn't waste time
• Good objection pivot from "not hiring" to tools/ops optimisation
• Ended with a future hook and surfaced a real pain point before hanging up

GAPS
• Talk ratio was 61% — too high for a cold call
• Four objections with no meaningful traction — pitch came too early
• Should have asked more questions before going into product context

NEXT STEPS
• Diarise for October 1 — reference call coaching gap in the outreach
• Personalise next touch: "you mentioned call coaching is nonexistent at Apex"`,
    followUpEmail: `Hi James,

Thanks for taking a few minutes today even with a packed calendar.

I caught your comment that call coaching at Apex is basically nonexistent — that's the exact problem we're built to solve, and it comes up constantly at firms your size.

I'll leave it here for now since your budget cycle reopens in October. I'll follow up then with something more relevant to your Q4 planning.

If anything changes before then or you want to see a quick overview in the meantime, just drop me a reply.

Best,
[Your name]`,
  },
  {
    id: 'demo-3',
    config: { prospectName: 'Sofia Nakamura', company: 'CloudBridge Inc.', callGoal: 'Close Q2 deal', yourPitch: '', language: 'en-US', callType: 'close' },
    durationSeconds: 724, finalCloseProbability: 93,
    objectionsCount: 1, callStage: 'close', endedAt: '2026-05-21T11:05:00.000Z',
    leadScore: 95, talkRatio: 0.42, outcome: 'converted',
    transcript: [
      { id: 'd3-t1', speaker: 'rep', text: 'Sofia, great to connect again. Last time you said you wanted to move before end of Q2 — we\'re three weeks out. Where are you at with sign-off?', timestampSeconds: 10, signal: 'neutral' },
      { id: 'd3-t2', speaker: 'prospect', text: 'We\'re close. I got internal approval from ops. The only remaining flag is legal wants to review the data processing agreement.', timestampSeconds: 28, signal: 'buying-signal' },
      { id: 'd3-t3', speaker: 'rep', text: 'Totally standard. I can get our DPA to your legal team within the hour — does it go through you or is there a direct contact?', timestampSeconds: 52, signal: 'neutral' },
      { id: 'd3-t4', speaker: 'prospect', text: 'Goes through me, I\'ll forward it. The other thing — we need to confirm the onboarding timeline. We have a new cohort starting June 9.', timestampSeconds: 74, signal: 'buying-signal' },
      { id: 'd3-t5', speaker: 'rep', text: 'June 9 is completely workable. If we close this week I can guarantee your account is live by June 5 with onboarding sessions pre-booked. I\'ll put that in writing.', timestampSeconds: 98, signal: 'neutral' },
      { id: 'd3-t6', speaker: 'prospect', text: 'That works. What\'s the process from here?', timestampSeconds: 122, signal: 'buying-signal' },
      { id: 'd3-t7', speaker: 'rep', text: 'I\'ll send the DPA and the contract in the same email today. Once your team signs, you\'ll get the onboarding invite within 24 hours.', timestampSeconds: 145, signal: 'neutral' },
      { id: 'd3-t8', speaker: 'prospect', text: 'Perfect. Let\'s do it. Send everything over and I\'ll push it through today.', timestampSeconds: 168, signal: 'buying-signal' },
    ],
    suggestions: [
      { id: 'd3-s1', type: 'objection-response', headline: 'Legal review handled instantly', body: 'You offered to send the DPA within the hour rather than treating it as a blocker — killed the objection before it escalated.', triggeredBy: 'legal', timestampSeconds: 52, createdAt: Date.now() },
      { id: 'd3-s2', type: 'close-attempt', headline: 'Deadline-locked close', body: 'Tying June 9 cohort to a June 5 live date created natural urgency — prospect closed same call.', triggeredBy: 'close', timestampSeconds: 168, createdAt: Date.now() },
      { id: 'd3-s3', type: 'close-attempt', headline: 'Verbal commitment secured', body: '"Let\'s do it. Send everything over" — clean verbal close. Deal converted.', triggeredBy: 'paperwork', timestampSeconds: 168, createdAt: Date.now() },
    ],
    notes: ['Legal contact goes through Sofia — send DPA directly to her', 'Onboarding cohort June 9 — account must be live by June 5'],
    aiSummary: `WHAT WENT WELL
• Opened by anchoring to the prospect's own stated deadline — no wasted setup
• Neutralised the legal objection instantly by offering to send the DPA same day
• Tied onboarding timeline to a hard internal date (June 9 cohort) — natural urgency
• Talk ratio excellent at 42% — Sofia drove the conversation

GAPS
• None significant — this was a clean close execution

NEXT STEPS
• Send DPA and contract today (mark urgent)
• Book onboarding sessions for week of June 5
• Confirm account is live by June 5 at the latest`,
    followUpEmail: `Hi Sofia,

As promised — the DPA and service agreement are attached. Both are standard; legal review typically takes under a day.

Once signed, I'll personally ensure your account is live and onboarding sessions are locked in before June 5, ahead of your June 9 cohort start.

Looking forward to getting CloudBridge on board.

Best,
[Your name]`,
  },
  {
    id: 'demo-4',
    config: { prospectName: 'Marcus Reid', company: 'Delta Analytics', callGoal: 'Schedule discovery call', yourPitch: '', language: 'en-US', callType: 'warm' },
    durationSeconds: 438, finalCloseProbability: 67,
    objectionsCount: 2, callStage: 'discovery', endedAt: '2026-05-20T16:44:00.000Z',
    leadScore: 71, talkRatio: 0.53, outcome: 'pipeline',
    transcript: [
      { id: 'd4-t1', speaker: 'rep', text: 'Marcus, good to speak. Jamie from your team flagged you as the person to talk to — she mentioned you\'re building out sales enablement this half. Is that still the focus?', timestampSeconds: 8, signal: 'neutral' },
      { id: 'd4-t2', speaker: 'prospect', text: 'Yeah, that\'s a big priority for us. We\'re trying to level up the team without just throwing headcount at the problem.', timestampSeconds: 26, signal: 'buying-signal' },
      { id: 'd4-t3', speaker: 'rep', text: 'Smart framing. When you say level up — is it more about process consistency or individual skill gaps?', timestampSeconds: 48, signal: 'neutral' },
      { id: 'd4-t4', speaker: 'prospect', text: 'Bit of both. Our top 20% are killing it, but the middle 60% are inconsistent. I need to understand why and fix it systematically.', timestampSeconds: 67, signal: 'buying-signal' },
      { id: 'd4-t5', speaker: 'rep', text: 'That\'s exactly the problem we solve — surfacing what the top 20% do differently so you can replicate it across the middle 60%.', timestampSeconds: 92, signal: 'neutral' },
      { id: 'd4-t6', speaker: 'prospect', text: 'I like that framing. I\'m also not sure we have the time to implement another tool right now though.', timestampSeconds: 118, signal: 'objection' },
      { id: 'd4-t7', speaker: 'rep', text: 'Completely fair. What if I showed you what setup actually looks like — it\'s under an hour for the whole team. Could we block 30 minutes this week?', timestampSeconds: 145, signal: 'neutral' },
      { id: 'd4-t8', speaker: 'prospect', text: 'Yeah, I can do Wednesday morning. Send me a calendar link.', timestampSeconds: 172, signal: 'buying-signal' },
    ],
    suggestions: [
      { id: 'd4-s1', type: 'objection-response', headline: 'Time objection handled with specifics', body: 'You countered "no time to implement" with a concrete number (under an hour). Effective because it\'s specific and verifiable.', triggeredBy: 'time', timestampSeconds: 145, createdAt: Date.now() },
      { id: 'd4-s2', type: 'close-attempt', headline: 'Wednesday slot secured', body: 'Prospect offered a specific day unprompted — strong warm signal for a first call.', triggeredBy: 'Wednesday', timestampSeconds: 172, createdAt: Date.now() },
      { id: 'd4-s3', type: 'discovery', headline: 'Middle 60% is the angle', body: 'Marcus explicitly called out the middle 60% underperformance — lead with this insight in the discovery call.', triggeredBy: 'middle 60%', timestampSeconds: 67, createdAt: Date.now() },
    ],
    notes: ['Jamie from Delta made the intro — reference her in follow-up', 'Middle 60% performance gap is the core pain — build discovery deck around this'],
    aiSummary: `WHAT WENT WELL
• Warm referral opened the door well — Jamie's name added instant credibility
• Quickly surfaced the "middle 60%" insight — that's a concrete, coachable pain point
• Handled the time objection with specificity (under an hour)

GAPS
• Talk ratio slightly high at 53% — could have asked one more discovery question before pitching
• Didn't quantify the cost of the 60% underperformance — a missed anchor

NEXT STEPS
• Send calendar link for Wednesday morning today
• Lead with the 20/60 split analysis in discovery — show how we diagnose it
• Ask about their current coaching cadence early in the next call`,
    followUpEmail: `Hi Marcus,

Great to connect today — the challenge you described with your top 20% outperforming the middle 60% is one of the most common and most fixable problems in a growing sales team.

Here's the calendar link for Wednesday morning: [Calendar link]

I'll come prepared with a few examples of how teams at Delta's stage have diagnosed and closed that performance gap — usually faster than people expect.

See you Wednesday.

Best,
[Your name]`,
  },
  {
    id: 'demo-5',
    config: { prospectName: 'Priya Sharma', company: 'NovaTech Solutions', callGoal: 'Present pricing', yourPitch: '', language: 'en-US', callType: 'demo' },
    durationSeconds: 893, finalCloseProbability: 78,
    objectionsCount: 3, callStage: 'pitch', endedAt: '2026-05-20T10:22:00.000Z',
    leadScore: 80, talkRatio: 0.46, outcome: 'pipeline',
    transcript: [
      { id: 'd5-t1', speaker: 'rep', text: 'Priya, before I jump into pricing I want to make sure what I\'m showing you maps to your actual needs. The primary use case is onboarding new AEs and ongoing coaching for mid-market — right?', timestampSeconds: 12, signal: 'neutral' },
      { id: 'd5-t2', speaker: 'prospect', text: 'Yes, we have about 14 reps across two segments.', timestampSeconds: 31, signal: 'neutral' },
      { id: 'd5-t3', speaker: 'rep', text: 'Perfect. For 14 reps you\'re looking at £1,400 per month on annual. Most teams your size do annual for the discount and budget predictability.', timestampSeconds: 58, signal: 'neutral' },
      { id: 'd5-t4', speaker: 'prospect', text: 'That\'s more than I expected. We were budgeting closer to £800.', timestampSeconds: 88, signal: 'objection' },
      { id: 'd5-t5', speaker: 'rep', text: 'I hear you on the gap. Let me put that in context — if we help 14 reps close even one extra deal a month at your average deal size, what does that look like in revenue?', timestampSeconds: 118, signal: 'neutral' },
      { id: 'd5-t6', speaker: 'prospect', text: 'Our average deal is about £6,000. So one extra deal a month is £6K... okay I see where you\'re going with that.', timestampSeconds: 148, signal: 'buying-signal' },
      { id: 'd5-t7', speaker: 'rep', text: '£6K monthly return on £1.4K monthly spend. The teams that commit see that within the first quarter consistently.', timestampSeconds: 178, signal: 'neutral' },
      { id: 'd5-t8', speaker: 'prospect', text: 'I need to take this to my director. Can you send a one-pager I can forward?', timestampSeconds: 220, signal: 'buying-signal' },
    ],
    suggestions: [
      { id: 'd5-s1', type: 'objection-response', headline: 'Price gap bridged with ROI math', body: 'You reframed £1.4K cost against £6K deal size — prospect did the math herself. Highly effective objection handling.', triggeredBy: 'price', timestampSeconds: 118, createdAt: Date.now() },
      { id: 'd5-s2', type: 'close-attempt', headline: 'Internal champion active', body: 'Priya asking for a one-pager to forward to her director means she\'s selling internally for you — strong pipeline signal.', triggeredBy: 'director', timestampSeconds: 220, createdAt: Date.now() },
      { id: 'd5-s3', type: 'discovery', headline: 'Lead with ROI frame before pricing next time', body: 'Anchor average deal size before revealing the price — make the ROI obvious before the sticker shock hits.', triggeredBy: 'budget', timestampSeconds: 88, createdAt: Date.now() },
    ],
    notes: ['Average deal size £6K — use in all ROI framing', 'Director approval needed — send champion one-pager today', '14 reps across two segments — growth tier'],
    aiSummary: `WHAT WENT WELL
• Good instinct to re-confirm use case before jumping to pricing
• Excellent ROI reframe — letting Priya do the math herself (£6K return on £1.4K cost) was more powerful than telling her
• Internal champion dynamics are healthy — she's selling internally for you

GAPS
• Should have established deal size and ROI frame before revealing price
• Three objections is high for a demo call — set pricing expectations earlier next time

NEXT STEPS
• Send champion one-pager today — one page, ROI math prominent
• Offer to join a 20-minute call with Priya and her director to answer questions directly
• Follow up in 3 days if no response`,
    followUpEmail: `Hi Priya,

Thanks for the detailed conversation today — really helpful to understand your team structure (14 reps, two segments, both onboarding and ongoing coaching in scope).

Attached is a one-page overview you can share with your director. I've highlighted the ROI math we walked through — at your average deal size of £6K, the return is clear.

A couple of things that might help the internal conversation:
• I can join a 20-minute call with you and your director to answer questions directly
• Happy to provide a reference from a similar-sized team if that would help

I'll follow up on Thursday. If you need anything before then, just reply here.

Best,
[Your name]`,
  },
  {
    id: 'demo-6',
    config: { prospectName: 'Lena Fischer', company: 'StratEdge GmbH', callGoal: 'Handle price objection', yourPitch: '', language: 'en-US', callType: 'negotiation' },
    durationSeconds: 267, finalCloseProbability: 31,
    objectionsCount: 5, callStage: 'pitch', endedAt: '2026-05-19T15:10:00.000Z',
    leadScore: 38, talkRatio: 0.68, outcome: 'no-deal',
    transcript: [
      { id: 'd6-t1', speaker: 'prospect', text: 'Look, I\'ve reviewed the proposal. The price is too high. We can do 40% less or we don\'t move forward.', timestampSeconds: 8, signal: 'objection' },
      { id: 'd6-t2', speaker: 'rep', text: 'I appreciate you being direct. Is this a budget ceiling issue or is it that you\'re not sure the value justifies the cost?', timestampSeconds: 22, signal: 'neutral' },
      { id: 'd6-t3', speaker: 'prospect', text: 'Both. And frankly we\'re looking at a competitor who\'s 30% cheaper.', timestampSeconds: 38, signal: 'objection' },
      { id: 'd6-t4', speaker: 'rep', text: 'I understand. I\'m not going to match that price, but I can help you understand what you\'d be giving up. The competitor you\'re likely looking at is post-call only — no real-time coaching. Is live coaching part of your requirement?', timestampSeconds: 65, signal: 'neutral' },
      { id: 'd6-t5', speaker: 'prospect', text: 'That\'s a fair point but I still need to bring costs down. My board is watching every line item.', timestampSeconds: 95, signal: 'objection' },
      { id: 'd6-t6', speaker: 'rep', text: 'What if we structured a smaller pilot — 5 reps for 90 days at a reduced rate, prove the value, then expand? That de-risks the board conversation completely.', timestampSeconds: 128, signal: 'neutral' },
      { id: 'd6-t7', speaker: 'prospect', text: 'Maybe. But I need to think about it. I\'m not in a position to commit today.', timestampSeconds: 168, signal: 'objection' },
      { id: 'd6-t8', speaker: 'rep', text: 'Completely understood. When would be the right time to pick this back up?', timestampSeconds: 210, signal: 'neutral' },
    ],
    suggestions: [
      { id: 'd6-s1', type: 'objection-response', headline: 'Competitor comparison deflected', body: 'You didn\'t discount to match — instead identified a feature gap (real-time vs post-call). Good anchoring on differentiation.', triggeredBy: 'competitor', timestampSeconds: 65, createdAt: Date.now() },
      { id: 'd6-s2', type: 'tip', headline: 'Talk ratio too high in negotiation', body: 'At 68%, you talked over key objections instead of listening through them. In negotiation calls, listening is the job.', triggeredBy: 'talk ratio', timestampSeconds: 200, createdAt: Date.now() },
      { id: 'd6-s3', type: 'tip', headline: 'Pilot offer was the right instinct', body: 'The 5-rep pilot was smart — de-risked for a budget-constrained prospect. Lead with this earlier next time rather than defending full price first.', triggeredBy: 'pilot', timestampSeconds: 128, createdAt: Date.now() },
    ],
    notes: ['Board watching every line item — pilot offer is the only viable path', 'StratEdge comparing against a cheaper post-call-only competitor'],
    aiSummary: `WHAT WENT WELL
• Didn't panic and didn't immediately discount — held the price line correctly
• Identified the key differentiator vs competitor (real-time vs post-call)
• Pilot offer was the right de-risking move for a budget-constrained prospect

GAPS
• Talk ratio of 68% is too high — you talked over key objections instead of listening through them
• Five objections with no close — needed to pause and reset the conversation earlier
• Should have probed the board concerns more before going into feature defence

NEXT STEPS
• Re-engage in 2 weeks with a refined pilot proposal (5 reps, 90 days, fixed price)
• Lead with cost-of-inaction data specific to GmbH-scale teams`,
    followUpEmail: `Hi Lena,

Thanks for the direct conversation yesterday — I respect the pressure you're under with board scrutiny on every line item.

As I mentioned, I think the 5-rep, 90-day pilot is the cleanest way to de-risk this for you. I'm putting together a specific proposal with a fixed price for that structure so you have something concrete to take to your board.

I'll have it over by end of week. Would a quick call next week to walk through it together work for you?

Best,
[Your name]`,
  },
  {
    id: 'demo-7',
    config: { prospectName: 'David Okonkwo', company: 'FinCore Ltd', callGoal: 'Get verbal commitment', yourPitch: '', language: 'en-US', callType: 'close' },
    durationSeconds: 612, finalCloseProbability: 88,
    objectionsCount: 1, callStage: 'close', endedAt: '2026-05-19T09:55:00.000Z',
    leadScore: 91, talkRatio: 0.44, outcome: 'converted',
    transcript: [
      { id: 'd7-t1', speaker: 'rep', text: 'David, before we start — you\'ve been through the proposal, seen the demo, spoken to a reference customer. Where are you at in your own head?', timestampSeconds: 10, signal: 'neutral' },
      { id: 'd7-t2', speaker: 'prospect', text: 'Honestly I\'m sold on the product. The question for me is timing — we\'re mid-cycle on a restructure and I don\'t want to introduce a new platform while things are in flux.', timestampSeconds: 30, signal: 'objection' },
      { id: 'd7-t3', speaker: 'rep', text: 'That\'s a real concern. Can I push back on one assumption? The restructure is about your team — implementing a tool that improves their performance during a transition often smooths it rather than complicates it. What does the restructure look like?', timestampSeconds: 62, signal: 'neutral' },
      { id: 'd7-t4', speaker: 'prospect', text: 'We\'re splitting into two pods — new business and expansion. It\'s supposed to be done by July.', timestampSeconds: 88, signal: 'neutral' },
      { id: 'd7-t5', speaker: 'rep', text: 'Perfect. If you close this week, we can configure the platform to match your new pod structure from day one. You\'re not retrofitting — you\'re building on clean infrastructure.', timestampSeconds: 118, signal: 'neutral' },
      { id: 'd7-t6', speaker: 'prospect', text: 'That\'s actually a good point. Let me think about that for a second.', timestampSeconds: 148, signal: 'buying-signal' },
      { id: 'd7-t7', speaker: 'rep', text: 'Take your time. I\'ll be quiet.', timestampSeconds: 165, signal: 'neutral' },
      { id: 'd7-t8', speaker: 'prospect', text: 'Okay. Yes. Let\'s move forward. Get me the paperwork.', timestampSeconds: 195, signal: 'buying-signal' },
    ],
    suggestions: [
      { id: 'd7-s1', type: 'objection-response', headline: 'Timing objection flipped to advantage', body: 'You turned "bad timing due to restructure" into "perfect timing — we configure for the new structure." Classic constraint reframe.', triggeredBy: 'timing', timestampSeconds: 62, createdAt: Date.now() },
      { id: 'd7-s2', type: 'close-attempt', headline: 'Silence before the close', body: '"I\'ll be quiet" after the key insight — textbook. The prospect needed space to decide and you gave it.', triggeredBy: 'close', timestampSeconds: 165, createdAt: Date.now() },
      { id: 'd7-s3', type: 'close-attempt', headline: 'Verbal commitment secured', body: '"Yes. Let\'s move forward. Get me the paperwork." — clean close. Deal won.', triggeredBy: 'paperwork', timestampSeconds: 195, createdAt: Date.now() },
    ],
    notes: ['Team splitting into two pods by July — configure platform for pod structure from day one', 'David is sold on product — future deals are about timing and exec confidence'],
    aiSummary: `WHAT WENT WELL
• Opened with a direct "where are you in your own head" question — no fluff
• Excellent constraint reframe: turned the restructure objection into a reason to buy now
• Perfect use of silence after the closing insight — let the prospect decide
• Talk ratio was 44% — David drove the final decision himself

GAPS
• None significant — this was a strong close execution

NEXT STEPS
• Send contract and onboarding questionnaire today
• Configure for two-pod structure (new business + expansion) ahead of July
• Schedule kick-off call for week 1 of June`,
    followUpEmail: `Hi David,

Really glad we got there today — it was a great conversation.

As promised, the contract and onboarding questionnaire are attached. I've noted in the onboarding doc that you're transitioning to a two-pod structure (new business + expansion) by July, and I'll make sure the platform is configured for that from day one.

I'd suggest we book a kick-off call for the first week of June so your team is ready to go well ahead of the July transition.

Looking forward to working with FinCore.

Best,
[Your name]`,
  },
  {
    id: 'demo-8',
    config: { prospectName: 'Rachel Torres', company: 'Bloom Media', callGoal: 'Introduce product', yourPitch: '', language: 'en-US', callType: 'cold' },
    durationSeconds: 198, finalCloseProbability: 22,
    objectionsCount: 3, callStage: 'opener', endedAt: '2026-05-18T13:30:00.000Z',
    leadScore: 25, talkRatio: 0.72, outcome: null,
    transcript: [
      { id: 'd8-t1', speaker: 'rep', text: 'Hi Rachel, this is a cold call — I\'ll be upfront about that. I saw Bloom Media just hired three new account executives last quarter. Is scaling the sales team an active focus?', timestampSeconds: 8, signal: 'neutral' },
      { id: 'd8-t2', speaker: 'prospect', text: 'Yes but I\'m not really the right person. I don\'t manage the sales team.', timestampSeconds: 26, signal: 'objection' },
      { id: 'd8-t3', speaker: 'rep', text: 'Got it — who does? I want to make sure I\'m talking to the right person rather than wasting anyone\'s time.', timestampSeconds: 38, signal: 'neutral' },
      { id: 'd8-t4', speaker: 'prospect', text: 'That\'d be Tom Bradley, our VP of Sales. But I\'d suggest going through the website — we get a lot of these calls.', timestampSeconds: 52, signal: 'objection' },
      { id: 'd8-t5', speaker: 'rep', text: 'I understand. Is there a direct email for Tom or would LinkedIn be better received?', timestampSeconds: 68, signal: 'neutral' },
      { id: 'd8-t6', speaker: 'prospect', text: 'I\'d just do LinkedIn honestly. Look, I need to jump.', timestampSeconds: 82, signal: 'objection' },
      { id: 'd8-t7', speaker: 'rep', text: 'Of course. Thanks for the referral Rachel — I appreciate it. Have a great rest of your day.', timestampSeconds: 96, signal: 'neutral' },
    ],
    suggestions: [
      { id: 'd8-s1', type: 'tip', headline: 'Wrong contact — got a referral anyway', body: 'Rachel isn\'t the decision maker. You got a referral to Tom Bradley (VP Sales) — that\'s a win from a 3-minute cold call.', triggeredBy: 'not the right person', timestampSeconds: 38, createdAt: Date.now() },
      { id: 'd8-s2', type: 'tip', headline: 'Talk ratio 72% — critical on cold calls', body: 'On a 3-minute call where you\'re being redirected, let the prospect guide. 72% talk time on a cold call loses you the conversation.', triggeredBy: 'talk ratio', timestampSeconds: 150, createdAt: Date.now() },
    ],
    notes: ['Tom Bradley, VP Sales at Bloom Media — target contact', 'LinkedIn is preferred channel per Rachel', 'Reference Rachel\'s name in the LinkedIn outreach'],
    aiSummary: `WHAT WENT WELL
• Good opener — referencing the hiring signal showed you'd done basic research
• Didn't burn the bridge — ended graciously and got a referral out of it
• Correct instinct to ask for the right contact rather than keep pitching the wrong person

GAPS
• Talk ratio at 72% — far too high for a cold call, especially when being redirected
• Didn't confirm Tom Bradley's LinkedIn URL or ask for an email intro from Rachel
• Could have asked one more qualifying question before pivoting to the referral ask

NEXT STEPS
• Find Tom Bradley on LinkedIn today — mention Rachel by name in the connection request
• Keep the message short: one line on what you do, one line on why it's relevant to a 3-AE hiring push`,
    followUpEmail: `Hi Tom,

Rachel Torres suggested I reach out to you directly — she mentioned you're the right person to speak to about sales team enablement at Bloom Media.

I'll keep it brief: we work with media agencies scaling their AE headcount to get new reps productive faster. Given you've hired three new account executives recently, I thought the timing might be relevant.

Worth 15 minutes this week?

Best,
[Your name]`,
  },
];

const DEMO_LOG: LearningLogEntry[] = [
  {
    id: 'log-1', timestamp: '', callsAnalyzed: 8, category: 'talk-ratio', severity: 'warning',
    headline: 'Noticed you open cold calls carrying most of the conversation — now prompting silence right after your opener so the prospect has space to respond.',
    body: '',
    expectedChange: 'Your talk ratio drops below 50% on cold calls',
    achieved: false,
  },
  {
    id: 'log-2', timestamp: '', callsAnalyzed: 7, category: 'closing', severity: 'improvement',
    headline: 'Close rate climbed each time you stayed in discovery longer — holding back pitch suggestions until at least two pain points have surfaced.',
    body: '',
    expectedChange: 'Average close probability rises above 75%',
    achieved: true,
  },
  {
    id: 'log-3', timestamp: '', callsAnalyzed: 6, category: 'objection-handling', severity: 'finding',
    headline: 'Price objections come up on most of your calls — pre-loading the ROI reframe so it appears before you respond to any pricing pushback.',
    body: '',
    expectedChange: 'Price objection response rate improves past 70%',
    achieved: false,
  },
  {
    id: 'log-4', timestamp: '', callsAnalyzed: 5, category: 'discovery', severity: 'improvement',
    headline: 'Consequence questions correlate with your strongest closes — surfacing more opportunities to use them before you move to pitch.',
    body: '',
    expectedChange: 'Consequence questions used in at least 3 of every 5 calls',
    achieved: true,
  },
];



const HIGH_PROB_THRESHOLD = 61;
const MED_PROB_THRESHOLD  = 31;

function probLevel(prob: number): 'high' | 'medium' | 'low' {
  return prob >= HIGH_PROB_THRESHOLD ? 'high' : prob >= MED_PROB_THRESHOLD ? 'medium' : 'low';
}

const animStyle = (i: number) => ({ '--i': i } as React.CSSProperties);


interface DashboardScreenProps {
  pastSessions: CallSession[];
  onStartCall: () => void;
  onUploadCall: () => void;
  onViewSession: (session: CallSession) => void;
  onDeleteSession: (id: string) => void;
  userName: string;
  learningLog?: LearningLogEntry[];
}

export function DashboardScreen({
  pastSessions, onStartCall, onUploadCall, onViewSession, onDeleteSession,
  userName, learningLog = [],
}: DashboardScreenProps) {
  const t = useTranslations();
  const { appLanguage } = useAppContext();
  const [activeTab, setActiveTab] = useState<'calls' | 'insights'>('calls');

  const isDemo = pastSessions.length === 0;
  const sessions      = isDemo ? DEMO_SESSIONS      : pastSessions;
  const activeLog     = isDemo ? DEMO_LOG            : learningLog;

  const totalCalls = sessions.length;
  const avgProb = Math.round(sessions.reduce((sum, s) => sum + s.finalCloseProbability, 0) / totalCalls);
  const totalObjections = sessions.reduce((sum, s) => sum + s.objectionsCount, 0);
  const streak = isDemo ? 5 : getStreak();
  const sortedSessions = useMemo(() => [...sessions].reverse(), [sessions]);

  return (
    <div className="dashboard">
      <main className="dashboard__main">

        {/* Greeting */}
        <div className="dashboard__greeting db-anim" style={animStyle(0)}>
          <div>
            <h1 className="dashboard__greeting-text">{t.dashboard.greeting(userName)}</h1>
            <p className="dashboard__subtitle">
              {streak > 0 ? t.dashboard.streakMessage(streak) : t.dashboard.tagline}
            </p>
          </div>
          <Button variant="ghost" size="md" onClick={onUploadCall}>⬆ {t.dashboard.uploadCall.toUpperCase()}</Button>
        </div>

        {/* Stats row */}
        <div className="dashboard__stats db-anim" style={animStyle(1)}>
          <div className="dashboard__stat-card">
            <div className="dashboard__stat-val">{totalCalls}</div>
            <div className="dashboard__stat-label">{t.dashboard.totalCalls.toUpperCase()}</div>
          </div>
          <div className="dashboard__stat-card">
            <div className={`dashboard__stat-val ${totalCalls ? `dashboard__stat-val--${probLevel(avgProb)}` : ''}`}>
              {totalCalls ? `${avgProb}%` : '-'}
            </div>
            <div className="dashboard__stat-label">{t.dashboard.avgCloseProb.toUpperCase()}</div>
          </div>
          <div className="dashboard__stat-card">
            <div className={`dashboard__stat-val ${totalObjections > 0 ? 'dashboard__stat-val--low' : ''}`}>
              {totalCalls ? totalObjections : '-'}
            </div>
            <div className="dashboard__stat-label">{t.dashboard.totalObjections.toUpperCase()}</div>
          </div>
          <div className="dashboard__stat-card">
            <div className="dashboard__stat-val dashboard__stat-val--high">
              {totalCalls ? formatDuration(Math.round(pastSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / totalCalls)) : '-'}
            </div>
            <div className="dashboard__stat-label">{t.dashboard.avgDuration.toUpperCase()}</div>
          </div>
          <div className="dashboard__stat-card">
            <div className={`dashboard__stat-val ${streak > 0 ? 'dashboard__stat-val--high' : ''}`}>
              {streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '-'}
            </div>
            <div className="dashboard__stat-label">{t.dashboard.practiceStreak.toUpperCase()}</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="dashboard__tabs db-anim" style={animStyle(3)}>
          <button
            className={`dashboard__tab${activeTab === 'calls' ? ' dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            {t.dashboard.recentCalls.toUpperCase()}
            <span className="dashboard__tab-count">{totalCalls}</span>
          </button>
          <button
            className={`dashboard__tab${activeTab === 'insights' ? ' dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            AI INSIGHTS
            {activeLog.length > 0 && (
              <span className="dashboard__tab-count dashboard__tab-count--accent">{activeLog.length}</span>
            )}
          </button>
        </div>

        {/* ── Calls tab ── */}
        {activeTab === 'calls' && (
          <div className="dashboard__section db-anim" style={animStyle(4)}>
            {totalCalls === 0 ? (
              <div className="dashboard__empty">
                <div className="dashboard__empty-icon">◎</div>
                <div className="dashboard__empty-title">{t.dashboard.noCalls}</div>
                <div className="dashboard__empty-desc">{t.dashboard.noCallsSub}</div>
                <Button variant="primary" size="md" onClick={onStartCall}>
                  ▶ {t.dashboard.startCall.toUpperCase()}
                </Button>
              </div>
            ) : (
              <div className="dashboard__call-list">
                {sortedSessions.map((session) => {
                  const probLvl = probLevel(session.finalCloseProbability);
                  return (
                    <div key={session.id ?? session.endedAt} className="dashboard__call-row" onClick={() => onViewSession(session)} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onViewSession(session)}>
                      <div className="dashboard__call-prospect">
                        <div className="dashboard__call-name">
                          {session.config.prospectName || 'Unknown prospect'}
                        </div>
                        <div className="dashboard__call-company">
                          {session.config.company || '-'} · {session.config.callGoal}
                        </div>
                      </div>

                      <div className="dashboard__call-meta">
                        <span className="dashboard__call-date">{formatDateShort(session.endedAt, appLanguage)}</span>
                      </div>

                      <div className="dashboard__call-stats">
                        <span className={`dashboard__call-prob dashboard__call-prob--${probLvl}`}>
                          {session.finalCloseProbability}%
                        </span>
                        <span className="dashboard__call-duration">{formatDuration(session.durationSeconds)}</span>
                        {session.objectionsCount > 0 && (
                          <span className="dashboard__call-obj">{session.objectionsCount} obj</span>
                        )}
                        <span className={`dashboard__call-stage dashboard__call-stage--${session.callStage}`}>
                          {session.callStage.toUpperCase()}
                        </span>
                        <span className="dashboard__call-view">{t.dashboard.viewSession.toUpperCase()} →</span>
                        <button
                          className="dashboard__call-delete"
                          aria-label={t.dashboard.deleteSession}
                          title={t.dashboard.deleteSession}
                          onClick={e => { e.stopPropagation(); onDeleteSession(session.id ?? session.endedAt); }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Insights tab ── */}
        {activeTab === 'insights' && (
          <div className="dashboard__section db-anim" style={animStyle(4)}>
            {activeLog.length === 0 ? (
              <div className="dashboard__empty">
                <div className="dashboard__empty-icon">◎</div>
                <div className="dashboard__empty-title">No insights yet</div>
                <div className="dashboard__empty-desc">
                  After {totalCalls < 3 ? `${3 - totalCalls} more call${3 - totalCalls !== 1 ? 's' : ''}` : 'your next call'}, your AI coach will start logging what it's learning about you and what it's changing.
                </div>
                {totalCalls === 0 && (
                  <Button variant="primary" size="md" onClick={onStartCall}>
                    ▶ {t.dashboard.startCall.toUpperCase()}
                  </Button>
                )}
              </div>
            ) : (
              <div className="dashboard__insights-wrap">
                <p className="dashboard__insights-header">Your AI coach is teaching itself from every call. Here's what it's picked up:</p>
                <ul className="dashboard__insights-list">
                  {activeLog.map(entry => (
                    <li key={entry.id} className={`dashboard__insights-item${entry.achieved ? ' dashboard__insights-item--done' : ''}`}>
                      <span className="dashboard__insights-text">{entry.headline}</span>
                      {entry.expectedChange && (
                        <span className={`dashboard__insights-expected${entry.achieved ? ' dashboard__insights-expected--achieved' : ''}`}>
                          {entry.achieved
                            ? <><span className="dashboard__insights-tick">✓</span> {entry.expectedChange}</>
                            : <><span className="dashboard__insights-circle">○</span> {entry.expectedChange}</>
                          }
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
