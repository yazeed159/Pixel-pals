/* Interface: settings dialog, stage buttons, character creator, journal, chat log, backup and restore. */
const dlg=$('#dlg');
const FIELDS=['place','time','weather','style','fur','pos','ts','spd','snd','amb','len','pet','me','season','carry','checkin','motion','lang','rlang','sun'];
let dr={cast:{},pals:{}},dp=cfg.place,memShown='*';
function applyUI(){$('#dbox').className=cfg.pos==='over'?'over':'';document.documentElement.style.setProperty('--ts',cfg.ts);$('#name').textContent=nm();$('#tb').textContent=TI[cfg.time]||'🕒';$('#pb').textContent=SCENES[cfg.place].icon;$('#kb').textContent=PI[cfg.pals[cfg.place]||''];$('#phb').textContent='📷';[['tb','Time'],['pb','Scene'],['kb','Colors'],['phb','Photo']].forEach(([i,l])=>$('#'+i).dataset.l=T(l));$('#app').classList.toggle('bub',cfg.style==='bubbles')}
let shown=cfg.provider;
function loadFields(){const p=$('#prov').value;$('#key').value=cfg.keys[p]||'';$('#model').value=cfg.models[p]||MODELS[p];$('#base').value=cfg.base;$('#baseWrap').hidden=p!=='custom'}
function stash(){const p=shown;cfg.keys[p]=$('#key').value.trim();cfg.models[p]=$('#model').value.trim()||MODELS[p];cfg.base=$('#base').value.trim()}
$('#prov').onchange=()=>{stash();shown=$('#prov').value;loadFields()};

/* who plays the scene: the scene's own character, one of yours, or a ready-made one */
function fillCast(place,cur){
  const sc=SCENES[place];
  $('#cast').innerHTML='<option value="">'+esc(sc.name)+' (scene default)</option>'
    +(cfg.chars.length?'<optgroup label="Your characters">'+cfg.chars.map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.species+')</option>').join('')+'</optgroup>':'')
    +'<optgroup label="Ready-made">'+PRESETS.map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.species+')</option>').join('')+'</optgroup>';
  $('#cast').value=charById(cur)?cur:'';
}
$('#place').onchange=()=>{dr.cast[dp]=$('#cast').value;dr.pals[dp]=$('#pal').value;dp=$('#place').value;fillCast(dp,dr.cast[dp]);$('#pal').value=dr.pals[dp]||''};

$('#gear').onclick=()=>{
  $('#prov').value=cfg.provider;shown=cfg.provider;loadFields();
  FIELDS.forEach(f=>$('#'+f).value=cfg[f]);$('#qrs').value=cfg.qr;
  dr={cast:{...cfg.cast},pals:{...cfg.pals}};dp=cfg.place;fillCast(dp,dr.cast[dp]);$('#pal').value=dr.pals[dp]||'';
  memShown=memKey();$('#memtxt').value=cfg.mem[memShown]||'';$('#memst').textContent='';
  $('#prompt').value=cfg.prompt;$('#about').value=cfg.about;dlg.showModal()};
$('#ok').onclick=()=>{
  const pp=cfg.place,ps=cfg.style;
  dr.cast[dp]=$('#cast').value;dr.pals[dp]=$('#pal').value;
  const mt=$('#memtxt').value.trim();if(mt)cfg.mem[memShown]=mt;else delete cfg.mem[memShown];
  stash();cfg.provider=$('#prov').value;FIELDS.forEach(f=>cfg[f]=$('#'+f).value.trim());cfg.qr=$('#qrs').value;
  const prevCast=cfg.cast[cfg.place]||'',clean=o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>v));
  cfg.cast=clean(dr.cast);cfg.pals=clean(dr.pals);
  cfg.prompt=$('#prompt').value.trim()||DEF.prompt;cfg.about=$('#about').value.trim();
  store();dlg.close();applyUI();draw();
  if(cfg.place!==pp)leaveScene(pp);
  if(cfg.place!==pp||cfg.style!==ps||(cfg.cast[cfg.place]||'')!==prevCast)greet();
  ambient()};
$('#clear').onclick=()=>{hh().length=0;store();you.style.display='none';dlg.close();greet()};
$('#wipe').onclick=()=>{if(confirm(T('Delete your API keys, settings, journal and all chats from this browser?'))){localStorage.clear();location.reload()}};

/* memory box in Setup */
function refreshMemBox(){if(dlg.open&&memShown===memKey())$('#memtxt').value=cfg.mem[memShown]||''}
$('#memnow').onclick=async()=>{
  const st=$('#memst');if(demo()){st.textContent='Needs an API key.';return}
  const mt=$('#memtxt').value.trim();if(mt)cfg.mem[memShown]=mt;
  st.textContent='Writing...';const ok=await summarize(cfg.place,0);
  st.textContent=ok?'Updated.':(unmemorized(cfg.place)?'Could not reach the AI.':'Nothing new to add.');refreshMemBox()};
$('#memclr').onclick=()=>{$('#memtxt').value='';$('#memst').textContent='Cleared. Press Save to keep that.'};

/* time of day / scene / color mood buttons on the stage */
const NT={auto:'dawn',dawn:'day',day:'sunset',sunset:'dusk',dusk:'night',night:'cycle',cycle:'auto'};
$('#tb').onclick=e=>{e.stopPropagation();cfg.time=NT[cfg.time]||'auto';store();applyUI();draw()};
$('#pb').onclick=e=>{e.stopPropagation();const old=cfg.place,k=Object.keys(SCENES);cfg.place=k[(k.indexOf(cfg.place)+1)%k.length];leaveScene(old);store();applyUI();draw();greet()};
$('#kb').onclick=e=>{e.stopPropagation();const o=['','warm','cold','muted'],n=o[(o.indexOf(cfg.pals[cfg.place]||'')+1)%o.length];if(n)cfg.pals[cfg.place]=n;else delete cfg.pals[cfg.place];store();applyUI();draw()};

/* ---- create your own characters ---- */
const chd=$('#chd'),cvx=$('#chv').getContext('2d');let chEdit=null,chT;
$('#chs').innerHTML=Object.keys(SPR).map(k=>'<option value="'+k+'">'+k[0].toUpperCase()+k.slice(1)+'</option>').join('');
const chCur=()=>({species:$('#chs').value,c1:$('#chc1').value,c2:$('#chc2').value});
function chPrev(){cvx.clearRect(0,0,64,64);paint(cvx,chCur(),0,0,4)}
['chs','chc1','chc2'].forEach(i=>$('#'+i).addEventListener('input',chPrev));
function chList(){
  const L=$('#chlist');L.textContent='';
  cfg.chars.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=c.name;b.onclick=()=>chOpen(c);L.append(b)});
  const n=document.createElement('button');n.type='button';n.textContent='+ New character';n.onclick=()=>chOpen(null);L.append(n);
}
function chOpen(c){chEdit=c;$('#chform').hidden=false;$('#chn').value=c?c.name:'';$('#chs').value=c?c.species:'cat';$('#chc1').value=c?c.c1:'#6a6478';$('#chc2').value=c?c.c2:'#e8d3a8';
  $('#chp').value=c?c.persona||'':'';$('#chg').value=c?c.greet||'':'';$('#chdel').hidden=!c;chPrev()}
$('#chman').onclick=()=>{$('#chform').hidden=true;chList();chd.showModal();clearInterval(chT);chT=setInterval(chPrev,300)};
chd.addEventListener('close',()=>clearInterval(chT));
$('#chx').onclick=()=>chd.close();
$('#chsave').onclick=()=>{
  const o={...chCur(),name:$('#chn').value.trim()||'Friend',persona:$('#chp').value.trim(),greet:$('#chg').value.trim()};
  if(chEdit)Object.assign(chEdit,o);else{o.id='c'+Date.now().toString(36);cfg.chars.push(o);chEdit=o}
  store();$('#chform').hidden=true;chList();fillCast(dp,chEdit.id);applyUI();draw()};
$('#chdel').onclick=()=>{
  if(!chEdit||!confirm('Delete '+chEdit.name+'?'))return;
  const id=chEdit.id;cfg.chars=cfg.chars.filter(c=>c.id!==id);
  for(const o of [cfg.cast,dr.cast])for(const k in o)if(o[k]===id)delete o[k];
  store();$('#chform').hidden=true;chList();fillCast(dp,dr.cast[dp]);applyUI();draw()};

/* ---- journal ---- */
const jrd=$('#jrd');
function jrRender(){
  const L=$('#jrl');L.textContent='';if(!J.length){L.textContent='Nothing yet.';return}
  J.forEach((e,i)=>{const d=document.createElement('div'),h=document.createElement('small'),sp=document.createElement('span'),del=document.createElement('button'),p=document.createElement('div');d.className='je';
    sp.textContent=e.d+(e.who?' · '+e.who:'');del.type='button';del.textContent='Delete';del.onclick=()=>{if(confirm(T('Delete this entry?'))){J.splice(i,1);store();jrRender()}};
    h.append(sp,del);p.textContent=e.text;if(e.q){const q=document.createElement('div');q.textContent=e.q;q.style.cssText='opacity:.7;font-style:italic;margin-bottom:4px';d.append(h,q,p)}else d.append(h,p);L.append(d)});
}
$('#jrb').onclick=()=>{jrRender();jrd.showModal()};
$('#jrx').onclick=()=>jrd.close();
$('#jradd').onclick=()=>{const t=$('#jrn').value.trim();if(!t)return;J.unshift({d:today(),t:Date.now(),text:t,who:'',place:cfg.place});$('#jrn').value='';store();jrRender()};
function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#jrexp').onclick=()=>download('pixel-journal.txt',new Blob([J.map(e=>e.d+(e.who?' ('+e.who+')':'')+'\n'+(e.q?e.q+'\n':'')+e.text).join('\n\n')||'Nothing yet.'],{type:'text/plain'}));

/* ---- chat log ---- */
const logd=$('#logd'),who=m=>m.role==='user'?(cfg.me||'You'):nm();
$('#logb').onclick=()=>{const L=$('#log');L.textContent='';hh().forEach(m=>{const p=document.createElement('p');p.className=m.role;p.textContent=who(m)+': '+m.content;L.append(p)});if(!hh().length)L.textContent='Nothing yet.';logd.showModal();L.scrollTop=L.scrollHeight};
$('#logx').onclick=()=>logd.close();
$('#exp').onclick=()=>download('pixel-chat-'+cfg.place+'.txt',new Blob([hh().map(m=>who(m)+': '+m.content).join('\n\n')],{type:'text/plain'}));

/* ---- backup and restore: one JSON file with every chat, setting, character, memory and journal entry ---- */
$('#bak').onclick=()=>{
  const keys=confirm('Include your API keys in the backup file?\n\nOK = include them (keep the file private)\nCancel = leave them out');
  const c=JSON.parse(JSON.stringify(cfg));if(!keys)c.keys={};
  download('pixel-pals-backup-'+today()+'.json',new Blob([JSON.stringify({app:'pixel-pals',v:1,at:new Date().toISOString(),cfg:c,chats:H,journal:J},null,1)],{type:'application/json'}));
};
$('#rst').onclick=()=>$('#rstf').click();
$('#rstf').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  try{
    const d=JSON.parse(await f.text());
    if(d.app!=='pixel-pals'||!d.cfg||typeof d.chats!=='object')throw new Error('This is not a Pixel Pals backup file.');
    if(!confirm('Replace everything in this browser (chats, settings, characters, memory, journal) with the backup from '+(d.at||'an unknown date').slice(0,10)+'?'))return;
    const c=d.cfg;if(!c.keys||!Object.keys(c.keys).some(k=>c.keys[k]))c.keys=cfg.keys;
    localStorage.pdCfg=JSON.stringify(c);localStorage.pdH=JSON.stringify(d.chats);localStorage.pdJ=JSON.stringify(d.journal||[]);
    location.reload();
  }catch(err){alert('Could not restore: '+err.message)}
};
