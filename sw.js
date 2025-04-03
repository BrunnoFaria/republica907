const DEBUG = true;

function log(...args) {
  if (DEBUG) console.log('[SW]', ...args);
}

const CACHE_NAME = 'rep907-v5';
const OFFLINE_PAGE = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  '/fotos.html',
  '/css/style.css',
  '/js/main.js',
  '/icons/icon-192.webp',
  '/icons/icon-512.webp',
  '/assets/fonts/poppins-regular-webfont.woff2',
  '/assets/fotos/imagem-background/hero-background.webp',
  '/assets/fotos/video-thumbnails/thumbnail_video1.webp',
  '/assets/fotos/video-thumbnails/thumbnail_video2.webp',
];

// Evento de Instalação (Corrigido)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  ); // Fechamento correto
});

// Evento de Fetch (Corrigido)
self.addEventListener('fetch', (e) => {
  // Pula requisições não-GET e de terceiros
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return e.respondWith(fetch(e.request));
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Tentativa de rede primeiro
      return fetch(e.request)
        .then(networkResponse => {
          // Atualiza cache
          caches.open(CACHE_NAME)
            .then(cache => cache.put(e.request, networkResponse));
          return networkResponse.clone();
        })
        .catch(() => cached || caches.match(OFFLINE_PAGE));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Removendo cache antigo:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});