// Local web dashboard for the Pitchr Reddit monitor.
// Serves a browser UI at http://localhost:4000 — still read-only; replies happen
// on Reddit itself via the "Open on Reddit" button.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchNewPosts } from "./reddit.ts";
import { scorePosts, type ScoredPost } from "./filter.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = Number(process.env.PORT) || 4000;

interface Config {
  subreddits: string[];
  subredditDescriptions?: Record<string, string>;
  keywords: string[];
  lookbackHours: number;
  maxPostsPerSubreddit: number;
  minRelevanceScore: number;
  useAiFilter: boolean;
}

async function loadEnv(): Promise<void> {
  try {
    const raw = await readFile(join(ROOT, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* no .env — fine */
  }
}

async function loadConfig(): Promise<Config> {
  return JSON.parse(await readFile(join(ROOT, "config.json"), "utf8")) as Config;
}

// Scan and return the relevant posts in the lookback window (no dedup — a
// dashboard should always show the current relevant set, not just new ones).
async function scan(
  cfg: Config
): Promise<(ScoredPost & { subDescription: string })[]> {
  const posts = await fetchNewPosts(cfg.subreddits, cfg.maxPostsPerSubreddit);
  const cutoff = Date.now() / 1000 - cfg.lookbackHours * 3600;
  const fresh = posts.filter((p) => p.createdUtc >= cutoff);
  const scored = await scorePosts(
    fresh,
    cfg.keywords,
    cfg.minRelevanceScore,
    cfg.useAiFilter
  );
  // Attach a one-line description of the subreddit (case-insensitive match).
  const descByLower = new Map(
    Object.entries(cfg.subredditDescriptions ?? {}).map(([k, v]) => [
      k.toLowerCase(),
      v,
    ])
  );
  return scored.map((p) => ({
    ...p,
    subDescription: descByLower.get(p.subreddit.toLowerCase()) ?? "",
  }));
}

const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Pitchr · Reddit Monitor</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #0a0a0a; color: #ededed;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  header {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 14px 20px;
    background: rgba(10,10,10,0.85); backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .brand { font-weight: 800; letter-spacing: 0.04em; font-size: 15px; }
  .brand span { color: #888; font-weight: 600; }
  .meta { color: #888; font-size: 12px; }
  button {
    font: inherit; font-weight: 600; cursor: pointer;
    background: #ededed; color: #0a0a0a; border: 0;
    border-radius: 6px; padding: 8px 14px;
  }
  button:disabled { opacity: 0.5; cursor: default; }
  main { max-width: 820px; margin: 0 auto; padding: 20px; }
  .empty { color: #888; text-align: center; padding: 60px 0; }
  .card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;
  }
  .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .score {
    flex-shrink: 0; min-width: 26px; height: 26px; padding: 0 8px;
    display: inline-flex; align-items: center; justify-content: center;
    background: #16331f; color: #4ade80; border-radius: 6px;
    font-weight: 800; font-size: 13px;
  }
  .sub { color: #ededed; font-weight: 700; }
  .dot { color: #555; }
  .sub-desc { color: #777; font-size: 12px; font-style: italic; margin: -2px 0 8px; }
  .card-title { font-size: 16px; font-weight: 700; margin: 2px 0 8px; }
  .card-body { color: #b5b5b5; font-size: 13px; margin-bottom: 10px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .chip { font-size: 11px; color: #aaa; background: rgba(255,255,255,0.06);
    border-radius: 999px; padding: 2px 9px; }
  .reply {
    display: inline-flex; align-items: center; gap: 6px;
    text-decoration: none; background: #ff4500; color: #fff;
    font-weight: 700; font-size: 13px; border-radius: 6px; padding: 8px 14px;
  }
  .reply:hover { background: #e03d00; }
  .spin { color: #888; text-align: center; padding: 40px 0; }
</style>
</head>
<body>
  <header>
    <div class="brand">PITCHR <span>· reddit monitor</span></div>
    <div style="display:flex; align-items:center; gap:14px;">
      <span class="meta" id="meta"></span>
      <button id="refresh">Refresh</button>
    </div>
  </header>
  <main id="list"><div class="spin">Loading…</div></main>
<script>
  const list = document.getElementById('list');
  const meta = document.getElementById('meta');
  const btn = document.getElementById('refresh');

  function ago(ts) {
    const m = Math.round((Date.now()/1000 - ts) / 60);
    if (m < 60) return m + 'm ago';
    const h = Math.round(m/60);
    return h < 24 ? h + 'h ago' : Math.round(h/24) + 'd ago';
  }
  function esc(s){ return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function render(posts, notice) {
    const banner = notice ? '<div class="empty" style="padding:14px 0;color:#e0a000">' + esc(notice) + '</div>' : '';
    if (!posts.length) { list.innerHTML = banner || '<div class="empty">No relevant posts right now. Try Refresh in a bit.</div>'; return; }
    list.innerHTML = banner + posts.map(p => \`
      <div class="card">
        <div class="card-top">
          <span class="score">\${p.score}</span>
          <span class="sub">r/\${esc(p.subreddit)}</span>
          <span class="dot">·</span><span class="meta">\${ago(p.createdUtc)}</span>
          <span class="dot">·</span><span class="meta">u/\${esc(p.author)}</span>
        </div>
        \${p.subDescription ? '<div class="sub-desc">' + esc(p.subDescription) + '</div>' : ''}
        <div class="card-title">\${esc(p.title)}</div>
        \${p.body ? '<div class="card-body">' + esc(p.body) + '</div>' : ''}
        <div class="chips">\${p.matchedKeywords.map(k => '<span class="chip">'+esc(k)+'</span>').join('')}</div>
        <a class="reply" href="\${p.url}" target="_blank" rel="noopener">Open on Reddit ↗</a>
      </div>\`).join('');
  }

  async function load() {
    btn.disabled = true; list.innerHTML = '<div class="spin">Scanning Reddit…</div>';
    try {
      const r = await fetch('/api/posts');
      const data = await r.json();
      render(data.posts, data.notice);
      const when = data.scannedAt ? new Date(data.scannedAt).toLocaleTimeString() : '';
      meta.textContent = data.posts.length + ' posts' + (when ? ' · ' + when : '') + (data.stale ? ' · stale' : '');
    } catch (e) {
      list.innerHTML = '<div class="empty">Scan failed: ' + esc(String(e)) + '</div>';
    } finally { btn.disabled = false; }
  }
  btn.addEventListener('click', load);
  load();
</script>
</body>
</html>`;

async function main(): Promise<void> {
  await loadEnv();
  const cfg = await loadConfig();

  // Cache the last successful scan so frequent refreshes don't hammer Reddit
  // (which rate-limits hard) and a transient failure never shows an empty page.
  let cache: { posts: Awaited<ReturnType<typeof scan>>; at: number } | null = null;
  const MIN_RESCAN_MS = 60_000; // serve cache instead of re-scanning within this window

  const server = createServer(async (req, res) => {
    if (req.url === "/api/posts") {
      // Fresh-enough cache: serve it without touching Reddit.
      if (cache && Date.now() - cache.at < MIN_RESCAN_MS) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ posts: cache.posts, scannedAt: cache.at, cached: true }));
        return;
      }
      try {
        const posts = await scan(cfg);
        cache = { posts, at: Date.now() };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ posts, scannedAt: cache.at }));
      } catch (err) {
        const msg = (err as Error).message;
        const rateLimited = msg.includes("429");
        // On failure, fall back to the last good results rather than an empty error.
        if (cache) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              posts: cache.posts,
              scannedAt: cache.at,
              stale: true,
              notice: rateLimited
                ? "Reddit is rate-limiting; showing last results. Try Refresh again in a minute."
                : "Scan failed; showing last results.",
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              posts: [],
              notice: rateLimited
                ? "Reddit is rate-limiting right now. Wait ~1 minute and click Refresh."
                : "Scan failed: " + msg,
            })
          );
        }
      }
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(PAGE);
  });

  server.listen(PORT, () => {
    console.log(`\n  Pitchr Reddit dashboard running:\n\n    →  http://localhost:${PORT}\n`);
    console.log("  Open that link in your browser. Ctrl+C here to stop.\n");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
