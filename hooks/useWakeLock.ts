
import { useEffect, useRef } from 'react';

export const useWakeLock = (shouldLock: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Function to request the wake lock
    const requestLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    };

    // Function to release the wake lock
    const releaseLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.warn('Wake Lock release failed:', err);
        }
      }
    };

    if (shouldLock) {
      requestLock();
    } else {
      releaseLock();
    }

    // Cleanup on unmount or when dependency changes
    return () => {
      releaseLock();
    };
  }, [shouldLock]);

  // Re-acquire lock if visibility changes (e.g. switching back to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldLock && !wakeLockRef.current) {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch (err) {
           console.warn('Re-acquiring Wake Lock failed:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [shouldLock]);
};
