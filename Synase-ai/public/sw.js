// @ts-check
/**
 * SYNASE AI — Progressive Web App Service Worker
 * Safe shell caching, offline fallback, network-first API handling.
 * 
 * Safety invariants:
 * - Sensitive user credentials, auth tokens, or private API responses are NEVER cached.
 * - Mutating API operations (POST, PUT, DELETE, PATCH) bypass cache and fail safely if offline.
 * - Static shell assets (HTML, CSS, JS, SVG) use cache-first with stale-while-revalidate update flow.
 */

const CACHE_NAME = "synase-ai-shell-v13";

const STATIC_PRECACHE = [
  "./",
  "./index.html",
  "./landing.html",
  "./app.html",
  "./manifest.webmanifest",
  "./src/assets/favicon.svg",
  "./src/assets/logo-mark.svg",
  "./src/assets/logo-full.svg",
  "./src/assets/lucide.min.js",
  "./src/styles/app.css",
  "./src/styles/landing/landing.css",
  "./src/styles/home/dashboard.css",
  "./src/styles/integrations/integrations.css",
  "./src/styles/work/work.css",
  "./src/styles/product/product.css",
  "./src/styles/settings/settings.css",
  "./src/app/main.js",
  "./src/app/router.js",
  "./src/app/shell.js",
  "./src/app/paths.js",
  "./src/app/auth.js",
  "./src/shared/api/index.js",
  "./src/shared/api/live.js",
  "./src/shared/api/errors.js",
  "./src/shared/api/mock.js",
  "./src/home/workspace/api/index.js",
  "./src/home/landing/landing.js",
  "./src/home/landing/gradientWaves.js",
  "./src/home/landing/logoLoop.js",
  "./src/home/landing/blobCursor.js",
  "./src/home/landing/contactForm.js",
  "./src/shared/components/ui.js",
  "./src/shared/components/icons.js",
  "./src/shared/state/store.js",
  "./src/shared/services/theme.js",
  "./src/shared/utils/format.js"
];

// Install: Cache static shell assets
self.addEventListener("install", (event) => {
  // @ts-ignore
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Precaching error:", err);
      })
  );
});

// Activate: Clean up legacy caches and take control
self.addEventListener("activate", (event) => {
  // @ts-ignore
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Ignore non-GET requests (mutations must go to live/mock transport directly)
  if (request.method !== "GET") {
    return;
  }

  // 2. Sensitive / API routes: Network only (never cache credentials, user tokens, or live APIs)
  if (
    url.pathname.startsWith("/api/auth/") ||
    url.pathname.startsWith("/api/v1/auth") ||
    url.pathname.startsWith("/api/v1/") ||
    url.pathname.startsWith("/user/")
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: {
              code: "OFFLINE",
              message: "Device is currently offline. Connect to network to complete this operation."
            }
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );
    return;
  }

  // 3. Navigation requests (HTML pages): Stale-while-revalidate with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Fallback to app shell or landing
            if (url.pathname.includes("landing")) {
              return caches.match("./landing.html");
            }
            return caches.match("./app.html");
          });
        })
    );
    return;
  }

  // 4. Static assets (CSS, JS, Fonts, SVGs): Network-first on localhost or when versioned, else stale-while-revalidate
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.searchParams.has("v")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an image/svg
          if (request.destination === "image") {
            return caches.match("./src/assets/logo-mark.svg");
          }
          return new Response("Resource unavailable offline", { status: 503 });
        });
    })
  );
});
