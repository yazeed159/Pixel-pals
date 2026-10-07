/* Walk-out and walk-in: moving between scenes feels like going from one place to another.
   Leaving: the character says goodbye and does something that closes the place (waves, turns the lamp off, banks the fire,
   lowers the blinds, the neon flickers out, the lighthouse beam sweeps the night away). Then a short black beat with
   footsteps. Arriving: the new place wakes up around you (lamp clicks on, fire flares, the tunnel ends, the string lights
   come on one by one) and the character gives a little wave.
   - Normal motion plays all of it (about 3.5 seconds; tap the picture to skip it).
   - Calm motion is only a slow fade out and in, with no waving, flicker or footsteps.
   - Static scene switches instantly, as before.
   Everything is drawn over the finished scene (like the dither fades in gestures.js), so a scene needs no changes. A
   new or custom scene with no entry in TXS gets the plain fade and footsteps.
   Each TXS entry: out(p) and in(p) draw the effect for progress p = 0..1; col = pixels to sample for the sleeve and
   paw colors of the waving arm (so custom characters and night palettes just work); t0 = when the arm is first needed;
   snd = [progress, sound] pairs (only audible when ambient sound is on); self = the effect covers the whole picture itself.
   Loads after gestures.js and ambient.js. It wraps goScene(), draw() and gestStep(). */
const TX={on:0,ph:'',t0:0,from:'',to:'',d:null,iv:0,tm:[],calm:0,colK:'',col:null,hs:null,spO:null,spI:null,went:0};
const TXD={normal:{out:2300,gap:650,inn:1400},calm:{out:800,gap:250,inn:800}};
const FAREWELL={
  bed:'*a sleepy thump of the tail* Night, friend.',
  therapy:'We can pick this up next time. Take care of yourself.',
  camp:'*waves a stick* Mind the dark. I will keep the fire going.',
  train:'*flicks an ear* Go on, then. I will keep the seat warm.',
  diner:'*waves the coffee pot* Door is open any time, hon.',
  library:'*glances over his glasses* Quietly now. Off you go.',
  lighthouse:'*tugs his cap* Fair winds.',
  kitchen:'*waves a mug* Do not be a stranger.',
  rooftop:'*slow blink* Come back before the lights go out.'
};

/* ---- drawing helpers (all in 160x90 canvas pixels, straight onto the main canvas) ---- */
const cl=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
/* a darkness field drawn as a smooth dim plus an ordered dither in 2x2 cells: fn(x,y) is 0 (clear) .. 1 (dark) */
const LV=13,BASE=[...Array(LV)].map((_,q)=>'rgba(7,5,15,'+(q/(LV-1)*.72).toFixed(3)+')');
function dither(fn,a=.38){
  const by=[...Array(LV)].map(()=>[]),dk=[];
  for(let cy=0;cy<45;cy++)for(let cx=0;cx<80;cx++){
    const d=fn(cx*2+1,cy*2+1);if(d<=.01)continue;
    by[Math.round(cl(d)*(LV-1))].push(cx*2,cy*2);
    if(d>(BAY[(cy&3)*4+(cx&3)]+.5)/16)dk.push(cx*2,cy*2);
  }
  for(let q=1;q<LV;q++){const l=by[q];if(!l.length)continue;ctx.fillStyle=BASE[q];for(let i=0;i<l.length;i+=2)ctx.fillRect(l[i],l[i+1],2,2)}
  ctx.fillStyle='rgba(7,5,15,'+a+')';for(let i=0;i<dk.length;i+=2)ctx.fillRect(dk[i],dk[i+1],2,2);
}
/* the whole picture dims by D, except keep rectangles [x,y,w,h,howMuchStaysLit] and a lit pool {x,y,R,soft} */
function dim(D,keep,pool){
  if(D<=.01)return;
  dither((x,y)=>{
    let d=D;
    if(pool)d*=1-cl((pool.R-Math.hypot(x-pool.x,(y-pool.y)*1.25))/(pool.soft||40));
    if(keep)for(const k of keep)if(x>=k[0]&&x<k[0]+k[2]&&y>=k[1]&&y<k[1]+k[3])d*=1-k[4];
    return d;
  });
}
function cover(c){if(c<=0)return;if(c>=1){rpx(0,0,160,90,'#07050f');return}dither(()=>c);if(c>.8){ctx.fillStyle='rgba(7,5,15,'+((c-.8)/.2).toFixed(2)+')';ctx.fillRect(0,0,160,90)}}
function samp(p){const d=ctx.getImageData(p[0],p[1],1,1).data;return '#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')}
function limbR(x0,y0,x1,y1,w,c,w1=w){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++){const q=Math.round(w+(w1-w)*i/n);rpx(Math.round(x0+(x1-x0)*i/n)-(q>>1),Math.round(y0+(y1-y0)*i/n)-(q>>1),q,q,c)}}
/* the character waves: a raised arm swinging side to side, drawn with the shared hands (art/hands.js) in the character's own
   fur, skin or feathers. a = {s:[shoulder x,y], up:[how far the paw rises: dx,dy]}; t = 0..1 */
function wave(a,t){
  if(t<=0||t>=1||!TX.hs)return;
  const k=ease(cl(Math.min(t*5,(1-t)*5))),sw=Math.round(Math.sin(t*Math.PI*7)*3*k);
  const sx=a.s[0],sy=a.s[1],hx=Math.round(sx+a.up[0]*k)+sw,hy=Math.round(sy+a.up[1]*k);
  armHand(sx,sy,hx,hy,TX.hs,'open',{P:rpx});
}
/* your own arm reaching in from the bottom corner to the lamp (first-person bed scene): e = how far it has reached, 0..1 */
function reach(from,to,e){
  TX.hl=e>0?1:0; /* bed.js hides the resting left arm and hand while this one reaches: it is the same arm */
  if(e<=0||!TX.col)return;
  const hx=Math.round(from[0]+(to[0]-from[0])*e),hy=Math.round(from[1]+(to[1]-from[1])*e),o=shade(TX.col.sl,.5),sk=TX.col.pw;
  limbR(from[0],from[1],hx,hy,15,o,10);limbR(from[0],from[1],hx,hy,13,TX.col.sl,8);
  /* the hand: the same first-person hand as in the bed scene (art/hands.js) */
  povHand(rpx,hx-5,hy-9,0,{s:sk,h:mix(sk,'#ffffff',.2),d:shade(sk,.84),n:mix(sk,'#e08a8a',.4)});
}
/* paint a lamp's bulb dark (the scene still draws it lit) */
function bulbOff(r){const c=mix(samp([r[0]+(r[2]>>1),r[1]+(r[3]>>1)]),'#1a1428',.72);rpx(r[0],r[1],r[2],r[3],c)}

/* ---- the scenes ---- */
/* a lamp you switch off on the way out and on again on the way in (bed, library, kitchen) */
function lampSpec(o){
  const pc=o.reach?.36:.5,pi=.3;
  const ext=p=>p<pc+.02?ease(cl((p-.04)/(pc-.06))):1-ease(cl((p-pc-.04)/.14));
  const extIn=p=>p<pi+.04?ease(cl((p-.04)/(pi-.08))):1-ease(cl((p-pi-.04)/.14));
  return{col:o.col,t0:{out:o.reach?.02:.03,in:o.reach?.02:.58},
    snd:{out:[[pc,'click']],in:[[pi,'click']]},
    out(p){
      if(p>=pc)bulbOff(o.bulb);
      dim(.92*ease(cl((p-pc)/.2)),o.keep);
      if(o.reach)reach(o.from,o.lamp,ext(p));else wave(o.arm,(TX.rp-.03)/.3);
    },
    in(p){
      if(p<pi)bulbOff(o.bulb);
      const R=ease(cl((p-pi)/.55))*230;
      dim(.92,o.keep,{x:o.lamp[0],y:o.lamp[1],R,soft:55});
      if(o.reach)reach(o.from,o.lamp,extIn(p));else wave(o.arm,(p-.6)/.34);
    }};
}
const fire=[78,72];
const TXS={
  bed:lampSpec({reach:1,from:[-4,94],lamp:[21,31],bulb:[14,17,14,9],keep:[[110,9,36,22,.55]],col:{sl:[80,88],pw:[57,66]}}),
  library:lampSpec({arm:{s:[88,54],up:[10,-16]},lamp:[105,39],bulb:[98,34,15,9],keep:[[66,12,28,28,.5]],col:{sl:[106,41],pw:[86,36]}}),
  kitchen:lampSpec({arm:{s:[88,55],up:[8,-14]},lamp:[80,14],bulb:[74,10,14,5],keep:[[94,10,36,30,.55]],col:{sl:[84,60],pw:[76,44]}}),

  /* camp: the fox waves, banks the fire to embers and smoke; on arrival a log goes on and the fire flares */
  camp:{col:{sl:[73,52],pw:[71,60]},t0:{out:.03,in:.58},snd:{out:[[.4,'sizzle']],in:[[.3,'thud'],[.33,'pop'],[.37,'pop'],[.42,'pop']]},
    out(p){
      wave({s:[71,52],up:[-7,-17]},(TX.rp-.03)/.3);
      const f=ease(cl((p-.4)/.3));
      dim(.9*ease(cl((p-.45)/.3)),0,{x:fire[0],y:fire[1],R:70-45*ease(cl((p-.4)/.4)),soft:30});
      if(f>0){rpx(72,64,14,Math.round(f*12),'#3a2218');
        [[73,76],[78,77],[83,76],[76,75],[81,75]].forEach((e,i)=>rpx(e[0],e[1],2,1,(Math.floor(p*26)+i)%3?'#ff7a3a':'#ffb060'));
        if(f>.4)for(let i=0;i<4;i++){ctx.fillStyle='rgba(170,176,190,'+(.5-i*.1)+')';ctx.fillRect(76+i*2+Math.round(Math.sin(p*9+i*2)*2),66-Math.round((p-.5)*70)-i*5,2,2)}}
    },
    in(p){
      const h=Math.round(12*(1-ease(cl((p-.3)/.2))));
      rpx(72,64,14,h,'#3a2218');
      dim(.9*(1-ease(cl((p-.35)/.45))),0,{x:fire[0],y:fire[1],R:18+210*ease(cl((p-.3)/.55)),soft:40});
      if(p<.3)[[73,76],[78,77],[83,76],[76,75],[81,75]].forEach((e,i)=>rpx(e[0],e[1],2,1,(Math.floor(p*26)+i)%3?'#ff7a3a':'#ffb060'));
      const a=(p-.3)/.45;
      if(a>0&&a<1)flame(a);
      if(a>0&&a<1)for(let i=0;i<16;i++){const r=.5+(hs(i*17)%10)/10,x=78+((hs(i*31)%21)-10)*a*1.5,y=68-a*58*r;rpx(Math.round(x),Math.round(y),1,1,i%3?'#ffd27a':'#fff2c8')}
      wave({s:[71,52],up:[-7,-17]},(p-.6)/.34);
    }},

  /* therapy: a wave, then the blinds come down and the room goes quiet; on arrival they are raised */
  therapy:{col:{sl:[72,50],pw:[80,37]},t0:{out:.03,in:.52},snd:{out:[[.4,'creak']],in:[[.3,'creak']]},
    out(p){
      wave({s:[96,46],up:[8,-18]},(TX.rp-.03)/.3);
      blinds(Math.round(26*ease(cl((p-.36)/.34))));
      dim(.55*ease(cl((p-.5)/.3)));
    },
    in(p){
      blinds(Math.round(26*(1-ease(cl((p-.25)/.45)))));
      dim(.55*(1-ease(cl((p-.15)/.5))));
      wave({s:[96,46],up:[8,-18]},(p-.55)/.4);
    }},

  /* train: the carriage runs into a tunnel (lamps streak past the window); on arrival it comes out the other side */
  train:{col:{sl:[84,52],pw:[74,36]},t0:{out:.03,in:.52},snd:{out:[[.28,'toot'],[.4,'whoosh']],in:[[.08,'whoosh']]},
    out(p){
      wave({s:[97,44],up:[7,-14]},(TX.rp-.03)/.3);
      const q=ease(cl((p-.3)/.4));tunnel(22,22+Math.round(116*q),p);
      dim(.55*q);
    },
    in(p){
      const q=ease(cl((p-.15)/.55));tunnel(22+Math.round(116*q),138,-p);
      dim(.55*(1-q));
      wave({s:[97,44],up:[7,-14]},(p-.55)/.4);
    }},

  /* diner: a wave with the coffee pot, then the OPEN neon buzzes and flickers out; on arrival the door bell rings and it buzzes on */
  diner:{col:{sl:[70,48],pw:[84,33]},t0:{out:.03,in:.58},snd:{out:[[.34,'buzz']],in:[[0,'ding'],[.2,'buzz']]},
    out(p){
      wave({s:[91,44],up:[9,-14]},(TX.rp-.03)/.3);
      if(p>=.34&&(p>=.62||Math.floor(p*40)%3))sign(0);
      dim(.7*ease(cl((p-.5)/.3)));
    },
    in(p){
      if(p<.5&&(p<.2||Math.floor(p*40)%3))sign(0);
      dim(.7*(1-ease(cl((p-.2)/.4))));
      wave({s:[91,44],up:[9,-14]},(p-.6)/.34);
    }},

  /* lighthouse: a tug of the cap, then the beam sweeps across and the night follows it; on arrival it sweeps back and reveals the gallery */
  lighthouse:{self:1,col:{sl:[104,62],pw:[100,43]},t0:{out:.03,in:.6},snd:{out:[[.36,'whoosh']],in:[[.1,'whoosh']]},
    out(p){
      wave({s:[114,56],up:[8,-14]},(TX.rp-.03)/.3);
      const fx=-10+210*ease(cl((p-.34)/.56));
      dither((x)=>cl((fx-x)/24+.3));beam(fx);
    },
    in(p){
      const fx=-10+210*ease(cl((p-.1)/.6));
      dither((x)=>cl((x-fx)/24+.3));beam(fx);
      wave({s:[114,56],up:[8,-14]},(p-.64)/.34);
    }},

  /* kitchen and the rest are above; rooftop: the string lights go out one after another along the line, only the lantern stays; on arrival they come on in a twinkling chain */
  rooftop:{col:{sl:[90,56],pw:[70,56]},t0:{out:.03,in:.58},snd:{out:[[.4,'chime']],in:[[.4,'chime']]},
    out(p){
      wave({s:[95,50],up:[8,-16]},(TX.rp-.03)/.3);
      const fx=-20+200*ease(cl((p-.34)/.4));
      dither((x,y)=>(y<60?.88:.5)*cl((fx-x)/20+.3)*(1-cl((16-Math.hypot(x-138,y-72))/10)));
    },
    in(p){
      const fx=-20+200*ease(cl((p-.12)/.5));
      dither((x,y)=>(y<60?.88:.5)*cl((x-fx)/20+.3)*(1-cl((16-Math.hypot(x-138,y-72))/10)));
      if(p>.12&&p<.7)for(let i=0;i<6;i++){const s=Math.floor(p*30);rpx(Math.round(fx+(hs(i*13+s)%30)-8),28+hs(i*7+s)%22,1,1,'#ffe08a')}
      wave({s:[95,50],up:[8,-16]},(p-.6)/.34);
    }}
};
const TXG={col:null,t0:{out:9,in:9},snd:{out:[],in:[]},out(){},in(){}}; /* custom scenes: just the fade and the footsteps */

function flame(a){ /* a flare of flame: a tapering stack of rows, pale at the heart and orange at the tips */
  const h=Math.round(8+14*Math.sin(Math.PI*cl(a))),al=(.9*(1-a*.6)).toFixed(2);
  for(let r=0;r<h;r++){
    const w=Math.max(2,Math.round(13*(1-r/(h+4)))+((r*3+Math.floor(a*40))%3?0:1));
    ctx.fillStyle=(r<h*.35?'rgba(255,240,170,':r<h*.7?'rgba(255,190,80,':'rgba(255,120,50,')+al+')';
    ctx.fillRect(78-(w>>1),76-r,w,1);
  }
}
function blinds(h){ /* slatted blinds lowered over the window in the therapy room */
  for(let y=0;y<h;y+=3){rpx(115,13+y,32,2,'#bfae88');rpx(115,13+y+2,32,1,'#3a3048')}
  if(h>0)rpx(115,13+h,32,1,'#8a7a5c');
}
function tunnel(x0,x1,p){ /* the dark tunnel wall across the train window, with lamps streaking past */
  if(x1<=x0)return;
  rpx(x0,12,x1-x0,40,'#0a0812');
  const w=x1-x0;
  for(let j=0;j<6;j++){const x=x0+((j*37+Math.round(Math.abs(p)*420))%Math.max(1,w));rpx(x,[18,30,44][j%3],3,1,'#ffe9a0')}
}
function sign(){rpx(12,13,19,9,'#161a34')} /* the diner's OPEN sign switched off */
function beam(fx){ /* the lighthouse beam, a pale cone from the lamp to the sweeping edge */
  ctx.fillStyle='rgba(255,236,170,.2)';ctx.beginPath();ctx.moveTo(30,22);ctx.lineTo(fx-2,8);ctx.lineTo(fx+2,62);ctx.lineTo(30,26);ctx.fill();
  ctx.fillStyle='rgba(255,246,200,.35)';ctx.fillRect(Math.round(fx)-2,14,4,46);
}
function feet(t){ /* the black beat: footsteps across the dark */
  rpx(0,0,160,90,'#07050f');
  if(TX.calm)return;
  const n=Math.min(5,Math.floor(t/120)+1);
  for(let i=0;i<n;i++){
    const a=cl(1.1-(t/120-i)*.22,.25,1),x=34+i*20,y=i%2?46:38;
    ctx.fillStyle='rgba(243,227,200,'+a.toFixed(2)+')';
    ctx.fillRect(x,y,4,3);ctx.fillRect(x+1,y+4,2,2);
  }
}

/* ---- the sequence ---- */
function txOver(){
  const e=Date.now()-TX.t0,D=TX.d;
  if(TX.ph==='gap'){feet(e);return}
  const out=TX.ph==='out',p=cl(e/(out?D.out:D.inn));
  if(TX.calm){cover(out?ease(p):1-ease(p));return}
  const sp=out?TX.spO:TX.spI;
  if(sp.col&&TX.colK!==TX.ph&&p>=sp.t0[TX.ph]-.015){TX.colK=TX.ph;const sl=samp(sp.col.sl),pw=sp.col.pw?samp(sp.col.pw):sl,b=placeHand(out?TX.from:TX.to);TX.col={sl,pw};TX.hs=hspec(pw,b.k,b.sl?sl:null)} /* sampled before anything is drawn this frame */
  TX.rp=p;sp[out?'out':'in'](out?txQ(p):p); /* the wave uses the real time; the action after it uses the warped time */
  if(out){if(!sp.self)cover(ease(cl((p-.84)/.16)))}
  else cover(1-ease(cl(p/.14)));
}
/* A beat between the wave and what follows: the wave plays in the first third, the paw comes down, the room holds still for a moment, then the action
   (dimming, blinds, lamp, fire) starts. Real progress p 0..1 -> q, which is what each scene's out() sees. */
const txQ=p=>p<.34?p:p<.52?.34:.34+(p-.52)*(.66/.48);
const txRaw=q=>q<=.34?q:.52+(q-.34)*(.48/.66); /* the inverse, for sound cues written in q */
function txSounds(list,dur,warp){list=warp?list.map(([p,n])=>[txRaw(p),n]):list;list.forEach(([p,n])=>TX.tm.push(setTimeout(()=>{try{sfxPlay(n)}catch(e){}},p*dur)))}
function txStep(){
  const e=Date.now()-TX.t0,D=TX.d;
  if(TX.ph==='out'&&e>=D.out){TX.ph='gap';TX.t0=Date.now();if(!TX.calm)for(let i=0;i<5;i++)TX.tm.push(setTimeout(()=>{try{sfxPlay('step')}catch(e){}},i*120))}
  else if(TX.ph==='gap'&&e>=D.gap){TX.ph='in';TX.t0=Date.now();TX.went=1;if(!TX.calm)txSounds(TX.spI.snd.in,D.inn);_goT(TX.to);return}
  else if(TX.ph==='in'&&e>=D.inn){txEnd();return}
  draw();
}
function txEnd(){
  clearInterval(TX.iv);TX.tm.forEach(clearTimeout);TX.tm=[];TX.on=0;
  if(!TX.went){TX.went=1;_goT(TX.to)}else draw();
}
function txStart(k){
  const from=cfg.place,calm=cfg.motion==='calm';
  Object.assign(TX,{on:1,ph:'out',t0:Date.now(),from,to:k,calm:calm?1:0,d:calm?TXD.calm:TXD.normal,colK:'',col:null,hs:null,went:0,tm:[],
    spO:TXS[from]||TXG,spI:TXS[k]||TXG});
  const pc=cfg.cast[from]&&charById(cfg.cast[from]);
  if(!busy&&!actBusy())say(pc||!FAREWELL[from]?'*waves* See you soon.':FAREWELL[from]);
  if(!calm)txSounds(TX.spO.snd.out,TX.d.out,1);
  TX.iv=setInterval(txStep,45);
}
const _goT=goScene;
/* SCENE SWITCH: the old picture slides away and the new scene slides in beside it, like turning a page. Forward goes left, back goes right.
   It is quick (well under a second), stepped to whole pixels, with a little shade at the seam; calm motion cross-fades instead. */
const SL={on:0,t0:0,dur:0,dir:1,old:null,scratch:null,iv:0,calm:0};
const slEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function slEnd(){clearInterval(SL.iv);SL.on=0;draw()}
function slStart(k){
  const keys=Object.keys(SCENES),calm=cfg.motion==='calm';
  if(!SL.old){SL.old=document.createElement('canvas');SL.old.width=160;SL.old.height=90;SL.scratch=document.createElement('canvas');SL.scratch.width=160;SL.scratch.height=90}
  const og=SL.old.getContext('2d');og.imageSmoothingEnabled=false;og.clearRect(0,0,160,90);og.drawImage($('#cv'),0,0,160,90); /* freeze what is on screen */
  SL.dir=keys.indexOf(k)>=keys.indexOf(cfg.place)?1:-1;SL.calm=calm?1:0;SL.dur=calm?320:700;SL.t0=Date.now();SL.on=1;
  if(!calm)try{sfxPlay('whoosh')}catch(e){}
  _goT(k); /* the new scene is drawn underneath while the pictures slide */
  clearInterval(SL.iv);SL.iv=setInterval(()=>{if(Date.now()-SL.t0>=SL.dur)slEnd();else draw()},33);
}
function slOver(){
  const t=Math.min(1,(Date.now()-SL.t0)/SL.dur),e=slEase(t),g=SL.scratch.getContext('2d');
  g.imageSmoothingEnabled=false;g.clearRect(0,0,160,90);g.drawImage($('#cv'),0,0,160,90); /* the new scene as just drawn */
  ctx.clearRect(0,0,160,90);
  if(SL.calm){ctx.drawImage(SL.old,0,0);ctx.globalAlpha=e;ctx.drawImage(SL.scratch,0,0);ctx.globalAlpha=1;return}
  const x=Math.round(160*e/2)*2*SL.dir;           /* whole-pixel steps, two at a time, so it moves like pixel art */
  ctx.drawImage(SL.old,-x,0);ctx.drawImage(SL.scratch,SL.dir*160-x,0);
  const sx=SL.dir>0?160-x:-x; /* the seam between the two pictures */
  ctx.fillStyle='#07050f';ctx.fillRect(SL.dir>0?sx-1:sx-1,0,2,90);
  dim(.4*Math.sin(Math.PI*t));                    /* a little shade while it moves */
}
goScene=function(k){
  if(SL.on)slEnd();
  if(!SCENES[k]||k===cfg.place)return;
  if(still()||document.hidden)return _goT(k);
  slStart(k);
};
const _drawT=draw;
draw=function(){_drawT();if(SL.on){try{slOver()}catch(err){SL.on=0;clearInterval(SL.iv)}}else if(TX.on){try{txOver()}catch(err){TX.on=0;clearInterval(TX.iv)}}};
/* nothing in the scene fidgets while someone is leaving */
const _gestStepT=gestStep;
gestStep=function(){if(TX.on&&TX.ph==='out'&&!TX.calm){GS.name='';GS.next=Math.max(GS.next,tick+10);return}_gestStepT()};
/* tap the picture to skip the walk */
$('#stage').addEventListener('click',e=>{if(SL.on){e.stopImmediatePropagation();e.stopPropagation();slEnd()}},true);
/* two little sounds of its own */
FX.click=()=>{sfT(2200,.02,.05,'square');setTimeout(()=>{if(AC2.state==='running')sfT(1200,.03,.04,'square')},45)};
FX.step=()=>{sfT(95,.1,.07,'sine',55);sfN(.05,.025,'lowpass',500)};
