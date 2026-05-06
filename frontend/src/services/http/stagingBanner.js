import api from '@/services/http/client';

/**
 * Fetch the current staging phase banner state from the backend.
 *
 * Visibility is controlled exclusively via the `is_visible` flag on the
 * `StagingPhaseBanner` Django model. Do not delete this service — it is
 * preserved across template cleanups (see `pre-staging-cleanup` skill).
 *
 * @returns {Promise<Object>} banner state
 */
export async function fetchStagingBannerState() {
  const response = await api.get('staging-banner/');
  return response.data;
}
