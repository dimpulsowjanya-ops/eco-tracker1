import React from 'react';

/**
 * What-If Simulator — lets users model custom emission reductions interactively using lifestyle choices.
 *
 * @param {{ netCO2: number, dailyAvgNetCO2: number, simulatedSavings: number, lifestyleChoices: object, onChoicesChange: Function }} props
 */
export function WhatIfSimulator({ netCO2, dailyAvgNetCO2, simulatedSavings, lifestyleChoices, onChoicesChange }) {
  const projectedDailyAvg = Math.max(0, dailyAvgNetCO2 - simulatedSavings).toFixed(1);

  const handleToggle = (key) => {
    onChoicesChange(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const switches = [
    { key: 'transitEV', label: 'Swap car travel for public transit, cycling, or EV', desc: 'Saves 80% of vehicle emissions', icon: '🚴' },
    { key: 'greenTariff', label: 'Switch home to green grid electricity / tariff', desc: 'Saves 90% of electricity emissions', icon: '⚡' },
    { key: 'plantDiet', label: 'Adopt vegetarian or vegan diets (swap beef/pork)', desc: 'Saves 70% of meat food emissions', icon: '🌱' },
    { key: 'shortShowers', label: 'Shorten shower times to under 5 minutes', desc: 'Saves 30% of hot water emissions', icon: '🚿' },
    { key: 'circularFashion', label: 'Buy second-hand clothing & repair tech items', desc: 'Saves 60% of shopping emissions', icon: '🛍️' },
  ];

  return (
    <section aria-labelledby="simulator-heading" className="card simulator-card">
      <h2 id="simulator-heading" className="card__title">
        <span aria-hidden="true">🧪</span> Lifestyle What-If Simulator
      </h2>
      <p className="card__desc">
        Toggle specific lifestyle improvements below to model their actual impact on your daily average footprint.
      </p>

      <div className="simulator-grid-layout">
        {/* Left column: Switches checklist */}
        <div className="sim-switches-list" role="group" aria-label="Lifestyle changes switches">
          {switches.map(sw => (
            <label
              key={sw.key}
              htmlFor={`sim-switch-${sw.key}`}
              className={`sim-switch-label ${lifestyleChoices[sw.key] ? 'sim-switch-label--active' : ''}`}
            >
              <input
                id={`sim-switch-${sw.key}`}
                type="checkbox"
                checked={lifestyleChoices[sw.key] || false}
                onChange={() => handleToggle(sw.key)}
                className="sim-switch-checkbox"
                aria-label={sw.label}
              />
              <span className="sim-switch-icon" aria-hidden="true">{sw.icon}</span>
              <div className="sim-switch-text">
                <span className="sim-switch-title">{sw.label}</span>
                <span className="sim-switch-desc">{sw.desc}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Right column: Impact calculations & equivalents */}
        <div className="sim-calculations-panel">
          <div className="simulator-results" aria-live="polite" aria-label="Simulation results">
            <div className="sim-result-card sim-result-card--current">
              <span className="sim-result__label">Current Avg</span>
              <span className="sim-result__value">{dailyAvgNetCO2.toFixed(1)} kg/d</span>
            </div>
            <div className="sim-result-arrow" aria-hidden="true">→</div>
            <div className="sim-result-card sim-result-card--projected">
              <span className="sim-result__label">Projected Avg</span>
              <span className="sim-result__value">{projectedDailyAvg} kg/d</span>
            </div>
            <div className="sim-result-card sim-result-card--savings">
              <span className="sim-result__label">Daily Savings</span>
              <span className="sim-result__value sim-result__value--saving">−{simulatedSavings.toFixed(1)} kg</span>
            </div>
          </div>

          <div className="simulator-equivalents-card">
            <h4 className="sim-equiv__title">Annual Equivalents:</h4>
            <div className="sim-equiv__grid">
              <div className="sim-equiv__item">
                <span className="sim-equiv__icon" aria-hidden="true">🌲</span>
                <div>
                  <span className="sim-equiv__value">{Math.round((simulatedSavings * 365) / 21)}</span>
                  <span className="sim-equiv__label">Trees Planted</span>
                </div>
              </div>
              <div className="sim-equiv__item">
                <span className="sim-equiv__icon" aria-hidden="true">🚗</span>
                <div>
                  <span className="sim-equiv__value">{Math.round((simulatedSavings * 365) / 0.18).toLocaleString()} km</span>
                  <span className="sim-equiv__label">Car Travel Avoided</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
