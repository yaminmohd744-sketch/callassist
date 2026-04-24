import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const TONE_OPTIONS = [
  "Skeptical", "Curious", "Defensive", "Warm",
  "Disengaged", "Frustrated", "Excited", "Hesitant", "Neutral",
];

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
    const { audio, mimeType, prospectName, callGoal, yourPitch } = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ error: "No audio provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (audio.length > 2_000_000) {
      return new Response(JSON.stringify({ error: "Audio clip too large (max ~10s)" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Derive a clean format string for the OpenAI API
    // mimeType examples: "audio/webm;codecs=opus", "audio/webm", "audio/ogg"
    const rawMime = (mimeType ?? "audio/webm").split(";")[0].trim();
    const formatMap: Record<string, string> = {
      "audio/webm": "webm",
      "audio/ogg":  "ogg",
      "audio/mp4":  "mp4",
      "audio/mpeg": "mp3",
      "audio/wav":  "wav",
    };
    const audioFormat = formatMap[rawMime] ?? "webm";

    const contextNote = [
      prospectName ? `Prospect name: ${prospectName}` : "",
      callGoal     ? `Call goal: ${callGoal}`         : "",
      yourPitch    ? `Rep is selling: ${yourPitch}`    : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are an elite sales coach with 15+ years closing high-ticket deals. You are listening to a short audio clip of a prospect during a live sales call.

Your job: analyze the prospect's voice — their tone, energy, hesitation, confidence, and emotional state — and give the sales rep one sharp, tactical coaching cue they can execute in the next 10 seconds.

Tone options (pick the single best fit): ${TONE_OPTIONS.join(", ")}.

Rules:
- MOVE: 1 sentence. Tell the rep exactly what to DO tactically. Be specific, not generic.
- SAY: The exact words the rep should say next. Natural, under 20 words, in first person. No fluff.
- Sound like the best closer in the room is whispering in the rep's ear.
- Never say "build rapport" or "be empathetic" — those are useless. Give real moves.

${contextNote ? `Context:\n${contextNote}` : ""}

Respond ONLY with valid JSON:
{
  "tone": string,
  "move": string,
  "say": string
}`;

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    // Call GPT-4o audio-preview with the actual audio
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-audio-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: audio,
                  format: audioFormat,
                },
              },
              {
                type: "text",
                text: "Analyze this prospect's tone and give me the coaching cue as JSON.",
              },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message ?? JSON.stringify(data.error)}`);
    }

    const rawContent: string = data.choices?.[0]?.message?.content ?? "{}";

    // Strip markdown code fences if present
    const jsonStr = rawContent.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();

    let result: { tone?: string; move?: string; say?: string };
    try {
      result = JSON.parse(jsonStr);
    } catch {
      result = { tone: "Neutral", move: "Listen carefully and stay patient.", say: "Tell me more about that." };
    }

    // Validate tone is one of our accepted values
    if (!result.tone || !TONE_OPTIONS.includes(result.tone)) {
      result.tone = "Neutral";
    }

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("analyze-tone error:", err);
    return new Response(
      JSON.stringify({ error: String(err), tone: "Neutral", move: null, say: null }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
