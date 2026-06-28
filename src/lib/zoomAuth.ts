import { supabase } from './supabase';

const CLIENT_ID = import.meta.env.VITE_ZOOM_CLIENT_ID as string | undefined;

export interface ZoomTokenData {
  access_token:  string;
  refresh_token: string;
  expires_in:    number;
  token_type:    string;
  scope:         string;
}

// ── Connect (full OAuth flow) ─────────────────────────────────────────────────

export async function connectZoom(): Promise<{ success: boolean; error?: string }> {
  const api = (window as Window & { electronAPI?: { startZoomOAuth?: (id: string) => Promise<{ success: boolean; code?: string; error?: string }> } }).electronAPI;

  if (!api?.startZoomOAuth) return { success: false, error: 'Only available in the desktop app.' };
  if (!CLIENT_ID) return { success: false, error: 'Zoom credentials not configured.' };

  // Desktop app opens the browser and returns the authorization code only.
  const result = await api.startZoomOAuth(CLIENT_ID);
  if (!result.success || !result.code) return { success: false, error: result.error ?? 'OAuth failed.' };

  // Exchange the code for tokens server-side, where the Zoom client secret lives.
  const { data, error: fnError } = await supabase.functions.invoke<{ tokenData: ZoomTokenData }>(
    'zoom-oauth',
    { body: { code: result.code } },
  );
  if (fnError || !data?.tokenData) return { success: false, error: fnError?.message ?? 'Token exchange failed.' };
  const tokenData = data.tokenData;

  // Persist token in Supabase user metadata so it survives re-installs
  const expiry = Date.now() + tokenData.expires_in * 1000;
  const { error } = await supabase.auth.updateUser({
    data: {
      zoom_access_token:  tokenData.access_token,
      zoom_refresh_token: tokenData.refresh_token,
      zoom_token_expiry:  expiry,
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Status checks ─────────────────────────────────────────────────────────────

export async function isZoomConnected(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.user_metadata?.zoom_access_token) return false;
  const expiry: number | undefined = user.user_metadata.zoom_token_expiry;
  return !expiry || Date.now() < expiry;
}

// ── Disconnect ────────────────────────────────────────────────────────────────

export async function disconnectZoom(): Promise<void> {
  await supabase.auth.updateUser({
    data: {
      zoom_access_token:  null,
      zoom_refresh_token: null,
      zoom_token_expiry:  null,
    },
  });
}
