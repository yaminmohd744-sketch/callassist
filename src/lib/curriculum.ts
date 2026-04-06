import type { TrainingScenario } from '../types';
import type { TrainingDifficulty } from '../hooks/useTraining';

export interface CurriculumLesson {
  id: string;
  title: string;
  concept: string;
  objectives: string[];
  tip: string;
  scenario: TrainingScenario;
  subScenarioIndex: number;
  difficulty: TrainingDifficulty;
  /** Minimum average score required to unlock the next lesson */
  passScore: number;
  /** Minimum number of rep responses before the session can be ended */
  minExchanges: number;
}

export interface CurriculumModule {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  color: 'green' | 'yellow' | 'red';
  lessons: CurriculumLesson[];
}

export const CURRICULUM: CurriculumModule[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 1 — Cold Call Foundations (Beginner)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'foundations',
    title: 'Cold Call Foundations',
    level: 'Beginner',
    color: 'green',
    lessons: [
      {
        id: 'f1-opener',
        title: 'The Perfect Opener',
        concept: 'Hook the prospect in the first 10 seconds with a relevance-first opening',
        objectives: [
          'Open without "how are you?" or any permission-asking filler',
          'State a specific, credible reason why this call makes sense for them right now',
          'End your opener with a curiosity-triggering question, not a pitch',
        ],
        tip: 'Your opening line decides everything. Skip the "how are you?" and lead with relevance — a specific reason why this call makes sense for them right now. Prospects decide in 7 seconds whether to keep listening. Curiosity beats features every time. A strong opener sounds like: "The reason I\'m calling is [specific trigger] — I wanted to ask you about [their relevant challenge]." Notice it\'s about them, not you.',
        scenario: 'cold-opener',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 6.5,
        minExchanges: 4,
      },
      {
        id: 'f2-pattern-interrupt',
        title: 'The Pattern Interrupt',
        concept: 'Break the "another cold call" pattern before the prospect mentally checks out',
        objectives: [
          'Avoid every cliché opener that triggers the "sales call" reflex',
          'Use brevity and directness as a differentiator — say more with less',
          'Pivot quickly from the prospect\'s initial resistance to a genuine question',
        ],
        tip: 'Every cold caller sounds the same. "Hi, my name is X and I\'m calling from Y..." kills the call before it starts. A pattern interrupt is anything that sounds different from what they expect. Try leading with a bold statement, an unexpected question, or naming the awkwardness: "I know this is a cold call — I\'ll be quick." Specificity is your weapon: the more tailored your opening, the harder it is to dismiss.',
        scenario: 'cold-opener',
        subScenarioIndex: 1,
        difficulty: 'easy',
        passScore: 6.5,
        minExchanges: 4,
      },
      {
        id: 'f3-value-hook',
        title: 'The 10-Second Value Hook',
        concept: 'Compress your entire value proposition into one irresistible sentence',
        objectives: [
          'State who you help, what problem you solve, and the outcome — in one sentence',
          'Avoid jargon, acronyms, and feature-listing in your hook',
          'Deliver the hook with enough confidence that the prospect wants to hear more',
        ],
        tip: 'You have one sentence to justify your existence on this call. The formula: "We help [specific type of person] who [struggle with X] to [achieve outcome Y] — without [painful tradeoff Z]." Practice until it sounds natural, not rehearsed. Then test it: would a 10-year-old understand what you do? If not, simplify. The best hooks create an instant mental image of a before/after transformation.',
        scenario: 'cold-opener',
        subScenarioIndex: 2,
        difficulty: 'easy',
        passScore: 6.5,
        minExchanges: 4,
      },
      {
        id: 'f4-not-interested',
        title: 'Handling "Not Interested"',
        concept: 'Turn the first rejection into the real start of the conversation',
        objectives: [
          'Acknowledge the objection without arguing or apologizing',
          'Use a pivot question that earns 30 more seconds without pressure',
          'Reframe the call from a pitch to a quick discovery conversation',
        ],
        tip: '"Not interested" is a reflex, not a decision. Most prospects say it before they even know what you\'re offering. Don\'t fight it — flow with it: "That\'s fair, and I won\'t take much of your time. Most people I talk to felt the same until I asked them one question. Can I ask it?" This approach disarms because it doesn\'t sell — it requests permission to ask. The question you ask next needs to be genuinely diagnostic, not a disguised pitch.',
        scenario: 'not-interested',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'f5-curiosity-pivot',
        title: 'The Curiosity Question Pivot',
        concept: 'Replace defensiveness with curiosity to keep the prospect talking',
        objectives: [
          'Ask an open-ended question that genuinely interests the prospect in themselves',
          'Transition from opener to discovery without the prospect noticing the shift',
          'Demonstrate that you researched them or their situation before calling',
        ],
        tip: 'The best salespeople are genuinely curious people. When a prospect resists, the amateur gets defensive; the professional gets curious. "What\'s the one thing that would have to be different for a conversation like this to be worth your time?" is a powerful pivot — it makes them think, and their answer tells you exactly what they care about. Use their words back to them in your next sentence.',
        scenario: 'not-interested',
        subScenarioIndex: 1,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'f6-reading-energy',
        title: 'Reading Prospect Energy',
        concept: 'Match your pacing and tone to the emotional state of the prospect',
        objectives: [
          'Identify whether the prospect is rushed, skeptical, curious, or open within the first exchange',
          'Adjust your speaking pace and energy to mirror theirs within 2 exchanges',
          'Use the prospect\'s tone as a guide for how much time you have and what to say',
        ],
        tip: 'Tone is data. A rushed prospect needs a faster, more concise pitch. A skeptical one needs patience and questions, not more talking. Mirroring is the fastest way to build rapport: if they\'re brief, be brief. If they\'re conversational, slow down and engage. The biggest mistake reps make is delivering the same scripted energy regardless of how the prospect sounds. Adapt or lose them.',
        scenario: 'cold-opener',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'f7-thirty-second-pitch',
        title: 'The 30-Second Pitch',
        concept: 'Deliver a compelling, complete pitch that earns a real response',
        objectives: [
          'Cover problem, solution, and outcome in under 30 seconds',
          'End with a tie-down question that checks if the problem resonates with them',
          'Adjust the pitch based on what you already learned from the opener',
        ],
        tip: 'A 30-second pitch is not a features dump — it\'s a story with a beginning (their problem), middle (how you solve it), and end (the result others have gotten). Always end with a checking question: "Does that resonate at all with what you\'re dealing with?" This turns a monologue into a dialogue. If they say yes, you\'ve earned the next five minutes. Practice this until it fits naturally in a real conversation.',
        scenario: 'cold-opener',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.0,
        minExchanges: 5,
      },
      {
        id: 'f8-skeptic',
        title: 'The Skeptical Prospect',
        concept: 'Turn a skeptic\'s resistance into a productive diagnostic conversation',
        objectives: [
          'Resist the urge to "prove yourself" by dumping more information',
          'Use the skeptic\'s pushback as a trigger to ask a deeper question',
          'Demonstrate credibility through specificity, not through claims',
        ],
        tip: 'A skeptical prospect is still on the phone — that\'s a good sign. The mistake is trying to overwhelm skepticism with more facts. Instead, lean into it: "I appreciate that — what would you need to see for something like this to even be worth a 15-minute call?" Skeptics respond to specificity and honesty. Name a real customer result. Admit what you don\'t know. Asking a sharp diagnostic question signals competence more than any pitch can.',
        scenario: 'cold-opener',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.0,
        minExchanges: 5,
      },
      {
        id: 'f9-hostile',
        title: 'Surviving Immediate Hostility',
        concept: 'Stay grounded and composed when a prospect is actively trying to end the call',
        objectives: [
          'Remain calm and professional under verbal pressure — no defensiveness or apology',
          'Use one controlled, non-pressuring response to give the prospect a way to stay without losing face',
          'Know when to end gracefully rather than escalate — closing well is also a win',
        ],
        tip: 'Hostile prospects test your composure. The worst response is to apologize or get flustered — it confirms you\'re worth dismissing. The best response is calm, brief, and slightly unexpected: "Fair enough — I won\'t push. But out of curiosity, is it cold calls in general or is it because this isn\'t relevant to you right now?" This gives them a simple choice and shows you\'re different. If they still want off the call, disengage gracefully — how you exit matters for future calls.',
        scenario: 'not-interested',
        subScenarioIndex: 2,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 2 — Objection Handling (Intermediate)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'objections',
    title: 'Objection Handling',
    level: 'Intermediate',
    color: 'yellow',
    lessons: [
      {
        id: 'o1-framework',
        title: 'The Objection Framework',
        concept: 'Master the universal Acknowledge → Explore → Respond pattern',
        objectives: [
          'Always acknowledge the objection before responding — never skip this step',
          'Ask a clarifying question to uncover the real concern beneath the stated one',
          'Respond only after you truly understand what\'s behind the objection',
        ],
        tip: 'Most reps fail objection handling because they skip the first step: acknowledging. When you immediately defend or counter, the prospect feels unheard and digs in harder. The framework is: (1) Acknowledge — "That\'s a fair point." (2) Explore — "Can I ask what\'s driving that?" (3) Respond — only now, with a targeted answer. This sequence transforms confrontation into a problem-solving conversation. Practice it until it\'s muscle memory.',
        scenario: 'price-objection',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'o2-price-basic',
        title: 'Price Objections: Defending Value',
        concept: 'Reframe cost as ROI before the prospect compares you to a cheaper alternative',
        objectives: [
          'Isolate whether the objection is about price or about perceived value',
          'Quantify the cost of the problem they\'re trying to solve — not the cost of your solution',
          'Use a concrete ROI statement tied to their specific situation',
        ],
        tip: 'Price objections are almost always value objections in disguise. Before defending the price, isolate it: "Is it that the price is too high, or are you not sure you\'ll see the return?" Then shift the conversation entirely to outcomes. Calculate the cost of inaction. "If this solves the problem, what\'s that worth to you per year?" When the value is 10x the price, cost stops being the conversation. Never discount without exploring the value gap first.',
        scenario: 'price-objection',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'o3-send-info',
        title: '"Send Me Info" — The Soft Brush-Off',
        concept: 'Convert the email deflection into a scheduled, committed next step',
        objectives: [
          'Identify whether the email request is genuine or a polite exit',
          'Never send info without a committed follow-up meeting first',
          'Create a specific reason why a call is more valuable than an email right now',
        ],
        tip: '"Send me some info" is usually a polite way to end the call. The fatal mistake is saying "Sure!" and hanging up — you\'ll never hear from them again. Instead: "I can definitely do that — I want to make sure I send you the right thing. Can I ask you a couple of quick questions so it\'s actually relevant?" This buys 2 minutes of real discovery. Then offer a scheduled call: "I\'ll send the overview — can we set 15 minutes for next Thursday to go through it together?"',
        scenario: 'send-me-info',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'o4-think-it-over',
        title: '"I\'ll Think It Over" — Creating Real Urgency',
        concept: 'Surface the hidden concern and create genuine urgency without pressure tactics',
        objectives: [
          'Never accept "I\'ll think about it" without exploring what they\'re actually thinking about',
          'Ask a specific question to surface the real blocker',
          'Create urgency through the cost of delay, not through artificial scarcity or pressure',
        ],
        tip: '"I\'ll think about it" means you haven\'t made the cost of inaction feel real yet. Don\'t pressure them — explore it: "Of course — what specifically would you be thinking through?" Listen for the real objection underneath. Then introduce time-based cost: "One thing I\'ve seen with similar situations — the longer [X problem] stays unresolved, the more it costs in [specific consequence]. What\'s a realistic timeline for you to make a call on this?" Now the delay itself has a price tag.',
        scenario: 'think-it-over',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'o5-budget',
        title: 'The Budget Blocker',
        concept: 'Navigate real budget constraints without killing the deal or discounting prematurely',
        objectives: [
          'Distinguish between "no budget" as a real constraint versus a negotiating tactic',
          'Explore creative structuring options before accepting budget as a final barrier',
          'Help the prospect build the internal case for budget reallocation if the ROI warrants it',
        ],
        tip: 'When someone says they don\'t have budget, ask: "Is that a timing issue or a budget ceiling?" Real budget constraints often have workarounds — phased implementation, different billing structures, or reallocating from another line item. But first, rebuild the ROI case: "If this gets you [outcome], how does that compare to what you\'re spending on [current approach]?" If the value is there, budget finds a way. If there\'s no ROI conversation, no creative pricing helps.',
        scenario: 'price-objection',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.0,
        minExchanges: 5,
      },
      {
        id: 'o6-status-quo',
        title: 'Breaking the Status Quo',
        concept: 'Make staying the same feel riskier than making a change',
        objectives: [
          'Quantify the real cost of the prospect\'s current situation — financially or operationally',
          'Make the "do nothing" option feel like an active, costly choice — not a safe default',
          'Use future-pacing to paint a specific picture of what staying put looks like in 12 months',
        ],
        tip: 'Comfortable people don\'t change. Your job isn\'t to convince them your product is great — it\'s to make the cost of staying put feel real. Start by getting them to name the problem: "How long has [issue] been going on?" Then amplify: "What\'s the cumulative cost — time, money, headcount — of keeping things the way they are?" Then project forward: "What does this look like for your team in a year if nothing changes?" The status quo must cost more than the change.',
        scenario: 'not-interested',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'o7-competitor',
        title: 'Winning the Competitor Comparison',
        concept: 'Differentiate on value when a competitor is cheaper — without badmouthing them',
        objectives: [
          'Never speak negatively about a competitor — pivot to differentiation through questions',
          'Identify what the prospect actually values most before comparing features',
          'Reframe the buying decision from price-per-feature to total outcome and risk',
        ],
        tip: 'When a prospect names a cheaper competitor, the amateur gets defensive. The professional gets curious: "What is it about [competitor] that appeals to you?" Listen carefully — are they buying on price alone, or do they have a genuine preference? Then find the gaps: "How important to you is [differentiator you own]?" Position your price as the premium for a specific, measurable outcome. And always ask: "What happens if [competitor\'s known weakness] becomes a problem for you?"',
        scenario: 'price-objection',
        subScenarioIndex: 2,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'o8-multi-stakeholder',
        title: 'The Multi-Stakeholder Stall',
        concept: 'Turn "I need to check with my team" into a jointly-managed next step',
        objectives: [
          'Understand who the other stakeholders are and what their concerns might be',
          'Arm the prospect to sell internally on your behalf with the right framing',
          'Set a specific, committed next step that includes the other decision makers',
        ],
        tip: '"I need to check with my team" is a real blocker — but it\'s also an opportunity. Find out who the stakeholders are and what they care about: "Who else will weigh in on this, and what are they typically focused on — cost, risk, implementation?" Then arm your champion: "What if I put together a one-pager specifically addressing their concerns? That way you\'re walking in with answers, not questions." Always schedule the multi-stakeholder call before hanging up.',
        scenario: 'think-it-over',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'o9-serial-objector',
        title: 'The Serial Objector',
        concept: 'Recognize and neutralize the pattern of layered objections before it stalls the deal indefinitely',
        objectives: [
          'Recognize when objections are a pattern, not individual concerns to be addressed one-by-one',
          'Call out the pattern professionally and redirect to the real decision point',
          'Force a moment of clarity — either there\'s a deal here or there isn\'t',
        ],
        tip: 'Serial objectors raise a new concern every time you address the last one. The mistake is answering each one — it rewards the pattern. Instead, name it: "I want to be direct — we\'ve worked through pricing, timing, and your team\'s concerns. At this point, if those were all resolved, is this something you\'d actually move forward with?" This forces a binary moment. If yes, find the real objection. If no, you\'ve uncovered the truth and can stop wasting both your time.',
        scenario: 'think-it-over',
        subScenarioIndex: 2,
        difficulty: 'hard',
        passScore: 8.0,
        minExchanges: 6,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 3 — Discovery & Closing (Advanced)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'closing',
    title: 'Discovery & Closing',
    level: 'Advanced',
    color: 'red',
    lessons: [
      {
        id: 'c1-situation',
        title: 'Situation Questions That Build Context',
        concept: 'Gather the essential facts without turning discovery into an interrogation',
        objectives: [
          'Ask situation questions that are specific and pre-researched — avoid questions you could have Googled',
          'Use each answer to naturally transition to the next question, not check a list',
          'Establish context for the problem you already know they likely have',
        ],
        tip: 'Situation questions establish context, but they drain energy if you ask too many. Only ask what you genuinely don\'t know and can\'t find out beforehand. Structure them to flow naturally: "You\'re currently handling [X] with [what we know about them] — how is that working for your team right now?" When situation questions lead naturally into problem questions, the prospect doesn\'t feel interrogated — they feel heard. Aim for 2-3 situation questions max before transitioning.',
        scenario: 'discovery',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'c2-problem',
        title: 'Problem Questions That Uncover Pain',
        concept: 'Ask questions that make the prospect articulate their own pain in their own words',
        objectives: [
          'Guide the prospect to name the problem themselves — don\'t name it for them',
          'Ask about problems adjacent to your solution, not just the obvious ones',
          'Use follow-up questions to quantify the problem\'s impact before moving on',
        ],
        tip: 'People act on problems they\'ve articulated out loud, not problems someone told them they have. Your job in problem discovery is to ask questions that make the prospect say the problem in their own words: "What\'s the most frustrating part of how you handle that today?" Then quantify: "How often does that happen? What does it cost you when it does?" When they\'ve said it out loud twice and put a number on it, the pain is real — to them.',
        scenario: 'discovery',
        subScenarioIndex: 0,
        difficulty: 'easy',
        passScore: 7.0,
        minExchanges: 4,
      },
      {
        id: 'c3-implication',
        title: 'Implication Questions That Amplify Pain',
        concept: 'Expand the impact of the problem beyond the obvious to create real urgency',
        objectives: [
          'Connect the problem to downstream consequences the prospect may not have considered',
          'Ask implication questions that link to business outcomes: revenue, costs, time, or risk',
          'Let the prospect calculate the full cost of the problem themselves',
        ],
        tip: 'Implication questions are the most powerful in SPIN selling because they transform a small problem into a business-level urgency. Start from the problem they named and cascade: "When [problem] happens, what does that mean for [downstream process]?" Then: "And when that breaks down, what\'s the impact on [revenue/team/customers]?" Each question forces them to trace the problem\'s consequences further. By the end, they\'ve sold themselves on why this can\'t wait.',
        scenario: 'discovery',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'c4-guarded',
        title: 'Discovery with the Guarded Prospect',
        concept: 'Extract meaningful information from a prospect who answers every question minimally',
        objectives: [
          'Break through one-word answers with follow-up probes that make it easy to elaborate',
          'Use silence strategically — resist the urge to fill the gap after a minimal answer',
          'Reframe questions from interrogation-style to collaborative problem-solving',
        ],
        tip: 'Guarded prospects give short answers because they\'re protecting themselves. The mistake is asking harder questions or giving up. Instead, make it easy to elaborate: after a short answer, try "Tell me more about that" or just silence. The less you talk, the more they fill the gap. Reframe questions from "What\'s your problem?" to "A lot of teams I work with struggle with X — does any of that sound familiar?" Peer benchmarking lowers defensiveness because it\'s not personal.',
        scenario: 'discovery',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'c5-need-payoff',
        title: 'Need-Payoff Questions That Close the Loop',
        concept: 'Guide the prospect to articulate the value of solving the problem in their own words',
        objectives: [
          'Ask the prospect to describe their ideal outcome — not the features they want',
          'Get them to quantify the value of solving the problem before you name a price',
          'Use their answer as the foundation for your solution presentation',
        ],
        tip: 'Need-payoff questions are the final move in discovery: they get the prospect to sell themselves. "If you could solve [problem] in 90 days, what would that mean for your team?" or "What would a solution be worth to you if it delivered [outcome they described]?" When they answer, they\'ve just built the ROI case for you. Write down their exact words and mirror them back in your pitch. Nothing is more persuasive than someone\'s own language.',
        scenario: 'discovery',
        subScenarioIndex: 2,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'c6-trial-close',
        title: 'The Trial Close',
        concept: 'Test for commitment without asking "do you want to buy?" and hear the real objections',
        objectives: [
          'Use a trial close question to test temperature before presenting formal options',
          'Listen for hesitation in their "yes" — that\'s where the real objection lives',
          'Move from a soft yes to a specific, committed next step in the same exchange',
        ],
        tip: 'A trial close is not "are you ready to buy?" — it\'s "does this solve the problem we talked about?" If they say yes, you\'re already in the close. If they hesitate, you\'ve surfaced an objection before it becomes a deal-breaker. Common trial closes: "Based on what we\'ve covered, does this feel like a good fit for what you\'re trying to solve?" or "If the logistics work out, is this the direction you want to go?" Their answer tells you exactly what\'s left to address.',
        scenario: 'closing',
        subScenarioIndex: 0,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'c7-cold-feet',
        title: 'Resolving Last-Minute Cold Feet',
        concept: 'Diagnose and defuse the vague hesitation that appears right before a deal closes',
        objectives: [
          'Surface the specific fear behind a vague "I\'m not sure" without pushing',
          'Distinguish between a real concern that needs addressing and fear of commitment',
          'Reassure through social proof and reversibility — not through pressure',
        ],
        tip: 'Last-minute cold feet usually isn\'t about the product — it\'s about the risk of being wrong. The best response is to make the decision feel safer, not to add more pressure: "What\'s the specific thing you\'re hesitant about? I want to make sure you\'re going in with full confidence, not just agreeing to get off the call." Then: share a similar customer story, offer a phased start, or clarify exit terms. Reduce the perceived risk of saying yes, and the hesitation dissolves.',
        scenario: 'closing',
        subScenarioIndex: 1,
        difficulty: 'medium',
        passScore: 7.5,
        minExchanges: 5,
      },
      {
        id: 'c8-objection-stacking',
        title: 'Closing Against Objection Stacking',
        concept: 'Stop a prospect from raising infinite last-minute objections by isolating and closing the final one',
        objectives: [
          'Isolate the final real objection using a "is that the only thing?" question',
          'Refuse to address a new objection before explicitly agreeing that all prior ones are resolved',
          'Use a conditional close to transform the objection into a commitment',
        ],
        tip: 'When every objection you answer is replaced by a new one, stop addressing them individually. Name the pattern: "I want to make sure we\'re getting to the real concern. We\'ve addressed pricing, timing, and the integration question. If those were all off the table, would we have a deal?" If yes — you now have a commitment to close on. If no — there\'s still a hidden objection. Keep isolating until you find the real one. Never close until you\'re addressing the right thing.',
        scenario: 'closing',
        subScenarioIndex: 2,
        difficulty: 'hard',
        passScore: 8.0,
        minExchanges: 6,
      },
      {
        id: 'c9-hard-close',
        title: 'Closing the Hard Prospect',
        concept: 'Take deliberate control of the conversation when a prospect keeps deferring and stalling',
        objectives: [
          'Identify the real blocker behind a pattern of stalling — decision authority, risk aversion, or no real intent',
          'Make a direct ask for commitment without apologizing for it',
          'Handle the "I need more time" response with a specific, time-bound counter',
        ],
        tip: 'A perpetually stalling prospect is often waiting to be led. Stop addressing individual objections and step back to the meta level: "I\'ve appreciated all our conversations, and I want to be straight with you — what\'s really standing between us and a decision?" This breaks the dance and forces a real answer. If they continue stalling, make the ask directly: "Here\'s what I\'d like to do — [specific next step with a date]. Does that work for you?" The prospect who won\'t commit to a specific step usually can\'t buy. Know when to qualify out.',
        scenario: 'closing',
        subScenarioIndex: 2,
        difficulty: 'hard',
        passScore: 8.0,
        minExchanges: 6,
      },
    ],
  },
];

export const ALL_LESSONS = CURRICULUM.flatMap(m => m.lessons);
