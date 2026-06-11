/**
 * Input validation and sanitization utilities.
 * Prevents bad data, XSS strings, negative values, and NaN from entering the app state.
 */

/**
 * Validate and parse a numeric activity amount.
 * @param {string|number} value - Raw user input
 * @param {{ min?: number, max?: number }} [options]
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export function validateAmount(value, options = {}) {
  const { min = 0.001, max = 100000 } = options;

  if (value === '' || value === null || value === undefined) {
    return { valid: false, value: 0, error: 'Please enter a value.' };
  }

  const parsed = parseFloat(value);

  if (!isFinite(parsed) || isNaN(parsed)) {
    return { valid: false, value: 0, error: 'Please enter a valid number.' };
  }
  if (parsed <= 0) {
    return { valid: false, value: 0, error: 'Value must be greater than zero.' };
  }
  if (parsed < min) {
    return { valid: false, value: 0, error: `Minimum value is ${min}.` };
  }
  if (parsed > max) {
    return { valid: false, value: 0, error: `Maximum value is ${max.toLocaleString()}.` };
  }

  return { valid: true, value: parsed, error: null };
}

/**
 * Sanitize a string by stripping HTML tags and trimming whitespace.
 * Prevents XSS if any string is ever rendered with innerHTML.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')    // strip HTML tags
    .replace(/[<>"'`]/g, '')    // strip remaining dangerous chars
    .trim()
    .slice(0, 500);             // max length safeguard
}

/**
 * Validate the shape of imported JSON data.
 * @param {unknown} data - Parsed JSON
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateImportSchema(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, error: 'File must contain a JSON object.' };
  }

  if (!Array.isArray(data.history)) {
    return { valid: false, error: 'Missing required field: "history" array.' };
  }

  const requiredLogFields = ['id', 'category', 'type', 'amount', 'co2'];
  for (const log of data.history) {
    if (typeof log !== 'object' || log === null) {
      return { valid: false, error: 'Each history entry must be an object.' };
    }
    for (const field of requiredLogFields) {
      if (!(field in log)) {
        return { valid: false, error: `History entry missing field: "${field}".` };
      }
    }
    if (typeof log.co2 !== 'number' || !isFinite(log.co2) || log.co2 < 0) {
      return { valid: false, error: 'Each history entry must have a non-negative numeric "co2" field.' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Validate a reduction percentage for the what-if simulator.
 * @param {number} pct
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateReductionPct(pct) {
  if (typeof pct !== 'number' || !isFinite(pct)) {
    return { valid: false, error: 'Reduction must be a number.' };
  }
  if (pct < 1 || pct > 100) {
    return { valid: false, error: 'Reduction must be between 1% and 100%.' };
  }
  return { valid: true, error: null };
}
