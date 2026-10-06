/* On arriving in a scene its first gesture plays after a moment, even while the greeting is typing; after that they come now and then. */
/* Gestures: a small thing a scene does now and then, plus a little hello when you switch to it. Normal motion only
   (calm and static scenes skip both). A scene opts in with gest:{name:frames} and calls gesture('name') while drawing:
   it returns the frame 0..frames-1 while the gesture plays, else -1. Nothing starts while someone is talking or thinking. */
const GS={pl:'',seen:0,at:0,next:0,name:'',t:0,first:1,last:''};
function gestStep(){
  const G=(SCENES[cfg.place]||{}).gest||{},ks=Object.keys(G);
  if(tick<GS.seen||GS.pl!==cfg.place){GS.pl=cfg.place;GS.at=tick;GS.name='';GS.first=1;GS.next=tick+4} /* just arrived, or the clock restarted */
  GS.seen=tick;
  if(quietMotion()){GS.name='';return}
  const rb=typeof rxBusy==='function'&&rxBusy(); /* reactions.js: a reaction or an idle spell is on */
  if(rb)GS.next=Math.max(GS.next,tick+20);
  if(GS.name&&((!GS.first&&(talking||thinking))||tick-GS.t>=G[GS.name])){GS.name='';GS.first=0;GS.next=tick+40+hs(tick*3)%50} /* done, or cut short when talk starts */
  if(!GS.name&&ks.length&&!rb&&tick>=GS.next&&(GS.first||(!talking&&!thinking))){
    const pool=ks.filter(k=>k!==GS.last),pl=pool.length?pool:ks; /* never the same one twice in a row */
    GS.name=GS.first?ks[0]:pl[hs(tick)%pl.length];GS.last=GS.name;GS.t=tick;
    if(typeof sfx==='function')sfx(cfg.place+'.'+GS.name)} /* its little sounds (ambient.js) */
}
const gesture=n=>GS.name===n&&GS.pl===cfg.place?tick-GS.t:-1;
const hello=()=>quietMotion()||GS.pl!==cfg.place||tick-GS.at>7?-1:tick-GS.at;
function gestPose(){gestStep();const h=hello();if(h>=0)CH.dy+=[-3,-4,-2,0,-1,0,0,0][h];const sc=SCENES[cfg.place]||{};if(GS.name&&sc.gp&&GS.pl===cfg.place)CH.dy+=sc.gp(GS.name,tick-GS.t)||0} /* sc.gp(name,frame) can move the character, e.g. a yawn or a purr */ /* a small hello hop */
function gestOver(){const h=hello();if(h>=0&&h<4){ctx.fillStyle='rgba(10,8,24,'+[.55,.35,.18,.08][h]+')';ctx.fillRect(0,0,160,90)}} /* the scene fades in */
/* An ARM, not a stick: a shoulder cap sitting on the body, an upper arm that bends at an elbow (down and away from the body), and a forearm to the hand.
   Everything is drawn in the character's own colors so it reads as part of them. c = arm color, sl = sleeve/clothing color for the upper arm (default c),
   ol = outline color (optional). The caller draws the hand/paw/prop at (hx,hy). Returns the elbow point. */
function armElbow(sx,sy,hx,hy){
  const dx=hx-sx,dy=hy-sy,L=Math.hypot(dx,dy)||1,out=sx>=80?1:-1,bend=Math.min(5,Math.max(1,L*.22));
  let nx=-dy/L,ny=dx/L; if(ny*1+nx*out*.6<-ny*1-nx*out*.6){nx=-nx;ny=-ny}
  return[Math.round((sx+hx)/2+nx*bend),Math.round((sy+hy)/2+ny*bend)];
}
function arm(sx,sy,hx,hy,w,c,sl,ol){
  const[ex,ey]=armElbow(sx,sy,hx,hy),u=sl||c,o=ol||shade(c,.68);
  const wu=w+2,wf=w+1; /* upper arm and forearm widths, each with a 1px outline on both sides */
  limb(sx,sy,ex,ey,wu+2,o);limb(ex,ey,hx,hy,wf+2,o);px(sx-(wu>>1)-1,sy-(wu>>1)-1,wu+3,wu+3,o);
  limb(sx,sy,ex,ey,wu,u);limb(ex,ey,hx,hy,wf,c);px(sx-(wu>>1),sy-(wu>>1),wu+1,wu+1,u); /* shoulder cap sits on the body */
  return[ex,ey];
}
/* A PAW with three toes and a pad: top-left at (x,y), 7 wide, 7 tall; the wrist is open at the bottom so the forearm runs straight into it.
   d = the pixel function to draw with (px by default, rpx inside the transitions). */
const PAW_T=['.o.o.o.','ofofofo','offfffo','offpffo','ofpppfo','.offfo.','..ofo..'];
function paw(x,y,fur,lt,ol,d){d=d||px;const C={o:ol,f:fur,p:lt};
  for(let r=0;r<7;r++)for(let c=0;c<7;c++){const k=PAW_T[r][c];if(k!=='.')d(x+c,y+r,1,1,C[k])}}
/* A HUMAN HAND, back of the hand, fingers up: four separate fingers of different lengths, knuckles, a thumb and a wrist; 13 wide, 14 tall.
   flip = 1 puts the thumb on the left (a right hand). sk/hl/sh = skin, highlight, shade. */
function handH(x,y,flip,sk,hl,sh,d){d=d||px;const W=13,P=7,put=(c,r,k)=>d(x+(flip?W-1-c:c),y+r,1,1,k);
  [[0,3],[3,1],[6,0],[9,1]].forEach(([c,t])=>{for(let r=t;r<P-1;r++){put(c,r,sk);put(c+1,r,sk)}put(c,t,hl);put(c+1,t,hl);put(c+1,t+1,sh);put(c,P-3,sh)}); /* fingers, with a joint crease */
  for(const c of[2,5,8])put(c,P-1,sh); /* the webbing between fingers */
  for(let c=0;c<=10;c++){put(c,P,hl);for(let r=P+1;r<=P+3;r++)put(c,r,sk)}
  for(let c=1;c<=9;c++){put(c,P+4,sk);put(c,P+5,sh)}
  for(const c of[1,4,7,10])put(c,P+1,sh); /* knuckles */
  for(let r=P+6;r<=P+8;r++){put(2,r,sh);put(8,r,sh);for(let c=3;c<=7;c++)put(c,r,sk)}
  put(11,P+1,sk);put(12,P+2,hl);put(11,P+2,sk);put(12,P+3,sk);put(11,P+3,sk);put(11,P+4,sh);put(12,P+4,sk); /* thumb */
}
/* an arm or stick drawn as a short line of squares, from (x0,y0) to (x1,y1) */
function limb(x0,y0,x1,y1,w,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)px(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),w,w,c)}
