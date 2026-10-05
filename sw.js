/* Offline cache. Core files are saved on install so the app opens with no network; after that it is
   network first (always the newest copy when online) and falls back to the saved one. Never touches API calls
   (they are cross-origin) or non-GET requests. Bump C whenever you add or rename a file in SHELL. */
const C='pp-v33';
const SHELL=['./','index.html','manifest.json','css/style.css','icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','apple-touch-icon.png',
'js/config.js','js/art/core.js','js/art/face.js','js/art/dog.js','js/art/chars.js',
'js/scenes/bed.js','js/scenes/therapy.js','js/scenes/camp.js','js/scenes/train.js','js/scenes/diner.js','js/scenes/library.js','js/scenes/lighthouse.js','js/scenes/kitchen.js','js/scenes/rooftop.js',
'js/dialogue.js','js/chat.js','js/diag.js','js/ui.js','js/ambient.js','js/behavior.js','js/together.js','js/company.js','js/closing.js','js/handoff.js','js/look.js','js/sun.js','js/backgrounds.js','js/sceneeditor.js','js/life.js','js/scenepicker.js','js/pace.js','js/i18n-data.js','js/i18n.js','js/welcome.js','js/main.js','js/pwa.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))))});
