import OpenAI from 'openai';
import type { TranscriptEntry, AISuggestion, AIAnalysisResult, CallStage, SuggestionType } from '../types';

const OPENAI_API_KEY = (import.meta as unknown as { env: Record<string, string> }).env.VITE_OPENAI_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true })
  : null;

// ─── Memory (tracks last suggestion to avoid repetition) ──────────────────────

export interface Memory {
  lastLabel: string | null;
  lastObjectionType: string | null;
  closeAttempted: boolean;
}

// ─── Keyword Fallback Maps ────────────────────────────────────────────────────

interface ObjectionDef { label: string; response: string; }

const OBJECTION_MAP: Record<string, ObjectionDef> = {
  // Price resistance
  'too expensive':      { label: 'Price Resistance', response: 'That\'s fair — can I ask, is it the total number or the timing that\'s the issue? Sometimes there\'s a way to structure this differently.' },
  'too costly':         { label: 'Price Resistance', response: 'Understood. What would the value need to look like for it to make sense?' },
  'too high':           { label: 'Price Resistance', response: 'I hear you. What were you expecting? Let me see if there\'s a structure that works better for you.' },
  'price is too':       { label: 'Price Resistance', response: 'Is it the total investment or the payment structure? I want to make sure we find something that actually fits.' },
  'costs too much':     { label: 'Price Resistance', response: 'If the price weren\'t a factor, would this solve the problem? I want to know if it\'s a fit issue or purely budget.' },
  "can't afford":       { label: 'Price Resistance', response: 'Are there budget cycles coming up, or is this more of an indefinite hold? I can work with either scenario.' },
  'out of budget':      { label: 'Price Resistance', response: 'Is there any flexibility, or would a scaled-down version be useful to build the case internally?' },
  'not in the budget':  { label: 'Price Resistance', response: 'When does your next budget cycle start? I\'d rather time this right than push something that doesn\'t fit.' },
  'no budget':          { label: 'Price Resistance', response: 'Are there funds allocated for Q2 or Q3? Or is there a pilot we could run to build the internal case?' },
  'no money':           { label: 'Price Resistance', response: 'Is this a permanent blocker or a timing issue? We have phased options if that helps.' },
  // Hard objections
  'not interested':     { label: 'Hard Objection', response: 'What would need to change on your end for something like this to be relevant?' },
  'not a good fit':     { label: 'Hard Objection', response: 'What specifically feels off? I don\'t want to waste your time — but I also don\'t want to miss something that could genuinely help.' },
  'no thanks':          { label: 'Hard Objection', response: 'Before you go — what would have made this more relevant to you today?' },
  // Timing resistance
  'not right now':      { label: 'Timing Resistance', response: 'What\'s going on that makes now a bad time? Is there a better window in the next quarter?' },
  'not the right time': { label: 'Timing Resistance', response: 'When would be the right time? I\'d rather follow up then than push something that doesn\'t fit your situation.' },
  // Stalls
  'send me info':       { label: 'Stall', response: 'What\'s the one thing you\'d most want to see addressed in that info? I want to make sure it\'s actually useful.' },
  'send an email':      { label: 'Stall', response: 'Before I do — are you the right person to evaluate this, or is there someone I should address it to?' },
  'too busy':           { label: 'Stall', response: 'Give me 60 seconds — I\'ll show you something specific to your situation. If it\'s not relevant, I\'ll let you go.' },
  'call me back':       { label: 'Stall', response: 'When works better? And so I\'m prepared — what would be most useful to cover when we reconnect?' },
  'need to think':      { label: 'Stall', response: 'What\'s the key thing you\'re thinking through? Sometimes I can help clarify right now and save you the back-and-forth.' },
  // Authority deflection
  'talk to my boss':    { label: 'Authority Deflection', response: 'Who would be the right person to loop in? I\'d love to make sure they have what they need to decide quickly.' },
  // Competitor
  'already have':       { label: 'Competitor', response: 'What do you like most about your current solution? And is there anything it doesn\'t do well that you\'d love to fix?' },
  'using another':      { label: 'Competitor', response: 'When does your current contract renew? I\'d love to be in the conversation when you\'re evaluating options.' },
};

interface BuyingSignalDef { label: string; response: string; }

const BUYING_SIGNAL_MAP: Record<string, BuyingSignalDef> = {
  'interested':       { label: 'Interest Signal', response: 'What does your current situation look like around [their pain point]? I want to make sure we\'re talking about a real fit.' },
  'tell me more':     { label: 'Curiosity Signal', response: 'The key things that set us apart are [1, 2, 3]. Which of those is most relevant to your situation?' },
  'how much':         { label: 'Pricing Signal', response: 'Pricing depends on your setup — what\'s your team size and main use case? I\'ll give you an accurate number.' },
  'how does it work': { label: 'Demo Signal', response: 'Would it be easier to explain or just show you? I can do a quick screen share right now — 10 minutes.' },
  'when can':         { label: 'Timeline Signal', response: 'We can move quickly. Realistically, you\'d be up and running in [X weeks]. How does your timeline look?' },
  "what's included":  { label: 'Feature Curiosity', response: 'Core plan includes [features]. I can walk you through what our top customers find most valuable if that helps.' },
  'sounds good':      { label: 'Positive Signal', response: 'Should we lock in a time to get the ball rolling, or is there someone else you\'d want to loop in first?' },
  'makes sense':      { label: 'Agreement Signal', response: 'Given what you\'ve shared, I think the next step is [specific action]. Does that work for you?' },
  'can you':          { label: 'Action Request', response: 'Absolutely. And while we\'re at it — would it make sense to [suggest next step] at the same time?' },
};

export const STAGE_TIPS: Record<CallStage, string> = {
  opener:    'Build rapport first. Mirror their energy and pace. A warm open beats a cold pitch every time.',
  discovery: 'Listen 70%, talk 30%. Ask open-ended questions: "What does that look like for you?" or "How are you handling X today?"',
  pitch:     'Connect every feature to a pain they mentioned. Use their own words back to them to show you listened.',
  close:     'Make a direct ask. After you ask, go silent — the next person to talk loses. Give them space to decide.',
};

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

// ─── Keyword Fallback ─────────────────────────────────────────────────────────

function analyzeWithKeywords(
  newEntry: TranscriptEntry,
  _currentStage: CallStage,
  elapsedSeconds: number,
  currentProbability: number,
  currentObjectionsCount: number,
  recentTriggers: Map<string, number>
): AIAnalysisResult {
  const suggestions: AISuggestion[] = [];
  const text = newEntry.text.toLowerCase();
  let probability = currentProbability;
  let objectionsCount = currentObjectionsCount;
  const now = elapsedSeconds;

  for (const [keyword, def] of Object.entries(OBJECTION_MAP)) {
    if (text.includes(keyword)) {
      const lastTriggered = recentTriggers.get(keyword) ?? -999;
      if (now - lastTriggered > 30) {
        recentTriggers.set(keyword, now);
        suggestions.push(makeSuggestion('objection-handler', def.label, def.response, newEntry.text, elapsedSeconds));
        probability -= 10;
        objectionsCount += 1;
        break; // one objection card per message max
      }
    }
  }

  if (suggestions.length === 0) {
    for (const [keyword, def] of Object.entries(BUYING_SIGNAL_MAP)) {
      if (text.includes(keyword)) {
        suggestions.push(makeSuggestion('closing-prompt', def.label, def.response, newEntry.text, elapsedSeconds));
        probability += 8;
        break; // one buying signal card per message max
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

// ─── Claude API Analysis ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are CallAssist — a real-time AI sales closer on a live cold call.

Your job: after every prospect message, give the rep ONE thing to say that moves the deal forward toward a close.

CLASSIFY every prospect message as one of:
- buying_signal: Any positive engagement, curiosity, pricing questions, timeline questions, "sounds good"
- soft_objection: Indirect hesitation, uncertainty, "maybe", "not sure", "we're okay for now"
- hard_objection: Direct refusal — "no", "not interested", "we don't need it"
- price_resistance: Any cost or budget pushback
- timing_resistance: "Not now", "maybe later", "too busy", "next quarter"
- authority_deflection: "Need to check with someone else", "not my decision"
- stall: "Send me info", "let me think", "call me back"
- neutral: General conversation, answering a question, no clear signal either way

CLOSER MINDSET — every response should do ONE of these:
1. Ask a question that makes the prospect sell themselves ("What would that mean for your team?")
2. Surface urgency or pain ("What's it costing you to leave this unsolved?")
3. Propose a concrete next step ("Want to set up 15 minutes to see it live?")
4. Use their own words to advance ("You mentioned X — is that the main thing you're trying to fix?")

RULES:
1. Only respond to PROSPECT messages. Never after REP messages.
2. ALWAYS provide a script — never return null. Every message is an opportunity.
3. Keep it to 1-2 sentences. Sound like a human, not a sales script.
4. Do NOT use generic phrases like "great question", "I understand your concern", or "absolutely".
5. Do NOT repeat what was last suggested — always a fresh angle.
6. Match the prospect's energy — if they're casual, be casual. If formal, be direct.

MEMORY: The prompt shows what was last suggested. Use a completely different approach.

Respond with valid JSON only — no markdown fences, no extra text:
{
  "analysis": "One line: what signal this message gives and what the rep should accomplish next",
  "objectionType": "buying_signal" | "soft_objection" | "hard_objection" | "price_resistance" | "timing_resistance" | "authority_deflection" | "stall" | "neutral",
  "script": "Exact words for the rep. 1-2 sentences. Natural, not scripted.",
  "alternative": "A different angle — shorter or softer version.",
  "probabilityDelta": integer from -15 to 15
}`;

interface ClaudeResponse {
  analysis: string;
  objectionType: 'hard_objection' | 'soft_objection' | 'price_resistance' | 'timing_resistance' | 'authority_deflection' | 'stall' | 'buying_signal' | 'neutral';
  script: string | null;
  alternative: string | null;
  probabilityDelta: number;
}

const OBJECTION_TYPES = new Set([
  'hard_objection', 'soft_objection', 'price_resistance',
  'timing_resistance', 'authority_deflection', 'stall',
]);

async function analyzeWithAI(
  newEntry: TranscriptEntry,
  fullTranscript: TranscriptEntry[],
  currentStage: CallStage,
  elapsedSeconds: number,
  currentProbability: number,
  currentObjectionsCount: number,
  config: { prospectName: string; company: string; yourPitch: string; callGoal: string },
  memory: Memory
): Promise<AIAnalysisResult> {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = String(elapsedSeconds % 60).padStart(2, '0');
  const recentContext = fullTranscript
    .slice(-8)
    .map(e => `${e.speaker === 'rep' ? 'REP' : 'PROSPECT'}: ${e.text}`)
    .join('\n');

  const memoryLines = [
    memory.lastLabel ? `Last suggestion given: ${memory.lastLabel}` : null,
    memory.lastObjectionType ? `Last objection type handled: ${memory.lastObjectionType}` : null,
    memory.closeAttempted ? `Close already attempted: yes — do not suggest closing unless signal is stronger` : null,
  ].filter(Boolean).join('\n');

  const prompt = `Rep's pitch: ${config.yourPitch}
Call goal: ${config.callGoal}
Prospect: ${config.prospectName} at ${config.company}
Stage: ${currentStage} | Time: ${mins}:${secs} | Close probability: ${currentProbability}%
${memoryLines ? `\nMemory:\n${memoryLines}` : ''}
Recent conversation:
${recentContext || '(call just started)'}

PROSPECT just said: "${newEntry.text}"

Classify and respond with JSON.`;

  try {
    const response = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0].message.content?.trim() ?? '';
    const parsed = JSON.parse(raw) as ClaudeResponse;

    const suggestions: AISuggestion[] = [];
    let objectionsCount = currentObjectionsCount;

    const body = parsed.alternative
      ? `${parsed.script ?? ''}\n\nALT: "${parsed.alternative}"`
      : (parsed.script ?? '');

    if (parsed.script) {
      if (parsed.objectionType === 'buying_signal') {
        suggestions.push(makeSuggestion('closing-prompt', parsed.analysis, body, newEntry.text, elapsedSeconds));
      } else if (OBJECTION_TYPES.has(parsed.objectionType)) {
        suggestions.push(makeSuggestion('objection-handler', parsed.analysis, body, newEntry.text, elapsedSeconds));
        objectionsCount += 1;
      } else {
        // neutral and everything else — always show a tip to advance the deal
        suggestions.push(makeSuggestion('tip', parsed.analysis, body, newEntry.text, elapsedSeconds));
      }
    }

    return {
      suggestions,
      updatedProbability: clamp(currentProbability + parsed.probabilityDelta, 5, 95),
      updatedStage: detectStage(elapsedSeconds),
      updatedObjectionsCount: objectionsCount,
    };
  } catch {
    return analyzeWithKeywords(newEntry, currentStage, elapsedSeconds, currentProbability, currentObjectionsCount, new Map());
  }
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
  config?: { prospectName: string; company: string; yourPitch: string; callGoal: string },
  memory?: Memory
): Promise<AIAnalysisResult> {
  if (openai && config) {
    return analyzeWithAI(
      newEntry, fullTranscript, currentStage, elapsedSeconds,
      currentProbability, currentObjectionsCount, config,
      memory ?? { lastLabel: null, lastObjectionType: null, closeAttempted: false }
    );
  }
  return analyzeWithKeywords(newEntry, currentStage, elapsedSeconds, currentProbability, currentObjectionsCount, recentTriggers);
}

// ─── Session Summary ──────────────────────────────────────────────────────────

export function generateSessionSummary(
  config: { prospectName: string; company: string; callGoal: string; yourPitch: string },
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
  : '• I\'ll send over a one-pager with the key details\n• Let\'s reconnect in [X weeks] once you\'ve had a chance to review\n• Feel free to reply directly with any questions'}

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
