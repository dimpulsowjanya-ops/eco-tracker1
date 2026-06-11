/**
 * Pure calculation utilities for carbon footprint math.
 * All functions are side-effect free and fully unit-testable.
 */

import { CARBON_FACTORS, REGIONAL_GRIDS, ECO_TIERS } from '../constants/carbonFactors.js';

/**
 * Calculate CO2 emissions for a given activity.
 * @param {string} key - Emission factor key (e.g. 'car_petrol', 'electricity_global')
 * @param {number} amount - Quantity (km, kWh, meals, liters)
 * @param {string} [gridKey='GLOBAL_AVG'] - Regional grid key for electricity
 * @returns {number} CO2 in kg, rounded to 2 decimal places
 */
export function calculateCO2(key, amount, gridKey = 'GLOBAL_AVG') {
  if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) return 0;

  let factor;
  if (key === 'electricity') {
    factor = REGIONAL_GRIDS[gridKey]?.factor ?? REGIONAL_GRIDS.GLOBAL_AVG.factor;
  } else {
    factor = CARBON_FACTORS[key];
  }

  if (factor === undefined || factor === null) return 0;
  return Math.round(amount * factor * 100) / 100;
}

/**
 * Sum all CO2 from an array of log entries.
 * @param {Array<{co2: number}>} logs
 * @returns {number} Total kg CO2e
 */
export function sumCO2(logs) {
  if (!Array.isArray(logs)) return 0;
  return logs.reduce((acc, log) => acc + (typeof log.co2 === 'number' ? log.co2 : 0), 0);
}

/**
 * Get net CO2 after subtracting offset credits (minimum 0).
 * @param {number} totalCO2
 * @param {number} offsets
 * @returns {number}
 */
export function getNetCO2(totalCO2, offsets) {
  return Math.max(0, (totalCO2 || 0) - (offsets || 0));
}

/**
 * Get the eco tier object for a given CO2 value.
 * @param {number} co2Kg
 * @returns {object} Tier object with name, color, emoji, description
 */
export function getEcoTier(co2Kg) {
  const co2 = typeof co2Kg === 'number' && isFinite(co2Kg) ? Math.max(0, co2Kg) : 0;
  return ECO_TIERS.find(t => co2 >= t.minCO2 && co2 <= t.maxCO2) ?? ECO_TIERS[ECO_TIERS.length - 1];
}

/**
 * Calculate the percentage of CO2 per category.
 * @param {Array<{category: string, co2: number}>} logs
 * @returns {Record<string, number>} e.g. { Transport: 45.2, Energy: 30.1, ... }
 */
export function getCategoryBreakdown(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return {};
  const total = sumCO2(logs);
  if (total === 0) return {};

  const categoryTotals = logs.reduce((acc, log) => {
    const cat = log.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (log.co2 || 0);
    return acc;
  }, {});

  return Object.fromEntries(
    Object.entries(categoryTotals).map(([cat, co2]) => [cat, Math.round((co2 / total) * 1000) / 10])
  );
}

/**
 * Get the top emission category by percentage.
 * @param {Array<{category: string, co2: number}>} logs
 * @returns {{ category: string, pct: number } | null}
 */
export function getTopCategory(logs) {
  const breakdown = getCategoryBreakdown(logs);
  if (Object.keys(breakdown).length === 0) return null;
  const [category, pct] = Object.entries(breakdown).sort(([, a], [, b]) => b - a)[0];
  return { category, pct };
}

/**
 * Calculate simulated CO2 savings given a reduction percentage.
 * @param {number} currentCO2 - Current net CO2 in kg
 * @param {number} reductionPct - e.g. 20 for 20%
 * @returns {number} Kg saved (rounded to 1 decimal)
 */
export function simulateSavings(currentCO2, reductionPct) {
  if (typeof currentCO2 !== 'number' || !isFinite(currentCO2) || isNaN(currentCO2)) return 0;
  if (typeof reductionPct !== 'number' || !isFinite(reductionPct) || isNaN(reductionPct)) return 0;
  if (reductionPct <= 0 || reductionPct > 100) return 0;
  return Math.round(currentCO2 * (reductionPct / 100) * 10) / 10;
}

/**
 * Compare user's footprint to global daily average.
 * @param {number} co2Kg
 * @returns {{ ratio: number, label: string }}
 */
export function compareToGlobalAvg(co2Kg) {
  const GLOBAL_AVG = 13.7;
  if (!co2Kg || co2Kg === 0) return { ratio: 0, label: '100% below global average' };
  const ratio = Math.round((co2Kg / GLOBAL_AVG) * 100);
  if (ratio < 100) return { ratio, label: `${100 - ratio}% below global average` };
  if (ratio === 100) return { ratio, label: 'At global average' };
  return { ratio, label: `${ratio - 100}% above global average` };
}

/**
 * Build chart data array from logs (last 7 entries per day bucket).
 * @param {Array<{date: string, co2: number, category: string}>} logs
 * @returns {Array<{date: string, Transport: number, Energy: number, Food: number, Water: number, Shopping: number, Other: number}>}
 */
export function buildChartData(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  const byDate = logs.reduce((acc, log) => {
    const date = log.date || 'Unknown';
    if (!acc[date]) acc[date] = { date, Transport: 0, Energy: 0, Food: 0, Water: 0, Shopping: 0, Other: 0 };
    const cat = log.category || 'Other';
    acc[date][cat] = (acc[date][cat] || 0) + (log.co2 || 0);
    return acc;
  }, {});

  return Object.values(byDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(d => ({
      ...d,
      Transport: Math.round((d.Transport || 0) * 100) / 100,
      Energy:    Math.round((d.Energy || 0) * 100) / 100,
      Food:      Math.round((d.Food || 0) * 100) / 100,
      Water:     Math.round((d.Water || 0) * 100) / 100,
      Shopping:  Math.round((d.Shopping || 0) * 100) / 100,
      Other:     Math.round((d.Other || 0) * 100) / 100,
    }));
}

/**
 * Get distinct tracking calendar days from logs.
 * @param {Array<{date: string}>} logs
 * @returns {number}
 */
export function getDistinctDays(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return 1;
  const dates = logs.map(l => l.date).filter(Boolean);
  const uniqueDates = new Set(dates);
  return Math.max(1, uniqueDates.size);
}

/**
 * Calculate potential savings based on specific lifestyle choices.
 * @param {Array} logs - Current activity logs
 * @param {{ transitEV: boolean, greenTariff: boolean, plantDiet: boolean, shortShowers: boolean, circularFashion: boolean }} choices
 * @returns {number} Saved CO2 in kg (rounded to 1 decimal place)
 */
export function calculateLifestyleSavings(logs, choices) {
  if (!Array.isArray(logs) || logs.length === 0 || !choices) return 0;
  let savings = 0;

  logs.forEach(log => {
    const co2 = log.co2 || 0;
    const type = (log.type || '').toLowerCase();
    const cat = (log.category || '').toLowerCase();

    // 1. Transit/EV choice
    if (choices.transitEV && cat === 'transport') {
      if (type.includes('petrol') || type.includes('diesel') || type.includes('motorbike') || type.includes('car')) {
        savings += co2 * 0.8; // 80% savings by swapping to public transit / cycling / EV
      }
    }

    // 2. Green Tariff choice
    if (choices.greenTariff && cat === 'energy' && type.includes('electricity')) {
      savings += co2 * 0.9; // 90% savings by using green electricity
    }

    // 3. Plant-Based Diet choice
    if (choices.plantDiet && cat === 'food') {
      if (type.includes('beef') || type.includes('pork') || type.includes('chicken') || type.includes('meal')) {
        // Swap non-vegan meal to vegan/vegetarian
        if (!type.includes('vegan') && !type.includes('vegetarian')) {
          savings += co2 * 0.7; // 70% savings
        }
      }
    }

    // 4. Short Showers choice
    if (choices.shortShowers && cat === 'water') {
      savings += co2 * 0.3; // 30% savings by taking shorter showers
    }

    // 5. Circular Fashion & Tech choice
    if (choices.circularFashion && cat === 'shopping') {
      savings += co2 * 0.6; // 60% savings by buying second-hand
    }
  });

  return Math.round(savings * 10) / 10;
}

