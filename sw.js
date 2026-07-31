// Service worker: rende l'app installabile (PWA) e gestisce una cache
// minima SOLO come riserva per quando manca la connessione.
// Strategia: "rete prima" — va sempre a cercare la versione più recente
// online, e usa la cache solo se il telefono è offline. Così ogni volta
// che aggiorni index.html su GitHub, l'app lo vede subito, senza dover
// disinstallare/reinstallare nulla.

const CACHE = 'timetrack-v2'; // <-- cambia questo numero ogni volta che aggiorni i file, forza il refresh
const FILE_DA_CACHARE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILE_DA_CACHARE); })
  );
  self.skipWaiting(); // attiva subito la nuova versione, non aspetta che si chiudano le altre schede
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomi) {
      // cancella le cache vecchie con nome diverso da quello attuale
      return Promise.all(nomi.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function (rispRete) {
        // aggiorna la cache con la versione fresca appena scaricata
        const copia = rispRete.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copia); });
        return rispRete;
      })
      .catch(function () {
        // offline: usa la copia in cache, se esiste
        return caches.match(event.request);
      })
  );
});

