// Centralised registry of all localStorage keys used across the app.
// Import from here rather than hardcoding strings — a typo here is a compile
// error; a typo at the call site is silent data loss.

export const STORAGE_KEYS = {
  theme:          'theme',
  appLanguage:    'pp-app-language',
  onboarding:     'pp-onboarding',
  nextCallTip:    'pitchbase:nextCallTip',
  legacyOutcomes: 'pitchbase:outcomes',
  /** Returns the per-user migration flag key. */
  migratedV1:       (userId: string) => `pp-migrated-v1-${userId}`,
  /** Per-user flag: localStorage meetings migrated to Supabase. */
  migratedMeetings: (userId: string) => `pp-migrated-meetings-${userId}`,
  /** Per-user flag: localStorage CRM packages migrated to Supabase. */
  migratedPackages: (userId: string) => `pp-migrated-packages-${userId}`,
} as const;
