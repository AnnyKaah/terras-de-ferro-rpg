const CACHE_NAME = 'terras-de-ferro-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/game.js',
  './js/ui/ui.js',
  './js/core/state.js',
  './js/core/dice.js',
  './js/data/scenes.js',
  './js/data/items.js',
  './js/multiplayer.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/images/avatar_lyra.png',
  './assets/images/avatar_daren.png'
];

// Instalação: Cacheia os arquivos estáticos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch: Serve do cache primeiro, depois rede
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});