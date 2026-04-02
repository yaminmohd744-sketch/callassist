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
    const { pitch, company, callGoal } = await req.json();

    const systemPrompt = `You are a sales pitch writer helping a sales rep prepare for a call.
Your job is to take the rep's rough notes about their product or service and expand them into a clear, structured pitch description that an AI coaching system can use to generate precise, relevant objection handlers and closing prompts during a live call.

The output should be a single block of text (no JSON, no markdown headers) that covers:
1. What the product/service does in plain language
2. The core problem it solves
3. Who it's for (ideal customer profile)
4. The 2-3 strongest value propositions or differentiators
5. Common objections and how the rep typically addresses them

Keep it natural and conversational — written in first person as the rep. 2-4 paragraphs max. Do not invent specific numbers or claims not implied by the input.`;

    const userMessage = `Here is the rep's rough pitch notes:
"${pitch}"

Company being called: ${company || "(not specified)"}
Goal of this call: ${callGoal || "(not specified)"}

Expand this into a clear pitch description the AI coaching system can use.`;

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
          { role: "user", content: userMessage },
        ],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message ?? JSON.stringify(data.error)}`);
    }

    const enhancedPitch = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ enhancedPitch }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("enhance-pitch error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
