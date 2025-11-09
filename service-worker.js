const CACHE_NAME = "time-regulus-v1.7.1"; // バージョンアップ時にはここを必ず変更してください
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

// service-worker.js (最終行に追加)

// ユーザーからのメッセージ（更新ボタンクリック）をリッスン
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});