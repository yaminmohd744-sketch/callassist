import { createContext, useContext } from 'react';
import type { LanguageCode } from '../lib/languages';

export interface AppContextValue {
  appLanguage: LanguageCode;
  onChangeLanguage: (code: LanguageCode) => void;
  currentLangLabel: string;
  userName: string;
  userEmail: string;
  profilePic: string | null;
  onProfilePicChange: (dataUrl: string) => void;
  onProfilePicError?: () => void;
  totalCallSeconds: number;
  totalCallCount: number;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContext.Provider');
  return ctx;
}
