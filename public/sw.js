// FaceBase PWA Service Worker
// Cache versioning — bump CACHE_VERSION to bust all caches on deploy
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `facebase-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `facebase-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `facebase-images-${CACHE_VERSION}`;

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/auth/welcome/',
  '/auth/login/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install: pre-cache app shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: strategy-based caching ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and cross-origin API calls
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls: network-only (don't cache auth/data endpoints)
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('railway.app')) {
    return;
  }

  // Images: cache-first with 7-day expiry
  if (request.destination === 'image' ||
      url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 7 * 24 * 60 * 60));
    return;
  }

  // Fonts: cache-first (long-lived)
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 30 * 24 * 60 * 60));
    return;
  }

  // HTML navigation: network-first with offline fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // JS/CSS: stale-while-revalidate
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Everything else: network-first
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ── Caching strategies ────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName, maxAgeSec) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 408, statusText: 'Offline' });
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback page
    const fallback = await caches.match('/offline.html');
    return fallback || new Response(
      '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#666"><div style="text-align:center"><h2>You\'re offline</h2><p>Check your connection and try again</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      actions: data.actions || [],
    };
    event.waitUntil(self.registration.showNotification(data.title || 'FaceBase', options));
  } catch {
    // Invalid push payload
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab or open new one
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
