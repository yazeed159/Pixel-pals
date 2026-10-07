/* Reactions: the character answers you with its body, and has a little life while you are away.
   1. Body language that follows the conversation: leans closer when you say something heavy or the reply is gentle, shakes with a
      laugh at a joke, waves when you say goodbye, hops when you come back.
   2. Idle: after about two minutes with no taps they hum or doze off (Zzz); your next tap wakes them with a small hop.
      Late at night they also yawn now and then, and are more likely to doze.
   Normal motion plays all of it; Calm only leans and dozes (no shaking, waving, humming, yawning or hopping); Static scene plays none.
   Setup > Reactions to you turns it off. Loads after gestures.js. core.js calls rxPose() before a scene is drawn and rxOver() after it;
   setMood() and send() are wrapped instead of edited. */

if(cfg.react===undefined)cfg.react='1';
FIELDS.push('react');

/* where each default character is: at = top-left of its 32x32 sprite, mo = its mouth, idle = what it may do alone. Arms and hands come from art/hands.js (placeHand). */
const RXA={
  kitchen:{at:[64,30],mo:[77,47],idle:['doze','hum']},
  therapy:{at:[64,34],mo:[77,35],idle:[],nowave:1},
  camp:{at:[64,30],mo:[77,43],idle:['doze','hum']},
  train:{at:[64,36],mo:[77,41],idle:['doze','hum']},
  diner:{at:[64,24],mo:[77,40],idle:['doze','hum']},
  library:{at:[64,30],mo:[77,49],idle:['doze','hum']},
  lighthouse:{at:[88,34],mo:[101,53],idle:['doze','hum']},
  rooftop:{at:[64,34],mo:[77,37],idle:['doze','hum']},
  bed:{at:[64,34],mo:[80,50],idle:['doze'],nowave:1}
};
const RX={name:'',t0:0,len:0,act:Date.now(),idle:'',idleT0:0,nextIdle:0,snoreAt:0,humAt:0,yawnAt:0,bye:0,pl:''};
const RXP={perk:1,yawn:1,lean:2,laugh:3,wave:3}; /* a weaker reaction never cuts a stronger one short */
const rxOn=()=>cfg.react==='1'&&!still();
const rxAlive=()=>!!RX.name&&Date.now()-RX.t0<RX.len;
const rxBusy=()=>rxOn()&&(rxAlive()||!!RX.idle); /* gestures wait while this is true */
const rxLerp=(a,b,t)=>a+(b-a)*t;
function rxCutGesture(){ /* set down whatever is in hand: jump to the last few frames of the gesture, where the prop goes back */
  const G=(SCENES[cfg.place]||{}).gest||{};
  if(GS.name&&G[GS.name]){const L=G[GS.name],f=tick-GS.t;if(L-f>3)GS.t=tick-(L-3)}
}
function rxStart(name,len){
  if(!rxOn())return;
  if(quietMotion()&&name!=='lean')return;
  if(rxAlive()&&RXP[name]<RXP[RX.name])return;
  RX.name=name;RX.t0=Date.now();RX.len=len;
  rxCutGesture();
  draw();
}

/* ---- the body: offsets for the whole character, applied before the scene is drawn ---- */
function rxPose(){
  if(RX.pl!==cfg.place){RX.pl=cfg.place;RX.name='';RX.idle='';RX.act=Date.now();RX.nextIdle=0}
  if(!rxOn())return;
  const n=Date.now(),calm=quietMotion();
  if(rxAlive()){
    const t=n-RX.t0,L=RX.len,env=Math.max(0,Math.min(1,t/600,(L-t)/800)),e=RX.name;
    if(e==='lean')CH.dy+=Math.round(2*env); /* a little forward and down: closer */
    else if(e==='laugh'){if(env>.15)CH.dx+=(Math.floor(t/80)%2)?1:-1;CH.dy-=Math.floor(t/150)%2}
    else if(e==='wave'){
      if(RXA[cfg.place]&&RXA[cfg.place].nowave)CH.dy-=(Math.floor(t/280)%2)*2; /* no free paw in bed: the dog just bobs its head */
      else if(t<500)CH.dy-=Math.round(2*(1-t/500))}
    else if(e==='perk'){CH.dy-=t<300?2:t<500?1:0}
    else if(e==='yawn'){CH.dy+=Math.round(2*Math.sin(Math.PI*t/L));if(!talking&&!thinking){mood='sleepy';moodT=3}}
  }
  if(RX.idle==='doze'){CH.dy+=2+(Math.floor(n/1600)%2);if(!talking&&!thinking&&moodT<=0){mood='sleepy';moodT=3}}
  else if(RX.idle==='hum'&&!calm)CH.dx+=[0,0,1,1,0,0,-1,-1][Math.floor(n/450)%8];
}

/* ---- things drawn on top: a waving paw, the paw at a yawn, notes drifting up while humming ---- */
function rxOver(){
  if(!rxOn()||quietMotion())return;
  const A=RXA[cfg.place];if(!A)return;
  const n=Date.now(),dx=CH.dx,dy=CH.dy,hs_=placeHand(),[ox,oy]=A.at,[mx,my]=A.mo;
  CH.on=0;
  if(rxAlive()&&RX.name==='wave'&&!A.nowave){
    const t=n-RX.t0,L=RX.len,up=Math.max(0,Math.min(1,t/350,(L-t)/350)),sw=Math.round(Math.sin(t/110)*3*up);
    const sx=ox+23+dx,sy=oy+24+dy,hx=ox+32+sw+dx,hy=Math.round(oy+20-14*up)+dy;
    armHand(sx,sy,hx,hy,hs_,'open'); /* the character's own arm and hand, from the shoulder, with an elbow */
  }
  if(rxAlive()&&RX.name==='yawn'&&!A.nowave){
    const t=n-RX.t0,L=RX.len,pr=Math.max(0,Math.min(1,t/(L*.25),(L-t)/(L*.25)));
    const x=Math.round(rxLerp(ox+27,mx+3,pr))+dx,y=Math.round(rxLerp(oy+31,my+1,pr))+dy;
    armHand(ox+23+dx,oy+24+dy,x,y,hs_,'fist'); /* the same arm, paw up to the mouth */
  }
  if(RX.idle==='hum'){
    for(let k=0;k<3;k++){
      const a=((n+k*800)%2400)/2400,x=Math.round(mx+4+a*14+Math.sin(a*6+k*2)*3)+dx,y=Math.round(my-4-a*22)+dy,c=a>.75?'#fff6d855':'#fff6d8';
      px(x,y+3,3,2,c);px(x+2,y,1,4,c);px(x+3,y,2,1,c);
    }
  }
}

/* ---- reacting to the conversation ---- */
const RX_LAUGH=/\bha(ha)+\b|\bhehe+\b|\blol\b|\bfunny\b|laugh|chuckl|giggl|snort/i;
const RX_HEAVY_REPLY=/sorry to hear|sounds (really |so |very )?(hard|heavy|rough|painful|tough|exhausting)|here with you|i'?m here|i am here|take your time|that must (be|have)/i;
const RX_HEAVY_YOU=/\b(sad|tired|exhausted|hurt|hurts|lonely|alone|anxious|anxiety|stressed|overwhelmed|cried|crying|scared|afraid|worried|grief|awful|terrible|miss(ed)? (him|her|them)|hard day|rough day|bad day|passed away|died)\b/i;
const RX_BYE=/\b(bye|goodbye|good ?night|nighty|night night|gotta go|got to go|gtg|g2g|see (you|ya)|talk (to you )?(later|tomorrow)|ttyl|heading (out|off)|going to (bed|sleep)|off to (bed|sleep))\b/i;
const _setMoodRx=setMood;
setMood=function(t){
  _setMoodRx(t);
  try{
    const l=String(t||'');
    if(RX.bye&&Date.now()-RX.bye<3*6e4){RX.bye=0;rxStart('wave',3200);return}
    if(RX_LAUGH.test(l)){rxStart('laugh',2400);sfxPlay('giggle')}
    else if(mood==='sad'||RX_HEAVY_REPLY.test(l))rxStart('lean',9000);
    else if(mood==='sleepy'&&TM==='night'&&!NOLIFE[cfg.place])rxStart('yawn',2600);
    else if(mood==='happy'&&Math.random()<.6)rxStart('perk',700);
  }catch(e){}
};
const _sendRx=send;
send=function(over){
  const t=(typeof over==='string'?over:msg.value).trim();
  if(t&&!busy&&!t.startsWith('/')){
    if(RX_BYE.test(t))RX.bye=Date.now();
    else if(RX_HEAVY_YOU.test(t))rxStart('lean',12000); /* leans in to listen while it thinks */
  }
  return _sendRx.apply(this,arguments);
};

/* ---- idle: hum or doze after a couple of minutes, wake with a hop, yawn at night ---- */
['pointerdown','keydown','input','touchstart'].forEach(e=>document.addEventListener(e,()=>{
  const was=RX.idle,n=Date.now();RX.act=n;
  if(was){RX.idle='';RX.nextIdle=n+60000;if(rxOn()){rxStart('perk',700);mood='happy';moodT=14}}
},true));
function rxTick(){
  if(!rxOn()){RX.idle='';return}
  const n=Date.now(),pl=cfg.place,A=RXA[pl],calm=quietMotion();
  const quiet=!(document.hidden||talking||thinking||typing||busy||(typeof actBusy==='function'&&actBusy())||document.querySelector('dialog[open]'));
  if(RX.idle&&!quiet){RX.idle='';RX.nextIdle=n+30000;return} /* a reply or a nudge begins: stop quietly */
  if(RX.idle==='hum'){
    if(n-RX.idleT0>25000){RX.idle='';RX.nextIdle=n+(15+Math.random()*25)*1000}
    else if(n>=RX.humAt){sfxPlay('humtune');RX.humAt=n+5200}
  }else if(RX.idle==='doze'&&n>=RX.snoreAt){sfxPlay('snore');RX.snoreAt=n+8000+Math.random()*4000}
  if(!RX.idle&&quiet&&!(typeof NOLIFE!=='undefined'&&NOLIFE[pl])){
    const night=TM==='night',opts=A?A.idle:['doze'];
    if(opts.length&&n-RX.act>=(night?90:120)*1000&&n>=RX.nextIdle){
      const dz=opts.includes('doze'),hm=opts.includes('hum')&&!calm;
      RX.idle=!hm?'doze':!dz?'hum':(Math.random()<(night?.7:.45)?'doze':'hum');
      RX.idleT0=n;RX.snoreAt=n+3000;RX.humAt=n;rxCutGesture();
    }
    /* at night: a yawn every minute or two while things are quiet */
    if(night&&!RX.idle&&!rxAlive()&&!calm&&!(typeof NOLIFE!=='undefined'&&NOLIFE[pl])){
      if(!RX.yawnAt)RX.yawnAt=n+(50+Math.random()*70)*1000;
      else if(n>=RX.yawnAt){RX.yawnAt=n+(50+Math.random()*70)*1000;rxStart('yawn',2600);sfxPlay('yawn')}
    }
  }
}
setInterval(rxTick,1000);
setInterval(()=>{if(document.hidden||!rxOn())return;if(rxAlive())draw()},90); /* smooth in-between frames while a reaction plays */
