import type { CallSession } from '../types';

export const MOCK_SESSIONS: CallSession[] = [
  // ─── 1. Sarah Chen — strong close ──────────────────────────────────────────
  {
    config: {
      prospectName: '[Demo] Sarah Chen',
      company: 'Nexus Ventures',
      yourPitch: 'AI-powered sales coaching platform that gives reps real-time objection handling, live call scoring, and automated post-call summaries.',
      callGoal: 'Book a product demo',
      language: 'en-US',
    },
    transcript: [
      { id: 'm1-1',  speaker: 'rep',      text: "Hi, is this Sarah? Hey Sarah, this is Alex calling from PitchPlus. Hope I'm not catching you at a bad time — do you have about two minutes?", timestampSeconds: 5,   signal: 'neutral' },
      { id: 'm1-2',  speaker: 'prospect', text: "Yeah, sure, go ahead. What's this about?", timestampSeconds: 12,  signal: 'neutral' },
      { id: 'm1-3',  speaker: 'rep',      text: "Appreciate it. So the reason I'm reaching out — I was looking at Nexus Ventures and noticed your sales team has grown quite a bit over the past year. We work with growth-stage firms like yours to help sales reps close more consistently using real-time AI coaching during calls. Does that sound relevant at all?", timestampSeconds: 18,  signal: 'neutral' },
      { id: 'm1-4',  speaker: 'prospect', text: "Actually yeah, we've been struggling with that. Our reps are good individually but the performance gap between our top and bottom performers is huge. What exactly does the AI do?", timestampSeconds: 42,  signal: 'buying-signal' },
      { id: 'm1-5',  speaker: 'rep',      text: "Great question. So during a live call, the platform is listening in real time. The moment a prospect raises a price objection or goes quiet, it surfaces the exact rebuttal or question the rep should use — right on their screen, without any delay. It also tracks talk ratios, call stage, and close probability live so managers aren't flying blind.", timestampSeconds: 55,  signal: 'neutral' },
      { id: 'm1-6',  speaker: 'prospect', text: "Interesting. How long does it take to set up? We've had bad experiences with tools that take weeks to integrate.", timestampSeconds: 88,  signal: 'neutral' },
      { id: 'm1-7',  speaker: 'rep',      text: "Totally fair concern. Most teams are live within a day — there's no CRM integration required to start. You just download the desktop app, and reps are up and running. We do offer Salesforce and HubSpot sync if you want it, but it's optional.", timestampSeconds: 101, signal: 'neutral' },
      { id: 'm1-8',  speaker: 'prospect', text: "Okay that's better than I expected. What does pricing look like? We have about 12 reps.", timestampSeconds: 132, signal: 'buying-signal' },
      { id: 'm1-9',  speaker: 'rep',      text: "For a team of 12 you'd be looking at our Growth plan. But honestly, pricing is a lot easier to talk through once you've seen it in action — the ROI is usually pretty obvious. I'd love to set up a 30-minute demo where I walk you through a live call scenario with your team's actual use case. Would Thursday or Friday this week work?", timestampSeconds: 148, signal: 'neutral' },
      { id: 'm1-10', speaker: 'prospect', text: "Thursday afternoon could work. Maybe 2 or 3pm?", timestampSeconds: 178, signal: 'buying-signal' },
      { id: 'm1-11', speaker: 'rep',      text: "Thursday at 2pm works perfectly. I'll send a calendar invite with a Zoom link. Should I include anyone else from your team — your VP of Sales maybe?", timestampSeconds: 188, signal: 'neutral' },
      { id: 'm1-12', speaker: 'prospect', text: "Yeah, loop in Daniel — he's our Head of Revenue. He'll want to see this.", timestampSeconds: 208, signal: 'buying-signal' },
      { id: 'm1-13', speaker: 'rep',      text: "Perfect. I've got Sarah Chen and Daniel from Nexus Ventures, Thursday 2pm. I'll send the invite now. Is your email demo-sarah@example.com?", timestampSeconds: 218, signal: 'neutral' },
      { id: 'm1-14', speaker: 'prospect', text: "That's the one, yes.", timestampSeconds: 232, signal: 'neutral' },
      { id: 'm1-15', speaker: 'rep',      text: "Done. Really looking forward to it, Sarah. We'll make the 30 minutes worth your time.", timestampSeconds: 238, signal: 'neutral' },
      { id: 'm1-16', speaker: 'prospect', text: "Sounds good. See you Thursday.", timestampSeconds: 246, signal: 'neutral' },
    ],
    suggestions: [
      {
        id: 'ms1-s1',
        type: 'tip',
        headline: 'Strong buying signal — mirror the urgency',
        body: 'Prospect explicitly named a pain point (performance gap between reps). Reflect it back before pitching: "So the gap between your top and bottom performers is the core problem you\'re trying to solve — is that right?" This builds alignment before you present the solution.',
        triggeredBy: 'performance gap between our top and bottom performers is huge',
        timestampSeconds: 45,
        streaming: false,
      },
      {
        id: 'ms1-s2',
        type: 'objection-response',
        headline: 'Integration concern — lead with speed',
        body: 'When prospects say "bad experiences with tools that take weeks", the fear is implementation risk, not the tool itself. Anchor to time-to-value: "Most reps are live on their first call the same afternoon they download it." Then offer a proof point (customer name or stat) to make it concrete.',
        triggeredBy: 'We\'ve had bad experiences with tools that take weeks to integrate',
        timestampSeconds: 91,
        streaming: false,
      },
      {
        id: 'ms1-s3',
        type: 'close-attempt',
        headline: 'Prospect asked about pricing — pivot to demo',
        body: 'Price questions this early are a buying signal, not a gate. Don\'t quote a number yet — redirect: "I want to make sure I\'m quoting the right package for your setup. Can we spend 20 minutes walking through your current process so I can give you an accurate number?" This qualifies deeper and delays price until value is established.',
        triggeredBy: 'What does pricing look like?',
        timestampSeconds: 135,
        streaming: false,
      },
    ],
    durationSeconds: 487,
    finalCloseProbability: 72,
    objectionsCount: 1,
    callStage: 'close',
    endedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary: `CALL OUTCOME: Demo booked — Thursday 2pm with Sarah Chen and Daniel (Head of Revenue).

WHAT WENT WELL:
• Opened with a relevant observation (team growth) rather than a generic pitch — earned immediate engagement.
• Prospect self-identified the core pain (performance gap between reps) within the first 40 seconds, confirming good ICP targeting.
• Integration objection was handled cleanly with a same-day setup proof point before the prospect could escalate the concern.
• Instead of quoting price, pivoted to the demo — preserved perceived value and avoided premature price anchoring.
• Confirmed the correct decision-maker (Daniel, Head of Revenue) and ensured he's included in the demo.

AREAS TO IMPROVE:
• No social proof or customer reference was used during the pitch. A quick "we work with teams like [X] and saw Y result" would have strengthened credibility before the demo ask.
• Talk ratio was approximately 65% rep / 35% prospect. Aim for 50/50 or better in discovery — more questions would have surfaced additional pain points to use in the demo.

KEY SIGNALS DETECTED:
• "Our reps are good individually but the performance gap is huge" → validated ICP pain point.
• "What does pricing look like?" at the 2:12 mark → strong buying intent, price inquiry before seeing demo suggests budget is available.
• Voluntarily added Head of Revenue to demo invite → internal champion forming.

NEXT STEPS:
1. Send calendar invite immediately with a personalised agenda (not a generic Zoom link).
2. Research Daniel's LinkedIn before Thursday — know his background and priorities.
3. Prepare demo scenario around performance gap / rep consistency, not just feature walkthrough.
4. Have ROI calculator ready: 12 reps × estimated hours saved × average deal value.`,
    followUpEmail: `Subject: Demo confirmed — Thursday 2pm | PitchPlus × Nexus Ventures

Hi Sarah,

Great speaking with you just now. As promised, I've sent a calendar invite to you and Daniel for Thursday at 2:00pm — the Zoom link is in the invite.

To make the most of our 30 minutes together, I'll tailor the demo specifically around the challenge you mentioned: closing the performance gap between your top and bottom reps. Here's what I'm planning to cover:

  1. Live call walkthrough — I'll simulate a real objection scenario so you can see exactly what a rep sees on their screen during a call.
  2. Manager dashboard — how you can track talk ratios, call stage, and close probability across all 12 reps in one view.
  3. Onboarding timeline — since setup speed was important to you, I'll walk through exactly what day-one looks like.

If there's anything specific you'd like me to address for Daniel, or a particular use case you want me to demo, just reply and I'll work it in.

Looking forward to Thursday.

Best,
Alex
PitchPlus | alex@pitchplus.io | Book a time: cal.pitchplus.io/alex`,
    leadScore: 82,
    notes: [
      '0:42 Pain: performance gap between top & bottom reps',
      '2:12 Asked about pricing — buying signal, has budget',
      '3:28 Added Daniel (Head of Revenue) to demo — internal champion',
      'Demo: Thursday 2pm on Zoom',
    ],
  },

  // ─── 2. Marcus Williams — multiple objections, nurture ─────────────────────
  {
    config: {
      prospectName: '[Demo] Marcus Williams',
      company: 'PeakForce Solutions',
      yourPitch: 'AI-powered sales coaching platform that gives reps real-time objection handling, live call scoring, and automated post-call summaries.',
      callGoal: 'Qualify and pitch',
      language: 'en-US',
    },
    transcript: [
      { id: 'm2-1',  speaker: 'rep',      text: "Hi Marcus, this is Alex from PitchPlus. I know this is out of the blue — do you have 90 seconds?", timestampSeconds: 4,   signal: 'neutral' },
      { id: 'm2-2',  speaker: 'prospect', text: "I've got a minute. Make it quick.", timestampSeconds: 10,  signal: 'neutral' },
      { id: 'm2-3',  speaker: 'rep',      text: "Appreciate it. We build AI coaching software for sales teams — it sits in the background during calls and gives reps real-time guidance on objections and closing. I noticed PeakForce has been scaling its outbound team and thought it might be relevant. Is improving rep performance something that's on your radar right now?", timestampSeconds: 16,  signal: 'neutral' },
      { id: 'm2-4',  speaker: 'prospect', text: "Not really — we just signed a contract with another vendor three months ago for something similar. We're not looking to switch.", timestampSeconds: 40,  signal: 'objection' },
      { id: 'm2-5',  speaker: 'rep',      text: "That makes sense, and I'm not trying to get you to rip anything out. Can I ask — what's the tool doing well, and is there anything it's not covering yet?", timestampSeconds: 52,  signal: 'neutral' },
      { id: 'm2-6',  speaker: 'prospect', text: "Honestly it's fine. The main gap is post-call analysis — we don't get much from it after the call ends. Our manager has to listen to recordings manually.", timestampSeconds: 68,  signal: 'neutral' },
      { id: 'm2-7',  speaker: 'rep',      text: "That's actually a big differentiator for us — every call automatically generates a structured summary, objection log, and follow-up email draft within 60 seconds of the call ending. No manual review. When does your current contract come up for renewal?", timestampSeconds: 85,  signal: 'neutral' },
      { id: 'm2-8',  speaker: 'prospect', text: "We've got about seven months left on it. Look, even if we were interested, this isn't the right time. We just went through a platform migration and my team has zero bandwidth for another change right now.", timestampSeconds: 108, signal: 'objection' },
      { id: 'm2-9',  speaker: 'rep',      text: "Seven months is actually perfect timing to start evaluating — you'd have everything ready to switch the day the contract expires without any gap. And our onboarding literally takes one afternoon. But I hear you on bandwidth. What if I sent you something short you could look at when the timing is better?", timestampSeconds: 128, signal: 'neutral' },
      { id: 'm2-10', speaker: 'prospect', text: "Yeah sure, send it over. But honestly the cost is probably going to be an issue too — we're not in a position to add spend right now.", timestampSeconds: 152, signal: 'objection' },
      { id: 'm2-11', speaker: 'rep',      text: "Understood. For what it's worth, most teams offset the cost within the first month from fewer lost deals alone. But look — seven months out, let's not talk money today. I'll send you a two-pager and a short video. If anything resonates, we can reconnect closer to your renewal. Does that work?", timestampSeconds: 168, signal: 'neutral' },
      { id: 'm2-12', speaker: 'prospect', text: "That works. My email is demo-marcus@example.com.", timestampSeconds: 192, signal: 'neutral' },
      { id: 'm2-13', speaker: 'rep',      text: "Got it. I'll send that today. And I'll put a reminder in my calendar to follow up in about five months so the timing lines up with your renewal evaluation. Talk soon, Marcus.", timestampSeconds: 200, signal: 'neutral' },
    ],
    suggestions: [
      {
        id: 'ms2-s1',
        type: 'objection-response',
        headline: 'Vendor lock-in objection — find the gap',
        body: 'Don\'t challenge the existing vendor directly. Instead ask: "What\'s the one thing it doesn\'t do that you wish it did?" Almost every incumbent tool has a gap. Find it, then position around it. You\'re not replacing them — you\'re completing the picture.',
        triggeredBy: 'we just signed a contract with another vendor',
        timestampSeconds: 43,
        streaming: false,
      },
      {
        id: 'ms2-s2',
        type: 'tip',
        headline: 'Post-call analysis gap identified — double down',
        body: 'Prospect voluntarily named a pain point with their current tool (manual recording review). This is your wedge. Quantify it: "If your manager spends 3 hours a week reviewing recordings manually, that\'s 12 hours a month. What would they do with that time back?" Make the cost of inaction visible.',
        triggeredBy: 'Our manager has to listen to recordings manually',
        timestampSeconds: 72,
        streaming: false,
      },
      {
        id: 'ms2-s3',
        type: 'objection-response',
        headline: 'Timing + bandwidth objection — anchor to renewal',
        body: 'When a prospect says "not the right time," the antidote is a future anchor. Tie your follow-up to a specific event they already have on their calendar: "Your renewal is in 7 months — evaluations typically start 90 days before that. Can I reach out in April so you have time to make a proper comparison?" This turns a brush-off into a scheduled conversation.',
        triggeredBy: 'my team has zero bandwidth for another change right now',
        timestampSeconds: 112,
        streaming: false,
      },
    ],
    durationSeconds: 312,
    finalCloseProbability: 38,
    objectionsCount: 3,
    callStage: 'discovery',
    endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary: `CALL OUTCOME: Nurture — prospect agreed to receive materials, renewal in ~7 months.

WHAT WENT WELL:
• Handled the "already have a vendor" objection well — didn't argue, asked about gaps instead, which surfaced a real pain point (manual post-call review).
• Used the renewal timeline as a forward anchor rather than accepting the rejection.
• Secured email address and permission to follow up — call didn't end in a hard no.

AREAS TO IMPROVE:
• The post-call analysis gap was identified but not quantified. A stronger move: "If your manager spends 3–4 hours a week on manual recording review, that's 150+ hours a year. What would they do with that back?" Making the cost of inaction concrete would have created more urgency.
• Three objections in under 5 minutes signals the prospect was never fully engaged. The opener didn't establish enough relevance — a more personalised hook (referencing a specific PeakForce initiative or pain) may have earned more time.
• The pricing objection was sidestepped rather than addressed — a brief ROI stat would have been more persuasive than "most teams offset the cost within a month."

KEY SIGNALS DETECTED:
• "Our manager has to listen to recordings manually" → confirmed pain point with current vendor; this is the wedge for the follow-up conversation.
• "Seven months left on contract" → renewal anchor established; put follow-up in calendar for month 5.
• Gave email address without hesitation → not a hard no, warm enough to nurture.

NEXT STEPS:
1. Send two-pager and demo video today.
2. Set calendar reminder for 5 months out (reconnect before renewal evaluation begins).
3. Subject line for nurture email should reference the post-call analysis gap specifically.`,
    followUpEmail: `Subject: The post-call analysis gap — quick overview as promised

Hi Marcus,

Good speaking with you. As promised, I'm keeping this short.

You mentioned your manager currently reviews call recordings manually to coach the team — that's exactly the gap we built our post-call engine around. Here's what happens on PitchPlus automatically, within 60 seconds of every call ending:

  • Structured call summary (what was discussed, what objections came up, what was agreed)
  • Objection log with timestamps — so managers can jump straight to the moments that matter
  • AI-generated follow-up email draft, ready to send or edit
  • Lead score and close probability update

No recording review. No manual notes. Your manager gets a full picture of every call without listening to a single second of audio.

I've attached a two-page overview and linked a 4-minute product walkthrough below. No fluff — just the core workflow.

→ Watch the 4-min walkthrough: pitchplus.io/demo-video

I know the timing isn't right today, and I'll respect that. I'll reach out again around the time your renewal evaluation would naturally kick off — but if anything changes before then, you've got my details.

Cheers,
Alex
PitchPlus | alex@pitchplus.io`,
    leadScore: 41,
    notes: [
      '1:08 Pain: manager reviews call recordings manually — no automated post-call analysis',
      '1:48 Contract expires in ~7 months — set follow-up for month 5',
      '2:32 Bandwidth concern: recent platform migration, team stretched',
      '2:52 Budget sensitivity flagged — pricing objection raised',
    ],
  },

  // ─── 3. Priya Patel — warm inbound, easy close ─────────────────────────────
  {
    config: {
      prospectName: '[Demo] Priya Patel',
      company: 'CloudBridge Inc.',
      yourPitch: 'AI-powered sales coaching platform that gives reps real-time objection handling, live call scoring, and automated post-call summaries.',
      callGoal: 'Book a demo and confirm budget',
      language: 'en-US',
    },
    transcript: [
      { id: 'm3-1',  speaker: 'rep',      text: "Hi Priya, this is Alex from PitchPlus. You filled out a form on our site earlier today — thanks for reaching out. Is now a good time to chat?", timestampSeconds: 5,   signal: 'neutral' },
      { id: 'm3-2',  speaker: 'prospect', text: "Yes, perfect timing actually. I've been looking at a few sales coaching tools and yours kept coming up. I wanted to understand it better.", timestampSeconds: 14,  signal: 'buying-signal' },
      { id: 'm3-3',  speaker: 'rep',      text: "Great — I love hearing that. What prompted the search? Is there a specific problem you're trying to solve or a trigger event?", timestampSeconds: 24,  signal: 'neutral' },
      { id: 'm3-4',  speaker: 'prospect', text: "We're scaling from 5 to 15 reps over the next two quarters. Right now coaching is entirely ad hoc — I sit in on calls when I can, but that obviously doesn't scale. I need something systematic.", timestampSeconds: 34,  signal: 'buying-signal' },
      { id: 'm3-5',  speaker: 'rep',      text: "That's a really common inflection point — the manual approach works fine at 5 reps but it completely breaks down at 10+. What does your current coaching process look like exactly? How are you identifying which reps need help and on what?", timestampSeconds: 58,  signal: 'neutral' },
      { id: 'm3-6',  speaker: 'prospect', text: "Honestly it's mostly gut feel and whatever comes up in the weekly one-on-ones. I don't have visibility into what's actually happening on calls unless I listen to the recording, which I rarely have time for.", timestampSeconds: 74,  signal: 'buying-signal' },
      { id: 'm3-7',  speaker: 'rep',      text: "So the core problem is you have no real-time visibility and the feedback loop is too slow — reps could be repeating the same mistakes for weeks before you catch it. Does that sound right?", timestampSeconds: 98,  signal: 'neutral' },
      { id: 'm3-8',  speaker: 'prospect', text: "Exactly. That's exactly it. And when we hire new reps, onboarding is slow because they don't have guardrails during live calls.", timestampSeconds: 112, signal: 'buying-signal' },
      { id: 'm3-9',  speaker: 'rep',      text: "Perfect — that actually maps directly to two features I want to make sure you see in the demo. The live coaching overlay is what new reps lean on most — it's like having a senior rep whispering in their ear. And the manager dashboard gives you a live view of every call's stage, talk ratio, and close probability without needing to listen in. Two specific questions: what does your tech stack look like — are you on Salesforce, HubSpot?", timestampSeconds: 122, signal: 'neutral' },
      { id: 'm3-10', speaker: 'prospect', text: "HubSpot. And we use Zoom for calls.", timestampSeconds: 152, signal: 'neutral' },
      { id: 'm3-11', speaker: 'rep',      text: "Both integrate natively — good to know. Last question before we nail down a demo time: has budget been allocated for tooling like this, or would this need to go through an approval process?", timestampSeconds: 160, signal: 'neutral' },
      { id: 'm3-12', speaker: 'prospect', text: "We have a sales enablement budget that I control. I've already set aside budget for this quarter for exactly this type of tool. I just need to see the right fit.", timestampSeconds: 178, signal: 'buying-signal' },
      { id: 'm3-13', speaker: 'rep',      text: "That's exactly what I needed to hear. Let's get a demo on the calendar — I'll build it around your HubSpot + Zoom setup and show you the onboarding workflow for new reps specifically. Does Thursday or Friday work?", timestampSeconds: 196, signal: 'neutral' },
      { id: 'm3-14', speaker: 'prospect', text: "Friday morning is ideal — say 10am?", timestampSeconds: 214, signal: 'buying-signal' },
      { id: 'm3-15', speaker: 'rep',      text: "Friday 10am, locked in. I'll send the invite with an agenda so you know exactly what we'll cover. Is there anyone else I should loop in?", timestampSeconds: 222, signal: 'neutral' },
      { id: 'm3-16', speaker: 'prospect', text: "Just me for now. If I like what I see I'll pull in my CTO before signing anything, but I'm the primary decision maker.", timestampSeconds: 234, signal: 'buying-signal' },
      { id: 'm3-17', speaker: 'rep',      text: "Perfect. Friday 10am, you and me, tailored to HubSpot and new rep onboarding. Really looking forward to it, Priya.", timestampSeconds: 248, signal: 'neutral' },
    ],
    suggestions: [
      {
        id: 'ms3-s1',
        type: 'tip',
        headline: 'Inbound lead — qualify deep before presenting',
        body: 'Inbound leads have high intent but often have already formed opinions. Resist the urge to pitch immediately. Ask: "What\'ve you already looked at, and what\'s your reaction so far?" Understanding their comparison set lets you position against competitors without being asked to.',
        triggeredBy: "I've been looking at a few sales coaching tools",
        timestampSeconds: 17,
        streaming: false,
      },
      {
        id: 'ms3-s2',
        type: 'tip',
        headline: 'Scaling trigger identified — frame urgency around it',
        body: 'Hiring from 5 to 15 reps is a hard deadline. Use it: "If your first new hire starts in 6 weeks and the tool isn\'t in place, they\'re going to spend their first month building bad habits you\'ll have to undo. How soon do you need something live?" Prospect-defined urgency is always stronger than yours.',
        triggeredBy: 'scaling from 5 to 15 reps over the next two quarters',
        timestampSeconds: 38,
        streaming: false,
      },
      {
        id: 'ms3-s3',
        type: 'close-attempt',
        headline: 'Budget confirmed, decision maker confirmed — move to close',
        body: 'Prospect has budget control and is the primary decision maker. The demo is the last gate before a proposal. Frame Friday\'s session as a buying meeting, not just a demo: "I want Friday to be the session where you walk away knowing exactly what you\'d get and what it costs, so you can make a decision. Is that the right expectation to set?"',
        triggeredBy: "I've already set aside budget for this quarter",
        timestampSeconds: 181,
        streaming: false,
      },
    ],
    durationSeconds: 634,
    finalCloseProbability: 89,
    objectionsCount: 0,
    callStage: 'close',
    endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary: `CALL OUTCOME: Highly qualified — demo booked Friday 10am. Strong close probability.

WHAT WENT WELL:
• Excellent discovery — asked about the specific trigger (scaling 5→15 reps) and let the prospect self-articulate the pain before presenting any features.
• Confirmed BANT in full: Budget (sales enablement budget, already allocated), Authority (primary decision maker), Need (systematic coaching at scale), Timeline (this quarter).
• Mapped demo content to the exact pain points raised rather than giving a standard walkthrough — new rep onboarding + manager dashboard.
• Integration questions asked early (HubSpot + Zoom) so demo can be personalised.
• No pressure applied — prospect was guided to the demo naturally.

AREAS TO IMPROVE:
• No competitor intelligence gathered. Prospect mentioned "a few tools" — asking which ones would reveal the comparison set and let you pre-empt their objections before the demo.
• CTO is a late-stage stakeholder — could have asked "What would make your CTO comfortable with this decision?" to prepare for the eventual technical review.

KEY SIGNALS DETECTED:
• Inbound form submission → highest-intent lead type.
• "I've already set aside budget" → no financial gate.
• "I'm the primary decision maker" → single-threaded deal, one person to convince.
• 0 objections across a 10-minute call → minimal resistance, needs only a good demo to close.

NEXT STEPS:
1. Send personalised demo invite with agenda focused on HubSpot integration and new-rep onboarding workflow.
2. Research Priya's LinkedIn + CloudBridge's recent hires to personalise the opening of the demo.
3. Prepare a competitor comparison slide (she mentioned evaluating others — know who you're up against).
4. At demo end: present pricing and ask for a decision timeline directly.`,
    followUpEmail: `Subject: Friday 10am confirmed — your personalised PitchPlus demo

Hi Priya,

Really enjoyed our conversation — it's clear you've thought carefully about what systematic coaching needs to look like as CloudBridge scales.

As promised, Friday at 10am is confirmed. I've sent a calendar invite with the Zoom link.

Here's exactly what I'll cover, tailored to what you shared:

  1. New rep onboarding in practice — I'll walk through what a first-week rep sees on their screen during a live call, and how the AI coaching overlay gives them guardrails without requiring a manager in the room.

  2. The manager dashboard — live view of every call's stage, talk ratio, and close probability across your entire team. No recording review. No waiting for weekly one-on-ones to catch problems.

  3. HubSpot + Zoom integration — I'll show you exactly how call data flows into HubSpot automatically so your pipeline is always up to date after every call.

  4. Onboarding timeline — from the moment you say go to your first rep being fully live, so you know exactly what the ramp looks like.

At the end I'll share pricing for a team at your growth stage. My goal is that you walk away from Friday knowing exactly what you'd get and what it costs — no need for a follow-up just to get a number.

If there's anything specific you want me to demo or a scenario you want to walk through, just reply and I'll work it in.

See you Friday!

Alex
PitchPlus | alex@pitchplus.io | cal.pitchplus.io/alex`,
    leadScore: 94,
    notes: [
      '0:34 Trigger: scaling 5→15 reps in 2 quarters — systematic coaching needed',
      '1:18 Pain: no real-time visibility, feedback loop too slow, bad habits persist weeks',
      '1:52 Pain: new rep onboarding is slow without guardrails during live calls',
      '2:32 Stack: HubSpot + Zoom — both native integrations confirmed',
      '2:58 Budget: sales enablement budget allocated, Priya controls it',
      '3:18 Authority: primary decision maker — CTO only involved at signing',
      'Demo: Friday 10am',
    ],
  },

  // ─── 4. James O'Brien — cold lead, disengaged ──────────────────────────────
  {
    config: {
      prospectName: "[Demo] James O'Brien",
      company: 'Ironclad Sales Co.',
      yourPitch: 'AI-powered sales coaching platform that gives reps real-time objection handling, live call scoring, and automated post-call summaries.',
      callGoal: 'Re-engage cold lead and book a call',
      language: 'en-US',
    },
    transcript: [
      { id: 'm4-1',  speaker: 'rep',      text: "Hi James, this is Alex from PitchPlus. We spoke briefly about six months ago — you'd asked me to follow up around now. Is this still a decent time?", timestampSeconds: 4,   signal: 'neutral' },
      { id: 'm4-2',  speaker: 'prospect', text: "Uh, I don't really remember that conversation to be honest. What is it you're selling?", timestampSeconds: 14,  signal: 'neutral' },
      { id: 'm4-3',  speaker: 'rep',      text: "Totally fair — it was a quick chat. We build AI coaching software for sales reps — it listens during calls and surfaces real-time guidance for objections and closing. At the time you mentioned Ironclad was looking at ways to improve rep performance consistency.", timestampSeconds: 22,  signal: 'neutral' },
      { id: 'm4-4',  speaker: 'prospect', text: "Yeah, we actually hired a sales manager since then who handles all the coaching internally. We're good on that front.", timestampSeconds: 42,  signal: 'objection' },
      { id: 'm4-5',  speaker: 'rep',      text: "That's great — having a dedicated coaching manager makes a real difference. Can I ask, is he coaching reps before calls, after, or in real time during calls?", timestampSeconds: 54,  signal: 'neutral' },
      { id: 'm4-6',  speaker: 'prospect', text: "Mostly post-call. He listens to recordings and gives feedback in the weekly team meeting.", timestampSeconds: 66,  signal: 'neutral' },
      { id: 'm4-7',  speaker: 'rep',      text: "Got it. The gap with post-call coaching is the feedback comes too late to save the deal that already slipped. The rep doesn't know they mishandled the objection until after the prospect has gone cold. Does that ever come up — reps getting feedback and saying 'I wish I'd known that during the call'?", timestampSeconds: 76,  signal: 'neutral' },
      { id: 'm4-8',  speaker: 'prospect', text: "I mean, sure, but look — we've got a system that's working fine. I don't see the ROI in adding another tool when we just went through a hiring process to solve this.", timestampSeconds: 100, signal: 'objection' },
      { id: 'm4-9',  speaker: 'rep',      text: "That's completely fair. I'm not here to sell you something you don't need. Is there any aspect of rep performance that's still not where you'd like it — conversion rate, ramp time for new hires, anything like that?", timestampSeconds: 116, signal: 'neutral' },
      { id: 'm4-10', speaker: 'prospect', text: "Our ramp time could be better. New reps take about four months to hit quota. But honestly I think that's a hiring and training issue, not a tooling issue. I appreciate the call but I think we're all set for now.", timestampSeconds: 134, signal: 'objection' },
      { id: 'm4-11', speaker: 'rep',      text: "Understood. Four months to ramp is pretty typical, but for what it's worth, teams using live call coaching tend to cut that in half. I won't push — if circumstances change or headcount grows, I'd love to reconnect. Can I follow up in about six months?", timestampSeconds: 156, signal: 'neutral' },
      { id: 'm4-12', speaker: 'prospect', text: "Sure, reach out in the fall. I gotta run.", timestampSeconds: 174, signal: 'neutral' },
    ],
    suggestions: [
      {
        id: 'ms4-s1',
        type: 'objection-response',
        headline: '"We hired someone for that" — find the gap in human coaching',
        body: 'A new sales manager doesn\'t eliminate the need for in-call tools — it shifts the dynamic. Ask: "Is your manager able to coach reps during calls, or only after?" Post-call feedback always comes too late to save the deal. Position as complementary to the manager, not a replacement for them.',
        triggeredBy: 'we actually hired a sales manager since then',
        timestampSeconds: 45,
        streaming: false,
      },
      {
        id: 'ms4-s2',
        type: 'tip',
        headline: 'Ramp time identified as a pain — quantify it',
        body: 'Four months to ramp is a $$ problem. Calculate it: "If a rep\'s OTE is $80K and they\'re at 40% productivity for 4 months, you\'re losing $13K per new hire in unrealised revenue. If we cut ramp by 6 weeks, that\'s $5K+ per rep recovered. At your growth rate, how many new reps are you bringing on this year?" Make the cost of slow ramp concrete before they dismiss it as a "training issue."',
        triggeredBy: 'New reps take about four months to hit quota',
        timestampSeconds: 137,
        streaming: false,
      },
    ],
    durationSeconds: 198,
    finalCloseProbability: 18,
    objectionsCount: 2,
    callStage: 'opener',
    endedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary: `CALL OUTCOME: No immediate opportunity — nurture until fall. Ramp time is the potential wedge.

WHAT WENT WELL:
• Handled the "we hired a sales manager" objection by pivoting to how human coaching and AI coaching are complementary rather than substitutes.
• Probed for residual pain even after a clear objection — uncovered the ramp time issue.
• Didn't overstay welcome — closed cleanly with a future follow-up rather than burning the relationship.

AREAS TO IMPROVE:
• The ramp time pain point was identified ("four months to quota") but not monetised. A quick calculation of the revenue cost of slow ramp — even a rough estimate — could have shifted the conversation from "tooling issue" to "revenue issue."
• Prospect didn't remember the initial conversation, which signals the original outreach wasn't memorable enough. Future re-engagements should reference something specific to Ironclad (a trigger event, a hire, a piece of content they published) rather than relying on the prospect to remember a generic call.
• No social proof used — a competitor case study ("a team of similar size cut ramp from 4 months to 6 weeks") could have made the ramp argument more persuasive.

KEY SIGNALS DETECTED:
• "We hired a sales manager" → existing coaching infrastructure, but gaps remain.
• "Post-call coaching" confirmed → no in-call real-time coverage, this is the gap.
• "Four months to ramp" → concrete pain point with direct revenue implications.
• "I think that's a training issue, not a tooling issue" → prospect is rationalising, not objectively evaluating — needs a quantified reframe.

NEXT STEPS:
1. Follow up in 5 months — reference the ramp time conversation specifically.
2. Send a short case study on reducing ramp time (not a general brochure).
3. Monitor Ironclad's LinkedIn for new sales hires — that's the re-engagement trigger.`,
    followUpEmail: `Subject: Circling back in the fall — and one quick stat on ramp time

Hi James,

Thanks for the time today. As promised, I'll reach out again in the fall — I've made a note for September.

One thing I wanted to leave you with: you mentioned your new reps take about four months to hit quota. That's pretty common, and you're right that training plays a big role. But there's a specific part of ramp that tooling consistently moves the needle on — the period where reps know what to say but freeze under pressure during live calls.

That's exactly what the in-call coaching layer addresses. One of our customers (a 12-rep B2B team) cut average ramp from 16 weeks to 9 weeks. The manager's coaching didn't change — reps just had a safety net during calls while they were building muscle memory.

Not asking you to do anything with this now. Just wanted to leave a more specific data point than I did on the call.

Speak in the fall,

Alex
PitchPlus | alex@pitchplus.io`,
    leadScore: 22,
    notes: [
      '0:42 Sales manager hired 6 months ago — handles coaching post-call in weekly meeting',
      '1:34 Pain: 4-month ramp time — prospect frames as training/hiring issue, not tooling',
      'Follow-up: September / fall — reference ramp time specifically',
    ],
  },

  // ─── 5. Amara Osei — strong discovery, VP approval needed ──────────────────
  {
    config: {
      prospectName: '[Demo] Amara Osei',
      company: 'Meridian Growth',
      yourPitch: 'AI-powered sales coaching platform that gives reps real-time objection handling, live call scoring, and automated post-call summaries.',
      callGoal: 'Pitch and close, or get to next stage',
      language: 'en-US',
    },
    transcript: [
      { id: 'm5-1',  speaker: 'rep',      text: "Hi Amara, this is Alex from PitchPlus — do you have a couple of minutes?", timestampSeconds: 4,   signal: 'neutral' },
      { id: 'm5-2',  speaker: 'prospect', text: "Sure, a couple. What's this about?", timestampSeconds: 11,  signal: 'neutral' },
      { id: 'm5-3',  speaker: 'rep',      text: "We build AI coaching software for sales teams. The short version is it helps reps handle objections better and close more consistently without needing a manager on every call. I noticed Meridian Growth has been scaling outbound — is rep performance consistency something you're actively working on?", timestampSeconds: 18,  signal: 'neutral' },
      { id: 'm5-4',  speaker: 'prospect', text: "Yeah, actually. We've got eight reps and the spread is massive — our top two are crushing it but the other six are all over the place. I've tried listening to calls, doing training sessions, but it's not moving the needle fast enough.", timestampSeconds: 38,  signal: 'buying-signal' },
      { id: 'm5-5',  speaker: 'rep',      text: "That's classic 80/20 — two reps carrying the team. And the frustrating thing is the other six usually have the knowledge, they just can't execute it under pressure when a prospect pushes back. Is that what you're seeing?", timestampSeconds: 64,  signal: 'neutral' },
      { id: 'm5-6',  speaker: 'prospect', text: "Exactly. They know the answers in theory but when a prospect says 'too expensive' or 'not now,' they either fold or go into a panic pitch. It's painful to listen to.", timestampSeconds: 78,  signal: 'buying-signal' },
      { id: 'm5-7',  speaker: 'rep',      text: "So the problem isn't knowledge — it's execution under pressure. That's specifically what we built for. When a rep hears 'too expensive,' the platform surfaces the right rebuttal on their screen in real time — they don't have to think, they can just deliver. Want me to show you what that looks like?", timestampSeconds: 96,  signal: 'neutral' },
      { id: 'm5-8',  speaker: 'prospect', text: "Yes, I'd like to see that. What does it cost though? We're growing but budget isn't unlimited.", timestampSeconds: 116, signal: 'buying-signal' },
      { id: 'm5-9',  speaker: 'rep',      text: "Totally fair question. For a team of 8 you're looking at our Growth plan — it's $X per rep per month, so around $Y all in. But here's the way I'd frame it: if improving the bottom six reps by even 20% lifts your team's close rate, what does that mean in revenue terms for you?", timestampSeconds: 130, signal: 'neutral' },
      { id: 'm5-10', speaker: 'prospect', text: "I mean, it would be significant. Our average deal is about $8K. Even closing one extra deal a month across those reps would more than cover it.", timestampSeconds: 152, signal: 'buying-signal' },
      { id: 'm5-11', speaker: 'rep',      text: "That's exactly the math our customers run. And typically they're seeing 2–3 extra closes per rep per quarter within 60 days. So on a team of 8, that's meaningful uplift. Does this feel like something worth moving forward on?", timestampSeconds: 170, signal: 'neutral' },
      { id: 'm5-12', speaker: 'prospect', text: "It does. My concern is I'm not the only decision maker here — my VP of Sales would need to sign off on any new tooling. I can't commit without him.", timestampSeconds: 192, signal: 'objection' },
      { id: 'm5-13', speaker: 'rep',      text: "That makes complete sense. What's the best way to get him involved — would it make sense for me to put together something you could share with him first, or would it be better to get him on a call together?", timestampSeconds: 208, signal: 'neutral' },
      { id: 'm5-14', speaker: 'prospect', text: "Probably a call together. He'll want to ask his own questions. Let me check his calendar and I'll get back to you with some times.", timestampSeconds: 224, signal: 'buying-signal' },
      { id: 'm5-15', speaker: 'rep',      text: "Perfect. I'll send you a summary of what we covered today and a one-pager you can forward to him ahead of the call — that way he has context going in. What's a good email for you?", timestampSeconds: 238, signal: 'neutral' },
      { id: 'm5-16', speaker: 'prospect', text: "demo-amara@example.com. And honestly this is the most relevant call I've had about this problem in months — I'll make sure he makes time.", timestampSeconds: 254, signal: 'buying-signal' },
      { id: 'm5-17', speaker: 'rep',      text: "That means a lot. I'll send that over within the hour. Looking forward to the three-way call, Amara.", timestampSeconds: 268, signal: 'neutral' },
    ],
    suggestions: [
      {
        id: 'ms5-s1',
        type: 'tip',
        headline: '80/20 pain confirmed — name the real problem',
        body: 'Prospect has diagnosed the symptom (performance gap) but not the root cause. Name it for them: "In my experience, the bottom performers almost always know the right answers — they just can\'t access them under pressure when a prospect pushes back. The problem isn\'t training, it\'s execution in the moment." When you name their problem more precisely than they can, you immediately become the most credible person in the room.',
        triggeredBy: 'our top two are crushing it but the other six are all over the place',
        timestampSeconds: 42,
        streaming: false,
      },
      {
        id: 'ms5-s2',
        type: 'objection-response',
        headline: 'Early price question — anchor with ROI before quoting',
        body: 'Don\'t give a number without a value frame. Before quoting: "Before I give you a number, let me make sure I\'m quoting the right package — and I want you to have the context to judge whether it\'s worth it. If you close one additional deal per rep per quarter, what does that mean in revenue?" Get them to say the number. Then your price looks small next to their answer.',
        triggeredBy: "What does it cost though?",
        timestampSeconds: 118,
        streaming: false,
      },
      {
        id: 'ms5-s3',
        type: 'close-attempt',
        headline: 'VP stakeholder surfaced — multi-thread the deal now',
        body: 'Don\'t let the VP become a mystery blocker. Ask: "What matters most to your VP when evaluating a tool like this — is it ROI, implementation risk, or something else?" Understanding his buying criteria lets you prepare a proposal that speaks directly to his priorities rather than a generic deck. Also ask: "Is there anyone else who would weigh in besides you and your VP?"',
        triggeredBy: "my VP of Sales would need to sign off on any new tooling",
        timestampSeconds: 195,
        streaming: false,
      },
    ],
    durationSeconds: 551,
    finalCloseProbability: 61,
    objectionsCount: 2,
    callStage: 'pitch',
    endedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary: `CALL OUTCOME: Strong prospect — VP of Sales sign-off required before close. Three-way call to be scheduled.

WHAT WENT WELL:
• Outstanding discovery — prospect self-diagnosed the exact problem (reps fold under pressure on objections) before the product was presented. The pitch that followed mapped precisely to that pain.
• The ROI reframe was effective: prospect independently calculated that one extra deal per month covers the cost — that's the most powerful close there is (prospect convinces themselves).
• Handled the VP objection constructively — offered a joint call rather than just materials, which keeps momentum and avoids the summary email becoming a dead end.
• Prospect ended the call with "most relevant call I've had about this problem in months" — extremely high disposition.

AREAS TO IMPROVE:
• VP's priorities were not explored. Before agreeing to the three-way call, should have asked: "What does your VP care about most when evaluating a new tool — ROI, implementation risk, security, something else?" Without this, the joint call risks being a generic pitch rather than a targeted conversation.
• No timeline established — when does Meridian need a decision by? Is there a quarter-end pressure, a new hire cohort starting, a board review? A timeline gives the deal urgency.
• Pricing was quoted before value was fully anchored. The ROI question came after the number, not before — next time reverse the order.

KEY SIGNALS DETECTED:
• "They fold or go into a panic pitch" → rep explicitly described the product's core use case unprompted — maximum relevance confirmed.
• "Even closing one extra deal a month would more than cover it" → prospect self-justified the ROI, which is the strongest close available.
• "Most relevant call I've had about this problem in months" → exceptionally high disposition; deal is winnable.
• VP of Sales approval needed → multi-stakeholder deal, need to prepare for technical and strategic objections from a different buyer profile.

NEXT STEPS:
1. Send summary and one-pager within the hour as promised.
2. One-pager should be addressed to the VP — focus on ROI, implementation risk, and time-to-value (not features).
3. Before the three-way call: ask Amara "What's your VP's biggest concern about new tooling?" so you're not walking in blind.
4. Establish a decision timeline on the three-way call.`,
    followUpEmail: `Subject: Summary from our call + one-pager for your VP

Hi Amara,

As promised — here's a summary of what we covered, plus a one-pager formatted for your VP to review ahead of our three-way call.

WHAT WE DISCUSSED:

The core problem you're solving: your top 2 reps are performing strongly, but the remaining 6 reps have inconsistent performance — particularly when handling objections like "too expensive" or "not now." They know the answers in theory but can't execute under pressure during live calls.

How PitchPlus addresses it: The platform sits in the background during every call. The moment a rep hears an objection, it surfaces the right response on their screen in real time — no hesitation, no panic pitch. Managers get a live dashboard showing every rep's call stage, talk ratio, and close probability without needing to sit in on calls.

THE MATH WE RAN:
• 8 reps × $8K average deal
• If the bottom 6 reps close just 1 additional deal per month: $48K in additional monthly revenue
• PitchPlus Growth plan for 8 reps: a fraction of that

WHAT'S ATTACHED:
The one-pager is written for your VP — it covers ROI framing, implementation timeline (most teams live within a day), and what the onboarding process looks like for managers specifically.

For the three-way call, it would help me to know one thing in advance: what's your VP's biggest concern when evaluating a new sales tool — is it ROI, implementation disruption, or something else? That way I can make sure the call is worth his time.

Looking forward to meeting him.

Alex
PitchPlus | alex@pitchplus.io | cal.pitchplus.io/alex`,
    leadScore: 65,
    notes: [
      '0:38 Pain: top 2 reps crushing it, bottom 6 inconsistent — 80/20 problem',
      '1:18 Root cause: reps know answers but fold under pressure on objections',
      '2:34 ROI: $8K avg deal — 1 extra close/month covers cost, prospect self-calculated',
      '3:12 VP of Sales needs to sign off — three-way call being scheduled',
      '4:14 Strong disposition: "most relevant call I\'ve had about this problem in months"',
    ],
  },
];
