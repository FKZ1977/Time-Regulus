
const  CACHE_NAME  =  'time-regulus-v2-0-0' ; 

// プリキャッシュするアセットのリスト。
const  urlsToCache  =  [
  './' ,  //index.html（ルートURL）
  './index.html' 、
  './QRcorde.PNG' ,  // QRコード画像
  './register-sw.js'  // 登録スクリプト
  //あと、外部CSSやJSを使う場合はここに追加
] ;

// インストールイベント：Service Workerのインストールとプリキャッシュ
self.addEventListener ( 'install ' , (イベント) = > {   
  イベント.waitUntil (​
    キャッシュ. open ( CACHE_NAME )
      . then ( (キャッシュ)  =>  {
        console . log ( '[Service Worker] アセットを事前キャッシュしています:' ,  urlsToCache ) ;
         キャッシュを返します。addAll ( urlsToCache ) 。catch ( error = > {  
            console . error ( '[Service Worker] キャッシュに失敗しました:' ,  error ) ;
        } ) ;
      } ）
      。then ( ( )  =>  self .skipWaiting ( ) ) //インストール後すぐに有効化 
  ）;
} ) ;

// イベントをアクティブにする：古いキャッシュのクリア
self.addEventListener ( ' activate' , (イベント) = > {   
  イベント.waitUntil (​
    キャッシュ.キー( ) .then ( ( cacheNames ) = > {  
       Promise . allを返す(
        キャッシュ名。マップ( (キャッシュ名)  =>  {
          // 現在のキャッシュ名と異なるキャッシュを削除
          if  (キャッシュ名 !==  CACHE_NAME )  {
            console . log ( '[Service Worker] 古いキャッシュを削除しています:' ,  cacheName ) ;
             キャッシュを返します。delete ( cacheName ) ;
          }
        } ）
      ）;
    } ）
  ）;
  返却 自己。クライアント。請求（）;  // すぐにクライアントの制御を開始
} ) ;

// fetch イベント：キャッシュ戦略（Cache First）
self.addEventListener ( ' fetch ' , (イベント) = > {   
  // GETリクエストのみを対象とする
  if  (イベント.リクエスト.メソッド !==  'GET' )  return ;

  イベント.respondWith (​
    キャッシュ.一致(イベント.リクエスト)
      . then ( (レスポンス)  =>  {
        // キャッシュに応答があればそれを返す（キャッシュファースト）
        if  (応答)  {
           応答を返します。
        }

        // キャッシュになければネットワークから取得し、結果をキャッシュしてから返す
         フェッチを返す(イベント.リクエスト)
          . then ( (レスポンス)  =>  {
            if  ( !レスポンス || レスポンス.ステータス !==  200  || レスポンス.タイプ !==  'basic' )  {
               応答を返します。
            }

            const  responseToCache  =  response.clone ( ) ;​​
            キャッシュ. open ( CACHE_NAME )
              . then ( (キャッシュ)  =>  {
                キャッシュ.put (イベント.リクエスト、responseToCache ) ;​ 
              } ) ;

             応答を返します。
          } ) ;
      } ）
  ）;
} ) ;