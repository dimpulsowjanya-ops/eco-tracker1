export const CARBON_FACTORS = {
  // kg CO2e per unit
  gasoline_per_km: 0.18,   // Average petrol car
  diesel_per_km: 0.17,     // Average diesel car
  ev_per_km: 0.05,         // Average electric vehicle grid draw
  bus_per_km: 0.03,        // Public transit average
  electricity_per_kwh: 0.4, // Standard regional grid average
  lpg_per_kg: 3.0,         // Cooking gas canister
  meat_meal: 2.5,          // High carbon footprint food choice
  vegetarian_meal: 0.8,    // Low carbon footprint choice
  vegan_meal: 0.5          // Minimal footprint choice
};

export const INITIAL_ACTIONS = [
  { id: 1, text: "Unplugged unused home electronics", points: 2, completed: false },
  { id: 2, text: "Opted for a plant-based/vegan lunch", points: 5, completed: false },
  { id: 3, text: "Walked, cycled, or took public transit today", points: 8, completed: false },
  { id: 4, text: "Lowered air conditioner/heater use by 1 hour", points: 4, completed: false },
];
