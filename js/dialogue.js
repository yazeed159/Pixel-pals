/* Dialogue box: splits replies into chunks, types them out, tap to advance, typing sound. */
let txt=$('#txt'),pend=null;const arrow=$('#arrow'),you=$('#you'),msg=$('#msg'),chat=$('#chat');
let chunks=[],ci=0,typing=false,timer,full='',busy=false;
function split(t){
  t=t.trim(); const out=[]; let cur='';
  for(const s of t.split(/(?<=[.!?؟…*])\s+/)){
    if(cur&&(cur+' '+s).length>260){out.push(cur);cur=s}else cur=cur?cur+' '+s:s;
  } if(cur)out.push(cur); return out.length?out:['...'];
}
function show(){
  full=chunks[ci]; let i=0; if(txt.id==='txt')$('#box').dir=dirOf(full); typing=talking=true; Face.begin(full); clearInterval(timer); arrow.style.visibility='hidden'; txt.textContent='';
  const sp=+cfg.spd; if(!sp){finish();return}
  timer=setInterval(()=>{Face.feed(full[i],i);txt.textContent=full.slice(0,++i);if(i%2===0)blip();if(i>=full.length)finish()},sp);
}
function finish(){
  clearInterval(timer); typing=talking=false; Face.end(full); txt.textContent=full;
  arrow.style.visibility=ci<chunks.length-1?'visible':'hidden';
  if(ci>=chunks.length-1)showQR();
}
/* quick replies: two or three tappable suggestions under the text box */
let qr=[];
function showQR(){const q=$('#qr');q.textContent='';if(cfg.qr!=='1'||!qr.length||busy)return;
  qr.forEach(t=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>send(t);q.append(b)})}
function clearQR(){qr=[];$('#qr').textContent=''}
let ac;function blip(){if(cfg.snd!=='1')return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=380+Math.random()*80;g.gain.value=.025;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.03)}catch(e){}}
function say(t){you.style.display='none';
  if(cfg.style==='bubbles'){chunks=[t.trim()||'...'];txt=pend||bub('ai','');pend=null}else{txt=$('#txt');chunks=split(t)}
  ci=0;show()}
function bub(r,t){const d=document.createElement('div');d.className='b '+r;d.dir='auto';d.textContent=t;chat.append(d);return d}
function renderChat(){chat.textContent='';pend=null;if(cfg.style==='bubbles')hh().forEach(m=>bub(m.role==='user'?'user':'ai',m.content))}
new MutationObserver(()=>{chat.scrollTop=chat.scrollHeight}).observe(chat,{childList:true,subtree:true,characterData:true});
const COARSE=matchMedia('(pointer:coarse)');
$('#play').addEventListener('click',()=>{
  if(typing) return finish();
  if(ci<chunks.length-1){ci++;show()} else if(!COARSE.matches)msg.focus(); /* on a phone, tapping the picture must not pop the keyboard open */
});
document.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#play').click()}});
$('#stage').addEventListener('click',e=>{
  if(typing||busy||e.target.tagName==='BUTTON')return;
  const r=$('#cv').getBoundingClientRect(),x=(e.clientX-r.left)/r.width*160,y=(e.clientY-r.top)/r.height*90;
  /* fingers are fat and the picture is only 160 px wide: on touch screens each prop gets about 14 screen px of slack, and the nearest one wins */
  const pad=COARSE.matches?14*160/r.width:0;
  let h=null,hd=1e9;
  (SCENES[cfg.place].hot||[]).forEach(t=>{const dx=Math.max(t.r[0]-x,0,x-(t.r[0]+t.r[2])),dy=Math.max(t.r[1]-y,0,y-(t.r[1]+t.r[3])),d=Math.hypot(dx,dy);
    if(d<=pad&&d<hd){h=t;hd=d}});
  if(!h)return; e.stopPropagation(); jolt=still()?0:6; jx=h.r[0]+(h.r[2]>>1)-2; jy=h.r[1];
  say(h.say[Math.floor(Math.random()*h.say.length)]);
});
