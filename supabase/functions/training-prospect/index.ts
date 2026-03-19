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
    const { scenario, scenarioDescription, messages, userResponse, language } = await req.json();

    // If no userResponse, this is initialization — generate persona + opening line
    const isInit = !userResponse;

    const langNote = language && language !== 'en-US'
      ? `\n\nIMPORTANT: All prospect dialogue and scenario descriptions MUST be written in the language for BCP 47 code "${language}".`
      : '';

    const systemPrompt = isInit
      ? `You are simulating a sales training scenario for a sales rep to practice on.

Scenario type: ${scenario}

Generate:
1. A realistic prospect persona (name, company, role, situation) — 1-2 sentences
2. The prospect's opening line that sets up the scenario naturally

Respond ONLY with valid JSON:
{ "scenarioDescription": string, "openingLine": string }

- "scenarioDescription": Who the prospect is and what their situation is. E.g. "Sarah Mitchell, CFO at a 50-person logistics company. She's evaluating your software but is concerned about the cost relative to their budget."
- "openingLine": What the prospect says to kick off the scenario. Make it realistic and challenging but not impossible.${langNote}`
      : `You are playing a realistic sales prospect in a training simulation.

Your persona: ${scenarioDescription}
Scenario type: ${scenario}

The sales rep just said: "${userResponse}"

Stay in character. Respond naturally as this prospect would. Be realistic:
- Don't make it too easy (don't just cave and agree)
- Don't make it impossible (don't be completely irrational)
- React authentically to what the rep said — if they handled it well, soften slightly; if they handled it poorly, push back more
- Keep your response short (1-3 sentences max)

Respond ONLY with valid JSON:
{ "prospectResponse": string }${langNote}`;

    const conversationHistory = (messages as Array<{ role: string; text: string }>).map((m) => ({
      role: m.role === 'rep' ? 'user' : 'assistant',
      content: m.text,
    }));

    const openaiMessages = isInit
      ? [{ role: 'user', content: 'Generate the scenario.' }]
      : [
          ...conversationHistory,
          { role: 'user', content: userResponse },
        ];

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
          ...openaiMessages,
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("training-prospect error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
