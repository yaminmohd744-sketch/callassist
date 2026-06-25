# Pitchr Reddit Monitor

Finds Reddit posts relevant to Pitchr and alerts you (terminal + optional Slack).
**It is read-only — it never posts, comments, votes, or messages anyone.** You read the
matches it surfaces and decide whether to reply yourself, openly.

Zero dependencies. Zero API keys. Runs on Node 24+ (native TypeScript, native `fetch`).

## How it works

1. Fetches the newest posts across all your subreddits in **one** combined public RSS
   request (`r/a+b+c/new.rss`) — no Reddit app, no API key, no registration, no approval.
   (Reddit gated the legacy Data API behind an approval request; RSS stays open.)
2. Scores each new post by keyword match (title matches count extra).
3. Optionally runs a cheap AI relevance check to kill false positives.
4. Prints the matches and, if configured, posts a digest to Slack.
5. Remembers what it already showed you (`state.json`) so you never see a dupe.

## Running it

```bash
cd reddit-monitor
npm start          # one pass, prints matches
npm run watch      # keeps running, re-checks every pollIntervalMinutes
```

That's it — no setup required to get matches in your terminal.

## Optional extras

Copy `.env.example` to `.env` only if you want one of these:
- **Slack alerts** — set `SLACK_WEBHOOK_URL` (create one at
  <https://api.slack.com/messaging/webhooks>).
- **AI relevance filter** — set `"useAiFilter": true` in `config.json` and add
  `ANTHROPIC_API_KEY`. Costs fractions of a cent per check; cuts false positives a lot.

## Tuning (`config.json`)

- `subreddits` — communities to watch (combined into one feed).
- `keywords` — phrases that signal relevance. Broad = more hits + more noise.
- `minRelevanceScore` — raise to 2+ for fewer, higher-quality hits; 1 catches more.
- `lookbackHours` — how far back to consider on the first run.
- `pollIntervalMinutes` — how often `watch` re-checks.
- `maxPostsPerSubreddit` — cap on posts pulled per poll (combined feed maxes at 100).
- `useAiFilter` — turn the AI relevance pass on/off.

## Notes

- Reddit throttles unauthenticated RSS, so the tool makes just **one** request per poll
  (all subreddits combined) and retries with backoff on rate limits. Keep
  `pollIntervalMinutes` at 10+ to stay comfortably under limits.
- Comment scanning isn't included in the RSS version (RSS exposes posts cleanly, not a
  combined comment stream). Posts are where the buying-intent questions show up anyway.

## Keeping it running 24/7 (optional, later)
Run `npm run watch` on any always-on machine, or wrap it in a cron/launchd/PM2 job.
Free on your own machine; ~$5/mo on a tiny VPS. We can set this up when you want.
