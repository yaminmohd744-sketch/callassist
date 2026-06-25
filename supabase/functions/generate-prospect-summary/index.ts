import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { anthropicText, parseJsonLoose, MODELS } from "../_shared/anthropic.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sanitize(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
}

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
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  try {
    const { config, transcript, aiSummary, closeProbability, callStage, durationSeconds } = await req.json();

    const safeProspectName  = sanitize(config?.prospectName, 80);
    const safeCompany       = sanitize(config?.company,      80);
    const safePitch         = sanitize(config?.yourPitch,    300);
    const safeGoal          = sanitize(config?.callGoal,     200);
    const safeAiSummary     = sanitize(aiSummary,            800);

    const formattedTranscript = Array.isArray(transcript)
      ? (transcript as Array<{ speaker: string; text: string; timestampSeconds: number }>)
          .map(e => `${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${sanitize(e.text, 300)}`)
          .join("\n")
      : "";

    const durationMin = Math.round((durationSeconds ?? 0) / 60);

    const systemPrompt = `You are writing a concise, professional "What We Discussed" summary to share with a prospect after a sales call.

Tone: warm, factual, forward-looking. NOT a sales pitch. This will be sent to the prospect — write it as if the rep wrote it themselves.

Format:
- 3-5 short paragraphs
- Open with a one-line recap of the call purpose
- Cover what pain or goals were discussed
- Note what was agreed or where things stand
- Close with a clear next step

Keep it under 250 words. Plain prose — no bullet points, no headers. First person ("We discussed...").

Respond ONLY with valid JSON: { "summary": string }`;

    const userMessage = `Call with: ${safeProspectName} at ${safeCompany}
Goal: ${safeGoal}
Duration: ${durationMin} minutes
Stage reached: ${callStage}
Close probability: ${closeProbability}%
${safePitch ? `Product/service: ${safePitch}\n` : ''}
AI debrief:
${safeAiSummary}

Transcript excerpt:
${formattedTranscript.slice(0, 2000)}

Write the prospect-facing summary.`;

    const result = parseJsonLoose(await anthropicText({
      model: MODELS.deep,
      maxTokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }));
    return new Response(JSON.stringify({ summary: typeof result.summary === "string" ? result.summary : "" }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("[generate-prospect-summary]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
