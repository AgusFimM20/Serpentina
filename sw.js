// Guarda todos los archivos de la app para que funcione sin internet.
// Al publicar una versión nueva, cambiá VERSION para que los dispositivos la descarguen.
const VERSION = "serpentina-2026-10-30a";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "brython.min.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png",
    "fonts/fredoka-latin-500-normal.woff2",   "fonts/fredoka-latin-600-normal.woff2",   "fonts/fredoka-latin-700-normal.woff2",   "fonts/jetbrains-mono-latin-400-normal.woff2",   "fonts/jetbrains-mono-latin-600-normal.woff2",   "fonts/nunito-latin-500-normal.woff2",   "fonts/nunito-latin-600-normal.woff2",   "fonts/nunito-latin-700-normal.woff2",   "fonts/nunito-latin-800-normal.woff2", 
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match("index.html"))));
});
