// Tracks which Reddit items we've already reported, so you never see a dupe.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, "..", "state.json");

interface State {
  seen: Record<string, number>; // id -> epoch ms first seen
}

export async function loadSeen(): Promise<Set<string>> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    const state = JSON.parse(raw) as State;
    return new Set(Object.keys(state.seen ?? {}));
  } catch {
    return new Set();
  }
}

export async function saveSeen(seen: Set<string>): Promise<void> {
  // Keep the file from growing forever: cap at the most recent 5000 ids.
  const ids = [...seen].slice(-5000);
  const obj: State = { seen: {} };
  const now = Date.now();
  for (const id of ids) obj.seen[id] = now;
  await writeFile(STATE_PATH, JSON.stringify(obj, null, 2), "utf8");
}
