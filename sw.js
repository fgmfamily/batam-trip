/* Service worker: lets the trip app open with no internet. */
const V='batam-trip-v11',ORIG='batam-trip-originals',CORE=["./", "index.html", "config.js", "shim.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "img/act-archery.jpg", "img/act-atv.jpg", "img/act-batik.jpg", "img/act-beach.jpg", "img/act-jetski.jpg", "img/act-massage.jpg", "img/bl-chicken.jpg", "img/bl-crab.jpg", "img/bl-fish.jpg", "img/bl-flowercrab.jpg", "img/bl-gonggong.jpg", "img/bl-hero.jpg", "img/bl-juice.jpg", "img/bl-lobster.jpg", "img/bl-others.jpg", "img/bl-prawn.jpg", "img/bl-rice.jpg", "img/bl-special.jpg", "img/bl-squid.jpg", "img/bl-veg.jpg", "img/bl-vegetarian.jpg", "img/cafe.jpg", "img/resort-aerial.jpg", "img/spa-candles.jpg", "view/1795415357384_image.jpg", "view/1795415411236_image.jpg", "view/1795415421662_image.jpg", "view/1795416349355_image.jpg", "view/1795416370352_image.jpg", "view/1795416522852_image.jpg", "view/1795424836649_image.jpg", "view/1795424847825_image.jpg"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==ORIG).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const fresh=/(\/|index\.html|config\.js|shim\.js|sw\.js)$/.test(u.pathname);
  if(fresh){e.respondWith(fetch(r).then(x=>{const k=x.clone();caches.open(V).then(c=>c.put(r,k));return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(ORIG).then(c=>c.put(r,k))}return x})));
});
