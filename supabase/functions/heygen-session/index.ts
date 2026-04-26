import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Add to Supabase secrets: npx supabase secrets set HEYGEN_API_KEY=your_key_here
const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY")!;
const HEYGEN_BASE    = "https://api.heygen.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Auth check
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

  if (!HEYGEN_API_KEY) {
    return new Response(JSON.stringify({ error: "HEYGEN_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  try {
    const body = await req.json() as {
      action: "create" | "start" | "speak" | "stop";
      sessionId?: string;
      avatarId?: string;
      voiceId?: string;
      sdpAnswer?: string;
      text?: string;
    };
    const { action, sessionId, avatarId, voiceId, text, sdpAnswer } = body;

    if (action === "create") {
      const res = await fetch(`${HEYGEN_BASE}/v1/streaming.new`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": HEYGEN_API_KEY },
        body: JSON.stringify({
          avatar_id: avatarId ?? "Wayne_20240711",
          voice: { voice_id: voiceId ?? "2d5b0e6cf36f460aa7fc47e3eee4ba54" },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`HeyGen create failed: ${JSON.stringify(json)}`);
      return new Response(JSON.stringify(json), {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (action === "start") {
      if (!sessionId || !sdpAnswer) throw new Error("sessionId and sdpAnswer required");
      const res = await fetch(`${HEYGEN_BASE}/v1/streaming.start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": HEYGEN_API_KEY },
        body: JSON.stringify({ session_id: sessionId, sdp: { type: "answer", sdp: sdpAnswer } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`HeyGen start failed: ${JSON.stringify(json)}`);
      return new Response(JSON.stringify(json), {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (action === "speak") {
      if (!sessionId || !text) throw new Error("sessionId and text required");
      const res = await fetch(`${HEYGEN_BASE}/v1/streaming.task`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": HEYGEN_API_KEY },
        body: JSON.stringify({ session_id: sessionId, text, task_type: "talk" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`HeyGen speak failed: ${JSON.stringify(json)}`);
      return new Response(JSON.stringify(json), {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    if (action === "stop") {
      if (!sessionId) throw new Error("sessionId required");
      const res = await fetch(`${HEYGEN_BASE}/v1/streaming.stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": HEYGEN_API_KEY },
        body: JSON.stringify({ session_id: sessionId }),
      });
      return new Response(JSON.stringify({ ok: res.ok }), {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });

  } catch (err) {
    console.error("heygen-session error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
