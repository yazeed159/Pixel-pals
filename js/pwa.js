/* Install as an app. Registers the offline cache and powers the "Install app" button in Setup.
   Android/desktop Chrome and Edge show a real install prompt; iPhone/iPad have no prompt, so we show how to do it by hand. */
(function(){
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))
    addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  const row=$('#instrow'),btn=$('#inst'),hint=$('#insthint');
  if(!row)return;
  const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let deferred=null;
  function show(){
    if(standalone()){row.hidden=true;return}
    row.hidden=false;
    if(deferred){btn.hidden=false;hint.textContent='Adds Pixel Pals to your home screen. It opens full screen and works offline.'}
    else if(ios){btn.hidden=true;hint.textContent='On iPhone or iPad: tap the Share button in Safari, then Add to Home Screen.'}
    else{btn.hidden=true;hint.textContent='In your browser menu, choose Install app or Add to Home screen.'}
  }
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show()});
  addEventListener('appinstalled',()=>{deferred=null;show()});
  btn.onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice.catch(()=>{});deferred=null;show()};
  $('#gear').addEventListener('click',show);
  show();
})();
