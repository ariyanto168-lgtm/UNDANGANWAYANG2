const CACHE_NAME = 'jawa-wayangan-v5.9.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logoundanganwayang.png'
];

// Event Install: Menyimpan aset penting ke dalam cache lokal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Membuka cache dan menyimpan aset...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Langsung aktif tanpa menunggu tab ditutup
});

// Event Activate: Membersihkan cache versi lama jika ada pembaruan
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Memaksa SW untuk segera mengontrol halaman
});

// Event Fetch: Mengembalikan aset dari cache (jika ada) saat tidak ada sinyal
self.addEventListener('fetch', event => {
  // Hanya memproses request bertipe GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Kembalikan dari cache jika ada, jika tidak lakukan fetch jaringan
      return cachedResponse || fetch(event.request).then(networkResponse => {
        return networkResponse;
      });
    }).catch(() => {
      // Jika internet offline dan halaman tidak ada di cache, arahkan ke halaman utama
      return caches.match('./index.html');
    })
  );
});
