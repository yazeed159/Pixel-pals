/* First-run walkthrough: one short screen about scenes, the API key and where chats live.
   Shown once on a fresh install; people who already have chats or a key are not interrupted (it is marked as seen).
   It asks nothing: language (English) and motion (Normal, or Calm if the device asks for reduced motion) start on their defaults and
   can be changed in Setup. Setup > "Show the welcome screen again" reopens it. */
function welcome(force){
  const used=Object.values(H).some(l=>l&&l.length)||Object.values(cfg.keys||{}).some(Boolean);
  if(!force){if(cfg.seen)return;if(used){cfg.seen='1';store();return}}
  const d=$('#wlc');if(!d.open)d.showModal();
}
$('#wlc').addEventListener('close',()=>{if(!cfg.seen){cfg.seen='1';store()}}); /* Escape, Start and Open Setup all count as seen */
$('#wgo').onclick=()=>$('#wlc').close();
$('#wset').onclick=()=>{$('#wlc').close();$('#gear').click()};
$('#wagain').onclick=()=>{dlg.close();welcome(true)};
