// 古い Service Worker の登録解除およびキャッシュクリア処理
// （案内ページとして Safari の通常ブラウザ枠で確実に開かせるための処理）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('[Service Worker] 古い Service Worker を解除しました:', boolean);
      });
    }
  });
}

if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name).then(function(boolean) {
        console.log('[Cache] 古いキャッシュを削除しました:', name, boolean);
      });
    }
  });
}
