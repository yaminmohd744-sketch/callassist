# Pitchr Reddit Monitor

Finds Reddit posts/comments relevant to Pitchr and alerts you (terminal + optional Slack).
**It is read-only — it never posts, comments, votes, or messages anyone.** You read the
matches it surfaces and decide whether to reply yourself, openly.

Zero dependencies. Runs on Node 24+ (native TypeScript, native `fetch`).

## What it does

1. Polls the subreddits in `config.json` via Reddit's official API (`/r/<sub>/new`).
2. Scores each new post by keyword match (title matches count extra).
3. Optionally runs a cheap AI relevance check to kill false positives.
4. Prints the matches and, if configured, posts a digest to Slack.
5. Remembers what it already showed you (`state.json`) so you never see a dupe.

## ▶️ YOUR TURN — one-time setup (~5 min)

Everything else is built. You only need to do this:

### 1. Get free Reddit API keys
- Go to <https://www.reddit.com/prefs/apps> → **"create another app"**.
- Pick type **script**.
- Name: `pitchr-monitor`. Redirect URI: `http://localhost` (required but unused).
- After creating: the **client ID** is the string under the app name; the **secret** is labeled "secret".

### 2. Create your `.env`
```bash
cd reddit-monitor
cp .env.example .env
```
Open `.env` and paste in `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, and set
`REDDIT_USER_AGENT` to something like `pitchr-monitor/1.0 by u/yourusername`.
(Leave username/password blank — app-only read access is enough.)

### 3. (Optional) Slack alerts
Create an Incoming Webhook (<https://api.slack.com/messaging/webhooks>) and paste the URL
into `SLACK_WEBHOOK_URL` in `.env`. Skip this to just use the terminal.

### 4. (Optional) AI filter
Set `"useAiFilter": true` in `config.json` and add `ANTHROPIC_API_KEY` to `.env`.
Costs fractions of a cent per check. Skip it = free, keyword-only.

That's it — ping me if any step is unclear.

## Running it

```bash
cd reddit-monitor
npm start          # one pass, prints matches
npm run watch      # keeps running, re-checks every pollIntervalMinutes
```

## Tuning

Edit `config.json`:
- `subreddits` — communities to watch.
- `keywords` — phrases that signal relevance.
- `minRelevanceScore` — raise to 3+ for fewer, higher-quality hits.
- `lookbackHours` — how far back to consider on the first run.
- `pollIntervalMinutes` — how often `--loop`/`watch` re-checks.
- `scanComments` — also scan comments, not just posts.
- `useAiFilter` — turn the AI relevance pass on/off.

## Keeping it running 24/7 (optional, later)
Run `npm run watch` on any always-on machine, or wrap it in a cron/systemd/PM2 job.
Free if you run it on your own machine; ~$5/mo on a tiny VPS. We can set this up when you want.
