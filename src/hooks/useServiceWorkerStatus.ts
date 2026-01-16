import { useEffect, useState } from "react";

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActive: boolean;
  message: string;
}

/**
 * Hook to monitor Service Worker status
 * Useful for debugging and understanding offline capabilities
 */
export const useServiceWorkerStatus = (): ServiceWorkerStatus => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isActive: false,
    message: "Initializing...",
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setStatus({
        isRegistered: false,
        isActive: false,
        message: "Service Workers not supported",
      });
      return;
    }

    const checkStatus = async () => {
      try {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        if (registrations.length === 0) {
          setStatus({
            isRegistered: false,
            isActive: false,
            message: "Service Worker not registered",
          });
          return;
        }

        const registration = registrations[0];

        if (registration.active) {
          setStatus({
            isRegistered: true,
            isActive: true,
            message: "Service Worker active - Offline support enabled",
          });
        } else if (registration.installing) {
          setStatus({
            isRegistered: true,
            isActive: false,
            message: "Service Worker installing...",
          });
        } else if (registration.waiting) {
          setStatus({
            isRegistered: true,
            isActive: false,
            message: "Service Worker waiting to activate",
          });
        }
      } catch (error) {
        console.error("[SW Status] Error checking Service Worker:", error);
        setStatus({
          isRegistered: false,
          isActive: false,
          message: "Error checking Service Worker",
        });
      }
    };

    checkStatus();

    // Listen for Service Worker updates
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.addEventListener("statechange", checkStatus);
      return () => {
        controller.removeEventListener("statechange", checkStatus);
      };
    }
  }, []);

  return status;
};
