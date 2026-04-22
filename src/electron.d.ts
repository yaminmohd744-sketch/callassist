import type { AISuggestion, CallStage } from './types';

export interface OverlayData {
  suggestions: AISuggestion[];
  closeProbability: number;
  callStage: CallStage;
  prospectName: string;
}

export interface ElectronAPI {
  isElectron: true;
  launchOverlay:       () => void;
  closeOverlay:        () => void;
  minimizeMain:        () => void;
  pushOverlayData:     (data: OverlayData) => void;
  restoreMain:         () => void;
  endCallFromOverlay:  () => void;
  onSuggestionsUpdate: (callback: (data: OverlayData) => void) => () => void;
  onOverlayClosed:     (callback: () => void) => () => void;
  onTriggerEndCall:    (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
