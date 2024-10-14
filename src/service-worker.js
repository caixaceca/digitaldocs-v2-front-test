import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { ExpirationPlugin } from 'workbox-expiration';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';

clientsClaim();

const CACHE_NAME = 'digitaldocs-teste-cache-v2';
const URLS_TO_CACHE = ['/index.html?v=2', '/styles.css?v=2', '/script.js?v=2'];

precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/.*/] });

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate' || url.pathname.startsWith('/_') || url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(`${self.location.origin}/index.html`)
);

// Cache para imagens com Cache First
registerRoute(
  ({ url }) => url.origin.endsWith('.caixa.cv') && url.pathname.match(/\.(png|jpg|jpeg|webp)$/),
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 550, maxAgeSeconds: 60 * 24 * 60 * 60 })],
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Instalação do Service Worker e cache dos arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Interceptação das requisições e aplicação de Cache First com fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match('/offline.html')); // Fallback se estiver offline
    })
  );
});
