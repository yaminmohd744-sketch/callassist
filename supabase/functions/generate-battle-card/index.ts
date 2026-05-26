import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

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
    const { prospectName, prospectTitle, company, callType, callGoal, yourPitch, priorContext } = await req.json();

    const safeProspectName  = sanitize(prospectName,  80);
    const safeProspectTitle = sanitize(prospectTitle, 80);
    const safeCompany       = sanitize(company,       80);
    const safeCallType      = sanitize(callType,      40);
    const safeCallGoal      = sanitize(callGoal,     200);
    const safeYourPitch     = sanitize(yourPitch,    300);
    const safePriorContext  = sanitize(priorContext,  400);

    const systemPrompt = `You are an elite pre-call battle card generator for B2B sales reps. Given prospect and call details, produce a sharp, tactical battle card the rep can scan in 30 seconds before dialing.

Respond ONLY with valid JSON — no markdown:
{
  "likelyObjections": [{ "objection": string, "response": string }],
  "powerQuestions": [string],
  "suggestedOpener": string,
  "contextInsight": string
}

Rules:
- "likelyObjections": 3 objections most likely for this prospect type + call type. Each "response" is 1-2 sentences — direct, non-pushy reframe.
- "powerQuestions": 4-5 discovery/closing questions tailored to the goal. Open-ended. Designed to uncover pain, urgency, or budget.
- "suggestedOpener": A natural, confident cold-call or warm-call opener (≤25 words). First-person. No filler phrases like "I was wondering if...".
- "contextInsight": 1-2 sentences of the single most important insight about this prospect or call type that changes how the rep should approach it.`;

    const userMessage = `Prospect: ${safeProspectName}${safeProspectTitle ? `, ${safeProspectTitle}` : ''} at ${safeCompany}
Call type: ${safeCallType || 'cold'}
Goal: ${safeCallGoal || 'book a next step'}
${safeYourPitch ? `Rep's pitch: ${safeYourPitch}\n` : ''}${safePriorContext ? `Prior context: ${safePriorContext}\n` : ''}
Generate the battle card.`;

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
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
        max_tokens: 700,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);
    if (!data.choices?.length) throw new Error("No choices returned");

    const result = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("[generate-battle-card]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
