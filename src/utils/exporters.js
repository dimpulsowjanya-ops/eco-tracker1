/**
 * Export utilities for CSV and JSON data export.
 * Pure functions with no side effects — all DOM interaction is in components.
 */

/**
 * Convert log entries to a CSV string.
 * @param {Array<{category:string, type:string, amount:number, co2:number, date:string, time:string}>} logs
 * @returns {string} CSV-formatted string
 */
export function logsToCSV(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return '';
  const header = ['Date', 'Time', 'Category', 'Type', 'Amount', 'CO2 (kg)'];
  const rows = logs.map(l => [
    l.date ?? '',
    l.time ?? '',
    l.category ?? '',
    l.type ?? '',
    l.amount ?? 0,
    l.co2 ?? 0,
  ]);
  return [header, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

/**
 * Build the full JSON export payload.
 * @param {Array} logs
 * @param {number} offsetCredits
 * @param {number} totalCO2
 * @param {number} xpPoints
 * @returns {object}
 */
export function buildExportPayload(logs, offsetCredits, totalCO2, xpPoints) {
  return {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    summary: {
      totalEntries: logs.length,
      grossCO2kg: Math.round(logs.reduce((s, l) => s + (l.co2 || 0), 0) * 100) / 100,
      offsetCredits,
      netCO2kg: totalCO2,
      xpPoints,
    },
    history: logs,
  };
}

/**
 * Trigger a browser file download with given content.
 * @param {string} content - File content string
 * @param {string} filename - e.g. 'eco-data.csv'
 * @param {string} mimeType - e.g. 'text/csv'
 */
export function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.setAttribute('aria-hidden', 'true');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
