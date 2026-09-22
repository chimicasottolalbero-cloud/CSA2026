// Tiene in memoria l'app per usarla anche senza rete.
// Quando pubblichi una nuova versione dei file, cambia il numero qui sotto.
const VERSIONE = "csa-2";
const FILE = ["./", "index.html", "manifest.webmanifest", "icona-192.png", "icona-512.png", "icona-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSIONE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname === "docs.google.com") return;   // i dati del foglio li gestisce la pagina
  // prima la rete, così gli aggiornamenti arrivano subito; se manca, la copia salvata
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && (url.origin === location.origin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com"))){
      const copia = r.clone(); caches.open(VERSIONE).then(c => c.put(e.request, copia));
    }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
