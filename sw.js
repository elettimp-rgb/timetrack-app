// Service worker minimo: necessario per rendere l'app installabile (PWA)
// e per la cache offline di base. Le notifiche push vere sono gestite
// dallo script OneSignalSDKWorker.js (vedi README per come aggiungerlo).

const CACHE = 'timetrack-v1';
const FILE_DA_CACHARE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILE_DA_CACHARE); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (risp) { return risp || fetch(event.request); })
  );
});
