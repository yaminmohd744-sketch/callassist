#!/usr/bin/env node
// fal.ai MCP server — exposes a curated set of fal.ai generation models as MCP
// tools so Claude Code can produce Pitchr marketing content end-to-end.
// Pay-as-you-go (prepaid balance), no subscription.
//
// Auth: reads FAL_KEY from the environment (never hard-code it).
// Generate a key at https://fal.ai/dashboard/keys and add funds to your balance.
//
// fal queue API (https://fal.ai/docs/model-apis/model-endpoints/queue):
//   Submit:  POST https://queue.fal.run/{model_id}                          -> { request_id }
//   Status:  GET  https://queue.fal.run/{model_id}/requests/{id}/status     -> { status }
//   Result:  GET  https://queue.fal.run/{model_id}/requests/{id}            -> model output
//   status values: IN_QUEUE | IN_PROGRESS | COMPLETED
//   Auth header is "Authorization: Key <FAL_KEY>" (NOT Bearer).
//
// Video generation takes minutes, so generation tools return a request_id +
// model_id immediately and `fal_get_task` polls for the finished file.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const QUEUE = "https://queue.fal.run";
const API_KEY = process.env.FAL_KEY;

function ok(text) {
  return { content: [{ type: "text", text }] };
}
function fail(text) {
  return { content: [{ type: "text", text }], isError: true };
}

function authHeaders(extra = {}) {
  if (!API_KEY) {
    throw new Error(
      "FAL_KEY is not set. Generate a key at https://fal.ai/dashboard/keys, add funds, and expose it as FAL_KEY (see tools/fal-mcp/README.md).",
    );
  }
  return { Authorization: `Key ${API_KEY}`, ...extra };
}

async function falJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`fal returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    const msg = data?.detail || data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(`fal API error: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
  }
  return data;
}

// Submit a job; return a uniform "task created" message carrying both ids
// (fal's status/result URLs need the model_id as well as the request_id).
async function submit(modelId, input, costNote) {
  const data = await falJson(`${QUEUE}/${modelId}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  });
  const reqId = data?.request_id;
  if (!reqId) throw new Error("fal did not return a request_id.");
  return ok(
    [
      `Task submitted (${modelId}).`,
      `request_id: ${reqId}`,
      `model_id: ${modelId}`,
      costNote ? `Estimated cost: ${costNote}` : null,
      `Poll with fal_get_task using BOTH request_id and model_id until status is COMPLETED.`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

// Pull the result file URL out of whatever shape the model returns.
function extractUrls(output) {
  const urls = [];
  if (output?.video?.url) urls.push(output.video.url);
  if (Array.isArray(output?.images)) {
    for (const im of output.images) if (im?.url) urls.push(im.url);
  }
  if (output?.image?.url) urls.push(output.image.url);
  if (Array.isArray(output?.video?.urls)) urls.push(...output.video.urls);
  return urls;
}

const server = new McpServer({ name: "fal", version: "1.0.0" });

// ── Kling 2.5 Turbo Pro — text to video (cheap workhorse, ~$0.07/s) ──────────
server.tool(
  "fal_text_to_video",
  "Generate a video from a text prompt using Kling 2.5 Turbo Pro (fal.ai). Cheap workhorse for high-volume short clips (~$0.07/s). Returns request_id + model_id — poll fal_get_task.",
  {
    prompt: z.string().describe("Text description of the video to generate"),
    duration: z
      .enum(["5", "10"])
      .default("5")
      .describe("Duration in seconds (5 or 10)"),
    aspect_ratio: z
      .enum(["16:9", "9:16", "1:1"])
      .default("9:16")
      .describe("Aspect ratio (9:16 for TikTok/Reels/Shorts)"),
    negative_prompt: z
      .string()
      .optional()
      .describe("Things to avoid (defaults to blur/distortion/low quality)"),
  },
  async ({ prompt, duration, aspect_ratio, negative_prompt }) => {
    try {
      const input = { prompt, duration, aspect_ratio };
      if (negative_prompt) input.negative_prompt = negative_prompt;
      return await submit(
        "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
        input,
        `~$${(Number(duration) * 0.07).toFixed(2)}`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── Kling 2.5 Turbo Pro — image to video (animate a still) ───────────────────
server.tool(
  "fal_image_to_video",
  "Animate a source image into a video using Kling 2.5 Turbo Pro (fal.ai). Use after fal_generate_image for a brand-consistent, image-first workflow. The prompt should describe motion, not image content. Returns request_id + model_id — poll fal_get_task.",
  {
    image_url: z.string().url().describe("HTTP/HTTPS URL of the source/starting image"),
    prompt: z.string().describe("Describe the motion/movement, not the image content"),
    duration: z.enum(["5", "10"]).default("5"),
    aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).default("9:16"),
    tail_image_url: z
      .string()
      .url()
      .optional()
      .describe("Optional ending frame for a controlled transition"),
  },
  async ({ image_url, prompt, duration, aspect_ratio, tail_image_url }) => {
    try {
      const input = { image_url, prompt, duration, aspect_ratio };
      if (tail_image_url) input.tail_image_url = tail_image_url;
      return await submit(
        "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
        input,
        `~$${(Number(duration) * 0.07).toFixed(2)}`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── Veo 3 — premium text to video with native audio (~$0.40/s) ───────────────
server.tool(
  "fal_premium_video",
  "Generate a premium video from a text prompt using Google Veo 3 (fal.ai), with native audio. Use for hero/launch clips where quality matters most. Expensive (~$0.40/s). Returns request_id + model_id — poll fal_get_task.",
  {
    prompt: z.string().describe("Text description of the video to generate"),
    aspect_ratio: z.enum(["16:9", "9:16"]).default("9:16"),
    duration: z
      .enum(["4s", "6s", "8s"])
      .default("8s")
      .describe("Duration (4s, 6s, or 8s)"),
    resolution: z.enum(["720p", "1080p"]).default("720p"),
    generate_audio: z
      .boolean()
      .default(true)
      .describe("Generate a native audio track"),
  },
  async ({ prompt, aspect_ratio, duration, resolution, generate_audio }) => {
    try {
      const secs = Number(duration.replace("s", ""));
      return await submit(
        "fal-ai/veo3",
        { prompt, aspect_ratio, duration, resolution, generate_audio },
        `~$${(secs * 0.4).toFixed(2)}`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── FLUX.1 [dev] — stills (~$0.03/image) ─────────────────────────────────────
server.tool(
  "fal_generate_image",
  "Generate a still image using FLUX.1 [dev] (fal.ai). Use for standalone graphics or to create the starting frame for fal_image_to_video. Cheap (~$0.03/image). Returns request_id + model_id — poll fal_get_task.",
  {
    prompt: z.string().describe("Text description of the image to generate"),
    image_size: z
      .enum([
        "square_hd",
        "square",
        "portrait_4_3",
        "portrait_16_9",
        "landscape_4_3",
        "landscape_16_9",
      ])
      .default("portrait_16_9")
      .describe("Image dimensions (portrait_16_9 ≈ vertical 9:16 for social)"),
    num_images: z.number().int().min(1).max(4).default(1),
  },
  async ({ prompt, image_size, num_images }) => {
    try {
      return await submit(
        "fal-ai/flux/dev",
        { prompt, image_size, num_images },
        `~$${(0.03 * num_images).toFixed(2)}`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── Poll a task for its result ───────────────────────────────────────────────
server.tool(
  "fal_get_task",
  "Check the status of a fal.ai generation task and retrieve the result URL(s) when complete. Requires BOTH request_id and model_id (from the generation tool). Poll every 10-15s for video, 5-10s for images.",
  {
    request_id: z.string().describe("request_id returned from a generation tool"),
    model_id: z
      .string()
      .describe("model_id returned from a generation tool (e.g. fal-ai/veo3)"),
  },
  async ({ request_id, model_id }) => {
    try {
      const status = await falJson(
        `${QUEUE}/${model_id}/requests/${request_id}/status`,
        { headers: authHeaders() },
      );
      if (status?.status !== "COMPLETED") {
        return ok(`Still processing (status ${status?.status ?? "unknown"}). Poll again shortly.`);
      }
      const result = await falJson(`${QUEUE}/${model_id}/requests/${request_id}`, {
        headers: authHeaders(),
      });
      const urls = extractUrls(result);
      return ok(
        urls.length
          ? `Completed. Output URL(s):\n${urls.join("\n")}\n\nNote: fal URLs are temporary — download the file to keep it.`
          : `Completed, but no recognizable file URL was found. Raw output:\n${JSON.stringify(result).slice(0, 800)}`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
