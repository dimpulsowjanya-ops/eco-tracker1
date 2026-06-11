import { describe, it, expect } from 'vitest';
import {
  calculateCO2,
  sumCO2,
  getNetCO2,
  getEcoTier,
  getCategoryBreakdown,
  getTopCategory,
  simulateSavings,
  compareToGlobalAvg,
  buildChartData,
  getDistinctDays,
  calculateLifestyleSavings,
} from '../utils/calculations.js';

// ── calculateCO2 ──────────────────────────────────────────────────────────────
describe('calculateCO2', () => {
  it('calculates petrol car emissions correctly', () => {
    expect(calculateCO2('car_petrol', 10)).toBe(1.8); // 10 km * 0.18
  });

  it('calculates electricity emissions with regional grid', () => {
    expect(calculateCO2('electricity', 10, 'IN_GRID')).toBe(7.2); // 10 kWh * 0.72
  });

  it('calculates food emissions correctly', () => {
    expect(calculateCO2('meat_beef', 2)).toBe(12.0); // 2 meals * 6.0
  });

  it('returns 0 for zero amount', () => {
    expect(calculateCO2('car_petrol', 0)).toBe(0);
  });

  it('returns 0 for negative amount', () => {
    expect(calculateCO2('car_petrol', -5)).toBe(0);
  });

  it('returns 0 for NaN amount', () => {
    expect(calculateCO2('car_petrol', NaN)).toBe(0);
  });

  it('returns 0 for unknown factor key', () => {
    expect(calculateCO2('unknown_key', 10)).toBe(0);
  });

  it('uses global average grid when gridKey is missing', () => {
    expect(calculateCO2('electricity', 1)).toBe(0.4); // global avg
  });

  it('uses fallback grid for unknown gridKey', () => {
    expect(calculateCO2('electricity', 1, 'INVALID_GRID')).toBe(0.4);
  });
});

// ── sumCO2 ────────────────────────────────────────────────────────────────────
describe('sumCO2', () => {
  it('sums CO2 values from log entries', () => {
    const logs = [{ co2: 1.5 }, { co2: 2.3 }, { co2: 0.7 }];
    expect(sumCO2(logs)).toBe(4.5);
  });

  it('returns 0 for empty array', () => {
    expect(sumCO2([])).toBe(0);
  });

  it('returns 0 for non-array input', () => {
    expect(sumCO2(null)).toBe(0);
    expect(sumCO2(undefined)).toBe(0);
  });

  it('ignores entries with non-numeric co2', () => {
    const logs = [{ co2: 2 }, { co2: 'bad' }, { co2: null }];
    expect(sumCO2(logs)).toBe(2);
  });
});

// ── getNetCO2 ─────────────────────────────────────────────────────────────────
describe('getNetCO2', () => {
  it('subtracts offsets from total CO2', () => {
    expect(getNetCO2(10, 3)).toBe(7);
  });

  it('does not go below 0', () => {
    expect(getNetCO2(3, 10)).toBe(0);
  });

  it('handles zero offsets', () => {
    expect(getNetCO2(5, 0)).toBe(5);
  });

  it('handles null/undefined gracefully', () => {
    expect(getNetCO2(null, 0)).toBe(0);
    expect(getNetCO2(5, undefined)).toBe(5);
  });
});

// ── getEcoTier ────────────────────────────────────────────────────────────────
describe('getEcoTier', () => {
  it('returns Net Zero Hero for 0 kg', () => {
    expect(getEcoTier(0).name).toBe('Net Zero Hero');
  });

  it('returns Eco Champion for low emissions', () => {
    expect(getEcoTier(3).name).toBe('Eco Champion');
  });

  it('returns Green Advocate for moderate emissions', () => {
    expect(getEcoTier(10).name).toBe('Green Advocate');
  });

  it('returns High Footprint for very high emissions', () => {
    expect(getEcoTier(100).name).toBe('High Footprint');
  });

  it('handles negative values (treats as 0)', () => {
    expect(getEcoTier(-1).name).toBe('Net Zero Hero');
  });
});

// ── getCategoryBreakdown ──────────────────────────────────────────────────────
describe('getCategoryBreakdown', () => {
  it('returns correct percentages', () => {
    const logs = [
      { category: 'Transport', co2: 5 },
      { category: 'Energy', co2: 5 },
    ];
    const breakdown = getCategoryBreakdown(logs);
    expect(breakdown.Transport).toBe(50);
    expect(breakdown.Energy).toBe(50);
  });

  it('returns empty object for empty logs', () => {
    expect(getCategoryBreakdown([])).toEqual({});
  });

  it('returns empty object when total CO2 is 0', () => {
    const logs = [{ category: 'Transport', co2: 0 }];
    expect(getCategoryBreakdown(logs)).toEqual({});
  });
});

// ── getTopCategory ────────────────────────────────────────────────────────────
describe('getTopCategory', () => {
  it('identifies the top emission category', () => {
    const logs = [
      { category: 'Transport', co2: 8 },
      { category: 'Energy', co2: 2 },
    ];
    expect(getTopCategory(logs)?.category).toBe('Transport');
  });

  it('returns null for empty logs', () => {
    expect(getTopCategory([])).toBeNull();
  });
});

// ── simulateSavings ───────────────────────────────────────────────────────────
describe('simulateSavings', () => {
  it('calculates 20% savings correctly', () => {
    expect(simulateSavings(100, 20)).toBe(20);
  });

  it('returns 0 for 0% reduction', () => {
    expect(simulateSavings(100, 0)).toBe(0);
  });

  it('returns 0 for invalid inputs', () => {
    expect(simulateSavings(NaN, 20)).toBe(0);
    expect(simulateSavings(100, NaN)).toBe(0);
  });

  it('caps at 100% reduction', () => {
    expect(simulateSavings(100, 100)).toBe(100);
  });
});

// ── compareToGlobalAvg ────────────────────────────────────────────────────────
describe('compareToGlobalAvg', () => {
  it('shows below-average label for low emissions', () => {
    const result = compareToGlobalAvg(1);
    expect(result.label).toContain('below');
  });

  it('shows above-average label for high emissions', () => {
    const result = compareToGlobalAvg(30);
    expect(result.label).toContain('above');
  });

  it('handles zero CO2', () => {
    const result = compareToGlobalAvg(0);
    expect(result.label).toContain('below');
  });
});

// ── getDistinctDays ───────────────────────────────────────────────────────────
describe('getDistinctDays', () => {
  it('returns 1 for empty or invalid logs', () => {
    expect(getDistinctDays([])).toBe(1);
    expect(getDistinctDays(null)).toBe(1);
  });

  it('returns count of unique dates correctly', () => {
    const logs = [
      { date: '10/06/2026' },
      { date: '10/06/2026' },
      { date: '11/06/2026' }
    ];
    expect(getDistinctDays(logs)).toBe(2);
  });
});

// ── calculateLifestyleSavings ─────────────────────────────────────────────────
describe('calculateLifestyleSavings', () => {
  it('calculates transitEV savings for transport petrol logs', () => {
    const logs = [{ category: 'Transport', type: 'Petrol Car', co2: 10 }];
    const choices = { transitEV: true };
    expect(calculateLifestyleSavings(logs, choices)).toBe(8.0); // 10 * 0.8
  });

  it('calculates greenTariff savings for energy electricity logs', () => {
    const logs = [{ category: 'Energy', type: 'Electricity (Global Average)', co2: 20 }];
    const choices = { greenTariff: true };
    expect(calculateLifestyleSavings(logs, choices)).toBe(18.0); // 20 * 0.9
  });
});
