#!/usr/bin/env node
// SJinn MCP server — exposes a curated set of SJinn.ai generation models as
// MCP tools so Claude Code can produce Pitchr marketing content end-to-end.
//
// Auth: reads SJINN_API_KEY from the environment (never hard-code it).
// Generate a key while logged in at https://sjinn.ai/account/api-token
//
// API shape (https://sjinn.ai/docs/api):
//   POST /create_tool_task        { tool_type, input } -> { success, data: { task_id } }
//   POST /query_tool_task_status  { task_id }          -> { success, data: { status, output_urls } }
//   status: 0 = processing, 1 = completed, -1 = failed
//
// Video generation takes minutes, so the generation tools return a task_id
// immediately and `sjinn_get_task` is used to poll for the finished file.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://sjinn.ai/api/un-api";
const API_KEY = process.env.SJINN_API_KEY;

function ok(text) {
  return { content: [{ type: "text", text }] };
}
function fail(text) {
  return { content: [{ type: "text", text }], isError: true };
}

async function sjinnPost(path, body) {
  if (!API_KEY) {
    throw new Error(
      "SJINN_API_KEY is not set. Generate a key at https://sjinn.ai/account/api-token and expose it to this MCP server (see tools/sjinn-mcp/README.md).",
    );
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`SJinn returned non-JSON (HTTP ${res.status}).`);
  }
  if (!res.ok || data?.success === false) {
    const msg =
      data?.errorMsg || data?.error || data?.message || `HTTP ${res.status}`;
    const code = data?.error_code ? ` (code ${data.error_code})` : "";
    throw new Error(`SJinn API error: ${msg}${code}`);
  }
  return data.data ?? data;
}

// Submit a generation job and return a uniform "task created" message.
async function createTask(toolType, input, costNote) {
  const data = await sjinnPost("/create_tool_task", {
    tool_type: toolType,
    input,
  });
  const taskId = data?.task_id;
  if (!taskId) throw new Error("SJinn did not return a task_id.");
  return ok(
    [
      `Task submitted (${toolType}).`,
      `task_id: ${taskId}`,
      costNote ? `Estimated cost: ${costNote}` : null,
      `Poll with sjinn_get_task using this task_id until status is "completed".`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

const server = new McpServer({ name: "sjinn", version: "1.0.0" });

// ── Kling 3.0 — text to video (cheap workhorse) ──────────────────────────────
server.tool(
  "sjinn_text_to_video",
  "Generate a video from a text prompt using Kling 3.0 (SJinn). Cheap workhorse for high-volume short clips. Returns a task_id — poll sjinn_get_task for the result. Cost: duration x 200 credits (standard) or x 300 (pro).",
  {
    prompt: z.string().describe("Text description of the video to generate"),
    duration: z
      .number()
      .min(3)
      .max(15)
      .default(5)
      .describe("Duration in seconds (3-15)"),
    aspect_ratio: z
      .enum(["16:9", "9:16", "1:1"])
      .default("9:16")
      .describe("Aspect ratio (9:16 for TikTok/Reels/Shorts)"),
    model_mode: z
      .enum(["standard", "pro"])
      .default("standard")
      .describe("standard = 200 credits/s, pro = 300 credits/s"),
    multi_shot: z
      .boolean()
      .default(true)
      .describe("Enable multi-shot mode for more dynamic composition"),
  },
  async ({ prompt, duration, aspect_ratio, model_mode, multi_shot }) => {
    try {
      const perSec = model_mode === "pro" ? 300 : 200;
      return await createTask(
        "kling3-text-to-video-api",
        { prompt, duration, aspect_ratio, model_mode, multi_shot },
        `${duration * perSec} credits`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── Kling 3.0 — image to video (animate a still) ─────────────────────────────
server.tool(
  "sjinn_image_to_video",
  "Animate a source image into a video using Kling 3.0 (SJinn). Use after sjinn_generate_image for a brand-consistent, image-first workflow. The prompt should describe motion, not image content. Returns a task_id — poll sjinn_get_task.",
  {
    image: z
      .string()
      .url()
      .describe("HTTP/HTTPS URL of the source image (the starting frame)"),
    prompt: z
      .string()
      .describe("Describe the motion/movement, not the image content"),
    duration: z.number().min(3).max(15).default(5).describe("Seconds (3-15)"),
    model_mode: z.enum(["standard", "pro"]).default("standard"),
    multi_shot: z.boolean().default(true),
    tail_image_url: z
      .string()
      .url()
      .optional()
      .describe("Optional ending frame for a controlled transition"),
  },
  async (args) => {
    try {
      const perSec = args.model_mode === "pro" ? 300 : 200;
      const input = {
        image: args.image,
        prompt: args.prompt,
        duration: args.duration,
        model_mode: args.model_mode,
        multi_shot: args.multi_shot,
      };
      if (args.tail_image_url) input.tail_image_url = args.tail_image_url;
      return await createTask(
        "kling3-image-to-video-api",
        input,
        `${args.duration * perSec} credits`,
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── Sora2 — premium text to video (hero clips) ───────────────────────────────
server.tool(
  "sjinn_premium_video",
  "Generate a premium video from a text prompt using Sora2 (SJinn). Use for hero/launch clips where quality matters most. More expensive than Kling. Returns a task_id — poll sjinn_get_task. Cost: 420 credits (std) or 2100 (pro) per task.",
  {
    prompt: z.string().describe("Text description of the video to generate"),
    aspect_ratio: z.enum(["16:9", "9:16"]).default("9:16"),
    duration: z
      .number()
      .refine((d) => d === 10 || d === 15, "duration must be 10 or 15")
      .default(10)
      .describe("Duration in seconds (10 or 15 only)"),
    mode: z
      .enum(["std", "pro"])
      .default("std")
      .describe("std = 420 credits, pro = 2100 credits"),
  },
  async ({ prompt, aspect_ratio, duration, mode }) => {
    try {
      return await createTask(
        "sora2-text-to-video-api",
        { prompt, aspect_ratio, duration, mode },
        mode === "pro" ? "2100 credits" : "420 credits",
      );
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── GPT-Image-2 — stills and image editing ───────────────────────────────────
server.tool(
  "sjinn_generate_image",
  "Generate a still image (or edit reference images) using GPT-Image-2 (SJinn). Use for standalone graphics or to create the starting frame for sjinn_image_to_video. Returns a task_id — poll sjinn_get_task. Cost: 100 credits.",
  {
    prompt: z.string().describe("Text description of the image to generate"),
    aspect_ratio: z
      .enum(["auto", "1:1", "16:9", "9:16", "3:2", "2:3"])
      .default("9:16"),
    resolution: z.enum(["1K", "2K", "4K"]).default("2K"),
    image_list: z
      .array(z.string().url())
      .optional()
      .describe("Optional reference image URLs for editing/compositing"),
  },
  async ({ prompt, aspect_ratio, resolution, image_list }) => {
    try {
      const input = { prompt, aspect_ratio, resolution };
      if (image_list && image_list.length) input.image_list = image_list;
      return await createTask("gpt-image-2-api", input, "100 credits");
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

// ── Poll a task for its result ───────────────────────────────────────────────
server.tool(
  "sjinn_get_task",
  "Check the status of a SJinn generation task and retrieve the result URL(s) when complete. Poll every 10-15s for video, 5-10s for images. status: 0 = processing, 1 = completed, -1 = failed.",
  {
    task_id: z.string().describe("task_id returned from a generation tool"),
  },
  async ({ task_id }) => {
    try {
      const data = await sjinnPost("/query_tool_task_status", { task_id });
      const status = data?.status;
      if (status === 1) {
        const urls = data?.output_urls ?? [];
        return ok(
          urls.length
            ? `Completed. Output URL(s):\n${urls.join("\n")}\n\nNote: SJinn URLs are temporary — download the file to keep it.`
            : "Completed, but no output_urls were returned.",
        );
      }
      if (status === -1)
        return fail(`Task failed: ${data?.errorMsg || data?.error || "no detail provided"}`);
      return ok(`Still processing (status ${status}). Poll again shortly.`);
    } catch (e) {
      return fail(String(e.message || e));
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
