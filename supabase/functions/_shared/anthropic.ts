// Shared Anthropic (Claude) Messages API helper for all Pitchr edge functions.
//
// Requires the ANTHROPIC_API_KEY Supabase secret:
//   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
//
// Notes on parameters we deliberately omit:
//   - `temperature` is removed on Opus 4.8/4.7; we omit it everywhere for uniformity.
//   - `thinking` is opt-in; we leave it off so live coaching stays low-latency.
//   - `effort` errors on Haiku 4.5; we leave it off (Sonnet defaults to high).
const ANTHROPIC_API_KEY  = Deno.env.get("ANTHROPIC_API_KEY")!;
const ANTHROPIC_URL      = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION  = "2023-06-01";

// Model assignment by job (see upgrade plan Phase 1).
export const MODELS = {
  /** Real-time live coaching — latency-critical. */
  live: "claude-haiku-4-5",
  /** Fast classifiers / helpers / training sim. */
  fast: "claude-haiku-4-5",
  /** Deep post-call reasoning (summaries, battle cards, scorecards). */
  deep: "claude-sonnet-4-6",
} as const;

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicCallOpts {
  system: string;
  messages: AnthropicMessage[];
  model: string;
  maxTokens: number;
}

function headers(): HeadersInit {
  return {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": ANTHROPIC_VERSION,
    "Content-Type": "application/json",
  };
}

function body(opts: AnthropicCallOpts, stream: boolean): string {
  return JSON.stringify({
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: opts.system,
    messages: opts.messages,
    ...(stream ? { stream: true } : {}),
  });
}

/**
 * Non-streaming Messages call. Returns the concatenated text content.
 * Throws if the key is missing or the API returns a non-2xx status.
 */
export async function anthropicText(opts: AnthropicCallOpts): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  const res = await fetch(ANTHROPIC_URL, { method: "POST", headers: headers(), body: body(opts, false) });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic returned ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json() as { content?: Array<{ type: string; text?: string }> };
  return Array.isArray(data.content)
    ? data.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("")
    : "";
}

/**
 * Parse JSON from a model text response that may be wrapped in ```json fences
 * or have surrounding prose. Falls back to a first-`{`/last-`}` bracket scan.
 * Replaces OpenAI's `response_format: json_object` guarantee.
 */
export function parseJsonLoose<T = Record<string, unknown>>(text: string): T {
  let s = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences.
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object in model response");
    return JSON.parse(s.slice(start, end + 1)) as T;
  }
}

/**
 * Streaming Messages call. Returns the raw fetch Response so the caller can
 * forward the Anthropic SSE body to the client (which parses content_block_delta).
 */
export async function anthropicStream(opts: AnthropicCallOpts): Promise<Response> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  return await fetch(ANTHROPIC_URL, { method: "POST", headers: headers(), body: body(opts, true) });
}
