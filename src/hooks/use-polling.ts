import { useEffect, useRef, useState, useCallback } from 'react';

export interface UsePollingReturn {
  isPolling: boolean;
  pause: () => void;
  resume: () => void;
}

function usePolling(
  callback: () => Promise<void>,
  intervalMs: number,
  enabled: boolean = true
): UsePollingReturn {
  const [isPolling, setIsPolling] = useState(enabled);
  const callbackRef = useRef(callback);
  const enabledRef = useRef(enabled);

  // Keep callback ref up to date after every render to avoid stale closures
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Sync ref and state when the `enabled` prop changes
  useEffect(() => {
    enabledRef.current = enabled;
    setIsPolling(enabled);
  }, [enabled]);

  // Set up or tear down the polling interval
  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      if (!enabledRef.current) return;
      try {
        await callbackRef.current();
      } catch (err) {
        console.error('usePolling: callback failed', err);
      }
    };

    tick();

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  const pause = useCallback(() => {
    enabledRef.current = false;
    setIsPolling(false);
  }, []);

  const resume = useCallback(() => {
    enabledRef.current = true;
    setIsPolling(true);
  }, []);

  return { isPolling, pause, resume };
}

export default usePolling;
