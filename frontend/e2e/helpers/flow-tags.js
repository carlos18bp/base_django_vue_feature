/**
 * Flow tag constants for consistent E2E test tagging.
 *
 * Each constant bundles @flow:, @module:, and @priority: tags.
 * Use spread syntax to compose tags in tests:
 *
 *   import { AUTH_LOGIN_EMAIL } from '../helpers/flow-tags.js';
 *   test('...', { tag: [...AUTH_LOGIN_EMAIL, '@role:shared'] }, async ({ page }) => { ... });
 */

// ── Auth ──
export const AUTH_LOGIN_EMAIL = ['@flow:auth-login-email', '@module:auth', '@priority:P1'];
export const AUTH_LOGIN_INVALID = ['@flow:auth-login-invalid', '@module:auth', '@priority:P1'];
export const AUTH_LOGIN_SERVER_ERROR = ['@flow:auth-login-server-error', '@module:auth', '@priority:P2'];
export const AUTH_REGISTER = ['@flow:auth-register', '@module:auth', '@priority:P1'];
export const AUTH_LOGOUT = ['@flow:auth-logout', '@module:auth', '@priority:P2'];
export const AUTH_PROTECTED_REDIRECT = ['@flow:auth-protected-redirect', '@module:auth', '@priority:P1'];
export const AUTH_GUEST_REDIRECT = ['@flow:auth-guest-redirect', '@module:auth', '@priority:P2'];
export const ADMIN_LOGIN_HANDOFF = ['@flow:admin-login-handoff', '@module:auth', '@priority:P2'];

// ── Shopping ──
export const SHOPPING_CATALOG_BROWSE = ['@flow:shopping-catalog-browse', '@module:shopping', '@priority:P1'];
export const SHOPPING_PRODUCT_DETAIL = ['@flow:shopping-product-detail', '@module:shopping', '@priority:P1'];
export const SHOPPING_CART_ADD = ['@flow:shopping-cart-add', '@module:shopping', '@priority:P1'];
export const SHOPPING_CART_REMOVE = ['@flow:shopping-cart-remove', '@module:shopping', '@priority:P2'];
export const SHOPPING_CART_PERSIST = ['@flow:shopping-cart-persist', '@module:shopping', '@priority:P2'];
export const SHOPPING_CHECKOUT_COMPLETE = ['@flow:shopping-checkout-complete', '@module:shopping', '@priority:P1'];

// ── Blog ──
export const BLOG_LIST_VIEW = ['@flow:blog-list-view', '@module:blog', '@priority:P2'];
export const BLOG_DETAIL_VIEW = ['@flow:blog-detail-view', '@module:blog', '@priority:P2'];
export const BLOG_DETAIL_NOT_FOUND = ['@flow:blog-detail-not-found', '@module:blog', '@priority:P3'];

// ── Home ──
export const HOME_CAROUSEL_NAVIGATE = ['@flow:home-carousel-navigate', '@module:home', '@priority:P3'];

// ── Navigation ──
export const HEADER_SEARCH = ['@flow:header-search', '@module:navigation', '@priority:P2'];
export const HEADER_CART_OVERLAY = ['@flow:header-cart-overlay', '@module:navigation', '@priority:P2'];
export const THEME_TOGGLE = ['@flow:theme-toggle', '@module:navigation', '@priority:P4'];
export const NOT_FOUND_PAGE = ['@flow:not-found-page', '@module:navigation', '@priority:P3'];

// ── Static ──
export const STATIC_ABOUT = ['@flow:static-about', '@module:static', '@priority:P4'];
export const STATIC_CONTACT = ['@flow:static-contact', '@module:static', '@priority:P4'];

// ── Manual ──
export const MANUAL_VIEW = ['@flow:manual-view', '@module:manual', '@priority:P3'];
export const MANUAL_SEARCH = ['@flow:manual-search', '@module:manual', '@priority:P3'];

// ── Admin ──
export const BACKOFFICE_USERS_LIST = ['@flow:backoffice-users-list', '@module:admin', '@priority:P2'];
export const BACKOFFICE_SALES_LIST = ['@flow:backoffice-sales-list', '@module:admin', '@priority:P2'];

// ── Platform ──
export const STAGING_PHASE_BANNER_DISPLAY = ['@flow:staging-phase-banner-display', '@module:platform', '@priority:P4'];
export const STAGING_REVIEW_EXPIRED_OVERLAY = ['@flow:staging-review-expired-overlay', '@module:platform', '@priority:P3'];
