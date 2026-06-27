/* SBS — Service Worker (PWA leve: cache de shell para abrir offline) */
var CACHE="sbs-v1";
self.addEventListener("install",function(e){ self.skipWaiting(); });
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }));
  self.clients.claim();
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"){ return; }
  // network-first p/ dados de nuvem; cache-first p/ estáticos
  if(req.url.indexOf("supabase")>=0 || req.url.indexOf("/rest/")>=0){ return; }
  e.respondWith(
    fetch(req).then(function(res){
      try{ var c=res.clone(); caches.open(CACHE).then(function(ca){ ca.put(req,c); }); }catch(_){}
      return res;
    }).catch(function(){ return caches.match(req); })
  );
});
