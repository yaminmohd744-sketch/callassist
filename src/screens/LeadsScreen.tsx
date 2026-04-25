import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Lead } from '../types';
import './LeadsScreen.css';

interface LeadsScreenProps {
  onCallLead: (lead: Lead) => void;
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Omit<Lead, 'id' | 'callCount' | 'createdAt'>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''));
  return lines.slice(1, 501).map(line => {
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim().replace(/^"|"$/g, ''); });
    const name = row['name'] || `${row['first name'] ?? ''} ${row['last name'] ?? ''}`.trim();
    if (!name) return null;
    return {
      name,
      company: row['company'] || row['organization'] || undefined,
      title: row['title'] || row['job title'] || undefined,
      phone: row['phone'] || row['phone number'] || undefined,
      email: row['email'] || row['email address'] || undefined,
      priorContext: row['notes'] || row['context'] || row['prior context'] || undefined,
    };
  }).filter((r) => r !== null) as Omit<Lead, 'id' | 'callCount' | 'createdAt'>[];
}

// ─── Row ↔ Lead helpers ───────────────────────────────────────────────────────

type DbRow = Record<string, unknown>;

function rowToLead(r: DbRow): Lead {
  return {
    id:            r.id as string,
    name:          r.name as string,
    company:       typeof r.company === 'string' ? r.company : undefined,
    title:         typeof r.title === 'string' ? r.title : undefined,
    phone:         typeof r.phone === 'string' ? r.phone : undefined,
    email:         typeof r.email === 'string' ? r.email : undefined,
    priorContext:  typeof r.prior_context === 'string' ? r.prior_context : undefined,
    lastCalledAt:  typeof r.last_called_at === 'string' ? r.last_called_at : undefined,
    callCount:     typeof r.call_count === 'number' ? r.call_count : 0,
    createdAt:     r.created_at as string,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', company: '', title: '', phone: '', email: '', priorContext: '' };

export function LeadsScreen({ onCallLead }: LeadsScreenProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLeads = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data.map(r => rowToLead(r as DbRow)));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (!user) return;
    setSaving(true);
    setFormError('');
    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id:       user.id,
        name:          form.name.trim(),
        company:       form.company.trim() || null,
        title:         form.title.trim() || null,
        phone:         form.phone.trim() || null,
        email:         form.email.trim() || null,
        prior_context: form.priorContext.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { setFormError('Failed to save lead. Try again.'); return; }
    if (data) setLeads(prev => [rowToLead(data as DbRow), ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (user) {
      await supabase.from('leads').delete().eq('id', id).eq('user_id', user.id);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    setImportStatus('Parsing...');
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length === 0) { setImportStatus('No valid leads found in file.'); return; }
    setImportStatus(`Importing ${parsed.length} leads...`);
    const rows = parsed.map(p => ({
      user_id:       user.id,
      name:          p.name,
      company:       p.company || null,
      title:         p.title || null,
      phone:         p.phone || null,
      email:         p.email || null,
      prior_context: p.priorContext || null,
    }));
    const { data, error } = await supabase.from('leads').insert(rows).select();
    if (error) { setImportStatus('Import failed. Check file format.'); return; }
    const newLeads = (data ?? []).map(r => rowToLead(r as DbRow));
    setLeads(prev => [...newLeads, ...prev]);
    setImportStatus(`Imported ${newLeads.length} lead${newLeads.length !== 1 ? 's' : ''}.`);
    setTimeout(() => setImportStatus(''), 4000);
  }

  const filtered = searchQuery.trim()
    ? leads.filter(l => {
        const q = searchQuery.toLowerCase();
        return l.name.toLowerCase().includes(q) ||
               (l.company ?? '').toLowerCase().includes(q) ||
               (l.title ?? '').toLowerCase().includes(q);
      })
    : leads;

  function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="leads-screen">
      {/* Header */}
      <div className="leads-screen__header">
        <div className="leads-screen__header-left">
          <h1 className="leads-screen__title">LEADS</h1>
          <span className="leads-screen__count">{leads.length}</span>
        </div>
        <div className="leads-screen__header-actions">
          {importStatus && <span className="leads-screen__import-status">{importStatus}</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button className="leads-screen__btn-ghost" onClick={() => fileInputRef.current?.click()}>
            ↑ Import CSV
          </button>
          <button
            className="leads-screen__btn-primary"
            onClick={() => { setShowForm(f => !f); setFormError(''); }}
          >
            {showForm ? '✕ Cancel' : '+ Add Lead'}
          </button>
        </div>
      </div>

      {/* Add lead form */}
      {showForm && (
        <form className="leads-screen__form" onSubmit={handleAddLead}>
          <div className="leads-screen__form-row">
            <input
              className="leads-screen__input"
              placeholder="Name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
            <input
              className="leads-screen__input"
              placeholder="Company"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            />
            <input
              className="leads-screen__input"
              placeholder="Job title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="leads-screen__form-row">
            <input
              className="leads-screen__input"
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            <input
              className="leads-screen__input"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <textarea
            className="leads-screen__textarea"
            placeholder="Prior context / notes (optional)"
            value={form.priorContext}
            onChange={e => setForm(f => ({ ...f, priorContext: e.target.value }))}
            rows={2}
          />
          {formError && <p className="leads-screen__form-error">{formError}</p>}
          <div className="leads-screen__form-actions">
            <button type="submit" className="leads-screen__btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      {leads.length > 0 && (
        <div className="leads-screen__search-row">
          <input
            className="leads-screen__search"
            placeholder="Search by name, company, or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="leads-screen__empty">
          <div className="leads-screen__empty-icon">◌</div>
          <p className="leads-screen__empty-text">Loading leads...</p>
        </div>
      ) : filtered.length === 0 && leads.length === 0 ? (
        <div className="leads-screen__empty">
          <div className="leads-screen__empty-icon">◎</div>
          <p className="leads-screen__empty-title">No leads yet</p>
          <p className="leads-screen__empty-text">
            Import a CSV from HubSpot, Salesforce, Google Sheets, or any CRM —
            or add leads manually above. Then click <strong>Call →</strong> to
            jump straight into a pre-filled call.
          </p>
          <p className="leads-screen__empty-hint">
            CSV headers detected: name, company, title, phone, email, notes
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="leads-screen__empty">
          <p className="leads-screen__empty-text">No leads match "{searchQuery}"</p>
        </div>
      ) : (
        <div className="leads-screen__table-wrap">
          <table className="leads-screen__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Title</th>
                <th>Last Called</th>
                <th>Calls</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="leads-screen__row">
                  <td className="leads-screen__cell leads-screen__cell--name">
                    <span className="leads-screen__name">{lead.name}</span>
                    {lead.email && <span className="leads-screen__sub">{lead.email}</span>}
                  </td>
                  <td className="leads-screen__cell">{lead.company || <span className="leads-screen__muted">—</span>}</td>
                  <td className="leads-screen__cell">{lead.title || <span className="leads-screen__muted">—</span>}</td>
                  <td className="leads-screen__cell leads-screen__cell--date">{formatDate(lead.lastCalledAt)}</td>
                  <td className="leads-screen__cell leads-screen__cell--count">
                    {lead.callCount > 0 ? (
                      <span className="leads-screen__call-badge">{lead.callCount}</span>
                    ) : (
                      <span className="leads-screen__muted">0</span>
                    )}
                  </td>
                  <td className="leads-screen__cell leads-screen__cell--actions">
                    <button
                      className="leads-screen__call-btn"
                      onClick={() => onCallLead(lead)}
                      title={`Call ${lead.name}`}
                    >
                      Call →
                    </button>
                    <button
                      className="leads-screen__delete-btn"
                      onClick={() => handleDelete(lead.id)}
                      title="Delete lead"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
