/**
 * Service Worker for Fluxa
 * Enables offline functionality by caching assets and intercepting requests
 */

const CACHE_NAME = "fluxa-v1";
const RUNTIME_CACHE = "fluxa-runtime";
const OFFLINE_PAGE = "/";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching critical assets");
        return cache.addAll(ASSETS_TO_CACHE).catch(() => {
          console.warn("[SW] Some assets failed to cache");
        });
      })
      .then(() => {
        console.log("[SW] Service worker installed");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Installation failed:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (!url.origin.includes(location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.destination !== "") {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches
          .match(request)
          .then((response) => {
            if (response) {
              console.log("[SW] Serving from cache:", request.url);
              return response;
            }

            if (request.mode === "navigate") {
              console.log("[SW] Returning offline page");
              return caches.match(OFFLINE_PAGE);
            }

            console.log("[SW] No cache for:", request.url);
            return new Response("Offline - Resource not cached", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
      })
  );
});

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            console.log("[SW] Clearing cache:", name);
            return caches.delete(name);
          })
        );
      })
      .then(() => {
        console.log("[SW] All caches cleared");
        if (event.ports.length > 0) {
          event.ports[0].postMessage({ success: true });
        }
      });
  }
});
