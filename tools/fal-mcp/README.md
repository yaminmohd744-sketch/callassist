# fal.ai MCP server

Wraps the [fal.ai](https://fal.ai) generation API so Claude Code can produce
Pitchr marketing content (images + video) end-to-end. **Pay-as-you-go** — add
funds to a prepaid balance, no subscription.

## Tools exposed

| Tool | Model | Use for | Cost |
|---|---|---|---|
| `fal_text_to_video` | Kling 2.5 Turbo Pro | Cheap, high-volume short clips | ~$0.07/s |
| `fal_image_to_video` | Kling 2.5 Turbo Pro | Animate a still (image-first workflow) | ~$0.07/s |
| `fal_premium_video` | Google Veo 3 | Hero/launch clips, native audio | ~$0.40/s |
| `fal_generate_image` | FLUX.1 [dev] | Stills, or starting frame for image-to-video | ~$0.03 |
| `fal_get_task` | — | Poll a task; fetch the finished file URL(s) | — |

Generation is asynchronous: a generation tool returns a `request_id` + `model_id`
immediately; `fal_get_task` polls until the file is ready (videos take ~2–8 min).
You need **both** the `request_id` and `model_id` to poll.

## Setup

1. **Get an API key** — <https://fal.ai/dashboard/keys>.
2. **Add funds** to your balance (a few dollars is plenty to start). No subscription.
3. **Expose the key** as the `FAL_KEY` environment variable. The committed
   [`.mcp.json`](../../.mcp.json) reads `${FAL_KEY}` from the environment, so the
   key never lives in a tracked file:

   ```sh
   export FAL_KEY="..."
   ```

4. **Restart Claude Code** so it picks up `.mcp.json`, then approve the `fal`
   server when prompted.

## Reference prices (per fal.ai)

- Kling 2.5 Turbo Pro: **$0.07/s** → 5s ≈ $0.35, 10s ≈ $0.70
- Veo 3: **$0.40/s** → 8s ≈ $3.20 (premium, with audio)
- FLUX.1 [dev]: **~$0.03/image**

## Notes

- Output URLs from `fal_get_task` are **temporary** — download the file to keep it.
- Default aspect ratio is `9:16` (TikTok/Reels/Shorts), tuned for Pitchr social ads.
- fal has 600+ models; this server curates a focused lineup. To add a model,
  copy one of the tool blocks in `server.mjs` and swap the model id + inputs.
