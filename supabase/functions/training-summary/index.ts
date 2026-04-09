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
    const { scenario, scenarioDescription, saleContext, subScenarioContext, difficulty, messages, overallScore, exitTrigger, language } = await req.json();

    const LANG_NAMES: Record<string, string> = {
      'es-ES': 'Spanish', 'fr-FR': 'French', 'pt-BR': 'Portuguese',
      'de-DE': 'German',  'it-IT': 'Italian', 'nl-NL': 'Dutch',
      'zh-CN': 'Mandarin Chinese', 'ja-JP': 'Japanese', 'ar-SA': 'Arabic',
    };
    const langName = (language && language !== 'en-US') ? (LANG_NAMES[language] ?? language) : null;
    const langPrefix = langName
      ? `LANGUAGE REQUIREMENT: You must write ALL output exclusively in ${langName}. Every word of every field in your JSON response must be in ${langName}. Do not use English.\n\n`
      : '';

    // Build the full session transcript
    const sessionTranscript = (messages as Array<{
      role: string;
      text: string;
    }>)
      .map((m) => `${m.role === 'rep' ? 'REP' : 'PROSPECT'}: "${m.text}"`)
      .join('\n');

    const saleNote = saleContext ? `\nProduct/service being sold: ${saleContext}` : '';
    const subNote = subScenarioContext ? `\nScenario specifics: ${subScenarioContext}` : '';
    const difficultyLabel = difficulty === 'easy' ? 'Easy' : difficulty === 'hard' ? 'Hard' : 'Medium';

    const exitLabel = exitTrigger === 'deal-closed' ? 'Deal Closed'
      : exitTrigger === 'call-booked' ? 'Call Booked'
      : exitTrigger === 'next-step' ? 'Next Step Confirmed'
      : exitTrigger === 'lead-lost' ? 'Lead Lost'
      : 'Manual End';

    const exitNote = `\nHow the session ended: ${exitLabel}`;

    // The overall score may not be available (no feedback was run per-turn now)
    const scoreNote = overallScore !== null ? `\nInternal score (do not display directly): ${overallScore}/10` : '';

    const systemPrompt = `${langPrefix}You are an experienced sales coach writing a post-session debrief for a sales rep who just finished a training simulation.

Session details:
Scenario: ${scenario} (${difficultyLabel})
Prospect: ${scenarioDescription}${saleNote}${subNote}${exitNote}${scoreNote}

Full conversation:
${sessionTranscript}

Your job is to assess whether the rep fulfilled the goal of this scenario — not whether they followed a rigid script. Sales is broad. What matters is: did they move the conversation forward? Did they handle the situation in a way that would work in the real world?

Be honest but fair. A rep who gets the job done in their own style should score well even if they didn't use textbook language. Only flag something as a weakness if it genuinely hurt their performance or would hurt them on a real call.

Base your assessment primarily on:
1. Did the rep achieve or progress toward the scenario goal?
2. Did they handle the prospect's specific objections/situation effectively?
3. Were there clear missed opportunities or mistakes that changed the outcome?

The score should reflect goal fulfillment: 8-10 = achieved the goal or nearly, 6-7 = solid progress with minor gaps, 4-5 = partial, significant misses, 1-3 = failed to move the call forward at all. Do NOT get stuck in the middle — if they did the job, give them credit.

Respond ONLY with valid JSON:
{
  "headline": string,
  "assessment": string,
  "strengths": string[],
  "improvements": string[],
  "keyTakeaway": string
}

- "headline": 4-7 word punchy title capturing the session outcome (e.g. "Solid close under pressure", "Lost it at the objection", "Good opener, stalled at the end")
- "assessment": 2-3 sentences of honest, specific coaching. Reference what actually happened in the conversation. What was the overall arc?
- "strengths": 1-2 specific things the rep did well. Quote or reference their actual words. Empty array only if they did nothing right.
- "improvements": 1-2 concrete, actionable improvements tied to actual moments in this session. What should they do differently? Be specific — not "be more confident" but "when the prospect said X, you should have Y."
- "keyTakeaway": One crisp sentence — the single most useful thing to take from this session.`;

    const langReminder = langName ? ` Respond entirely in ${langName}.` : '';
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Write the personalized session summary.${langReminder}` }],
        response_format: { type: "json_object" },
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("training-summary error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
