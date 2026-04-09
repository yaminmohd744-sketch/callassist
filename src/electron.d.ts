import type { AISuggestion, CallStage } from './types';

export interface OverlayData {
  suggestions: AISuggestion[];
  closeProbability: number;
  callStage: CallStage;
  prospectName: string;
}

export interface ElectronAPI {
  isElectron: true;
  /** Subscribe to live suggestion updates pushed from the main window. Returns a cleanup function. */
  onSuggestionsUpdate: (callback: (data: OverlayData) => void) => () => void;
  /** Close the overlay window. */
  closeOverlay: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
