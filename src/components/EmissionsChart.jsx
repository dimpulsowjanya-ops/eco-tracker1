import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const CATEGORY_COLORS = {
  Transport: '#3b82f6',
  Energy:    '#f59e0b',
  Food:      '#10b981',
  Water:     '#06b6d4',
  Other:     '#8b5cf6',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip" role="tooltip">
      <p className="chart-tooltip__date">{label}</p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color }} className="chart-tooltip__row">
          {entry.name}: <strong>{entry.value.toFixed(2)} kg</strong>
        </p>
      ))}
      <p className="chart-tooltip__total">
        Total: <strong>{payload.reduce((s, e) => s + (e.value || 0), 0).toFixed(2)} kg</strong>
      </p>
    </div>
  );
};

/**
 * Emissions chart with stacked bar chart and line chart tabs.
 *
 * @param {{ chartData: Array, categoryBreakdown: object }} props
 */
export function EmissionsChart({ chartData, categoryBreakdown }) {
  const [chartType, setChartType] = React.useState('bar');

  const categories = Object.keys(CATEGORY_COLORS).filter(cat =>
    chartData.some(d => (d[cat] || 0) > 0)
  );

  const isEmpty = chartData.length === 0;

  return (
    <section aria-labelledby="chart-heading" className="card chart-card">
      <div className="card__header">
        <h2 id="chart-heading" className="card__title">
          <span aria-hidden="true">📉</span> Emissions Over Time
        </h2>
        <div role="group" aria-label="Chart type selector" className="chart-type-toggle">
          <button
            id="chart-bar-btn"
            onClick={() => setChartType('bar')}
            className={`btn btn--small ${chartType === 'bar' ? 'btn--active' : 'btn--ghost'}`}
            aria-pressed={chartType === 'bar'}
          >
            Bar
          </button>
          <button
            id="chart-line-btn"
            onClick={() => setChartType('line')}
            className={`btn btn--small ${chartType === 'line' ? 'btn--active' : 'btn--ghost'}`}
            aria-pressed={chartType === 'line'}
          >
            Line
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="chart-empty" role="status">
          <span aria-hidden="true">📊</span>
          <p>Log some activities to see your emissions chart.</p>
        </div>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={220}>
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {categories.map(cat => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} radius={cat === categories[categories.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {categories.map(cat => (
                  <Line key={cat} type="monotone" dataKey={cat} stroke={CATEGORY_COLORS[cat]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="breakdown" aria-label="Emissions breakdown by category">
          <h3 className="breakdown__title">Category Breakdown</h3>
          <div className="breakdown__bars">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, pct]) => (
                <div key={cat} className="breakdown__row">
                  <span className="breakdown__label" style={{ color: CATEGORY_COLORS[cat] || 'var(--color-text)' }}>{cat}</span>
                  <div
                    className="breakdown__bar-track"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat}: ${pct}%`}
                  >
                    <div
                      className="breakdown__bar-fill"
                      style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] || 'var(--color-primary)' }}
                    />
                  </div>
                  <span className="breakdown__pct">{pct}%</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
