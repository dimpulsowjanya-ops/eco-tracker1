import { describe, it, expect } from 'vitest';
import { generateSuggestions, getStreakLevel, answerQuestion } from '../utils/aiEngine.js';

// ── generateSuggestions ───────────────────────────────────────────────────────
describe('generateSuggestions', () => {
  it('returns general suggestions when logs are empty', () => {
    const result = generateSuggestions([], 0, 0);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.priority).toBeNull();
  });

  it('identifies Transport as top category', () => {
    const logs = [
      { category: 'Transport', co2: 10 },
      { category: 'Energy', co2: 2 },
    ];
    const result = generateSuggestions(logs, 12, 0);
    expect(result.priority).toBe('Transport');
  });

  it('identifies Food as top category', () => {
    const logs = [
      { category: 'Food', co2: 15 },
      { category: 'Transport', co2: 3 },
    ];
    const result = generateSuggestions(logs, 18, 0);
    expect(result.priority).toBe('Food');
  });

  it('identifies Energy as top category', () => {
    const logs = [
      { category: 'Energy', co2: 20 },
      { category: 'Water', co2: 1 },
    ];
    const result = generateSuggestions(logs, 21, 0);
    expect(result.priority).toBe('Energy');
  });

  it('returns up to 4 suggestions', () => {
    const logs = [{ category: 'Transport', co2: 10 }];
    const result = generateSuggestions(logs, 10, 0);
    expect(result.suggestions.length).toBeLessThanOrEqual(4);
  });

  it('includes an insight string', () => {
    const logs = [{ category: 'Transport', co2: 5 }];
    const result = generateSuggestions(logs, 5, 0);
    expect(typeof result.insight).toBe('string');
    expect(result.insight.length).toBeGreaterThan(0);
  });

  it('returns net-zero message when CO2 is 0', () => {
    const logs = [{ category: 'Transport', co2: 5 }];
    const result = generateSuggestions(logs, 0, 50);
    expect(result.insight).toContain('net-zero');
  });

  it('includes breakdown in result', () => {
    const logs = [{ category: 'Transport', co2: 10 }];
    const result = generateSuggestions(logs, 10, 0);
    expect(result.breakdown).toBeDefined();
  });
});

// ── getStreakLevel ────────────────────────────────────────────────────────────
describe('getStreakLevel', () => {
  it('returns Getting Started for 0 habits', () => {
    expect(getStreakLevel(0).level).toBe('Getting Started');
  });

  it('returns Eco Starter for 3 habits', () => {
    expect(getStreakLevel(3).level).toBe('Eco Starter');
  });

  it('returns Green Hero for 6 habits', () => {
    expect(getStreakLevel(6).level).toBe('Green Hero');
  });

  it('returns Eco Legend for 10+ habits', () => {
    expect(getStreakLevel(10).level).toBe('Eco Legend');
    expect(getStreakLevel(15).level).toBe('Eco Legend');
  });

  it('returns an emoji for each level', () => {
    [0, 3, 6, 10].forEach(n => {
      expect(getStreakLevel(n).emoji).toBeTruthy();
    });
  });
});

// ── answerQuestion ────────────────────────────────────────────────────────────
describe('answerQuestion', () => {
  it('returns a fallback message for empty queries', () => {
    const res = answerQuestion('');
    expect(res).toContain('help');
  });

  it('returns transport insights when transport is queried', () => {
    const res = answerQuestion('how can I reduce car transport footprint?');
    expect(res).toContain('Transport Footprint Insight');
  });

  it('returns food insights when meat is queried', () => {
    const res = answerQuestion('what about eating beef and meat?');
    expect(res).toContain('Food Footprint Insight');
  });

  it('returns energy insights when electricity is queried', () => {
    const res = answerQuestion('tell me about solar and energy electricity grid');
    expect(res).toContain('Home Energy Insight');
  });
});
