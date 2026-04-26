import { supabase } from './supabase';
import type { Lead } from '../types';

type DbRow = Record<string, unknown>;

export function rowToLead(r: DbRow): Lead {
  return {
    id:           r.id as string,
    name:         r.name as string,
    company:      typeof r.company === 'string' ? r.company : undefined,
    title:        typeof r.title === 'string' ? r.title : undefined,
    phone:        typeof r.phone === 'string' ? r.phone : undefined,
    email:        typeof r.email === 'string' ? r.email : undefined,
    priorContext: typeof r.prior_context === 'string' ? r.prior_context : undefined,
    lastCalledAt: typeof r.last_called_at === 'string' ? r.last_called_at : undefined,
    callCount:    typeof r.call_count === 'number' ? r.call_count : 0,
    createdAt:    r.created_at as string,
  };
}

export async function loadLeads(userId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => rowToLead(r as DbRow));
}

export async function saveLead(
  lead: Omit<Lead, 'id' | 'callCount' | 'createdAt' | 'lastCalledAt'>,
  userId: string,
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id:       userId,
      name:          lead.name,
      company:       lead.company || null,
      title:         lead.title || null,
      phone:         lead.phone || null,
      email:         lead.email || null,
      prior_context: lead.priorContext || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToLead(data as DbRow);
}

export async function deleteLead(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function importLeads(
  leads: Omit<Lead, 'id' | 'callCount' | 'createdAt' | 'lastCalledAt'>[],
  userId: string,
): Promise<Lead[]> {
  const rows = leads.map(p => ({
    user_id:       userId,
    name:          p.name,
    company:       p.company || null,
    title:         p.title || null,
    phone:         p.phone || null,
    email:         p.email || null,
    prior_context: p.priorContext || null,
  }));
  const { data, error } = await supabase.from('leads').insert(rows).select();
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => rowToLead(r as DbRow));
}

export async function updateLeadAfterCall(id: string, userId: string, callCount: number): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ call_count: callCount + 1, last_called_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
