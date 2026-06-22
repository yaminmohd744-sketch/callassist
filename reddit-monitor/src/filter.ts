// Relevance scoring: keyword pass (free) + optional AI pass (cheap).

import type { RedditPost } from "./reddit.ts";

export interface ScoredPost extends RedditPost {
  score: number;
  matchedKeywords: string[];
}

const env = (k: string) => (process.env[k] ?? "").trim();

export function keywordScore(
  post: RedditPost,
  keywords: string[]
): { score: number; matched: string[] } {
  const haystack = `${post.title}\n${post.body}`.toLowerCase();
  const matched: string[] = [];
  for (const kw of keywords) {
    if (haystack.includes(kw.toLowerCase())) matched.push(kw);
  }
  // Title matches are worth more than body matches.
  const titleLower = post.title.toLowerCase();
  let score = matched.length;
  for (const kw of matched) {
    if (titleLower.includes(kw.toLowerCase())) score += 1;
  }
  return { score, matched };
}

const PITCHR_PITCH = `Pitchr is an all-in-one AI sales platform: live call coaching, autonomous AI avatars for video meetings, lead management, analytics, and post-call reporting (transcript, summary, lead score, follow-up email). It targets sales reps and founders running high-volume outbound calls and video meetings.`;

// Returns true if the post describes a problem/topic Pitchr could plausibly help with.
export async function aiIsRelevant(post: RedditPost): Promise<boolean> {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) return true; // no key -> don't block, fall back to keyword-only

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 5,
      system: `You decide if a Reddit post is a genuine opportunity to recommend a product.\n\nProduct: ${PITCHR_PITCH}\n\nAnswer with exactly "YES" if the author is describing a need, frustration, or question that this product addresses (e.g. asking for sales call tools, struggling with follow-ups, looking for a CRM/note-taker, cold calling help). Answer "NO" for off-topic, hiring posts, memes, or unrelated keyword coincidences. Output only YES or NO.`,
      messages: [
        {
          role: "user",
          content: `Title: ${post.title}\n\nBody: ${post.body.slice(0, 1500)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    // On API trouble, don't lose the post — keep it.
    return true;
  }
  const json = (await res.json()) as { content?: { text?: string }[] };
  const text = (json.content?.[0]?.text ?? "").trim().toUpperCase();
  return text.startsWith("YES");
}

export async function scorePosts(
  posts: RedditPost[],
  keywords: string[],
  minScore: number,
  useAi: boolean
): Promise<ScoredPost[]> {
  const out: ScoredPost[] = [];
  for (const post of posts) {
    const { score, matched } = keywordScore(post, keywords);
    if (score < minScore) continue;
    if (useAi) {
      const ok = await aiIsRelevant(post);
      if (!ok) continue;
    }
    out.push({ ...post, score, matchedKeywords: matched });
  }
  // Highest score first.
  return out.sort((a, b) => b.score - a.score);
}
