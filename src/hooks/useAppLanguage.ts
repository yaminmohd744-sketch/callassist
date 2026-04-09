import { useState, useCallback, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../lib/languages';

const STORAGE_KEY = 'pp-app-language';
const LANG_EVENT = 'pp-language-change';

function getInitialLanguage(): LanguageCode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
    return saved as LanguageCode;
  }
  // Try onboarding preference
  try {
    const ob = JSON.parse(localStorage.getItem('pp-onboarding') || '{}');
    if (ob.language && SUPPORTED_LANGUAGES.some(l => l.code === ob.language)) {
      return ob.language as LanguageCode;
    }
  } catch { /* ignore */ }
  return 'en-US';
}

export function useAppLanguage() {
  const [appLanguage, setAppLanguageState] = useState<LanguageCode>(getInitialLanguage);

  // Sync with other instances of this hook in the same window
  useEffect(() => {
    function onLangChange(e: Event) {
      const code = (e as CustomEvent<LanguageCode>).detail;
      setAppLanguageState(code);
    }
    window.addEventListener(LANG_EVENT, onLangChange);
    return () => window.removeEventListener(LANG_EVENT, onLangChange);
  }, []);

  const setAppLanguage = useCallback((code: LanguageCode) => {
    setAppLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
    // Notify all other useAppLanguage instances in this window
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: code }));
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === appLanguage)
    ?? SUPPORTED_LANGUAGES[0];

  return { appLanguage, setAppLanguage, currentLang };
}
