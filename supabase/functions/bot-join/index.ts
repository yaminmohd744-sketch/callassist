import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Add RECALL_API_KEY to your Supabase project secrets:
// npx supabase secrets set RECALL_API_KEY=your_key_here
const RECALL_API_KEY = Deno.env.get("RECALL_API_KEY")!;
const RECALL_BASE    = "https://us-east-1.recall.ai/api/v1";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  ).auth.getUser(jwt);

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // GET ?botId=... → poll bot status
  if (req.method === "GET") {
    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");
    if (!botId) {
      return new Response(JSON.stringify({ error: "botId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const res = await fetch(`${RECALL_BASE}/bot/${botId}/`, {
      headers: { Authorization: `Token ${RECALL_API_KEY}` },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Recall returned ${res.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const data = await res.json() as Record<string, unknown>;
    const statusCode = (data.status_changes as Array<{ code: string }> | undefined)?.at(-1)?.code ?? "unknown";

    const statusMap: Record<string, string> = {
      joining_call: "joining",
      in_call_not_recording: "in-call",
      in_call_recording: "in-call",
      call_ended: "done",
      done: "done",
      fatal: "error",
    };

    return new Response(JSON.stringify({
      botId,
      status: statusMap[statusCode] ?? "joining",
    }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // POST → create bot and join meeting
  try {
    const { meetingUrl, meetingId, botName } = await req.json() as {
      meetingUrl: string;
      meetingId: string;
      botName?: string;
    };

    if (!meetingUrl || !meetingId) {
      return new Response(JSON.stringify({ error: "meetingUrl and meetingId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (!RECALL_API_KEY) throw new Error("RECALL_API_KEY not configured");

    const recallRes = await fetch(`${RECALL_BASE}/bot/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${RECALL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: botName ?? "Pitch Plus",
        transcription_options: { provider: "default" },
        real_time_transcription: {
          partial_results: true,
          // Webhook URL for receiving transcript events in real time
          // Set this to your Supabase function URL or a webhook endpoint
          destination_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/recall-transcript`,
        },
        recording_mode: "audio_only",
        chat: { on_bot_join: { send_to: "everyone", message: "Pitch Plus AI is joining this call." } },
        automatic_leave: { waiting_room_timeout: 1200 },
        metadata: { meetingId, userId: user.id },
      }),
    });

    if (!recallRes.ok) {
      const errText = await recallRes.text();
      throw new Error(`Recall API error ${recallRes.status}: ${errText}`);
    }

    const bot = await recallRes.json() as { id: string };

    // Update meeting status in the database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabaseAdmin
      .from("meetings")
      .update({ status: "in-progress", recall_bot_id: bot.id })
      .eq("id", meetingId)
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ botId: bot.id }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("bot-join error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
