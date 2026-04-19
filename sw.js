const CACHE = 'bombay-asteroids-v2.2.10';
const ASSETS = [
  '/bombay-asteroids/',
  '/bombay-asteroids/index.html',
  '/bombay-asteroids/script.js',
  '/bombay-asteroids/style.css',
  '/bombay-asteroids/manifest.json',
  '/bombay-asteroids/assets/graphics/spaceship_full.svg',
  '/bombay-asteroids/assets/graphics/asteroid1.svg',
  '/bombay-asteroids/assets/graphics/asteroid2.svg',
  '/bombay-asteroids/assets/graphics/green_projectile.svg',
  '/bombay-asteroids/assets/graphics/explosion.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for API calls, cache first for assets
  if (e.request.url.includes('run.app') || e.request.url.includes('leaflet') || e.request.url.includes('stadiamaps')) {
    return; // don't cache external APIs/tiles
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
