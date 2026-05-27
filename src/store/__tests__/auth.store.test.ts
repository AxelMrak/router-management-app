import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('auth.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset module registry to get fresh store instance
    vi.resetModules();
  });

  it('should have initial state (not authenticated, no token)', async () => {
    const { useAuthStore } = await import('../auth.store');
    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set token and isAuthenticated on setToken', async () => {
    const { useAuthStore } = await import('../auth.store');

    act(() => {
      useAuthStore.getState().setToken('test-session-token');
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('test-session-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear token and set isAuthenticated to false on logout', async () => {
    const { useAuthStore } = await import('../auth.store');

    // First set a token
    act(() => {
      useAuthStore.getState().setToken('test-session-token');
    });

    expect(useAuthStore.getState().token).toBe('test-session-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Then logout
    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should persist state to localStorage', async () => {
    const { useAuthStore } = await import('../auth.store');

    act(() => {
      useAuthStore.getState().setToken('persisted-token');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'router-auth',
      expect.stringContaining('persisted-token')
    );
  });

  it('should restore state from localStorage', async () => {
    // Pre-populate localStorage
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'router-auth') {
        return JSON.stringify({
          state: { token: 'restored-token', isAuthenticated: true },
          version: 0,
        });
      }
      return null;
    });

    const { useAuthStore } = await import('../auth.store');
    const state = useAuthStore.getState();

    expect(state.token).toBe('restored-token');
    expect(state.isAuthenticated).toBe(true);
  });
});


