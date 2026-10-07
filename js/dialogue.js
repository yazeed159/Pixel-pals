/* Dialogue box: splits replies into chunks, types them out, tap to advance, typing sound. */
let txt=$('#txt'),pend=null;const arrow=$('#arrow'),you=$('#you'),msg=$('#msg'),chat=$('#chat');
let chunks=[],ci=0,typing=false,timer,full='',busy=false;
function split(t){
  t=t.trim(); const out=[]; let cur='';
  for(const s of t.split(/(?<=[.!?؟…*])\s+/)){
    if(cur&&(cur+' '+s).length>260){out.push(cur);cur=s}else cur=cur?cur+' '+s:s;
  } if(cur)out.push(cur); return out.length?out:['...'];
}
/* The same pages as split(), but each page is cut to fit the dialogue box as it really is on this screen (with the suggested replies showing, as they will be at the end),
   so the text never needs scrolling: you press ▼ for the next page instead. Falls back to split() if the box can't be measured. */
function fitSplit(t){
  const box=$('#box'),tx=$('#txt'),q=$('#qr');t=t.trim();
  if(!box||!tx||!box.clientHeight)return split(t);
  const keep=tx.textContent,had=q.childNodes.length,chips=!had&&cfg.qr==='1'&&qr.length;
  const cap=()=>{tx.textContent='W '.repeat(700);return box.clientHeight}; /* on some layouts the box is only as tall as its text, so its room is measured by overfilling it */
  let H=cap();
  const fits=s=>{tx.textContent=s;return box.scrollHeight<=H+1};
  const paginate=text=>{ /* greedy: as many sentences per page as fit; a sentence too long for a page breaks at a word */
    const out=[];let cur='';
    const add=s=>{
      const j=cur?cur+' '+s:s;
      if(j.length<=260&&fits(j)){cur=j;return}
      if(cur){out.push(cur);cur=''}
      if(s.length<=260&&fits(s)){cur=s;return}
      for(const w of s.split(/\s+/)){const k=cur?cur+' '+w:w;if(fits(k)||!cur)cur=k;else{out.push(cur);cur=w}}
    };
    text.split(/(?<=[.!?؟…*])\s+/).forEach(add);
    if(cur)out.push(cur);return out};
  let out=paginate(t);
  if(chips){ /* the suggested replies appear under the LAST page and take room from the box, so only that page is cut for the smaller box */
    drawQR();H=cap();
    const last=out.pop();out=out.concat(paginate(last));q.textContent=''}
  tx.textContent=keep;
  return out.length?out:['...'];
}
let liveChunks=[],liveText='',view=-1; /* view: -1 = the answer as it arrived, otherwise an index into the earlier answers */
function show(instant){
  full=chunks[ci]; let i=0; if(txt.id==='txt')$('#box').dir=dirOf(full); typing=talking=true; Face.begin(full); clearInterval(timer); arrow.style.visibility='hidden'; txt.textContent='';
  const sp=+cfg.spd; if(!sp||instant===true){finish();return}
  timer=setInterval(()=>{Face.feed(full[i],i);txt.textContent=full.slice(0,++i);if(i%2===0)blip();if(i>=full.length)finish()},sp);
}
function finish(){
  clearInterval(timer); typing=talking=false; Face.end(full); txt.textContent=full;
  arrow.style.visibility=ci<chunks.length-1?'visible':'hidden';
  if(ci>=chunks.length-1)showQR();
}
/* quick replies: two or three tappable suggestions under the text box */
let qr=[];
function drawQR(){const q=$('#qr');q.textContent='';
  qr.forEach(t=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.title=t;b.onclick=()=>send(t);q.append(b)})}
function showQR(){if(cfg.qr!=='1'||!qr.length||busy||view!==-1){$('#qr').textContent='';return}drawQR()}
function clearQR(){qr=[];$('#qr').textContent=''}
let ac;function blip(){if(cfg.snd!=='1')return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=380+Math.random()*80;g.gain.value=.025;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.03)}catch(e){}}
function say(t){you.style.display='none';
  if(cfg.style==='bubbles'){chunks=[t.trim()||'...'];txt=pend||bub('ai','');pend=null}else{txt=$('#txt');chunks=fitSplit(t)}
  liveChunks=chunks;liveText=t;view=-1;ci=0;show()}
function bub(r,t){const d=document.createElement('div');d.className='b '+r;d.dir='auto';d.textContent=t;chat.append(d);return d}
function renderChat(){chat.textContent='';pend=null;if(cfg.style==='bubbles')hh().forEach(m=>bub(m.role==='user'?'user':'ai',m.content))}
new MutationObserver(()=>{chat.scrollTop=chat.scrollHeight}).observe(chat,{childList:true,subtree:true,characterData:true});
/* Back: one page back through the answer, then on through earlier answers. It only re-reads; nothing is re-sent or changed. */
const answers=()=>hh().filter(m=>m.role==='assistant');
function stepAnswer(d){
  const r=answers(),liveLast=r.length&&r[r.length-1].content===liveText,top=liveLast?r.length-2:r.length-1; /* newest earlier answer */
  let v;
  if(view===-1){if(d>0||top<0)return;v=top}
  else{v=view+d;if(v>top)v=-1;else if(v<0)return}
  view=v;
  chunks=v===-1?liveChunks:fitSplit(r[v].content);
  ci=d<0?chunks.length-1:0; /* going back lands on the last page of that answer */
  show(true);
}
$('#bkb').onclick=e=>{
  e.stopPropagation();
  if(cfg.style==='bubbles'||busy||thinking)return;
  if(ci>0){ci--;show(true)}else stepAnswer(-1);
};
const COARSE=matchMedia('(pointer:coarse)');
$('#play').addEventListener('click',()=>{
  if(typing) return finish();
  if(ci<chunks.length-1){ci++;show(view!==-1)} else if(view!==-1)stepAnswer(1); else if(!COARSE.matches)msg.focus(); /* on a phone, tapping the picture must not pop the keyboard open */
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
  /* the jolt is the reaction: tapping a prop or the character never replaces the text on screen */
});
