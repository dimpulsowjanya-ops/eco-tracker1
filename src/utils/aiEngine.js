/**
 * Rule-based AI decision engine for personalized carbon footprint suggestions.
 *
 * This engine analyzes the user's emission profile across categories and returns
 * contextually relevant, prioritized recommendations — no external API required.
 */

import { getCategoryBreakdown, getTopCategory, compareToGlobalAvg } from './calculations.js';

/**
 * Knowledge base of suggestions keyed by emission category.
 * Each suggestion has a title, description, impact estimate, and difficulty.
 */
const SUGGESTION_KB = {
  Transport: [
    {
      id: 't1',
      title: 'Switch to cycling or walking for short trips',
      description: 'Replacing car trips under 5 km with cycling eliminates transport emissions for those journeys. Just 3 short trips per week saves ~28 kg CO₂e per month.',
      impact: 'high',
      saving: '~28 kg/month',
      difficulty: 'easy',
      icon: '🚴',
    },
    {
      id: 't2',
      title: 'Use public transit for your daily commute',
      description: 'Switching from a petrol car to a bus or train cuts per-km emissions by up to 83%. A 15 km daily commute saves ~1.5 kg CO₂e per day.',
      impact: 'high',
      saving: '~45 kg/month',
      difficulty: 'easy',
      icon: '🚌',
    },
    {
      id: 't3',
      title: 'Combine errands into one car trip',
      description: 'Trip-chaining (doing multiple errands in one outing) can cut the number of car journeys by 30–40%, directly reducing fuel use and emissions.',
      impact: 'medium',
      saving: '~10 kg/month',
      difficulty: 'easy',
      icon: '🗺️',
    },
    {
      id: 't4',
      title: 'Consider an electric vehicle for your next car',
      description: 'EVs emit ~72% less CO₂ over their lifetime than petrol cars, even accounting for battery production and grid electricity.',
      impact: 'very_high',
      saving: '~120 kg/month',
      difficulty: 'hard',
      icon: '⚡🚗',
    },
  ],
  Energy: [
    {
      id: 'e1',
      title: 'Switch to a green electricity tariff',
      description: 'Choosing a 100% renewable energy tariff from your supplier can cut your electricity CO₂ factor from 0.40 to near 0 kg/kWh — a 97%+ reduction.',
      impact: 'very_high',
      saving: 'Depends on usage',
      difficulty: 'easy',
      icon: '🌿',
    },
    {
      id: 'e2',
      title: 'Adjust your thermostat by 1–2°C',
      description: 'Lowering heating by 1°C cuts your heating bill and CO₂ by ~10%. Raising the A/C setpoint by 1°C achieves a similar saving.',
      impact: 'medium',
      saving: '~15 kg/month',
      difficulty: 'easy',
      icon: '🌡️',
    },
    {
      id: 'e3',
      title: 'Unplug vampire loads and standby devices',
      description: 'Devices on standby account for up to 10% of home electricity use. Unplugging TVs, gaming consoles, and chargers saves ~5–8 kg CO₂e per month.',
      impact: 'low',
      saving: '~6 kg/month',
      difficulty: 'easy',
      icon: '🔌',
    },
    {
      id: 'e4',
      title: 'Wash clothes in cold water and air-dry',
      description: '90% of washing machine energy goes to heating water. Cold washing + air-drying can save ~20 kg CO₂e per month for an average household.',
      impact: 'medium',
      saving: '~20 kg/month',
      difficulty: 'easy',
      icon: '👕',
    },
  ],
  Food: [
    {
      id: 'f1',
      title: 'Try Meat-Free Mondays (or more!)',
      description: 'One less beef meal per week saves ~6 kg CO₂e. Going meat-free three days per week can reduce your food footprint by 30–40%.',
      impact: 'high',
      saving: '~24 kg/month',
      difficulty: 'easy',
      icon: '🌱',
    },
    {
      id: 'f2',
      title: 'Replace beef with chicken or legumes',
      description: 'Beef generates 5× more emissions than chicken and 20× more than lentils. Swapping beef meals for chicken reduces food emissions by ~50% per meal.',
      impact: 'high',
      saving: '~18 kg/month',
      difficulty: 'easy',
      icon: '🫘',
    },
    {
      id: 'f3',
      title: 'Buy local and seasonal produce',
      description: 'Locally sourced food travels fewer kilometres, cutting transport emissions. Seasonal produce requires less energy-intensive storage and cold chain logistics.',
      impact: 'medium',
      saving: '~8 kg/month',
      difficulty: 'easy',
      icon: '🥕',
    },
    {
      id: 'f4',
      title: 'Reduce food waste with meal planning',
      description: 'Around one-third of all food produced is wasted, representing ~8% of global emissions. Planning meals and using leftovers can cut household food waste by 50%.',
      impact: 'medium',
      saving: '~12 kg/month',
      difficulty: 'easy',
      icon: '📋',
    },
  ],
  Water: [
    {
      id: 'w1',
      title: 'Shorten showers to under 5 minutes',
      description: 'A 5-minute shower uses ~40 litres, while a 10-minute shower uses ~80 litres. Shorter showers reduce both water treatment energy and hot water heating.',
      impact: 'medium',
      saving: '3 kg/month',
      difficulty: 'easy',
      icon: '🚿',
    },
    {
      id: 'w2',
      title: 'Fix dripping taps and leaks',
      description: 'A dripping tap wastes ~15 litres per day — over 5,400 litres per year. Fixing leaks reduces water treatment emissions and your water bill.',
      impact: 'low',
      saving: '1 kg/month',
      difficulty: 'easy',
      icon: '🔧',
    },
  ],
  Shopping: [
    {
      id: 's1',
      title: 'Buy second-hand clothing items',
      description: 'The fashion industry produces 10% of global emissions. Swapping new clothes for second-hand purchases cuts manufacturing emissions by up to 90% per item.',
      impact: 'medium',
      saving: '~10 kg/item',
      difficulty: 'easy',
      icon: '👕',
    },
    {
      id: 's2',
      title: 'Extend your electronics lifespans',
      description: 'A new phone contains ~50 kg CO₂e, while a laptop represents 200+ kg. Repairing and keeping devices for 4+ years cuts tech emissions significantly.',
      impact: 'high',
      saving: '~50 kg/device',
      difficulty: 'medium',
      icon: '💻',
    },
  ],
  General: [
    {
      id: 'g1',
      title: 'Great start — keep tracking consistently',
      description: 'You are just getting started! The most important step is building the habit of tracking your emissions daily. Even awareness alone can reduce footprint by 10–20%.',
      impact: 'low',
      saving: 'Habit building',
      difficulty: 'easy',
      icon: '📊',
    },
    {
      id: 'g2',
      title: 'Set a weekly CO₂ budget goal',
      description: 'Research shows that people with specific reduction goals achieve 2× more savings than those without. Try setting a goal of keeping weekly emissions under 50 kg.',
      impact: 'medium',
      saving: 'Goal-dependent',
      difficulty: 'easy',
      icon: '🎯',
    },
  ],
};

/**
 * Main AI engine entry point.
 * Analyses emission logs and returns personalised, prioritised suggestions.
 *
 * @param {Array<{category: string, co2: number}>} logs - Activity log entries
 * @param {number} totalCO2 - Net CO2 after offsets
 * @param {number} xpPoints - Current XP points
 * @returns {{ suggestions: Array, insight: string, priority: string|null }}
 */
export function generateSuggestions(logs, totalCO2, xpPoints = 0) {
  // Not enough data yet
  if (!Array.isArray(logs) || logs.length === 0) {
    return {
      suggestions: SUGGESTION_KB.General,
      insight: 'Start logging your activities to get personalised recommendations tailored to your lifestyle.',
      priority: null,
      topCategory: null,
    };
  }

  const breakdown = getCategoryBreakdown(logs);
  const topCat = getTopCategory(logs);
  const globalComparison = compareToGlobalAvg(totalCO2);

  // Select primary suggestions based on top emission category
  let primarySuggestions = [];
  let secondarySuggestions = [];
  let insight = '';

  if (!topCat) {
    primarySuggestions = SUGGESTION_KB.General;
    insight = 'Keep logging to unlock personalised insights.';
  } else {
    primarySuggestions = SUGGESTION_KB[topCat.category] ?? SUGGESTION_KB.General;

    // Find secondary category
    const sortedCats = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
    if (sortedCats.length > 1) {
      const secondaryCat = sortedCats[1][0];
      secondarySuggestions = (SUGGESTION_KB[secondaryCat] ?? []).slice(0, 1);
    }

    // Build contextual insight message
    insight = buildInsight(topCat, breakdown, totalCO2, globalComparison, xpPoints, logs.length);
  }

  const suggestions = [...primarySuggestions, ...secondarySuggestions].slice(0, 4);

  return {
    suggestions,
    insight,
    priority: topCat?.category ?? null,
    topCategory: topCat,
    breakdown,
    globalComparison,
  };
}

/**
 * Build a dynamic, context-aware insight message.
 * @private
 */
function buildInsight(topCat, breakdown, totalCO2, globalComparison, xpPoints, logCount) {
  const pct = Math.round(topCat.pct);
  const catName = topCat.category;

  let base = `Your biggest source of emissions is **${catName}** at ${pct}% of your total footprint.`;

  if (totalCO2 === 0) {
    return 'Amazing! You have achieved net-zero emissions. Keep it up and inspire others!';
  }

  if (globalComparison.ratio < 50) {
    base += ` You are doing exceptionally well — your footprint is ${globalComparison.label}.`;
  } else if (globalComparison.ratio < 100) {
    base += ` You are ${globalComparison.label}. A few targeted changes below can bring you even lower.`;
  } else {
    base += ` Your total is ${globalComparison.label}. Focus on the high-impact actions below to make a real difference.`;
  }

  if (xpPoints >= 50) {
    base += ` 🌟 Excellent — you have earned ${xpPoints} XP, showing consistent eco-action.`;
  } else if (xpPoints >= 20) {
    base += ` You have earned ${xpPoints} XP — keep completing habits to accelerate your progress.`;
  }

  if (logCount < 5) {
    base += ' Log more activities to improve the accuracy of these insights.';
  }

  return base;
}

/**
 * Determine a user's streak level from completed habits count.
 * @param {number} completedCount
 * @returns {{ level: string, color: string, emoji: string }}
 */
export function getStreakLevel(completedCount) {
  if (completedCount >= 10) return { level: 'Eco Legend',   color: '#10b981', emoji: '🏆' };
  if (completedCount >= 6)  return { level: 'Green Hero',   color: '#0ea5e9', emoji: '🌟' };
  if (completedCount >= 3)  return { level: 'Eco Starter',  color: '#f59e0b', emoji: '🌱' };
  return                          { level: 'Getting Started', color: '#94a3b8', emoji: '🌾' };
}

/**
 * Custom Q&A search bot responder that returns context-specific, data-rich markdown answers.
 * Analyzes logs, budget, XP, levels, and matches queries by keywords.
 */
export function answerQuestion(question, logs = [], currentXP = 0, levelTitle = 'Eco Novice', budget = 50) {
  if (!question || typeof question !== 'string') {
    return "I'm here to help! Try asking: 'How do I reduce Transport emissions?', 'What is my highest category?', or 'Tell me about solar energy/EVs'.";
  }

  const q = question.toLowerCase();
  const breakdown = getCategoryBreakdown(logs);
  const topCat = getTopCategory(logs);
  const total = sumCO2(logs);

  // 1. COMMUTE / EV / VEHICLE / TRANSPORT / FLIGHTS
  if (q.includes('transport') || q.includes('car') || q.includes('drive') || q.includes('commute') || q.includes('ev') || q.includes('cycling') || q.includes('transit') || q.includes('flight') || q.includes('plane') || q.includes('travel')) {
    const transportEmissions = logs.filter(l => (l.category || '').toLowerCase() === 'transport').reduce((s, l) => s + (l.co2 || 0), 0);
    let personalContext = "";
    if (transportEmissions > 0) {
      personalContext = ` You have logged **${transportEmissions.toFixed(1)} kg CO₂e** from Transport. Swapping Petrol/Diesel car trips for public transit, cycling, or an EV would save up to 80% (approx. **${(transportEmissions * 0.8).toFixed(1)} kg CO₂e**).`;
    } else {
      personalContext = " You haven't logged any Transport emissions yet — great job walking, cycling, or keeping transit local!";
    }
    return `🚗 **Transport Footprint Insight:**\n\nTransportation is a leading source of personal carbon emissions. Swapping short car trips (under 5 km) with cycling or walking saves ~28 kg CO₂e per month. Switching your commute to public transit reduces per-km emissions by up to 83%.\n\n*Your Profile:*${personalContext}\n\n💡 **Tip:** Try checking off the *Walked/Cycled short trip* habit on the checklist to earn XP!`;
  }

  // 2. MEAT / VEGAN / DIET / FOOD
  if (q.includes('food') || q.includes('meat') || q.includes('beef') || q.includes('diet') || q.includes('vegan') || q.includes('vegetarian')) {
    const foodEmissions = logs.filter(l => (l.category || '').toLowerCase() === 'food').reduce((s, l) => s + (l.co2 || 0), 0);
    let personalContext = "";
    if (foodEmissions > 0) {
      personalContext = ` You have logged **${foodEmissions.toFixed(1)} kg CO₂e** from food activities. Beef generates 5x more emissions than chicken and 20x more than lentils. Implementing Meat-Free Mondays could save you ~24 kg CO₂e monthly.`;
    } else {
      personalContext = " You have 0 kg CO₂e from food entries, indicating a clean plant-based diet or that you need to log meals.";
    }
    return `🍽️ **Food Footprint Insight:**\n\nDiet has a huge carbon impact. Swapping one beef meal for a vegetarian or vegan alternative reduces your meal footprint by 85%+. Choosing locally-sourced food cuts down on transport emissions from farm-to-table supply chains.\n\n*Your Profile:*${personalContext}\n\n💡 **Action:** Start logging meal types in the activity logger to get an accurate representation of your dietary footprint.`;
  }

  // 3. SOLAR / ENERGY / GRID / ELECTRICITY / THERMOSTAT
  if (q.includes('energy') || q.includes('electricity') || q.includes('solar') || q.includes('power') || q.includes('heating') || q.includes('grid')) {
    const energyEmissions = logs.filter(l => (l.category || '').toLowerCase() === 'energy').reduce((s, l) => s + (l.co2 || 0), 0);
    let personalContext = "";
    if (energyEmissions > 0) {
      personalContext = ` You have logged **${energyEmissions.toFixed(1)} kg CO₂e** in Energy. Adjusting your thermostat by 1-2°C or unplugging vampire standby loads can cut energy usage by up to 10%.`;
    } else {
      personalContext = " You currently have no logged Energy emissions. Remember to select the correct Regional Grid for electricity!";
    }
    return `⚡ **Home Energy Insight:**\n\nMost home electricity emissions come from heating, cooling, and water heating. Swapping to a 100% renewable green tariff reduces grid emissions to near zero. Washing clothes at 30°C and air-drying saves ~20 kg CO₂e/month.\n\n*Your Profile:*${personalContext}\n\n💡 **Did you know?** Unplugging chargers and electronics when not in use stops "vampire draw" which accounts for 10% of standard home electricity.`;
  }

  // 4. WATER / SHOWER / LEAK
  if (q.includes('water') || q.includes('shower') || q.includes('dripping') || q.includes('tap') || q.includes('leak')) {
    const waterEmissions = logs.filter(l => (l.category || '').toLowerCase() === 'water').reduce((s, l) => s + (l.co2 || 0), 0);
    let personalContext = "";
    if (waterEmissions > 0) {
      personalContext = ` You have logged **${waterEmissions.toFixed(1)} kg CO₂e** from water consumption. Keeping showers under 5 minutes will save up to 40 litres of heated water per day.`;
    } else {
      personalContext = " You have logged 0 kg CO₂e in water. Keep short showers in mind!";
    }
    return `💧 **Water Footprint Insight:**\n\nWater purification and wastewater treatment require heavy grid energy. Moreover, heating water for showers and taps has a significant carbon footprint. Fixing a dripping tap prevents ~15 litres of water waste daily.\n\n*Your Profile:*${personalContext}\n\n💡 **Tip:** Use a shower timer to make sure you stay under the 5-minute mark!`;
  }

  // 5. CLOTHING / SHOPPING / ELECTRONICS / CONSUMPTION
  if (q.includes('shopping') || q.includes('clothes') || q.includes('clothing') || q.includes('electronics') || q.includes('buy') || q.includes('phone') || q.includes('laptop')) {
    const shoppingEmissions = logs.filter(l => (l.category || '').toLowerCase() === 'shopping').reduce((s, l) => s + (l.co2 || 0), 0);
    let personalContext = "";
    if (shoppingEmissions > 0) {
      personalContext = ` You have logged **${shoppingEmissions.toFixed(1)} kg CO₂e** from shopping items. Repairing old electronics and buying second-hand clothing helps reduce manufacturing demand.`;
    } else {
      personalContext = " You have no logged shopping activities. Remember to buy only what you need!";
    }
    return `🛍️ **Shopping & Consumption Insight:**\n\nEvery manufactured item carries embedded emissions from extraction, shipping, and packaging. A new smartphone has ~50 kg CO₂e embedded, while a laptop can be 200+ kg. Buying second-hand clothing cuts emission costs by up to 90% per item.\n\n*Your Profile:*${personalContext}\n\n💡 **Action:** Log your next clothing or tech purchase under the new 'Shopping' tab.`;
  }

  // 6. GENERAL FOOTPRINT / STATUS / BUDGET / GOALS / PROFILE
  if (q.includes('highest') || q.includes('breakdown') || q.includes('status') || q.includes('budget') || q.includes('goal') || q.includes('profile')) {
    if (logs.length === 0) {
      return "📊 **Emissions Overview:**\n\nYou haven't logged any activities yet! Start by adding a transport, energy, or food activity using the logger panel to unlock your personalized analysis.";
    }
    let breakdownStr = Object.entries(breakdown)
      .map(([cat, pct]) => `- **${cat}**: ${pct}%`)
      .join('\n');
    
    return `📊 **Your Emission Profile Summary:**\n\n- Total gross emissions: **${total.toFixed(1)} kg CO₂e**\n- Weekly carbon budget: **${budget} kg CO₂e**\n- Current User Level: **${levelTitle}**\n- Available offset coins: **${currentXP} XP**\n\n**Category Breakdown:**\n${breakdownStr}\n\n${topCat ? `🎯 *Primary Focus:* Your biggest contributor is **${topCat.category}** (${topCat.pct.toFixed(0)}%). Focus on recommendations in this category first.` : ''}`;
  }

  // DEFAULT FALLBACK
  return `👋 **Eco Assistant Bot:**\n\nI can help you understand and reduce your footprint! Try asking about one of these topics:\n- **"How can I cut my transport emissions?"**\n- **"Tell me about green electricity tariffs."**\n- **"What is the impact of eating beef?"**\n- **"What does my emission profile look like?"**\n- **"How does the shopping category work?"**\n- **"What is my carbon budget?"**\n\n*Your current Level:* **${levelTitle}** with **${currentXP} XP** available.`;
}
