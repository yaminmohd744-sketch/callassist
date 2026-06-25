// Parsing helpers for Recall.ai Desktop SDK realtime transcript payloads.
//
// Recall's `transcript.data` realtime payload nests words + participant under
// `data`, but the exact envelope can vary by provider/version, so we read
// defensively. These are unit-tested in recallTranscript.test.ts and double as
// the spec to verify against once we see real Recall payloads in production.
export interface RecallWord { text?: string }
export interface RecallParticipant { id?: number | string; name?: string; is_host?: boolean }
export interface RecallTranscriptData {
  data?: { words?: RecallWord[]; participant?: RecallParticipant };
  words?: RecallWord[];
  participant?: RecallParticipant;
  transcript?: { text?: string };
  text?: string;
}

/** Join the utterance text from whichever shape the payload uses. */
export function extractText(payload: RecallTranscriptData | null | undefined): string {
  if (!payload) return '';
  const words = payload.data?.words ?? payload.words;
  if (Array.isArray(words) && words.length > 0) {
    return words.map(w => w?.text ?? '').join(' ').replace(/\s+/g, ' ').trim();
  }
  return (payload.transcript?.text ?? payload.text ?? '').trim();
}

/** Pull the participant object from whichever shape the payload uses. */
export function extractParticipant(payload: RecallTranscriptData | null | undefined): RecallParticipant | undefined {
  if (!payload) return undefined;
  return payload.data?.participant ?? payload.participant;
}
