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

    const langNote = language && language !== 'en-US'
      ? `\n\nIMPORTANT: All feedback, pros, cons, idealResponse, and idealReason MUST be written in the language for BCP 47 code "${language}".`
      : '';

    const conversationSoFar = (messages as Array<{ role: string; text: string }>)
      .map((m) => `${m.role === 'rep' ? 'REP' : 'PROSPECT'}: ${m.text}`)
      .join("\n");

    const systemPrompt = `You are a world-class sales trainer with decades of experience coaching top closers.

A sales rep is practicing a training simulation. Analyze their latest response and give them precise, honest, actionable feedback.

Scenario: ${scenario}
Prospect persona: ${scenarioDescription}

Conversation so far:
${conversationSoFar}

REP JUST SAID: "${userResponse}"

Evaluate this response as a sales trainer. Be honest — not harsh, not soft. Give real feedback that makes them better.

Respond ONLY with valid JSON:
{
  "score": number,
  "pros": string[],
  "cons": string[],
  "idealResponse": string,
  "idealReason": string
}

- "score": 1-10 rating of their response
- "pros": 1-2 specific things they did well (be concrete, not generic). Empty array if nothing good.
- "cons": 1-2 specific things they did wrong or missed (be concrete). Empty array if response was excellent.
- "idealResponse": The exact words a top closer would say in this situation (natural, first-person, under 50 words)
- "idealReason": 1-2 sentences explaining WHY that response works — the psychology or sales principle behind it${langNote}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Give feedback on the rep's response." }],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("training-feedback error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
