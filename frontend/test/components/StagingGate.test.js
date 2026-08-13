import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';

jest.mock('@/services/http/stagingBanner', () => ({
  fetchStagingBannerState: jest.fn(),
}));

import { fetchStagingBannerState } from '@/services/http/stagingBanner';
import StagingGate from '@/components/staging/StagingGate.vue';

// Minimal message set for the keys StagingPhaseBanner / StagingExpiredOverlay
// read via t() — mirrors the frontend/test/views/Dashboard.test.js pattern
// of building an ad-hoc i18n instance instead of importing the real catalog.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      staging: {
        banner: {
          forReview: 'for review',
          daysRemainingOne: 'expires in',
          daysRemainingMany: 'expires in',
          dayOne: 'day',
          dayMany: 'days',
        },
        expired: {
          body: 'This preview window has expired.',
          cta: 'Contact us to keep going.',
          whatsappLabel: 'WhatsApp',
          emailLabel: 'Email',
          title: 'The {phase} preview has expired',
        },
      },
    },
  },
});

// `phase_labels` is required — StagingPhaseBanner:39 and
// StagingExpiredOverlay:54 read `props.state.phase_labels[locale.value]`
// directly (no optional chaining), so a fixture missing this key throws on
// mount instead of exercising the routing logic under test.
const buildState = (overrides = {}) => ({
  is_visible: true,
  current_phase: 'design',
  phase_labels: { es: 'Diseño', en: 'Design' },
  started_at: null,
  expires_at: null,
  days_remaining: null,
  is_expired: false,
  contact_whatsapp: '+57 300 000 0000',
  contact_email: 'staging@example.com',
  ...overrides,
});

// One exact-shape assertion per case: which of the three mutually exclusive
// nodes (banner / overlay / slot content) are present after the store
// resolves `fetchState()`.
const presence = (wrapper) => ({
  banner: wrapper.find('[data-testid="staging-phase-banner"]').exists(),
  overlay: wrapper.find('[data-testid="staging-expired-overlay"]').exists(),
  content: wrapper.find('[data-testid="site-content"]').exists(),
});

describe('StagingGate', () => {
  let wrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  async function mountGate(state) {
    fetchStagingBannerState.mockResolvedValue(state);
    wrapper = mount(StagingGate, {
      global: { plugins: [i18n] },
      slots: { default: '<div data-testid="site-content">content</div>' },
    });
    await flushPromises();
    return wrapper;
  }

  // Falla si isActive deja de exigir started_at y el gate empieza a mostrar
  // el banner/overlay para una fase visible que todavía no arrancó.
  test('renders only the default slot when the banner is visible but not started', async () => {
    await mountGate(buildState({ started_at: null, is_expired: false }));

    expect(presence(wrapper)).toEqual({ banner: false, overlay: false, content: true });
  });

  // Falla si showBanner/showOverlay dejan de ser mutuamente excluyentes y el
  // overlay se activa (o el contenido se oculta) mientras la fase sigue vigente.
  test('renders the phase banner alongside slot content when active and not expired', async () => {
    await mountGate(
      buildState({ started_at: '2026-08-01T00:00:00Z', is_expired: false, days_remaining: 5 }),
    );

    expect(presence(wrapper)).toEqual({ banner: true, overlay: false, content: true });
  });

  // Falla si el gate llega a renderizar el overlay Y el contenido del sitio
  // al mismo tiempo (o ninguno) cuando la ventana de staging expiró.
  test('renders only the expired overlay when the staging window has expired', async () => {
    await mountGate(
      buildState({ started_at: '2026-08-01T00:00:00Z', is_expired: true, days_remaining: 0 }),
    );

    expect(presence(wrapper)).toEqual({ banner: false, overlay: true, content: false });
  });
});
