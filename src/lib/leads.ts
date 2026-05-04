import { supabase } from './supabase';
import type { Lead } from '../types';

interface LeadRow {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  prior_context: string | null;
  last_called_at: string | null;
  call_count: number;
  created_at: string;
}

function assertLeadRow(r: unknown): asserts r is LeadRow {
  if (!r || typeof r !== 'object') throw new Error('Invalid lead row');
  if (typeof (r as Record<string, unknown>).id !== 'string') throw new Error('Missing lead id');
}

export function rowToLead(r: LeadRow): Lead {
  return {
    id:           r.id,
    name:         r.name,
    company:      r.company ?? undefined,
    title:        r.title ?? undefined,
    phone:        r.phone ?? undefined,
    email:        r.email ?? undefined,
    priorContext: r.prior_context ?? undefined,
    lastCalledAt: r.last_called_at ?? undefined,
    callCount:    r.call_count,
    createdAt:    r.created_at,
  };
}

export async function loadLeads(userId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(r => { assertLeadRow(r); return rowToLead(r); });
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
  return rowToLead(data as LeadRow);
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
  return (data ?? []).map(r => { assertLeadRow(r); return rowToLead(r); });
}

export async function updateLeadAfterCall(id: string, userId: string, callCount: number): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ call_count: callCount + 1, last_called_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
