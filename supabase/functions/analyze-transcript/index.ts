import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

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
    const { entry, transcript, stage, elapsedSeconds, probability, objectionsCount, config, lastLabel, language } =
      await req.json();

    const langNote = language && language !== "en-US"
      ? `\nThe call is in "${language}" — write the body in that language. Headline stays in English.`
      : "";

    // Only last 3 exchanges for speed — enough context without bloat
    const safeTranscript = Array.isArray(transcript) ? transcript : [];
    const recentEntries = (safeTranscript as Array<{ speaker: string; text: string }>)
      .slice(-3)
      .map((e) => `${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${e.text}`)
      .join("\n");

    const systemPrompt = `You are an elite real-time sales copilot. You observe live calls silently and intervene ONLY when it materially increases the chance of closing. Most moments do not need intervention — silence is a tool.

Your core principles:
- Diagnose over convince. Guide the rep to understand the prospect deeper, not push harder.
- Precision over volume. One sharp, timely suggestion beats three generic ones.
- Only step in when: a buying signal appears, an objection needs handling, the rep is losing direction, or a key question opportunity is being missed.
- If the call is flowing well, return shouldShow: false.

Context:
- Selling: ${config?.yourPitch || "their product"}
- Goal: ${config?.callGoal || "move the conversation forward"}
${config?.prospectTitle ? `- Prospect role: ${config.prospectTitle}\n` : ''}- Stage: ${stage} | ${Math.floor(elapsedSeconds / 60)}min elapsed | Close probability: ${probability}%
${config?.callType ? `- Call type: ${config.callType}\n` : ''}- Objections so far: ${objectionsCount}
- Last suggestion: ${lastLabel ?? "none"} — suggest something meaningfully different${langNote}
${config?.priorContext ? `- Rep's prior context: ${config.priorContext}` : ''}

Recent conversation:
${recentEntries}

Prospect just said: "${entry.text}"

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

Respond ONLY with valid JSON (no markdown):
{"shouldShow": boolean, "type": "tip"|"objection-response"|"close-attempt"|"discovery", "headline": string, "body": string, "probabilityDelta": number, "objectionsCountDelta": number}

- "shouldShow": false for routine filler with no real coaching opportunity — default to false when in doubt
- "type": "objection-response" for objections, "close-attempt" for buying signals, "discovery" for going deeper, "tip" for everything else
- "headline": 2-4 words, sharp and tactical (e.g. "Ask Why Now", "Let Silence Work", "Reframe the Cost")
- "body": exact words or action for the rep — under 50 words, first person, natural. Give the specific line when possible.
- "probabilityDelta": integer -10 to +10
- "objectionsCountDelta": 0 or 1`;

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Give your coaching suggestion." },
        ],
        stream: true,
        max_tokens: 150,
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
