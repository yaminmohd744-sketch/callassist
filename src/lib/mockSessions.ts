import type { CallSession } from '../types';

export const MOCK_SESSIONS: CallSession[] = [
  {
    config: {
      prospectName: 'Sarah Chen',
      company: 'Nexus Ventures',
      yourPitch: 'AI-powered sales coaching platform',
      callGoal: 'Book a demo',
      language: 'en-US',
    },
    transcript: [],
    suggestions: [],
    durationSeconds: 487,
    finalCloseProbability: 72,
    objectionsCount: 1,
    callStage: 'close',
    endedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary:
      'Strong opener with good rapport building. Prospect showed clear buying intent after the ROI breakdown. One pricing objection was handled effectively by anchoring to competitor cost. Recommended next step: send proposal by EOD.',
    followUpEmail:
      'Hi Sarah,\n\nGreat speaking with you today! As promised, I\'m sending over the proposal for Nexus Ventures.\n\nBased on our conversation, the platform would save your team roughly 4 hours per rep per week on call coaching. At your current team size of 12 reps, that\'s 48 hours a week back in your pipeline.\n\nI\'ve attached the pricing breakdown we discussed. Let me know if you\'d like to hop on a quick 15-minute call to go over any questions.\n\nLooking forward to working together!\n\nBest,\n[Your name]',
    leadScore: 82,
    notes: ['1:23 Mentioned Q3 budget review', '3:45 Interested in team analytics feature'],
  },
  {
    config: {
      prospectName: 'Marcus Williams',
      company: 'PeakForce Solutions',
      yourPitch: 'AI-powered sales coaching platform',
      callGoal: 'Qualify & pitch',
      language: 'en-US',
    },
    transcript: [],
    suggestions: [],
    durationSeconds: 312,
    finalCloseProbability: 38,
    objectionsCount: 3,
    callStage: 'discovery',
    endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary:
      'Prospect raised multiple objections around timing and current vendor lock-in. Discovery uncovered a team of 8 reps with no formal coaching process. Recommend nurture sequence — revisit in Q4 when their current contract expires.',
    followUpEmail:
      'Hi Marcus,\n\nThanks for taking the time today. I know you\'re locked into your current setup until Q4, so I don\'t want to rush anything.\n\nI\'ll check back in October — by then I\'d love to show you what\'s changed and put together a side-by-side comparison for your team.\n\nIn the meantime, feel free to reach out if anything changes.\n\nCheers,\n[Your name]',
    leadScore: 41,
    notes: ['0:55 Current contract ends October', '2:10 Team of 8 SDRs, no coaching tool'],
  },
  {
    config: {
      prospectName: 'Priya Patel',
      company: 'CloudBridge Inc.',
      yourPitch: 'AI-powered sales coaching platform',
      callGoal: 'Book a demo',
      language: 'en-US',
    },
    transcript: [],
    suggestions: [],
    durationSeconds: 634,
    finalCloseProbability: 89,
    objectionsCount: 0,
    callStage: 'close',
    endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary:
      'Exceptional call. Prospect was already researching solutions and had budget approved. No objections raised. Demo booked for Thursday at 2pm. Warm lead — high probability of close within 2 weeks.',
    followUpEmail:
      'Hi Priya,\n\nSo glad we connected! I\'ve sent a calendar invite for Thursday at 2pm for the demo.\n\nI\'ll tailor the walkthrough specifically to CloudBridge\'s onboarding use case and the manager dashboard you asked about.\n\nSee you Thursday!\n\n[Your name]',
    leadScore: 94,
    notes: ['Budget already approved', 'Decision maker on the call', 'Demo booked Thu 2pm'],
  },
  {
    config: {
      prospectName: 'James O\'Brien',
      company: 'Ironclad Sales Co.',
      yourPitch: 'AI-powered sales coaching platform',
      callGoal: 'Re-engage cold lead',
      language: 'en-US',
    },
    transcript: [],
    suggestions: [],
    durationSeconds: 198,
    finalCloseProbability: 18,
    objectionsCount: 2,
    callStage: 'opener',
    endedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary:
      'Short call — prospect was busy and disengaged from the start. Mentioned they recently hired a sales manager who handles coaching internally. Worth a follow-up in 6 months if their headcount grows.',
    followUpEmail:
      'Hi James,\n\nNo worries at all — sounds like you\'ve got coaching covered with the new hire. I\'ll circle back in a few months.\n\nIf anything changes or the team scales up, don\'t hesitate to reach out.\n\n[Your name]',
    leadScore: 22,
    notes: ['New sales manager hired internally'],
  },
  {
    config: {
      prospectName: 'Amara Osei',
      company: 'Meridian Growth',
      yourPitch: 'AI-powered sales coaching platform',
      callGoal: 'Pitch & close',
      language: 'en-US',
    },
    transcript: [],
    suggestions: [],
    durationSeconds: 551,
    finalCloseProbability: 61,
    objectionsCount: 2,
    callStage: 'pitch',
    endedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    aiSummary:
      'Good discovery phase — uncovered pain around inconsistent rep performance. Pricing objection came up mid-pitch; handled with a monthly plan offer. Prospect wants to loop in their VP of Sales before committing. Follow up with a one-pager.',
    followUpEmail:
      'Hi Amara,\n\nReally enjoyed our conversation! I\'ve put together a one-pager summarising the key points we covered and the ROI breakdown for a team your size.\n\nWhenever you\'re ready to loop in your VP, I\'m happy to join a 20-minute intro call. Just send over a time that works.\n\nLooking forward to it!\n\n[Your name]',
    leadScore: 65,
    notes: ['2:30 VP of Sales needs to approve', '4:10 Pain: inconsistent rep performance'],
  },
];
