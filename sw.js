const CACHE = 'chess-openings-v1.385';
const APP_FILES = [
  '/chess-opening-book/index.html',
  '/chess-opening-book/manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(APP_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Network first for API calls, cache first for app shell
  const url = e.request.url;
  if(url.includes('lichess.org') || url.includes('lichess.ovh') || url.includes('github.com') || url.includes('githubusercontent.com')){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(resp){
      const clone = resp.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      return resp;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
