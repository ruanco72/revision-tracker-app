import { useEffect, useRef } from 'react';

// Small hook to request a screen wake lock while `active` is true.
// Gracefully no-ops if the Wake Lock API isn't available.
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const requestWakeLock = async () => {
      try {
        const nav = (navigator as any);
        if (!nav || !nav.wakeLock || typeof nav.wakeLock.request !== 'function') return;

        // Request a screen wake lock
        sentinelRef.current = await nav.wakeLock.request('screen');

        // re-request if released (some browsers may emit release)
        sentinelRef.current?.addEventListener?.('release', async () => {
          if (mounted && active) {
            try {
              sentinelRef.current = await nav.wakeLock.request('screen');
            } catch (e) {
              // ignore
            }
          }
        });
      } catch (e) {
        // ignore - wake lock not supported or denied
      }
    };

    const releaseWakeLock = async () => {
      try {
        await sentinelRef.current?.release?.();
      } catch (e) {
        // ignore
      }
      sentinelRef.current = null;
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active) {
        requestWakeLock();
      }
    };

    if (active) requestWakeLock();

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      void releaseWakeLock();
    };
    // active intentionally included to re-run when it toggles
  }, [active]);
}
