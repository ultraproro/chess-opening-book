const CACHE = 'chess-openings-v1.397';

// On install: cache the app shell
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.add('/chess-opening-book/index.html');
    }).then(function(){ return self.skipWaiting(); })
  );
});

// On activate: delete old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// On fetch: external API calls go straight to network (and fail gracefully offline)
// Everything else: try network first, fall back to cache
self.addEventListener('fetch', function(e){
  const url = e.request.url;

  // Let API calls go direct — don't try to cache or intercept these
  if(url.includes('lichess.org') || url.includes('lichess.ovh') ||
     url.includes('github.com') || url.includes('githubusercontent.com') ||
     url.includes('api.')){
    return; // browser handles it normally
  }

  // App shell: cache-first, fall back to network
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(resp){
        if(resp && resp.status === 200){
          const clone = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return resp;
      });
    })
  );
});
