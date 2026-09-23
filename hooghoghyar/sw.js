// sw.js — Service Worker — Offline-first for PWA (Cache-first for static, Network-first for data)
const CACHE = 'hooghoghyar-v6-booklet';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/reset.css',
  './css/variables.css',
  './css/layout.css',
  './css/core.css',
  './css/components.css',
  './css/responsive.css',
  './css/quiz.css',
  './css/booklet.css',
  './css/admin.css',
  './css/themes.css',
  './js/app.js',
  './js/state.js',
  './js/theme.js',
  './js/questions.js',
  './js/statistics.js',
  './js/storage.js',
  './js/ui.js',
  './js/router.js',
  './js/booklet.js',
  './js/courses.js',
  './js/bank.js',
  './js/quiz.js',
  './js/admin.js',
  './manifest.json',
  './js/idb.js',
  './js/sync.js',
  './js/achievements.js',
  './data/courses.json',
  './data/questions.json',
  './data/laws.json',
  './data/sources.json'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(c=> c.addAll(STATIC_ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=> k!==CACHE).map(k=> caches.delete(k)))).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Data: Network-first with cache fallback
  if(url.pathname.includes('/data/')){
    e.respondWith(
      fetch(e.request).then(res=>{
        const clone=res.clone();
        caches.open(CACHE).then(c=> c.put(e.request, clone));
        return res;
      }).catch(()=> caches.match(e.request))
    );
    return;
  }
  // Static: Cache-first
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        if(res.ok){
          const clone=res.clone();
          caches.open(CACHE).then(c=> c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
