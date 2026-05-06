import { defineStore } from 'pinia';
import { fetchStagingBannerState } from '@/services/http/stagingBanner';

const TRACKED_FIELDS = [
  'is_visible',
  'current_phase',
  'started_at',
  'expires_at',
  'days_remaining',
  'is_expired',
  'contact_whatsapp',
  'contact_email',
];

function isSameState(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return TRACKED_FIELDS.every((key) => a[key] === b[key]);
}

export const useStagingBannerStore = defineStore('stagingBanner', {
  state: () => ({
    state: null,
    isLoading: false,
    hasFetched: false,
  }),

  actions: {
    async fetchState() {
      this.isLoading = true;
      try {
        const fresh = await fetchStagingBannerState();
        // Skip mutation if identical — otherwise every Pinia subscriber
        // re-evaluates on each 60s poll tick.
        if (!isSameState(this.state, fresh)) {
          this.state = fresh;
        }
      } catch {
        // Silent failure: gate falls back to rendering children unchanged.
      } finally {
        this.isLoading = false;
        this.hasFetched = true;
      }
    },
  },
});
