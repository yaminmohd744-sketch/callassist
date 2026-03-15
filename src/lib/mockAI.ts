import type { TranscriptEntry, AISuggestion, AIAnalysisResult, CallStage, SuggestionType } from '../types';

// ─── Memory ───────────────────────────────────────────────────────────────────

export interface Memory {
  lastLabel: string | null;
  lastObjectionType: string | null;
  closeAttempted: boolean;
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
// Body format: "Exact script to say"  — or —  "Script\n\nNote"
// responses[0] = first time   |   responses[1] = repeat / escalation

interface ObjectionDef { label: string; responses: [string, string]; }

const OBJECTION_MAP: Record<string, ObjectionDef> = {
  'too expensive': {
    label: 'Price Objection',
    responses: [
      "Price is real — I get it. But quick question: what's this problem costing you every month right now? Most teams find the answer is more than they expected, and solving it is cheaper than living with it.",
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
      "Fair — price is real. But the teams that say this are usually the ones losing the most to the problem we fix. What would the ROI need to look like for this to make sense?",
      "Can we do this: if I put together a specific ROI model for your situation, would you look at it? If the numbers don't work, I'll move on.",
    ],
  },
  'no budget': {
    label: 'No Budget',
    responses: [
      "No budget is a real blocker — I'm not going to pretend otherwise. But what's the cost of leaving this unsolved for another quarter? Is there a small pilot we could run to prove the ROI first?",
      "When does your next budget cycle open? The teams that planned ahead had the most leverage when it did. I'd rather time this right than miss the window entirely.",
    ],
  },
  "can't afford": {
    label: 'Budget Constraint',
    responses: [
      "Budget constraints are real — I get it. What would the numbers need to look like internally for this to make sense?",
      "Is this a permanent constraint or a timing issue? If it's timing, I'd rather come back at the right moment than lose the conversation.",
    ],
  },
  'out of budget': {
    label: 'Budget Constraint',
    responses: [
      "I hear you — every month this goes unfixed, the gap gets wider. Would a phased approach or a small pilot be a way to get started without blowing the budget?",
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
      "I respect that — I won't push. One honest question before I go: what does your situation look like in 6 months if this stays unsolved? Give me 60 seconds — if it's not relevant, I'll let you go.",
      "You've said it twice — I hear you. Before I go: what's your current plan for handling this? If you've got it covered, I'm genuinely done.",
    ],
  },
  'not a good fit': {
    label: 'Not a Fit',
    responses: [
      "Fair — you know your situation better than I do. What specifically feels off? Because the teams that said the same thing usually had one concern I hadn't addressed yet.",
      "One honest question: what would a good fit look like for you right now? If I can't match it, I'll tell you straight and we're done.",
    ],
  },
  'no thanks': {
    label: 'Hard Objection',
    responses: [
      "Before you go — honest question: what would have made this relevant today? Because the problem we solve is getting worse for teams in your space. I'm not going to chase you.",
      "Last thing — can I send you one page? No pitch, just one number showing what this problem typically costs teams in your space. Delete it if it's not relevant.",
    ],
  },
  "don't want": {
    label: 'Hard Rejection',
    responses: [
      "Heard — I won't push. Quick question before I go: what's your current plan for this? If you've got it handled, I'm done.",
      "You've made it clear — I respect that. Last thing: if this got significantly worse over the next 6 months, what would you do? That's all I need to know, then I'm off your radar.",
    ],
  },
  "don't wanna": {
    label: 'Hard Rejection',
    responses: [
      "Fair enough — I'm not here to sell you something you don't want. Tell me: is it that this isn't the right fit, or is the timing just wrong? Those are very different things.",
      "Last question and then I'm done: what would need to change for this to even be worth 5 minutes? If nothing, I genuinely respect that.",
    ],
  },
  'i told you': {
    label: 'Last Shot',
    responses: [
      "You're right — I apologize for pushing. One final thing and I'm gone: would it help if I sent you a quick 2-minute read, no strings attached? If no, I'll take you off my list right now.",
      "I'm done — thank you for your time. I won't call again. If anything changes on your end, you have my contact.",
    ],
  },
  'not buying': {
    label: 'Hard Rejection',
    responses: [
      "I hear that — I won't fight it. One question: what's the one thing that would need to be true for you to reconsider? I want to know if there's even a path here.",
      "Noted — you've been clear. I'll move on. If the situation changes, reach out. I won't keep calling.",
    ],
  },
  'not right now': {
    label: 'Timing Objection',
    responses: [
      "Timing matters — I get it. What concerns me is that this problem compounds: every quarter it goes unaddressed, the gap gets harder to close. What would have to be true for the timing to be right?",
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
      "Happy to — but I want it to actually be useful. What's the one thing you'd most want it to address? Give me five minutes and I'll tell you if it's relevant before I send anything.",
      "I'll send it. But honestly — can we schedule 10 minutes for after you read it, so it actually goes somewhere?",
    ],
  },
  'send an email': {
    label: 'Info Stall',
    responses: [
      "Happy to — before I do, what's the one problem you'd want it to address for your team? I'll lead with that so it's actually worth reading.",
      "I'll send it right after this call. What's the one thing that matters most to you right now? I'll make that the whole email.",
    ],
  },
  'too busy': {
    label: 'Busy Stall',
    responses: [
      "I'll be fast — 60 seconds. This problem costs teams in your space more every month it goes unaddressed. If it's not relevant in 60 seconds, I'll let you go — deal?",
      "I hear you on time. Last thing: if you had 10 minutes next week, would you hear one number that shows what this is quietly costing your team? That's it — yes or no.",
    ],
  },
  'call me back': {
    label: 'Delay',
    responses: [
      "Absolutely — when works best? To make the next call worth it: what's the one question you'd want answered when we reconnect?",
      "I'll call you back — what day and time works? And what's the one thing that would make that call worth your time?",
    ],
  },
  'need to think': {
    label: 'Think It Over',
    responses: [
      "That's fair — what's the main thing you're thinking through? Sometimes it's a question I can answer in 30 seconds. Tell me what's on your mind — I'd rather address it now.",
      "What's the outstanding question? I want to give you exactly what you need to make this decision, not drag it out.",
    ],
  },
  'talk to my boss': {
    label: 'Authority Deflection',
    responses: [
      "Makes sense — who would that be? I want to make sure they have exactly what they need. Can we get them on a 15-minute call together this week?",
      "What's the best way to get 15 minutes with them? I can do a short, focused overview that covers the key points without taking much of their time.",
    ],
  },
  'already have': {
    label: 'Has a Solution',
    responses: [
      "Got it — what do you like most about it? Because the teams that came to us had something in place too, and the gap was usually one specific thing. Can I ask one quick comparison question?",
      "When does your contract renew? I'm not asking you to switch today — I just want to be in the conversation before that window opens.",
    ],
  },
  'using another': {
    label: 'Has a Competitor',
    responses: [
      "Understood — when does your contract renew? The teams that planned ahead had the most leverage when it was time to evaluate. I'm not asking you to do anything today.",
      "One honest question: what's the one thing your current solution doesn't do well? That's usually where we win the conversation.",
    ],
  },
};

interface BuyingSignalDef { label: string; response: string; }

const BUYING_SIGNAL_MAP: Record<string, BuyingSignalDef> = {
  'interested':       { label: 'Interest Signal',  response: "That's great to hear. What does your current situation look like around this? I want to understand the specifics before saying anything else. If the fit is there, the next step is a 20-minute walkthrough — does this week work?" },
  'tell me more':     { label: 'Curiosity Signal',  response: "Happy to. Most teams in your space are quietly losing time and money to this, and they don't fully realize it until we put a number on it. Which part is most relevant to what you're dealing with right now?" },
  'how much':         { label: 'Pricing Signal',    response: "Good question — I want to give you a real number, not a range. First: what's this problem costing you right now? Most clients find the investment is a fraction of what they were already losing. Tell me your setup and I'll give you the exact number." },
  'how does it work': { label: 'Demo Signal',       response: "Short version: we remove the friction that's quietly costing you the most — and the results happen without adding to your team's workload. Honestly the fastest way to get it is to see it. Can I show you in 10 minutes right now?" },
  'when can':         { label: 'Timeline Signal',   response: "We can move fast — most clients are live and seeing results within a few weeks. If we start this week, what would need to happen on your end to make that smooth?" },
  "what's included":  { label: 'Feature Curiosity', response: "The core includes everything you'd need to solve the main problem — and the part that moves the needle fastest is the one that directly addresses what you just described. Want to do a quick 15-minute walkthrough?" },
  'sounds good':      { label: 'Positive Signal',   response: "Let's make it happen. The teams that moved on this quickly said they wished they hadn't waited. Should we lock in 20 minutes this week, or is there someone else you'd want in that conversation?" },
  'makes sense':      { label: 'Agreement Signal',  response: "Glad it's landing — because what you just confirmed is exactly the position our best clients were in before they got started. What's your availability this week for a focused 20-minute session?" },
  'can you':          { label: 'Action Request',    response: "Absolutely — and I want to make sure it's set up right from day one. Let me take care of that for you, and I'll make sure you're positioned for the best outcome at the same time. Does that work?" },
};

export const STAGE_TIPS: Record<CallStage, string> = {
  opener:    "What does this problem look like for your team right now?\n\nAsk this, then stop. Let them describe it in their own words.",
  discovery: "Help me understand this — how long has this been a challenge, and what's the biggest cost for your team?\n\nStay on this until they describe the pain in their own words.",
  pitch:     "Here's what I keep hearing from teams in your space — and it's exactly what we solve. The companies that acted on this saw a real difference within 90 days. Does that connect?",
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
    hints.push(`They mentioned ${ctx.mentionedTool} — tie your angle to the gap their current tool leaves.`);
  }

  if (ctx.confirmedPain && ctx.confirmedPain !== currentTrigger) {
    const q = ctx.confirmedPain.length > 65
      ? ctx.confirmedPain.slice(0, 62) + '...'
      : ctx.confirmedPain;
    hints.push(`They confirmed earlier: "${q}" — anchor back to that.`);
  }

  if (ctx.tone === 'hostile') {
    hints.push('They\'re resisting hard. One short question, then stop — let them talk.');
  } else if (ctx.tone === 'interested') {
    hints.push('They\'re engaged. Push for a concrete next step now.');
  } else if (ctx.tone === 'curious') {
    hints.push('They\'re leaning in. Keep the momentum — ask one specific question.');
  }

  return hints.length > 0 ? hints.join(' ') : null;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function genId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

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
        const body = hint ? `${base}\n\n— ${hint}` : base;
        suggestions.push(makeSuggestion('objection-handler', def.label, body, newEntry.text, elapsedSeconds));
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
        const body = hint ? `${base}\n\n— ${hint}` : base;
        suggestions.push(makeSuggestion('closing-prompt', def.label, body, newEntry.text, elapsedSeconds));
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
      opener:    "Quick intro — [Pitch]. My goal today is to [goal]. Is that worth 60 seconds?\n\nState your name and company first, then this line.",
      discovery: "Good to connect, [Prospect]. I want to make sure this is relevant — how does [pitch] line up with what you're focused on right now?",
      pitch:     "Here's the core of it: [Pitch]. Based on what you've shared, that connects directly. Does that land for you?",
      close:     "Based on everything we've covered, the next step is to [goal]. Does [day/time] work for you?",
    },
  },
  {
    keywords: ['who is this', "who's this", 'who are you', "what's this about", "what's it about", 'what do you want', 'why are you calling', 'how did you get my'],
    label: 'Identify & Hook',
    responses: {
      opener:    "My name is [your name] — I'm calling because [Pitch], and my goal is to [goal]. Worth 60 seconds?\n\nSay your actual name and company before this line.",
      discovery: "The reason I'm calling: [Pitch]. And based on what you've told me, I think there's a real fit. Can I ask one quick question to confirm?",
      pitch:     "To be direct — [Pitch]. For [Company] specifically, the ask is simple: [goal]. Does that make sense?",
      close:     "The simplest next step: [goal]. Can we lock that in right now?",
    },
  },
  {
    keywords: ['i see', 'alright', 'uh huh', 'mm-hmm', 'go on', 'i hear you', 'understood'],
    label: 'Keep Going',
    responses: {
      opener:    "Appreciate that — so what does this problem look like for your team right now? I want to make sure I'm talking about the right thing before I say anything else.",
      discovery: "Good — what's the biggest gap in how you're handling that today? There's usually one thing that's not quite working.",
      pitch:     "The reason that matters is that it directly addresses what you just described — and the teams that fixed it saw the difference quickly. Does that connect?",
      close:     "Then we're aligned. Let's get 20 minutes on the calendar. What's your availability this week?",
    },
  },
  {
    keywords: ["i don't know", "i dont know", "not sure", "we'll see", "i guess", "kind of", "sort of", "possibly"],
    label: 'Surface Hesitation',
    responses: {
      opener:    "That's a fair reaction — what's the one thing making you hesitant right now? I'd rather know than guess.",
      discovery: "What's holding you back? The teams that felt the same way usually had one specific question I could answer in 30 seconds.",
      pitch:     "What part doesn't feel like a fit yet? There might be something I haven't shown you — tell me what's on your mind.",
      close:     "What's the one thing that would need to be true for this to be a yes? Let's address it right now.",
    },
  },
  {
    keywords: ['what does it do', 'how does it help', 'what exactly', 'can you explain', 'tell me about it', 'what is it', 'what do you do'],
    label: 'Pitch Cue',
    responses: {
      opener:    "[Pitch] — and my goal today is to [goal]. Does that match what you were asking about?",
      discovery: "[Pitch] — but let me make sure it's relevant to you first. What does your situation look like right now?",
      pitch:     "The core of what I'm offering: [Pitch]. That's what we've been building toward in this conversation. Does that fit?",
      close:     "The best way to understand it fully is to [goal]. Can we do that now?",
    },
  },
  {
    keywords: ['we struggle', "it's a problem", "that's an issue", 'we spend a lot', 'takes too long', 'not efficient', 'frustrating', 'pain point'],
    label: 'Pain Confirmed',
    responses: {
      opener:    "That's the exact reason I called. How long has that been going on — and what have you tried so far?",
      discovery: "That's the problem we were built to solve. What's the biggest cost of it for your team — time, money, or both?",
      pitch:     "That's exactly what a team in your space was dealing with before they worked with us — they turned it around within 90 days. Does that kind of result matter to you?",
      close:     "You've confirmed the problem is real. The only question is timing — and the longer it sits, the more it costs. Can we lock in a session this week?",
    },
  },
  {
    keywords: ['interesting', "that's interesting", 'good point', 'fair enough', 'i like that', 'that makes sense', 'i agree'],
    label: 'Momentum',
    responses: {
      opener:    "Good — what does that look like for your team right now? I want to understand your specific situation before I say anything else.",
      discovery: "Glad it resonates. What's the biggest cost of this problem for you — time, revenue, or something else?",
      pitch:     "That's what our best clients said too — and they saw real results within 90 days. We can get you to the same place.",
      close:     "Then let's lock it in — the next step is to [goal]. Should I take care of that now, or is there someone else you'd want involved?",
    },
  },
  {
    keywords: ['we currently', 'we use', 'we have a', 'we do it', 'our process', 'right now we'],
    label: 'Current State',
    responses: {
      opener:    "Good to know — what's the biggest weak spot in that setup? There's usually one thing teams wish it handled better.",
      discovery: "Got it — where does that break down most? The teams we work with had the same setup and found one specific gap that was costing them without them realizing it.",
      pitch:     "The gap we typically close is the one your current setup misses most — and that's usually where the biggest cost is hiding. Is that the weak spot for you?",
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
      close:     "I can send you two relevant case studies right now — and then let's spend 20 minutes walking through the one most relevant to your team. Does that work?",
    },
  },
  {
    keywords: ['my team', 'our team', 'the team', 'my manager', 'my boss', 'the board', 'leadership'],
    label: 'Stakeholder Map',
    responses: {
      opener:    "Who else would need to weigh in on something like this? I want to make sure I'm talking to the right people from the start.",
      discovery: "Who feels the most pain from this problem day-to-day? That's usually the person who makes the internal case.",
      pitch:     "Who else would need to be comfortable before you could move forward? Let's get them into a 20-minute conversation together — it moves much faster that way.",
      close:     "Let's get the right people in one 20-minute call — decisions get made 3x faster. Can you get the decision-maker on a call this week?",
    },
  },
  {
    keywords: ['this week', 'next week', 'next month', 'end of quarter', 'q1', 'q2', 'q3', 'q4', 'this year'],
    label: 'Timeline Signal',
    responses: {
      opener:    "That works — what would need to happen between now and then for this to be on track?",
      discovery: "If you're thinking that timeline, we should start the evaluation now. Teams that wait usually miss the window.",
      pitch:     "Teams we've helped with your timeline were live and seeing results within a few weeks of starting. If we begin this week, you're in a strong position.",
      close:     "We can hit that timeline. Let's get 20 minutes this week so you have everything you need to move. Does [day] work?",
    },
  },
  {
    keywords: ['okay', 'ok', 'sure', 'yep', 'yeah', 'yes', 'right', 'exactly', 'correct', 'absolutely'],
    label: 'Advance',
    responses: {
      opener:    "Good — so tell me: what does this problem look like for your team right now?",
      discovery: "Perfect — what's the biggest cost of this for you? Time lost, revenue impact, or something else?",
      pitch:     "Great — the part most relevant to you is how we solve the exact thing you described. Does that connect to what you've been dealing with?",
      close:     "Then let's move. I'll send a calendar invite — does [day/time] work for a 20-minute walkthrough?",
    },
  },
];

// ─── Context-Aware Fallback ───────────────────────────────────────────────────

const CONTEXT_FALLBACKS = {
  clean: {
    label: 'Stage Move',
    response: {
      opener:    "Quick question — what's your situation with [pitch] right now? I want to understand where you're at before I say anything else.\n\nAsk this, then stop. Let them describe it.",
      discovery: "Help me understand — how does [pitch] fit into what you're working on? What would the ideal outcome look like for you?\n\nStay on this until they describe their situation in their own words.",
      pitch:     "Here's what it comes down to: [Pitch]. And for you, the goal is [goal]. Does that feel like the right direction?\n\nIf they're quiet: 'What part isn't landing yet?'",
      close:     "Based on what you've shared, the next step is [goal]. Shall we lock that in?\n\nThen stop. Let them respond.",
    },
  },
  'after-objection': {
    label: 'Bridge',
    response: {
      opener:    "I hear you — I'm not here to push. One honest question: what would solving this actually be worth to your team if the timing was right? That's all I'm trying to understand.",
      discovery: "Noted. What's your current plan for handling this without us? I want to make sure you have a path forward either way.",
      pitch:     "Fair. Last thing: the one result that matters most to teams in your position is being able to handle this without it getting worse. Is that relevant to what you're dealing with?",
      close:     "Before I go — is there a better time to revisit this, or is the answer a firm no? Either way is fine — I just don't want to guess.",
    },
  },
  persistent: {
    label: 'Hold the Frame',
    response: {
      opener:    "I hear you — I won't push further. One last thing: if this problem got worse over the next quarter, what's your plan? If you've got it covered, I'm genuinely done.",
      discovery: "You've been consistent — I respect that. I'm going to let you go. If anything changes, I'm easy to reach. Thanks for your time.",
      pitch:     "I hear you. I'm not going to keep going. I'll send you one page — no pitch, just one number showing what this costs teams in your space. Delete it if it's not relevant.",
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

  // Only coach based on what the PROSPECT says — rep entries don't drive suggestions
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
      const body = hint ? `${base}\n\n— ${hint}` : base;
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
      const fbBody = fbHint ? `${fbBase}\n\n— ${fbHint}` : fbBase;
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

// ─── Session Summary ──────────────────────────────────────────────────────────

export function generateSessionSummary(
  config: CallConfig,
  transcript: TranscriptEntry[],
  suggestions: AISuggestion[],
  closeProbability: number,
  objectionsCount: number
): { aiSummary: string; followUpEmail: string; leadScore: number } {
  const buyingSignals = suggestions.filter(s => s.type === 'closing-prompt').length;
  const objectionHandlers = suggestions.filter(s => s.type === 'objection-handler').length;
  const totalEntries = transcript.length;

  let sentiment = 'neutral';
  if (closeProbability >= 70) sentiment = 'positive';
  else if (closeProbability <= 35) sentiment = 'negative';

  const aiSummary = [
    `Call with ${config.prospectName} at ${config.company}.`,
    `Goal: ${config.callGoal}.`,
    ``,
    `${totalEntries} transcript entries captured.`,
    `${objectionsCount} objection${objectionsCount !== 1 ? 's' : ''} detected, ${buyingSignals} buying signal${buyingSignals !== 1 ? 's' : ''} identified.`,
    `Overall sentiment: ${sentiment}.`,
    ``,
    objectionHandlers > 0
      ? `Key objections handled: ${suggestions.filter(s => s.type === 'objection-handler').map(s => s.headline).join(', ')}.`
      : `No significant objections raised.`,
    buyingSignals > 0
      ? `Positive signals: ${suggestions.filter(s => s.type === 'closing-prompt').map(s => s.headline).slice(0, 3).join(', ')}.`
      : ``,
    ``,
    `Recommended next step: ${closeProbability >= 60 ? 'Schedule a follow-up demo or proposal call.' : closeProbability >= 40 ? 'Send detailed info and follow up in 2-3 days.' : 'Nurture relationship — re-engage in 2 weeks with new angle.'}`,
  ].filter(Boolean).join('\n');

  const followUpEmail = `Subject: Following up on our conversation — ${config.company}

Hi ${config.prospectName},

Thank you for taking the time to speak with me today. I wanted to follow up with a quick summary of what we discussed.

We talked about ${config.yourPitch}, specifically in the context of your team at ${config.company}. Based on our conversation, I believe there's a strong fit — particularly around ${config.callGoal}.

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

  return {
    aiSummary,
    followUpEmail,
    leadScore: clamp(leadScore, 0, 100),
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
      body: `${config.prospectName} — data captured. After the call, export transcript and score to your CRM.`,
    },
    'score-lead': {
      headline: 'Lead Scoring',
      body: 'Score is based on buying signals minus objections. High (70+) = prioritize. Medium (40-69) = nurture. Low (<40) = long-term pipeline.',
    },
  };

  const entry = map[action] ?? { headline: 'AI Tip', body: 'Keep the conversation focused on their pain points, not your features.' };
  return makeSuggestion('tip', entry.headline, entry.body, `quick-action:${action}`, elapsedSeconds);
}
