// キャッシュ名の定義。バージョンアップ時にこの名前を変更することで自動更新が走ります。
const CACHE_NAME = 'time-regulus-v2-0-0'; 

// プリキャッシュするアセットのリスト。
const urlsToCache = [
  './', // index.html（ルートURL）
  './index.html',
  './QRCorde.PNG', // QRコード画像
  './register-sw.js' // 登録スクリプト
  // 今後、外部CSSやJSを使う場合はここに追加
];

// install イベント：Service Workerのインストールとプリキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching assets:', urlsToCache);
        return cache.addAll(urlsToCache).catch(error => {
            console.error('[Service Worker] Caching failed:', error);
        });
      })
      .then(() => self.skipWaiting()) // インストール後すぐに有効化
  );
});

// activate イベント：古いキャッシュのクリア
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 現在のキャッシュ名と異なるキャッシュを削除
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // すぐにクライアントの制御を開始
});

// fetch イベント：キャッシュ戦略（Cache First）
self.addEventListener('fetch', (event) => {
  // GETリクエストのみを対象とする
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにレスポンスがあればそれを返す（Cache First）
        if (response) {
          return response;
        }

        // キャッシュになければネットワークから取得し、結果をキャッシュしてから返す
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});
