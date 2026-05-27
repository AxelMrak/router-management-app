import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, logout } from '../auth.service';
import * as routerService from '@/services/router.service';

vi.mock('@/services/router.service', () => ({
  createRouterClient: vi.fn(() => ({})),
  routerLogin: vi.fn(),
}));

describe('auth.service', () => {
  const mockRouterLogin = vi.mocked(routerService.routerLogin);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return token on success', async () => {
      mockRouterLogin.mockResolvedValueOnce({
        success: true,
        data: { ubus_rpc_session: 'session-abc-123' },
      });

      const token = await login('admin', 'password123');

      expect(token).toBe('session-abc-123');
      expect(mockRouterLogin).toHaveBeenCalledWith(
        expect.any(Object),
        'admin',
        'password123'
      );
    });

    it('should throw error on login failure', async () => {
      mockRouterLogin.mockResolvedValueOnce({
        success: false,
        error: { message: 'Invalid credentials' },
      });

      await expect(login('admin', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when no session token returned', async () => {
      mockRouterLogin.mockResolvedValueOnce({
        success: true,
        data: { ubus_rpc_session: '' },
      });

      await expect(login('admin', 'password123')).rejects.toThrow(
        'Login failed: no session token returned'
      );
    });

    it('should throw error when session token is undefined', async () => {
      mockRouterLogin.mockResolvedValueOnce({
        success: true,
        data: {} as { ubus_rpc_session: string },
      });

      await expect(login('admin', 'password123')).rejects.toThrow(
        'Login failed: no session token returned'
      );
    });
  });

  describe('logout', () => {
    it('should be a no-op function', () => {
      expect(() => logout()).not.toThrow();
    });
  });
});
