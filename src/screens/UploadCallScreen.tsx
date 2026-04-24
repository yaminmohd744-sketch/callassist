import { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { generateSessionSummary } from '../lib/ai';
import { classifySignal } from '../lib/keywords';
import type { CallConfig, CallSession, TranscriptEntry } from '../types';
import { genId } from '../lib/id';
import './UploadCallScreen.css';

interface UploadCallScreenProps {
  onEndCall: (session: CallSession) => void;
  onBack: () => void;
}

interface ParseResult {
  entries: TranscriptEntry[];
  /** Lines that had no speaker prefix and fell back to alternating assignment */
  unparsedCount: number;
}

function parseTranscript(text: string): ParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const entries: TranscriptEntry[] = [];
  let turn = 0;
  let unparsedCount = 0;

  for (const line of lines) {
    if (/^(call date|duration|recording|file|date|time):/i.test(line)) continue;

    const repMatch = line.match(/^(rep|you|agent|sales|salesperson|caller|me|us):\s*/i);
    const prospectMatch = line.match(/^(prospect|customer|client|buyer|lead|them|contact):\s*/i);

    let speaker: 'rep' | 'prospect';
    let content: string;

    if (repMatch) {
      speaker = 'rep';
      content = line.slice(repMatch[0].length).trim();
    } else if (prospectMatch) {
      speaker = 'prospect';
      content = line.slice(prospectMatch[0].length).trim();
    } else {
      // Alternating lines: even = rep, odd = prospect
      speaker = turn % 2 === 0 ? 'rep' : 'prospect';
      content = line;
      unparsedCount++;
    }

    if (!content) continue;

    entries.push({
      id: genId(),
      speaker,
      text: content,
      timestampSeconds: turn * 15,
      signal: speaker === 'prospect' ? classifySignal(content) : 'neutral',
    });
    turn++;
  }
  return { entries, unparsedCount };
}

export function UploadCallScreen({ onEndCall, onBack }: UploadCallScreenProps) {
  const t = useTranslations();
  const [prospectName, setProspectName] = useState('');
  const [company, setCompany] = useState('');
  const [callGoal, setCallGoal] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [parseWarning, setParseWarning] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setTranscriptText((ev.target?.result as string) ?? '');
    reader.onerror = () => setError('Could not read file. Please try another file.');
    reader.readAsText(file);
  }

  async function handleAnalyze() {
    const text = transcriptText.trim();
    if (!text) { setError('Paste a transcript or upload a .txt file first.'); return; }
    setError('');
    setParseWarning('');
    setIsProcessing(true);

    try {
      const config: CallConfig = {
        prospectName: prospectName.trim() || 'Unknown',
        company: company.trim() || '',
        callGoal: callGoal.trim() || 'Sales call',
        yourPitch: '',
        language: 'en-US',
      };

      const { entries: transcript, unparsedCount } = parseTranscript(text);
      if (unparsedCount > 0) {
        setParseWarning(
          `${unparsedCount} line${unparsedCount > 1 ? 's' : ''} had no "REP:" / "PROSPECT:" prefix — speaker was guessed by alternating order. Check the transcript if results look off.`
        );
      }
      if (transcript.length === 0) {
        setError('Could not parse the transcript. Check the format and try again.');
        setIsProcessing(false);
        return;
      }

      const objectionsCount = transcript.filter(e => e.signal === 'objection').length;
      const buyingSignals   = transcript.filter(e => e.signal === 'buying-signal').length;
      const finalCloseProbability = Math.max(5, Math.min(95, 50 + buyingSignals * 8 - objectionsCount * 10));

      // Estimate duration from word count at ~130 wpm average speaking pace
      const totalWords = transcript.reduce((s, e) => s + e.text.split(/\s+/).length, 0);
      const durationSeconds = Math.max(30, Math.round((totalWords / 130) * 60));

      const { aiSummary, followUpEmail, leadScore, coaching } = await generateSessionSummary(
        config, transcript, [], finalCloseProbability, objectionsCount
      );

      try { localStorage.setItem('callassist:nextCallTip', coaching.nextCallTip); } catch { /* storage full */ }

      const session: CallSession = {
        config,
        transcript,
        suggestions: [],
        durationSeconds,
        finalCloseProbability,
        objectionsCount,
        callStage: 'discovery',
        endedAt: new Date().toISOString(),
        aiSummary,
        followUpEmail,
        leadScore,
        notes: [],
        coaching,
      };

      onEndCall(session);
    } catch {
      setError('Analysis failed. Please try again.');
      setIsProcessing(false);
    }
  }

  return (
    <div className="upload-call">
      <div className="upload-call__header">
        <button className="upload-call__back" onClick={onBack}>← {t.postcall.backToDashboard}</button>
        <h1 className="upload-call__title">{t.upload.title}</h1>
        <p className="upload-call__sub">
          Paste a transcript or upload a .txt file to get an AI summary, follow-up email, and lead score.
        </p>
      </div>

      <div className="upload-call__body">
        <div className="upload-call__form">
          <div className="upload-call__section-label">CALL DETAILS</div>
          <div className="upload-call__fields">
            <div className="upload-call__field">
              <label className="upload-call__label">Prospect Name</label>
              <input
                className="upload-call__input"
                placeholder="Jane Smith"
                value={prospectName}
                onChange={e => setProspectName(e.target.value)}
              />
            </div>
            <div className="upload-call__field">
              <label className="upload-call__label">Company</label>
              <input
                className="upload-call__input"
                placeholder="Acme Corp"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>
            <div className="upload-call__field upload-call__field--wide">
              <label className="upload-call__label">Call Goal</label>
              <input
                className="upload-call__input"
                placeholder="Book a discovery meeting"
                value={callGoal}
                onChange={e => setCallGoal(e.target.value)}
              />
            </div>
          </div>

          <div className="upload-call__section-label">TRANSCRIPT</div>

          <label className="upload-call__file-zone" htmlFor="transcript-file">
            <span className="upload-call__file-icon">⬆</span>
            <span className="upload-call__file-name">
              {fileName || 'Click to upload .txt file'}
            </span>
            <span className="upload-call__file-hint">or paste your transcript below</span>
          </label>
          <input
            id="transcript-file"
            type="file"
            accept=".txt"
            className="upload-call__file-input"
            onChange={handleFileChange}
          />

          <div className="upload-call__format-hint">
            Supported formats: <code>REP: text</code> / <code>PROSPECT: text</code> per line,
            or alternating lines (even = rep, odd = prospect).
          </div>

          <textarea
            className="upload-call__textarea"
            placeholder={`REP: Hi Jane, Alex from SalesBoost. Got a quick minute?\nPROSPECT: Sure, what's this about?\nREP: We help logistics teams cut their close cycle by 30%...\nPROSPECT: How much does it cost?`}
            value={transcriptText}
            onChange={e => setTranscriptText(e.target.value)}
            rows={16}
          />

          {parseWarning && <div className="upload-call__warning">{parseWarning}</div>}
          {error && <div className="upload-call__error">{error}</div>}

          <div className="upload-call__actions">
            <button
              className="upload-call__btn upload-call__btn--primary"
              onClick={handleAnalyze}
              disabled={isProcessing || !transcriptText.trim()}
            >
              {isProcessing
                ? <><span className="upload-call__spinner" /> {t.upload.analyzing}</>
                : `◈ ${t.upload.browseFiles}`}
            </button>
            <button
              className="upload-call__btn upload-call__btn--ghost"
              onClick={onBack}
              disabled={isProcessing}
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
