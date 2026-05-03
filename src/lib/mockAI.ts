import type { TranscriptEntry, AISuggestion, AIAnalysisResult, CallStage, SuggestionType, CoachingWalkthrough, CoachingKeyMoment, CoachingItem, CallSession } from '../types';
import type { BattleCard } from './ai';
import { genId } from './id';

// ─── Memory ───────────────────────────────────────────────────────────────────

export interface Memory {
  lastLabel: string | null;
  lastObjectionType: string | null;
  closeAttempted: boolean;
  phaseLabel?: string | null;
}

const LABEL_COOLDOWN    = 75; // seconds before the same neutral-preset label can repeat
const FALLBACK_COOLDOWN = 50; // seconds before the same fallback label can repeat

// ─── Call config shorthand ────────────────────────────────────────────────────

type CallConfig = { prospectName: string; company: string; yourPitch: string; callGoal: string };

function fill(text: string, config?: CallConfig): string {
  if (!config) return text;
  const name  = config.prospectName || 'there';
  const co    = config.company      || 'your company';
  const pitch = config.yourPitch    || 'what I have for you';
  const goal  = config.callGoal     || 'connect with you today';
  return text
    .replace(/\[Prospect\]/g,       name)
    .replace(/\[prospect\]/g,       name)
    .replace(/\[their company\]/gi, co)
    .replace(/\[Company\]/g,        co)
    .replace(/\[company\]/g,        co)
    .replace(/\[Pitch\]/g,          pitch)
    .replace(/\[pitch\]/g,          pitch)
    .replace(/\[Goal\]/g,           goal)
    .replace(/\[goal\]/g,           goal);
}

// ─── Objection Map ────────────────────────────────────────────────────────────
// Body format: "Exact script to say"  - or -  "Script\n\nNote"
// responses[0] = first time   |   responses[1] = repeat / escalation

interface ObjectionDef { label: string; responses: [string, string]; }

const OBJECTION_MAP: Record<string, ObjectionDef> = {
  'too expensive': {
    label: 'Price Objection',
    responses: [
      "Price is real - I get it. But quick question: what's this problem costing you every month right now? Most teams find the answer is more than they expected, and solving it is cheaper than living with it.",
      "If I could show you the return covers the investment within 90 days, would that change the conversation? If not, I completely understand.",
    ],
  },
  'too costly': {
    label: 'Price Objection',
    responses: [
      "I hear you on cost. But here's what I keep seeing: the teams that push back on price are usually the ones losing the most to the problem we solve. What would the value need to look like for this to make sense for you?",
      "Is it the total number that's the issue, or the timing? Sometimes there's a way to structure this differently.",
    ],
  },
  'too high': {
    label: 'Price Objection',
    responses: [
      "Fair - price is real. But the teams that say this are usually the ones losing the most to the problem we fix. What would the ROI need to look like for this to make sense?",
      "Can we do this: if I put together a specific ROI model for your situation, would you look at it? If the numbers don't work, I'll move on.",
    ],
  },
  'no budget': {
    label: 'No Budget',
    responses: [
      "No budget is a real blocker - I'm not going to pretend otherwise. But what's the cost of leaving this unsolved for another quarter? Is there a small pilot we could run to prove the ROI first?",
      "When does your next budget cycle open? The teams that planned ahead had the most leverage when it did. I'd rather time this right than miss the window entirely.",
    ],
  },
  "can't afford": {
    label: 'Budget Constraint',
    responses: [
      "Budget constraints are real - I get it. What would the numbers need to look like internally for this to make sense?",
      "Is this a permanent constraint or a timing issue? If it's timing, I'd rather come back at the right moment than lose the conversation.",
    ],
  },
  'out of budget': {
    label: 'Budget Constraint',
    responses: [
      "I hear you - every month this goes unfixed, the gap gets wider. Would a phased approach or a small pilot be a way to get started without blowing the budget?",
      "When does your next cycle start? I'll time this right instead of pushing at the wrong moment.",
    ],
  },
  'not in the budget': {
    label: 'Budget Constraint',
    responses: [
      "Totally understand. This issue tends to compound when it's underfunded. When does your next budget cycle start? Let's plan around it.",
      "Who would need to approve this if you decided it was worth pursuing? I want to make sure the right conversation happens at the right time.",
    ],
  },
  'not interested': {
    label: 'Hard Objection',
    responses: [
      "I respect that - I won't push. One honest question before I go: what does your situation look like in 6 months if this stays unsolved? Give me 60 seconds - if it's not relevant, I'll let you go.",
      "You've said it twice - I hear you. Before I go: what's your current plan for handling this? If you've got it covered, I'm genuinely done.",
    ],
  },
  'not a good fit': {
    label: 'Not a Fit',
    responses: [
      "Fair - you know your situation better than I do. What specifically feels off? Because the teams that said the same thing usually had one concern I hadn't addressed yet.",
      "One honest question: what would a good fit look like for you right now? If I can't match it, I'll tell you straight and we're done.",
    ],
  },
  'no thanks': {
    label: 'Hard Objection',
    responses: [
      "Before you go - honest question: what would have made this relevant today? Because the problem we solve is getting worse for teams in your space. I'm not going to chase you.",
      "Last thing - can I send you one page? No pitch, just one number showing what this problem typically costs teams in your space. Delete it if it's not relevant.",
    ],
  },
  "don't want": {
    label: 'Hard Rejection',
    responses: [
      "Heard - I won't push. Quick question before I go: what's your current plan for this? If you've got it handled, I'm done.",
      "You've made it clear - I respect that. Last thing: if this got significantly worse over the next 6 months, what would you do? That's all I need to know, then I'm off your radar.",
    ],
  },
  "don't wanna": {
    label: 'Hard Rejection',
    responses: [
      "Fair enough - I'm not here to sell you something you don't want. Tell me: is it that this isn't the right fit, or is the timing just wrong? Those are very different things.",
      "Last question and then I'm done: what would need to change for this to even be worth 5 minutes? If nothing, I genuinely respect that.",
    ],
  },
  'i told you': {
    label: 'Last Shot',
    responses: [
      "You're right - I apologize for pushing. One final thing and I'm gone: would it help if I sent you a quick 2-minute read, no strings attached? If no, I'll take you off my list right now.",
      "I'm done - thank you for your time. I won't call again. If anything changes on your end, you have my contact.",
    ],
  },
  'not buying': {
    label: 'Hard Rejection',
    responses: [
      "I hear that - I won't fight it. One question: what's the one thing that would need to be true for you to reconsider? I want to know if there's even a path here.",
      "Noted - you've been clear. I'll move on. If the situation changes, reach out. I won't keep calling.",
    ],
  },
  'not right now': {
    label: 'Timing Objection',
    responses: [
      "Timing matters - I get it. What concerns me is that this problem compounds: every quarter it goes unaddressed, the gap gets harder to close. What would have to be true for the timing to be right?",
      "What's driving the delay? If I know what's in the way, I can either work around it or tell you honestly that I can't.",
    ],
  },
  'not the right time': {
    label: 'Timing Objection',
    responses: [
      "When would be the right time? The teams that waited usually said they wished they'd moved sooner. Help me understand your timeline and I'll build around it.",
      "What's the earliest this could realistically move? I'd rather know now so I reach out at the right moment.",
    ],
  },
  'send me info': {
    label: 'Info Stall',
    responses: [
      "Happy to - but I want it to actually be useful. What's the one thing you'd most want it to address? Give me five minutes and I'll tell you if it's relevant before I send anything.",
      "I'll send it. But honestly - can we schedule 10 minutes for after you read it, so it actually goes somewhere?",
    ],
  },
  'send an email': {
    label: 'Info Stall',
    responses: [
      "Happy to - before I do, what's the one problem you'd want it to address for your team? I'll lead with that so it's actually worth reading.",
      "I'll send it right after this call. What's the one thing that matters most to you right now? I'll make that the whole email.",
    ],
  },
  'too busy': {
    label: 'Busy Stall',
    responses: [
      "I'll be fast - 60 seconds. This problem costs teams in your space more every month it goes unaddressed. If it's not relevant in 60 seconds, I'll let you go - deal?",
      "I hear you on time. Last thing: if you had 10 minutes next week, would you hear one number that shows what this is quietly costing your team? That's it - yes or no.",
    ],
  },
  'call me back': {
    label: 'Delay',
    responses: [
      "Absolutely - when works best? To make the next call worth it: what's the one question you'd want answered when we reconnect?",
      "I'll call you back - what day and time works? And what's the one thing that would make that call worth your time?",
    ],
  },
  'need to think': {
    label: 'Think It Over',
    responses: [
      "That's fair - what's the main thing you're thinking through? Sometimes it's a question I can answer in 30 seconds. Tell me what's on your mind - I'd rather address it now.",
      "What's the outstanding question? I want to give you exactly what you need to make this decision, not drag it out.",
    ],
  },
  'talk to my boss': {
    label: 'Authority Deflection',
    responses: [
      "Makes sense - who would that be? I want to make sure they have exactly what they need. Can we get them on a 15-minute call together this week?",
      "What's the best way to get 15 minutes with them? I can do a short, focused overview that covers the key points without taking much of their time.",
    ],
  },
  'already have': {
    label: 'Has a Solution',
    responses: [
      "Got it - what do you like most about it? Because the teams that came to us had something in place too, and the gap was usually one specific thing. Can I ask one quick comparison question?",
      "When does your contract renew? I'm not asking you to switch today - I just want to be in the conversation before that window opens.",
    ],
  },
  'using another': {
    label: 'Has a Competitor',
    responses: [
      "Understood - when does your contract renew? The teams that planned ahead had the most leverage when it was time to evaluate. I'm not asking you to do anything today.",
      "One honest question: what's the one thing your current solution doesn't do well? That's usually where we win the conversation.",
    ],
  },
};

interface BuyingSignalDef { label: string; response: string; }

const BUYING_SIGNAL_MAP: Record<string, BuyingSignalDef> = {
  'interested':       { label: 'Interest Signal',  response: "That's great to hear. What does your current situation look like around this? I want to understand the specifics before saying anything else. If the fit is there, the next step is a 20-minute walkthrough - does this week work?" },
  'tell me more':     { label: 'Curiosity Signal',  response: "Happy to. Most teams in your space are quietly losing time and money to this, and they don't fully realize it until we put a number on it. Which part is most relevant to what you're dealing with right now?" },
  'how much':         { label: 'Pricing Signal',    response: "Good question - I want to give you a real number, not a range. First: what's this problem costing you right now? Most clients find the investment is a fraction of what they were already losing. Tell me your setup and I'll give you the exact number." },
  'how does it work': { label: 'Demo Signal',       response: "Short version: we remove the friction that's quietly costing you the most - and the results happen without adding to your team's workload. Honestly the fastest way to get it is to see it. Can I show you in 10 minutes right now?" },
  'when can':         { label: 'Timeline Signal',   response: "We can move fast - most clients are live and seeing results within a few weeks. If we start this week, what would need to happen on your end to make that smooth?" },
  "what's included":  { label: 'Feature Curiosity', response: "The core includes everything you'd need to solve the main problem - and the part that moves the needle fastest is the one that directly addresses what you just described. Want to do a quick 15-minute walkthrough?" },
  'sounds good':      { label: 'Positive Signal',   response: "Let's make it happen. The teams that moved on this quickly said they wished they hadn't waited. Should we lock in 20 minutes this week, or is there someone else you'd want in that conversation?" },
  'makes sense':      { label: 'Agreement Signal',  response: "Glad it's landing - because what you just confirmed is exactly the position our best clients were in before they got started. What's your availability this week for a focused 20-minute session?" },
  'can you':          { label: 'Action Request',    response: "Absolutely - and I want to make sure it's set up right from day one. Let me take care of that for you, and I'll make sure you're positioned for the best outcome at the same time. Does that work?" },
};

export const STAGE_TIPS: Record<CallStage, string> = {
  opener:    "What does this problem look like for your team right now?\n\nAsk this, then stop. Let them describe it in their own words.",
  discovery: "Help me understand this - how long has this been a challenge, and what's the biggest cost for your team?\n\nStay on this until they describe the pain in their own words.",
  pitch:     "Here's what I keep hearing from teams in your space - and it's exactly what we solve. The companies that acted on this saw a real difference within 90 days. Does that connect?",
  close:     "Based on what you've shared, the next step is a 20-minute walkthrough. Does [day/time] work for you?\n\nThen stop talking. The next person to speak loses.",
};

// ─── Conversation Context ─────────────────────────────────────────────────────

interface ConversationContext {
  /** Overall prospect engagement tone derived from objection/buying-signal counts */
  tone: 'hostile' | 'hesitant' | 'neutral' | 'curious' | 'interested';
  /** Text of the first entry where the prospect confirmed a pain point */
  confirmedPain: string | null;
  /** Competing tool or existing solution the prospect mentioned */
  mentionedTool: string | null;
  /** Most recent prospect utterance (for quoting back) */
  lastProspectQuote: string | null;
  /** How many times the prospect has spoken */
  prospectTurnCount: number;
}

function extractContext(transcript: TranscriptEntry[]): ConversationContext {
  const prospectEntries = transcript.filter(e => e.speaker === 'prospect');

  const objections   = prospectEntries.filter(e => e.signal === 'objection').length;
  const buyingSignals = prospectEntries.filter(e => e.signal === 'buying-signal').length;

  let tone: ConversationContext['tone'] = 'neutral';
  if (objections >= 2)       tone = 'hostile';
  else if (objections === 1) tone = 'hesitant';
  else if (buyingSignals >= 2) tone = 'interested';
  else if (buyingSignals === 1) tone = 'curious';

  const painKeywords = ['struggle', 'problem', 'issue', 'challenge', 'difficult', 'frustrat',
    'waste', 'slow', 'manual', 'expensive', 'costly', 'broken', 'miss', 'losing', 'pain'];
  const confirmedPain = prospectEntries.find(e =>
    painKeywords.some(k => e.text.toLowerCase().includes(k)))?.text ?? null;

  const toolKeywords = ['salesforce', 'hubspot', 'zoho', 'pipedrive', 'monday', 'notion',
    'slack', 'microsoft', 'google', 'excel', 'spreadsheet', 'sheets', 'airtable',
    'dynamics', 'close.io', 'outreach', 'salesloft'];
  let mentionedTool: string | null = null;
  for (const e of prospectEntries) {
    const low = e.text.toLowerCase();
    const found = toolKeywords.find(t => low.includes(t));
    if (found) { mentionedTool = found; break; }
  }

  const lastProspectQuote = prospectEntries.length > 0
    ? prospectEntries[prospectEntries.length - 1].text
    : null;

  return { tone, confirmedPain, mentionedTool, lastProspectQuote, prospectTurnCount: prospectEntries.length };
}

/** Builds a 1-2 line personalized note appended to suggestion bodies. Returns null if nothing useful. */
function buildContextHint(ctx: ConversationContext, currentTrigger: string): string | null {
  const hints: string[] = [];

  if (ctx.mentionedTool) {
    hints.push(`They mentioned ${ctx.mentionedTool} - tie your angle to the gap their current tool leaves.`);
  }

  if (ctx.confirmedPain && ctx.confirmedPain !== currentTrigger) {
    const q = ctx.confirmedPain.length > 65
      ? ctx.confirmedPain.slice(0, 62) + '...'
      : ctx.confirmedPain;
    hints.push(`They confirmed earlier: "${q}" - anchor back to that.`);
  }

  if (ctx.tone === 'hostile') {
    hints.push('They\'re resisting hard. One short question, then stop - let them talk.');
  } else if (ctx.tone === 'interested') {
    hints.push('They\'re engaged. Push for a concrete next step now.');
  } else if (ctx.tone === 'curious') {
    hints.push('They\'re leaning in. Keep the momentum - ask one specific question.');
  }

  return hints.length > 0 ? hints.join(' ') : null;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function detectStage(elapsedSeconds: number): CallStage {
  if (elapsedSeconds < 60)  return 'opener';
  if (elapsedSeconds < 120) return 'discovery';
  if (elapsedSeconds < 240) return 'pitch';
  return 'close';
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function makeSuggestion(
  type: SuggestionType,
  headline: string,
  body: string,
  triggeredBy: string,
  timestampSeconds: number
): AISuggestion {
  return { id: genId(), type, headline, body, triggeredBy, timestampSeconds };
}

// ─── Keyword Analysis ─────────────────────────────────────────────────────────

function analyzeWithKeywords(
  newEntry: TranscriptEntry,
  _currentStage: CallStage,
  elapsedSeconds: number,
  currentProbability: number,
  currentObjectionsCount: number,
  recentTriggers: Map<string, number>,
  config?: CallConfig,
  ctx?: ConversationContext
): AIAnalysisResult {
  const suggestions: AISuggestion[] = [];
  const text = newEntry.text.toLowerCase();
  let probability = currentProbability;
  let objectionsCount = currentObjectionsCount;
  const now = elapsedSeconds;

  const variantIndex = currentObjectionsCount >= 1 ? 1 : 0;

  for (const [keyword, def] of Object.entries(OBJECTION_MAP)) {
    if (text.includes(keyword)) {
      const lastTriggered = recentTriggers.get(keyword) ?? -999;
      if (now - lastTriggered > 30) {
        recentTriggers.set(keyword, now);
        const raw = def.responses[Math.min(variantIndex, def.responses.length - 1)];
        const base = fill(raw, config);
        const hint = ctx ? buildContextHint(ctx, newEntry.text) : null;
        const body = hint ? `${base}\n\n- ${hint}` : base;
        suggestions.push(makeSuggestion('objection-response', def.label, body, newEntry.text, elapsedSeconds));
        probability -= 10;
        objectionsCount += 1;
        break;
      }
    }
  }

  if (suggestions.length === 0) {
    for (const [keyword, def] of Object.entries(BUYING_SIGNAL_MAP)) {
      if (text.includes(keyword)) {
        const base = fill(def.response, config);
        const hint = ctx ? buildContextHint(ctx, newEntry.text) : null;
        const body = hint ? `${base}\n\n- ${hint}` : base;
        suggestions.push(makeSuggestion('close-attempt', def.label, body, newEntry.text, elapsedSeconds));
        probability += 8;
        break;
      }
    }
  }

  return {
    suggestions,
    updatedProbability: clamp(probability, 5, 95),
    updatedStage: detectStage(elapsedSeconds),
    updatedObjectionsCount: objectionsCount,
  };
}

// ─── Neutral Presets ──────────────────────────────────────────────────────────
// Body format: "Script to say\n\nOptional brief note"

interface NeutralPreset {
  keywords: string[];
  label: string;
  responses: Record<CallStage, string>;
}

const NEUTRAL_PRESETS: NeutralPreset[] = [
  {
    keywords: ['hello', 'hi ', 'hey ', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    label: 'Opener Hook',
    responses: {
      opener:    "Quick intro - [Pitch]. My goal today is to [goal]. Is that worth 60 seconds?\n\nState your name and company first, then this line.",
      discovery: "Good to connect, [Prospect]. I want to make sure this is relevant - how does [pitch] line up with what you're focused on right now?",
      pitch:     "Here's the core of it: [Pitch]. Based on what you've shared, that connects directly. Does that land for you?",
      close:     "Based on everything we've covered, the next step is to [goal]. Does [day/time] work for you?",
    },
  },
  {
    keywords: ['who is this', "who's this", 'who are you', "what's this about", "what's it about", 'what do you want', 'why are you calling', 'how did you get my'],
    label: 'Identify & Hook',
    responses: {
      opener:    "My name is [your name] - I'm calling because [Pitch], and my goal is to [goal]. Worth 60 seconds?\n\nSay your actual name and company before this line.",
      discovery: "The reason I'm calling: [Pitch]. And based on what you've told me, I think there's a real fit. Can I ask one quick question to confirm?",
      pitch:     "To be direct - [Pitch]. For [Company] specifically, the ask is simple: [goal]. Does that make sense?",
      close:     "The simplest next step: [goal]. Can we lock that in right now?",
    },
  },
  {
    keywords: ['i see', 'alright', 'uh huh', 'mm-hmm', 'go on', 'i hear you', 'understood'],
    label: 'Keep Going',
    responses: {
      opener:    "Appreciate that - so what does this problem look like for your team right now? I want to make sure I'm talking about the right thing before I say anything else.",
      discovery: "Good - what's the biggest gap in how you're handling that today? There's usually one thing that's not quite working.",
      pitch:     "The reason that matters is that it directly addresses what you just described - and the teams that fixed it saw the difference quickly. Does that connect?",
      close:     "Then we're aligned. Let's get 20 minutes on the calendar. What's your availability this week?",
    },
  },
  {
    keywords: ["i don't know", "i dont know", "not sure", "we'll see", "i guess", "kind of", "sort of", "possibly"],
    label: 'Surface Hesitation',
    responses: {
      opener:    "That's a fair reaction - what's the one thing making you hesitant right now? I'd rather know than guess.",
      discovery: "What's holding you back? The teams that felt the same way usually had one specific question I could answer in 30 seconds.",
      pitch:     "What part doesn't feel like a fit yet? There might be something I haven't shown you - tell me what's on your mind.",
      close:     "What's the one thing that would need to be true for this to be a yes? Let's address it right now.",
    },
  },
  {
    keywords: ['what does it do', 'how does it help', 'what exactly', 'can you explain', 'tell me about it', 'what is it', 'what do you do'],
    label: 'Pitch Cue',
    responses: {
      opener:    "[Pitch] - and my goal today is to [goal]. Does that match what you were asking about?",
      discovery: "[Pitch] - but let me make sure it's relevant to you first. What does your situation look like right now?",
      pitch:     "The core of what I'm offering: [Pitch]. That's what we've been building toward in this conversation. Does that fit?",
      close:     "The best way to understand it fully is to [goal]. Can we do that now?",
    },
  },
  {
    keywords: ['we struggle', "it's a problem", "that's an issue", 'we spend a lot', 'takes too long', 'not efficient', 'frustrating', 'pain point'],
    label: 'Pain Confirmed',
    responses: {
      opener:    "That's the exact reason I called. How long has that been going on - and what have you tried so far?",
      discovery: "That's the problem we were built to solve. What's the biggest cost of it for your team - time, money, or both?",
      pitch:     "That's exactly what a team in your space was dealing with before they worked with us - they turned it around within 90 days. Does that kind of result matter to you?",
      close:     "You've confirmed the problem is real. The only question is timing - and the longer it sits, the more it costs. Can we lock in a session this week?",
    },
  },
  {
    keywords: ['interesting', "that's interesting", 'good point', 'fair enough', 'i like that', 'that makes sense', 'i agree'],
    label: 'Momentum',
    responses: {
      opener:    "Good - what does that look like for your team right now? I want to understand your specific situation before I say anything else.",
      discovery: "Glad it resonates. What's the biggest cost of this problem for you - time, revenue, or something else?",
      pitch:     "That's what our best clients said too - and they saw real results within 90 days. We can get you to the same place.",
      close:     "Then let's lock it in - the next step is to [goal]. Should I take care of that now, or is there someone else you'd want involved?",
    },
  },
  {
    keywords: ['we currently', 'we use', 'we have a', 'we do it', 'our process', 'right now we'],
    label: 'Current State',
    responses: {
      opener:    "Good to know - what's the biggest weak spot in that setup? There's usually one thing teams wish it handled better.",
      discovery: "Got it - where does that break down most? The teams we work with had the same setup and found one specific gap that was costing them without them realizing it.",
      pitch:     "The gap we typically close is the one your current setup misses most - and that's usually where the biggest cost is hiding. Is that the weak spot for you?",
      close:     "A team in your exact setup made the switch and saw the results within 90 days. Want to see exactly how?",
    },
  },
  {
    keywords: ['does it work', 'results', 'proof', 'case study', 'example', 'who else', 'other companies'],
    label: 'Social Proof',
    responses: {
      opener:    "Fair question. A business in your space went from the exact problem you're describing to a full fix in under 90 days. Your situation sounds similar.",
      discovery: "Two examples: one company in your space fixed this and eliminated the hidden cost within a quarter. Another saw significant improvement in their first month. Both started exactly where you are.",
      pitch:     "A client in your exact setup made this switch and achieved a real, measurable result within 90 days. I can walk you through the specifics if that's useful.",
      close:     "I can send you two relevant case studies right now - and then let's spend 20 minutes walking through the one most relevant to your team. Does that work?",
    },
  },
  {
    keywords: ['my team', 'our team', 'the team', 'my manager', 'my boss', 'the board', 'leadership'],
    label: 'Stakeholder Map',
    responses: {
      opener:    "Who else would need to weigh in on something like this? I want to make sure I'm talking to the right people from the start.",
      discovery: "Who feels the most pain from this problem day-to-day? That's usually the person who makes the internal case.",
      pitch:     "Who else would need to be comfortable before you could move forward? Let's get them into a 20-minute conversation together - it moves much faster that way.",
      close:     "Let's get the right people in one 20-minute call - decisions get made 3x faster. Can you get the decision-maker on a call this week?",
    },
  },
  {
    keywords: ['this week', 'next week', 'next month', 'end of quarter', 'q1', 'q2', 'q3', 'q4', 'this year'],
    label: 'Timeline Signal',
    responses: {
      opener:    "That works - what would need to happen between now and then for this to be on track?",
      discovery: "If you're thinking that timeline, we should start the evaluation now. Teams that wait usually miss the window.",
      pitch:     "Teams we've helped with your timeline were live and seeing results within a few weeks of starting. If we begin this week, you're in a strong position.",
      close:     "We can hit that timeline. Let's get 20 minutes this week so you have everything you need to move. Does [day] work?",
    },
  },
  {
    keywords: ['okay', 'ok', 'sure', 'yep', 'yeah', 'yes', 'right', 'exactly', 'correct', 'absolutely'],
    label: 'Advance',
    responses: {
      opener:    "Good - so tell me: what does this problem look like for your team right now?",
      discovery: "Perfect - what's the biggest cost of this for you? Time lost, revenue impact, or something else?",
      pitch:     "Great - the part most relevant to you is how we solve the exact thing you described. Does that connect to what you've been dealing with?",
      close:     "Then let's move. I'll send a calendar invite - does [day/time] work for a 20-minute walkthrough?",
    },
  },
];

// ─── Context-Aware Fallback ───────────────────────────────────────────────────

const CONTEXT_FALLBACKS = {
  clean: {
    label: 'Stage Move',
    response: {
      opener:    "Quick question - what's your situation with [pitch] right now? I want to understand where you're at before I say anything else.\n\nAsk this, then stop. Let them describe it.",
      discovery: "Help me understand - how does [pitch] fit into what you're working on? What would the ideal outcome look like for you?\n\nStay on this until they describe their situation in their own words.",
      pitch:     "Here's what it comes down to: [Pitch]. And for you, the goal is [goal]. Does that feel like the right direction?\n\nIf they're quiet: 'What part isn't landing yet?'",
      close:     "Based on what you've shared, the next step is [goal]. Shall we lock that in?\n\nThen stop. Let them respond.",
    },
  },
  'after-objection': {
    label: 'Bridge',
    response: {
      opener:    "I hear you - I'm not here to push. One honest question: what would solving this actually be worth to your team if the timing was right? That's all I'm trying to understand.",
      discovery: "Noted. What's your current plan for handling this without us? I want to make sure you have a path forward either way.",
      pitch:     "Fair. Last thing: the one result that matters most to teams in your position is being able to handle this without it getting worse. Is that relevant to what you're dealing with?",
      close:     "Before I go - is there a better time to revisit this, or is the answer a firm no? Either way is fine - I just don't want to guess.",
    },
  },
  persistent: {
    label: 'Hold the Frame',
    response: {
      opener:    "I hear you - I won't push further. One last thing: if this problem got worse over the next quarter, what's your plan? If you've got it covered, I'm genuinely done.",
      discovery: "You've been consistent - I respect that. I'm going to let you go. If anything changes, I'm easy to reach. Thanks for your time.",
      pitch:     "I hear you. I'm not going to keep going. I'll send you one page - no pitch, just one number showing what this costs teams in your space. Delete it if it's not relevant.",
      close:     "Understood. I won't call again. If the situation changes and you want to revisit this, reach out. Good luck.",
    },
  },
} as const;

// ─── Preset-Based Analysis ────────────────────────────────────────────────────

type StreamCallback = (s: AISuggestion) => void;

function analyzeWithPresets(
  newEntry: TranscriptEntry,
  currentStage: CallStage,
  elapsedSeconds: number,
  currentProbability: number,
  currentObjectionsCount: number,
  recentTriggers: Map<string, number>,
  config?: CallConfig,
  memory?: Memory,
  ctx?: ConversationContext,
  onStream?: StreamCallback
): AIAnalysisResult {
  const keywordResult = analyzeWithKeywords(
    newEntry, currentStage, elapsedSeconds,
    currentProbability, currentObjectionsCount, recentTriggers, config, ctx
  );
  if (keywordResult.suggestions.length > 0) {
    const s = keywordResult.suggestions[0];
    if (onStream) onStream({ ...s, streaming: false });
    return keywordResult;
  }

  // Only coach based on what the PROSPECT says - rep entries don't drive suggestions
  if (newEntry.speaker !== 'rep') {
    const lower = newEntry.text.toLowerCase();
    for (const preset of NEUTRAL_PRESETS) {
      if (!preset.keywords.some(k => lower.includes(k))) continue;
      // Per-label cooldown: same label can't fire more than once per LABEL_COOLDOWN seconds
      const labelKey = `label:${preset.label}`;
      const lastFired = recentTriggers.get(labelKey) ?? -999;
      if (elapsedSeconds - lastFired < LABEL_COOLDOWN) continue;
      // Memory dedup: don't repeat the exact same label back-to-back
      if (memory?.lastLabel === preset.label) continue;
      recentTriggers.set(labelKey, elapsedSeconds);
      const base = fill(preset.responses[currentStage], config);
      const hint = ctx ? buildContextHint(ctx, newEntry.text) : null;
      const body = hint ? `${base}\n\n- ${hint}` : base;
      const suggestion = makeSuggestion('tip', preset.label, body, newEntry.text, elapsedSeconds);
      if (onStream) onStream({ ...suggestion, streaming: false });
      return {
        suggestions: [suggestion],
        updatedProbability: clamp(currentProbability + 2, 5, 95),
        updatedStage: detectStage(elapsedSeconds),
        updatedObjectionsCount: currentObjectionsCount,
      };
    }

    // Fallback: only fire when enough time has passed and it's a new label
    const fbKey = currentObjectionsCount >= 2 ? 'persistent' :
                  currentObjectionsCount >= 1 ? 'after-objection' : 'clean';
    const fb = CONTEXT_FALLBACKS[fbKey];
    const fallbackLabelKey = `label:${fb.label}`;
    const lastFbFired = recentTriggers.get(fallbackLabelKey) ?? -999;
    if (elapsedSeconds - lastFbFired >= FALLBACK_COOLDOWN && memory?.lastLabel !== fb.label) {
      recentTriggers.set(fallbackLabelKey, elapsedSeconds);
      const fbBase = fill(fb.response[currentStage], config);
      const fbHint = ctx ? buildContextHint(ctx, newEntry.text) : null;
      const fbBody = fbHint ? `${fbBase}\n\n- ${fbHint}` : fbBase;
      const fallback = makeSuggestion('tip', fb.label, fbBody, newEntry.text, elapsedSeconds);
      if (onStream) onStream({ ...fallback, streaming: false });
      return {
        suggestions: [fallback],
        updatedProbability: currentProbability,
        updatedStage: detectStage(elapsedSeconds),
        updatedObjectionsCount: currentObjectionsCount,
      };
    }
  }

  return {
    suggestions: [],
    updatedProbability: currentProbability,
    updatedStage: detectStage(elapsedSeconds),
    updatedObjectionsCount: currentObjectionsCount,
  };
}

// ─── Main Analysis Function ───────────────────────────────────────────────────

export async function analyzeTranscript(
  newEntry: TranscriptEntry,
  fullTranscript: TranscriptEntry[],
  currentStage: CallStage,
  elapsedSeconds: number,
  currentProbability: number,
  currentObjectionsCount: number,
  recentTriggers: Map<string, number>,
  config?: CallConfig,
  memory?: Memory,
  onStream?: StreamCallback
): Promise<AIAnalysisResult> {
  const ctx = extractContext(fullTranscript);
  return analyzeWithPresets(
    newEntry, currentStage, elapsedSeconds,
    currentProbability, currentObjectionsCount, recentTriggers, config, memory, ctx, onStream
  );
}

// ─── Coaching Walkthrough ─────────────────────────────────────────────────────

function trunc(text: string, max = 70): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

export function generateCoaching(
  config: CallConfig,
  transcript: TranscriptEntry[],
  suggestions: AISuggestion[],
  closeProbability: number,
  objectionsCount: number
): CoachingWalkthrough {
  const prospect = config.prospectName || 'the prospect';
  const company  = config.company || 'their company';
  const goal     = config.callGoal || 'close the deal';

  const repEntries      = transcript.filter(e => e.speaker === 'rep');
  const prospectEntries = transcript.filter(e => e.speaker === 'prospect');
  const buyingSignalEntries = transcript.filter(e => e.signal === 'buying-signal');
  const objectionEntries    = transcript.filter(e => e.signal === 'objection');
  const buyingSignals   = buyingSignalEntries.length;
  const talkRatio       = transcript.length > 0 ? repEntries.length / transcript.length : 0.5;
  const lastTimestamp   = transcript.length > 0 ? transcript[transcript.length - 1].timestampSeconds : 0;
  const reachedCloseStage = lastTimestamp > 200;

  // Pull the opener — first substantive rep utterance
  const openerEntry = repEntries.find(e => e.text.trim().length > 10);
  const openerText  = openerEntry ? trunc(openerEntry.text, 80) : null;
  const openerIsQuestion = openerText ? openerText.includes('?') : false;
  const openerMentionsProspect = openerText
    ? openerText.toLowerCase().includes((config.prospectName || '').toLowerCase()) && (config.prospectName || '').length > 1
    : false;

  // Pull the first objection
  const firstObjection = objectionEntries[0];
  // Find the rep's response to the first objection (next rep entry after it)
  const firstObjIndex = firstObjection ? transcript.indexOf(firstObjection) : -1;
  const repResponseToObj = firstObjIndex >= 0
    ? transcript.slice(firstObjIndex + 1).find(e => e.speaker === 'rep')
    : null;

  // Did the rep ask ANY discovery questions?
  const discoveryQuestions = repEntries.filter(e => e.text.includes('?'));

  const whatWentWell: CoachingItem[] = [];
  const areasToImprove: CoachingItem[] = [];

  // ── WHAT WENT WELL ──

  if (buyingSignals >= 2) {
    const quote = trunc(buyingSignalEntries[0].text, 70);
    whatWentWell.push({
      point: `${prospect} gave ${buyingSignals} buying signals — real interest surfaced.`,
      salesNote: `When ${prospect} said "${quote}" — that was the door opening. You generated genuine interest, which means your pitch connected with something real. Most reps blow this moment by over-explaining. The move is to stop selling and start confirming: "Sounds like this resonates — what would next steps look like for you?"`,
    });
  } else if (buyingSignals === 1) {
    const quote = trunc(buyingSignalEntries[0].text, 70);
    whatWentWell.push({
      point: `${prospect} showed interest — a buying signal came through.`,
      salesNote: `When ${prospect} said "${quote}" — that was real interest. One signal is a crack in the door. The best reps recognise it and immediately shift from pitching to progressing. Next time: "That resonates — what would it take on your end to move this forward?"`,
    });
  }

  if (objectionsCount >= 1 && suggestions.some(s => s.type === 'objection-response')) {
    const objQuote = firstObjection ? trunc(firstObjection.text, 60) : 'the objection raised';
    whatWentWell.push({
      point: `Kept the conversation going through ${objectionsCount} objection${objectionsCount > 1 ? 's' : ''}.`,
      salesNote: `When ${prospect} said "${objQuote}", you didn't fold. Staying composed under objection pressure separates closers from order-takers. The instinct is to defend — you kept asking. That's the right move every time.`,
    });
  }

  if (closeProbability >= 65) {
    whatWentWell.push({
      point: `Close probability hit ${closeProbability}% — strong momentum built with ${prospect}.`,
      salesNote: `Getting to ${closeProbability}% with ${prospect} at ${company} means they saw value and felt understood. The risk at this stage is talking them out of it. Confirm the pain, confirm the next step, then get off the call. Less words, more commitment.`,
    });
  } else if (closeProbability >= 50) {
    whatWentWell.push({
      point: `Held above 50% close probability — ${prospect} stayed engaged throughout.`,
      salesNote: `Staying above 50% with ${prospect} means you never fully lost the room. A lot of reps collapse at the first pushback. The foundation is there — the gap to close is sharpening how you connect their pain at ${company} to the specific outcome you deliver.`,
    });
  }

  if (talkRatio <= 0.45 && prospectEntries.length > 2) {
    whatWentWell.push({
      point: `Good talk ratio — ${prospect} spoke more than you did.`,
      salesNote: `You let ${prospect} talk. Every second they speak is intel you can use to close them. Most reps fill silence with more pitch. You didn't — and that's what keeps prospects on the line. The best salespeople in any room talk the least.`,
    });
  }

  if (reachedCloseStage && discoveryQuestions.length >= 2) {
    whatWentWell.push({
      point: `Ran a full call structure — discovery through to the close stage.`,
      salesNote: `You asked ${discoveryQuestions.length} discovery question${discoveryQuestions.length !== 1 ? 's' : ''} and reached the close stage with ${prospect}. Most calls die in discovery because reps pitch too early. Running the full structure compounds — ${prospect} felt heard before you pitched.`,
    });
  }

  if (whatWentWell.length === 0) {
    whatWentWell.push({
      point: 'You ran the call and engaged — that\'s the foundation to build on.',
      salesNote: `Every elite rep has calls that don't land. The ones who compound are the ones who review them. The fact that you're here analysing this call with ${prospect} at ${company} means you're already ahead of reps who just move on.`,
    });
  }

  // ── AREAS TO IMPROVE ──

  if (openerText && !openerIsQuestion && !openerMentionsProspect) {
    const betterOpener = `"${prospect}, most ${company ? 'teams at ' + company : 'companies'} struggle with ${goal.toLowerCase().includes('appoint') ? 'booking consistent meetings' : goal.toLowerCase()}. Is that on your radar right now?"`;
    areasToImprove.push({
      point: `Opener was a statement, not a hook — ${prospect} had no reason to engage immediately.`,
      salesNote: `You opened with "${openerText}" — that's easy to dismiss. Instead, lead with their world: ${betterOpener}. A question tied to a specific pain forces a yes/no and gets them talking in the first 10 seconds.`,
    });
  } else if (openerText && !openerIsQuestion) {
    areasToImprove.push({
      point: 'Opener was a statement — missing the hook that pulls them into the conversation.',
      salesNote: `You opened with "${openerText}". Statements let prospects stay passive. Flip it to a pain question: "What's the biggest friction in [their specific process] right now?" Forces engagement from word one.`,
    });
  }

  if (talkRatio > 0.6 && transcript.length > 4) {
    const repWordsCount = repEntries.reduce((n, e) => n + e.text.split(' ').length, 0);
    areasToImprove.push({
      point: `You spoke ${Math.round(talkRatio * 100)}% of the call — ${prospect} didn't get space to commit.`,
      salesNote: `You averaged roughly ${Math.round(repWordsCount / Math.max(repEntries.length, 1))} words per turn. After your next statement, stop and ask: "Does that make sense for what you're dealing with at ${company}?" Then go silent. The first person to speak after a question loses — and it shouldn't be you.`,
    });
  }

  if (firstObjection && repResponseToObj) {
    const objQuote    = trunc(firstObjection.text, 65);
    const repResponse = trunc(repResponseToObj.text, 65);
    areasToImprove.push({
      point: `Objection from ${prospect} wasn't fully neutralised before moving on.`,
      salesNote: `${prospect} said: "${objQuote}"\nYou responded: "${repResponse}"\nInstead, try: "That's fair — help me understand, is it the [price/timing/fit] itself, or is it that you're not sure this solves the problem yet?" Isolating the real objection before responding stops you from defending the wrong thing.`,
    });
  } else if (objectionsCount >= 2) {
    areasToImprove.push({
      point: `${objectionsCount} objections raised — resistance built before the value landed.`,
      salesNote: `Multiple objections from ${prospect} usually means the pitch came before the pain was confirmed. The fix isn't better objection handling — it's better discovery. Ask: "Before I tell you anything about what we do, help me understand the problem." If they feel understood, they don't push back this hard.`,
    });
  }

  if (buyingSignals === 0 && transcript.length > 4) {
    const repQuestion = discoveryQuestions[0];
    if (repQuestion) {
      areasToImprove.push({
        point: `No buying signals from ${prospect} — the pain didn't land as urgent.`,
        salesNote: `You asked "${trunc(repQuestion.text, 65)}" but ${prospect} didn't light up. The issue is usually that the question stays surface-level. Go deeper: "What does that problem cost ${company} per month?" or "What happens if this isn't fixed in the next quarter?" Urgency doesn't come from your pitch — it comes from their answer.`,
      });
    } else {
      areasToImprove.push({
        point: `No buying signals and no discovery questions — ${prospect} had no reason to show interest.`,
        salesNote: `Buying signals aren't volunteered — they're earned with the right questions. Try: "What would it mean for your team at ${company} if this was solved?" That question ties the solution to a real outcome they care about.`,
      });
    }
  }

  if (closeProbability < 40) {
    areasToImprove.push({
      point: `Close probability stayed low at ${closeProbability}% — the call didn't build urgency with ${prospect}.`,
      salesNote: `Low probability means ${prospect} doesn't yet see the gap between where ${company} is and where they want to be. That gap is your entire job. You can't pitch into a gap they don't feel. Ask: "On a scale of 1–10, how big a priority is fixing [this problem] right now?" Their answer tells you exactly where to push.`,
    });
  }

  if (!reachedCloseStage && lastTimestamp > 0) {
    areasToImprove.push({
      point: `Call ended without a next step — no commitment established with ${prospect}.`,
      salesNote: `A call with no next step is a conversation, not a sale. Before you end with ${prospect} next time: "Based on what you've told me, the next step would be [X] — can we get 20 minutes to go through it properly?" Even a micro-commitment keeps the deal alive.`,
    });
  }

  if (areasToImprove.length === 0) {
    areasToImprove.push({
      point: 'No major weaknesses detected — solid execution overall.',
      salesNote: `Clean calls are rare. The next level with ${prospect} is refining how you tie the close to a specific outcome: "If we solve [X] at ${company}, what does that unlock for you?" That question turns a good call into a signed deal.`,
    });
  }

  // ── KEY MOMENTS ──

  const keyMoments: CoachingKeyMoment[] = [];
  for (const entry of transcript) {
    if (entry.signal !== 'neutral') {
      keyMoments.push({
        timestampSeconds: entry.timestampSeconds,
        label: entry.signal === 'objection' ? 'Objection' : 'Buying Signal',
        note: trunc(entry.text, 80),
      });
    }
    if (keyMoments.length >= 5) break;
  }

  // ── NEXT CALL TIP (specific to this call) ──

  let nextCallTip: string;
  if (openerText && !openerIsQuestion) {
    const tipOpener = `"${prospect}, most ${company !== 'their company' ? 'teams at ' + company : 'companies in your space'} are dealing with [pain point]. Is that something you're running into?"`;
    nextCallTip = `Your opener with ${prospect} was a statement — flip it to a question. Try: ${tipOpener} A pain-led question in the first 10 seconds forces engagement before they've mentally checked out.`;
  } else if (talkRatio > 0.6 && transcript.length > 4) {
    nextCallTip = `You spoke ${Math.round(talkRatio * 100)}% of this call with ${prospect}. Next time: after every statement, ask one question and go silent. Specifically try: "What does that look like at ${company} right now?" — then don't speak until they do.`;
  } else if (firstObjection) {
    const objQuote = trunc(firstObjection.text, 55);
    nextCallTip = `When ${prospect} said "${objQuote}" — isolate before you respond. Try: "Is it the [X] specifically, or is it more that you're not sure this is the right fit yet?" Isolating stops you defending the wrong objection.`;
  } else if (buyingSignals === 0 && discoveryQuestions.length === 0) {
    nextCallTip = `No discovery questions were asked with ${prospect}. Before your next call, prepare 3 pain questions specific to ${company}: "What's the #1 thing slowing your team down?", "What have you tried?", "What does solving it unlock?" Ask them in that order.`;
  } else if (closeProbability >= 65) {
    nextCallTip = `${prospect} was at ${closeProbability}% close probability — follow up within 2 hours with one clear ask. Don't re-pitch. Just: "Following up from our call — are you ready to move forward with [next step]?" Short. Specific. Forces a decision.`;
  } else if (!reachedCloseStage) {
    nextCallTip = `You never asked ${prospect} for a next step. End every call with: "Based on what you've told me, I'd suggest [X] as the next step — does that work for you?" Even a 'maybe' becomes a commitment when you name the next action.`;
  } else {
    nextCallTip = `Before your next call with anyone at ${company}, confirm the pain is real: "How long has this been a problem?" and "What have you tried?" If they can't answer, the pain isn't urgent enough — and no pitch will fix that.`;
  }

  // ── OVERALL VERDICT ──

  let overallVerdict: string;
  if (closeProbability >= 70) {
    overallVerdict = `Strong call with ${prospect} — high close potential. Follow up fast before momentum fades.`;
  } else if (closeProbability >= 55) {
    overallVerdict = `Solid call with ${prospect} at ${company}. Good foundation — the gap is sharpening the close.`;
  } else if (closeProbability >= 35) {
    overallVerdict = `Mixed results with ${prospect}. Clear areas to sharpen — see the coaching breakdown below.`;
  } else {
    overallVerdict = `Tough call with ${prospect} at ${company}. Use this as a learning rep — the coaching notes below show exactly what to fix.`;
  }

  return { overallVerdict, whatWentWell, areasToImprove, keyMoments, nextCallTip };
}

// ─── Session Summary ──────────────────────────────────────────────────────────

export function generateSessionSummary(
  config: CallConfig,
  transcript: TranscriptEntry[],
  suggestions: AISuggestion[],
  closeProbability: number,
  objectionsCount: number
): { aiSummary: string; followUpEmail: string; leadScore: number; coaching: CoachingWalkthrough } {
  const buyingSignals = suggestions.filter(s => s.type === 'close-attempt').length;
  const objectionHandlers = suggestions.filter(s => s.type === 'objection-response').length;
  const totalEntries = transcript.length;

  let sentiment = 'neutral';
  if (closeProbability >= 70) sentiment = 'positive';
  else if (closeProbability <= 35) sentiment = 'negative';

  // ── What went well (factual, not coaching) ───────────────────────────────
  const wentWellLines: string[] = [];
  if (buyingSignals >= 1) {
    wentWellLines.push(`${prospect} showed genuine interest — ${buyingSignals} buying signal${buyingSignals !== 1 ? 's' : ''} came through during the call.`);
  }
  if (objectionsCount >= 1 && suggestions.some(s => s.type === 'objection-response')) {
    wentWellLines.push(`Kept the conversation going through ${objectionsCount} objection${objectionsCount > 1 ? 's' : ''}.`);
  }
  if (closeProbability >= 65) {
    wentWellLines.push(`Strong close probability of ${closeProbability}% — ${prospect} stayed engaged and momentum built.`);
  } else if (closeProbability >= 50) {
    wentWellLines.push(`Close probability held at ${closeProbability}% — ${prospect} remained engaged throughout.`);
  }
  if (talkRatio <= 0.45 && prospectEntries.length > 2) {
    wentWellLines.push(`Good balance — ${prospect} did most of the talking.`);
  }
  if (reachedCloseStage) {
    wentWellLines.push(`Reached the close stage by end of the call.`);
  }
  if (wentWellLines.length === 0) {
    wentWellLines.push(`Call completed with ${prospect} at ${company}.`);
  }

  // ── What was discussed ────────────────────────────────────────────────────
  const discussedLines: string[] = [];
  discussedLines.push(`Called ${prospect}${company ? ` at ${company}` : ''}. Goal: ${config.callGoal}.`);
  if (totalEntries > 0) {
    discussedLines.push(`${totalEntries} exchanges recorded across the call.`);
  }
  if (objectionHandlers > 0) {
    const objHeadlines = suggestions.filter(s => s.type === 'objection-response').map(s => s.headline).filter(Boolean);
    if (objHeadlines.length > 0) discussedLines.push(`Objections raised: ${objHeadlines.join(', ')}.`);
  } else {
    discussedLines.push(`No significant objections raised.`);
  }
  if (buyingSignals > 0) {
    const signalHeadlines = suggestions.filter(s => s.type === 'close-attempt').map(s => s.headline).filter(Boolean).slice(0, 3);
    if (signalHeadlines.length > 0) discussedLines.push(`Positive moments: ${signalHeadlines.join(', ')}.`);
  }
  discussedLines.push(`Call ended with a close score of ${closeProbability}%.`);

  const aiSummary = [
    `WHAT WENT WELL`,
    ...wentWellLines.map(l => `• ${l}`),
    ``,
    `WHAT WAS DISCUSSED`,
    ...discussedLines.map(l => `• ${l}`),
  ].join('\n');

  const followUpEmail = `Subject: Following up on our conversation - ${config.company}

Hi ${config.prospectName},

Thank you for taking the time to speak with me today. I wanted to follow up with a quick summary of what we discussed.

We talked about ${config.yourPitch}, specifically in the context of your team at ${config.company}. Based on our conversation, I believe there's a strong fit - particularly around ${config.callGoal}.

${buyingSignals > 0 ? 'You showed interest in learning more, and I want to make sure you have everything you need to evaluate this properly.' : 'I understand the timing may not be perfect right now, and I respect that.'}

Next steps I'd suggest:
${closeProbability >= 60
  ? '• Schedule a 30-minute demo at your convenience\n• I\'ll prepare a tailored walkthrough based on your specific situation\n• We can discuss pricing and implementation timeline'
  : '• I\'ll send over a one-pager with the key details\n• Let\'s reconnect in a few weeks once you\'ve had a chance to review\n• Feel free to reply directly with any questions'}

Looking forward to continuing the conversation.

Best,
[Your Name]
[Your Contact Info]`;

  const leadScore = Math.round((closeProbability * 0.7) + (buyingSignals * 5) - (objectionsCount * 3));
  const coaching = generateCoaching(config, transcript, suggestions, closeProbability, objectionsCount);

  return {
    aiSummary,
    followUpEmail,
    leadScore: clamp(leadScore, 0, 100),
    coaching,
  };
}

// ─── Quick Action Suggestions ─────────────────────────────────────────────────

export function getQuickActionSuggestion(
  action: string,
  config: { prospectName: string; callGoal: string },
  elapsedSeconds: number
): AISuggestion {
  const map: Record<string, { headline: string; body: string }> = {
    summarize: {
      headline: 'Call Summary (so far)',
      body: `Call in progress with ${config.prospectName}. Goal: ${config.callGoal}. Review the transcript to identify key themes and pivot points.`,
    },
    'follow-up-email': {
      headline: 'Follow-Up Tip',
      body: 'Send a follow-up within 2 hours while the conversation is fresh. Reference something specific they said to show you were listening.',
    },
    'export-lead': {
      headline: 'Lead Export Ready',
      body: `${config.prospectName} - data captured. After the call, export transcript and score to your CRM.`,
    },
    'score-lead': {
      headline: 'Lead Scoring',
      body: 'Score is based on buying signals minus objections. High (70+) = prioritize. Medium (40-69) = nurture. Low (<40) = long-term pipeline.',
    },
  };

  const entry = map[action] ?? { headline: 'AI Tip', body: 'Keep the conversation focused on their pain points, not your features.' };
  return makeSuggestion('tip', entry.headline, entry.body, `quick-action:${action}`, elapsedSeconds);
}

// ─── Battle Card ──────────────────────────────────────────────────────────────

export function mockGenerateBattleCard(
  prospectName: string,
  _prospectTitle: string,
  company: string,
  callType: string,
  callGoal: string,
  yourPitch: string,
  priorContext: string,
): BattleCard {
  const name = prospectName || 'the prospect';
  const co   = company || 'their company';
  const isClose    = callType === 'close' || callType === 'negotiation';
  const isDiscovery = callType === 'discovery' || callType === 'cold';

  const pitchLower = yourPitch.toLowerCase();
  const isRealEstate = pitchLower.includes('house') || pitchLower.includes('property') || pitchLower.includes('real estate') || pitchLower.includes('home');
  const isCourse = pitchLower.includes('course') || pitchLower.includes('program') || pitchLower.includes('coaching') || pitchLower.includes('academy') || pitchLower.includes('masterclass');

  const genericObjections: BattleCard['likelyObjections'] = [
    {
      objection: 'I need to think about it',
      response: `"Of course. What specifically are you evaluating? If I know what's on your mind, I can give you exactly what you need to decide — rather than leaving you to figure it out alone."`,
    },
    {
      objection: `It's too expensive`,
      response: `"Totally fair — let me ask: what's the cost of NOT solving this right now? Most people find when they put a number on it, the investment looks very different."`,
    },
    {
      objection: 'I need to speak to someone else first',
      response: `"Makes sense. Who's involved in the decision? I want to make sure they have the right information too — could we get them on a quick call together?"`,
    },
  ];

  const realEstateObjections: BattleCard['likelyObjections'] = [
    {
      objection: 'The price is higher than we expected',
      response: `"I understand. Compared to similar properties in this area that have sold recently, this is actually priced competitively. Can I walk you through the comps?"`,
    },
    {
      objection: "We're not in a rush to decide",
      response: `"That's fine — but inventory at this price point tends to move fast. Would it help to know how many other buyers are currently looking at this?"`,
    },
    {
      objection: "We want to see a few more options first",
      response: `"Absolutely. What would need to be true for a property to be the right one? If I know your exact criteria, I can save you a lot of time."`,
    },
  ];

  const courseObjections: BattleCard['likelyObjections'] = [
    {
      objection: "I've tried courses before and they didn't work",
      response: `"That's one of the most common things I hear — and honestly, it's usually not the person's fault. Most courses give you information but no accountability or implementation support. What made the previous one fall short?"`,
    },
    {
      objection: 'I don\'t have time right now',
      response: `"When will you have time? Most people say that, and six months later nothing has changed. The question isn't whether you have time — it's whether you can afford to keep waiting on this."`,
    },
    {
      objection: 'I need to see results first before I invest',
      response: `"That's actually backwards — the results come from taking the action. What specific result would you need to see to feel confident? Let me show you students who were exactly where you are."`,
    },
  ];

  const objections = isRealEstate ? realEstateObjections : isCourse ? courseObjections : genericObjections;

  const discoveryQuestions = isRealEstate
    ? [`What's your non-negotiable for the right property?`, `What's your timeline to move, and what's driving that?`, `Have you seen anything else you liked? What was missing?`]
    : isCourse
    ? [`What's the specific outcome you're trying to achieve in the next 90 days?`, `What's already stopped you from getting there on your own?`, `If this worked exactly as promised, what would change for you?`]
    : isDiscovery
    ? [`What's the biggest problem this call is hoping to solve?`, `What happens if this problem doesn't get fixed in the next quarter?`, `Who else is affected by this — is it just you or a team?`]
    : [`Where are you in your decision process?`, `What would make this a clear yes for you?`, `What's the one thing that would need to be true for this to move forward?`];

  const opener = isClose
    ? `"${name}, when we last spoke you mentioned [their main pain]. I've been thinking about that — I want to make sure we use this call to get you to a decision you're fully confident in either way. Does that work?"`
    : isRealEstate
    ? `"${name}, thanks for making time. I've pulled together a few things specific to what you're looking for — before I share them, can I ask what's changed since we last spoke?"`
    : isCourse
    ? `"${name}, appreciate you jumping on. Quick question before I dive in — on a scale of 1 to 10, how serious are you right now about solving [the problem your program addresses]?"`
    : `"${name}, thanks for making time. I'll be direct — I did some thinking about ${co} before this call and I have a couple of questions that will tell me in the first five minutes whether what I have is even relevant to you. Can I start there?"`;

  const insight = priorContext.trim()
    ? `Based on your notes: "${priorContext.slice(0, 120)}${priorContext.length > 120 ? '…' : ''}" — lead with empathy toward that context before going to your pitch.`
    : callGoal
    ? `Your goal is: "${callGoal}". Frame every question and response around whether you're moving toward that outcome.`
    : `No prior context provided. Open with a discovery question to understand their situation before pitching.`;

  return {
    likelyObjections: objections,
    powerQuestions: discoveryQuestions,
    suggestedOpener: opener,
    contextInsight: insight,
  };
}

// ─── Prospect Summary ─────────────────────────────────────────────────────────

export function mockGenerateProspectSummary(session: CallSession): string {
  const { config, transcript, finalCloseProbability, callStage, durationSeconds, aiSummary } = session;
  const name = config.prospectName || 'there';
  const mins = Math.floor(durationSeconds / 60);
  const minsLabel = mins > 0 ? `${mins} minute` : 'a brief';

  const repLines = transcript.filter(e => e.speaker === 'rep').map(e => e.text);
  const prospectLines = transcript.filter(e => e.speaker === 'prospect').map(e => e.text);
  const hasTranscript = transcript.length > 2;

  const stageLabel = callStage === 'close' ? 'strong close'
    : callStage === 'pitch' ? 'pitch'
    : callStage === 'discovery' ? 'discovery'
    : 'conversation';

  if (aiSummary && aiSummary.length > 50) {
    const firstPara = aiSummary.split('\n').filter(l => l.trim()).slice(0, 2).join(' ');
    return [
      `Hi ${name},`,
      ``,
      `Thanks for taking the time for our ${minsLabel}-minute call today.`,
      ``,
      firstPara,
      ``,
      hasTranscript && prospectLines.length > 0
        ? `Based on what you shared, here's my understanding of where things stand:`
        : '',
      hasTranscript && prospectLines.length > 0
        ? prospectLines.slice(0, 2).map(l => `• ${l.slice(0, 120)}`).join('\n')
        : '',
      ``,
      finalCloseProbability >= 70
        ? `We covered a lot of ground and I feel confident we're aligned on the key points. I'll follow up with the next steps shortly.`
        : finalCloseProbability >= 40
        ? `We're making progress and I want to make sure you have everything you need to feel fully confident in your decision.`
        : `I appreciate your honesty and time. Happy to answer any questions or provide more information whenever you're ready.`,
      ``,
      `Best,`,
      config.yourPitch ? `[Your name] — ${config.yourPitch.slice(0, 60)}` : `[Your name]`,
    ].filter(l => l !== '').join('\n');
  }

  const stage = stageLabel;
  return [
    `Hi ${name},`,
    ``,
    `Thanks for the ${minsLabel}-minute call today. We had a solid ${stage} and I wanted to send a quick recap while everything is fresh.`,
    ``,
    repLines.length > 0
      ? `On my end, I walked you through ${config.yourPitch ? config.yourPitch.slice(0, 80) + (config.yourPitch.length > 80 ? '…' : '') : 'what I had in mind for you'}.`
      : `We discussed ${config.callGoal || 'the opportunity and how it fits your situation'}.`,
    ``,
    `Next step: ${
      callStage === 'close' ? 'I\'ll get the paperwork across to you — please review and let me know if anything needs adjusting.'
      : callStage === 'pitch' ? 'Have a think on it and I\'ll check back in with you in a couple of days.'
      : 'Let\'s schedule a follow-up once you\'ve had a chance to reflect — just reply here to find a time.'
    }`,
    ``,
    `Feel free to reply with any questions — happy to jump on a quick call if anything needs clarifying.`,
    ``,
    `Best,`,
    `[Your name]`,
  ].join('\n');
}
