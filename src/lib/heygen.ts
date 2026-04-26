// HeyGen Streaming Avatar service
// API key goes in VITE_HEYGEN_API_KEY (add to .env and Supabase secrets)
// Docs: https://docs.heygen.com/reference/streaming-avatar

const HEYGEN_API_KEY = import.meta.env.VITE_HEYGEN_API_KEY as string | undefined;
const HEYGEN_BASE    = 'https://api.heygen.com';

export interface HeyGenSession {
  sessionId: string;
  accessToken: string;
  iceServers: RTCIceServer[];
  sdpOffer: string;
}

// Default avatar and voice IDs — swap these in the HeyGen dashboard
// to use a custom avatar or cloned voice
export const DEFAULT_AVATAR_ID = 'Wayne_20240711';
export const DEFAULT_VOICE_ID  = '2d5b0e6cf36f460aa7fc47e3eee4ba54'; // American English male

export async function createHeyGenSession(
  avatarId = DEFAULT_AVATAR_ID,
  voiceId  = DEFAULT_VOICE_ID,
): Promise<HeyGenSession> {
  if (!HEYGEN_API_KEY) throw new Error('VITE_HEYGEN_API_KEY is not set');

  const res = await fetch(`${HEYGEN_BASE}/v1/streaming.new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': HEYGEN_API_KEY,
    },
    body: JSON.stringify({
      avatar_id: avatarId,
      voice: { voice_id: voiceId },
    }),
  });

  if (!res.ok) throw new Error(`HeyGen session create failed: ${res.status}`);
  const json = await res.json() as { data: HeyGenSession };
  return json.data;
}

export async function startHeyGenSession(sessionId: string, sdpAnswer: string): Promise<void> {
  if (!HEYGEN_API_KEY) throw new Error('VITE_HEYGEN_API_KEY is not set');

  const res = await fetch(`${HEYGEN_BASE}/v1/streaming.start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': HEYGEN_API_KEY,
    },
    body: JSON.stringify({ session_id: sessionId, sdp: { type: 'answer', sdp: sdpAnswer } }),
  });

  if (!res.ok) throw new Error(`HeyGen session start failed: ${res.status}`);
}

export async function sendHeyGenText(sessionId: string, text: string): Promise<void> {
  if (!HEYGEN_API_KEY) throw new Error('VITE_HEYGEN_API_KEY is not set');

  const res = await fetch(`${HEYGEN_BASE}/v1/streaming.task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': HEYGEN_API_KEY,
    },
    body: JSON.stringify({ session_id: sessionId, text, task_type: 'talk' }),
  });

  if (!res.ok) throw new Error(`HeyGen speak failed: ${res.status}`);
}

export async function stopHeyGenSession(sessionId: string): Promise<void> {
  if (!HEYGEN_API_KEY) throw new Error('VITE_HEYGEN_API_KEY is not set');

  await fetch(`${HEYGEN_BASE}/v1/streaming.stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': HEYGEN_API_KEY,
    },
    body: JSON.stringify({ session_id: sessionId }),
  });
}
