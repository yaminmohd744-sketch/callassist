import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Require a valid Authorization header so the key is only given to signed-in users.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!DEEPGRAM_API_KEY) {
    return new Response(JSON.stringify({ error: "Deepgram not configured" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ key: DEEPGRAM_API_KEY }), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
