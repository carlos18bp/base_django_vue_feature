/**
 * Format a numeric value as a currency string.
 *
 * @param {number|string} amount - The amount to format.
 * @param {string} [currency='USD'] - ISO 4217 currency code.
 * @param {string} [locale='en-US'] - BCP 47 locale string.
 * @returns {string} Formatted currency string, e.g. "$12.50".
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

/**
 * Truncate a string to a maximum length and append an ellipsis if needed.
 *
 * @param {string} text - The input string.
 * @param {number} [maxLength=100] - Maximum allowed length before truncation.
 * @returns {string} Truncated string with "…" appended when over the limit.
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text ?? '';
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Capitalise the first letter of a string.
 *
 * @param {string} text - The input string.
 * @returns {string} String with its first character in upper case.
 */
export function capitalise(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
