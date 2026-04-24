const CACHE_NAME = "inventory-v2"; // 👈 change version every update

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // 🔥 force update
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 🔥 take control immediately
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});
