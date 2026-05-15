import { describe, it, expect } from 'vitest';
import { extractAutoNote } from '../lib/autoNotes';

describe('extractAutoNote', () => {
  it('detects explicit clock time references', () => {
    // Standalone time mention — no meeting pattern should fire first
    const result = extractAutoNote("3pm works for me", 120);
    expect(result).not.toBeNull();
    expect(result).toContain('3pm');
  });

  it('detects meeting scheduling phrases', () => {
    const result = extractAutoNote("Can we schedule a call next week?", 60);
    expect(result).not.toBeNull();
  });

  it('detects commitment phrases', () => {
    const result = extractAutoNote("I will send you the proposal tomorrow", 90);
    expect(result).not.toBeNull();
  });

  it('does NOT generate notes for bare time-of-day words', () => {
    expect(extractAutoNote("Good morning, how are you?", 0)).toBeNull();
    expect(extractAutoNote("Have a good afternoon!", 30)).toBeNull();
    expect(extractAutoNote("Good evening everyone", 10)).toBeNull();
  });

  it('returns null for generic text', () => {
    expect(extractAutoNote("That sounds interesting", 45)).toBeNull();
    expect(extractAutoNote("I appreciate your time", 10)).toBeNull();
  });

  it('includes a timestamp prefix in the output', () => {
    const result = extractAutoNote("Can we schedule a demo next Monday?", 125);
    expect(result).toMatch(/^\d+:\d{2}/);
  });
});
