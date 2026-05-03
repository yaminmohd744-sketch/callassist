import { ProbabilityMeter } from '../ui/ProbabilityMeter';
import type { CallConfig } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import './LeadProfilePanel.css';

interface LeadProfilePanelProps {
  config: CallConfig;
  closeProbability: number;
  objectionsCount: number;
  notes: string[];
  noteInput: string;
  onNoteChange: (v: string) => void;
  onAddNote: () => void;
}

export function LeadProfilePanel({ config, closeProbability, objectionsCount, notes, noteInput, onNoteChange, onAddNote }: LeadProfilePanelProps) {
  const t = useTranslations();

  const perks = config.yourPitch
    ? config.yourPitch.split('\n').map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="lead-panel">

      {/* ── This Call ── */}
      <div className="lead-panel__section">
        <div className="lead-panel__section-title">This Call</div>
        <div className="lead-panel__fields">
          {config.prospectName && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">Prospect</span>
              <span className="lead-panel__field-val">{config.prospectName}</span>
            </div>
          )}
          {config.company && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">Company</span>
              <span className="lead-panel__field-val">{config.company}</span>
            </div>
          )}
          {config.callType && (
            <div className="lead-panel__field">
              <span className="lead-panel__field-key">Type</span>
              <span className="lead-panel__field-val lead-panel__field-val--chip">{config.callType}</span>
            </div>
          )}
          {config.callGoal && (
            <div className="lead-panel__field lead-panel__field--block">
              <span className="lead-panel__field-key">Goal</span>
              <span className="lead-panel__field-val lead-panel__field-val--muted">{config.callGoal}</span>
            </div>
          )}
          {!config.prospectName && !config.company && !config.callGoal && (
            <div className="lead-panel__empty">Cold call</div>
          )}
        </div>
      </div>

      <div className="lead-panel__divider" />

      {/* ── Close Probability ── */}
      <div className="lead-panel__section lead-panel__section--compact">
        <div className="lead-panel__prob-header">
          <span className="lead-panel__section-title">Close Prob</span>
          <span className={`lead-panel__prob-pct${objectionsCount > 0 ? ' lead-panel__prob-pct--warn' : ''}`}>
            {closeProbability}%
            {objectionsCount > 0 && <span className="lead-panel__obj-badge">{objectionsCount} obj</span>}
          </span>
        </div>
        <ProbabilityMeter value={closeProbability} />
      </div>

      <div className="lead-panel__divider" />

      {/* ── Your Perks ── */}
      {perks.length > 0 && (
        <>
          <div className="lead-panel__section">
            <div className="lead-panel__section-title">Your Perks</div>
            <ul className="lead-panel__perks">
              {perks.map((perk, i) => (
                <li key={i} className="lead-panel__perk">
                  <span className="lead-panel__perk-dot">◆</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
          <div className="lead-panel__divider" />
        </>
      )}

      {/* ── Notes ── */}
      <div className="lead-panel__section lead-panel__section--notes">
        <div className="lead-panel__section-title">{t.liveCall.callNotes}</div>

        {notes.length > 0 ? (
          <div className="lead-panel__notes-list">
            {notes.map((n, i) => {
              const isAuto = n.startsWith('◆ ');
              return (
                <div key={i} className={`lead-panel__note${isAuto ? ' lead-panel__note--auto' : ''}`}>
                  {isAuto ? (
                    <>
                      <span className="lead-panel__note-auto-tag">AUTO</span>
                      <span>{n.slice(2)}</span>
                    </>
                  ) : n}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="lead-panel__notes-empty">
            Notes will appear here automatically when the prospect mentions dates, commitments, tools, or next steps.
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
