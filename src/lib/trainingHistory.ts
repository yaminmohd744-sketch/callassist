export interface TrainingHistoryEntry {
  id: string;
  scenarioId: string;
  scenarioLabel: string;
  difficulty: string;
  overallScore: number | null;
  headline: string;
  exchanges: number;
  date: string;
  assessment?: string;
  strengths?: string[];
  improvements?: string[];
  keyTakeaway?: string;
  scoreDimensions?: { label: string; score: number }[];
  nextPracticeRec?: string;
}

export const MOCK_TRAINING_HISTORY: TrainingHistoryEntry[] = [
  {
    id: 'm01', scenarioId: 'po-easy', scenarioLabel: 'Sticker Shock', difficulty: 'easy',
    overallScore: 8.2, headline: 'Good anchor on value — could have used a specific ROI number earlier.', exchanges: 6, date: '2026-01-15T10:20:00Z',
    assessment: 'You anchored effectively on value and kept the prospect from fixating solely on price. The conversation had good structure and you stayed composed when price first came up. The main gap was quantification — you made strong value claims but didn\'t back them with specific numbers until late in the conversation, which let the prospect stew on the price longer than necessary.',
    strengths: ['Opened with prospect benefit, not a product feature — earned early trust', 'Stayed composed when price was first mentioned — no defensive reaction', 'Successfully redirected to ROI before quoting a number'],
    improvements: ['Introduce a specific ROI example by exchange 2 — don\'t wait for them to push back', 'Name-drop a comparable customer result to make the value concrete and credible', 'When prospect mentions a competing option, ask "compared to what?" before defending anything'],
    keyTakeaway: 'Price resistance evaporates when you can say "customers like you saw X result within Y days" — get that stat in early, before price is even mentioned.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 7 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 8 }],
    nextPracticeRec: 'Try "Cheaper Competitor" (hard) — same price objection but with a named competitor forcing you to differentiate, not just reframe.',
  },
  {
    id: 'm02', scenarioId: 'co-medium', scenarioLabel: 'Skeptical Pro', difficulty: 'medium',
    overallScore: 7.4, headline: 'Strong opener but lost momentum when prospect pushed back on timing.', exchanges: 8, date: '2026-01-18T14:05:00Z',
    assessment: 'You had a strong, well-structured opener that earned the prospect\'s attention quickly. Where the session faltered was the middle — when the prospect challenged timing ("we just renewed"), you retreated too quickly instead of exploring the gap between their current state and where they want to be. Timing objections are invitations to discover, not walls to bounce off.',
    strengths: ['Used a personalised hook tied to the prospect\'s business, not a generic intro', 'Let the prospect finish their pushback before responding — good active listening', 'Asked a solid discovery question immediately after the initial objection'],
    improvements: ['When prospect invokes timing, ask "what would need to be true for the timing to feel right?" rather than accepting it as a no', 'Bridge from rejection to a future conversation using a specific follow-up trigger they own', 'Commit to urgency framing — vague urgency reads as desperation, not relevance'],
    keyTakeaway: 'Timing objections aren\'t rejections — they\'re invitations to find out what the right time actually looks like. Ask the question.',
    scoreDimensions: [{ label: 'Opening', score: 9 }, { label: 'Value Framing', score: 7 }, { label: 'Objection Handling', score: 6 }, { label: 'Close', score: 7 }],
    nextPracticeRec: 'Try "Serial Staller" (hard) — the ultimate timing-resistance scenario that forces you to break the stall loop.',
  },
  {
    id: 'm03', scenarioId: 'ni-medium', scenarioLabel: 'Status Quo', difficulty: 'medium',
    overallScore: 6.8, headline: 'Struggled to surface the hidden pain — try more open-ended questions first.', exchanges: 7, date: '2026-01-22T09:40:00Z',
    assessment: 'This session exposed a pattern common in "not interested" scenarios — pitching too early. You discovered the prospect was comfortable with their current solution but didn\'t dig deep enough to test whether that comfort was genuine satisfaction or just inertia. Without surfacing hidden pain, the pitch had nothing to attach to and landed flat.',
    strengths: ['Stayed patient in the first two exchanges without getting defensive', 'Asked about their current solution before pitching yours — good instinct', 'Didn\'t immediately cave when they said "we\'re happy with what we have"'],
    improvements: ['After "we\'re fine," follow up with "what does fine look like? What\'s still on your wishlist that your current solution doesn\'t cover?"', 'Don\'t pitch until you\'ve found a crack in the status quo — even a small one is enough to build on', 'Use "imagine" questions to help prospects visualise a better state before presenting your solution'],
    keyTakeaway: 'Status quo prospects aren\'t happy — they\'ve stopped imagining better. Your job is to restart that imagination, not pitch against their current tool.',
    scoreDimensions: [{ label: 'Opening', score: 7 }, { label: 'Value Framing', score: 5 }, { label: 'Objection Handling', score: 7 }, { label: 'Close', score: 6 }],
    nextPracticeRec: 'Try "Guarded" (medium) — similar resistance, but with a subtler hidden pain that rewards patience and precise questioning.',
  },
  {
    id: 'm04', scenarioId: 'cl-easy', scenarioLabel: 'Almost There', difficulty: 'easy',
    overallScore: 9.1, headline: 'Clean close — didn\'t oversell and asked for the commitment at the right moment.', exchanges: 5, date: '2026-01-28T16:30:00Z',
    assessment: 'Near-flawless close. You read the prospect\'s buying intent accurately and didn\'t overcomplicate it with unnecessary feature pitching. You asked for the commitment at exactly the right moment, and when there was brief hesitation, you addressed it calmly without capitulating on terms. The session demonstrated real close awareness — knowing when to push and when to simply ask.',
    strengths: ['Recognised buying readiness early and stopped selling — a rare and important skill', 'Asked a direct, confident closing question without hedging or softening it', 'Handled the brief hesitation with calm reassurance rather than discounting or backing off'],
    improvements: ['Add one concrete next-step detail in the close — e.g., onboarding date or delivery timeline — to make the commitment feel more tangible', 'If hesitation arises, name it directly: "It sounds like something is still holding you back — what is it?"', 'After the close, confirm the next 48 hours explicitly so there\'s no ambiguity about what happens next'],
    keyTakeaway: 'The best closes are quiet. If the prospect is ready, stop selling — just ask. Overselling at the close is the most common way to lose a deal that was already won.',
    scoreDimensions: [{ label: 'Opening', score: 9 }, { label: 'Value Framing', score: 9 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 10 }],
    nextPracticeRec: 'Challenge yourself with "Moving Goalposts" (hard) — a much tougher close against a prospect who keeps adding conditions to every agreement.',
  },
  {
    id: 'm05', scenarioId: 'po-hard', scenarioLabel: 'Cheaper Competitor', difficulty: 'hard',
    overallScore: 5.5, headline: 'Price comparison got away from you — lead with differentiation before defending price.', exchanges: 9, date: '2026-02-03T11:15:00Z',
    assessment: 'The core issue was sequencing — you went straight to defending your price before understanding why the competitor\'s offer felt compelling to this prospect. Once you\'re defending price against a named competitor, you\'ve already lost the frame. The conversation needed to return to value and fit before any number was discussed. Price comparisons are won before they start.',
    strengths: ['Didn\'t immediately concede on price — showed backbone under direct comparison pressure', 'Named two genuine differentiators over the competitor — good product knowledge', 'Stayed in the conversation despite strong and sustained pushback'],
    improvements: ['Before defending price, ask "what specifically draws you to their offer — is it the price itself or something they include that we don\'t?"', 'Reframe the comparison proactively: "We\'re probably not the cheapest option, and here\'s why that\'s actually good news for you…"', 'Quantify the cost of a cheaper but riskier outcome — the wrong tool costs more than its price'],
    keyTakeaway: 'Never defend price against a competitor. Reframe around the total cost of the wrong decision — price is only one input, and it\'s not the most important one.',
    scoreDimensions: [{ label: 'Opening', score: 7 }, { label: 'Value Framing', score: 4 }, { label: 'Objection Handling', score: 5 }, { label: 'Close', score: 5 }],
    nextPracticeRec: 'Retry "Cheaper Competitor" — this time lead with differentiation in exchange 2, before price comparisons begin. Then move to "Over Budget" (medium).',
  },
  {
    id: 'm06', scenarioId: 'di-medium', scenarioLabel: 'Guarded', difficulty: 'medium',
    overallScore: 7.9, headline: 'Patience paid off — you unlocked the real objection by the 4th exchange.', exchanges: 8, date: '2026-02-08T13:00:00Z',
    assessment: 'Strong patience and persistence throughout. You stayed in discovery mode longer than most reps would, and it paid off — by exchange 4 the prospect opened up and revealed the real blocker underneath the surface guardedness. The key insight is that guarded prospects aren\'t hiding information maliciously; they\'re waiting for you to prove you\'re worth talking to openly.',
    strengths: ['Held the discovery frame for four full exchanges without getting impatient or pivoting to pitch', 'Used silence effectively — let pauses breathe rather than rushing to fill them', 'When the real issue surfaced, pivoted immediately to address it rather than continuing on the original track'],
    improvements: ['Try mirroring the prospect\'s last 2-3 words before redirecting — it signals deep listening and often unlocks more detail unprompted', 'Name what you\'re noticing: "You seem a bit hesitant on that point — is there something specific holding you back?"', 'Have a direct, pattern-breaking question ready for exchange 3 if the prospect hasn\'t opened up by then'],
    keyTakeaway: 'Guarded prospects reward patience. The more you push, the more they protect. Slow down, and let curiosity — not persuasion — do the work.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 7 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 7 }],
    nextPracticeRec: 'Push yourself with "Deflector" (hard) — the most resistant discovery scenario, where the prospect actively refuses to be discovered.',
  },
  {
    id: 'm07', scenarioId: 'tio-medium', scenarioLabel: 'Team Sign-Off', difficulty: 'medium',
    overallScore: 7.1, headline: 'Solid multi-stakeholder framing but missed the chance to offer a trial close.', exchanges: 7, date: '2026-02-14T10:50:00Z',
    assessment: 'You handled the multi-stakeholder reveal well — you didn\'t panic, over-promise, or try to bypass the approval process. The weaker part was the close: you missed the chance to ask a trial close that would have locked in the prospect\'s personal conviction before they went to their team. You need their internal advocacy, not just their openness. The person in front of you is your internal champion — treat them like it.',
    strengths: ['Didn\'t try to shortcut or bypass the approval process — maintained credibility', 'Asked about the team\'s decision criteria before proposing a next step', 'Set a specific follow-up date rather than a vague "I\'ll check back in"'],
    improvements: ['When stakeholders come up, ask "If it were just up to you, would you move forward?" — separates personal conviction from process', 'Offer to help arm them internally: "What would make it easier to get your team on board with this?"', 'Try a trial close: "If your VP is comfortable with it, is there anything else that would need to be true for you to go ahead?"'],
    keyTakeaway: 'Multi-stakeholder deals are won before the meeting. Make the person in front of you your internal champion — arm them with everything they need to sell it on your behalf.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 7 }, { label: 'Objection Handling', score: 7 }, { label: 'Close', score: 6 }],
    nextPracticeRec: 'Try "Serial Staller" (hard) — combines timing resistance with a stalling pattern that requires the same internal champion mindset.',
  },
  {
    id: 'm08', scenarioId: 'smi-medium', scenarioLabel: 'Email Deflector', difficulty: 'medium',
    overallScore: 6.3, headline: 'Good urgency attempt — next time quantify the cost of waiting more specifically.', exchanges: 6, date: '2026-02-19T15:20:00Z',
    assessment: 'You recognised the email brush-off pattern and attempted to create urgency — the right instinct. However, the urgency felt manufactured: you cited time pressure without grounding it in a specific, prospect-relevant cost of delay. Generic urgency ("we\'re getting busy") is easy to dismiss. Specific urgency tied to the prospect\'s own goals is much harder to ignore.',
    strengths: ['Didn\'t accept the email deflection passively — pushed back constructively and professionally', 'Attempted to create urgency rather than capitulating and agreeing to send info', 'Stayed composed and professional when the prospect tried to disengage'],
    improvements: ['Before creating urgency, get permission: "I\'m happy to send info — but let me ask, what would make it worth 10 more minutes right now?"', 'Make urgency specific and prospect-referenced: "The reason I\'d rather not just send an email is that 6 people this month told me they wished they\'d had this conversation 90 days earlier"', 'Quantify the delay cost in the prospect\'s terms, not your timeline or pipeline pressure'],
    keyTakeaway: '"Send me an email" is a polite exit. The only way to stay in the conversation is to make the prospect genuinely curious about something an email can\'t tell them.',
    scoreDimensions: [{ label: 'Opening', score: 7 }, { label: 'Value Framing', score: 6 }, { label: 'Objection Handling', score: 6 }, { label: 'Close', score: 5 }],
    nextPracticeRec: 'Try "Brush-Off" (hard) — a harder version of the same pattern where the prospect is actively and permanently trying to end the call.',
  },
  {
    id: 'm09', scenarioId: 'co-hard', scenarioLabel: 'Ten Seconds', difficulty: 'hard',
    overallScore: 5.9, headline: 'Hook was too generic — a one-line relevance statement would have bought more time.', exchanges: 4, date: '2026-02-25T09:10:00Z',
    assessment: 'This is the hardest cold opener scenario and you showed composure under extreme time pressure. The session fell short primarily in the hook itself — it was relevant to you and your product, not to the prospect\'s world. A 10-second hook needs to be about a problem the prospect is already aware they have, or a result someone like them has already achieved. Your solution is irrelevant until their problem is named.',
    strengths: ['Didn\'t panic or rush — kept a measured pace despite the extreme time pressure', 'Stayed on your prepared structure for the first exchange rather than improvising under pressure', 'Recovered after the initial rejection and attempted a second hook rather than giving up'],
    improvements: ['Build your hook around a known pain for this prospect type: "[Their role] + [problem] + [cost of not solving it]" — all in one sentence', 'Never lead with what your product does — lead with what the prospect is losing without it', 'Prepare 3 variations of your 10-second hook before sessions and test which earns more time'],
    keyTakeaway: 'In 10 seconds you can\'t pitch — you can only earn 30 more seconds. Make your hook entirely about their problem, not your solution.',
    scoreDimensions: [{ label: 'Opening', score: 5 }, { label: 'Value Framing', score: 6 }, { label: 'Objection Handling', score: 6 }, { label: 'Close', score: 5 }],
    nextPracticeRec: 'Retry "Ten Seconds" with a prepared hook written in advance. Then try "Skeptical Pro" (medium) for more sustained practice under cold-opener skepticism.',
  },
  {
    id: 'm10', scenarioId: 'po-medium', scenarioLabel: 'Over Budget', difficulty: 'medium',
    overallScore: 7.6, headline: 'Smart ROI reframe — pushed back on the budget constraint without being dismissive.', exchanges: 8, date: '2026-03-04T14:45:00Z',
    assessment: 'Good instincts throughout. You didn\'t capitulate on price and consistently brought the conversation back to ROI rather than defending the cost. The session was strong through discovery and value framing. The only gap was at the very end — you could have pushed for a more concrete commitment rather than settling for a softer "let\'s explore further," which risks the deal drifting.',
    strengths: ['Reframed the budget constraint as a return-on-investment question — strong technique', 'Didn\'t immediately discount when the budget objection came up — held your position', 'Used a real-world example to illustrate value before any pricing pushback'],
    improvements: ['After establishing ROI, ask directly: "If the numbers work out, is budget the only thing standing in the way of moving forward?"', 'Offer a phased implementation option to reduce the upfront budget requirement when needed', 'When the prospect says "we\'d need to make it work financially," treat that as a buying signal and advance — don\'t step back into re-pitching'],
    keyTakeaway: 'Budget objections are often priority objections in disguise. If the ROI is there and they still resist, find out what\'s actually competing for that money.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 8 }, { label: 'Objection Handling', score: 8 }, { label: 'Close', score: 6 }],
    nextPracticeRec: 'Try "Cheaper Competitor" (hard) — another price-anchored scenario that tests your ROI framing under more aggressive direct comparison pressure.',
  },
  {
    id: 'm11', scenarioId: 'cl-medium', scenarioLabel: 'Last-Minute Doubts', difficulty: 'medium',
    overallScore: 8.4, headline: 'Excellent job surfacing the real fear behind the hesitation and resolving it.', exchanges: 7, date: '2026-03-10T11:30:00Z',
    assessment: 'Excellent close. You identified that the prospect\'s hesitation wasn\'t about the product — it was about the risk of being wrong. By naming the fear explicitly and addressing it directly, you removed the emotional barrier blocking the yes. Most reps either push harder (and alienate) or back off (and lose). You threaded it perfectly — acknowledged the doubt without amplifying it.',
    strengths: ['Named the hesitation explicitly rather than glossing over it or pushing past it', 'Addressed the fear of being wrong rather than re-pitching features the prospect had already seen', 'Kept the energy positive throughout without applying pressure or showing frustration'],
    improvements: ['Earlier in the session, ask "what would need to be true for you to feel completely confident about this?" — surfaces the exact fear before it becomes a last-minute blocker', 'Offer a low-risk bridge — a short pilot, a satisfaction guarantee — to structurally reduce the risk of commitment', 'After the close, describe the next 48 hours concretely: what happens if they say yes, step by step'],
    keyTakeaway: 'Last-minute doubt is almost always about risk, not product. Name it, validate it, and then reduce it. Pressure won\'t work — safety will.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 9 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 8 }],
    nextPracticeRec: 'Try "Moving Goalposts" (hard) — where doubt never fully resolves and you have to hold the close frame under sustained, multi-round resistance.',
  },
  {
    id: 'm12', scenarioId: 'ni-easy', scenarioLabel: 'Bad Timing', difficulty: 'easy',
    overallScore: 8.7, headline: 'Perfectly reframed urgency without applying pressure — prospect warmed up fast.', exchanges: 6, date: '2026-03-15T16:00:00Z',
    assessment: 'Very well handled from the first exchange. You understood immediately that "not the right time" was a soft objection, not a hard no, and you treated it accordingly — with curiosity rather than urgency. By the end you\'d earned enough trust to set a concrete next step without the prospect feeling any pressure. The conversation felt collaborative, not combative.',
    strengths: ['Asked a genuine question about what "bad timing" actually meant rather than pushing past it', 'Reframed urgency around the prospect\'s own goals and calendar, not your pipeline', 'Secured a specific follow-up date rather than accepting a vague "call me in a few months"'],
    improvements: ['When timing is "not right," dig one level deeper: "What would need to shift for the timing to work?"', 'Offer to do the background work now so the prospect arrives ready when timing does improve', 'Ask "Is there something specific about right now that makes this hard, or is it more of a general feeling?" — different answers require different responses'],
    keyTakeaway: '"Bad timing" is often code for "I haven\'t been given a reason to prioritise this." Make the case for why now beats later — using their own goals, not your deadlines.',
    scoreDimensions: [{ label: 'Opening', score: 9 }, { label: 'Value Framing', score: 8 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 9 }],
    nextPracticeRec: 'Push up to "Status Quo" (medium) — similar initial resistance, but the prospect is genuinely comfortable and the hidden pain is harder to find.',
  },
  {
    id: 'm13', scenarioId: 'di-hard', scenarioLabel: 'Deflector', difficulty: 'hard',
    overallScore: 6.1, headline: 'You held the discovery frame longer than most — try mirroring before redirecting.', exchanges: 9, date: '2026-03-20T10:20:00Z',
    assessment: 'Solid composure in a deliberately difficult scenario. You held the discovery frame for longer than most reps do — the right instinct. But when the prospect flipped to "just tell me what you\'re selling," you should have briefly accommodated the demand before returning to discovery. Ignoring the demand entirely breaks rapport; briefly answering it earns you the right to continue.',
    strengths: ['Maintained the discovery frame through the first three exchanges — strong discipline', 'Didn\'t get flustered or shift energy when the prospect became aggressive', 'Used a calm, non-defensive tone throughout even under deliberate provocation'],
    improvements: ['If the prospect demands a pitch, give a 15-second one and immediately return to discovery: "[15-second overview]. Now — one question to make sure any of that is even relevant to you…"', 'Use mirroring more: repeat the last 2-3 words of the prospect\'s sentence back as a question to deepen their own thinking', 'Name the dynamic explicitly: "I want to make sure what I share is actually useful — can I ask one more question first?"'],
    keyTakeaway: 'When a deflector demands the pitch, give them 15 seconds of it — then redirect immediately. Resisting the demand entirely costs you rapport. Brief compliance earns you the right to continue.',
    scoreDimensions: [{ label: 'Opening', score: 7 }, { label: 'Value Framing', score: 5 }, { label: 'Objection Handling', score: 6 }, { label: 'Close', score: 6 }],
    nextPracticeRec: 'Retry "Deflector" with the pivot-and-return technique — give the 15-second pitch and immediately redirect. Then try "Guarded" for more nuanced resistance.',
  },
  {
    id: 'm14', scenarioId: 'po-easy', scenarioLabel: 'Sticker Shock', difficulty: 'easy',
    overallScore: 9.0, headline: 'Much sharper value anchor this time — the competitor comparison landed perfectly.', exchanges: 5, date: '2026-03-27T13:40:00Z',
    assessment: 'Clear improvement from the first time you ran this scenario. You led with value anchoring much earlier — by exchange 2 you\'d already referenced a comparable outcome before price came up. The competitor comparison framing was particularly effective and landed naturally without sounding defensive. You\'re building a reliable pattern here.',
    strengths: ['Anchored value in exchange 2 — before price was even on the table', 'Competitor comparison was deployed offensively rather than defensively — completely different energy', 'Closed with a next step tied to the value discussion, not the price'],
    improvements: ['Even stronger if you personalise the ROI example to the prospect\'s specific industry or team size', 'At the close, tie the value anchor explicitly back to the price: "So when you look at the $X, that\'s what you\'re getting in return for it"', 'Add a follow-up question at the end to surface any remaining hesitation before they leave the call'],
    keyTakeaway: 'Leading with a specific comparable outcome completely changes the price conversation — the number arrives after value is established, not before, so it has context.',
    scoreDimensions: [{ label: 'Opening', score: 9 }, { label: 'Value Framing', score: 10 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 8 }],
    nextPracticeRec: 'Graduate to "Cheaper Competitor" (hard) — you\'re ready for the next level of price resistance with a named competitor forcing direct comparison.',
  },
  {
    id: 'm15', scenarioId: 'co-easy', scenarioLabel: 'Open Listener', difficulty: 'easy',
    overallScore: 9.4, headline: 'Textbook opener — relevant, concise, and left space for the prospect to engage.', exchanges: 6, date: '2026-04-02T09:55:00Z',
    assessment: 'A near-masterclass in opener construction. You proved that a well-crafted opener doesn\'t need a long pitch — it just needs relevance, specificity, and deliberate space for the prospect to respond. By leaving a pause after your hook, you let the prospect fill it, which gave you far more usable information than any follow-up question would have. The prospect told you exactly what mattered to them.',
    strengths: ['Specific, prospect-centred hook in the first sentence — no filler, no feature dump', 'Deliberate pause after the opener — let the prospect drive the next exchange entirely', 'Actively listened and built the rest of the conversation directly on what the prospect said'],
    improvements: ['Have a 2-3 sentence "bridge" ready if the opener earns interest but the prospect asks "so what exactly is this?" — the transition matters', 'Test adding a social proof element: "we work with [similar company type] to solve exactly that…"', 'At the end of a strong opener, practice the pivot to discovery with a clean, single question rather than multiple questions at once'],
    keyTakeaway: 'A great opener creates curiosity and space — it doesn\'t deliver a pitch. You can\'t go wrong if the prospect ends up asking you the questions.',
    scoreDimensions: [{ label: 'Opening', score: 10 }, { label: 'Value Framing', score: 9 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 9 }],
    nextPracticeRec: 'Try "Skeptical Pro" (medium) — same opener skill tested against a harder, more defensive prospect with much less patience.',
  },
  {
    id: 'm16', scenarioId: 'cl-hard', scenarioLabel: 'Moving Goalposts', difficulty: 'hard',
    overallScore: 6.8, headline: 'Good job not capitulating on price — could have pattern-interrupted the loop earlier.', exchanges: 11, date: '2026-04-08T14:10:00Z',
    assessment: 'This is one of the hardest scenarios and you handled the core correctly — you didn\'t capitulate on price, which is the most common failure mode. The gap was in pattern recognition: by the third new objection, you should have named the loop explicitly rather than addressing each one in isolation. Naming the pattern breaks it. Treating each objection as new rewards the behaviour.',
    strengths: ['Held the line on price across multiple rounds — no unnecessary concessions under sustained pressure', 'Addressed each objection specifically rather than giving a generic, dismissive response', 'Stayed professionally composed throughout a long, draining conversation'],
    improvements: ['By objection 3, name the pattern directly: "I notice every time we resolve one concern, another one appears — is there a more fundamental hesitation I should understand?"', 'Use a forced-choice close to stop the loop: "If we resolve this one, is there anything else standing in the way of moving forward?"', 'Ask for an honest signal: "I want to make sure we\'re working toward a real decision — are these concerns things you want to resolve, or signals that this isn\'t the right fit?"'],
    keyTakeaway: 'Moving goalposts isn\'t really about the objections — it\'s about a prospect who doesn\'t feel safe enough to say yes. Make it safe before you address any single objection.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 7 }, { label: 'Objection Handling', score: 7 }, { label: 'Close', score: 5 }],
    nextPracticeRec: 'Retry "Moving Goalposts" — this time name the pattern explicitly at objection 3 and use the forced-choice close. Then try "Last-Minute Doubts" for contrast.',
  },
  {
    id: 'm17', scenarioId: 'tio-hard', scenarioLabel: 'Serial Staller', difficulty: 'hard',
    overallScore: 7.2, headline: 'Creative urgency framing — the mutual action plan idea was the right move.', exchanges: 8, date: '2026-04-14T11:00:00Z',
    assessment: 'Creative and confident handling of a genuinely difficult pattern. The mutual action plan was well-deployed — it shifted the conversation from "I\'ll think about it" to a concrete, time-bound process that the prospect had a role in designing. That\'s a sophisticated move. The follow-through on urgency framing was the weaker part — you hinted at urgency but never committed to it cleanly.',
    strengths: ['Proposed a mutual action plan — a much stronger move than simply pressing for a decision', 'Didn\'t accept vague stalling without pushing for specificity about what "thinking about it" actually meant', 'Maintained a collaborative, non-pushy tone throughout a frustrating pattern'],
    improvements: ['Commit fully to the urgency frame — if there\'s a genuine deadline, state it once, clearly, then stop. Don\'t hint at it', 'Ask "What would make you feel ready to decide at the end of our next conversation?" — gets the prospect to co-define their own decision criteria', 'After the mutual action plan, lock in a specific review date in the same call — don\'t let it float'],
    keyTakeaway: 'Serial stallers aren\'t bad prospects — they\'re risk-averse ones. Replace "when will you decide?" with "what needs to happen for you to feel ready?" and everything changes.',
    scoreDimensions: [{ label: 'Opening', score: 8 }, { label: 'Value Framing', score: 7 }, { label: 'Objection Handling', score: 8 }, { label: 'Close', score: 6 }],
    nextPracticeRec: 'Try "Last-Minute Doubts" (medium) — another closing scenario where the resistance is more personal fear than habitual stalling.',
  },
  {
    id: 'm18', scenarioId: 'di-easy', scenarioLabel: 'Opens Up', difficulty: 'easy',
    overallScore: 9.5, headline: 'Outstanding discovery — you found the pain point by the 2nd exchange.', exchanges: 5, date: '2026-04-18T15:30:00Z',
    assessment: 'Outstanding performance. Discovery doesn\'t get much cleaner than this — you found the core pain by exchange 2 through a combination of open questioning and genuine curiosity. What set this apart was that you didn\'t rush to solve the problem the moment you found it. You stayed in discovery long enough to understand the full context before any feature was mentioned. Patience at the right moment is a skill.',
    strengths: ['Found the core pain point by exchange 2 through targeted, open-ended questions', 'Resisted the urge to pitch the moment the first pain signal appeared — let the context deepen', 'Stayed genuinely curious and asked one more "why" beyond the obvious surface answer'],
    improvements: ['After surfacing the pain, quantify it with the prospect: "How much is that costing you in time or deals right now?"', 'Make the prospect articulate the cost themselves — they\'ll believe their own number far more than yours', 'Transition from discovery to pitch with an explicit permission question: "Can I show you exactly how we address that?"'],
    keyTakeaway: 'Great discovery feels like a conversation, not an interview. Stay curious one question longer than feels necessary — that\'s almost always where the real pain lives.',
    scoreDimensions: [{ label: 'Opening', score: 9 }, { label: 'Value Framing', score: 9 }, { label: 'Objection Handling', score: 10 }, { label: 'Close', score: 10 }],
    nextPracticeRec: 'Raise the difficulty — try "Guarded" (medium) where the same discovery skill is needed but the prospect actively resists sharing information.',
  },
  {
    id: 'm19', scenarioId: 'smi-hard', scenarioLabel: 'Brush-Off', difficulty: 'hard',
    overallScore: 5.8, headline: 'The pattern interrupt helped — work on a stronger fallback when they fully disengage.', exchanges: 5, date: '2026-04-20T10:45:00Z',
    assessment: 'You correctly identified that the "send me info" was a permanent brush-off and used a pattern interrupt — the right instinct. But the interrupt itself was too soft: it sounded like another pitch in disguise rather than a genuine shift in approach. The strongest pattern interrupts change your tone, briefly agree with the prospect, or name what\'s happening directly. Disguised pitches get treated as pitches.',
    strengths: ['Recognised the brush-off as terminal rather than treating it as a genuine information request', 'Attempted a pattern interrupt rather than passively accepting the rejection', 'Maintained a professional, non-desperate tone under deliberate disengagement'],
    improvements: ['Try the agree-and-redirect: "You know what, I\'ll send that. But before I do — genuinely, what would actually solving [X pain] mean for your team?"', 'Change your energy in the interrupt — if you\'ve been smooth and professional, try direct and blunt for one exchange', 'Have a 2-sentence last-chance statement ready: your single most compelling value claim, delivered in a completely different tone than the rest of the call'],
    keyTakeaway: 'A soft pattern interrupt looks like a disguised pitch and gets treated like one. Make it genuinely different — change your tone, agree with them briefly, or name what\'s happening directly.',
    scoreDimensions: [{ label: 'Opening', score: 6 }, { label: 'Value Framing', score: 6 }, { label: 'Objection Handling', score: 5 }, { label: 'Close', score: 5 }],
    nextPracticeRec: 'Retry "Brush-Off" with a different pattern interrupt — practice the agree-and-redirect approach and the tonal shift. Then try "Email Deflector" (medium) for a softer version.',
  },
  {
    id: 'm20', scenarioId: 'po-easy', scenarioLabel: 'Sticker Shock', difficulty: 'easy',
    overallScore: 9.2, headline: 'Consistent improvement — leading with value before mentioning price is now a habit.', exchanges: 5, date: '2026-04-22T13:20:00Z',
    assessment: 'Excellent consistency — this is the third time running this scenario and the improvement arc is clear and measurable. Leading with value before price is now instinctive, not deliberate. What distinguished this session was pacing: you didn\'t rush the value establishment, which meant when price arrived it had real context to sit in. You\'ve built a genuine habit. The next step is making that habit memorable.',
    strengths: ['Value-before-price sequencing was automatic — no hesitation or deliberate effort needed', 'Paced the conversation well — didn\'t rush to price despite the prospect\'s early curiosity about cost', 'The close was clean, confident, and connected directly back to the value established early in the conversation'],
    improvements: ['Now that this scenario is comfortable, add a more memorable story or metaphor to your value anchor — something the prospect will remember after the call ends', 'Test proactive comparison framing: "I\'ll be upfront — we\'re not the cheapest option, and here\'s exactly what you get for the difference"', 'Explore natural urgency: "When would you ideally want this in place?" — prospect-defined timeline without any pressure'],
    keyTakeaway: 'You\'ve built a genuine habit. The next evolution is making the value anchor memorable — a specific story or vivid comparison, not just an ROI calculation.',
    scoreDimensions: [{ label: 'Opening', score: 9 }, { label: 'Value Framing', score: 10 }, { label: 'Objection Handling', score: 9 }, { label: 'Close', score: 9 }],
    nextPracticeRec: 'You\'ve mastered this scenario. Graduate to "Over Budget" (medium) or "Cheaper Competitor" (hard) to test the same value framing against stronger resistance.',
  },
];

const KEY = 'pp-training-history';
const MAX = 30;

export function saveTrainingSession(entry: TrainingHistoryEntry): void {
  const history = getTrainingHistory();
  const updated = [entry, ...history].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* storage full — history not saved */ }
}

export function getTrainingHistory(): TrainingHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return MOCK_TRAINING_HISTORY;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) return MOCK_TRAINING_HISTORY;
    return data.filter((item): item is TrainingHistoryEntry =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.scenarioId === 'string' &&
      typeof item.date === 'string'
    );
  } catch {
    return MOCK_TRAINING_HISTORY;
  }
}

export function clearTrainingHistory(): void {
  localStorage.removeItem(KEY);
}

export function getMonthlySessionCount(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return getTrainingHistory().filter(entry => {
    const d = new Date(entry.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}
