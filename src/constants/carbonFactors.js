/**
 * Carbon emission factors (kg CO2e per unit)
 * Sources: IPCC, EPA, Our World in Data
 */
export const CARBON_FACTORS = {
  // Transport (kg CO2e per km)
  car_petrol: 0.18,
  car_diesel: 0.17,
  car_ev: 0.05,
  motorbike: 0.10,
  bus: 0.03,
  train: 0.04,
  flight_domestic: 0.255, // per km per passenger
  flight_international: 0.195,

  // Energy (kg CO2e per kWh)
  electricity_global: 0.40,
  electricity_us_east: 0.45,
  electricity_eu_west: 0.12,
  electricity_india: 0.72,

  // Food (kg CO2e per meal)
  meat_beef: 6.0,
  meat_pork: 2.5,
  meat_chicken: 1.2,
  vegetarian: 0.8,
  vegan: 0.5,

  // Water (kg CO2e per liter)
  water: 0.002,

  // Shopping (kg CO2e per item)
  clothing_item: 10.0,
  electronics_item: 50.0,
};

/** Regional grid emission factors */
export const REGIONAL_GRIDS = {
  GLOBAL_AVG: { label: 'Global Average', factor: 0.40 },
  US_EAST:    { label: 'US East (Coal/Gas)', factor: 0.45 },
  EU_WEST:    { label: 'EU West (Renewables)', factor: 0.12 },
  IN_GRID:    { label: 'India National Grid', factor: 0.72 },
  CN_GRID:    { label: 'China Grid', factor: 0.55 },
};

/** Transport mode options shown in the activity logger */
export const TRANSPORT_MODES = [
  { key: 'car_petrol',           label: 'Petrol Car',      unit: 'km', icon: '🚗' },
  { key: 'car_diesel',           label: 'Diesel Car',      unit: 'km', icon: '🚙' },
  { key: 'car_ev',               label: 'Electric Vehicle', unit: 'km', icon: '⚡🚗' },
  { key: 'motorbike',            label: 'Motorbike',       unit: 'km', icon: '🏍️' },
  { key: 'bus',                  label: 'Bus',             unit: 'km', icon: '🚌' },
  { key: 'train',                label: 'Train',           unit: 'km', icon: '🚆' },
  { key: 'flight_domestic',      label: 'Domestic Flight',   unit: 'km', icon: '✈️' },
  { key: 'flight_international', label: 'International Flight', unit: 'km', icon: '🌍✈️' },
];

/** Food options for activity logger */
export const FOOD_OPTIONS = [
  { key: 'meat_beef',   label: 'Beef Meal',        icon: '🥩' },
  { key: 'meat_pork',   label: 'Pork Meal',        icon: '🍖' },
  { key: 'meat_chicken', label: 'Chicken Meal',    icon: '🍗' },
  { key: 'vegetarian',  label: 'Vegetarian Meal',  icon: '🥗' },
  { key: 'vegan',       label: 'Vegan Meal',       icon: '🌱' },
];

/** Shopping options for activity logger */
export const SHOPPING_OPTIONS = [
  { key: 'clothing_item',    label: 'Clothing Item',    icon: '👕' },
  { key: 'electronics_item', label: 'Electronics Item', icon: '💻' },
];

/** Green habits for the habit tracker */
export const GREEN_HABITS = [
  { id: 'h1',  category: 'transport', text: 'Walked or cycled instead of driving',        points: 15, icon: '🚴', difficulty: 'easy' },
  { id: 'h2',  category: 'transport', text: 'Took public transit for a commute',           points: 10, icon: '🚌', difficulty: 'easy' },
  { id: 'h3',  category: 'transport', text: 'Skipped a car trip by working from home',     points: 12, icon: '🏠', difficulty: 'easy' },
  { id: 'h4',  category: 'energy',    text: 'Unplugged devices and chargers when not in use', points: 5,  icon: '🔌', difficulty: 'easy' },
  { id: 'h5',  category: 'energy',    text: 'Reduced heating/cooling by 1°C for the day',  points: 8,  icon: '🌡️', difficulty: 'easy' },
  { id: 'h6',  category: 'energy',    text: 'Air-dried laundry instead of using a dryer',  points: 6,  icon: '☀️', difficulty: 'easy' },
  { id: 'h7',  category: 'energy',    text: 'Switched to LED bulbs in one room',           points: 20, icon: '💡', difficulty: 'medium' },
  { id: 'h8',  category: 'food',      text: 'Had a plant-based / vegan meal today',        points: 10, icon: '🌱', difficulty: 'easy' },
  { id: 'h9',  category: 'food',      text: 'Chose locally sourced food at the market',    points: 8,  icon: '🥕', difficulty: 'easy' },
  { id: 'h10', category: 'food',      text: 'Reduced food waste — used up leftovers',      points: 7,  icon: '♻️', difficulty: 'easy' },
  { id: 'h11', category: 'water',     text: 'Took a shorter shower (under 5 minutes)',     points: 6,  icon: '🚿', difficulty: 'easy' },
  { id: 'h12', category: 'general',   text: 'Shared this app with a friend or family',     points: 25, icon: '📢', difficulty: 'medium' },
  { id: 'h13', category: 'transport', text: 'Replaced a short flight with train or call',  points: 50, icon: '✈️', difficulty: 'hard' },
  { id: 'h14', category: 'energy',    text: 'Enabled energy-saving mode on all devices',   points: 5,  icon: '📱', difficulty: 'easy' },
  { id: 'h15', category: 'general',   text: 'Bought second-hand instead of new clothing',  points: 15, icon: '👕', difficulty: 'medium' },
];

/** Eco tier thresholds (kg CO2e) - Evaluated on Daily Average */
export const ECO_TIERS = [
  { name: 'Net Zero Hero',    minCO2: 0,   maxCO2: 0,    color: '#10b981', emoji: '🏆', description: 'Outstanding! You have achieved net-zero emissions.' },
  { name: 'Eco Champion',     minCO2: 0.01, maxCO2: 5,   color: '#059669', emoji: '🌟', description: 'Excellent — your footprint is well below average.' },
  { name: 'Green Advocate',   minCO2: 5.01, maxCO2: 15,  color: '#0ea5e9', emoji: '🌿', description: 'Good progress! A few more changes will make a big difference.' },
  { name: 'Climate Aware',    minCO2: 15.01, maxCO2: 30, color: '#f59e0b', emoji: '⚠️', description: 'You are aware, but there is room to cut more emissions.' },
  { name: 'High Footprint',   minCO2: 30.01, maxCO2: Infinity, color: '#ef4444', emoji: '🔥', description: 'Your footprint is above average — take action today.' },
];

/** Offset projects catalog */
export const OFFSET_PROJECTS = [
  { id: 'proj1', name: 'Native Reforestation', cost: 15, co2: 1.0, icon: '🌲', description: 'Plant native trees in protected reserves to restore biodiversity and capture carbon.' },
  { id: 'proj2', name: 'Clean Cookstoves', cost: 30, co2: 2.5, icon: '🔥', description: 'Distribute fuel-efficient, clean cookstoves to families in developing regions.' },
  { id: 'proj3', name: 'Wind Farm Initiative', cost: 50, co2: 5.0, icon: '💨', description: 'Support clean energy power grids to displace fossil fuel dependency.' },
];

/** User XP Progression Levels */
export const LEVELS = [
  { num: 1, name: 'Eco Novice',      minXP: 0,   maxXP: 49,   title: '🌱 Eco Novice' },
  { num: 2, name: 'Eco Seedling',    minXP: 50,  maxXP: 99,   title: '🌿 Eco Seedling' },
  { num: 3, name: 'Eco Sapling',     minXP: 100, maxXP: 199,  title: '🌳 Eco Sapling' },
  { num: 4, name: 'Tree Guardian',   minXP: 200, maxXP: 349,  title: '🛡️ Tree Guardian' },
  { num: 5, name: 'Forest Champion', minXP: 350, maxXP: Infinity, title: '🏆 Forest Champion' },
];

/** Global average CO2 for comparison context */
export const GLOBAL_DAILY_AVG_KG = 13.7; // kg CO2e per person per day
export const GLOBAL_ANNUAL_AVG_KG = 4800; // kg CO2e per person per year

