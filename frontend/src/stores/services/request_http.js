import api from '@/services/http/client';

/**
 * Request endpoint
 * @param {string} method - Type request.
 * @param {string} url - Endpoint
 * @param {object} params - Params.
 * @returns {object} - Data and status from endpoint.
 */
export async function makeRequest(method, url, params = {}) {
  try {
    let response;

    switch (method) {
      case "GET":
        response = await api.get(url);
        break;
      case "POST":
        response = await api.post(url, params);
        break;
      case "PUT":
        response = await api.put(url, params);
        break;
      case "PATCH":
        response = await api.patch(url, params);
        break;
      case "DELETE":
        response = await api.delete(url);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Get request.
 * @param {string} url - Endpoint.
 * @returns {object} - Data and status from endpoint.
 */
export async function get_request(url) {
  return await makeRequest("GET", url);
}

/**
 * Create request.
 * @param {string} url - Endpoint.
 * @param {object} params - Params.
 * @returns {object} - Data and status from endpoint.
 */
export async function create_request(url, params) {
  return await makeRequest("POST", url, params);
}

/**
 * Full update request (PUT).
 * @param {string} url - Endpoint.
 * @param {object} params - Params.
 * @returns {object} - Data and status from endpoint.
 */
export async function update_request(url, params) {
  return await makeRequest("PUT", url, params);
}

/**
 * Partial update request (PATCH).
 * @param {string} url - Endpoint.
 * @param {object} params - Params.
 * @returns {object} - Data and status from endpoint.
 */
export async function patch_request(url, params) {
  return await makeRequest("PATCH", url, params);
}

/**
 * Delete request.
 * @param {string} url - Endpoint.
 * @returns {object} - Data and status from endpoint.
 */
export async function delete_request(url) {
  return await makeRequest("DELETE", url);
}