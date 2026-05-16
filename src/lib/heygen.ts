import { supabase } from './supabase';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heygen-session`;

async function call(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(String(json.error ?? `heygen-session ${res.status}`));
  return json;
}

export interface HeyGenSession {
  sessionId: string;
  accessToken: string;
  iceServers: RTCIceServer[];
  sdpOffer: string;
}

export async function createHeyGenSession(
  avatarId?: string,
  voiceId?: string,
): Promise<HeyGenSession> {
  const json = await call({ action: 'create', avatarId, voiceId });
  const data = json.data;
  if (
    !data ||
    typeof data !== 'object' ||
    typeof (data as Record<string, unknown>).session_id !== 'string'
  ) {
    throw new Error('Unexpected HeyGen session response shape');
  }
  return data as unknown as HeyGenSession;
}

export async function startHeyGenSession(sessionId: string, sdpAnswer: string): Promise<void> {
  await call({ action: 'start', sessionId, sdpAnswer });
}

export async function sendHeyGenText(sessionId: string, text: string): Promise<void> {
  await call({ action: 'speak', sessionId, text });
}

export async function stopHeyGenSession(sessionId: string): Promise<void> {
  await call({ action: 'stop', sessionId });
}
