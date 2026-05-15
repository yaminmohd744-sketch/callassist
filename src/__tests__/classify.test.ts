import { describe, it, expect } from 'vitest';
import { classifySignal } from '../lib/keywords';

describe('classifySignal', () => {
  it('detects objections by keyword', () => {
    expect(classifySignal("that's too expensive for us")).toBe('objection');
    expect(classifySignal("we need to think about this")).toBe('objection');
    expect(classifySignal("not interested at all")).toBe('objection');
    expect(classifySignal("no budget right now")).toBe('objection');
  });

  it('detects buying signals by keyword', () => {
    expect(classifySignal("when can we get started?")).toBe('buying-signal');
    expect(classifySignal("that sounds good to me")).toBe('buying-signal');
    expect(classifySignal("tell me more about this")).toBe('buying-signal');
    expect(classifySignal("how much does it cost?")).toBe('buying-signal');
  });

  it('returns neutral for unclassified text', () => {
    expect(classifySignal("Hello, how are you today?")).toBe('neutral');
    expect(classifySignal("The weather has been nice lately")).toBe('neutral');
    expect(classifySignal("")).toBe('neutral');
  });

  it('is case-insensitive', () => {
    expect(classifySignal("NOT INTERESTED")).toBe('objection');
    expect(classifySignal("SOUNDS GOOD")).toBe('buying-signal');
  });
});
