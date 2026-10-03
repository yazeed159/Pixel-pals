/* Optional Supabase sync: email + password sign-in, push chats, pull chats. Table and policies are in supabase.sql. */
let SB=null;try{SB=JSON.parse(localStorage.pdSB||'null')}catch(e){}
const sbStat=t=>{$('#sbs').textContent=t};
async function sb(path,opt={},useAuth=true){
  const h={apikey:cfg.sbKey,'content-type':'application/json',...(opt.headers||{})};
  if(useAuth&&SB)h.Authorization='Bearer '+SB.access_token;
  const r=await fetch(cfg.sbUrl.replace(/\/+$/,'')+path,{...opt,headers:h});
  const d=await r.json().catch(()=>null);
  if(!r.ok)throw new Error((d&&(d.msg||d.message||d.error_description||d.error))||'HTTP '+r.status);
  return d;
}
function setSB(d){SB={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||Math.floor(Date.now()/1000)+d.expires_in,email:d.user&&d.user.email||(SB&&SB.email),uid:(d.user&&d.user.id)||(SB&&SB.uid)};localStorage.pdSB=JSON.stringify(SB)}
async function fresh(){
  if(!SB||!cfg.sbUrl)return false;
  if(SB.expires_at*1000>Date.now()+60000)return true;
  try{setSB(await sb('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:SB.refresh_token})},false));return true}
  catch(e){SB=null;localStorage.removeItem('pdSB');return false}
}
async function login(kind){
  cfg.sbUrl=$('#sbUrl').value.trim();cfg.sbKey=$('#sbKey').value.trim();
  try{
    sbStat('Working...');
    const d=await sb(kind==='up'?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:$('#sbe').value.trim(),password:$('#sbp').value})},false);
    if(!d.access_token){sbStat('Account created. Confirm the email Supabase sent (if required), then press Sign in.');return}
    setSB(d);store();$('#sbp').value='';await pull();sbStat('Signed in as '+SB.email+'. Synced.');
  }catch(e){sbStat('Error: '+e.message)}
}
const dirty=new Set();let pt;
function syncPush(){dirty.add(conv().id);clearTimeout(pt);pt=setTimeout(flush,1500)}
async function flush(){
  if(!await fresh())return;
  const rows=[...dirty].map(id=>CV[id]).filter(c=>c&&c.msgs.length).map(c=>({id:c.id,user_id:SB.uid,title:c.title,scene:c.scene,messages:c.msgs,updated_at:new Date(c.updated).toISOString()}));
  dirty.clear();if(!rows.length)return;
  try{await sb('/rest/v1/conversations?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});sbStat('Synced '+new Date().toLocaleTimeString())}
  catch(e){rows.forEach(r=>dirty.add(r.id));sbStat('Sync error: '+e.message)}
}
async function syncDel(id){if(!await fresh())return;try{await sb('/rest/v1/conversations?id=eq.'+id,{method:'DELETE'})}catch(e){}}
async function pull(){
  if(!await fresh())return;
  const rows=await sb('/rest/v1/conversations?select=id,title,scene,messages,updated_at&order=updated_at.desc&limit=200'),seen=new Set();
  rows.forEach(r=>{seen.add(r.id);const t=Date.parse(r.updated_at),c=CV[r.id];
    if(!c||t>c.updated)CV[r.id]={id:r.id,title:r.title||'',scene:r.scene,msgs:r.messages||[],updated:t};
    else if(t<c.updated)dirty.add(r.id)});
  Object.values(CV).forEach(c=>{if(!seen.has(c.id)&&c.msgs.length)dirty.add(c.id)});
  store();flush();
}
$('#sbin').onclick=()=>login('in');$('#sbup').onclick=()=>login('up');
$('#sbout').onclick=()=>{SB=null;localStorage.removeItem('pdSB');sbStat('Signed out. Chats stay on this device.')};
sbStat(SB?'Signed in as '+SB.email:'Not signed in. Sync is optional.');
