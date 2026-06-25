import { describe, it, expect } from 'vitest';
import { extractText, extractParticipant, type RecallTranscriptData } from '../lib/recallTranscript';

describe('extractText', () => {
  it('joins words from the nested data.words shape', () => {
    const payload: RecallTranscriptData = {
      data: { words: [{ text: 'Hello' }, { text: 'there' }, { text: 'friend' }] },
    };
    expect(extractText(payload)).toBe('Hello there friend');
  });

  it('joins words from the top-level words shape', () => {
    expect(extractText({ words: [{ text: 'no' }, { text: 'budget' }] })).toBe('no budget');
  });

  it('falls back to transcript.text', () => {
    expect(extractText({ transcript: { text: '  spaced out  ' } })).toBe('spaced out');
  });

  it('falls back to top-level text', () => {
    expect(extractText({ text: 'plain text' })).toBe('plain text');
  });

  it('collapses repeated whitespace from missing word tokens', () => {
    expect(extractText({ words: [{ text: 'a' }, {}, { text: 'b' }] })).toBe('a b');
  });

  it('returns empty string for empty/missing payloads', () => {
    expect(extractText(null)).toBe('');
    expect(extractText(undefined)).toBe('');
    expect(extractText({})).toBe('');
    expect(extractText({ words: [] })).toBe('');
  });
});

describe('extractParticipant', () => {
  it('reads the nested data.participant shape', () => {
    const p = extractParticipant({ data: { participant: { id: 1, name: 'Rep', is_host: true } } });
    expect(p?.name).toBe('Rep');
    expect(p?.is_host).toBe(true);
  });

  it('reads the top-level participant shape', () => {
    expect(extractParticipant({ participant: { id: 'abc' } })?.id).toBe('abc');
  });

  it('returns undefined when absent', () => {
    expect(extractParticipant({})).toBeUndefined();
    expect(extractParticipant(null)).toBeUndefined();
  });
});
