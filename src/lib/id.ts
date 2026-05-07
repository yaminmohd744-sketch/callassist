export function genId(): string {
  if (!crypto.randomUUID) throw new Error('crypto.randomUUID not available');
  return crypto.randomUUID();
}
