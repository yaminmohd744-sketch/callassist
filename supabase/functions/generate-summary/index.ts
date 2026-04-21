import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const { config, transcript, suggestions, closeProbability, objectionsCount, language } = await req.json();

    const langNote = language && language !== 'en-US'
      ? `\n\nIMPORTANT: "aiSummary" and "followUpEmail" MUST be written in the language for BCP 47 code "${language}".`
      : '';

    const buyingSignals = (suggestions as Array<{ type: string }>).filter(
      (s) => s.type === "closing-prompt"
    ).length;

    const formattedTranscript = (transcript as Array<{ speaker: string; text: string; timestampSeconds: number }>)
      .map((e) => `[${e.timestampSeconds}s] ${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${e.text}`)
      .join("\n");

    const formattedSuggestions = (suggestions as Array<{ type: string; headline: string; triggeredBy: string }>)
      .slice(0, 15)
      .map((s) => `- [${s.type}] ${s.headline}: triggered by "${s.triggeredBy}"`)
      .join("\n");

    const systemPrompt = `You are a sales analyst generating post-call reports for B2B sales reps.

Respond ONLY with valid JSON — no markdown, no extra text.
Schema: { "aiSummary": string, "followUpEmail": string, "leadScore": number }

- "aiSummary": 3-5 concise sentences covering what was discussed, key objections raised, buying signals detected, overall sentiment, and the recommended next step. Be specific and reference the actual conversation.
- "followUpEmail": A complete follow-up email the rep can send immediately. Include subject line at the top (format: "Subject: ..."). Personalize it to the actual conversation. Professional but not stiff.
- "leadScore": Integer 0-100. Weight: close probability (50%), buying signals (25%), minus objections (25%).${langNote}`;

    const userMessage = `Call details:
Prospect: ${config.prospectName} at ${config.company}
Rep's pitch: ${config.yourPitch}
Call goal: ${config.callGoal}

Metrics:
- Final close probability: ${closeProbability}%
- Objections: ${objectionsCount}
- Buying signals: ${buyingSignals}

Transcript (${(transcript as unknown[]).length} entries):
${formattedTranscript || "(no transcript captured)"}

AI suggestions triggered (${(suggestions as unknown[]).length} total):
${formattedSuggestions || "(none)"}`;

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
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.5,
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
    console.error("generate-summary error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
