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
    const { scenario, scenarioDescription, saleContext, subScenarioContext, difficulty, messages, overallScore, language } = await req.json();

    const langNote = language && language !== 'en-US'
      ? `\n\nIMPORTANT: Write the entire summary in the language for BCP 47 code "${language}".`
      : '';

    // Build the full session transcript with inline feedback
    const sessionTranscript = (messages as Array<{
      role: string;
      text: string;
      feedback?: { score: number; pros: string[]; cons: string[]; idealResponse: string };
    }>)
      .map((m) => {
        if (m.role === 'prospect') return `PROSPECT: "${m.text}"`;
        const feedbackSummary = m.feedback
          ? ` [Score: ${m.feedback.score}/10${m.feedback.pros.length ? ` | Pros: ${m.feedback.pros.join(', ')}` : ''}${m.feedback.cons.length ? ` | Cons: ${m.feedback.cons.join(', ')}` : ''}]`
          : '';
        return `REP: "${m.text}"${feedbackSummary}`;
      })
      .join('\n');

    const saleNote = saleContext ? `\nProduct/service being sold: ${saleContext}` : '';
    const subNote = subScenarioContext ? `\nScenario specifics: ${subScenarioContext}` : '';
    const difficultyLabel = difficulty === 'easy' ? 'Easy' : difficulty === 'hard' ? 'Hard' : 'Medium';

    const systemPrompt = `You are a world-class sales trainer writing a personalized post-session coaching report.

A sales rep just completed a ${difficultyLabel} training session.
Scenario: ${scenario}
Prospect: ${scenarioDescription}${saleNote}${subNote}
Overall score: ${overallScore !== null ? `${overallScore}/10` : 'N/A'}

Full session with per-exchange scores and feedback:
${sessionTranscript}

Write a personalized coaching summary based on how this specific rep actually performed in this specific session. Reference what they actually said. Be concrete - no generic advice.

The summary must be honest and actionable. If they performed poorly, say so clearly and explain why. If they did well, be specific about what worked.

Respond ONLY with valid JSON:
{
  "headline": string,
  "assessment": string,
  "strengths": string[],
  "improvements": string[],
  "keyTakeaway": string
}

- "headline": 4-7 word punchy title capturing the session (e.g. "Strong opener, weak on closing", "Solid recovery after a rough start")
- "assessment": 2-3 sentences of honest overall coaching. Reference specific moments from the conversation. What was the arc of the session?
- "strengths": 1-2 specific things this rep did well across the session. Quote or reference their actual words where possible. Empty array if nothing stood out.
- "improvements": 1-2 concrete improvements with specific advice. Reference actual mistakes they made. What exactly should they do differently next time?
- "keyTakeaway": One crisp sentence - the single most important thing this rep should remember and practice before their next call.${langNote}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Write the personalized session summary." }],
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
