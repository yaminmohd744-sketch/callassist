export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English',    flag: 'US', deepgramCode: 'en-US' },
  { code: 'es-ES', label: 'Spanish',    flag: 'ES', deepgramCode: 'es'    },
  { code: 'fr-FR', label: 'French',     flag: 'FR', deepgramCode: 'fr'    },
  { code: 'pt-BR', label: 'Portuguese', flag: 'BR', deepgramCode: 'pt'    },
  { code: 'de-DE', label: 'German',     flag: 'DE', deepgramCode: 'de'    },
  { code: 'it-IT', label: 'Italian',    flag: 'IT', deepgramCode: 'it'    },
  { code: 'nl-NL', label: 'Dutch',      flag: 'NL', deepgramCode: 'nl'    },
  { code: 'zh-CN', label: 'Mandarin',   flag: 'CN', deepgramCode: 'zh-CN' },
  { code: 'ja-JP', label: 'Japanese',   flag: 'JP', deepgramCode: 'ja'    },
  { code: 'ar-SA', label: 'Arabic',     flag: 'AR', deepgramCode: 'ar'    },
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
