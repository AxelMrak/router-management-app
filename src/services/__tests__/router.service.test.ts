import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { jsonRpcCall, routerLogin, createRouterClient } from '../router.service';
import type { ApiResult } from '@/types/router';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}));

describe('router.service', () => {
  let mockClient: ReturnType<typeof createRouterClient>;
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPost = vi.fn();
    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
      post: mockPost,
    });
    mockClient = createRouterClient();
  });

  describe('jsonRpcCall', () => {
    it('should build correct URL and request body', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          result: [0, { foo: 'bar' }],
        },
      });

      const result = await jsonRpcCall(
        mockClient,
        'test-token',
        'test-service',
        'test-method',
        { key: 'value' }
      );

      expect(mockPost).toHaveBeenCalledWith('/ubus', {
        jsonrpc: '2.0',
        id: expect.any(Number),
        method: 'call',
        params: ['test-token', 'test-service', 'test-method', { key: 'value' }],
      });
      expect(result).toEqual({ success: true, data: { foo: 'bar' } });
    });

    it('should handle error responses from JSON-RPC', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          error: { code: -32600, message: 'Invalid Request' },
        },
      });

      const result = await jsonRpcCall(mockClient, 'token', 'svc', 'method');

      expect(result).toEqual({
        success: false,
        error: { message: 'Invalid Request', code: -32600 },
      });
    });

    it('should handle ubus error codes in result', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          result: [1],
        },
      });

      const result = await jsonRpcCall(mockClient, 'token', 'svc', 'method');

      expect(result).toEqual({
        success: false,
        error: { message: 'ubus error code 1', code: 1 },
      });
    });

    it('should handle network errors', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));

      const result = await jsonRpcCall(mockClient, 'token', 'svc', 'method');

      expect(result).toEqual({
        success: false,
        error: { message: 'Network Error' },
      });
    });

    it('should handle empty result array', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          result: [],
        },
      });

      const result = await jsonRpcCall(mockClient, 'token', 'svc', 'method');

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('ubus error code'),
        }),
      });
    });
  });

  describe('routerLogin', () => {
    it('should call the correct endpoint with null session token', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          result: [0, { ubus_rpc_session: 'session-123' }],
        },
      });

      const result = await routerLogin(mockClient, 'admin', 'password123');

      expect(mockPost).toHaveBeenCalledWith('/ubus', {
        jsonrpc: '2.0',
        id: expect.any(Number),
        method: 'call',
        params: [
          '00000000000000000000000000000000',
          'session',
          'login',
          { username: 'admin', password: 'password123', timeout: 300 },
        ],
      });
      expect(result).toEqual({
        success: true,
        data: { ubus_rpc_session: 'session-123' },
      });
    });

    it('should handle login failure', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          result: [1],
        },
      });

      const result = await routerLogin(mockClient, 'admin', 'wrong');

      expect(result.success).toBe(false);
    });
  });

  describe('createRouterClient', () => {
    it('should create an axios instance with correct config', () => {
      const client = createRouterClient();

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});
