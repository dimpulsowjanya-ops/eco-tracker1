import React, { useState, useCallback } from 'react';
import { TRANSPORT_MODES, FOOD_OPTIONS, SHOPPING_OPTIONS, REGIONAL_GRIDS } from '../constants/carbonFactors.js';
import { validateAmount } from '../utils/validators.js';
import { calculateCO2 } from '../utils/calculations.js';

const CATEGORIES = [
  { id: 'transport', label: 'Transport',  icon: '🚗', color: '#3b82f6' },
  { id: 'energy',    label: 'Energy',     icon: '⚡', color: '#f59e0b' },
  { id: 'food',      label: 'Food',       icon: '🍽️', color: '#10b981' },
  { id: 'water',     label: 'Water',      icon: '💧', color: '#06b6d4' },
  { id: 'shopping',   label: 'Shopping',   icon: '🛍️', color: '#ec4899' },
];

/**
 * Activity Logger — allows users to log emissions across 5 categories.
 * Fully accessible: labelled inputs, error messages with aria-describedby.
 *
 * @param {{ selectedGrid: string, onAdd: Function }} props
 */
export function ActivityLogger({ selectedGrid, onAdd }) {
  const [activeCategory, setActiveCategory] = useState('transport');
  const [transportMode, setTransportMode] = useState('car_petrol');
  const [foodOption, setFoodOption] = useState('meat_beef');
  const [shoppingOption, setShoppingOption] = useState('clothing_item');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const getFactorKey = () => {
    if (activeCategory === 'transport') return transportMode;
    if (activeCategory === 'energy')    return 'electricity';
    if (activeCategory === 'food')      return foodOption;
    if (activeCategory === 'water')     return 'water';
    if (activeCategory === 'shopping')  return shoppingOption;
    return '';
  };

  const getTypeLabel = () => {
    if (activeCategory === 'transport') return TRANSPORT_MODES.find(m => m.key === transportMode)?.label || transportMode;
    if (activeCategory === 'energy')    return `Electricity (${REGIONAL_GRIDS[selectedGrid]?.label})`;
    if (activeCategory === 'food')      return FOOD_OPTIONS.find(f => f.key === foodOption)?.label || foodOption;
    if (activeCategory === 'water')     return 'Water Consumption';
    if (activeCategory === 'shopping')  return SHOPPING_OPTIONS.find(s => s.key === shoppingOption)?.label || shoppingOption;
    return '';
  };

  const getUnit = () => {
    if (activeCategory === 'transport') return 'km';
    if (activeCategory === 'energy')    return 'kWh';
    if (activeCategory === 'food')      return 'meals';
    if (activeCategory === 'water')     return 'litres';
    if (activeCategory === 'shopping')  return 'items';
    return 'units';
  };

  const updatePreview = useCallback((val, cat = activeCategory, tMode = transportMode, fOpt = foodOption, sOpt = shoppingOption) => {
    const { valid, value } = validateAmount(val);
    if (valid) {
      let key = '';
      if (cat === 'transport') key = tMode;
      else if (cat === 'energy') key = 'electricity';
      else if (cat === 'food') key = fOpt;
      else if (cat === 'water') key = 'water';
      else if (cat === 'shopping') key = sOpt;

      const co2 = calculateCO2(key, value, selectedGrid);
      setPreview(co2);
    } else {
      setPreview(null);
    }
  }, [selectedGrid]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    setError('');
    updatePreview(val, activeCategory, transportMode, foodOption, shoppingOption);
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setAmount('');
    setError('');
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, value: parsedAmount, error: validationError } = validateAmount(amount);
    if (!valid) {
      setError(validationError);
      return;
    }
    const co2 = calculateCO2(getFactorKey(), parsedAmount, selectedGrid);
    const categoryObj = CATEGORIES.find(c => c.id === activeCategory);
    const categoryLabel = categoryObj?.label || activeCategory;
    onAdd({
      category: categoryLabel,
      type: getTypeLabel(),
      amount: parsedAmount,
      unit: getUnit(),
      co2,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setAmount('');
    setPreview(null);
    setError('');
  };

  return (
    <section aria-labelledby="logger-heading" className="card">
      <h2 id="logger-heading" className="card__title">
        <span aria-hidden="true">➕</span> Log an Activity
      </h2>

      {/* Category Tabs */}
      <div role="tablist" aria-label="Activity category" className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            id={`tab-${cat.id}`}
            role="tab"
            aria-selected={activeCategory === cat.id}
            aria-controls={`panel-${cat.id}`}
            onClick={() => handleCategoryChange(cat.id)}
            className={`category-tab ${activeCategory === cat.id ? 'category-tab--active' : ''}`}
            style={activeCategory === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
          >
            <span aria-hidden="true">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <form
        id={`panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeCategory}`}
        onSubmit={handleSubmit}
        noValidate
        className="logger-form"
      >
        {/* Sub-type selectors */}
        {activeCategory === 'transport' && (
          <div className="form-group">
            <label htmlFor="transport-mode-select" className="form-label">Transport Mode / Travel</label>
            <select
              id="transport-mode-select"
              value={transportMode}
              onChange={e => {
                setTransportMode(e.target.value);
                updatePreview(amount, 'transport', e.target.value, foodOption, shoppingOption);
              }}
              className="form-select"
            >
              {TRANSPORT_MODES.map(m => (
                <option key={m.key} value={m.key}>{m.icon} {m.label}</option>
              ))}
            </select>
          </div>
        )}

        {activeCategory === 'food' && (
          <div className="form-group">
            <label htmlFor="food-option-select" className="form-label">Meal Type</label>
            <select
              id="food-option-select"
              value={foodOption}
              onChange={e => {
                setFoodOption(e.target.value);
                updatePreview(amount, 'food', transportMode, e.target.value, shoppingOption);
              }}
              className="form-select"
            >
              {FOOD_OPTIONS.map(f => (
                <option key={f.key} value={f.key}>{f.icon} {f.label}</option>
              ))}
            </select>
          </div>
        )}

        {activeCategory === 'shopping' && (
          <div className="form-group">
            <label htmlFor="shopping-option-select" className="form-label">Purchased Item</label>
            <select
              id="shopping-option-select"
              value={shoppingOption}
              onChange={e => {
                setShoppingOption(e.target.value);
                updatePreview(amount, 'shopping', transportMode, foodOption, e.target.value);
              }}
              className="form-select"
            >
              {SHOPPING_OPTIONS.map(s => (
                <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Amount Input */}
        <div className="form-group">
          <label htmlFor="activity-amount" className="form-label">
            Amount ({getUnit()})
          </label>
          <div className="input-row">
            <input
              id="activity-amount"
              type="number"
              inputMode="decimal"
              min="0.001"
              step="any"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Enter ${getUnit()}`}
              className={`form-input ${error ? 'form-input--error' : ''}`}
              aria-describedby={error ? 'amount-error' : preview !== null ? 'amount-preview' : undefined}
              aria-invalid={!!error}
              required
            />
            <button type="submit" id="log-activity-btn" className="btn btn--primary">
              Log Activity
            </button>
          </div>
          {error && (
            <p id="amount-error" className="form-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          {preview !== null && !error && (
            <p id="amount-preview" className="form-preview" aria-live="polite">
              Estimated: <strong>{preview} kg CO₂e</strong>
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
