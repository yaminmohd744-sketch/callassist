import type { CrmPackage, Lead } from '../types';

const PACKAGES_KEY  = 'pp-crm-packages';
const LEAD_MAP_KEY  = 'pp-lead-package-map'; // Record<leadId, packageId>

export function loadPackages(): CrmPackage[] {
  try { return JSON.parse(localStorage.getItem(PACKAGES_KEY) ?? '[]') as CrmPackage[]; }
  catch { return []; }
}

function _savePackages(list: CrmPackage[]) {
  try { localStorage.setItem(PACKAGES_KEY, JSON.stringify(list)); } catch { /* storage full */ }
}

export function upsertPackage(pkg: CrmPackage): void {
  const list = loadPackages();
  const i = list.findIndex(p => p.id === pkg.id);
  if (i >= 0) list[i] = pkg; else list.unshift(pkg);
  _savePackages(list);
}

export function deletePackage(id: string): void {
  _savePackages(loadPackages().filter(p => p.id !== id));
  const map = _loadMap();
  for (const k of Object.keys(map)) if (map[k] === id) delete map[k];
  _saveMap(map);
}

function _loadMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LEAD_MAP_KEY) ?? '{}') as Record<string, string>; }
  catch { return {}; }
}

function _saveMap(map: Record<string, string>) {
  try { localStorage.setItem(LEAD_MAP_KEY, JSON.stringify(map)); } catch { /* storage full */ }
}

export function assignLeadToPackage(leadId: string, packageId: string): void {
  const map = _loadMap();
  map[leadId] = packageId;
  _saveMap(map);
}

export function getLeadPackageId(leadId: string): string | null {
  return _loadMap()[leadId] ?? null;
}

export function getLeadsForPackage(packageId: string, leads: Lead[]): Lead[] {
  const map = _loadMap();
  return leads.filter(l => map[l.id] === packageId);
}
