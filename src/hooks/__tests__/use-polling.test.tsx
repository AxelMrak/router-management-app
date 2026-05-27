import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePolling from '../use-polling';

describe('use-polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should call callback on mount when enabled', () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling(callback, 1000, true));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback on mount when disabled', () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling(callback, 1000, false));

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call callback at interval', () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling(callback, 1000, true));

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should cleanup interval on unmount', () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() => usePolling(callback, 1000, true));

    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should still be 1 since interval was cleared on unmount
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pause polling', () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => usePolling(callback, 1000, true));

    expect(result.current.isPolling).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPolling).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Callback should not be called while paused
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should resume polling after pause', () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => usePolling(callback, 1000, true));

    act(() => {
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isPolling).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should handle callback errors gracefully', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('Test error'));

    renderHook(() => usePolling(callback, 1000, true));

    // Advance timers to let the async callback execute
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('should sync with enabled prop changes', () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ enabled }) => usePolling(callback, 1000, enabled),
      { initialProps: { enabled: true } }
    );

    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
