import { supabase } from './supabase';
import type { CrmPackage, CrmSource, Lead } from '../types';

const LS_PACKAGES_KEY = 'pp-crm-packages';
const LS_MAP_KEY      = 'pp-lead-package-map';

interface PackageRow {
  id: string;
  user_id: string;
  name: string;
  source: string;
  created_at: string;
}

interface MapRow {
  lead_id: string;
  package_id: string;
  user_id: string;
}

function rowToPackage(r: PackageRow): CrmPackage {
  return { id: r.id, name: r.name, source: r.source as CrmSource, createdAt: r.created_at };
}

async function migratePackages(userId: string): Promise<void> {
  const rawPkgs = localStorage.getItem(LS_PACKAGES_KEY);
  const rawMap  = localStorage.getItem(LS_MAP_KEY);
  const hasPkgs = rawPkgs && rawPkgs !== '[]';
  const hasMap  = rawMap  && rawMap  !== '{}';
  if (!hasPkgs && !hasMap) return;
  try {
    if (hasPkgs) {
      const pkgs = JSON.parse(rawPkgs!) as CrmPackage[];
      if (pkgs.length > 0) {
        const rows = pkgs.map(p => ({ id: p.id, user_id: userId, name: p.name, source: p.source, created_at: p.createdAt }));
        const { error } = await supabase.from('crm_packages').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
        if (!error) localStorage.removeItem(LS_PACKAGES_KEY);
      } else {
        localStorage.removeItem(LS_PACKAGES_KEY);
      }
    }
    if (hasMap) {
      const map = JSON.parse(rawMap!) as Record<string, string>;
      const entries = Object.entries(map);
      if (entries.length > 0) {
        const rows: MapRow[] = entries.map(([lead_id, package_id]) => ({ lead_id, package_id, user_id: userId }));
        const { error } = await supabase.from('lead_package_map').upsert(rows, { onConflict: 'lead_id,package_id', ignoreDuplicates: true });
        if (!error) localStorage.removeItem(LS_MAP_KEY);
      } else {
        localStorage.removeItem(LS_MAP_KEY);
      }
    }
  } catch {
    // Migration failed silently — localStorage data stays intact
  }
}

export async function loadPackages(userId: string): Promise<CrmPackage[]> {
  await migratePackages(userId);
  const { data, error } = await supabase
    .from('crm_packages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => rowToPackage(r as PackageRow));
}

export async function savePackage(pkg: CrmPackage, userId: string): Promise<void> {
  const { error } = await supabase
    .from('crm_packages')
    .upsert({ id: pkg.id, user_id: userId, name: pkg.name, source: pkg.source, created_at: pkg.createdAt }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function deletePackage(id: string, userId: string): Promise<void> {
  const { error: pkgErr } = await supabase.from('crm_packages').delete().eq('id', id).eq('user_id', userId);
  if (pkgErr) throw new Error(pkgErr.message);
  // Remove all lead assignments for this package
  const { error: mapErr } = await supabase.from('lead_package_map').delete().eq('package_id', id).eq('user_id', userId);
  if (mapErr) throw new Error(mapErr.message);
}

export async function loadLeadPackageMap(userId: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('lead_package_map')
    .select('lead_id, package_id')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  for (const r of (data ?? []) as MapRow[]) map[r.lead_id] = r.package_id;
  return map;
}

export async function assignLead(leadId: string, packageId: string, userId: string): Promise<void> {
  // Remove any existing assignment first, then insert
  await supabase.from('lead_package_map').delete().eq('lead_id', leadId).eq('user_id', userId);
  const { error } = await supabase.from('lead_package_map').insert({ lead_id: leadId, package_id: packageId, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function unassignLead(leadId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('lead_package_map').delete().eq('lead_id', leadId).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export function getLeadsForPackage(packageId: string, leads: Lead[], leadPackageMap: Record<string, string>): Lead[] {
  return leads.filter(l => leadPackageMap[l.id] === packageId);
}
