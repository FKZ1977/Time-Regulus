const CACHE_NAME = "time-regulus-v1.6.1"; // バージョンアップ時にはここを必ず変更してください
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.jpg",
  "./QRCorde.PNG"
];

// インストール時にキャッシュ
self.addEventListener("install", event => {
  self.skipWaiting(); // ★ 追加: 古い Service Worker を待たずにアクティベート
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 起動時に古いキャッシュを削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            // 現在のキャッシュ名と異なる古いキャッシュを削除
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // ★ 追加: 即座にすべてのクライアントに制御を要求
    })
  );
});

// リクエスト時にキャッシュ優先で応答
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // キャッシュが存在すれば、それを返す。なければネットワークから取得
      return response || fetch(event.request);
    })
  );
});