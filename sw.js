// Guarda todos los archivos de la app para que funcione sin internet.
// Al publicar una versión nueva, cambiá VERSION para que los dispositivos la descarguen.
const VERSION = "serpentina-2026-10-30T1502";
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
  const url = new URL(e.request.url);
  if (url.pathname.endsWith("version.json")) return; // siempre desde internet
  // La página se pide primero a internet (así llegan las actualizaciones) y, sin conexión, sale de lo guardado.
  if (e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html")) {
    e.respondWith(Promise.race([
      fetch(url.href, { cache: "no-store" }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put("index.html", copy)); } return res; }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("lento")), 4000))
    ]).catch(() => caches.match("index.html").then(hit => hit || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match("index.html"))));
});
