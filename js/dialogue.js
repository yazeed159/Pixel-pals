/* Dialogue box: splits replies into chunks, types them out, tap to advance, typing sound. */
const txt=$('#txt'),arrow=$('#arrow'),you=$('#you'),msg=$('#msg');
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
}
let ac;function blip(){if(cfg.snd!=='1')return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=380+Math.random()*80;g.gain.value=.025;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.03)}catch(e){}}
function say(t){you.style.display='none';chunks=split(t);ci=0;show()}
$('#play').addEventListener('click',()=>{
  if(typing) return finish();
  if(ci<chunks.length-1){ci++;show()} else msg.focus();
});
