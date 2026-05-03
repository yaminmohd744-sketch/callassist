// Scans a prospect's spoken text for actionable intel worth auto-capturing as a note.
// Returns a short note string, or null if nothing noteworthy was said.

const MEETING_PATTERNS = [
  /\b(?:let'?s?|we(?:'ll| will| can)|i(?:'ll| will| can)|can we|how about|shall we)\b.{0,40}\b(?:meet|call|chat|talk|catch up|connect|schedule|book|set up|arrange)\b/i,
  /\b(?:meet(?:ing)?|call|chat|sync)\b.{0,30}\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|this week)\b/i,
  /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|this week)\b.{0,30}\b(?:work|good|fine|free|available|open|suit|suits|works?)\b/i,
];

const TIME_PATTERNS = [
  /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i,
  /\b(?:morning|afternoon|evening|noon|midday|eod|end of day)\b/i,
];

const COMMITMENT_PATTERNS = [
  /\bi(?:'ll| will| can| shall)\b.{0,60}(?:send|share|forward|email|get|check|look|find|ask|talk|speak|loop|introduce|ping|reach out|follow up|circle back|come back|review|think about|consider|discuss|bring|show|arrange|book|schedule)/i,
  /\bwe(?:'ll| will| can)\b.{0,60}(?:send|share|move forward|proceed|do|set|arrange|book|schedule|connect|introduce)/i,
  /\blet me\b.{0,60}(?:check|find|look|ask|get|send|share|think|see|confirm|review)/i,
];

const PEOPLE_PATTERNS = [
  /\b(?:my|our|the)\s+(?:cto|cfo|ceo|vp|director|manager|boss|head|lead|founder|partner|colleague|team)\b/i,
  /\bneed to\b.{0,30}\b(?:loop in|bring in|include|involve|talk to|speak with|get|check with)\b/i,
];

const TOOL_PATTERNS = [
  /\b(?:we(?:'re| are)? (?:using|on|with)|currently (?:using|on|with)|we use|we have|we(?:'ve| have) got)\b.{0,40}\b(?:salesforce|hubspot|pipedrive|zoho|monday|asana|jira|slack|teams|notion|zendesk|intercom|stripe|quickbooks|xero|shopify|apollo|outreach|salesloft|gong|chorus)\b/i,
];

const BUDGET_TIMELINE_PATTERNS = [
  /\b(?:budget|spend|cost|price|afford|allocate|approve)\b.{0,50}\b(?:\$[\d,]+k?|[\d,]+k?\s*(?:dollars?|usd|gbp|eur)|per (?:month|year|quarter|seat|user))\b/i,
  /\b(?:q[1-4]|quarter|end of (?:year|quarter|month)|fiscal|h[12])\b/i,
  /\b(?:decision|decide|sign off|approval|green light|budget approval)\b.{0,40}\b(?:by|before|in|within|next|this)\b/i,
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

export function extractAutoNote(text: string, timestampSeconds: number): string | null {
  const t = formatTime(timestampSeconds);

  for (const p of MEETING_PATTERNS) {
    const m = text.match(p);
    if (m) return `${t} — ${truncate(m[0].trim(), 80)}`;
  }

  for (const p of COMMITMENT_PATTERNS) {
    const m = text.match(p);
    if (m) return `${t} — ${truncate(m[0].trim(), 80)}`;
  }

  for (const p of BUDGET_TIMELINE_PATTERNS) {
    const m = text.match(p);
    if (m) return `${t} — ${truncate(m[0].trim(), 80)}`;
  }

  for (const p of PEOPLE_PATTERNS) {
    const m = text.match(p);
    if (m) return `${t} — ${truncate(m[0].trim(), 80)}`;
  }

  for (const p of TOOL_PATTERNS) {
    const m = text.match(p);
    if (m) return `${t} — ${truncate(m[0].trim(), 80)}`;
  }

  // Time mention alone (e.g. "3pm works for me")
  for (const p of TIME_PATTERNS) {
    const m = text.match(p);
    if (m) {
      const surrounding = truncate(text.trim(), 70);
      return `${t} — ${surrounding}`;
    }
  }

  return null;
}
