/**
 * Check whether a string is a valid email address.
 *
 * @param {string} email - The value to validate.
 * @returns {boolean} True if the email format is valid.
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Check whether a password meets the minimum length requirement.
 *
 * @param {string} password - The value to validate.
 * @param {number} [minLength=8] - Minimum required character count.
 * @returns {boolean} True if the password is long enough.
 */
export function isValidPassword(password, minLength = 8) {
  if (!password) return false;
  return password.length >= minLength;
}

/**
 * Check whether a string is non-empty after trimming whitespace.
 *
 * @param {string} value - The value to validate.
 * @returns {boolean} True if the string contains at least one non-whitespace character.
 */
export function isNonEmpty(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}
