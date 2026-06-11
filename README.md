# 🌿 EcoTrace — Personal Carbon Footprint Tracker

> **Prompt Virtual Challenge Submission** — Vertical: Individual Carbon Footprint Tracker

[![Live Demo](https://img.shields.io/badge/Live-Demo-10b981?style=for-the-badge)](https://eco-tracker-umber.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/dimpulsowjanya-ops/eco-tracker)

---

## 🎯 Chosen Vertical

**Individual Carbon Footprint Tracker** — Help individuals understand, track, and reduce their carbon footprint through simple daily activity logging and personalized AI-powered insights.

---

## 💡 Approach & Logic

### Smart Decision Engine
EcoTrace implements a **rule-based AI decision engine** (`src/utils/aiEngine.js`) that:

1. **Analyses** the user's emission profile across 4 categories: Transport, Energy, Food, and Water
2. **Identifies** the top emission category using `getCategoryBreakdown()` and `getTopCategory()`
3. **Selects** contextually relevant recommendations from a structured knowledge base
4. **Generates** a personalised insight message that adapts to:
   - Which category dominates (e.g. if Transport > 40%, focus on cycling/transit tips)
   - How the user compares to the global daily average (13.7 kg CO₂e/person/day)
   - Current XP level and habit completion progress
   - Number of entries logged (encourages more tracking early on)

### Decision Tree Logic
```
if logs.empty → General getting-started tips
else:
  topCategory = highest CO₂ category by percentage
  primarySuggestions = SUGGESTION_KB[topCategory]  (3-4 tailored tips)
  secondarySuggestions = SUGGESTION_KB[secondCategory] (1 bonus tip)
  insight = dynamic message based on (topCategory, globalComparison, XP, logCount)
```

Each suggestion includes:
- **Impact rating**: Very High / High / Medium / Low
- **Estimated saving**: Monthly kg CO₂e saved
- **Evidence-based description**: Backed by IPCC, EPA, and Our World in Data emission factors

---

## 🏗️ Architecture

```
src/
├── constants/
│   └── carbonFactors.js       # Emission factors, habits, tiers (IPCC/EPA sourced)
├── utils/
│   ├── calculations.js        # Pure CO2 math functions (fully unit-tested)
│   ├── validators.js          # Input validation & XSS sanitization
│   ├── exporters.js           # CSV/JSON export utilities
│   └── aiEngine.js            # Rule-based smart suggestion engine
├── hooks/
│   ├── useLocalStorage.js     # Type-safe persistent storage hook
│   ├── useCarbonCalculator.js # Memoized metrics derivation hook
│   └── useToast.js            # In-app notification system (replaces alert())
├── components/
│   ├── Header.jsx             # Navigation, grid selector, import/export
│   ├── Dashboard.jsx          # Stats overview + tier progress bar
│   ├── EmissionsChart.jsx     # Recharts bar/line charts + breakdown
│   ├── ActivityLogger.jsx     # Multi-category activity input (tabbed)
│   ├── HabitTracker.jsx       # Green habits checklist with XP system
│   ├── AISuggestions.jsx      # Smart assistant panel (rule-based AI)
│   ├── WhatIfSimulator.jsx    # Scenario modeling with real-world equivalents
│   ├── AuditLedger.jsx        # Sortable, filterable activity history table
│   ├── OffsetVault.jsx        # Carbon credit purchase system
│   └── Toast.jsx              # Accessible notification component
├── tests/
│   ├── calculations.test.js   # 25+ unit tests for CO2 math
│   ├── validators.test.js     # 20+ unit tests for input validation
│   └── aiEngine.test.js       # 15+ unit tests for AI engine logic
└── App.jsx                    # Root with React Context, all handlers
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Smart Assistant** | Rule-based engine gives personalized tips based on your emission profile |
| 📊 **Interactive Charts** | Recharts bar/line charts with category breakdown |
| 🚗 **Multi-Category Tracking** | Transport (6 modes), Energy (5 grids), Food (5 meal types), Water |
| ✅ **Habit Tracker** | 15 green habits with XP system and streak levels |
| 🧪 **What-If Simulator** | Model reduction scenarios with real-world equivalents |
| 🌲 **Offset Vault** | Spend XP to purchase carbon offset credits |
| 🌍 **Regional Grids** | 5 electricity grid regions with accurate emission factors |
| 📥 **Import/Export** | CSV and JSON export/import with schema validation |
| 🌙 **Dark/Light Mode** | System-aware theme with smooth transitions |
| ♿ **Fully Accessible** | ARIA labels, keyboard navigation, screen reader support |
| 🔒 **Secure** | Input validation, XSS sanitization, CSP headers, no alert() |
| 📱 **Responsive** | Mobile-first responsive layout |

---

## 🧠 How the Smart Assistant Works

The AI suggestion engine uses a **multi-tier decision tree**:

```javascript
// Simplified logic from src/utils/aiEngine.js
function generateSuggestions(logs, totalCO2, xpPoints) {
  const breakdown = getCategoryBreakdown(logs);  // { Transport: 45%, Energy: 30%, ... }
  const topCat = getTopCategory(logs);           // { category: 'Transport', pct: 45 }
  
  // Select primary suggestions based on top category
  const suggestions = SUGGESTION_KB[topCat.category];
  
  // Generate contextual insight
  const insight = buildInsight(topCat, globalAvgComparison, xpPoints);
  
  return { suggestions, insight, priority: topCat.category };
}
```

**Knowledge Base Coverage:**
- **Transport**: EV switch, cycling, public transit, trip-chaining
- **Energy**: Green tariff, thermostat adjustment, vampire loads, cold washing
- **Food**: Meat-free days, beef → legumes swap, local produce, food waste reduction
- **Water**: Shorter showers, leak fixing

---

## ⚙️ How to Run

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/dimpulsowjanya-ops/eco-tracker.git
cd eco-tracker
npm install
```

### Development
```bash
npm run dev
# Opens at http://localhost:5173
```

### Run Tests
```bash
npm run test
# Runs 60+ unit tests across calculations, validators, and AI engine
```

### Production Build
```bash
npm run build
# Output in /dist — ready for Vercel/Netlify deployment
```

---

## 🏗️ Key Assumptions

1. **Emission Factors**: All CO₂ factors are sourced from IPCC 2023 reports, EPA GHG reporting, and Our World in Data. They represent averages and may vary by specific vehicle model, region, or diet composition.

2. **Regional Grids**: The 5 electricity grids (Global, US East, EU West, India, China) use 2023 grid emission intensity averages. Users should select the grid closest to their location for accuracy.

3. **Food Emissions**: Meal-based emissions represent typical serving sizes. Beef = 250g portion; vegetarian/vegan meals = standard restaurant portion. Local sourcing and supply chain are not modelled.

4. **Offset Credits**: The XP-to-offset exchange is a gamification mechanic to encourage habit completion. In a real deployment, offsets should be linked to verified carbon offset projects (e.g., Gold Standard, Verra).

5. **Data Storage**: All data is stored in `localStorage` — no server or cloud storage is used. Data is private to the user's browser.

6. **AI Engine**: The suggestion engine is rule-based (no LLM API). It uses deterministic logic based on emission category percentages and predefined knowledge base entries.

---

## 🔒 Security Practices

- **Input Validation**: All numeric inputs validated before processing (`validators.js`)
- **XSS Prevention**: String sanitization strips HTML tags and dangerous characters
- **Import Validation**: JSON imports validated against required schema before hydration
- **No `alert()`**: All user feedback delivered via accessible in-app toast notifications
- **Content Security Policy**: CSP meta tag in `index.html` prevents XSS via inline scripts
- **No `dangerouslySetInnerHTML`**: Zero instances in the codebase

---

## ♿ Accessibility Compliance

- Skip-to-content link at top of page
- All interactive elements have `aria-label` attributes
- Form inputs paired with `<label>` elements via `htmlFor`/`id`
- `role="alert"` and `aria-live="polite"` for dynamic content
- `role="progressbar"` with `aria-valuenow/min/max` for progress bars
- Table with `scope="col"` and `aria-sort` for sortable columns
- `aria-pressed` on toggle buttons
- `aria-disabled` on disabled buttons
- `:focus-visible` CSS for keyboard navigation indicators
- `@media (prefers-reduced-motion)` support
- `@media (forced-colors)` support for high-contrast mode
- Minimum 4.5:1 color contrast ratio on all text

---

## 📈 Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework (hooks, Context API, StrictMode) |
| Vite 5 | Build tool and dev server |
| Recharts | Interactive emission charts |
| Lucide React | Accessible icon library |
| Vitest | Unit testing framework |
| Inter (Google Fonts) | Premium typography |
| CSS Custom Properties | Design system with dark/light mode |

---

## 🧪 Testing

60+ unit tests covering:

```
src/tests/
├── calculations.test.js  → 25 tests (CO2 math, tier logic, chart data)
├── validators.test.js    → 20 tests (input validation, XSS, schema)
└── aiEngine.test.js      → 15 tests (suggestions, categories, streak)
```

Run: `npm run test`

---

## 📄 License

MIT License — built for the Prompt Virtual Challenge 2026.

---

*Built with ❤️ and 🌿 by [dimpulsowjanya-ops](https://github.com/dimpulsowjanya-ops)*
