// Service Worker 登録ロジック
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Service Worker ファイル (sw.js) をルートディレクトリから登録
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered: ', registration.scope);

        // 新しいバージョンが検知された場合の処理
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しい Service Worker がインストール完了（待機状態）
              console.log('New content is available! Please refresh the page.');
              
              // **【自動更新のヒント】**
              // ユーザーに「新しいバージョンがあります。更新しますか？」といった通知UIを表示し、
              // ユーザーが同意したら window.location.reload() を実行するのがベストプラクティスです。
            }
          });
        });

      })
      .catch(error => {
        console.log('Service Worker registration failed: ', error);
      });
  });
}