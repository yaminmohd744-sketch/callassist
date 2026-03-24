const KEY = 'callassist_sale_contexts';
const MAX = 5;

export function getSavedContexts(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

export function saveContext(context: string): void {
  if (!context.trim()) return;
  const existing = getSavedContexts().filter(c => c !== context.trim());
  localStorage.setItem(KEY, JSON.stringify([context.trim(), ...existing].slice(0, MAX)));
}
