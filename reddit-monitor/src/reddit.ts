// Reads Reddit's public RSS feeds — no API key, no app, no auth. Zero dependencies.
// Reddit gated the legacy Data API behind an approval request; RSS stays open and is
// built for exactly this (polling a subreddit for new posts).

export interface RedditPost {
  id: string; // e.g. t3_abc123
  kind: "post";
  subreddit: string;
  title: string;
  body: string;
  author: string;
  url: string; // direct link to the thread
  createdUtc: number; // seconds
}

const env = (k: string) => (process.env[k] ?? "").trim();
const userAgent = () => env("REDDIT_USER_AGENT") || "pitchr-monitor/1.0";

// Decode XML/HTML entities, including numeric ones. Run twice for double-encoded text.
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&"); // decode &amp; last so &amp;#39; -> &#39; survives one pass
}

// Reddit wraps the post body in HTML inside the <content> field. Turn it into plain text.
function htmlToText(html: string): string {
  let t = decodeEntities(html); // &lt;div&gt; -> <div>
  t = t.replace(/<[^>]+>/g, " "); // strip tags
  t = decodeEntities(t); // resolve remaining numeric entities
  t = t.replace(/submitted by[\s\S]*$/i, " "); // drop the reddit "submitted by ... [link]" footer
  return t.replace(/\s+/g, " ").trim();
}

function field(entry: string, re: RegExp): string {
  const m = entry.match(re);
  return m ? m[1] : "";
}

function parseEntries(xml: string): RedditPost[] {
  const posts: RedditPost[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml))) {
    const e = m[1];
    const id = field(e, /<id>(t3_[^<]+)<\/id>/);
    if (!id) continue;
    const published = field(e, /<published>([^<]+)<\/published>/);
    const author = field(e, /<name>([^<]+)<\/name>/).replace(/^\/u\//, "");
    posts.push({
      id,
      kind: "post",
      subreddit: field(e, /<category term="([^"]+)"/),
      title: decodeEntities(field(e, /<title>([\s\S]*?)<\/title>/)),
      body: htmlToText(field(e, /<content[^>]*>([\s\S]*?)<\/content>/)),
      author: author || "[unknown]",
      url: field(e, /<link href="([^"]+)"/),
      createdUtc: published ? Math.floor(Date.parse(published) / 1000) : 0,
    });
  }
  return posts;
}

async function fetchRss(url: string): Promise<string> {
  // Reddit throttles unauthenticated RSS hard, so retry on 429/5xx with backoff.
  let lastStatus = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, attempt * 4000));
    const res = await fetch(url, {
      headers: { "User-Agent": userAgent(), Accept: "application/atom+xml" },
    });
    if (res.ok) return res.text();
    lastStatus = res.status;
    if (res.status !== 429 && res.status < 500) break; // non-retryable
  }
  throw new Error(`RSS fetch failed (${lastStatus})`);
}

// Fetches the newest posts across ALL given subreddits in a single combined feed
// (r/a+b+c/new.rss). One request per poll keeps us under Reddit's rate limits.
export async function fetchNewPosts(
  subreddits: string[],
  limit: number
): Promise<RedditPost[]> {
  const subs = subreddits.map((s) => encodeURIComponent(s)).join("+");
  const url = `https://www.reddit.com/r/${subs}/new.rss?limit=${Math.min(limit, 100)}`;
  return parseEntries(await fetchRss(url));
}
