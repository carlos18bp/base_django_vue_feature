import { isValidEmail, isValidPassword, isNonEmpty } from '@/utils/validators';

describe('isValidEmail', () => {
  test('returns true for a valid email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('returns false for an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidEmail(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  test('returns false for string without @', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });

  test('returns false for string without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  test('returns false for string without TLD', () => {
    expect(isValidEmail('user@example')).toBe(false);
  });

  test('trims whitespace before validation', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });
});

describe('isValidPassword', () => {
  test('returns true when password meets default minimum length of 8', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });

  test('returns false when password is shorter than default minimum', () => {
    expect(isValidPassword('short')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidPassword('')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidPassword(null)).toBe(false);
  });

  test('returns true with a custom minimum length', () => {
    expect(isValidPassword('abc', 3)).toBe(true);
  });

  test('returns false when password is exactly one character below custom minimum', () => {
    expect(isValidPassword('ab', 3)).toBe(false);
  });
});

describe('isNonEmpty', () => {
  test('returns true for a non-empty string', () => {
    expect(isNonEmpty('hello')).toBe(true);
  });

  test('returns false for an empty string', () => {
    expect(isNonEmpty('')).toBe(false);
  });

  test('returns false for a whitespace-only string', () => {
    expect(isNonEmpty('   ')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isNonEmpty(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isNonEmpty(undefined)).toBe(false);
  });

  test('returns true for numeric zero (non-empty value)', () => {
    expect(isNonEmpty(0)).toBe(true);
  });

  test('returns true for boolean false (converts to non-empty string "false")', () => {
    expect(isNonEmpty(false)).toBe(true);
  });
});
