// Delivers matches to the terminal and (optionally) Slack.

import type { ScoredPost } from "./filter.ts";

const env = (k: string) => (process.env[k] ?? "").trim();

function ago(createdUtc: number): string {
  const mins = Math.round((Date.now() / 1000 - createdUtc) / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function printMatches(posts: ScoredPost[]): void {
  if (posts.length === 0) {
    console.log("No new relevant posts this run.");
    return;
  }
  console.log(`\n=== ${posts.length} new relevant post(s) ===\n`);
  for (const p of posts) {
    console.log(
      `[${p.score}] r/${p.subreddit} · ${ago(p.createdUtc)} · u/${p.author}`
    );
    console.log(`  ${p.title}`);
    if (p.matchedKeywords.length)
      console.log(`  matched: ${p.matchedKeywords.join(", ")}`);
    console.log(`  ${p.url}\n`);
  }
}

export async function sendSlack(posts: ScoredPost[]): Promise<void> {
  const webhook = env("SLACK_WEBHOOK_URL");
  if (!webhook || posts.length === 0) return;

  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🟢 ${posts.length} new Pitchr-relevant Reddit post(s)`,
      },
    },
  ];

  for (const p of posts.slice(0, 20)) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${p.url}|${p.title.replace(/[<>]/g, "")}>*\nr/${p.subreddit} · ${ago(
          p.createdUtc
        )} · u/${p.author} · score ${p.score}${
          p.matchedKeywords.length ? `\n_matched: ${p.matchedKeywords.join(", ")}_` : ""
        }`,
      },
    });
    blocks.push({ type: "divider" });
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
  if (!res.ok) {
    console.error(`Slack post failed (${res.status}): ${await res.text()}`);
  }
}
