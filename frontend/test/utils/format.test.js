import { formatCurrency, truncate, capitalise } from '@/utils/format';

describe('formatCurrency', () => {
  test('formats a positive integer as USD by default', () => {
    const result = formatCurrency(10);
    expect(result).toBe('$10.00');
  });

  test('formats a decimal number correctly', () => {
    const result = formatCurrency(12.5);
    expect(result).toBe('$12.50');
  });

  test('formats a numeric string', () => {
    const result = formatCurrency('99.99');
    expect(result).toBe('$99.99');
  });

  test('returns empty string for NaN input', () => {
    expect(formatCurrency('not-a-number')).toBe('');
  });

  test('formats zero as currency', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  test('formats with a different currency code', () => {
    const result = formatCurrency(50, 'EUR', 'de-DE');
    expect(result).toContain('50');
    expect(result).toContain('€');
  });
});

describe('truncate', () => {
  test('returns the original string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  test('truncates and appends ellipsis when over limit', () => {
    const result = truncate('hello world', 5);
    expect(result).toContain('…');
    expect(result.length).toBeLessThan(10);
  });

  test('uses 100 as the default max length', () => {
    const short = 'short text';
    expect(truncate(short)).toBe(short);
  });

  test('returns empty string for null input', () => {
    expect(truncate(null)).toBe('');
  });

  test('returns empty string for undefined input', () => {
    expect(truncate(undefined)).toBe('');
  });

  test('returns string unchanged when exactly at limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('capitalise', () => {
  test('capitalises the first letter of a lowercase string', () => {
    expect(capitalise('hello')).toBe('Hello');
  });

  test('returns the string unchanged when first letter is already uppercase', () => {
    expect(capitalise('World')).toBe('World');
  });

  test('returns empty string for empty input', () => {
    expect(capitalise('')).toBe('');
  });

  test('returns empty string for null input', () => {
    expect(capitalise(null)).toBe('');
  });

  test('handles single character string', () => {
    expect(capitalise('a')).toBe('A');
  });
});
