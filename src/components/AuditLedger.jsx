import React, { useState, useCallback } from 'react';

const CATEGORY_COLORS = {
  Transport: '#3b82f6',
  Energy:    '#f59e0b',
  Food:      '#10b981',
  Water:     '#06b6d4',
  Other:     '#8b5cf6',
};

/**
 * Audit Ledger — displays, filters, and allows deletion of activity logs.
 * Accessible: table with proper th scope, keyboard-operable delete buttons.
 *
 * @param {{ logs: Array, onDelete: Function }} props
 */
export function AuditLedger({ logs, onDelete }) {
  const [filter, setFilter] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const categories = ['All', ...new Set(logs.map(l => l.category))];

  const handleSort = useCallback((field) => {
    setSortDir(prev => (sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'));
    setSortField(field);
  }, [sortField]);

  const filtered = logs
    .filter(l => filter === 'All' || l.category === filter)
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'co2' || sortField === 'amount') { av = parseFloat(av); bv = parseFloat(bv); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }) => (
    <span aria-hidden="true" className="sort-icon">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <section aria-labelledby="ledger-heading" className="card">
      <div className="card__header">
        <h2 id="ledger-heading" className="card__title">
          <span aria-hidden="true">📋</span> Activity Log
        </h2>
        <span className="ledger-count" aria-label={`${logs.length} entries total`}>{logs.length} entries</span>
      </div>

      {/* Category Filter */}
      <div role="group" aria-label="Filter by category" className="ledger-filters">
        {categories.map(cat => (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase()}`}
            onClick={() => setFilter(cat)}
            className={`filter-btn ${filter === cat ? 'filter-btn--active' : ''}`}
            aria-pressed={filter === cat}
            style={filter === cat && cat !== 'All' ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ledger-empty" role="status">
          <span aria-hidden="true">📭</span>
          <p>{logs.length === 0 ? 'No activities logged yet. Start tracking above!' : 'No entries match the selected filter.'}</p>
        </div>
      ) : (
        <div className="ledger-table-wrapper">
          <table className="ledger-table" aria-label="Activity log entries" aria-rowcount={filtered.length}>
            <thead>
              <tr>
                <th scope="col">
                  <button className="sort-btn" onClick={() => handleSort('category')} aria-sort={sortField === 'category' ? sortDir : 'none'}>
                    Category <SortIcon field="category" />
                  </button>
                </th>
                <th scope="col">Type</th>
                <th scope="col">
                  <button className="sort-btn" onClick={() => handleSort('amount')} aria-sort={sortField === 'amount' ? sortDir : 'none'}>
                    Amount <SortIcon field="amount" />
                  </button>
                </th>
                <th scope="col">
                  <button className="sort-btn" onClick={() => handleSort('co2')} aria-sort={sortField === 'co2' ? sortDir : 'none'}>
                    CO₂ (kg) <SortIcon field="co2" />
                  </button>
                </th>
                <th scope="col">Date & Time</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => (
                <tr key={log.id} aria-rowindex={idx + 1}>
                  <td>
                    <span
                      className="category-badge"
                      style={{ background: (CATEGORY_COLORS[log.category] || '#8b5cf6') + '22', color: CATEGORY_COLORS[log.category] || '#8b5cf6' }}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="ledger-type">{log.type}</td>
                  <td>{log.amount} {log.unit || 'units'}</td>
                  <td><strong>{log.co2}</strong></td>
                  <td className="ledger-date">{log.date}<br /><small>{log.time}</small></td>
                  <td>
                    <button
                      onClick={() => onDelete(log.id)}
                      className="btn btn--icon btn--danger-ghost"
                      aria-label={`Delete ${log.category} entry: ${log.type}, ${log.co2} kg CO₂`}
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Row */}
      {filtered.length > 0 && (
        <div className="ledger-summary" aria-label="Summary of filtered entries">
          <span>Showing {filtered.length} entries</span>
          <span>
            Total: <strong>{filtered.reduce((s, l) => s + (l.co2 || 0), 0).toFixed(2)} kg CO₂e</strong>
          </span>
        </div>
      )}
    </section>
  );
}
