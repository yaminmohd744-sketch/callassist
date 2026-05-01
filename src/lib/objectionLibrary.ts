const STORAGE_KEY = 'pitchbase:custom-objections';

export interface CustomObjectionEntry {
  id: string;
  keyword: string;
  label: string;
  responseFirst: string;
  responseRepeat: string;
  createdAt: string;
}

export function loadCustomObjections(): CustomObjectionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomObjectionEntry[];
  } catch {
    return [];
  }
}

function persist(entries: CustomObjectionEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* storage full */ }
}

export function addCustomObjection(entry: Omit<CustomObjectionEntry, 'id' | 'createdAt'>): CustomObjectionEntry {
  const newEntry: CustomObjectionEntry = {
    ...entry,
    keyword: entry.keyword.trim().toLowerCase(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  persist([...loadCustomObjections(), newEntry]);
  return newEntry;
}

export function updateCustomObjection(id: string, patch: Partial<Omit<CustomObjectionEntry, 'id' | 'createdAt'>>): void {
  persist(
    loadCustomObjections().map(e =>
      e.id === id
        ? { ...e, ...patch, keyword: (patch.keyword ?? e.keyword).trim().toLowerCase() }
        : e
    )
  );
}

export function deleteCustomObjection(id: string): void {
  persist(loadCustomObjections().filter(e => e.id !== id));
}
