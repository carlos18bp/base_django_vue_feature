/**
 * Application-wide shared constants.
 *
 * Import individual named exports to keep bundle size minimal.
 */

export const APP_NAME = 'Base Feature';

/** Supported locale codes. */
export const SUPPORTED_LOCALES = ['en', 'es'];

/** Default locale used when no preference is detected. */
export const DEFAULT_LOCALE = 'en';

/** LocalStorage key for persisting the active locale. */
export const LOCALE_STORAGE_KEY = 'locale';

/** User role identifiers — must match backend Role.choices values. */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

/** HTTP status codes referenced across stores and composables. */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500,
};
