import { useState, useEffect, useRef } from "react";

/**
 * Hook to detect online/offline status in real-time
 * Uses browser's native online/offline events + aggressive polling for mobile support
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return navigator.onLine;
  });
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Test actual connectivity by fetching a lightweight resource
    const testConnectivity = async () => {
      try {
        // Try multiple endpoints for better reliability
        const controllers = [
          fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            cache: "no-cache",
            mode: "no-cors",
            signal: AbortSignal.timeout(3000),
          }),
          fetch("https://cloudflare.com/cdn-cgi/trace", {
            method: "GET",
            cache: "no-cache",
            signal: AbortSignal.timeout(3000),
          }),
        ];

        try {
          await Promise.race(controllers);
          setIsOnline(true);
          console.log("[Network] Connected ✓");
        } catch {
          // If all endpoints fail, we're offline
          setIsOnline(false);
          console.log("[Network] Offline ✗");
        }
      } catch (error) {
        setIsOnline(false);
        console.log("[Network] Offline ✗");
      }
    };

    // Browser native events
    const handleOnline = () => {
      console.log("[Network] Online event fired");
      testConnectivity();
    };

    const handleOffline = () => {
      console.log("[Network] Offline event fired");
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Aggressive polling for mobile devices (check every 3 seconds)
    pollIntervalRef.current = setInterval(() => {
      testConnectivity();
    }, 3000);

    // Initial check
    testConnectivity();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  return isOnline;
};

/**
 * Hook to detect online/offline status with custom check interval
 * Use this for custom polling intervals
 */
export const useOnlineStatusWithCheck = (checkInterval: number = 3000): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const testConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          cache: "no-cache",
          mode: "no-cors",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      testConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Polling
    pollIntervalRef.current = setInterval(testConnectivity, checkInterval);
    testConnectivity();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [checkInterval]);

  return isOnline;
};
