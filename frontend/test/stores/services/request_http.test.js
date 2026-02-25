import api from '@/services/http/client';
import { create_request, delete_request, get_request, makeRequest, patch_request, update_request } from '@/stores/services/request_http';

jest.mock('@/services/http/client', () => {
  const apiFn = jest.fn();
  apiFn.get = jest.fn();
  apiFn.post = jest.fn();
  apiFn.put = jest.fn();
  apiFn.patch = jest.fn();
  apiFn.delete = jest.fn();
  return {
    __esModule: true,
    default: apiFn,
  };
});

describe('request_http service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('get_request calls api.get with correct url', async () => {
    const response = { data: { ok: true } };
    api.get.mockResolvedValue(response);

    const result = await get_request('test-url/');

    expect(api.get).toHaveBeenCalledWith('test-url/');
    expect(result).toBe(response);
  });

  test('create_request calls api.post with url and params', async () => {
    const response = { status: 201 };
    api.post.mockResolvedValue(response);

    const body = { foo: 'bar' };
    const result = await create_request('create-url/', body);

    expect(api.post).toHaveBeenCalledWith('create-url/', body);
    expect(result).toBe(response);
  });

  test('propagates errors from api methods', async () => {
    const error = new Error('network');
    api.get.mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(get_request('error-url/')).rejects.toBe(error);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('update_request calls api.put with url and params', async () => {
    const response = { status: 200 };
    api.put.mockResolvedValue(response);

    const body = { foo: 'updated' };
    const result = await update_request('update-url/', body);

    expect(api.put).toHaveBeenCalledWith('update-url/', body);
    expect(result).toBe(response);
  });

  test('patch_request calls api.patch with url and params', async () => {
    const response = { status: 200 };
    api.patch.mockResolvedValue(response);

    const body = { foo: 'patched' };
    const result = await patch_request('patch-url/', body);

    expect(api.patch).toHaveBeenCalledWith('patch-url/', body);
    expect(result).toBe(response);
  });

  test('delete_request calls api.delete with url', async () => {
    const response = { status: 204 };
    api.delete.mockResolvedValue(response);

    const result = await delete_request('delete-url/');

    expect(api.delete).toHaveBeenCalledWith('delete-url/');
    expect(result).toBe(response);
  });

  test('throws for unsupported methods', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(makeRequest('TRACE', 'unsupported-url/')).rejects.toThrow('Unsupported method');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
