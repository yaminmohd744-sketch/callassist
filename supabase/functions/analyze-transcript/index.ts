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
    const { entry, transcript, stage, elapsedSeconds, probability, objectionsCount, config, lastLabel } =
      await req.json();

    const recentEntries = (transcript as Array<{ speaker: string; text: string }>)
      .slice(-6)
      .map((e) => `${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${e.text}`)
      .join("\n");

    const systemPrompt = `You are an expert sales coach giving real-time guidance to a sales rep on a live cold call.

The rep has shared background context about their prospect, pitch, and goal. Use this as BACKGROUND UNDERSTANDING ONLY — do NOT repeat, quote, or echo the pitch text or goal text verbatim in your suggestion.

Your job: read what the prospect just said and give the rep ONE short, natural script they can say RIGHT NOW.

The script must:
- Directly respond to what the prospect just said
- Sound like a skilled human rep — conversational, not robotic or corporate
- Use the prospect's name or reference their company when it helps
- Advance toward the call goal without sounding pushy
- Be under 60 words

BAD (do not do this):
  Prospect: "Who's this?" → "I'm calling because [raw pitch copied here]..."

GOOD:
  Prospect: "Who's this?" → "Hey [name] — this is [rep name]. I work with founders on getting more leads through their website. Give me 45 seconds — I'll tell you one thing we did for a founder like you last month. Worth it?"

Respond ONLY with valid JSON, no markdown:
{ "shouldShow": boolean, "type": "objection-handler"|"closing-prompt"|"tip", "headline": string, "body": string, "probabilityDelta": number, "objectionsCountDelta": number }

- "body": exact script the rep says. Under 60 words. Natural first-person speech.
- "headline": 2-4 word label (e.g. "Identify & Hook", "Push for Demo", "Price Objection")
- "probabilityDelta": integer -15 to +15
- "objectionsCountDelta": 0 or 1
- If nothing useful to say, return shouldShow: false with empty headline/body`;

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
        temperature: 0.6,
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
