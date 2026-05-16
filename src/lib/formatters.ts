// ─── Shared date / time formatters ───────────────────────────────────────────

/** "2m 35s" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/** "Apr 9, 02:30 PM" — used in call list rows and contact cards */
export function formatDateShort(iso: string, locale = 'en-US'): string {
  return new Date(iso).toLocaleDateString(locale, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** "Wed, Apr 9, 2026" — used in contact call history rows */
export function formatDateFull(iso: string, locale = 'en-US'): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** "Wed, Apr 9, 2026, 02:30 PM" — used in post-call header and transcript export */
export function formatDateLong(iso: string, locale = 'en-US'): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** "Today 14:30" / "Tomorrow 09:00" / "Mon 12 Jan 14:30" — used in meeting cards */
export function formatScheduledAt(iso: string, locale = 'en-US'): string {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return `Today ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${time}`;
}

/** "Xh Ym" or "Ym" — used in profile activity stats */
export function formatTotalTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '<1m';
}
