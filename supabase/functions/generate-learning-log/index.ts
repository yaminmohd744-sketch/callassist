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
    const { currentProfile, previousProfile, changes } = await req.json();

    const systemPrompt = `You are Pitchr's AI coach writing entries for a rep's personal learning log.

Your job is to look at what changed in the rep's performance data and write honest, plain-English entries that explain:
1. What you found or noticed
2. What you're changing or doing about it

Rules:
- Write like a coach talking directly to the rep. Use "you" and "we".
- Be specific. Use actual numbers when available.
- Keep each entry to 2-4 sentences max.
- Plain language. No jargon. A 10-year-old should understand it.
- Be honest, even if it's a bit blunt. The rep needs real feedback.
- If something improved, celebrate it clearly.
- If something is a problem, say what the problem is and exactly what the AI is now doing differently.

Return ONLY valid JSON in this exact shape — no markdown, no extra text:
{
  "entries": [
    {
      "headline": "Short title, 3-6 words",
      "body": "2-4 sentences of plain-English insight + action",
      "category": "talk-ratio" | "objection-handling" | "closing" | "discovery" | "trajectory" | "general",
      "severity": "finding" | "improvement" | "warning"
    }
  ]
}

Generate 1-3 entries based on the most important changes. Do not invent changes that aren't in the data.`;

    const changesText = sanitize(JSON.stringify(changes), 800);
    const currentText = sanitize(JSON.stringify(currentProfile), 1200);
    const previousText = previousProfile ? sanitize(JSON.stringify(previousProfile), 800) : "none (this is the first profile)";

    const userMessage = `Current performance profile (${currentProfile?.callsAnalyzed ?? 0} calls analyzed):
${currentText}

Previous profile:
${previousText}

Changes detected:
${changesText}

Write the learning log entries now.`;

    const result = parseJsonLoose(await anthropicText({
      model: MODELS.deep,
      maxTokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }));
    if (!Array.isArray(result.entries)) throw new Error("Bad response shape");

    return new Response(JSON.stringify({ entries: result.entries }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("[generate-learning-log]", err);
    return new Response(JSON.stringify({ error: "Failed to generate log entries" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
