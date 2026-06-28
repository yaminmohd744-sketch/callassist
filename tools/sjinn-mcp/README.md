# SJinn MCP server

Wraps the [SJinn.ai](https://sjinn.ai) generation API so Claude Code can produce
Pitchr marketing content (images + video) end-to-end.

## Tools exposed

| Tool | Model | Use for |
|---|---|---|
| `sjinn_text_to_video` | Kling 3.0 | Cheap, high-volume short clips (200 cr/s std) |
| `sjinn_image_to_video` | Kling 3.0 | Animate a still (image-first, brand-consistent workflow) |
| `sjinn_premium_video` | Sora2 | Hero/launch clips where quality matters (420 cr std) |
| `sjinn_generate_image` | GPT-Image-2 | Stills, or the starting frame for image-to-video (100 cr) |
| `sjinn_get_task` | — | Poll a task and fetch the finished file URL(s) |

Generation is asynchronous: a generation tool returns a `task_id` immediately;
`sjinn_get_task` polls until the file is ready (videos take ~2–8 min).

## Setup

1. **Get an API key** — log in at <https://sjinn.ai/account/api-token> and generate one.
2. **Expose it to the MCP server** as the `SJINN_API_KEY` environment variable.
   The committed [`.mcp.json`](../../.mcp.json) reads `${SJINN_API_KEY}` from the
   environment, so the key never lives in a tracked file. Export it before
   launching Claude Code:

   ```sh
   export SJINN_API_KEY="sk-..."
   ```

   (or add that line to your shell profile / a local untracked env file.)
3. **Restart Claude Code** so it picks up `.mcp.json`, then approve the `sjinn`
   server when prompted.

## Credit costs (reference)

SJinn credits are ~$0.0005–0.0006 each depending on plan tier.

- Kling 3.0 video: `duration × 200` credits (standard), `× 300` (pro)
- Sora2 video: 420 credits (std), 2100 (pro)
- GPT-Image-2: 100 credits per image

## Notes

- Output URLs from `sjinn_get_task` are **temporary** — download the file to keep it.
- Default aspect ratio is `9:16` (TikTok/Reels/Shorts), tuned for Pitchr social ads.
