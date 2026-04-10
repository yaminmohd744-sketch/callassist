import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const VALID_SIGNALS = ["objection", "buying-signal", "neutral"] as const;
type Signal = typeof VALID_SIGNALS[number];

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
    const { text, language } = await req.json();

    const systemPrompt = `You are a sales call signal detector. Given a prospect's utterance during a sales call, classify it as exactly one of: "objection", "buying-signal", or "neutral".
- "objection": resistance, doubt, pushback, price concern, not interested, need to think, too busy
- "buying-signal": interest, enthusiasm, agreement, asking about next steps, positive reaction, wants to proceed
- "neutral": anything else
Respond with ONLY the single word, no punctuation. The utterance may be in any language — classify the meaning regardless of language. Language hint: ${language}.`;

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
          { role: "user", content: text },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message ?? JSON.stringify(data.error)}`);
    }

    const raw = (data.choices[0].message.content as string).trim().toLowerCase();
    const signal: Signal = (VALID_SIGNALS as readonly string[]).includes(raw)
      ? (raw as Signal)
      : "neutral";

    return new Response(JSON.stringify({ signal }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("classify-signal error:", err);
    return new Response(JSON.stringify({ signal: "neutral" }), {
      status: 200, // always 200 — client falls back to neutral on error anyway
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
