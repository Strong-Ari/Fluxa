import { useOnlineStatusContext } from "../contexts/OnlineStatusContext";
import { useCallback, useState } from "react";

/**
 * Hook for managing API requests with offline fallback
 * Automatically queues requests when offline and retries when online
 */
export const useOfflineAwareFetch = () => {
  const { isOnline } = useOnlineStatusContext();
  const [queuedRequests, setQueuedRequests] = useState<Array<{
    url: string;
    options: RequestInit;
    callback: (response: Response) => void;
    errorCallback: (error: Error) => void;
  }>>([]);

  const fetch = useCallback(
    async (
      url: string,
      options: RequestInit = {},
      onSuccess?: (response: Response) => void,
      onError?: (error: Error) => void
    ) => {
      try {
        if (!isOnline) {
          console.log(`[Network] Request queued (offline): ${url}`);
          // Queue the request for later
          setQueuedRequests((prev) => [
            ...prev,
            {
              url,
              options,
              callback: onSuccess || (() => {}),
              errorCallback: onError || (() => {}),
            },
          ]);
          return null;
        }

        const response = await globalThis.fetch(url, options);
        onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.log(`[Network] Request failed: ${url}`, err);
        onError?.(err);
        throw err;
      }
    },
    [isOnline]
  );

  // Process queued requests when coming back online
  const processQueue = useCallback(async () => {
    if (!isOnline || queuedRequests.length === 0) return;

    console.log(`[Network] Processing ${queuedRequests.length} queued requests`);

    for (const request of queuedRequests) {
      try {
        const response = await globalThis.fetch(request.url, request.options);
        request.callback(response);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        request.errorCallback(err);
      }
    }

    setQueuedRequests([]);
  }, [isOnline, queuedRequests]);

  // Process queue when online status changes
  if (isOnline && queuedRequests.length > 0) {
    processQueue();
  }

  return { fetch, queuedRequests };
};
