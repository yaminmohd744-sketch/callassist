import { supabase } from './supabase';

export interface RecallBotConfig {
  meetingId: string;
  meetingUrl: string;
  botName?: string;
}

export interface RecallBotStatus {
  botId: string;
  status: 'joining' | 'in-call' | 'done' | 'error';
}

// Triggers the Supabase edge function which calls Recall.ai
// Returns the bot ID to track with
export async function startRecallBot(config: RecallBotConfig): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-join`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meetingId:  config.meetingId,
        meetingUrl: config.meetingUrl,
        botName:    config.botName ?? 'Pitchbase',
      }),
    },
  );

  if (!res.ok) throw new Error(`Failed to start bot: ${res.status}`);
  const json = await res.json() as { botId: string };
  return json.botId;
}

// Poll Recall.ai bot status via the edge function
export async function getRecallBotStatus(botId: string): Promise<RecallBotStatus> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-join?botId=${botId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) throw new Error(`Failed to get bot status: ${res.status}`);
  return res.json() as Promise<RecallBotStatus>;
}
