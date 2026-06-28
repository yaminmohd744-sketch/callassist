import type { AISuggestion, CallStage } from './types';

export type MeetingPlatform = 'zoom' | 'meet' | 'teams';

export interface OverlayTranscriptEntry {
  speaker: 'rep' | 'prospect';
  text: string;
}

export interface OverlayData {
  suggestions: AISuggestion[];
  closeProbability: number;
  callStage: CallStage;
  prospectName: string;
  transcript?: OverlayTranscriptEntry[];
}

export interface ElectronAPI {
  isElectron: true;
  openExternal:        (url: string) => void;
  launchOverlay:       () => void;
  closeOverlay:        () => void;
  minimizeMain:        () => void;
  pushOverlayData:     (data: OverlayData) => void;
  restoreMain:         () => void;
  endCallFromOverlay:  () => void;
  onSuggestionsUpdate: (callback: (data: OverlayData) => void) => () => void;
  onOverlayClosed:     (callback: () => void) => () => void;
  onTriggerEndCall:    (callback: () => void) => () => void;
  onOAuthCallback:     (callback: (url: string) => void) => () => void;
  onOAuthCode:         (callback: (code: string) => void) => () => void;
  startGoogleServer:   () => void;
  onMeetingDetected:   (callback: (platform: MeetingPlatform) => void) => () => void;
  onMeetingEnded:      (callback: () => void) => () => void;
  recall?: RecallAPI;
}

export interface RecallEvent {
  type: 'meeting-detected' | 'meeting-closed' | 'recording-started' | 'recording-ended' | 'realtime-event' | 'error';
  event?: string;            // realtime sub-event, e.g. 'transcript.data'
  data?: unknown;            // realtime payload
  window?: { id: string; title?: string; platform?: string };
  message?: string;          // error message
}

export interface RecallAPI {
  isAvailable:        () => Promise<boolean>;
  requestPermissions: () => Promise<{ ok: boolean; error?: string }>;
  start:              (uploadToken: string) => Promise<{ ok: boolean; windowId?: string; error?: string }>;
  stop:               () => Promise<{ ok: boolean; error?: string }>;
  onEvent:            (callback: (evt: RecallEvent) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
