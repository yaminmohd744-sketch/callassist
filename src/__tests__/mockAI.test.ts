import { describe, it, expect } from 'vitest';
import { detectStage } from '../lib/mockAI';

describe('detectStage', () => {
  it('returns opener for the first 60 seconds', () => {
    expect(detectStage(0)).toBe('opener');
    expect(detectStage(30)).toBe('opener');
    expect(detectStage(59)).toBe('opener');
  });

  it('transitions to discovery at 60s', () => {
    expect(detectStage(60)).toBe('discovery');
    expect(detectStage(90)).toBe('discovery');
    expect(detectStage(119)).toBe('discovery');
  });

  it('transitions to pitch at 120s', () => {
    expect(detectStage(120)).toBe('pitch');
    expect(detectStage(180)).toBe('pitch');
    expect(detectStage(239)).toBe('pitch');
  });

  it('transitions to close at 240s', () => {
    expect(detectStage(240)).toBe('close');
    expect(detectStage(600)).toBe('close');
    expect(detectStage(3600)).toBe('close');
  });
});
