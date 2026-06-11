import { useMemo } from 'react';
import { sumCO2, getNetCO2, getEcoTier, getCategoryBreakdown, getTopCategory, buildChartData, compareToGlobalAvg, getDistinctDays, calculateLifestyleSavings } from '../utils/calculations.js';
import { generateSuggestions } from '../utils/aiEngine.js';
import { LEVELS } from '../constants/carbonFactors.js';

/**
 * Centralised carbon calculation hook.
 * Derives all dashboard metrics from logs, offsets, and XP using memoization.
 *
 * @param {Array} logs - Activity log entries
 * @param {number} offsetCredits - Purchased carbon offsets (kg)
 * @param {object} lifestyleChoices - Checklist of simulator lifestyle changes
 * @param {Array} habits - Habit list (for current incomplete habits validation)
 * @param {number} lifetimeXP - User's lifetime experience points
 * @returns {object} All computed metrics
 */
export function useCarbonCalculator(logs, offsetCredits, lifestyleChoices, habits, lifetimeXP = 0) {
  const grossCO2 = useMemo(() => sumCO2(logs), [logs]);

  const netCO2 = useMemo(() => getNetCO2(grossCO2, offsetCredits), [grossCO2, offsetCredits]);

  const activeDays = useMemo(() => getDistinctDays(logs), [logs]);

  const dailyAvgGrossCO2 = useMemo(() => grossCO2 / activeDays, [grossCO2, activeDays]);

  const dailyAvgNetCO2 = useMemo(() => netCO2 / activeDays, [netCO2, activeDays]);

  // Eco Tier is evaluated on Daily Average Net Emissions!
  const ecoTier = useMemo(() => getEcoTier(dailyAvgNetCO2), [dailyAvgNetCO2]);

  const categoryBreakdown = useMemo(() => getCategoryBreakdown(logs), [logs]);

  const topCategory = useMemo(() => getTopCategory(logs), [logs]);

  const chartData = useMemo(() => buildChartData(logs), [logs]);

  // Global comparison evaluated on Daily Average Net Emissions!
  const globalComparison = useMemo(() => compareToGlobalAvg(dailyAvgNetCO2), [dailyAvgNetCO2]);

  // Lifestyle carbon savings simulation
  const simulatedSavings = useMemo(
    () => calculateLifestyleSavings(logs, lifestyleChoices),
    [logs, lifestyleChoices]
  );

  // User XP progression Level
  const userLevel = useMemo(() => {
    const xp = typeof lifetimeXP === 'number' && isFinite(lifetimeXP) ? Math.max(0, lifetimeXP) : 0;
    const lvl = LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) ?? LEVELS[LEVELS.length - 1];
    const nextLvl = LEVELS.find(l => l.num === lvl.num + 1);
    const xpToNext = nextLvl ? nextLvl.minXP - xp : 0;
    const levelProgress = nextLvl
      ? Math.round(((xp - lvl.minXP) / (nextLvl.minXP - lvl.minXP)) * 100)
      : 100;

    return {
      num: lvl.num,
      name: lvl.name,
      title: lvl.title,
      xpToNext,
      levelProgress,
      minXP: lvl.minXP,
      maxXP: lvl.maxXP,
    };
  }, [lifetimeXP]);

  const intensityPerEntry = useMemo(
    () => (logs.length > 0 ? Math.round((netCO2 / logs.length) * 100) / 100 : 0),
    [netCO2, logs.length]
  );

  // Dynamic AI Suggestions evaluated on daily average and lifetime XP context
  const aiResults = useMemo(
    () => generateSuggestions(logs, dailyAvgNetCO2, lifetimeXP),
    [logs, dailyAvgNetCO2, lifetimeXP]
  );

  return {
    grossCO2: Math.round(grossCO2 * 100) / 100,
    netCO2: Math.round(netCO2 * 100) / 100,
    activeDays,
    dailyAvgGrossCO2: Math.round(dailyAvgGrossCO2 * 100) / 100,
    dailyAvgNetCO2: Math.round(dailyAvgNetCO2 * 100) / 100,
    ecoTier,
    categoryBreakdown,
    topCategory,
    chartData,
    globalComparison,
    simulatedSavings,
    userLevel,
    aiResults,
    intensityPerEntry,
  };
}
