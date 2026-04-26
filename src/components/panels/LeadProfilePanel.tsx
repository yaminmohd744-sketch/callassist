
import { ProbabilityMeter } from '../ui/ProbabilityMeter';
import type { CallConfig, QuickAction } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './LeadProfilePanel.css';

interface LeadProfilePanelProps {
  config: CallConfig;
  closeProbability: number;
  objectionsCount: number;
  onAction: (action: QuickAction) => void;
  notes: string[];
  noteInput: string;
  onNoteChange: (v: string) => void;
  onAddNote: () => void;
}

export function LeadProfilePanel({ config, closeProbability, objectionsCount, onAction, notes, noteInput, onNoteChange, onAddNote }: LeadProfilePanelProps) {
  const t = useTranslations();

  const QUICK_ACTIONS: { id: QuickAction; label: string }[] = [
    { id: 'summarize',       label: t.liveCall.summarizeCall },
    { id: 'follow-up-email', label: t.liveCall.generateEmail },
    { id: 'export-lead',     label: t.liveCall.exportLead },
    { id: 'score-lead',      label: t.liveCall.scoreLead },
  ];

  return (
    <div className="lead-panel">
      <div className="lead-panel__section">
        <div className="lead-panel__section-title">{t.liveCall.leadProfile}</div>
        <div className="lead-panel__fields">
          {config.prospectName && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">{t.liveCall.name}</span>
              <span className="lead-panel__field-val">{config.prospectName}</span>
            </div>
          )}
          {config.company && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">{t.liveCall.company}</span>
              <span className="lead-panel__field-val">{config.company}</span>
            </div>
          )}
          {config.callGoal && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">{t.liveCall.goal}</span>
              <span className="lead-panel__field-val">{config.callGoal}</span>
            </div>
          )}
          {config.yourPitch && (
            <div className="lead-panel__field lead-panel__field--block">
              <span className="lead-panel__field-key">{t.liveCall.pitch}</span>
              <span className="lead-panel__field-val lead-panel__field-val--muted">{config.yourPitch}</span>
            </div>
          )}
          {!config.prospectName && !config.company && (
            <div className="lead-panel__empty-profile">
              {t.liveCall.noLeadData}
            </div>
          )}
        </div>
      </div>

      <div className="lead-panel__divider" />

      <div className="lead-panel__section">
        <div className="lead-panel__section-title">{t.liveCall.callStats}</div>
        <div className="lead-panel__stats">
          <div className="lead-panel__stat">
            <span className="lead-panel__stat-label">{t.liveCall.objections}</span>
            <span className={`lead-panel__stat-val ${objectionsCount > 0 ? 'lead-panel__stat-val--red' : ''}`}>
              {objectionsCount}
            </span>
          </div>
        </div>
        <div className="lead-panel__prob">
          <ProbabilityMeter value={closeProbability} />
        </div>
      </div>

      <div className="lead-panel__divider" />

      <div className="lead-panel__section">
        <div className="lead-panel__section-title">{t.liveCall.quickActions}</div>
        <div className="lead-panel__actions">
          {QUICK_ACTIONS.map(({ id, label }) => (
            <button
              key={id}
              className="lead-panel__action"
              onClick={() => onAction(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="lead-panel__divider" />

      <div className="lead-panel__section lead-panel__section--notes">
        <div className="lead-panel__section-title">{t.liveCall.callNotes}</div>
        {notes.length > 0 && (
          <div className="lead-panel__notes-list">
            {notes.map((n, i) => <div key={i} className="lead-panel__note">{n}</div>)}
          </div>
        )}
        <div className="lead-panel__notes-input-row">
          <input
            className="lead-panel__note-input"
            placeholder={t.liveCall.addNote}
            value={noteInput}
            onChange={e => onNoteChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddNote(); } }}
          />
          <button className="lead-panel__note-btn" onClick={onAddNote} aria-label="Add note">+</button>
        </div>
      </div>
    </div>
  );
}
