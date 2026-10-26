const CACHE='omega2-shell-v2.0.2',FILES=['./','./index.html','./app.js','./drive.js','./model.js','./session.js','./style.css','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('omega2-shell-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method==='GET'&&u.origin===self.location.origin)e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
