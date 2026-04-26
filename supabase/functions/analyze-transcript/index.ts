import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

function sanitize(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  ).auth.getUser(jwt);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const { entry, transcript, stage, elapsedSeconds, probability, objectionsCount, config, lastLabel, language, currentPhaseLabel, callSummary } =
      await req.json();

    const langNote = language && language !== "en-US"
      ? `\nThe call is in "${language}" — write the body in that language. Headline stays in English.`
      : "";

    const safeTranscript = Array.isArray(transcript) ? transcript : [];
    // Send last 8 exchanges in full — enough for deep context on most calls
    const recentEntries = (safeTranscript as Array<{ speaker: string; text: string }>)
      .slice(-8)
      .map((e) => `${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${sanitize(e.text, 500)}`)
      .join("\n");

    const safeEntryText = sanitize(entry?.text, 500);
    const safePitch = sanitize(config?.yourPitch, 300);
    const safeGoal = sanitize(config?.callGoal, 200);
    const safeProspectName = sanitize(config?.prospectName, 80);
    const safeProspectTitle = sanitize(config?.prospectTitle, 80);
    const safePriorContext = sanitize(config?.priorContext, 400);
    const safeCallSummary = sanitize(callSummary, 400);

    const systemPrompt = `You are an elite real-time sales copilot. You observe live calls silently and intervene ONLY when it materially increases the chance of closing. Most moments do not need intervention — silence is a tool.

Your core principles:
- Diagnose over convince. Guide the rep to understand the prospect deeper, not push harder.
- Precision over volume. One sharp, timely suggestion beats three generic ones.
- Only step in when: a buying signal appears, an objection needs handling, the rep is losing direction, or a key question opportunity is being missed.
- If the call is flowing well, return shouldShow: false.

Context:
- Selling: ${safePitch || "their product"}
- Goal: ${safeGoal || "move the conversation forward"}
${safeProspectTitle ? `- Prospect role: ${safeProspectTitle}\n` : ''}${config?.callType ? `- Call type: ${config.callType}\n` : ''}- ${Math.floor(elapsedSeconds / 60)}min elapsed | Close probability: ${probability}% | Objections: ${objectionsCount}
- Last suggestion: ${lastLabel ?? "none"} — suggest something meaningfully different${langNote}
${safePriorContext ? `- Prior context: ${safePriorContext}\n` : ''}${currentPhaseLabel ? `- Current detected phase: ${currentPhaseLabel}\n` : ''}${safeCallSummary ? `- Earlier in the call: ${safeCallSummary}\n` : ''}
Recent conversation:
${recentEntries}

Prospect just said: "${safeEntryText}"

LISTENING — detect emotional signals in the prospect's words and guide accordingly:
- Frustration ("it's been a mess", "really frustrating", "nothing works", "every time") → acknowledge it first before moving forward, don't skip past it
- Hesitation ("I guess", "maybe", "I don't know", "not sure", "we'll see") → slow down, clarify what's uncertain before proceeding
- Urgency ("by end of quarter", "we need this soon", deadline language) → move toward close, don't ask more discovery questions
- Curiosity ("how does it work", "tell me more", "what about X", "can it do Y") → this is a buying signal, explore and lean in
- Disengagement (very short replies: "sure", "yeah", "okay", "uh huh") → re-engage with a direct, specific question

QUESTION STRATEGY — if the rep is staying shallow, push them deeper:
Surface → Problem → Deep Emotional
e.g. "What's actually stopping you right now?" / "How much is that costing you?" / "What happens if this doesn't get fixed?"

OBJECTION HANDLING — guide the rep through: Acknowledge → Clarify → Reframe.
Never suggest pushing back or arguing.

CLOSING — when strong buying signals appear (price questions, timeline talk, next-step questions), prompt a calm assumptive close.
e.g. "Sounds like this solves X — want to walk through getting you started?"

SILENCE — if the rep just asked something important, tell them to pause and let the prospect fill it.

CALL PHASE: Based on the conversation content (not elapsed time), detect:
1. "detectedStage": which of these 4 formal stages best fits right now: "opener", "discovery", "pitch", "close"
2. "phaseLabel": a 3-6 word human-readable label for what's specifically happening (e.g. "Handling price objection", "Building initial rapport", "Prospect exploring the product", "Going for verbal commitment", "Cold intro", "Addressing timeline concern"). Be specific — not just "discovery" but what KIND of moment this is.
Always return both fields, even when shouldShow is false.

Respond ONLY with valid JSON (no markdown). IMPORTANT: emit the "body" field first so the verbatim line reaches the rep immediately while the rest streams in:
{"body": string, "shouldShow": boolean, "type": "tip"|"objection-response"|"close-attempt"|"discovery", "headline": string, "probabilityDelta": number, "objectionsCountDelta": number, "detectedStage": "opener"|"discovery"|"pitch"|"close", "phaseLabel": string, "prospectTone": "Skeptical"|"Curious"|"Defensive"|"Warm"|"Disengaged"|"Frustrated"|"Excited"|"Hesitant"|"Neutral"|null}

- "shouldShow": false for routine filler with no real coaching opportunity — default to false when in doubt
- "type": "objection-response" for objections, "close-attempt" for buying signals, "discovery" for going deeper, "tip" for everything else
- "headline": 2-4 words, sharp and tactical (e.g. "Ask Why Now", "Let Silence Work", "Reframe the Cost")
- "body": Open with the EXACT VERBATIM LINE to say — ≤15 words, natural first-person speech, as if whispering it in their ear. No filler, no "you could say". Just the line. Then a double newline, then ONE sentence explaining the tactical reason this works. Example: "I hear you — what would need to change for this to make sense?\n\nTurns their objection into a solvable condition rather than a hard no."
- "probabilityDelta": integer -10 to +10
- "objectionsCountDelta": 0 or 1
- "detectedStage": one of "opener", "discovery", "pitch", "close"
- "phaseLabel": 3-6 word specific description of what's happening right now
- "prospectTone": the prospect's emotional state inferred from their words — one of the enum values, or null if unclear`;

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Give your coaching suggestion." },
        ],
        stream: true,
        max_tokens: 340,
        temperature: 0.55,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`OpenAI returned ${response.status}`);
    }

    // Stream the SSE through to the client with our CORS headers.
    // The client reads the raw OpenAI SSE format and assembles the JSON.
    const { readable, writable } = new TransformStream();
    response.body.pipeTo(writable);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    console.error("analyze-transcript error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
