// Minimal Reddit API client using OAuth + native fetch. Zero dependencies.

export interface RedditPost {
  id: string;
  kind: "post" | "comment";
  subreddit: string;
  title: string;
  body: string;
  author: string;
  url: string; // direct link to the thread
  createdUtc: number; // seconds
}

interface TokenState {
  token: string;
  expiresAt: number; // epoch ms
}

let cachedToken: TokenState | null = null;

const env = (k: string) => (process.env[k] ?? "").trim();

function authHeader(): string {
  const id = env("REDDIT_CLIENT_ID");
  const secret = env("REDDIT_CLIENT_SECRET");
  if (!id || !secret) {
    throw new Error(
      "Missing REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET. Copy .env.example to .env and fill them in."
    );
  }
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const username = env("REDDIT_USERNAME");
  const password = env("REDDIT_PASSWORD");

  // Use password grant if creds provided, otherwise app-only read access.
  const body =
    username && password
      ? new URLSearchParams({ grant_type: "password", username, password })
      : new URLSearchParams({ grant_type: "client_credentials" });

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": env("REDDIT_USER_AGENT") || "pitchr-monitor/1.0",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit auth failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.token;
}

async function apiGet(path: string): Promise<any> {
  const token = await getToken();
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": env("REDDIT_USER_AGENT") || "pitchr-monitor/1.0",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit API error (${res.status}) on ${path}: ${text}`);
  }
  return res.json();
}

function mapPost(child: any): RedditPost {
  const d = child.data;
  return {
    id: d.name, // fullname e.g. t3_abc123
    kind: "post",
    subreddit: d.subreddit,
    title: d.title ?? "",
    body: d.selftext ?? "",
    author: d.author ?? "[deleted]",
    url: `https://www.reddit.com${d.permalink}`,
    createdUtc: d.created_utc,
  };
}

function mapComment(child: any): RedditPost {
  const d = child.data;
  return {
    id: d.name, // t1_...
    kind: "comment",
    subreddit: d.subreddit,
    title: d.link_title ?? "(comment)",
    body: d.body ?? "",
    author: d.author ?? "[deleted]",
    url: `https://www.reddit.com${d.permalink}`,
    createdUtc: d.created_utc,
  };
}

export async function fetchNewPosts(
  subreddit: string,
  limit: number
): Promise<RedditPost[]> {
  const json = await apiGet(`/r/${subreddit}/new?limit=${Math.min(limit, 100)}`);
  return (json?.data?.children ?? []).map(mapPost);
}

export async function fetchNewComments(
  subreddit: string,
  limit: number
): Promise<RedditPost[]> {
  const json = await apiGet(
    `/r/${subreddit}/comments?limit=${Math.min(limit, 100)}`
  );
  return (json?.data?.children ?? []).map(mapComment);
}
