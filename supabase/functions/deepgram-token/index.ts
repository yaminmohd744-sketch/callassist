import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY")!;
const DEEPGRAM_PROJECT_ID = Deno.env.get("DEEPGRAM_PROJECT_ID")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Require a valid Authorization header so the key isn't handed to anonymous callers.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!DEEPGRAM_API_KEY || !DEEPGRAM_PROJECT_ID) {
    return new Response(JSON.stringify({ error: "Deepgram not configured" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    // Create a short-lived Deepgram key (60 seconds TTL) scoped to usage only.
    const dgRes = await fetch(
      `https://api.deepgram.com/v1/projects/${DEEPGRAM_PROJECT_ID}/keys`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: "callassist-temp",
          scopes: ["usage:write"],
          time_to_live_in_seconds: 60,
        }),
      }
    );

    if (!dgRes.ok) {
      const text = await dgRes.text();
      throw new Error(`Deepgram API error ${dgRes.status}: ${text}`);
    }

    const data = await dgRes.json() as { key: string };

    return new Response(JSON.stringify({ key: data.key }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("deepgram-token error:", err);
    return new Response(JSON.stringify({ error: "Failed to create Deepgram token" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
