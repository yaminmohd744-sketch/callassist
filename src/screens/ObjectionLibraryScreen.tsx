import { useState } from 'react';
import {
  loadCustomObjections,
  addCustomObjection,
  updateCustomObjection,
  deleteCustomObjection,
} from '../lib/objectionLibrary';
import type { CustomObjectionEntry } from '../lib/objectionLibrary';
import './ObjectionLibraryScreen.css';

interface ObjectionLibraryScreenProps {
  onBack: () => void;
}

interface FormState {
  keyword: string;
  label: string;
  responseFirst: string;
  responseRepeat: string;
}

const emptyForm: FormState = { keyword: '', label: '', responseFirst: '', responseRepeat: '' };

export function ObjectionLibraryScreen({ onBack }: ObjectionLibraryScreenProps) {
  const [entries, setEntries] = useState<CustomObjectionEntry[]>(() => loadCustomObjections());
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function refresh() {
    setEntries(loadCustomObjections());
  }

  function handleAdd() {
    if (!form.keyword.trim() || !form.label.trim() || !form.responseFirst.trim()) {
      setFormError('Keyword, label, and first response are required.');
      return;
    }
    addCustomObjection(form);
    setForm(emptyForm);
    setShowAdd(false);
    setFormError('');
    refresh();
  }

  function handleEdit(entry: CustomObjectionEntry) {
    setEditing(entry.id);
    setForm({ keyword: entry.keyword, label: entry.label, responseFirst: entry.responseFirst, responseRepeat: entry.responseRepeat });
    setShowAdd(false);
    setFormError('');
  }

  function handleSaveEdit() {
    if (!editing) return;
    if (!form.keyword.trim() || !form.label.trim() || !form.responseFirst.trim()) {
      setFormError('Keyword, label, and first response are required.');
      return;
    }
    updateCustomObjection(editing, form);
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    refresh();
  }

  function handleDelete(id: string) {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      return;
    }
    deleteCustomObjection(id);
    if (editing === id) { setEditing(null); setForm(emptyForm); }
    setPendingDelete(null);
    refresh();
  }

  function cancelForm() {
    setEditing(null);
    setShowAdd(false);
    setForm(emptyForm);
    setFormError('');
  }

  const isFormOpen = showAdd || editing !== null;

  return (
    <div className="objlib">
      <div className="objlib__card">
        <div className="objlib__header">
          <button className="objlib__back" onClick={onBack}>← BACK</button>
          <div className="objlib__logo">PITCH<span className="lp__logo-plus">PLUS</span><span className="lp__logo-sym">+</span></div>
        </div>

        <div className="objlib__title-row">
          <div>
            <h2 className="objlib__title">Objection Library</h2>
            <p className="objlib__desc">Custom responses that fire during live calls, overriding the built-in defaults for matching keywords.</p>
          </div>
          {!isFormOpen && (
            <button className="objlib__add-btn" onClick={() => { setShowAdd(true); setEditing(null); setForm(emptyForm); setFormError(''); }}>
              + Add Response
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="objlib__form">
            <h3 className="objlib__form-title">{editing ? 'Edit Entry' : 'New Custom Response'}</h3>
            <div className="objlib__form-row">
              <div className="objlib__form-field">
                <label className="objlib__label">TRIGGER KEYWORD <span className="objlib__required">*</span></label>
                <input
                  className="objlib__input"
                  placeholder='e.g. "too expensive", "no budget"'
                  value={form.keyword}
                  onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
                />
              </div>
              <div className="objlib__form-field">
                <label className="objlib__label">DISPLAY LABEL <span className="objlib__required">*</span></label>
                <input
                  className="objlib__input"
                  placeholder='e.g. "Security Objection"'
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                />
              </div>
            </div>
            <div className="objlib__form-field">
              <label className="objlib__label">FIRST RESPONSE <span className="objlib__required">*</span></label>
              <textarea
                className="objlib__textarea"
                rows={3}
                placeholder="What to say the first time this objection comes up..."
                value={form.responseFirst}
                onChange={e => setForm(f => ({ ...f, responseFirst: e.target.value }))}
              />
            </div>
            <div className="objlib__form-field">
              <label className="objlib__label">REPEAT / ESCALATION RESPONSE</label>
              <textarea
                className="objlib__textarea"
                rows={3}
                placeholder="What to say if this objection repeats (leave blank to reuse first response)..."
                value={form.responseRepeat}
                onChange={e => setForm(f => ({ ...f, responseRepeat: e.target.value }))}
              />
            </div>
            {formError && <p className="objlib__form-error">{formError}</p>}
            <div className="objlib__form-actions">
              <button className="objlib__save-btn" onClick={editing ? handleSaveEdit : handleAdd}>
                {editing ? 'Save Changes' : 'Add to Library'}
              </button>
              <button className="objlib__cancel-btn" onClick={cancelForm}>Cancel</button>
            </div>
          </div>
        )}

        {entries.length === 0 && !isFormOpen ? (
          <div className="objlib__empty">
            <div className="objlib__empty-icon">◈</div>
            <p className="objlib__empty-title">No custom responses yet</p>
            <p className="objlib__empty-desc">Add responses to override the built-in defaults for specific keywords during live calls.</p>
          </div>
        ) : (
          <div className="objlib__list">
            {entries.map(entry => (
              <div key={entry.id} className={`objlib__entry ${editing === entry.id ? 'objlib__entry--editing' : ''}`}>
                <div className="objlib__entry-top">
                  <span className="objlib__entry-keyword">{entry.keyword}</span>
                  <span className="objlib__entry-label">{entry.label}</span>
                </div>
                <p className="objlib__entry-preview">
                  {entry.responseFirst.length > 90 ? entry.responseFirst.slice(0, 90) + '…' : entry.responseFirst}
                </p>
                <div className="objlib__entry-actions">
                  <button className="objlib__entry-edit" onClick={() => handleEdit(entry)}>Edit</button>
                  <button
                    className={`objlib__entry-delete ${pendingDelete === entry.id ? 'objlib__entry-delete--confirm' : ''}`}
                    onClick={() => handleDelete(entry.id)}
                    onBlur={() => setPendingDelete(null)}
                  >
                    {pendingDelete === entry.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="objlib__hint-box">
          <p className="objlib__hint">◎ Custom keywords are matched against live transcript text (case-insensitive).</p>
          <p className="objlib__hint">◎ If a custom keyword matches a built-in one, your custom response wins.</p>
          <p className="objlib__hint">◎ Changes take effect on the next call — no restart required.</p>
        </div>
      </div>
    </div>
  );
}
