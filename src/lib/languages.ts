export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English',    flag: '🇺🇸', deepgramCode: 'en-US' },
  { code: 'es-ES', label: 'Spanish',    flag: '🇪🇸', deepgramCode: 'es'    },
  { code: 'fr-FR', label: 'French',     flag: '🇫🇷', deepgramCode: 'fr'    },
  { code: 'pt-BR', label: 'Portuguese', flag: '🇧🇷', deepgramCode: 'pt'    },
  { code: 'de-DE', label: 'German',     flag: '🇩🇪', deepgramCode: 'de'    },
  { code: 'it-IT', label: 'Italian',    flag: '🇮🇹', deepgramCode: 'it'    },
  { code: 'nl-NL', label: 'Dutch',      flag: '🇳🇱', deepgramCode: 'nl'    },
  { code: 'zh-CN', label: 'Mandarin',   flag: '🇨🇳', deepgramCode: 'zh-CN' },
  { code: 'ja-JP', label: 'Japanese',   flag: '🇯🇵', deepgramCode: 'ja'    },
  { code: 'ar-SA', label: 'Arabic',     flag: '🇸🇦', deepgramCode: 'ar'    },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export function getLanguageLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.label ?? 'English';
}

export function getLanguageFlag(code: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.flag ?? '🇺🇸';
}

export function getDeepgramCode(code: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.deepgramCode ?? 'en-US';
}
