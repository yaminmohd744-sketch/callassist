// Pitchr Reddit monitor — finds relevant posts and alerts you. Never posts.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchNewPosts, fetchNewComments, type RedditPost } from "./reddit.ts";
import { scorePosts } from "./filter.ts";
import { printMatches, sendSlack } from "./notify.ts";
import { loadSeen, saveSeen } from "./store.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface Config {
  subreddits: string[];
  keywords: string[];
  pollIntervalMinutes: number;
  lookbackHours: number;
  maxPostsPerSubreddit: number;
  scanComments: boolean;
  minRelevanceScore: number;
  useAiFilter: boolean;
}

// Tiny .env loader (no dependency). Lines like KEY=value; ignores # comments.
async function loadEnv(): Promise<void> {
  try {
    const raw = await readFile(join(ROOT, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
        val = val.slice(1, -1);
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // no .env file — that's fine if vars are set in the environment
  }
}

async function loadConfig(): Promise<Config> {
  const raw = await readFile(join(ROOT, "config.json"), "utf8");
  return JSON.parse(raw) as Config;
}

async function runOnce(cfg: Config): Promise<void> {
  const seen = await loadSeen();
  const cutoff = Date.now() / 1000 - cfg.lookbackHours * 3600;
  const fresh: RedditPost[] = [];

  for (const sub of cfg.subreddits) {
    try {
      const posts = await fetchNewPosts(sub, cfg.maxPostsPerSubreddit);
      let items = posts;
      if (cfg.scanComments) {
        const comments = await fetchNewComments(sub, cfg.maxPostsPerSubreddit);
        items = items.concat(comments);
      }
      for (const p of items) {
        if (p.createdUtc < cutoff) continue;
        if (seen.has(p.id)) continue;
        fresh.push(p);
      }
    } catch (err) {
      console.error(`r/${sub}: ${(err as Error).message}`);
    }
  }

  const scored = await scorePosts(
    fresh,
    cfg.keywords,
    cfg.minRelevanceScore,
    cfg.useAiFilter
  );

  printMatches(scored);
  await sendSlack(scored);

  // Mark everything we examined as seen (even non-matches) so we don't re-score.
  for (const p of fresh) seen.add(p.id);
  await saveSeen(seen);
}

async function main(): Promise<void> {
  await loadEnv();
  const cfg = await loadConfig();
  const loop = process.argv.includes("--loop");

  console.log(
    `Pitchr Reddit monitor — ${cfg.subreddits.length} subreddits, ${cfg.keywords.length} keywords${
      cfg.useAiFilter ? ", AI filter ON" : ""
    }${loop ? `, looping every ${cfg.pollIntervalMinutes}m` : " (single run)"}`
  );

  await runOnce(cfg);

  if (loop) {
    const ms = cfg.pollIntervalMinutes * 60_000;
    setInterval(() => {
      runOnce(cfg).catch((e) => console.error(e));
    }, ms);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
