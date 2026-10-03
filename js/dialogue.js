/* Dialogue box: splits replies into chunks, types them out, tap to advance, typing sound. */
let txt=$('#txt'),pend=null;const arrow=$('#arrow'),you=$('#you'),msg=$('#msg'),chat=$('#chat');
let chunks=[],ci=0,typing=false,timer,full='',busy=false;
function split(t){
  t=t.trim(); const out=[]; let cur='';
  for(const s of t.split(/(?<=[.!?*])\s+/)){
    if(cur&&(cur+' '+s).length>150){out.push(cur);cur=s}else cur=cur?cur+' '+s:s;
  } if(cur)out.push(cur); return out.length?out:['...'];
}
function show(){
  full=chunks[ci]; let i=0; typing=talking=true; clearInterval(timer); arrow.style.visibility='hidden'; txt.textContent='';
  const sp=+cfg.spd; if(!sp){finish();return}
  timer=setInterval(()=>{txt.textContent=full.slice(0,++i);if(i%2===0)blip();if(i>=full.length)finish()},sp);
}
function finish(){
  clearInterval(timer); typing=talking=false; txt.textContent=full;
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
function bub(r,t){const d=document.createElement('div');d.className='b '+r;d.textContent=t;chat.append(d);return d}
function renderChat(){chat.textContent='';pend=null;if(cfg.style==='bubbles')hh().forEach(m=>bub(m.role==='user'?'user':'ai',m.content))}
new MutationObserver(()=>{chat.scrollTop=chat.scrollHeight}).observe(chat,{childList:true,subtree:true,characterData:true});
$('#play').addEventListener('click',()=>{
  if(typing) return finish();
  if(ci<chunks.length-1){ci++;show()} else msg.focus();
});
document.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#play').click()}});
$('#stage').addEventListener('click',e=>{
  if(typing||busy||e.target.tagName==='BUTTON')return;
  const r=$('#cv').getBoundingClientRect(),x=(e.clientX-r.left)/r.width*160,y=(e.clientY-r.top)/r.height*90;
  const h=(SCENES[cfg.place].hot||[]).find(h=>x>=h.r[0]&&x<=h.r[0]+h.r[2]&&y>=h.r[1]&&y<=h.r[1]+h.r[3]);
  if(!h)return; e.stopPropagation(); jolt=6; jx=h.r[0]+(h.r[2]>>1)-2; jy=h.r[1];
  say(h.say[Math.floor(Math.random()*h.say.length)]);
});
