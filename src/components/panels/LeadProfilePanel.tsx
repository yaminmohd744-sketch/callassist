
import { ProbabilityMeter } from '../ui/ProbabilityMeter';
import type { CallConfig, QuickAction } from '../../types';
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

const QUICK_ACTIONS: { id: QuickAction; label: string }[] = [
  { id: 'summarize',      label: 'Summarize call' },
  { id: 'follow-up-email', label: 'Generate follow-up email' },
  { id: 'export-lead',    label: 'Export lead data' },
  { id: 'score-lead',     label: 'Score this lead' },
];

export function LeadProfilePanel({ config, closeProbability, objectionsCount, onAction, notes, noteInput, onNoteChange, onAddNote }: LeadProfilePanelProps) {
  return (
    <div className="lead-panel">
      <div className="lead-panel__section">
        <div className="lead-panel__section-title">LEAD PROFILE</div>
        <div className="lead-panel__fields">
          {config.prospectName && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">Name</span>
              <span className="lead-panel__field-val">{config.prospectName}</span>
            </div>
          )}
          {config.company && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">Company</span>
              <span className="lead-panel__field-val">{config.company}</span>
            </div>
          )}
          {config.callGoal && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">Goal</span>
              <span className="lead-panel__field-val">{config.callGoal}</span>
            </div>
          )}
          {config.yourPitch && (
            <div className="lead-panel__field lead-panel__field--block">
              <span className="lead-panel__field-key">Pitch</span>
              <span className="lead-panel__field-val lead-panel__field-val--muted">{config.yourPitch}</span>
            </div>
          )}
          {!config.prospectName && !config.company && (
            <div className="lead-panel__empty-profile">
              No lead data extracted yet. Start a conversation to build the profile.
            </div>
          )}
        </div>
      </div>

      <div className="lead-panel__divider" />

      <div className="lead-panel__section">
        <div className="lead-panel__section-title">CALL STATS</div>
        <div className="lead-panel__stats">
          <div className="lead-panel__stat">
            <span className="lead-panel__stat-label">Objections</span>
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
        <div className="lead-panel__section-title">QUICK ACTIONS</div>
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
        <div className="lead-panel__section-title">CALL NOTES</div>
        {notes.length > 0 && (
          <div className="lead-panel__notes-list">
            {notes.map((n, i) => <div key={i} className="lead-panel__note">{n}</div>)}
          </div>
        )}
        <div className="lead-panel__notes-input-row">
          <input
            className="lead-panel__note-input"
            placeholder="Add note..."
            value={noteInput}
            onChange={e => onNoteChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddNote(); } }}
          />
          <button className="lead-panel__note-btn" onClick={onAddNote}>+</button>
        </div>
      </div>
    </div>
  );
}
