import { useState } from 'react';
import './MarketingCarouselsScreen.css';

interface Slide {
  type: 'hook' | 'dialogue' | 'stat' | 'list' | 'content' | 'cta';
  label?: string;
  headline: string;
  accentLine?: string;
  body?: string;
  stat?: string;
  statSub?: string;
  items?: { icon?: string; text: string; sub?: string; no?: boolean }[];
  dialogue?: { who: string; text: string; accent?: boolean }[];
  closingLine?: string;
  closingAccent?: string;
}

interface Carousel {
  id: string;
  num: number;
  title: string;
  type: 'Pain' | 'Education' | 'Demo' | 'Social Proof' | 'Comparison' | 'Story';
  persona: string;
  slides: Slide[];
}

const CAROUSELS: Carousel[] = [
  {
    id: 'c01', num: 1, title: 'The Freeze', type: 'Pain', persona: 'SDR / BDR',
    slides: [
      {
        type: 'hook',
        label: 'EVERY SALESPERSON KNOWS THIS',
        headline: 'You lost\nthat deal.',
        accentLine: 'Not because\nyou didn\'t try.',
        body: 'You froze when it mattered most.\nAnd the prospect felt it.',
      },
      {
        type: 'dialogue',
        label: 'SOUND FAMILIAR?',
        headline: 'The prospect says something unexpected.',
        dialogue: [
          { who: 'PROSPECT SAYS', text: '"We already have something for that."', accent: true },
          { who: 'YOU SAY', text: '"Oh... yeah... I mean... we\'re actually different because..."' },
        ],
        closingLine: 'That\'s where',
        closingAccent: 'deals go to die.',
      },
      {
        type: 'stat',
        label: 'THE DATA',
        stat: '48%',
        statSub: 'of SDRs are afraid\nto pick up the phone.',
        headline: 'You\'re not alone.',
        body: '44% quit after the first rejection.\nIt\'s not skill. It\'s anxiety under pressure.',
      },
      {
        type: 'content',
        label: 'THE ROOT CAUSE',
        headline: 'The problem isn\'t\npreparation.',
        accentLine: 'It\'s the gap between\nprep and live pressure.',
        body: 'You ran the roleplay. You know the script.\nBut nobody is there when it goes sideways.',
      },
      {
        type: 'content',
        label: 'THE SOLUTION',
        headline: 'What if you had\na coach in your ear.',
        accentLine: 'On every call.',
        body: 'Not reviewing the recording afterwards.\nRight now, while the prospect is talking.',
      },
      {
        type: 'cta',
        label: 'TRY IT FREE',
        headline: 'The freeze\nstops here.',
        accentLine: 'Real-time AI coaching\non every call.',
        body: '7-day free trial · No card needed\nWorks on phone, Zoom, Teams — anywhere.',
      },
    ],
  },
  {
    id: 'c02', num: 2, title: 'The $10K Call', type: 'Pain', persona: 'AE',
    slides: [
      {
        type: 'hook',
        label: 'AES — THIS IS FOR YOU',
        headline: 'One call.\n$10,000.',
        accentLine: 'No second\nchances.',
        body: 'This is what Account Executives\nface every single day.',
      },
      {
        type: 'content',
        label: 'THE SETUP',
        headline: '4 months in.\nDiscovery, demo,\nproposal — done.',
        accentLine: 'The close call is today.',
        body: 'You either close it now or watch it go dark.\nEvery word matters. Every second of silence counts.',
      },
      {
        type: 'dialogue',
        label: 'THE MOMENT',
        headline: 'Then the prospect says...',
        dialogue: [
          { who: 'PROSPECT SAYS', text: '"We need to think about it."', accent: true },
        ],
        closingLine: 'Do you push? Back off?',
        closingAccent: 'One wrong move and the deal dies.',
      },
      {
        type: 'content',
        label: 'THE SIGNAL',
        headline: 'Top AEs don\'t guess.',
        accentLine: 'They read the signal.\nPitchr tells you when to close.',
        body: 'Live close probability. Buying signal detection.\nThe moment a prospect leans in — you know.',
      },
      {
        type: 'content',
        label: 'AFTER THE CALL',
        headline: 'AI-generated\nfollow-up.\n30 seconds.',
        accentLine: 'Done before they\nleave their desk.',
        body: 'Personalised to what was actually said.\nNo more staring at a blank doc after high-stakes calls.',
      },
      {
        type: 'cta',
        label: 'READY TO CLOSE',
        headline: 'The $10K call.',
        accentLine: 'You deserve to\nbe ready for it.',
        body: '7-day free trial · Real-time AI coaching\nfor AEs who close.',
      },
    ],
  },
  {
    id: 'c03', num: 3, title: 'Cold Call Survival Guide', type: 'Pain', persona: 'SDR / BDR',
    slides: [
      {
        type: 'hook',
        label: 'STEAL THESE SCRIPTS',
        headline: '5 objections\nkilling your\ncold calls.',
        accentLine: 'And the exact words\nto handle each one.',
      },
      {
        type: 'list',
        label: 'OBJECTION 1',
        headline: '"We already have\na solution."',
        items: [
          { icon: '✗', text: 'DON\'T: "Oh, what are you using?"', no: true },
          { icon: '✓', text: 'DO: "What\'s the one thing you wish it did better?"', sub: 'Reframe as curiosity, not competition.' },
        ],
      },
      {
        type: 'list',
        label: 'OBJECTION 2',
        headline: '"Send me some\ninformation."',
        items: [
          { icon: '✗', text: 'DON\'T: "Sure! I\'ll send that over."', no: true },
          { icon: '✓', text: 'DO: "What specifically would you want to understand? I\'ll send exactly that."', sub: 'Requalify before you hit send.' },
        ],
      },
      {
        type: 'list',
        label: 'OBJECTIONS 3–5',
        headline: '"Budget." "Bad timing."\n"Just email me."',
        items: [
          { icon: '✓', text: '"Is budget the blocker — or is it more about priority?"' },
          { icon: '✓', text: '"When\'s the clock on [their problem]? Now might be exactly the right time."' },
          { icon: '✓', text: '"What would make it worth 10 minutes on a call?"', sub: 'Be direct. Ask for what you want.' },
        ],
      },
      {
        type: 'content',
        label: 'THE HARD PART',
        headline: 'These work better\nwhen you don\'t have\nto remember them.',
        accentLine: 'Pitchr feeds you the right\nresponse the moment\nthe objection is detected.',
        body: 'Live. On the call. Before the silence gets awkward.',
      },
      {
        type: 'cta',
        label: 'TRY IT FREE',
        headline: 'The objection\nhandler that shows\nup on your calls.',
        accentLine: 'pitchr.org',
        body: 'Free trial · Works on any call',
      },
    ],
  },
  {
    id: 'c04', num: 4, title: 'Talk Less, Close More', type: 'Education', persona: 'AE / SDR',
    slides: [
      {
        type: 'hook',
        label: 'COUNTERINTUITIVE BUT TRUE',
        headline: 'Top closers\ntalk less\nthan you do.',
        accentLine: 'The data that changes\nhow you sell.',
      },
      {
        type: 'stat',
        label: 'THE NUMBER',
        stat: '43%',
        statSub: 'Top 1% AEs talk\n43% of the time.',
        headline: 'Most reps talk 80%+.',
        body: 'The difference isn\'t talent.\nIt\'s knowing when to stop.',
      },
      {
        type: 'content',
        label: 'THE REASON',
        headline: 'Reps over-talk\nbecause of anxiety.',
        accentLine: 'Silence isn\'t awkward.\nIt\'s productive.',
        body: 'Every sentence you add when a prospect is thinking\n= a mistake. Silence is the close.',
      },
      {
        type: 'list',
        label: 'THE 3 QUESTIONS',
        headline: 'That let prospects\nclose themselves.',
        items: [
          { icon: '1', text: '"What\'s the #1 thing stopping you from moving forward today?"' },
          { icon: '2', text: '"If we could solve [their pain] — what would that change?"' },
          { icon: '3', text: '"What would need to be true for this to be a yes?"' },
        ],
        closingAccent: 'Then stop talking.',
      },
      {
        type: 'content',
        label: 'THE TOOL',
        headline: 'Know your talk\nratio. Live.',
        accentLine: 'Pitchr tracks it\non every call.',
        body: 'When you\'ve been carrying the conversation too long,\nPitchr nudges you. It\'s a trackable metric now.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Less talking.\nMore listening.\nMore closing.',
        accentLine: 'pitchr.org',
        body: 'Real-time AI coaching on every call.',
      },
    ],
  },
  {
    id: 'c05', num: 5, title: 'The Follow-Up Framework', type: 'Education', persona: 'AE / SDR',
    slides: [
      {
        type: 'hook',
        label: 'SAVE THIS ONE',
        headline: 'Your follow-up\nemails are being\nignored.',
        accentLine: 'A 5-part fix.',
      },
      {
        type: 'list',
        label: 'THE MISTAKES',
        headline: 'You\'re writing\nabout you.\nNot them.',
        items: [
          { icon: '✗', text: '"Following up on our call."', no: true },
          { icon: '✗', text: '"Just checking in."', no: true },
          { icon: '✗', text: '"Wanted to circle back."', no: true },
        ],
        closingLine: 'None of these',
        closingAccent: 'give a reason to reply.',
      },
      {
        type: 'list',
        label: 'PARTS 1 & 2',
        headline: 'Start with their\nwords. One value\nstatement.',
        items: [
          { icon: '1', text: '"You mentioned Q3 targets — I\'ve been thinking about the gap you described."', sub: 'Reference their words. Doubles reply rate.' },
          { icon: '2', text: '"Based on what you described, the biggest lever is [X]..."', sub: 'One thing. One outcome. Not a feature list.' },
        ],
      },
      {
        type: 'list',
        label: 'PARTS 3–5',
        headline: 'Two options.\nFive sentences.\nNever say this.',
        items: [
          { icon: '3', text: '"I have 15 mins on [day] or [day] — which works?"', sub: 'Two options. Not open-ended.' },
          { icon: '4', text: 'Keep it under 5 sentences.', sub: 'Long emails signal no respect for their time.' },
          { icon: '5', text: 'Delete "just checking in" forever.', sub: '"Just" signals low status. Remove it.' },
        ],
      },
      {
        type: 'content',
        label: 'THE SHORTCUT',
        headline: 'Pitchr writes\nthis email for\nyou.',
        accentLine: 'In 30 seconds.\nAfter every call.',
        body: 'Based on what was actually said.\nReferences their words. Under 5 sentences. Done.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Stop writing\nfollow-ups\nfrom scratch.',
        accentLine: 'pitchr.org',
        body: 'AI writes them for you, automatically.',
      },
    ],
  },
  {
    id: 'c06', num: 6, title: 'The Discovery Framework', type: 'Education', persona: 'AE / SDR',
    slides: [
      {
        type: 'hook',
        label: 'TOP 1% SECRET',
        headline: 'Most reps pitch\ntoo early.',
        accentLine: 'Top reps never\npitch first.',
      },
      {
        type: 'content',
        label: 'THE MISTAKE',
        headline: 'Deals die in\ndiscovery because\nyou pitched too soon.',
        accentLine: 'Before they feel understood,\nthey can\'t be sold.',
        body: 'Discovery isn\'t the setup for the pitch.\nIt IS the pitch.',
      },
      {
        type: 'list',
        label: 'QUESTIONS 1–3',
        headline: 'The opening\nquestions.',
        items: [
          { icon: '1', text: '"What made you take this call today?"', sub: 'Reveals buying intent. Your map for the conversation.' },
          { icon: '2', text: '"What\'s the cost of leaving the current situation as is?"', sub: 'Make them say the pain out loud. That creates urgency.' },
          { icon: '3', text: '"What have you already tried?"', sub: 'Shows respect. Reveals your opening.' },
        ],
      },
      {
        type: 'list',
        label: 'QUESTIONS 4–6',
        headline: 'The close-setup\ntrio.',
        items: [
          { icon: '4', text: '"If you could wave a magic wand — what would you fix?"', sub: 'Surfaces their dream outcome.' },
          { icon: '5', text: '"What would need to be true to decide by [timeframe]?"', sub: 'Maps the decision timeline.' },
          { icon: '6', text: '"Who else needs to be part of this decision?"', sub: 'Uncovers stakeholders before they surprise you.' },
        ],
      },
      {
        type: 'content',
        label: 'THE HARD PART',
        headline: 'Knowing these\nisn\'t enough.',
        accentLine: 'Adapting them live\n— that\'s the skill.',
        body: 'Pitchr suggests the next best question\nbased on what the prospect is actually saying.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Discovery that\nbuilds the deal\nfrom question one.',
        accentLine: 'pitchr.org',
        body: 'Try free for 7 days.',
      },
    ],
  },
  {
    id: 'c07', num: 7, title: 'Pitchr Live — AI in Action', type: 'Demo', persona: 'SDR / AE',
    slides: [
      {
        type: 'hook',
        label: 'SEE IT IN ACTION',
        headline: 'This AI listens\nto your call and\ntells you what to say.',
        accentLine: 'Live. Not after.\nRight now.',
      },
      {
        type: 'content',
        label: 'HOW IT WORKS',
        headline: 'While you talk,\nPitchr is listening.',
        accentLine: 'Your invisible\nco-pilot.',
        body: 'Detects objections, buying signals, tone shifts.\nSurfaces the right response in a panel only you can see.',
      },
      {
        type: 'dialogue',
        label: 'LIVE — OBJECTION DETECTED',
        headline: 'Prospect pushes back.',
        dialogue: [
          { who: 'PROSPECT SAYS', text: '"Your price is too high."', accent: true },
          { who: 'PITCHR SUGGESTS', text: '"What\'s the cost of the problem you\'re trying to solve? Let\'s compare that to what this costs."' },
        ],
        closingLine: 'You see it.',
        closingAccent: 'You say it. You move on.',
      },
      {
        type: 'dialogue',
        label: 'LIVE — BUYING SIGNAL',
        headline: 'The moment most reps miss.',
        dialogue: [
          { who: 'PROSPECT SAYS', text: '"This looks interesting — what does onboarding look like?"', accent: true },
          { who: 'PITCHR SUGGESTS', text: '"Glad you asked — if that works for your timeline, when could we start?"' },
        ],
        closingLine: 'You catch it.',
        closingAccent: 'Every time.',
      },
      {
        type: 'stat',
        label: 'REAL-TIME',
        stat: '81%',
        statSub: 'Close probability.\nUpdates live on every call.',
        headline: 'No more guessing.',
        body: 'After the call: AI summary + follow-up email\nin 30 seconds. Automatic.',
      },
      {
        type: 'cta',
        label: 'TRY IT',
        headline: 'Try Pitchr on\nyour next call.',
        accentLine: 'Works on any call.\nPhone, Zoom, Teams, anywhere.',
        body: 'pitchr.org · 7-day free trial · No card needed',
      },
    ],
  },
  {
    id: 'c08', num: 8, title: 'From 0 to Quota', type: 'Social Proof', persona: 'SDR / BDR',
    slides: [
      {
        type: 'hook',
        label: 'A REAL STORY',
        headline: 'She went from\nfreezing on calls to',
        accentLine: 'Top 10%\nin 90 days.',
        body: 'Here\'s the exact change she made.',
      },
      {
        type: 'content',
        label: 'MONTH 1',
        headline: '48 dials.\n4 connects.\n0 booked.',
        accentLine: 'The pitch was perfect.\nThe live calls weren\'t.',
        body: 'She knew the objection handlers.\nBut live pressure wiped everything clean.',
      },
      {
        type: 'content',
        label: 'THE CHANGE',
        headline: 'Stop trying\nto remember.\nStart having a co-pilot.',
        accentLine: 'She started using\nPitchr on every call.',
        body: 'Phone calls, not just Zoom. Pitchr fed her\nthe objection handler the moment she needed it.',
      },
      {
        type: 'stat',
        label: 'MONTH 2',
        stat: '+3',
        statSub: 'Meetings booked\nin the first week.',
        headline: 'Same dials. Different calls.',
        body: 'First objection handled live.\nFirst "yes to a meeting."',
      },
      {
        type: 'list',
        label: 'THE SYSTEM',
        headline: 'The 4 habits\nbehind the\nimprovement.',
        items: [
          { icon: '1', text: 'Pre-call: reviewed prospect context in Pitchr' },
          { icon: '2', text: 'Live: let Pitchr handle responses when she went blank' },
          { icon: '3', text: 'Post-call: used AI summary to build the follow-up' },
          { icon: '4', text: 'Weekly: reviewed close probability trends in analytics' },
        ],
        closingAccent: 'Consistent process > talent.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Start your\n90-day\ntransformation.',
        accentLine: 'Not a crutch.\nAn upgrade.',
        body: 'pitchr.org · 7-day free trial',
      },
    ],
  },
  {
    id: 'c09', num: 9, title: 'Close Rate Dashboard', type: 'Social Proof', persona: 'AE / Manager',
    slides: [
      {
        type: 'hook',
        label: 'THE DATA',
        headline: 'What a 34%\nclose rate increase\nlooks like in practice.',
        accentLine: 'The before/after\nfrom real teams.',
      },
      {
        type: 'content',
        label: 'BEFORE',
        headline: 'Record. Review.\nDebrief. Forget.\nRepeat.',
        accentLine: 'The deal is already dead\nby Friday\'s coaching.',
        body: 'The feedback delay is days.\nThe prospect has already moved on.',
      },
      {
        type: 'content',
        label: 'AFTER',
        headline: 'Objection.\nPitchr.\nResponse. Win.',
        accentLine: 'The loop collapses\nfrom days to seconds.',
        body: 'Every rep handles the same way.\nCoaching happens during the call.',
      },
      {
        type: 'list',
        label: 'THE METRICS',
        headline: 'What changed\nin 90 days.',
        items: [
          { icon: '↑', text: 'Objections handled successfully: 42% → 71%' },
          { icon: '↑', text: 'Meetings booked per 100 dials: 6.2 → 8.9' },
          { icon: '↑', text: 'Average close rate: 18% → 24%' },
          { icon: '↑', text: 'Same-day follow-up sent: 34% → 91%' },
        ],
      },
      {
        type: 'content',
        label: 'THE REAL WIN',
        headline: 'The floor raised\nfor the whole\nteam.',
        accentLine: 'Consistency.\nNot just individual wins.',
        body: 'Before: top rep closed 3x more than the bottom.\nAfter: the range narrowed. Every rep performed.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Build the team\nthat coaches\nitself.',
        accentLine: 'pitchr.org',
        body: 'Free trial · Team plans available.',
      },
    ],
  },
  {
    id: 'c10', num: 10, title: 'Pitchr vs The Old Way', type: 'Comparison', persona: 'All',
    slides: [
      {
        type: 'hook',
        label: 'A TAKE',
        headline: 'Reviewing call\nrecordings is',
        accentLine: 'coaching\nthe corpse.',
      },
      {
        type: 'content',
        label: 'THE OLD WAY',
        headline: 'Record. Review.\nDebrief.\nTry to remember.',
        accentLine: 'The deal is already\ndead.',
        body: 'Post-call coaching is a post-mortem.\nBy the time you know what went wrong, it\'s gone.',
      },
      {
        type: 'list',
        label: 'THE NEW WAY',
        headline: 'Hear it.\nRespond. Win.',
        items: [
          { icon: '✓', text: 'Real-time coaching during the call' },
          { icon: '✓', text: 'Works on phone calls (not just Zoom/Teams)' },
          { icon: '✓', text: '10 languages — competitors: English only' },
          { icon: '✓', text: 'Self-serve — no demo, no contract, no platform fee' },
          { icon: '✓', text: 'Body language camera coaching' },
        ],
      },
      {
        type: 'content',
        label: 'THE FRICTION',
        headline: 'You shouldn\'t\nneed a 45-minute\ndemo.',
        accentLine: 'Pitchr is self-serve.\nStart in 5 minutes.',
        body: 'Most enterprise tools: procurement, platform fee,\n12-month contract. Pitchr: sign up and download.',
      },
      {
        type: 'content',
        label: 'THE DIFFERENCE',
        headline: 'Same calls.\nDifferent outcomes.',
        accentLine: 'No demo required.',
        body: 'Post-call coaching can\'t help you mid-call.\nReal-time coaching can. That\'s the whole difference.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Stop coaching\nthe corpse.',
        accentLine: 'Coach the call.',
        body: 'No card. No demo. No contract.\npitchr.org',
      },
    ],
  },
  {
    id: 'c11', num: 11, title: 'Why Pitchr Exists', type: 'Story', persona: 'All',
    slides: [
      {
        type: 'hook',
        label: 'THE STORY',
        headline: 'I lost a deal\nbecause I froze\non the phone.',
        accentLine: '$40,000.\nThat\'s why I built Pitchr.',
      },
      {
        type: 'content',
        label: 'THE CALL',
        headline: '8 months in.\nA referral.\nMy biggest ever.',
        accentLine: 'The prospect signed\nwith a competitor\non Wednesday.',
        body: 'I stumbled. I over-explained. The call went cold.\nOne question I didn\'t have a clean answer for.',
      },
      {
        type: 'content',
        label: 'THE FEEDBACK',
        headline: 'The coaching\ncame on Friday.',
        accentLine: 'The deal was gone\non Wednesday.',
        body: 'My manager\'s advice was perfect.\nThe timing was useless. Feedback days late is a lesson, not a correction.',
      },
      {
        type: 'content',
        label: 'THE QUESTION',
        headline: 'What if the\ncoaching came\nduring the call?',
        accentLine: 'Not after. Not in a 1:1.\nRight then.',
        body: 'What if — in the exact moment I was blanking —\nthe right response just... appeared?',
      },
      {
        type: 'content',
        label: 'THE BUILD',
        headline: 'That\'s what\nPitchr is.',
        accentLine: 'Built for the rep\non their own.',
        body: 'Not the enterprise with enablement managers.\nThe individual rep who can\'t afford to lose another deal.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Every rep\ndeserves a coach\non every call.',
        accentLine: 'The unfair advantage.\nOn every call.',
        body: '7-day free trial · No card needed\npitchr.org',
      },
    ],
  },
  {
    id: 'c12', num: 12, title: 'Body Language + 10 Languages', type: 'Demo', persona: 'AE / Manager',
    slides: [
      {
        type: 'hook',
        label: 'SOMETHING NOBODY ELSE DOES',
        headline: 'Your AI sales\ncoach',
        accentLine: 'can see you too.',
        body: 'Body language coaching.\nOn your live calls.',
      },
      {
        type: 'stat',
        label: 'THE SCIENCE',
        stat: '93%',
        statSub: 'of communication\nis nonverbal.',
        headline: 'Most sales tools ignore\n93% of the call.',
        body: 'Tone. Posture. Eye contact.\nYour prospect reads all of it — and so does Pitchr.',
      },
      {
        type: 'list',
        label: 'CAMERA COACHING',
        headline: 'What Pitchr\'s\ncamera watches\nfor.',
        items: [
          { icon: '◎', text: 'Eye contact — camera vs. looking away' },
          { icon: '◈', text: 'Posture — open/engaged vs. closed/retreating' },
          { icon: '✦', text: 'Expression — does your tone match your face?' },
          { icon: '⚠', text: 'Nervous energy — fidgeting, filler words' },
        ],
        closingAccent: 'Live nudges. During the call.',
      },
      {
        type: 'list',
        label: '10 LANGUAGES',
        headline: 'Your coach speaks\nyour prospect\'s\nlanguage.',
        items: [
          { icon: '🇺🇸', text: 'English · Spanish · French · German' },
          { icon: '🇧🇷', text: 'Portuguese · Italian · Dutch · Polish' },
          { icon: '🇯🇵', text: 'Japanese · Korean' },
        ],
        closingLine: 'Gong, Wingman, Salesken:',
        closingAccent: 'English only.',
      },
      {
        type: 'content',
        label: 'THE FULL PICTURE',
        headline: 'Words. Body\nlanguage. 10\nlanguages. One tool.',
        accentLine: 'No enterprise lock-in.\nNo English-only limitation.',
        body: 'The most complete real-time coaching tool\nbuilt for the rep who actually makes calls.',
      },
      {
        type: 'cta',
        label: 'PITCHR',
        headline: 'Coach everything.\nMiss nothing.',
        accentLine: 'pitchr.org',
        body: 'Body language + real-time coaching + 10 languages.\nStart free, 7 days on us.',
      },
    ],
  },
];

const TYPE_COLORS: Record<Carousel['type'], string> = {
  'Pain':         '#ff4444',
  'Education':    '#814ac8',
  'Demo':         '#df7afe',
  'Social Proof': '#39d353',
  'Comparison':   '#f0a500',
  'Story':        '#4a9eff',
};

function SlideView({ slide, num, total }: { slide: Slide; num: number; total: number }) {
  return (
    <div className={`mcs-slide mcs-slide--${slide.type}`}>
      {/* Glow */}
      <div className="mcs-slide__glow" />

      {/* Top row: logo + counter */}
      <div className="mcs-slide__top">
        <span className="mcs-slide__logo">Pitchr</span>
        <span className="mcs-slide__counter">{num} / {total}</span>
      </div>

      {/* Content */}
      <div className="mcs-slide__body">
        {slide.label && (
          <div className="mcs-slide__label">
            <span className="mcs-slide__label-dash" />
            {slide.label}
          </div>
        )}

        {slide.type === 'stat' && slide.stat && (
          <>
            <div className="mcs-slide__stat">{slide.stat}</div>
            {slide.statSub && <p className="mcs-slide__stat-sub">{slide.statSub}</p>}
          </>
        )}

        <h2 className="mcs-slide__headline">{slide.headline}</h2>

        {slide.accentLine && (
          <p className="mcs-slide__accent">{slide.accentLine}</p>
        )}

        {slide.type === 'dialogue' && slide.dialogue && (
          <div className="mcs-slide__dialogues">
            {slide.dialogue.map((d, i) => (
              <div key={i} className={`mcs-slide__bubble${d.accent ? ' mcs-slide__bubble--accent' : ''}`}>
                <span className="mcs-slide__bubble-who">{d.who}</span>
                <span className="mcs-slide__bubble-text">{d.text}</span>
              </div>
            ))}
          </div>
        )}

        {slide.type === 'list' && slide.items && (
          <ul className="mcs-slide__list">
            {slide.items.map((item, i) => (
              <li key={i} className={`mcs-slide__list-item${item.no ? ' mcs-slide__list-item--no' : ''}`}>
                {item.icon && <span className="mcs-slide__list-icon">{item.icon}</span>}
                <span className="mcs-slide__list-text">
                  {item.text}
                  {item.sub && <span className="mcs-slide__list-sub"> — {item.sub}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {slide.body && <p className="mcs-slide__sub">{slide.body}</p>}

        {(slide.closingLine || slide.closingAccent) && (
          <div className="mcs-slide__closing">
            {slide.closingLine && <span className="mcs-slide__closing-plain">{slide.closingLine} </span>}
            {slide.closingAccent && <span className="mcs-slide__closing-accent">{slide.closingAccent}</span>}
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="mcs-slide__dots">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`mcs-slide__dot${i === num - 1 ? ' mcs-slide__dot--active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export function MarketingCarouselsScreen({ onBack }: { onBack: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  const carousel = CAROUSELS[activeIdx];
  const slide = carousel.slides[slideIdx];
  const total = carousel.slides.length;

  function selectCarousel(idx: number) {
    setActiveIdx(idx);
    setSlideIdx(0);
  }

  function prev() { setSlideIdx(i => Math.max(0, i - 1)); }
  function next() { setSlideIdx(i => Math.min(total - 1, i + 1)); }

  const nextSlide = slideIdx < total - 1 ? carousel.slides[slideIdx + 1] : null;

  return (
    <div className="mcs">
      {/* Sidebar */}
      <aside className="mcs__sidebar">
        <button className="mcs__back" onClick={onBack}>← Back</button>
        <div className="mcs__sidebar-title">Marketing Carousels</div>
        <div className="mcs__sidebar-sub">12 carousels · Instagram + TikTok</div>
        <div className="mcs__list">
          {CAROUSELS.map((c, i) => (
            <button
              key={c.id}
              className={`mcs__item${i === activeIdx ? ' mcs__item--active' : ''}`}
              onClick={() => selectCarousel(i)}
            >
              <span className="mcs__item-num">{String(c.num).padStart(2, '0')}</span>
              <span className="mcs__item-body">
                <span className="mcs__item-name">{c.title}</span>
                <span className="mcs__item-type" style={{ color: TYPE_COLORS[c.type] }}>{c.type}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Viewer */}
      <main className="mcs__main">
        <div className="mcs__viewer">
          {/* Slide */}
          <div className="mcs__slide-area">
            <button className="mcs__nav mcs__nav--prev" onClick={prev} disabled={slideIdx === 0} aria-label="Previous">‹</button>
            <div className="mcs__slide-frame" key={`${activeIdx}-${slideIdx}`}>
              <SlideView slide={slide} num={slideIdx + 1} total={total} />
            </div>
            <button className="mcs__nav mcs__nav--next" onClick={next} disabled={slideIdx === total - 1} aria-label="Next">›</button>
          </div>

          {/* Next slide preview label */}
          {nextSlide && (
            <div className="mcs__next-label">
              SLIDE {String(slideIdx + 2).padStart(2, '0')} — {nextSlide.label ?? nextSlide.headline.toUpperCase().replace(/\n/g, ' ').slice(0, 28)}
            </div>
          )}

          {/* Next slide preview */}
          {nextSlide && (
            <div className="mcs__next-preview">
              <SlideView slide={nextSlide} num={slideIdx + 2} total={total} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
