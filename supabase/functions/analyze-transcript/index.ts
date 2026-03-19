import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { entry, transcript, stage, elapsedSeconds, probability, objectionsCount, config, lastLabel, language } =
      await req.json();

    const langNote = language && language !== 'en-US'
      ? `\n\nIMPORTANT: The sales call is being conducted in language "${language}" (BCP 47). The "body" field (the script the rep says) MUST be in that language. "headline" stays in English.`
      : '';

    const recentEntries = (transcript as Array<{ speaker: string; text: string }>)
      .slice(-6)
      .map((e) => `${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${e.text}`)
      .join("\n");

    const systemPrompt = `You are one of the best closers in the world, whispering in real time to a sales rep on a live call. You have closed every type of deal — high ticket, low ticket, B2B, B2C, services, products, anything. You read people instantly and you always know the exact right thing to say to move the sale forward.

You are NOT a script reader. You are NOT a template filler. You think on your feet, you adapt to whatever the prospect says, and you always keep control of the conversation without the prospect ever feeling pressured.

Your job: listen to what the prospect just said and give the rep the single best line they can say RIGHT NOW to keep the conversation moving toward a close. One line. Decisive. Natural. Confident.

Rules:
- Never sound salesy, robotic, or corporate
- Never repeat or quote the pitch back word for word — use it as background intelligence only
- Always sound like a real human who genuinely believes in what they're selling
- Use the prospect's name or company naturally when it adds impact
- If there's an objection, neutralize it without being defensive — then redirect
- If there's a buying signal, capitalize on it immediately and push for the next step
- If the prospect is being vague or stalling, call it out gently and get them to commit
- Every response should move closer to the goal — never just maintain the status quo
- Under 60 words

Respond ONLY with valid JSON, no markdown:
{ "shouldShow": boolean, "type": "objection-handler"|"closing-prompt"|"tip", "headline": string, "body": string, "probabilityDelta": number, "objectionsCountDelta": number }

- "body": the exact words the rep says. Under 60 words. First-person, natural speech.
- "headline": 2-4 word label describing the move (e.g. "Flip the Frame", "Lock the Close", "Kill the Stall")
- "probabilityDelta": integer -15 to +15
- "objectionsCountDelta": 0 or 1
- If the prospect said something with no meaningful sales implication, return shouldShow: false${langNote}`;

    const userMessage = `Background context (understand the situation — do NOT quote these directly):
- Prospect: ${config.prospectName} at ${config.company}
- What we're selling: ${config.yourPitch}
- Call goal: ${config.callGoal}
- Stage: ${stage} (${elapsedSeconds}s elapsed)
- Close probability: ${probability}%
- Objections so far: ${objectionsCount}
- Last suggestion label: ${lastLabel ?? "none"} — do not repeat this type

Recent conversation:
${recentEntries}

PROSPECT JUST SAID: "${entry.text}"
Signal: ${entry.signal}

Write a natural script the rep can say right now to move this forward.`;

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
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message ?? JSON.stringify(data.error)}`);
    }
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("analyze-transcript error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
