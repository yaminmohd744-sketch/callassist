import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Creates a Recall.ai Desktop SDK upload token with real-time transcription.
// The Desktop SDK records locally (no bot joins the meeting) and streams
// transcript chunks back to the app via the desktop_sdk_callback endpoint.
//
// Required Supabase secret:
//   npx supabase secrets set RECALL_API_KEY=your_key_here
// Optional (defaults to us-west-2):
//   npx supabase secrets set RECALL_REGION=us-west-2
const RECALL_API_KEY = Deno.env.get("RECALL_API_KEY")!;
const RECALL_REGION  = Deno.env.get("RECALL_REGION") ?? "us-west-2";
const RECALL_BASE    = `https://${RECALL_REGION}.recall.ai/api/v1`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  // Authenticate the Supabase user (same pattern as bot-join).
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  ).auth.getUser(jwt);

  if (!user) return respond({ error: "Unauthorized" }, 401);

  if (!RECALL_API_KEY) {
    return respond({ error: "RECALL_API_KEY not configured on the server." }, 500);
  }

  // Parse optional language hint from the client.
  let body: { language?: unknown } = {};
  try { body = await req.json(); } catch { /* body optional */ }
  const language = typeof body.language === "string" ? body.language : "en";

  // Create the SDK upload with real-time transcription streamed back to the
  // desktop app. AssemblyAI v3 streaming is Recall's recommended realtime provider.
  const res = await fetch(`${RECALL_BASE}/sdk_upload/`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${RECALL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recording_config: {
        transcript: {
          provider: { assembly_ai_v3_streaming: { language } },
        },
        realtime_endpoints: [
          {
            type: "desktop_sdk_callback",
            events: ["transcript.data", "transcript.partial_data"],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Recall sdk_upload failed:", res.status, detail);
    return respond({ error: `Recall returned ${res.status}` }, 502);
  }

  const data = await res.json() as { id?: string; upload_token?: string };
  return respond({ uploadToken: data.upload_token, uploadId: data.id });
});
