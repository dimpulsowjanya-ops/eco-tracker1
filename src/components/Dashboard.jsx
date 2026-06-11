import React from 'react';
import { GLOBAL_DAILY_AVG_KG } from '../constants/carbonFactors.js';

/**
 * A single metric stat card.
 */
function StatCard({ id, label, value, unit, icon, accent, description }) {
  return (
    <article
      id={id}
      className="stat-card"
      style={{ borderTop: `3px solid ${accent}` }}
      aria-label={`${label}: ${value} ${unit}`}
    >
      <div className="stat-card__header">
        <span className="stat-card__icon" aria-hidden="true">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>
      <p className="stat-card__value">
        {value}
        <span className="stat-card__unit">{unit}</span>
      </p>
      {description && <p className="stat-card__desc">{description}</p>}
    </article>
  );
}

/**
 * Dashboard overview — shows key emission metrics and carbon budget progress.
 */
export function Dashboard({
  netCO2,
  grossCO2,
  dailyAvgNetCO2,
  dailyAvgGrossCO2,
  activeDays,
  offsetCredits,
  logCount,
  globalComparison,
  ecoTier,
  intensityPerEntry,
  carbonBudget,
  onBudgetChange,
  chartData = []
}) {
  // Calculate emissions in the last 7 days
  const last7DaysNetCO2 = chartData.reduce((s, d) => {
    return s + (d.Transport || 0) + (d.Energy || 0) + (d.Food || 0) + (d.Water || 0) + (d.Shopping || 0) + (d.Other || 0);
  }, 0);

  const pctOfGlobal = Math.round((dailyAvgNetCO2 / GLOBAL_DAILY_AVG_KG) * 100);
  const pctBudget = carbonBudget > 0 ? Math.round((last7DaysNetCO2 / carbonBudget) * 100) : 0;

  // SVG Radial Budget Progress Ring Math
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(pctBudget, 100) / 100) * circumference;

  // Color logic for budget ring
  let budgetColor = '#10b981'; // Green
  if (pctBudget > 100) budgetColor = '#ef4444'; // Red
  else if (pctBudget > 80) budgetColor = '#f59e0b'; // Orange

  return (
    <section aria-labelledby="dashboard-heading" className="dashboard-grid">
      {/* Carbon Budget Ring Component */}
      <article className="card budget-card" aria-label="Weekly carbon budget status">
        <h3 id="dashboard-heading" className="card__title">
          🎯 Weekly Budget
        </h3>
        <div className="budget-ring-wrapper">
          <svg width="110" height="110" className="budget-ring-svg">
            {/* Background Circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke="var(--color-border)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke={budgetColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="budget-ring-content">
            <span className="budget-ring-pct">{pctBudget}%</span>
            <span className="budget-ring-sub">Used</span>
          </div>
        </div>
        <div className="budget-text-details">
          <p className="budget-desc">
            Used <strong>{last7DaysNetCO2.toFixed(1)} kg</strong> of <strong>{carbonBudget} kg</strong> weekly budget.
          </p>
          <div className="budget-slider-control">
            <label htmlFor="dashboard-budget-slider" className="sr-only">Adjust weekly carbon budget</label>
            <span className="budget-slider-label">Set Budget:</span>
            <input
              id="dashboard-budget-slider"
              type="range"
              min="10"
              max="150"
              step="5"
              value={carbonBudget}
              onChange={e => onBudgetChange(parseInt(e.target.value))}
              className="budget-slider"
            />
            <span className="budget-slider-val">{carbonBudget} kg</span>
          </div>
        </div>
      </article>

      {/* Main Stats Summary */}
      <div className="dashboard-stats-wrapper">
        <div className="stat-grid">
          <StatCard
            id="daily-net-co2-card"
            label="Daily Average Net"
            value={dailyAvgNetCO2.toFixed(1)}
            unit="kg CO₂e"
            icon="🌍"
            accent="var(--color-primary)"
            description={`${globalComparison.label}`}
          />
          <StatCard
            id="net-co2-card"
            label="Lifetime Net Emissions"
            value={netCO2.toFixed(1)}
            unit="kg CO₂e"
            icon="📈"
            accent="var(--color-info)"
            description={`Across ${activeDays} tracking days`}
          />
          <StatCard
            id="offset-card"
            label="Carbon Offsets"
            value={offsetCredits.toFixed(1)}
            unit="kg CO₂e"
            icon="🌱"
            accent="var(--color-success)"
            description="Purchased via green habits"
          />
          <StatCard
            id="log-count-card"
            label="Total Entries"
            value={logCount}
            unit="logs"
            icon="📝"
            accent="var(--color-warning)"
            description={`Avg ${intensityPerEntry} kg per entry`}
          />
        </div>

        {/* Eco Tier Progress Bar */}
        <div className="tier-progress" aria-label={`Eco tier: ${ecoTier.name}`}>
          <div className="tier-progress__header">
            <span className="tier-progress__label">
              <span aria-hidden="true">{ecoTier.emoji}</span> {ecoTier.name}
            </span>
            <span className="tier-progress__desc">{ecoTier.description}</span>
          </div>
          <div
            className="tier-progress__bar"
            role="progressbar"
            aria-valuenow={Math.min(pctOfGlobal, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pctOfGlobal}% of global daily average`}
          >
            <div
              className="tier-progress__fill"
              style={{
                width: `${Math.min(pctOfGlobal, 100)}%`,
                background: ecoTier.color,
              }}
            />
          </div>
          <div className="tier-progress__labels">
            <span>0 kg</span>
            <span>Global avg: {GLOBAL_DAILY_AVG_KG} kg/day</span>
          </div>
        </div>
      </div>
    </section>
  );
}
