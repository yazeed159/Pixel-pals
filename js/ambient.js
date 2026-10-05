/* Ambient sound, built with Web Audio (no audio files). Off by default; starts after your first tap. */
let AC2,NB,nodes=[],cr,gest=false;
const white=c=>{const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
const LAY={rooftop:[[220,'lowpass',.04],[1800,'bandpass',.006]],bed:[[250,'lowpass',.05]],therapy:[[180,'lowpass',.035]],camp:[[500,'lowpass',.035]],train:[[220,'lowpass',.09,3]],diner:[[200,'lowpass',.04],[3000,'bandpass',.004]],library:[[120,'lowpass',.025]],lighthouse:[[300,'lowpass',.08,.12],[900,'bandpass',.015,.3]],kitchen:[[160,'lowpass',.03]]};
function layer(f,type,g,lfo){
  const s=AC2.createBufferSource(),fl=AC2.createBiquadFilter(),gn=AC2.createGain();
  s.buffer=NB;s.loop=true;fl.type=type;fl.frequency.value=f;gn.gain.value=g;
  s.connect(fl);fl.connect(gn);gn.connect(AC2.destination);s.start();nodes.push(s,gn);
  if(lfo){const o=AC2.createOscillator(),og=AC2.createGain();o.frequency.value=lfo;og.gain.value=g*.6;o.connect(og);og.connect(gn.gain);o.start();nodes.push(o)}
}
function pop(){
  const s=AC2.createBufferSource(),g=AC2.createGain(),f=AC2.createBiquadFilter(),t=AC2.currentTime;
  s.buffer=NB;f.type='highpass';f.frequency.value=1500+Math.random()*2000;
  g.gain.setValueAtTime(.04+Math.random()*.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);
  s.connect(f);f.connect(g);g.connect(AC2.destination);s.start(0,Math.random(),.05);
}
function clockTick(){
  const o=AC2.createOscillator(),g=AC2.createGain(),t=AC2.currentTime;
  o.type='sine';o.frequency.value=1400;g.gain.setValueAtTime(.03,t);g.gain.exponentialRampToValueAtTime(.001,t+.03);
  o.connect(g);g.connect(AC2.destination);o.start(t);o.stop(t+.04);
}
/* ---- gesture sounds: tiny one-shots that go with a scene's gestures (see gestures.js). Only when ambient sound is on. ---- */
const sfN=(d,g,ty,f,q=1,f2)=>{const t=AC2.currentTime,s=AC2.createBufferSource(),fl=AC2.createBiquadFilter(),gn=AC2.createGain();
  s.buffer=NB;fl.type=ty;fl.Q.value=q;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);
  gn.gain.setValueAtTime(.0005,t);gn.gain.linearRampToValueAtTime(g,t+Math.min(.04,d/3));gn.gain.exponentialRampToValueAtTime(.0005,t+d);
  s.connect(fl);fl.connect(gn);gn.connect(AC2.destination);s.start(t,Math.random()*.8,d+.05)};
const sfT=(f,d,g,ty='sine',f2)=>{const t=AC2.currentTime,o=AC2.createOscillator(),gn=AC2.createGain();
  o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(gn);gn.connect(AC2.destination);o.start(t);o.stop(t+d+.03)};
const FX={
  sip(){sfN(.2,.05,'lowpass',500);sfT(210,.14,.05,'sine',120)},
  clink(){sfT(2400,.14,.035);sfT(3600,.09,.015)},
  page(){sfN(.28,.06,'bandpass',2200,.8,3600)},
  crunch(){sfN(.06,.09,'highpass',1500);setTimeout(()=>sfN(.05,.07,'highpass',1800),70)},
  whistle(){sfT(1500,1.3,.02,'sine',1750)},
  yawn(){sfT(330,.8,.03,'sine',170);sfN(.7,.012,'lowpass',500)},
  thud(){sfT(120,.18,.09,'sine',55);sfN(.06,.03,'lowpass',700)},
  ding(){sfT(1760,1,.045);sfT(2640,.6,.015)},
  bell(){sfT(520,1.6,.05);sfT(1040,1.1,.02);sfT(1560,.8,.01)},
  buzz(){sfT(110,.28,.03,'sawtooth');sfN(.2,.015,'bandpass',3000)},
  whoosh(){sfN(.8,.07,'bandpass',400,.7,2400)},
  toot(){sfT(330,.35,.03,'sawtooth',320);sfT(247,.35,.025,'sawtooth')},
  tick(){sfT(1800,.03,.03,'square')},
  clack(){sfT(900,.04,.04,'square');sfN(.03,.04,'highpass',2000)},
  wipe(){sfN(.5,.03,'bandpass',1400,.6,800)},
  spin(){sfN(.9,.025,'bandpass',900,1,500)},
  shh(){sfN(.7,.05,'bandpass',4200,1.2)},
  pour(){sfN(1.1,.045,'bandpass',1900,.8,2600)},
  gull(){sfT(1800,.16,.02,'sine',2500);setTimeout(()=>{if(AC2.state==='running')sfT(2400,.14,.02,'sine',1500)},180)},
  chime(){sfT(1318,.9,.03);setTimeout(()=>{if(AC2.state==='running')sfT(1760,.7,.02)},120)},
  hum(){sfT(90,2.5,.012,'sawtooth',100)},
  sizzle(){sfN(.6,.02,'highpass',5000)},
  pop(){pop()},
  creak(){sfT(190,.45,.02,'sawtooth',150)},
  snore(){sfN(.9,.04,'lowpass',260,1,110)},
  flutter(){sfN(.07,.035,'bandpass',3500,.8)},
  giggle(){[0,110,220,330].forEach((d,i)=>setTimeout(()=>{if(AC2.state==='running')sfT(620+i*40,.09,.022,'triangle',760+i*40)},d))},
  humtune(){const sc=[392,440,494,587,659,784];for(let i=0;i<4;i++){const f=sc[Math.floor(Math.random()*sc.length)];setTimeout(()=>{if(AC2.state==='running')sfT(f,.42,.018,'sine',f*1.01)},i*450)}},
  purr(){const t=AC2.currentTime,s=AC2.createBufferSource(),f=AC2.createBiquadFilter(),g=AC2.createGain(),o=AC2.createOscillator(),og=AC2.createGain();
    s.buffer=NB;s.loop=true;f.type='lowpass';f.frequency.value=220;g.gain.setValueAtTime(.0005,t);g.gain.linearRampToValueAtTime(.045,t+.6);g.gain.setValueAtTime(.045,t+3.2);g.gain.linearRampToValueAtTime(.0005,t+4.3);
    o.frequency.value=24;og.gain.value=.03;o.connect(og);og.connect(g.gain);s.connect(f);f.connect(g);g.connect(AC2.destination);s.start(t);o.start(t);s.stop(t+4.4);o.stop(t+4.4)}
};
/* scene.gesture -> [frame, sound] pairs; a frame lasts one scene tick (pace ms) */
const SFXD={
  'kitchen.sip':[[3,'clink'],[6,'sip'],[12,'clink']],'kitchen.cookie':[[6,'crunch'],[8,'crunch']],'kitchen.kettle':[[0,'whistle']],'kitchen.yawn':[[3,'yawn']],
  'therapy.tea':[[3,'clink'],[6,'sip'],[12,'clink']],'therapy.tissue':[[3,'page']],'therapy.settle':[[1,'creak']],
  'camp.roast':[[4,'sizzle'],[6,'pop'],[12,'crunch']],'camp.log':[[8,'thud'],[9,'pop'],[10,'pop'],[11,'pop']],'camp.sky':[[1,'chime']],
  'train.sip':[[3,'clink'],[6,'sip'],[12,'clink']],'train.watch':[[3,'tick'],[5,'tick'],[7,'tick'],[10,'clack']],'train.tunnel':[[0,'toot'],[2,'toot'],[3,'whoosh']],
  'diner.wipe':[[1,'wipe'],[6,'wipe'],[11,'wipe']],'diner.neon':[[0,'buzz'],[2,'buzz'],[6,'buzz']],'diner.bell':[[2,'ding'],[5,'ding'],[8,'ding']],
  'library.spin':[[1,'spin']],'library.page':[[1,'page']],'library.glasses':[[2,'clack']],'library.shush':[[3,'shh']],
  'lighthouse.pour':[[2,'pour']],'lighthouse.gull':[[1,'gull'],[4,'gull']],'lighthouse.scope':[[1,'clack']],'lighthouse.bell':[[1,'bell'],[4,'bell'],[7,'bell']],
  'rooftop.tap':[[3,'clack']],'rooftop.star':[[1,'chime']],'rooftop.plane':[[2,'hum']],'rooftop.purr':[[1,'purr']],
  'bed.pat':[[2,'thud'],[4,'thud']],'bed.snore':[[1,'snore'],[7,'snore']],'bed.moth':[[2,'flutter'],[4,'flutter'],[6,'flutter'],[9,'flutter'],[12,'flutter'],[15,'flutter']]
};
function sfx(k){
  if(cfg.amb!=='1'||!gest||!AC2||!NB||AC2.state!=='running')return;
  (SFXD[k]||[]).forEach(([f,n])=>setTimeout(()=>{try{if(AC2.state==='running')FX[n]()}catch(e){}},f*pace));
}
function sfxPlay(n){if(cfg.amb!=='1'||!gest||!AC2||!NB||AC2.state!=='running')return;try{FX[n]()}catch(e){}} /* one sound now (reactions.js) */
function ambient(){
  nodes.forEach(n=>{try{n.stop?n.stop():n.disconnect()}catch(e){}});nodes=[];clearInterval(cr);
  if(cfg.amb!=='1'||!gest)return;
  try{
    AC2=AC2||new AudioContext();if(AC2.state==='suspended')AC2.resume();NB=NB||white(AC2);
    (LAY[cfg.place]||[]).forEach(a=>layer(...a));
    if(cfg.weather==='rain')layer(3500,'highpass',.03);
    if(cfg.weather==='snow')layer(400,'lowpass',.04,.2);
    if(cfg.place==='camp')cr=setInterval(()=>{if(Math.random()<.6)pop()},220);
    if(cfg.place==='kitchen')cr=setInterval(clockTick,1000);
  }catch(e){}
}
document.addEventListener('pointerdown',()=>{if(!gest){gest=true;ambient()}else if(AC2&&AC2.state==='suspended')AC2.resume()});
