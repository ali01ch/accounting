const CACHE_NAME = 'hesabyar-v19';
const CORE_ASSETS = [
  './index.html',
  './accounting.html',
  './manifest.json',
  './js/Dexie.js',
  './style/css/Vazirmatn-font-face.css',
  './style/fonts/webfonts/Vazirmatn-Regular.woff2',
  './style/fonts/webfonts/Vazirmatn-Medium.woff2',
  './style/fonts/webfonts/Vazirmatn-SemiBold.woff2',
  './style/fonts/webfonts/Vazirmatn-Bold.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/pwa-192.png',
  './icons/pwa-512.png',
  './icons/pwa-192-maskable.png',
  './icons/pwa-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/app-icon.png'
];

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    CORE_ASSETS.map(async (url) => {
      try {
        await cache.add(url);
      } catch (err) {
        console.warn('SW precache skip:', url, err);
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    const isHtml = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

    try {
      const res = await fetch(req);
      if (res && res.ok && req.url.startsWith(self.location.origin)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      if (cached) return cached;
      if (isHtml) {
        return (await caches.match('./accounting.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
