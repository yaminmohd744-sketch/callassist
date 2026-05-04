import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../lib/toast';
import { useTranslations } from '../hooks/useTranslations';
import { loadLeads, saveLead, deleteLead, importLeads } from '../lib/leads';
import {
  loadPackages, savePackage, deletePackage as removePackage,
  assignLead, loadLeadPackageMap, getLeadsForPackage,
} from '../lib/packagesSupabase';
import { formatDuration, formatDateShort } from '../lib/formatters';
import type { Lead, CallSession, CrmPackage } from '../types';
import './LeadsScreen.css';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PACKAGES: CrmPackage[] = [
  { id: 'mock-pkg-1', name: 'Q2 Enterprise', source: 'hubspot',  createdAt: '2026-04-01T08:00:00Z' },
  { id: 'mock-pkg-2', name: 'Inbound Leads', source: 'apollo',   createdAt: '2026-04-10T08:00:00Z' },
  { id: 'mock-pkg-3', name: 'SMB Pipeline',  source: 'custom',   createdAt: '2026-04-20T08:00:00Z' },
];

const MOCK_LEADS: Lead[] = [
  {
    id: 'mock-lead-1', name: 'Sarah Mitchell',
    company: 'Acme Corp', title: 'VP of Sales',
    phone: '+1 (415) 555-0182', email: 'sarah.mitchell@acmecorp.com',
    priorContext: 'Spoke at SaaS Summit in March. Interested in reducing CAC. Uses Salesforce. Budget cycle resets in Q3.',
    callCount: 3, lastCalledAt: '2026-04-28T14:22:00Z', createdAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'mock-lead-2', name: 'James Chen',
    company: 'TechFlow Inc', title: 'CTO',
    phone: '+1 (650) 555-0247', email: 'j.chen@techflow.io',
    priorContext: 'Referred by David Park. Team of 40 engineers. Evaluating AI tooling for their sales team. Decision maker.',
    callCount: 1, lastCalledAt: '2026-05-01T10:15:00Z', createdAt: '2026-04-03T09:00:00Z',
  },
  {
    id: 'mock-lead-3', name: 'Maria Rodriguez',
    company: 'Global Dynamics', title: 'Head of Operations',
    phone: '+1 (312) 555-0091', email: 'mrodriguez@globaldyn.com',
    priorContext: 'Pain point: reps spend too much time on call prep. 150-person sales org. Currently using Gong.',
    callCount: 2, lastCalledAt: '2026-04-22T16:00:00Z', createdAt: '2026-04-05T09:00:00Z',
  },
  {
    id: 'mock-lead-4', name: 'David Park',
    company: 'ScaleUp Ventures', title: 'Founder & CEO',
    phone: '+1 (206) 555-0374', email: 'david@scaleupvc.com',
    priorContext: 'Portfolio includes 12 SaaS companies. Looking for tools for their portfolio companies. Angel investor.',
    callCount: 0, createdAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'mock-lead-5', name: 'Emily Watson',
    company: 'Enterprise Solutions', title: 'Director of IT',
    phone: '+1 (408) 555-0513', email: 'ewatson@entsolns.com',
    priorContext: 'Security-first buyer. Needs SOC 2 compliance. Budget approved. Waiting on legal review.',
    callCount: 4, lastCalledAt: '2026-05-02T11:30:00Z', createdAt: '2026-04-09T09:00:00Z',
  },
  {
    id: 'mock-lead-6', name: 'Michael Torres',
    company: 'CloudBase', title: 'VP of Engineering',
    phone: '+1 (512) 555-0629', email: 'mtorres@cloudbase.dev',
    priorContext: 'Downloaded whitepaper on AI sales coaching. Fast-growing startup, Series B. 25-person sales team.',
    callCount: 1, lastCalledAt: '2026-04-30T13:45:00Z', createdAt: '2026-04-11T09:00:00Z',
  },
  {
    id: 'mock-lead-7', name: 'Rachel Kim',
    company: 'DataDriven Co', title: 'Sales Manager',
    phone: '+1 (347) 555-0758', email: 'rachel.kim@datadriven.co',
    priorContext: 'Webinar attendee. Small team of 8 reps. Interested in rep coaching features. Trial expires June 1.',
    callCount: 0, createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'mock-lead-8', name: 'Alex Johnson',
    company: 'NovaSoft', title: 'COO',
    phone: '+1 (303) 555-0841', email: 'ajohnson@novasoft.com',
    priorContext: 'Lost deal last year to a competitor. Competitor contract up for renewal in August. Re-engagement opportunity.',
    callCount: 2, lastCalledAt: '2026-04-18T09:00:00Z', createdAt: '2026-04-17T09:00:00Z',
  },
  {
    id: 'mock-lead-9', name: 'Jennifer Lee',
    company: 'FinTech Pro', title: 'Director of Revenue',
    phone: '+1 (415) 555-0966', email: 'jennifer.lee@fintechpro.io',
    priorContext: 'Cold outbound. Fintech space — high compliance requirements. Mentioned Chorus.ai in LinkedIn post.',
    callCount: 0, createdAt: '2026-04-19T09:00:00Z',
  },
  {
    id: 'mock-lead-10', name: 'Tom Bradley',
    company: 'InnovateTech', title: 'Head of Product',
    phone: '+1 (617) 555-1072', email: 't.bradley@innovatetech.com',
    priorContext: 'Met at ProductCon. Not the decision maker but strong internal champion. Intro call scheduled.',
    callCount: 1, lastCalledAt: '2026-04-25T15:20:00Z', createdAt: '2026-04-21T09:00:00Z',
  },
  {
    id: 'mock-lead-11', name: 'Priya Nair',
    company: 'Momentum HQ', title: 'Chief Revenue Officer',
    phone: '+1 (646) 555-1188', email: 'priya@momentumhq.com',
    priorContext: 'Warm intro from mutual connection. 200+ rep sales floor. Aggressively expanding into EMEA this year.',
    callCount: 0, createdAt: '2026-04-23T09:00:00Z',
  },
  {
    id: 'mock-lead-12', name: 'Carlos Mendes',
    company: 'PivotLabs', title: 'Sales Enablement Lead',
    phone: '+1 (469) 555-1294', email: 'cmendes@pivotlabs.io',
    priorContext: 'Downloaded demo video. Runs enablement for 60 AEs. Previous tool was Salesloft — churned due to price.',
    callCount: 3, lastCalledAt: '2026-05-03T08:50:00Z', createdAt: '2026-04-25T09:00:00Z',
  },
];

const MOCK_LEAD_PACKAGE_MAP: Record<string, string> = {
  'mock-lead-1':  'mock-pkg-1',
  'mock-lead-2':  'mock-pkg-1',
  'mock-lead-3':  'mock-pkg-1',
  'mock-lead-4':  'mock-pkg-1',
  'mock-lead-5':  'mock-pkg-1',
  'mock-lead-6':  'mock-pkg-2',
  'mock-lead-7':  'mock-pkg-2',
  'mock-lead-8':  'mock-pkg-2',
  'mock-lead-9':  'mock-pkg-3',
  'mock-lead-10': 'mock-pkg-3',
  'mock-lead-11': 'mock-pkg-3',
  'mock-lead-12': 'mock-pkg-3',
};

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadsView = 'packages' | 'leads' | 'detail';

const EMPTY_FORM = { name: '', company: '', title: '', phone: '', email: '', priorContext: '' };

interface LeadsScreenProps {
  userId: string;
  onCallLead: (lead: Lead) => void;
  pastSessions: CallSession[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeadsScreen({ userId, onCallLead, pastSessions }: LeadsScreenProps) {
  const toast = useToast();
  const t = useTranslations();

  // Data
  const [leads,          setLeads]          = useState<Lead[]>([]);
  const [packages,       setPackages]       = useState<CrmPackage[]>([]);
  const [leadPackageMap, setLeadPackageMap] = useState<Record<string, string>>({});
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState(false);

  // Navigation
  const [view,            setView]            = useState<LeadsView>('packages');
  const [activePackageId, setActivePackageId] = useState<string | null>(null); // null = All Leads
  const [selectedLead,    setSelectedLead]    = useState<Lead | null>(null);

  // Add-lead form
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  // New-package form
  const [showNewPkg,  setShowNewPkg]  = useState(false);
  const [newPkgName,  setNewPkgName]  = useState('');

  // Other UI
  const [importStatus, setImportStatus] = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [data, pkgs, lmap] = await Promise.all([
        loadLeads(userId),
        loadPackages(userId),
        loadLeadPackageMap(userId),
      ]);
      if (data.length === 0 && pkgs.length === 0) {
        setLeads(MOCK_LEADS);
        setPackages(MOCK_PACKAGES);
        setLeadPackageMap(MOCK_LEAD_PACKAGE_MAP);
      } else {
        setLeads(data);
        setPackages(pkgs);
        setLeadPackageMap(lmap);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Leads visible in the current package (or all)
  const visibleLeads = useMemo(() => {
    if (activePackageId === null) return leads;
    return getLeadsForPackage(activePackageId, leads, leadPackageMap);
  }, [leads, activePackageId, leadPackageMap]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return visibleLeads;
    const q = searchQuery.toLowerCase();
    return visibleLeads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.company ?? '').toLowerCase().includes(q) ||
      (l.title ?? '').toLowerCase().includes(q)
    );
  }, [visibleLeads, searchQuery]);

  // Call sessions matched to the selected lead
  const leadSessions = useMemo(() => {
    if (!selectedLead) return [];
    const name    = selectedLead.name.toLowerCase();
    const company = (selectedLead.company ?? '').toLowerCase();
    return pastSessions
      .filter(s => {
        const pn = (s.config.prospectName ?? '').toLowerCase();
        const pc = (s.config.company ?? '').toLowerCase();
        if (pn !== name) return false;
        if (company && pc && pc !== company) return false;
        return true;
      })
      .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
  }, [selectedLead, pastSessions]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
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
      }, userId);
      if (activePackageId) {
        await assignLead(saved.id, activePackageId, userId);
        setLeadPackageMap(prev => ({ ...prev, [saved.id]: activePackageId }));
      }
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
    setLeads(prev => prev.filter(l => l.id !== id));
    deleteLead(id, userId).catch(() => {
      toast.error('Failed to delete lead.');
      fetchLeads();
    });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportStatus('Parsing...');
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length === 0) { setImportStatus('No valid leads found in file.'); return; }
    const truncated = parsed.length === 500;
    setImportStatus(`Importing ${parsed.length} leads...`);
    try {
      const newLeads = await importLeads(parsed, userId);
      if (activePackageId) {
        await Promise.all(newLeads.map(l => assignLead(l.id, activePackageId, userId)));
        const newMap = { ...leadPackageMap };
        for (const l of newLeads) newMap[l.id] = activePackageId;
        setLeadPackageMap(newMap);
      }
      setLeads(prev => [...newLeads, ...prev]);
      setImportStatus(`Imported ${newLeads.length} lead${newLeads.length !== 1 ? 's' : ''}.`);
      if (truncated) {
        toast.error('Only the first 500 rows were imported. Split your file to import the rest.');
      }
    } catch {
      setImportStatus('Import failed. Check file format.');
    }
    setTimeout(() => setImportStatus(''), 5000);
  }

  async function handleCreatePackage() {
    if (!newPkgName.trim()) return;
    const pkg: CrmPackage = {
      id:        `pkg-${Date.now()}`,
      name:      newPkgName.trim(),
      source:    'custom',
      createdAt: new Date().toISOString(),
    };
    setPackages(prev => [pkg, ...prev]);
    setNewPkgName('');
    setShowNewPkg(false);
    try {
      await savePackage(pkg, userId);
    } catch {
      toast.error('Failed to save package.');
      setPackages(prev => prev.filter(p => p.id !== pkg.id));
    }
  }

  async function handleDeletePackage(id: string) {
    setPackages(prev => prev.filter(p => p.id !== id));
    try {
      await removePackage(id, userId);
    } catch {
      toast.error('Failed to delete package.');
      fetchLeads(); // reload to restore state
    }
  }

  function openPackage(packageId: string | null) {
    setActivePackageId(packageId);
    setView('leads');
    setSearchQuery('');
    setShowForm(false);
  }

  function goBackToLeads() {
    setSelectedLead(null);
    setView('leads');
  }

  function goBackToPackages() {
    setSelectedLead(null);
    setActivePackageId(null);
    setView('packages');
    setShowForm(false);
  }

  const activePackage = packages.find(p => p.id === activePackageId) ?? null;

  // ── Packages view ────────────────────────────────────────────────────────────

  if (view === 'packages') {
    return (
      <div className="leads-screen" key="packages">
        <div className="leads-screen__header">
          <div className="leads-screen__header-left">
            <h1 className="leads-screen__title">{t.leads.title}</h1>
            <span className="leads-screen__count">{packages.length + 1}</span>
          </div>
          <div className="leads-screen__header-actions">
            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
            <button className="leads-screen__btn-import" onClick={() => fileInputRef.current?.click()}>
              {t.leads.importCRM}
            </button>
            <button
              className="leads-screen__btn-ghost"
              onClick={() => setShowNewPkg(v => !v)}
            >
              {showNewPkg ? `✕ ${t.common.cancel}` : t.leads.newPackage}
            </button>
          </div>
        </div>

        {importStatus && <p className="leads-screen__import-status leads-screen__import-status--top">{importStatus}</p>}

        {/* New-package form */}
        {showNewPkg && (
          <div className="leads-screen__pkg-form">
            <div className="leads-screen__pkg-form-row">
              <input
                className="leads-screen__input"
                placeholder={t.leads.packageNamePlaceholder}
                value={newPkgName}
                onChange={e => setNewPkgName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreatePackage()}
                autoFocus
              />
              <button
                className="leads-screen__btn-primary"
                onClick={handleCreatePackage}
                disabled={!newPkgName.trim()}
              >
                {t.leads.create}
              </button>
            </div>
          </div>
        )}

        {/* Package grid */}
        <div className="leads-screen__pkg-grid">
          {/* All Leads — always first */}
          <div
            className="leads-screen__pkg-card leads-screen__pkg-card--all"
            style={{ '--i': 0 } as React.CSSProperties}
            onClick={() => openPackage(null)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && openPackage(null)}
          >
            <div className="leads-screen__pkg-card-icon">◎</div>
            <div className="leads-screen__pkg-card-body">
              <div className="leads-screen__pkg-card-name">{t.leads.allLeads}</div>
              <div className="leads-screen__pkg-card-meta">
                {t.leads.leadCount(leads.length)}
              </div>
            </div>
            <div className="leads-screen__pkg-card-arrow">→</div>
          </div>

          {packages.map((pkg, idx) => {
            const count = getLeadsForPackage(pkg.id, leads, leadPackageMap).length;
            return (
              <div
                key={pkg.id}
                className="leads-screen__pkg-card"
                style={{ '--i': idx + 1 } as React.CSSProperties}
                onClick={() => openPackage(pkg.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openPackage(pkg.id)}
              >
                <div className="leads-screen__pkg-card-icon">◈</div>
                <div className="leads-screen__pkg-card-body">
                  <div className="leads-screen__pkg-card-name">{pkg.name}</div>
                  <div className="leads-screen__pkg-card-meta">
                    {t.leads.leadCount(count)}
                  </div>
                </div>
                <button
                  className="leads-screen__pkg-delete"
                  title={t.common.delete}
                  onClick={e => { e.stopPropagation(); handleDeletePackage(pkg.id); }}
                >
                  ✕
                </button>
                <div className="leads-screen__pkg-card-arrow">→</div>
              </div>
            );
          })}
        </div>

        {packages.length === 0 && !showNewPkg && (
          <p className="leads-screen__pkg-hint">
            {t.leads.packageHint}
          </p>
        )}
      </div>
    );
  }

  // ── Leads view ───────────────────────────────────────────────────────────────

  if (view === 'leads') {
    const pkgTitle = activePackage ? activePackage.name : 'All Leads';

    return (
      <div className="leads-screen" key="leads">
        <div className="leads-screen__header">
          <div className="leads-screen__header-left">
            <button className="leads-screen__back-btn" onClick={goBackToPackages}>← CRM</button>
            <h1 className="leads-screen__title">{pkgTitle.toUpperCase()}</h1>
            <span className="leads-screen__count">{visibleLeads.length}</span>
          </div>
          <div className="leads-screen__header-actions">
            {importStatus && <span className="leads-screen__import-status">{importStatus}</span>}
            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
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

        {/* Add-lead form */}
        {showForm && (
          <form className="leads-screen__form" onSubmit={handleAddLead}>
            <div className="leads-screen__form-row">
              <input className="leads-screen__input" placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              <input className="leads-screen__input" placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              <input className="leads-screen__input" placeholder="Job title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="leads-screen__form-row">
              <input className="leads-screen__input" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input className="leads-screen__input" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <textarea className="leads-screen__textarea" placeholder="Prior context / notes (optional)" value={form.priorContext} onChange={e => setForm(f => ({ ...f, priorContext: e.target.value }))} rows={2} />
            {formError && <p className="leads-screen__form-error">{formError}</p>}
            <div className="leads-screen__form-actions">
              <button type="submit" className="leads-screen__btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Lead'}</button>
            </div>
          </form>
        )}

        {/* Search */}
        {visibleLeads.length > 0 && (
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
            <button className="leads-screen__btn-primary" onClick={fetchLeads} style={{ marginTop: 12 }}>Retry</button>
          </div>
        ) : filtered.length === 0 && visibleLeads.length === 0 ? (
          <div className="leads-screen__empty">
            <div className="leads-screen__empty-icon">◎</div>
            <p className="leads-screen__empty-title">No leads in this package</p>
            <p className="leads-screen__empty-text">
              Import a CSV or add leads manually — they'll be automatically assigned to <strong>{pkgTitle}</strong>.
            </p>
            <p className="leads-screen__empty-hint">CSV headers: name, company, title, phone, email, notes</p>
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
                {filtered.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className="leads-screen__row leads-screen__row--clickable"
                    style={{ '--i': idx } as React.CSSProperties}
                    onClick={() => { setSelectedLead(lead); setView('detail'); }}
                  >
                    <td className="leads-screen__cell leads-screen__cell--name">
                      <span className="leads-screen__name">{lead.name}</span>
                      {lead.email && <span className="leads-screen__sub">{lead.email}</span>}
                    </td>
                    <td className="leads-screen__cell">{lead.company || <span className="leads-screen__muted">—</span>}</td>
                    <td className="leads-screen__cell">{lead.title || <span className="leads-screen__muted">—</span>}</td>
                    <td className="leads-screen__cell leads-screen__cell--date">{formatDate(lead.lastCalledAt)}</td>
                    <td className="leads-screen__cell leads-screen__cell--count">
                      {lead.callCount > 0
                        ? <span className="leads-screen__call-badge">{lead.callCount}</span>
                        : <span className="leads-screen__muted">0</span>}
                    </td>
                    <td className="leads-screen__cell leads-screen__cell--actions" onClick={e => e.stopPropagation()}>
                      <button className="leads-screen__call-btn" onClick={() => onCallLead(lead)} title={`Call ${lead.name}`}>Call →</button>
                      <button className="leads-screen__delete-btn" onClick={() => handleDelete(lead.id)} title="Delete lead" aria-label="Delete lead">✕</button>
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

  // ── Lead detail view ─────────────────────────────────────────────────────────

  if (view === 'detail' && selectedLead) {
    const pkgLabel = activePackage ? activePackage.name : 'All Leads';

    return (
      <div className="leads-screen" key="detail">
        <div className="leads-screen__header">
          <div className="leads-screen__header-left">
            <button className="leads-screen__back-btn" onClick={goBackToLeads}>← {pkgLabel}</button>
          </div>
          <div className="leads-screen__header-actions">
            <button className="leads-screen__btn-primary" onClick={() => onCallLead(selectedLead)}>
              ▶ Call Now
            </button>
          </div>
        </div>

        <div className="leads-screen__detail-wrap">
          {/* Contact hero */}
          <div className="leads-screen__contact-card">
            <div className="leads-screen__contact-avatar">
              {getInitials(selectedLead.name)}
            </div>
            <div className="leads-screen__contact-info">
              <h2 className="leads-screen__contact-name">{selectedLead.name}</h2>
              {(selectedLead.title || selectedLead.company) && (
                <p className="leads-screen__contact-sub">
                  {[selectedLead.title, selectedLead.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>

          {/* Contact fields */}
          <div className="leads-screen__contact-fields">
            {selectedLead.phone && (
              <div className="leads-screen__contact-field">
                <span className="leads-screen__field-label">PHONE</span>
                <a href={`tel:${selectedLead.phone}`} className="leads-screen__field-value leads-screen__field-link">
                  {selectedLead.phone}
                </a>
              </div>
            )}
            {selectedLead.email && (
              <div className="leads-screen__contact-field">
                <span className="leads-screen__field-label">EMAIL</span>
                <a href={`mailto:${selectedLead.email}`} className="leads-screen__field-value leads-screen__field-link">
                  {selectedLead.email}
                </a>
              </div>
            )}
            {selectedLead.priorContext && (
              <div className="leads-screen__contact-field leads-screen__contact-field--full">
                <span className="leads-screen__field-label">CONTEXT</span>
                <p className="leads-screen__field-value leads-screen__field-context">{selectedLead.priorContext}</p>
              </div>
            )}
          </div>

          {/* Call history */}
          <div className="leads-screen__history-section">
            <div className="leads-screen__history-header">
              <span className="leads-screen__history-title">CALL HISTORY</span>
              <span className="leads-screen__count">{leadSessions.length}</span>
            </div>

            {leadSessions.length === 0 ? (
              <div className="leads-screen__history-empty">
                No calls recorded for this contact yet.
              </div>
            ) : (
              <div className="leads-screen__history-list">
                {leadSessions.map((session, i) => {
                  const pl = session.finalCloseProbability >= 61 ? 'high' : session.finalCloseProbability >= 31 ? 'medium' : 'low';
                  const sl = session.leadScore >= 70 ? 'high' : session.leadScore >= 40 ? 'medium' : 'low';
                  return (
                    <div key={i} className="leads-screen__history-card">
                      <div className="leads-screen__history-card-left">
                        <div className="leads-screen__history-date">{formatDateShort(session.endedAt)}</div>
                        <div className="leads-screen__history-goal">{session.config.callGoal}</div>
                      </div>
                      <div className="leads-screen__history-card-right">
                        <span className={`leads-screen__score-pill leads-screen__score-pill--${pl}`}>
                          {session.finalCloseProbability}% close
                        </span>
                        <span className={`leads-screen__score-pill leads-screen__score-pill--${sl}`}>
                          score {session.leadScore}
                        </span>
                        <span className="leads-screen__history-dur">{formatDuration(session.durationSeconds)}</span>
                        <span className={`leads-screen__stage-badge leads-screen__stage-badge--${session.callStage}`}>
                          {session.callStage.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
