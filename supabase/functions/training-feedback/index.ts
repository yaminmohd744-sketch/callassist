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
    const { scenario, scenarioDescription, saleContext, subScenarioContext, difficulty, messages, userResponse, previousFeedback, language } = await req.json();

    const LANG_NAMES: Record<string, string> = {
      'es-ES': 'Spanish', 'fr-FR': 'French', 'pt-BR': 'Portuguese',
      'de-DE': 'German',  'it-IT': 'Italian', 'nl-NL': 'Dutch',
      'zh-CN': 'Mandarin Chinese', 'ja-JP': 'Japanese', 'ar-SA': 'Arabic',
    };
    const langName = language && language !== 'en-US' ? LANG_NAMES[language] ?? language : null;
    const langPrefix = langName
      ? `LANGUAGE REQUIREMENT: You must write ALL output exclusively in ${langName}. Every word of every field in your JSON response must be in ${langName}. Do not use English.\n\n`
      : '';

    const conversationSoFar = (messages as Array<{ role: string; text: string }>)
      .map((m) => `${m.role === 'rep' ? 'REP' : 'PROSPECT'}: ${m.text}`)
      .join("\n");

    const saleNote = saleContext ? `\nWhat the rep is selling: ${saleContext}` : '';
    const subNote = subScenarioContext ? `\nSpecific situation: ${subScenarioContext}` : '';
    const difficultyNote = difficulty === 'easy'
      ? '\n\nDifficulty: EASY - Be encouraging. Score generously (a decent response should get 6-7). Focus on what they did well and keep cons constructive.'
      : difficulty === 'hard'
      ? '\n\nDifficulty: HARD - Be strict. Hold them to a very high standard. A good-but-not-great response scores 5-6. Only give 8+ for genuinely excellent responses. Point out even minor missed opportunities.'
      : '';

    // Build previous feedback context to prevent repetition
    const prevFeedbackNote = previousFeedback && previousFeedback.length > 0
      ? `\n\nFeedback already given this session:\n${(previousFeedback as Array<{ score: number; pros: string[]; cons: string[] }>)
          .map((f, i) => {
            const parts = [];
            if (f.pros.length) parts.push(`Praised: ${f.pros.join('; ')}`);
            if (f.cons.length) parts.push(`Flagged: ${f.cons.join('; ')}`);
            return `Exchange ${i + 1} (${f.score}/10): ${parts.join(' | ')}`;
          })
          .join('\n')}\n\nCRITICAL: Do NOT repeat feedback points already given above. If the same mistake recurs, acknowledge the pattern (e.g. "Again, you skipped a discovery question - this is becoming a pattern"). If the same strength appears, note their consistency. Every exchange must give the rep something NEW to act on.`
      : '';

    const systemPrompt = `${langPrefix}You are a world-class sales trainer with decades of experience coaching top closers.

A sales rep is practicing a training simulation. Analyze their latest response and give them precise, honest, actionable feedback.

Scenario: ${scenario}
Prospect persona: ${scenarioDescription}${saleNote}${subNote}

Conversation so far:
${conversationSoFar}

REP JUST SAID: "${userResponse}"

Evaluate this response as a sales trainer. Be honest - not harsh, not soft. Give real feedback that makes them better. Reference the specific product/deal and scenario when relevant.${prevFeedbackNote}

Also include a "toneCoach" field analyzing the prospect's emotional tone in their latest message and giving the rep one sharp coaching cue.

Respond ONLY with valid JSON:
{
  "score": number,
  "pros": string[],
  "cons": string[],
  "idealResponse": string,
  "idealReason": string,
  "toneCoach": {
    "tone": string,
    "move": string,
    "say": string
  }
}

- "score": 1-10 rating of their response
- "pros": 1-2 specific things they did well (be concrete, not generic). Empty array if nothing good.
- "cons": 1-2 specific things they did wrong or missed (be concrete). Empty array if response was excellent.
- "idealResponse": The exact words a top closer would say in this situation (natural, first-person, under 50 words)
- "idealReason": 1-2 sentences explaining WHY that response works - the psychology or sales principle behind it
- "toneCoach.tone": The prospect's emotional tone in their last message (one of: Skeptical, Curious, Defensive, Warm, Disengaged, Frustrated, Excited, Hesitant, Neutral)
- "toneCoach.move": What the rep should DO tactically right now — 1 sentence, specific and actionable. Sound like an elite closer whispering in the rep's ear.
- "toneCoach.say": The exact words the rep should say next — natural, first-person, under 20 words${difficultyNote}`;

    const langReminder = langName ? ` Respond entirely in ${langName}.` : '';
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Give feedback on the rep's response.${langReminder}` }],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.6,
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
