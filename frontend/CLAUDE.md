# Frontend Rules — Nuxt 3 / Vue 3 / TypeScript

## NuxtJS / Vue / TypeScript Development

You are an expert in TypeScript, Node.js, NuxtJS, Vue 3, Shadcn Vue, Radix Vue, VueUse, and Tailwind.

### Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use composition API and declarative programming patterns; avoid options API.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, composables, helpers, static content, types.

### Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Use PascalCase for component names (e.g., AuthWizard.vue).
- Use camelCase for composables (e.g., useAuthState.ts).

### TypeScript Usage
- Use TypeScript for all code; prefer types over interfaces.
- Avoid enums; use const objects instead.
- Use Vue 3 with TypeScript, leveraging defineComponent and PropType.

### Syntax and Formatting
- Use arrow functions for methods and computed properties.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use template syntax for declarative rendering.

### UI and Styling
- Use Shadcn Vue, Radix Vue, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

### Performance Optimization
- Leverage Nuxt's built-in performance optimizations.
- Use Suspense for asynchronous components.
- Implement lazy loading for routes and components.
- Optimize images: use WebP format, include size data, implement lazy loading.

### Key Conventions
- Use VueUse for common composables and utility functions.
- Use Pinia for state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Utilize Nuxt's auto-imports feature for components and composables.

### Nuxt-specific Guidelines
- Follow Nuxt 3 directory structure (pages/, components/, composables/).
- Use Nuxt's built-in features: auto-imports, file-based routing, server routes, plugins.
- Use useFetch and useAsyncData for data fetching.
- Implement SEO best practices using Nuxt's useHead and useSeoMeta.

### Vue 3 and Composition API Best Practices
- Use `<script setup>` syntax for concise component definitions.
- Leverage ref, reactive, and computed for reactive state management.
- Use provide/inject for dependency injection when appropriate.
- Implement custom composables for reusable logic.

---

## Tailwind CSS Rules

### Class Ordering
Follow consistent order: layout → position → spacing → sizing → typography → visual → interactive

```html
<!-- ✅ Correct order -->
<div class="flex items-center justify-between gap-4 px-6 py-4 w-full text-sm font-medium text-gray-900 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">

<!-- ❌ Random order -->
<div class="shadow-sm text-sm flex bg-white py-4 hover:shadow-md items-center rounded-lg px-6 gap-4 w-full font-medium">
```

### Responsive Design
Always mobile-first. Never use `max-*` breakpoints unless absolutely necessary.
Breakpoint order: `sm:` → `md:` → `lg:` → `xl:` → `2xl:`

### Dark Mode
Use `dark:` variant consistently. Define color pairs for every visible element.

### @apply Usage
Use `@apply` ONLY for base component styles that repeat 5+ times. Prefer utility classes inline.

### Conditional Classes (Vue/Nuxt)
```vue
<template>
  <button :class="[
    'px-4 py-2 rounded-lg font-medium transition-colors',
    variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : '',
    { 'opacity-50 cursor-not-allowed': disabled }
  ]">
    <slot />
  </button>
</template>
```

### Avoid These Patterns
- Never use `style=""` when a Tailwind class exists
- Never mix Tailwind with separate CSS files for the same component
- Never hardcode pixel values (`w-[347px]`) — use design tokens
- Avoid `!important` via `!` prefix unless overriding third-party styles
- Keep arbitrary values (`text-[#1a1a2e]`) to a minimum — define in config instead

---

## Jest & Testing Library Rules

### Test File Structure
Place test files in `test/` directory, use `.spec.ts` extension for Vue/Nuxt projects.

### Test Anatomy
Follow Arrange → Act → Assert pattern. One concept per test.

### Naming Conventions
```typescript
// ✅ Descriptive
describe('LoginForm', () => {
  it('should show validation error when email is empty')
  it('should call onSubmit with form data when valid')
  it('should disable button while submitting')
})
```

### Testing Library: Query Priority
```typescript
// Priority order (best to worst)
screen.getByRole('button', { name: /submit/i })   // 1st: Role
screen.getByLabelText('Email')                      // 2nd: Label
screen.getByPlaceholderText('Enter email')          // 3rd: Placeholder
screen.getByText('Submit')                          // 4th: Text
screen.getByTestId('submit-btn')                    // Last resort
```

### Vue Testing
```typescript
// With @testing-library/vue (preferred)
import { render, screen } from '@testing-library/vue'

describe('UserProfile', () => {
  it('should render user info from props', () => {
    render(UserProfile, {
      props: { name: 'Carlos', role: 'Developer' }
    })
    expect(screen.getByText('Carlos')).toBeInTheDocument()
  })
})

// With @vue/test-utils (for deeper component testing)
import { mount } from '@vue/test-utils'

describe('Counter', () => {
  it('should increment count on button click', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-testid="count"]').text()).toBe('1')
  })
})
```

### Mocking
- Mock modules: `jest.mock('@/services/api', () => ({ fetchUsers: jest.fn() }))`
- MSW preferred over manual mocks for integration tests
- Do NOT mock: implementation details, the component under test, standard library functions

### Async Testing
```typescript
// ✅ Use findBy* for async elements (auto-waits)
const userName = await screen.findByText('Ana')

// ✅ Use waitFor for assertions on async state
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// ❌ Never use arbitrary timeouts
await new Promise(resolve => setTimeout(resolve, 1000))
```

### Test Data — Use factories, never hardcode
```typescript
const createUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
})
```

### What to Test / What NOT to Test
**Test**: User-visible behavior, props → output, events → state changes, error states, loading states, form validation
**Do NOT test**: Implementation details, CSS class names, third-party internals, exact HTML structure, constants

### Coverage
```json
{ "coverageThreshold": { "global": { "branches": 70, "functions": 70, "lines": 80, "statements": 80 } } }
```

### Anti-Patterns to Avoid
- Testing implementation details instead of behavior
- Snapshot tests as primary strategy
- Tests that pass when the feature is broken
- `act()` warnings — usually means not awaiting async properly

---

## Playwright E2E Testing Rules

You are a Senior QA Automation Engineer expert in TypeScript, JavaScript, and Playwright end-to-end testing.

- Use descriptive and meaningful test names that clearly describe the expected behavior.
- Utilize Playwright fixtures (`test`, `page`, `expect`) to maintain test isolation.
- Use `test.beforeEach` and `test.afterEach` for setup and teardown.
- Keep tests DRY by extracting reusable logic into helper functions.
- Always use recommended built-in and role-based locators (`page.getByRole`, `page.getByLabel`, `page.getByText`, `page.getByTitle`, etc.) over complex selectors.
- Use `page.getByTestId` whenever `data-testid` is defined.
- Use the `playwright.config.ts` file for global configuration.
- Use web-first assertions (`toBeVisible`, `toHaveText`, etc.) whenever possible.
- Avoid hardcoded timeouts — use `page.waitFor` with specific conditions.
- Ensure tests run reliably in parallel without shared state conflicts.
- Focus on critical user paths maintaining tests that are stable and reflect real user behavior.

---

## i18n Rules — Nuxt

### Core Principle
NEVER hardcode user-facing strings. Every text the user sees must go through the translation system.

### Nuxt i18n Setup
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
  },
})
```

### Usage in Components
```vue
<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
</script>

<template>
  <h1>{{ $t('products.title') }}</h1>
  <p>{{ $t('products.price', { price: product.price }) }}</p>
  <NuxtLinkLocale to="/products">{{ $t('nav.products') }}</NuxtLinkLocale>
</template>
```

### Rules
- Every user-facing string must be translatable
- Translation keys use dot notation by feature: `products.addToCart`
- Never concatenate translated strings — use variables instead
- Always handle pluralization properly
- Dates, numbers, and currencies use Intl API
- Default locale: Spanish; keep translation keys in English
- Lazy load translation files to reduce bundle size

---

## SEO Rules — Nuxt

### Meta Tags
Every public page MUST have unique title, description, and canonical URL.

```vue
<script setup lang="ts">
useHead({
  title: `${product.value.name} | Mi Tienda`,
  meta: [
    { name: 'description', content: product.value.description.slice(0, 155) },
  ],
  link: [
    { rel: 'canonical', href: `https://mitienda.com/products/${product.value.id}` },
  ],
})

useSeoMeta({
  ogTitle: product.value.name,
  ogDescription: product.value.description.slice(0, 155),
  ogImage: product.value.image,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>
```

### Title Pattern
- Max 60 characters, primary keyword first, brand last
- Use `|` or `—` as separator, be consistent
- Every page has a UNIQUE title

### SSR vs SSG Decision
- SSR: Content changes every request (dashboard, cart)
- ISR: Content changes rarely (products, blog)
- SSG: Content never changes (about, terms, landing)

### Images
- Always include `alt` text
- Use `<NuxtImg>` for automatic optimization
- Use WebP/AVIF formats
- Set explicit `width` and `height` to prevent layout shift

### URLs
- Use slugs, not IDs: `/products/bolso-cuero-artesanal` not `/products/123`
- Lowercase, hyphens, no underscores
- Implement proper 301 redirects when URLs change

---

## Testing Quality Standards

Full reference: `docs/TESTING_QUALITY_STANDARDS.md`

### Mandatory Naming Rules
- Each test verifies **ONE specific behavior**
- **No conjunctions** (`and`, `y`, `&`) in test names
- **Forbidden tokens**: `batch`, `cov`, `coverage`, `deep`, `all`, `misc`, `various`
- JS naming: `it('verb phrase describing behavior', ...)`

### Assertions
- Assert **observable outcomes** (rendered UI, emitted events, status codes)
- Never assert implementation details
- Every test must have meaningful assertions

### Test Body Rules
- **No conditionals** in test body — use `it.each()` for parameterization
- Follow **AAA pattern**: Arrange → Act → Assert

### Determinism
- Never use `Date.now()`, `new Date()`, `Math.random()` without control
- Use `jest.useFakeTimers()` + `jest.setSystemTime()`, always restore

### Test Isolation
- Each test independent — no dependency on execution order
- JS mocks: always restore (`mockRestore()`, `afterEach`)
- localStorage/sessionStorage: clear in `afterEach`

### Frontend-Specific
- **No `wrapper.vm.*`** — test through user interaction
- **Stable selectors**: `[data-testid="..."]` or `findComponent()` — never `.find('.class')`
- **One mount per test** unless testing re-render
- Timer restoration mandatory

### E2E-Specific (Playwright)
- **Selector hierarchy**: `getByRole` > `getByTestId` > `locator('[data-testid]')`
- **No `waitForTimeout()`** — use `toBeVisible()`, `waitForResponse()`, `waitForURL()`
- **No hardcoded test data** — use fixtures or generated data
- Every E2E test must have `@flow:<flow-id>` tag matching `flow-definitions.json`

### Coverage Targets

| Layer | Minimum |
|-------|---------|
| Frontend Stores | 75% |
| Frontend Components | 60% |
| Utils | 90% |
| E2E | Critical paths |

---

## Coverage Report Standard

Full reference: `docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`

### Color Thresholds
| Coverage % | Color | Meaning |
|------------|-------|---------|
| > 80% | Green | Good |
| 50–80% | Yellow | Needs improvement |
| < 50% | Red | Critical |

### Frontend Jest Coverage
- Config: `frontend/jest.config.cjs` with `coverageReporters: ['text', 'text-summary', 'json-summary']`
- Custom reporter: `frontend/scripts/coverage-summary.cjs`
- Run: `npm run test:coverage`

### Interpreting Coverage
- Prioritize files with lowest % and highest "Miss" count
- Priority order: Stores → Composables → Components
- Do not polish near-100% files until low-coverage files are addressed

---

## E2E Flow Coverage Standard

Full reference: `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md`

### Key Files
```
frontend/e2e/flow-definitions.json           # Source of truth: all user flows
frontend/e2e/reporters/flow-coverage-reporter.mjs  # Custom Playwright reporter
e2e-results/flow-coverage.json               # JSON artifact (auto-generated)
```

### Tagging Tests
Every E2E test MUST have `@flow:<flow-id>` tag(s):
```javascript
test('user signs in with email', {
  tag: ['@flow:auth-login-email'],
}, async ({ page }) => { /* ... */ });
```

### Flow Status
| Status | Condition |
|--------|-----------|
| `missing` | No tests exist |
| `failing` | Any test failed or timed out |
| `covered` | All passed, none skipped |
| `partial` | Some passed but some skipped |

### Maintenance
- Adding a flow: update `flow-definitions.json`, create specs with `@flow:` tag, register in `docs/USER_FLOW_MAP.md`
- Renaming: must be atomic (update definition AND all tags simultaneously)
- Regenerate: `node frontend/scripts/generate-coverage.js`
