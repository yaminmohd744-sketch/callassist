import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Zoom OAuth credentials live ONLY on the server. The client never sees the secret.
const ZOOM_CLIENT_ID     = Deno.env.get("ZOOM_CLIENT_ID")     ?? '';
const ZOOM_CLIENT_SECRET = Deno.env.get("ZOOM_CLIENT_SECRET") ?? '';

// Must match the redirect_uri used by the desktop app when starting the OAuth flow.
const ZOOM_REDIRECT_URI = "http://127.0.0.1:3456";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Verify the JWT is a real Supabase session — not just any Bearer value.
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await createClient(
    Deno.env.get("SUPABASE_URL") ?? '',
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
  ).auth.getUser(jwt);

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: "Zoom not configured" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let code = "";
  try {
    ({ code } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!code) {
    return new Response(JSON.stringify({ error: "Missing authorization code" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Exchange the authorization code for tokens using HTTP Basic auth (id:secret).
  const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);
  const body = new URLSearchParams({
    grant_type:   "authorization_code",
    code,
    redirect_uri: ZOOM_REDIRECT_URI,
  });

  const zoomRes = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type":  "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const tokenData = await zoomRes.json();

  if (!zoomRes.ok || !tokenData.access_token) {
    return new Response(
      JSON.stringify({ error: tokenData.reason || "Token exchange failed" }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ tokenData }), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
