import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { entry, transcript, stage, elapsedSeconds, probability, objectionsCount, config, lastLabel, language } =
      await req.json();

    const langNote = language && language !== "en-US"
      ? `\nThe call is in "${language}" — write the body in that language. Headline stays in English.`
      : "";

    // Only last 4 exchanges for speed — enough context without bloat
    const recentEntries = (transcript as Array<{ speaker: string; text: string }>)
      .slice(-4)
      .map((e) => `${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${e.text}`)
      .join("\n");

    const systemPrompt = `You are a real-time sales coach helping a rep have a better conversation. Your job is to help them move forward naturally — not push harder, not follow a rigid script, but read where the prospect is and suggest the best next move to keep things progressing.

Be direct, human, and conversational. If the prospect raised a concern, help the rep acknowledge it and find common ground. If there's an opening, help the rep explore it. If the rep needs to slow down and listen more, say that. Good sales is about genuine conversation, not clever closes.

Context:
- Selling: ${config?.yourPitch || "their product"}
- Goal: ${config?.callGoal || "move the conversation forward"}
- Stage: ${stage} | ${Math.floor(elapsedSeconds / 60)}min elapsed | Close probability: ${probability}%
- Objections so far: ${objectionsCount}
- Last suggestion: ${lastLabel ?? "none"} — suggest something different${langNote}

Recent conversation:
${recentEntries}

Prospect just said: "${entry.text}"

Decide: does this moment need a coaching suggestion? Only show one if it genuinely helps the rep respond better right now. Skip filler moments.

Respond ONLY with valid JSON (no markdown):
{"shouldShow": boolean, "type": "objection-handler"|"closing-prompt"|"tip", "headline": string, "body": string, "probabilityDelta": number, "objectionsCountDelta": number}

- "shouldShow": false if the prospect said something routine with no meaningful coaching opportunity
- "body": what the rep should say or do — under 50 words, natural and conversational, first person. Not a script — a suggestion.
- "headline": 2-4 words capturing the move (e.g. "Dig Deeper", "Validate First", "Find Common Ground")
- "probabilityDelta": integer -10 to +10
- "objectionsCountDelta": 0 or 1`;

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
        max_tokens: 180,
        temperature: 0.65,
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
