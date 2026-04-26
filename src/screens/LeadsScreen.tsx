import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../lib/toast';
import { loadLeads, saveLead, deleteLead, importLeads } from '../lib/leads';
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

function parseCSV(text: string): Omit<Lead, 'id' | 'callCount' | 'createdAt' | 'lastCalledAt'>[] {
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
      company:      row['company'] || row['organization'] || undefined,
      title:        row['title'] || row['job title'] || undefined,
      phone:        row['phone'] || row['phone number'] || undefined,
      email:        row['email'] || row['email address'] || undefined,
      priorContext: row['notes'] || row['context'] || row['prior context'] || undefined,
    };
  }).filter((r) => r !== null) as Omit<Lead, 'id' | 'callCount' | 'createdAt' | 'lastCalledAt'>[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', company: '', title: '', phone: '', email: '', priorContext: '' };

export function LeadsScreen({ onCallLead }: LeadsScreenProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setLoadError(false);
    try {
      const data = await loadLeads(user.id);
      setLeads(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (!user) return;
    setSaving(true);
    setFormError('');
    try {
      const saved = await saveLead({
        name:         form.name.trim(),
        company:      form.company.trim() || undefined,
        title:        form.title.trim() || undefined,
        phone:        form.phone.trim() || undefined,
        email:        form.email.trim() || undefined,
        priorContext: form.priorContext.trim() || undefined,
      }, user.id);
      setLeads(prev => [saved, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setFormError('Failed to save lead. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    // Optimistic removal — restore on failure
    setLeads(prev => prev.filter(l => l.id !== id));
    if (user) {
      deleteLead(id, user.id).catch(() => {
        toast.error('Failed to delete lead.');
        fetchLeads();
      });
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
    const truncated = parsed.length === 500;
    setImportStatus(`Importing ${parsed.length} leads...`);
    try {
      const newLeads = await importLeads(parsed, user.id);
      setLeads(prev => [...newLeads, ...prev]);
      setImportStatus(
        truncated
          ? `Imported 500 leads (file may have been truncated at 500 rows).`
          : `Imported ${newLeads.length} lead${newLeads.length !== 1 ? 's' : ''}.`
      );
    } catch {
      setImportStatus('Import failed. Check file format.');
    }
    setTimeout(() => setImportStatus(''), 5000);
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
      ) : loadError ? (
        <div className="leads-screen__empty">
          <div className="leads-screen__empty-icon">⚠</div>
          <p className="leads-screen__empty-title">Failed to load leads</p>
          <p className="leads-screen__empty-text">Check your connection and try again.</p>
          <button className="leads-screen__btn-primary" onClick={fetchLeads} style={{ marginTop: 12 }}>
            Retry
          </button>
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
                      aria-label="Delete lead"
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
