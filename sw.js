const CACHE='omega2-shell-v2.1.0',FILES=['./','./index.html','./app.js','./drive.js','./model.js','./session.js','./style.css','./fonts.css','./font-1.ttf','./font-3.ttf','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  await Promise.all(FILES.map(async path=>{
   const key=new URL(path,self.location.href),fresh=new URL(key);
   fresh.searchParams.set('omegaVersion',CACHE);
   const response=await fetch(fresh,{cache:'reload'});
   if(!response.ok)throw Error('Niepełna aktualizacja PWA: '+path);
   await cache.put(key,response);
  }));
 }catch(error){await caches.delete(CACHE);throw error}
})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('omega2-shell-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method==='GET'&&u.origin===self.location.origin)e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
