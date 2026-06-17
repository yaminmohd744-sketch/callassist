import { useState, useEffect, useCallback, useRef } from 'react';
import './CarouselLibrarySection.css';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface SlideItem {
  icon?: string;
  text: string;
  sub?: string;
}

interface Slide {
  bg: 'black' | 'surface' | 'elevated' | 'grad' | 'purple-dark';
  label?: string;
  labelVariant?: 'default' | 'red' | 'green' | 'white';
  num?: number;
  headline?: string;
  accentIdx?: number[];
  sub?: string;
  body?: string;
  stat?: { val: string; label: string };
  quote?: string;
  meaning?: string;
  response?: string;
  leftLabel?: string;
  leftText?: string;
  rightLabel?: string;
  rightText?: string;
  items?: SlideItem[];
  isCTA?: boolean;
  ctaHeadline?: string;
  highlights?: { phrase: string; color: string }[];
}

interface Carousel {
  id: string;
  num: string;
  title: string;
  category: string;
  persona: string;
  hookGoal: string;
  slideCount: number;
  slides: Slide[];
}

// ══════════════════════════════════════════════════════════════════════════════
// Carousel Data
// ══════════════════════════════════════════════════════════════════════════════

const CAROUSELS: Carousel[] = [
  {
    id: 'c01',
    num: '01',
    title: '5 Mistakes Killing Your Deals in Real-Time',
    category: 'Tactical',
    persona: 'SDR / AE',
    hookGoal: 'Educate sales reps + drive Pitchr signups',
    slideCount: 8,
    slides: [
      {
        bg: 'black',
        label: 'Sales Performance',
        headline: '5 mistakes\nkilling your deals\nin real-time',
        accentIdx: [1],
        sub: 'And what top closers do instead.',
      },
      {
        bg: 'black',
        num: 1,
        stat: {
          val: '67',
          label: "% of the average call is the rep talking.\nTop closers keep it to 43%.\n\nListen more. Win more.",
        },
      },
      {
        bg: 'black',
        num: 2,
        headline: 'You miss the signal\nwhen it matters most',
        body: '"Can we loop in our CFO?" is not a blocker.\nThat\'s your green flag.\n\nMost reps pitch harder. They blow the deal.',
        highlights: [{ phrase: 'green flag', color: '#22c55e' }],
      },
      {
        bg: 'surface',
        num: 3,
        quote: '"I\'ll think about it."',
        meaning: "You didn't address my real concern. I'm not saying no. I'm waiting for you to dig.",
        response: '"What would need to be true for you to say yes today?"',
      },
      {
        bg: 'black',
        num: 4,
        headline: 'You break the silence\ntoo soon',
        body: "After a close attempt, silence feels like 7 minutes. It's 7 seconds.\n\nThe next person to speak loses.\nStay quiet.",
      },
      {
        bg: 'black',
        num: 5,
        stat: {
          val: '82%',
          label: "of lost deals could've been saved with better reads in the moment.\n\nIt wasn't your pitch. It was your read.",
        },
      },
      {
        bg: 'surface',
        label: 'Introducing Pitchr',
        headline: 'A coach\non every call.\nIn real time.',
      },
      {
        bg: 'grad',
        isCTA: true,
        ctaHeadline: 'Close more.\nGuess less.',
      },
    ],
  },

  // ── C02 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c02', num: '02', title: 'What Jordan Belfort Actually Got Right',
    category: 'Famous Salespeople', persona: 'SDR / AE',
    hookGoal: 'Controversial hook drives shares', slideCount: 8,
    slides: [
      { bg: 'black', label: 'Famous Salespeople', headline: 'What Jordan Belfort\nactually got right', sub: 'Not the fraud. The craft.' },
      { bg: 'black', num: 1, stat: { val: '4', label: "seconds to establish certainty on a cold call.\nBelfort knew this. Most reps don't.\n\nFirst impressions close deals before they start." } },
      { bg: 'black', num: 2, headline: 'Tone closes deals.\nWords are secondary.', body: '67% of communication is non-verbal.\nHe controlled his tone before his script.' },
      { bg: 'surface', num: 3, headline: 'Every call travels\none direction.\nToward yes.', body: "Every detour is the rep's fault.\nBring it back. Every time." },
      { bg: 'black', num: 4, headline: 'He never wasted\nhis first sentence.', body: 'He qualified fast and built rapport faster.\nNo fluff. No weather talk.' },
      { bg: 'black', num: 5, headline: 'He confused pressure\nwith persuasion.', body: 'High pressure wins the call. Loses the client.\nTrust is the only thing that compounds.' },
      { bg: 'surface', label: 'The Real Lesson', headline: 'Control the call.\nNot the person.', sub: "That's what separates closers from manipulators." },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Close more.\nGuess less.' },
    ],
  },

  // ── C03 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c03', num: '03', title: "Zig Ziglar's 5 Rules That Still Win",
    category: 'Famous Salespeople', persona: 'All',
    hookGoal: 'Timeless wisdom angle', slideCount: 8,
    slides: [
      { bg: 'black', label: 'Famous Salespeople', headline: "Zig Ziglar's 5 rules\nthat still win today", sub: 'Written in the 70s. Still closing deals now.' },
      { bg: 'black', num: 1, headline: 'Help enough people\nget what they want.', body: "You'll get what you want.\n\nHe built a career on this one idea." },
      { bg: 'black', num: 2, headline: 'He never opened\nwith the product.', body: "He opened with the person.\nPeople don't care what you sell until they know you care about them." },
      { bg: 'surface', num: 3, quote: '"That objection is a good sign."', meaning: "Every objection is a request for more information. They're still in the conversation.", response: '"I\'m glad you brought that up. What would you need to know to move forward?"' },
      { bg: 'black', num: 4, headline: 'He tracked his nos.', body: 'Every no got him closer to a yes.\nHe knew his close rate. He ran the math.\nMost reps just hope.' },
      { bg: 'black', num: 5, stat: { val: '30M+', label: "books sold. Written before the internet.\nRelevant as ever.\n\nSome lessons don't expire." } },
      { bg: 'surface', label: 'The Takeaway', headline: 'Old school principles.\nNew school speed.', sub: "Ziglar's playbook still works. You just need to execute it faster." },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C04 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c04', num: '04', title: 'Grant Cardone: What He Gets Right (and Wrong)',
    category: 'Famous Salespeople', persona: 'SDR',
    hookGoal: 'Nuanced take on polarizing figure', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Famous Salespeople', headline: "The truth about\nGrant Cardone's\nsales advice.", sub: 'Some of it is right. Some of it will burn you.' },
      { bg: 'black', num: 1, stat: { val: '80%', label: "of deals close after the 5th follow-up.\n80% of reps stop at 2.\n\nOn volume, he's completely right." } },
      { bg: 'black', num: 2, headline: "He's right that\nvolume wins.", body: "You can't close a deal you didn't start.\nMost reps have a pipeline problem, not a skill problem." },
      { bg: 'surface', num: 3, headline: 'But louder is not\nthe same as better.', body: "Aggressive reps win calls. They lose clients.\nPushing harder on an unqualified prospect wastes both of your time." },
      { bg: 'black', num: 4, headline: '10X your activity\nwithout 10X your skill\nand you 10X rejection.', body: 'Work smarter. Then harder. In that order.' },
      { bg: 'surface', label: 'The Real Lesson', headline: 'Volume is fuel.\nSkill is the engine.', sub: 'One without the other gets you nowhere fast.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Sell smarter.\nNot louder.' },
    ],
  },

  // ── C05 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c05', num: '05', title: 'Alex Hormozi on Why Most Salespeople Fail',
    category: 'Famous Salespeople', persona: 'All',
    hookGoal: 'Hormozi audience crossover', slideCount: 8,
    slides: [
      { bg: 'black', label: 'Famous Salespeople', headline: 'Alex Hormozi on why\n90% of salespeople fail.', sub: 'His answer is not what most people expect.' },
      { bg: 'black', num: 1, stat: { val: '90%', label: "of salespeople fail to hit quota.\nHormozi says it's one reason:\nThey sell before they qualify." } },
      { bg: 'black', num: 2, headline: "You don't have a\nclosing problem.\nYou have a qualification problem.", body: "Spending an hour pitching someone who can't buy is the most expensive thing you do." },
      { bg: 'surface', num: 3, headline: 'He says the offer\ndoes most of the work.', body: "If you're working too hard on the call, the offer is wrong.\nFix the offer. The close becomes easier." },
      { bg: 'black', num: 4, headline: 'He cold called for\n4 hours a day\nbefore he had a team.', body: "No one gets good at sales by watching videos.\nReps need reps." },
      { bg: 'black', num: 5, stat: { val: '68%', label: "of salespeople have no formal process.\nHormozi has one for everything.\n\nProcess beats hustle every time." } },
      { bg: 'surface', label: 'The Takeaway', headline: "A coach doesn't just\ntell you what to do.\nThey catch your mistakes.", sub: 'That feedback needs to happen on the call. Not after.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C06 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c06', num: '06', title: "Steve Jobs Never Said 'Features'. He Said 'Magic'.",
    category: 'Famous Salespeople', persona: 'AE',
    hookGoal: 'Storytelling angle for AEs', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Famous Salespeople', headline: "Steve Jobs wasn't\nin sales.\nHe was the best salesperson alive.", sub: "Here's what he knew that most reps miss." },
      { bg: 'black', num: 1, headline: 'He cut every pitch\ndown to one idea.', body: "Complex pitches create confused prospects.\nConfused prospects don't buy.\nOne idea. One slide. One decision." },
      { bg: 'surface', num: 2, headline: "He never led with specs.\nHe led with the feeling.", body: '"1,000 songs in your pocket." Not "5GB of storage."\nSell the feeling. Specs are just proof.' },
      { bg: 'black', num: 3, headline: 'He used silence better\nthan anyone in a room.', body: 'He paused after every key point.\nLet it land. Let it breathe.\nAmateurs rush. Closers wait.' },
      { bg: 'black', num: 4, stat: { val: '200', label: "rehearsals before every keynote.\nHe looked effortless because he did the work.\n\nThe best calls sound unrehearsed. They're not." } },
      { bg: 'surface', label: 'The Takeaway', headline: "People don't buy products.\nThey buy versions\nof themselves.", sub: 'Sell the transformation. The product is just the vehicle.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Close more.\nGuess less.' },
    ],
  },

  // ── C07 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c07', num: '07', title: "Why You're Pitching to the Wrong People",
    category: 'Mistakes', persona: 'SDR',
    hookGoal: 'Challenge reps on qualification', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Mistakes', headline: "The most expensive\nmistake in sales.\nYou're making it daily.", sub: "You're pitching before you qualify." },
      { bg: 'black', num: 1, stat: { val: '73%', label: "of a rep's time is spent on unqualified prospects.\n\nYou're not losing deals. You're choosing the wrong rooms." } },
      { bg: 'black', num: 2, headline: "You pitch because\ndiscovery makes\nyou uncomfortable.", body: "Pitching feels like progress.\nIt's not. It's theater for an audience that can't buy." },
      { bg: 'surface', num: 3, quote: '"Let me check with the team."', meaning: "I'm not the decision maker and I didn't want to tell you.", response: '"Who else would need to be part of this conversation?"' },
      { bg: 'black', num: 4, stat: { val: '4.3', label: "hours per week wasted on unqualified prospects.\nThat's 223 hours a year.\n\nEnough time to close 12 more deals." } },
      { bg: 'surface', label: 'The Fix', headline: 'Qualify hard.\nPitch less.\nClose more.', body: 'Ask the uncomfortable question in the first 10 minutes.\nNot the last 10.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Stop guessing.\nStart closing.' },
    ],
  },

  // ── C08 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c08', num: '08', title: "Why 'Just Checking In' is Killing Your Pipeline",
    category: 'Mistakes', persona: 'SDR',
    hookGoal: 'Universal pain point for outbound reps', slideCount: 8,
    slides: [
      { bg: 'black', label: 'Mistakes', headline: "Every 'just checking in'\nemail you send\ncosts you a deal.", sub: "Here's what to do instead." },
      { bg: 'black', num: 1, stat: { val: '80%', label: "of deals close after 5+ follow-ups.\n80% of reps quit after 2.\n\nThe math is right there." } },
      { bg: 'black', num: 2, quote: '"Just checking in to see if you had a chance to review..."', meaning: "I have nothing new to say and no real reason to reach out.", response: '"Your Q2 just started. Is [specific pain] still a priority for the team?"' },
      { bg: 'surface', num: 3, headline: 'Every follow-up needs\na reason to exist.', body: "A new stat. A case study. A specific question.\nIf you can't say why you're reaching out, don't." },
      { bg: 'black', num: 4, headline: "Most reps follow up\nwhen they're panicking.\nNot when it helps.", body: 'Set the next step before you hang up.\nNever leave without a scheduled reason to talk again.' },
      { bg: 'black', num: 5, headline: '5 touches.\n3 channels.\n2 weeks max.', body: 'Then move on.\nA slow no is still a no.' },
      { bg: 'surface', label: 'The Fix', headline: 'Show up with value.\nEvery single time.', sub: "Or don't show up at all." },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C09 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c09', num: '09', title: 'Why You Should Never Discount First',
    category: 'Mistakes', persona: 'AE',
    hookGoal: 'High-stakes financial mistake angle', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Mistakes', headline: "They said \"too expensive\".\nYou folded.\nHere's what that cost you.", sub: 'More than just margin.' },
      { bg: 'black', num: 1, stat: { val: '68%', label: "of salespeople discount before the prospect even asks.\n\nYou're negotiating against yourself." } },
      { bg: 'surface', num: 2, quote: '"Can you do better on the price?"', meaning: "I want to see how much power I have here.", response: '"Our pricing is fixed. Help me understand what\'s driving that. Is it budget or is it value?"' },
      { bg: 'black', num: 3, headline: 'Every 10% discount\nrequires 25% more\nvolume to break even.', body: "You're not closing faster. You're working twice as hard for the same result." },
      { bg: 'black', num: 4, headline: 'Price objections are\nvalue objections\nin disguise.', body: "If they're asking to pay less, you haven't proven what they get.\nGo back to discovery." },
      { bg: 'surface', label: 'The Fix', headline: 'Hold the price.\nSell the ROI.', body: "What's the cost of NOT solving this problem?\nThat number is your real price anchor." },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Close at full price.\nEvery time.' },
    ],
  },

  // ── C10 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c10', num: '10', title: "You're Closing. Then You Keep Talking.",
    category: 'Mistakes', persona: 'AE',
    hookGoal: 'Painful self-recognition for AEs', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Mistakes', headline: 'You asked for\nthe business.\nThen you kept talking.', sub: 'This one mistake kills more deals than any objection.' },
      { bg: 'black', num: 1, stat: { val: '7', label: "seconds of silence after a close attempt.\nThat's all it takes.\n\nMost reps can't do it." } },
      { bg: 'surface', num: 2, headline: 'The first person to\nspeak after the close\nloses.', body: "You asked. They're thinking.\nThe discomfort you feel is not a sign to talk. It's a sign to wait." },
      { bg: 'black', num: 3, headline: 'Reps rush to reassure.\nThey un-close themselves.', body: '"And obviously there\'s no pressure, take your time..."\nStop. You just reopened the negotiation.' },
      { bg: 'surface', num: 4, quote: '"So does this make sense to move forward?"', meaning: "Silence. 7 seconds. Don't break it.", response: 'Say nothing. Let them fill the silence. They will.' },
      { bg: 'black', num: 5, stat: { val: '43%', label: "of lost deals are lost after the close attempt. Not before.\n\nThe rep talked themselves out of it." } },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Stop talking.\nStart closing.' },
    ],
  },

  // ── C11 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c11', num: '11', title: "You're Not Listening. You're Waiting to Talk.",
    category: 'Mistakes', persona: 'All',
    hookGoal: 'Universal relatable pain', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Mistakes', headline: "You're not actually\nlistening on your calls.", sub: "You're planning your next question. Here's what it costs you." },
      { bg: 'black', num: 1, stat: { val: '67%', label: "Average rep talks 67% of every call.\nTop closers speak 43%.\n\nThe gap is a promotion." } },
      { bg: 'black', num: 2, headline: "While you're preparing\nyour next point...", body: "They just said \"we're also looking at your competitor.\"\nYou missed it. You were thinking." },
      { bg: 'surface', num: 3, headline: "Listening is not silence.\nIt's attention.", body: "Repeat what they said. Ask what they meant.\nSummarize before you respond.\nThat's when they feel heard." },
      { bg: 'black', num: 4, headline: 'Every buying signal\ngets buried under\nyour next question.', body: '"This could work for us" followed by your feature list.\nYou just talked past the close.' },
      { bg: 'surface', num: 5, quote: '"That sounds interesting, let me think about it."', meaning: "You talked for 20 minutes and I still don't know how this helps me specifically.", response: '"Let me pause. What part is most relevant to what you\'re dealing with right now?"' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Listen more.\nClose more.' },
    ],
  },

  // ── C12 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c12', num: '12', title: 'The Discovery Questions That Actually Work',
    category: 'How to Improve', persona: 'SDR / AE',
    hookGoal: 'Tactical value — high save rate', slideCount: 8,
    slides: [
      { bg: 'black', label: 'How to Improve', headline: 'Most reps ask surface\nquestions.\nTop closers dig.', sub: 'The difference is discovery.' },
      { bg: 'black', num: 1, stat: { val: '58%', label: "of deals are lost because reps don't understand the buyer's real problem.\n\nDiscovery is the most important part of the call." } },
      { bg: 'black', num: 2, headline: 'Surface question:\n"What are you looking for?"', body: '"What\'s happening right now that made you take this call?"\n\nOne gets a wish list. One gets the truth.' },
      { bg: 'black', num: 3, headline: 'Ask about the cost\nof the problem.\nNot the problem.', body: '"What has this been costing you in time, revenue, or headcount?"\nNumbers change the conversation.' },
      { bg: 'surface', num: 4, quote: '"We\'re not in a rush."', meaning: "I haven't felt enough urgency yet to prioritize this.", response: '"What happens to that number if this isn\'t solved by Q3?"' },
      { bg: 'black', num: 5, headline: "Ask who else\nthey're talking to.\nEarly.", body: "Not to trash the competition.\nTo understand their criteria.\nThat's your roadmap." },
      { bg: 'surface', label: 'The Rule', headline: 'Shut up after\nyou ask.\nFor 6 seconds minimum.', body: 'Silence gets you more truth than the perfect follow-up question.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C13 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c13', num: '13', title: 'Stop Answering Objections. Start Defusing Them.',
    category: 'How to Improve', persona: 'AE / SDR',
    hookGoal: 'Tactical objection handling', slideCount: 8,
    slides: [
      { bg: 'black', label: 'How to Improve', headline: 'The wrong way to handle\nevery objection:\nanswer it immediately.', sub: "Here's what to do instead." },
      { bg: 'black', num: 1, headline: 'Objection then answer\nis the wrong loop.', body: 'When you answer too fast, you sound defensive.\nThey dig in harder. You made it worse.' },
      { bg: 'black', num: 2, stat: { val: '3', label: "steps. Every time.\nAcknowledge. Clarify. Answer.\n\nIn that order." } },
      { bg: 'surface', num: 3, quote: '"It\'s too expensive."', meaning: "You haven't shown me the ROI yet.", response: '"That makes sense. What are you comparing it to?"' },
      { bg: 'black', num: 4, quote: '"The timing isn\'t right."', meaning: "You haven't created enough urgency.", response: '"Totally fair. What would need to change for the timing to work?"' },
      { bg: 'black', num: 5, quote: '"We\'re already using [competitor]."', meaning: "I don't see enough difference to justify switching.", response: '"Good to know. What do you like about them? What would you change?"' },
      { bg: 'surface', label: 'The Pattern', headline: 'Every objection is a\nquestion wearing\na disguise.', body: 'Find the real question. Answer that.\nNot the surface complaint.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Handle every objection.\nIn real time.' },
    ],
  },

  // ── C14 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c14', num: '14', title: 'The First 10 Seconds of a Cold Call',
    category: 'How to Improve', persona: 'SDR',
    hookGoal: 'Cold call anxiety is universal', slideCount: 7,
    slides: [
      { bg: 'black', label: 'How to Improve', headline: "You have 10 seconds\non a cold call.\nHere's exactly how to use them.", sub: 'Most reps waste them on pleasantries.' },
      { bg: 'black', num: 1, stat: { val: '10', label: "seconds to earn the next 10 minutes.\nMost reps spend them on 'is this a good time?'\n\nDon't." } },
      { bg: 'surface', num: 2, quote: '"Hi, is this a good time?"', meaning: "Please give me an easy way out before I've said anything of value.", response: '"[Name], [your name]. I\'ll be quick. Quick question before I explain why I called."' },
      { bg: 'black', num: 3, headline: "They're about to hang up.\nDo something unexpected.", body: 'Lower your voice instead of raising it.\nPause before you pitch.\nAsk a question they weren\'t prepared for.' },
      { bg: 'black', num: 4, headline: 'State the problem\nbefore you state\nthe solution.', body: '"Most [role] I talk to are dealing with [specific pain]. Is that something you\'re seeing?"\nNow they\'re in the conversation.' },
      { bg: 'surface', label: 'The Rule', headline: 'Sound like you expected\nthem to pick up.\nNot relieved.', body: 'Certainty on line one gets you to line two.\nHesitation kills calls in the first five words.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C15 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c15', num: '15', title: "You're Talking Too Much. Here's the Proof.",
    category: 'How to Improve', persona: 'All',
    hookGoal: 'Data-backed improvement tip', slideCount: 7,
    slides: [
      { bg: 'black', label: 'How to Improve', headline: 'The data is clear.\nThe more you talk,\nthe less you close.', sub: "Here's the proof." },
      { bg: 'black', num: 1, stat: { val: '67%', label: "Average rep: talks 67% of every call.\nTop closer: talks 43%.\n\nThe difference is a promotion." } },
      { bg: 'surface', num: 2, headline: 'Reps talk because\nsilence makes\nthem nervous.', body: 'Prospects interpret silence as thinking.\nReps interpret it as rejection.\nOnly one of them is right.' },
      { bg: 'black', num: 3, headline: "For every minute\nthey talk, you're\ncloser to the close.", body: 'Their words are your roadmap.\nEvery sentence tells you what to say next.' },
      { bg: 'black', num: 4, stat: { val: '43%', label: "Top closers speak 43% of every call.\nThe rest? They listen.\n\nThat's not a personality trait. That's a skill." } },
      { bg: 'surface', label: 'The Fix', headline: 'Ask. Then stop.\nNo follow-up.\nNo clarification.\nJust listen.', sub: 'Let them think out loud. Let silence work for you.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Listen more.\nWin more.' },
    ],
  },

  // ── C16 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c16', num: '16', title: 'Stop Faking Rapport. Do This Instead.',
    category: 'How to Improve', persona: 'All',
    hookGoal: 'Challenges conventional advice', slideCount: 7,
    slides: [
      { bg: 'black', label: 'How to Improve', headline: 'Stop faking rapport.\nDo this instead.', sub: 'Most reps confuse small talk with connection.' },
      { bg: 'black', num: 1, stat: { val: '82%', label: "of buyers say they're more likely to buy from someone they trust.\n\nTrust isn't built in small talk. It's built in honesty." } },
      { bg: 'surface', num: 2, headline: 'Fake rapport is worse\nthan no rapport.', body: "Asking about their weekend then immediately pitching signals one thing:\nYou don't actually care." },
      { bg: 'black', num: 3, headline: "Real rapport is built\non honesty.\nNot pleasantries.", body: "Tell them what your product can't do.\nChallenge an assumption they have.\nThat's trust." },
      { bg: 'black', num: 4, headline: 'Repeat the last 3 words\nof what they said.', body: '"...we\'re struggling with ramp time."\n"Struggling with ramp time?"\n\nWatch them open up.' },
      { bg: 'surface', label: 'The Rule', headline: 'Be interested.\nNot interesting.', body: 'The rep who asks better questions is more memorable than the one who tells better stories.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C17 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c17', num: '17', title: 'What It Costs You to Have No Coach on Every Call',
    category: 'Value', persona: 'All',
    hookGoal: 'Financial cost of status quo', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Value', headline: 'Every call without coaching\nis a call you could\nhave done better.', sub: "Here's what that's costing you." },
      { bg: 'black', num: 1, stat: { val: '$40k', label: "Average difference in annual earnings between coached and uncoached reps.\n\nThat's what guessing costs you per year." } },
      { bg: 'surface', num: 2, headline: 'You review the call\nafter the deal is lost.', body: "That feedback is too late.\nThe moment passed 30 minutes ago.\nYou needed to know then." },
      { bg: 'black', num: 3, headline: 'What would you pay\nfor a coach\non every call?', body: "Someone who flags the objection before you answer it wrong.\nWho spots the buying signal before you miss it." },
      { bg: 'black', num: 4, stat: { val: '87%', label: "of sales training is forgotten within 30 days.\n\nBecause it's not applied in the moment.\nReal-time feedback changes when learning happens." } },
      { bg: 'surface', label: 'The Shift', headline: "The coach doesn't\nreplace you.\nThey make you better.", sub: 'Live coaching. Not post-game reviews.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C18 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c18', num: '18', title: 'What the Top 1% of Sales Reps Do Differently',
    category: 'Value', persona: 'All',
    hookGoal: 'Aspirational habits content', slideCount: 8,
    slides: [
      { bg: 'black', label: 'Value', headline: "The gap between the top 1%\nand everyone else\nisn't talent.\nIt's habits.", sub: 'Here are the 5 habits that separate them.' },
      { bg: 'black', num: 1, stat: { val: '1%', label: "of reps close 80% of the revenue.\n\nSame product. Same market. Different habits." } },
      { bg: 'black', num: 2, headline: 'They review every call.\nEvery single one.', body: "Not to feel bad. To find one thing to fix.\nThat's 250 improvements a year." },
      { bg: 'surface', num: 3, headline: 'They know their\nnumbers cold.', body: "Close rate. Average deal size. Cycle length. Talk ratio.\nYou can't improve what you don't measure." },
      { bg: 'black', num: 4, headline: 'They ask for referrals\nbefore the deal closes.', body: '"Is there anyone on your team dealing with the same thing?\nI\'d love to talk to them too."' },
      { bg: 'black', num: 5, stat: { val: '5x', label: "more likely to get a referral if you ask.\nMost reps never ask.\n\nThat's the entire gap." } },
      { bg: 'surface', label: 'Habit 5', headline: "They invest in themselves\nbefore their company\ndoes.", body: "Top reps don't wait for training. They create it." },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C19 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c19', num: '19', title: "Why 87% of Sales Training Is Forgotten in 30 Days",
    category: 'Value', persona: 'All',
    hookGoal: 'Challenges the broken status quo', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Value', headline: 'Your company spent\nthousands on training.\nHere\'s why it didn\'t stick.', sub: "It's not the content. It's the timing." },
      { bg: 'black', num: 1, stat: { val: '87%', label: "of sales training is forgotten within 30 days.\n\nBecause learning in a room is different from learning in a call." } },
      { bg: 'surface', num: 2, headline: "You can't practice\nobjections in a slideshow.", body: 'Role play feels fake.\nThe real objection hits different.\nAnd the training was three weeks ago.' },
      { bg: 'black', num: 3, headline: 'The gap between\nknowing and doing\nis the entire game.', body: 'Every rep knows what good sounds like.\nFewer do it under pressure.' },
      { bg: 'surface', num: 4, headline: 'Learning has to happen\nwhere the moment happens.', body: 'Not in a training room a month ago.\nOn the call. In the second. When it matters.' },
      { bg: 'black', num: 5, stat: { val: '4x', label: "faster skill development with real-time feedback vs post-call review.\n\nTiming is everything in learning too." } },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C20 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c20', num: '20', title: "Why the Best Rep on Your Team Earns 5x the Rest",
    category: 'Value', persona: 'Manager / AE',
    hookGoal: 'Team performance gap resonates with managers', slideCount: 7,
    slides: [
      { bg: 'black', label: 'Value', headline: 'Same product.\nSame territory.\nOne rep closes 5x more.\nWhy?', sub: "It's not talent. Here's what it actually is." },
      { bg: 'black', num: 1, stat: { val: '5x', label: "top performers outperform average reps by 5x.\n\nSame product. Same market. Different systems." } },
      { bg: 'surface', num: 2, headline: "They don't have\nbetter instincts.\nThey have better systems.", body: "The best rep doesn't guess what to say.\nThey've rehearsed every scenario and reviewed every call." },
      { bg: 'black', num: 3, headline: "1% better on every call\nis 250% better\nby year's end.", body: 'One better question. One recovered objection. One buying signal caught.\nMultiplied over 500 calls.' },
      { bg: 'surface', num: 4, headline: "The goal isn't to\nfire your bottom reps.\nIt's to close the gap.", body: "If your best rep has knowledge your worst rep doesn't, that's a systems failure.\nNot a people failure." },
      { bg: 'black', num: 5, stat: { val: '3x', label: "ROI on real-time AI coaching vs traditional training.\n\nBecause the feedback arrives when it can actually be used." } },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },

  // ── C21 ──────────────────────────────────────────────────────────────────────
  {
    id: 'c21', num: '21', title: "What Pitchr Hears (That You Miss)",
    category: 'Value', persona: 'SDR / AE',
    hookGoal: 'Product demonstration through storytelling', slideCount: 8,
    slides: [
      { bg: 'black', label: 'Value', headline: "While you're selling,\nPitchr is listening.\nHere's what it catches.", sub: 'The signals that happen between the words.' },
      { bg: 'black', num: 1, headline: "They said \"we've been\nlooking at this\nfor a while.\"", body: "That's not small talk. That's a buying signal.\nPitchr flags it. You act on it.", highlights: [{ phrase: 'buying signal', color: '#22c55e' }] },
      { bg: 'surface', num: 2, headline: "They said\n\"it's a budget issue.\"\nIt's not.", body: "It's a value issue.\nPitchr hears the real objection and tells you how to respond." },
      { bg: 'black', num: 3, stat: { val: '2:1', label: "The ideal prospect-to-rep talk ratio.\nPitchr tracks it live and tells you when you're dominating the conversation." } },
      { bg: 'black', num: 4, headline: '7 seconds after\nthe close.\nPitchr says: wait.', body: "You asked. They're thinking. Don't speak.\nMost reps can't hold it. Pitchr reminds you." },
      { bg: 'black', num: 5, headline: "They asked about\nonboarding.\nThat's a green flag.", body: 'Pitchr catches signals buried in questions about implementation.\nThe ones that come out sideways.', highlights: [{ phrase: 'green flag', color: '#22c55e' }] },
      { bg: 'surface', label: 'The Result', headline: 'You know exactly\nwhat happened\nand why.', body: 'Not "I think it went well."\nPitchr gives you the read.' },
      { bg: 'grad', isCTA: true, ctaHeadline: 'Join the waitlist.' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Font injection
// ══════════════════════════════════════════════════════════════════════════════

let _fontsInjected = false;
function injectFonts() {
  if (_fontsInjected || document.getElementById('pitchr-carousel-fonts')) return;
  _fontsInjected = true;
  const l = document.createElement('link');
  l.id = 'pitchr-carousel-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap';
  document.head.appendChild(l);
}

// ══════════════════════════════════════════════════════════════════════════════
// Brand palette
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  white:    '#ffffff',
  surface:  '#f8f8f8',
  elevated: '#f0f0f0',
  black:    '#0a0a0a',
  green:    '#16a34a',
  red:      '#dc2626',
  // Charcoal gradient — used by dark-theme carousels (every slide) + all CTAs
  grad:     'linear-gradient(135deg, #0a0a0a 0%, #2d2d2d 100%)',
  gradDark: 'linear-gradient(135deg, #0a0a0a 0%, #1e1e1e 50%, #3a3a3a 100%)',
  // Predominantly white, fading into charcoal at the bottom-right corner —
  // used by light-theme carousels (every slide)
  gradLight: 'linear-gradient(135deg, #ffffff 0%, #fbfbfb 42%, #ededed 60%, #c2c2c2 78%, #262626 100%)',
};

// Carousels rendered in the "predominantly white, fading to charcoal" theme.
// Everything else is the full charcoal gradient.
const LIGHT_THEME_IDS = new Set([
  'c03', 'c05', 'c07', 'c09', 'c11', 'c13', 'c15', 'c17', 'c19', 'c21',
]);

function themeOf(id: string): 'dark' | 'light' {
  return LIGHT_THEME_IDS.has(id) ? 'light' : 'dark';
}

// ══════════════════════════════════════════════════════════════════════════════
// Slide primitives
// ══════════════════════════════════════════════════════════════════════════════

// Gradient-clipped accent word — falls back to plain white on dark slides
function G({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  if (dark) return <span style={{ color: C.white }}>{children}</span>;
  return (
    <span style={{
      background: C.grad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>{children}</span>
  );
}

// Ambient glow blob
function Glow({ x, y, size = 480, color = C.white, opacity = 0.28 }: {
  x: string; y: string; size?: number; color?: string; opacity?: number;
}) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: color, filter: `blur(${size * 0.25}px)`, opacity,
      left: x, top: y, pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

// Tag pill label — dark variant for gradient backgrounds
function Tag({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '12px 28px', borderRadius: '100px',
      fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '20px', fontWeight: 700,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color: dark ? C.white : C.black,
      background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(10,10,10,0.06)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.20)' : 'rgba(10,10,10,0.15)'}`,
      width: 'fit-content', zIndex: 1,
    }}>{children}</div>
  );
}

// Number badge
function NumBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: '72px', height: '72px', borderRadius: '50%',
      background: C.grad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '28px', fontWeight: 800,
      color: C.white, flexShrink: 0, zIndex: 1,
    }}>{n}</div>
  );
}

// Gradient divider bar
function Divider() {
  return <div style={{ width: '72px', height: '5px', borderRadius: '3px', background: C.grad, zIndex: 1 }} />;
}

// Card container — dark variant uses white-alpha borders/bg
function Card({ children, variant = 'default', dark }: {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'mono' | 'red' | 'green';
  dark?: boolean;
}) {
  const borderColor = dark ? {
    default: 'rgba(255,255,255,0.12)',
    purple:  'rgba(255,255,255,0.22)',
    mono:    'rgba(255,255,255,0.08)',
    red:     'rgba(220,38,38,0.50)',
    green:   'rgba(22,163,74,0.50)',
  }[variant] : {
    default: 'rgba(10,10,10,0.10)',
    purple:  'rgba(10,10,10,0.22)',
    mono:    'rgba(10,10,10,0.07)',
    red:     'rgba(220,38,38,0.30)',
    green:   'rgba(22,163,74,0.30)',
  }[variant];
  const bg = dark ? {
    default: 'rgba(255,255,255,0.06)',
    purple:  'rgba(255,255,255,0.10)',
    mono:    'rgba(255,255,255,0.04)',
    red:     'rgba(220,38,38,0.12)',
    green:   'rgba(22,163,74,0.12)',
  }[variant] : {
    default: 'rgba(10,10,10,0.03)',
    purple:  'rgba(10,10,10,0.06)',
    mono:    'rgba(10,10,10,0.02)',
    red:     'rgba(220,38,38,0.06)',
    green:   'rgba(22,163,74,0.06)',
  }[variant];
  return (
    <div style={{
      background: bg, border: `1px solid ${borderColor}`,
      borderRadius: '24px', padding: '32px 40px', zIndex: 1,
    }}>{children}</div>
  );
}

// Card section label
function CardLabel({ children, color, dark }: {
  children: React.ReactNode;
  color?: string;
  dark?: boolean;
}) {
  return (
    <div style={{
      fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '16px', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: color ?? (dark ? 'rgba(255,255,255,0.55)' : C.black),
      marginBottom: '14px', zIndex: 1,
    }}>{children}</div>
  );
}

// Phrase colorizer
function renderHighlighted(text: string, highlights?: { phrase: string; color: string }[]): React.ReactNode {
  if (!highlights?.length) return text;
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    let earliest = { idx: remaining.length, phrase: '', color: '' };
    for (const h of highlights) {
      const idx = remaining.indexOf(h.phrase);
      if (idx !== -1 && idx < earliest.idx) earliest = { idx, phrase: h.phrase, color: h.color };
    }
    if (earliest.idx === remaining.length) { parts.push(remaining); break; }
    if (earliest.idx > 0) parts.push(<span key={key++}>{remaining.slice(0, earliest.idx)}</span>);
    parts.push(<span key={key++} style={{ color: earliest.color, fontWeight: 700 }}>{earliest.phrase}</span>);
    remaining = remaining.slice(earliest.idx + earliest.phrase.length);
  }
  return parts;
}

// ══════════════════════════════════════════════════════════════════════════════
// Master SlideCard — 1080×1080 scaled to container
// ══════════════════════════════════════════════════════════════════════════════

function SlideCard({ slide, index, total, theme }: { slide: Slide; index: number; total: number; theme: 'dark' | 'light' }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    injectFonts();
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 1080);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    document.fonts.ready.then(() => update());
    return () => ro.disconnect();
  }, []);

  // Background + text color are driven by the carousel theme, not the slide:
  //   dark  → every slide is the full charcoal gradient (white text)
  //   light → every slide is white fading into charcoal (dark text)
  const isDark = theme === 'dark';
  const slideBg = isDark ? C.grad : C.gradLight;
  // isGrad === "render text for a dark background"
  const isGrad = isDark;
  const textPrimary = isGrad ? '#ffffff' : C.black;
  const textMuted   = isGrad ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,10,0.45)';
  const textBody    = isGrad ? 'rgba(255,255,255,0.80)' : 'rgba(10,10,10,0.70)';

  const root: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0,
    width: '1080px', height: '1080px',
    background: slideBg,
    padding: '80px',
    boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
  };

  const brand = (
    <div style={{
      position: 'absolute', top: '56px', right: '72px',
      fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800, fontSize: '28px',
      letterSpacing: '0.08em', textTransform: 'uppercase', zIndex: 2,
      color: isGrad ? C.white : C.black,
    }}>Pitchr</div>
  );

  const slideNum = (
    <div style={{
      position: 'absolute', bottom: '56px', right: '72px',
      fontFamily: "'Fragment Mono', monospace", fontSize: '20px',
      // Both themes have a charcoal bottom-right corner, so keep this light.
      color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.55)',
      zIndex: 2,
    }}>{index + 1} / {total}</div>
  );

  // ── CTA SLIDE ──────────────────────────────────────────────────────────────
  if (slide.isCTA) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={{ ...root, background: C.grad, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 80%, rgba(0,0,0,0.3) 0%, transparent 65%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 55%)', zIndex: 0 }} />
          {brand}
          {slideNum}
          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px' }}>
            <div style={{
              fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '22px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}>Now accepting early access</div>
            <div style={{
              fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800,
              fontSize: '90px', lineHeight: 1.0, letterSpacing: '-0.03em',
              color: C.white, maxWidth: '860px', textAlign: 'center',
              whiteSpace: 'pre-line',
            }}>{slide.ctaHeadline}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '24px 60px', borderRadius: '100px',
              background: C.white, color: C.black,
              fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '28px', fontWeight: 800,
              letterSpacing: '-0.01em', marginTop: '8px',
            }}>Join the Waitlist →</div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '20px', color: 'rgba(255,255,255,0.45)' }}>pitchr.org</div>
          </div>
        </div>
      </div>
    );
  }

  // ── STAT SLIDE ─────────────────────────────────────────────────────────────
  if (slide.stat && !slide.headline) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-160px" y="-120px" size={520} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.07 : 0.04} />
          <Glow x="680px" y="680px" size={400} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.05 : 0.03} />
          {brand}{slideNum}
          <div style={{
            position: 'absolute', bottom: '60px', left: '72px',
            fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800,
            fontSize: '320px', lineHeight: 1, opacity: 0.04,
            color: isGrad ? C.white : C.black, userSelect: 'none', zIndex: 0,
          }}>%</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '20px' }}>
            <Divider />
            <div style={{
              fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800,
              fontSize: '180px', lineHeight: 0.95, letterSpacing: '-0.04em',
              background: isGrad ? 'none' : C.grad,
              color: isGrad ? C.white : 'transparent',
              WebkitBackgroundClip: isGrad ? 'unset' : 'text',
              WebkitTextFillColor: isGrad ? C.white : 'transparent',
              backgroundClip: isGrad ? 'unset' : 'text',
            }}>{slide.stat.val}</div>
            <div style={{
              fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '30px', fontWeight: 500,
              lineHeight: 1.5, color: textBody, maxWidth: '780px',
              whiteSpace: 'pre-line',
            }}>{slide.stat.label}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── STAT + HEADLINE COMBO ──────────────────────────────────────────────────
  if (slide.stat && slide.headline) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-100px" y="-100px" size={500} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.07 : 0.04} />
          {brand}{slideNum}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '16px' }}>
            <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '22px', fontWeight: 600, color: textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{slide.headline}</div>
            <div style={{
              fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800, fontSize: '140px', lineHeight: 0.95,
              background: isGrad ? 'none' : C.grad,
              color: isGrad ? C.white : 'transparent',
              WebkitBackgroundClip: isGrad ? 'unset' : 'text',
              WebkitTextFillColor: isGrad ? C.white : 'transparent',
              backgroundClip: isGrad ? 'unset' : 'text',
              letterSpacing: '-0.04em',
            }}>{slide.stat.val}</div>
            <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '28px', fontWeight: 500, color: textBody, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{slide.stat.label}</div>
            {slide.body && <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '24px', color: textMuted, lineHeight: 1.5, marginTop: '8px', whiteSpace: 'pre-line' }}>{slide.body}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ── QUOTE / MEANING / RESPONSE ─────────────────────────────────────────────
  if (slide.quote) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-120px" y="-80px" size={440} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.07 : 0.04} />
          {brand}{slideNum}
          {slide.num !== undefined && <NumBadge n={slide.num} />}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '20px', marginTop: slide.num !== undefined ? '24px' : 0 }}>
            <Card variant="mono" dark={isGrad}>
              <CardLabel color={isGrad ? 'rgba(255,255,255,0.40)' : 'rgba(10,10,10,0.40)'} dark={isGrad}>They say</CardLabel>
              <div style={{
                fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 700,
                fontSize: '46px', lineHeight: 1.2, color: textPrimary,
                fontStyle: 'italic',
              }}>{slide.quote}</div>
            </Card>
            {slide.meaning && (
              <Card variant="default" dark={isGrad}>
                <CardLabel color={isGrad ? 'rgba(255,255,255,0.40)' : 'rgba(10,10,10,0.40)'} dark={isGrad}>They mean</CardLabel>
                <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 600, fontSize: '34px', lineHeight: 1.45, color: textBody }}>{slide.meaning}</div>
              </Card>
            )}
            {slide.response && (
              <Card variant="purple" dark={isGrad}>
                <CardLabel color={isGrad ? C.white : C.black} dark={isGrad}>Say this instead</CardLabel>
                <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 700, fontSize: '34px', lineHeight: 1.45, color: textPrimary }}>{slide.response}</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SPLIT COLUMNS ──────────────────────────────────────────────────────────
  if (slide.leftLabel) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-100px" y="-80px" size={440} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.07 : 0.04} />
          {brand}{slideNum}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '32px' }}>
            {slide.headline && (
              <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800, fontSize: '52px', lineHeight: 1.1, color: textPrimary, letterSpacing: '-0.02em' }}>
                {slide.headline}
              </div>
            )}
            <div style={{ display: 'flex', gap: '24px' }}>
              <Card variant="red" dark={isGrad}>
                <CardLabel color={C.red} dark={isGrad}>{slide.leftLabel}</CardLabel>
                <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '28px', fontWeight: 600, color: textPrimary, lineHeight: 1.35 }}>{slide.leftText}</div>
              </Card>
              <Card variant="green" dark={isGrad}>
                <CardLabel color={C.green} dark={isGrad}>{slide.rightLabel}</CardLabel>
                <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '28px', fontWeight: 600, color: textPrimary, lineHeight: 1.35 }}>{slide.rightText}</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ITEMS LIST ─────────────────────────────────────────────────────────────
  if (slide.items && !slide.quote && !slide.leftLabel) {
    return (
      <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={root}>
          <Glow x="-100px" y="-80px" size={440} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.07 : 0.04} />
          {brand}{slideNum}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '24px' }}>
            {slide.headline && (
              <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800, fontSize: '56px', lineHeight: 1.1, letterSpacing: '-0.02em', color: textPrimary, marginBottom: '8px' }}>
                {slide.headline}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {slide.items.map((item, i) => (
                <Card key={i} variant="default" dark={isGrad}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {item.icon && (
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>{item.icon}</div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '26px', fontWeight: 700, color: textPrimary, lineHeight: 1.3 }}>{item.text}</div>
                      {item.sub && <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '20px', color: textMuted, marginTop: '4px' }}>{item.sub}</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STANDARD HEADLINE + BODY ───────────────────────────────────────────────
  return (
    <div ref={wrapRef} style={{ width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
      <div style={root}>
        <Glow x="-140px" y="-100px" size={520} color={isGrad ? C.white : C.black} opacity={isGrad ? 0.07 : 0.04} />
        {isDark && <Glow x="640px" y="700px" size={380} color={C.white} opacity={0.05} />}
        {brand}{slideNum}

        {slide.num !== undefined && <NumBadge n={slide.num} />}
        {slide.label && !slide.num && <Tag dark={isGrad}>{slide.label}</Tag>}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, gap: '28px', marginTop: (slide.num !== undefined || slide.label) ? '32px' : 0 }}>
          <Divider />
          <div style={{
            fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 800,
            fontSize: slide.body ? '76px' : '96px',
            lineHeight: 1.05, letterSpacing: '-0.025em',
            color: textPrimary,
            whiteSpace: 'pre-line',
          }}>
            {slide.headline && (() => {
              const words = slide.headline.split(' ');
              const accents = new Set(slide.accentIdx ?? []);
              return words.map((w, wi) => (
                <span key={wi}>{wi > 0 && ' '}
                  {accents.has(wi) ? <G dark={isGrad}>{w}</G> : w}
                </span>
              ));
            })()}
          </div>

          {slide.sub && !slide.body && (
            <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 700, fontSize: '36px', fontStyle: 'italic', color: isGrad ? 'rgba(255,255,255,0.65)' : 'rgba(10,10,10,0.55)', lineHeight: 1.4 }}>{slide.sub}</div>
          )}

          {slide.body && (
            <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '38px', fontWeight: 600, color: textBody, lineHeight: 1.55, whiteSpace: 'pre-line' }}>
              {renderHighlighted(slide.body, slide.highlights)}
            </div>
          )}

          {slide.body && slide.sub && (
            <div style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontWeight: 700, fontSize: '32px', fontStyle: 'italic', color: textMuted, lineHeight: 1.4 }}>{slide.sub}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Download helpers
// ══════════════════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    html2canvas?: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
    JSZip?: new () => {
      file: (name: string, data: Blob) => void;
      generateAsync: (opts: { type: string }) => Promise<Blob>;
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureLibs() {
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
  ]);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ══════════════════════════════════════════════════════════════════════════════
// Modal
// ══════════════════════════════════════════════════════════════════════════════

interface ModalProps {
  carousel: Carousel;
  onClose: () => void;
}

function CarouselModal({ carousel, onClose }: ModalProps) {
  const [idx, setIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const total = carousel.slides.length;

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function downloadOne() {
    if (!slideRef.current || !window.html2canvas) return;
    setDownloading(true);
    try {
      await ensureLibs();
      const canvas = await window.html2canvas!(slideRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      canvas.toBlob(blob => {
        if (blob) downloadBlob(blob, `pitchr-${carousel.num}-slide${idx + 1}.png`);
      }, 'image/png');
    } finally {
      setDownloading(false);
    }
  }

  async function downloadAll() {
    setDownloading(true);
    try {
      await ensureLibs();
      if (!window.html2canvas || !window.JSZip) return;
      const zip = new window.JSZip!();
      for (let i = 0; i < total; i++) {
        setIdx(i);
        await new Promise(r => setTimeout(r, 150));
        if (!slideRef.current) continue;
        const canvas = await window.html2canvas!(slideRef.current, { scale: 2, useCORS: true, backgroundColor: null });
        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob as Blob, `pitchr-carousel-${carousel.num}.zip`);
    } finally {
      setDownloading(false);
    }
  }

  const slide = carousel.slides[idx];
  const theme = themeOf(carousel.id);

  return (
    <div className="cl-modal" role="dialog" aria-modal="true">
      <div className="cl-modal__toolbar">
        <div className="cl-modal__toolbar-left">
          <div className="cl-modal__toolbar-cat">{carousel.category} · {carousel.persona}</div>
          <div className="cl-modal__toolbar-title">{carousel.num}. {carousel.title}</div>
        </div>
        <div className="cl-modal__toolbar-right">
          <button className="cl-modal__dl-btn" onClick={downloadOne} disabled={downloading}>
            ⬇ This Slide
          </button>
          <button className="cl-modal__dl-btn" onClick={downloadAll} disabled={downloading}>
            ⬇ All (ZIP)
          </button>
          <button className="cl-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>

      <div className="cl-modal__body">
        <button className="cl-modal__nav cl-modal__nav--prev" onClick={prev} aria-label="Previous slide">‹</button>

        <div className="cl-modal__slide-wrap">
          <div className="carousel-slide-export" ref={slideRef}>
            <SlideCard slide={slide} index={idx} total={total} theme={theme} />
          </div>
        </div>

        <button className="cl-modal__nav cl-modal__nav--next" onClick={next} aria-label="Next slide">›</button>
      </div>

      <div className="cl-modal__footer">
        <div className="cl-modal__counter">{idx + 1} / {total}</div>
        <div className="cl-modal__dots">
          {carousel.slides.map((_, i) => (
            <button
              key={i}
              className={`cl-modal__dot${i === idx ? ' cl-modal__dot--active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Gallery Section
// ══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = ['All', 'Tactical', 'Famous Salespeople', 'Mistakes', 'How to Improve', 'Value'];

export function CarouselLibrarySection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [openCarousel, setOpenCarousel] = useState<Carousel | null>(null);

  const filtered = activeFilter === 'All'
    ? CAROUSELS
    : CAROUSELS.filter(c => c.category === activeFilter);

  return (
    <>
      <section id="carousels" className="cl-section">
        <div className="cl-section__inner">
          <div className="cl-section__label">FREE CONTENT</div>
          <h2 className="cl-section__h2">21 ready-to-post carousels</h2>
          <p className="cl-section__sub">Designed for Instagram. Download any carousel as PNG files — free to post.</p>

          <div className="cl-filter-bar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cl-filter-btn${activeFilter === cat ? ' cl-filter-btn--active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="cl-grid">
            {filtered.map(c => (
              <div key={c.id} className="cl-card" onClick={() => setOpenCarousel(c)}>
                <div className="cl-card__num">{c.num}</div>
                <div className="cl-card__cat">{c.category}</div>
                <div className="cl-card__title">{c.title}</div>
                <div className="cl-card__meta">
                  <span>{c.persona}</span>
                  <span className="cl-card__meta-dot" />
                  <span>{c.slides.length} slides</span>
                </div>
                <button className="cl-card__btn" onClick={e => { e.stopPropagation(); setOpenCarousel(c); }}>
                  View →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {openCarousel && (
        <CarouselModal
          carousel={openCarousel}
          onClose={() => setOpenCarousel(null)}
        />
      )}
    </>
  );
}
