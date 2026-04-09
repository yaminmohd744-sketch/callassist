import { useAppLanguage } from './useAppLanguage';
import { TRANSLATIONS } from '../lib/translations';
import type { T } from '../lib/translations';

export function useTranslations(): T {
  const { appLanguage } = useAppLanguage();
  return TRANSLATIONS[appLanguage] ?? TRANSLATIONS['en-US'];
}
