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
      (s) => s.type === "close-attempt"
    ).length;

    const formattedTranscript = (transcript as Array<{ speaker: string; text: string; timestampSeconds: number }>)
      .map((e) => `[${e.timestampSeconds}s] ${e.speaker === "rep" ? "REP" : "PROSPECT"}: ${e.text}`)
      .join("\n");

    const formattedSuggestions = (suggestions as Array<{ type: string; headline: string; triggeredBy: string }>)
      .slice(0, 15)
      .map((s) => `- [${s.type}] ${s.headline}: triggered by "${s.triggeredBy}"`)
      .join("\n");

    const systemPrompt = `You are a senior sales manager writing a post-call deal debrief for a B2B sales rep.

Respond ONLY with valid JSON — no markdown, no extra text.
Schema: { "aiSummary": string, "followUpEmail": string, "leadScore": number }

- "aiSummary": A structured debrief using EXACTLY these 6 sections in this order, each on its own line with a blank line between sections. Use bullet points (•) for list items. Be specific — reference actual things said in the call, not generic advice.

CALL OVERVIEW:
[2-3 sentences: what was discussed and how the conversation flowed from start to finish]

CONCLUSION:
[1-2 sentences: what was agreed or committed to by the end of the call, and where the deal stands right now]

WHAT THE PROSPECT REVEALED:
• [Key pain point, budget signal, timeline hint, stakeholder mentioned, or objection — one per bullet]
• [Add as many bullets as the call warrants — minimum 2, maximum 6]

MOMENTUM SIGNALS:
• [Strongest buying signal from the call — things the prospect said that show interest or intent]
• [Add more if present. If none, write "• No strong buying signals detected this call."]

DEAL RISKS:
• [A gap in the deal — something unknown, unresolved, or that could block the next step. Frame as deal gaps, not rep mistakes.]
• [Add more if present — minimum 1, maximum 4]

NEXT STEPS:
1. [Concrete action the rep should take before the next touchpoint]
2. [Another concrete action]
[Add more numbered steps if needed]

- "followUpEmail": A complete follow-up email the rep can send immediately. Include subject line at the top (format: "Subject: ..."). Personalize it to the actual conversation. Professional but not stiff.
- "leadScore": Integer 0-100. Weight: close probability (50%), buying signals (25%), minus objections (25%).${langNote}`;

    const userMessage = `Call details:
Prospect: ${config.prospectName}${config.prospectTitle ? `, ${config.prospectTitle}` : ''} at ${config.company}
${config.callType ? `Call type: ${config.callType}\n` : ''}Rep's pitch: ${config.yourPitch}
Call goal: ${config.callGoal}
${config.priorContext ? `\nPrior context & research:\n${config.priorContext}\n` : ''}

Metrics:
- Final close probability: ${closeProbability}%
- Objections: ${objectionsCount}
- Buying signals: ${buyingSignals}

Transcript (${(transcript as unknown[]).length} entries):
${formattedTranscript || "(no transcript captured)"}

AI suggestions triggered (${(suggestions as unknown[]).length} total):
${formattedSuggestions || "(none)"}`;

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
        max_tokens: 1400,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message ?? JSON.stringify(data.error)}`);
    }
    if (!data.choices?.length) throw new Error(`OpenAI returned no choices: ${JSON.stringify(data)}`);
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
