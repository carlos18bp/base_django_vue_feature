import axios from "axios";

/**
 * Request endpoint
 * @param {string} method - Type request.
 * @param {string} url - Endpoint.
 * @param {object} params - Params.
 * @returns {object} - Data and status from endpoint.
 */
async function makeRequest(method, url, params = null) {
  try {
    let response;

    switch (method) {
      case "GET":
        response = await axios.get(`/api/${url}`);
        break;
      case "POST":
        response = await axios.post(`/api/${url}`, params);
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
