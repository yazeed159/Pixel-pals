/* Ambient sound, built with Web Audio (no audio files). Off by default; starts after your first tap. */
let AC2,NB,nodes=[],cr,gest=false;
const white=c=>{const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
const LAY={bed:[[250,'lowpass',.05]],therapy:[[180,'lowpass',.035]],camp:[[500,'lowpass',.035]],rooftop:[[450,'lowpass',.05,.1]],sea:[[300,'lowpass',.08,.15]],moon:[[150,'lowpass',.04],[2200,'bandpass',.006]],train:[[220,'lowpass',.09,3]],diner:[[200,'lowpass',.04],[3000,'bandpass',.004]],library:[[120,'lowpass',.025]],lighthouse:[[300,'lowpass',.08,.12],[900,'bandpass',.015,.3]],kitchen:[[160,'lowpass',.03]]};
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
