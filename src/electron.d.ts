import type { AISuggestion, CallStage } from './types/index';

export interface OverlayData {
  suggestions: AISuggestion[];
  closeProbability: number;
  callStage: CallStage;
  prospectName: string;
}

export interface ElectronAPI {
  isElectron: true;
  toggleOverlay: () => Promise<boolean>;
  sendSuggestionsToOverlay: (data: OverlayData) => void;
  onOverlayClosed: (callback: () => void) => () => void;
  onSuggestionsUpdate: (callback: (data: OverlayData) => void) => () => void;
  closeOverlay: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
