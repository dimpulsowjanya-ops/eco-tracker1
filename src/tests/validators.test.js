import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  sanitizeString,
  validateImportSchema,
  validateReductionPct,
} from '../utils/validators.js';

// ── validateAmount ────────────────────────────────────────────────────────────
describe('validateAmount', () => {
  it('accepts valid positive number string', () => {
    const result = validateAmount('10');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(10);
  });

  it('rejects empty string', () => {
    expect(validateAmount('').valid).toBe(false);
  });

  it('rejects null', () => {
    expect(validateAmount(null).valid).toBe(false);
  });

  it('rejects zero', () => {
    expect(validateAmount('0').valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateAmount('-5').valid).toBe(false);
  });

  it('rejects non-numeric string', () => {
    expect(validateAmount('abc').valid).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(validateAmount(Infinity).valid).toBe(false);
  });

  it('rejects value above max', () => {
    expect(validateAmount('999999999').valid).toBe(false);
  });

  it('returns error message for empty input', () => {
    expect(validateAmount('').error).toBeTruthy();
  });

  it('accepts decimal values', () => {
    const result = validateAmount('3.14');
    expect(result.valid).toBe(true);
    expect(result.value).toBeCloseTo(3.14);
  });

  it('accepts number type directly', () => {
    expect(validateAmount(5).valid).toBe(true);
  });
});

// ── sanitizeString ────────────────────────────────────────────────────────────
describe('sanitizeString', () => {
  it('strips HTML tags', () => {
    expect(sanitizeString('<script>alert(1)</script>')).not.toContain('<');
  });

  it('strips dangerous characters', () => {
    const result = sanitizeString('<>"\'`test');
    expect(result).toBe('test');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(42)).toBe('');
  });

  it('enforces max length', () => {
    const long = 'a'.repeat(1000);
    expect(sanitizeString(long).length).toBe(500);
  });

  it('passes through normal text unchanged', () => {
    expect(sanitizeString('Normal text 123')).toBe('Normal text 123');
  });
});

// ── validateImportSchema ──────────────────────────────────────────────────────
describe('validateImportSchema', () => {
  const validData = {
    history: [
      { id: 1, category: 'Transport', type: 'Car', amount: 5, co2: 0.9 }
    ]
  };

  it('accepts valid import data', () => {
    expect(validateImportSchema(validData).valid).toBe(true);
  });

  it('rejects null input', () => {
    expect(validateImportSchema(null).valid).toBe(false);
  });

  it('rejects array input', () => {
    expect(validateImportSchema([]).valid).toBe(false);
  });

  it('rejects data without history field', () => {
    expect(validateImportSchema({}).valid).toBe(false);
  });

  it('rejects history with non-object entry', () => {
    expect(validateImportSchema({ history: ['bad'] }).valid).toBe(false);
  });

  it('rejects entry missing required field', () => {
    const data = { history: [{ id: 1, category: 'X', type: 'Y', amount: 1 }] }; // missing co2
    expect(validateImportSchema(data).valid).toBe(false);
  });

  it('rejects entry with negative co2', () => {
    const data = { history: [{ id: 1, category: 'X', type: 'Y', amount: 1, co2: -1 }] };
    expect(validateImportSchema(data).valid).toBe(false);
  });

  it('accepts empty history array', () => {
    expect(validateImportSchema({ history: [] }).valid).toBe(true);
  });
});

// ── validateReductionPct ──────────────────────────────────────────────────────
describe('validateReductionPct', () => {
  it('accepts value in valid range', () => {
    expect(validateReductionPct(20).valid).toBe(true);
  });

  it('rejects 0', () => {
    expect(validateReductionPct(0).valid).toBe(false);
  });

  it('rejects 101', () => {
    expect(validateReductionPct(101).valid).toBe(false);
  });

  it('accepts boundary value 100', () => {
    expect(validateReductionPct(100).valid).toBe(true);
  });

  it('rejects NaN', () => {
    expect(validateReductionPct(NaN).valid).toBe(false);
  });
});
