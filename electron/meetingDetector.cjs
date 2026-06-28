// ── Integration-free meeting detection ────────────────────────────────────────
// Polls open window titles and recognises when a Zoom / Google Meet / Teams call
// is in progress — no OAuth, no API keys, no platform integration. Works for any
// of the three at once because it only reads window titles the OS already exposes
// via desktopCapturer (the same API the loopback capture path uses).
//
// This is a heuristic: window titles can shift between app versions, so the
// patterns below favour the *meeting* window over the app's idle/home window to
// avoid false positives (e.g. Zoom running in the tray but not in a call).

const { desktopCapturer } = require('electron');

const PATTERNS = [
  // Zoom's in-call window is titled "Zoom Meeting" / "Zoom Webinar".
  // The idle app window is just "Zoom" / "Zoom Workplace", which we ignore.
  { platform: 'zoom',  test: (t) => /^zoom (meeting|webinar)/i.test(t) },

  // Google Meet runs in a browser; the tab/window title is "Meet - abc-defg-hij".
  { platform: 'meet',  test: (t) => /^meet\s*[-–—]/i.test(t) || /google meet/i.test(t) },

  // Teams opens the meeting in its own window. Require a meeting/call marker so we
  // don't fire just because the Teams app is open in the background.
  { platform: 'teams', test: (t) => /microsoft teams/i.test(t) && /\b(meeting|call)\b/i.test(t) },
];

function detectPlatform(sources) {
  for (const source of sources) {
    const title = source.name || '';
    for (const { platform, test } of PATTERNS) {
      if (test(title)) return platform;
    }
  }
  return null;
}

// Debug logging for tuning the title patterns against real windows.
// Turn on by launching the app with PITCHR_DEBUG_MEETINGS=1 — it prints every
// open window title each tick plus what (if anything) matched. Leave off otherwise.
const DEBUG = process.env.PITCHR_DEBUG_MEETINGS === '1';

let timer = null;
let current = null; // platform string while a call is detected, else null

// Calls onChange(platform) when a meeting starts and onChange(null) when it ends.
// Only fires on transitions, so the renderer isn't spammed every tick.
function start(onChange, intervalMs = 4000) {
  if (timer) return;

  const tick = async () => {
    let detected = null;
    try {
      const sources = await desktopCapturer.getSources({ types: ['window'] });
      detected = detectPlatform(sources);
      if (DEBUG) {
        const titles = sources.map((s) => s.name).filter(Boolean);
        console.log(
          `[meetingDetector] matched=${detected ?? 'none'} · ${titles.length} windows:\n` +
          titles.map((t) => `    • ${t}`).join('\n'),
        );
      }
    } catch (err) {
      // Source enumeration can transiently fail (e.g. permission prompt); skip tick.
      if (DEBUG) console.log('[meetingDetector] getSources failed:', err.message);
      return;
    }
    if (detected !== current) {
      current = detected;
      if (DEBUG) console.log(`[meetingDetector] → transition: ${detected ?? 'meeting ended'}`);
      onChange(detected);
    }
  };

  tick();
  timer = setInterval(tick, intervalMs);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  current = null;
}

module.exports = { start, stop };
