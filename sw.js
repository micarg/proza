// Proza offline cache. The app page and its scripts always come fresh from the network when online
// (bypassing the browser cache), and from this cache when offline.
const CACHE='proza-v29';
const CORE=['./','index.html','manifest.webmanifest','fonts.js','dict.js','icon-180.png','icon-192.png','icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:'no-store'}).then(r=>c.put(u,r)).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url);const same=url.origin===self.location.origin;
  if(r.mode==='navigate'||(same&&/\/(index\.html)?$/.test(url.pathname))){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return res;}).catch(()=>caches.match('index.html').then(h=>h||caches.match('./'))));return;}
  if(same){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r)));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})));
});
