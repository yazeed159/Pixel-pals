/* Canvas basics: drawing helper, time-of-day palettes, idle-timing helpers, seasons, color moods,
   the scene registry and the draw call. Scenes register themselves in js/scenes/*.js. */
const ctx=$('#cv').getContext('2d'); ctx.imageSmoothingEnabled=false;
/* sky = top of the sky, hz = color near the horizon (skyfill blends between them) */
const SC={night:{wall:'#3b3358',w2:'#342c52',floor:'#5a3f4a',f2:'#4e3541',sky:'#151b3d',hz:'#26306a',moon:'#f3e3c8',glow:'255,200,120'},
sunset:{wall:'#6b4a6e',w2:'#5f4064',floor:'#7a4c4a',f2:'#6b4141',sky:'#e8825a',hz:'#ffbe6e',moon:'#ffd27a',glow:'255,170,90'},
day:{wall:'#a9c4d6',w2:'#9dbacd',floor:'#c9a37a',f2:'#bc9670',sky:'#8fd3f4',hz:'#d4f0fa',moon:'#fff3a0',glow:'255,230,170'},
dawn:{wall:'#7d6a8e',w2:'#705e82',floor:'#8a6a62',f2:'#7a5c56',sky:'#f2a0b0',hz:'#ffdca0',moon:'#fff0c0',glow:'255,190,140'},
dusk:{wall:'#443a68',w2:'#3b3260',floor:'#614558',f2:'#553b4c',sky:'#3a2a6a',hz:'#c0587a',moon:'#e8d8f0',glow:'255,170,130'}};
let tick=0, talking=false, thinking=false, jolt=0, jx=0, jy=0, mood='', moodT=0;
let TM='night', PC=null; /* TM = the time of day being drawn now; PC = custom character cast in this scene (or null) */
const px=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
const SCENES={};

/* ---- time of day ---- */
function resolveTime(){
  if(cfg.time!=='auto')return SC[cfg.time]?cfg.time:'night';
  const h=new Date().getHours();
  return h>=5&&h<7?'dawn':h>=7&&h<17?'day':h>=17&&h<19?'sunset':h>=19&&h<21?'dusk':'night';
}
const stars=()=>TM==='night'||TM==='dusk';
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
/* a sky rectangle that fades toward the horizon color; this is what makes dawn and dusk look different */
function skyfill(x,y,w,h,s){const n=5;for(let i=0;i<n;i++){const y0=y+Math.floor(h*i/n),y1=y+Math.floor(h*(i+1)/n);px(x,y0,w,y1-y0,mix(s.sky,s.hz,i/(n-1)))}}

/* ---- idle timing ----
   ev(period,duration,offset): once every `period` ticks (at a varying moment) returns 0..duration-1 while the event
   is happening, else -1. evS then holds the event number, handy for picking a variation.
   held(period,offset,n): a value 0..n-1 that changes now and then (for "the dog settles somewhere new"). */
const hs=n=>{n=Math.imul(n^n>>>15,0x2c1b3c6d);n=Math.imul(n^n>>>12,0x297a2d39);return (n^n>>>15)>>>0};
let evS=0;
function ev(per,dur,off=0){const t=tick+off,s=Math.floor(t/per),st=hs(s*7+off)%(per-dur+1),r=t-s*per-st;evS=s;return r>=0&&r<dur?r:-1}
function held(per,off,n){const t=tick+off,s=Math.floor(t/per),st=hs(s*7+off)%per;return hs(((t-s*per)>=st?s:s-1)*13+off)%n}

/* ---- seasons ---- */
function winter(){if(cfg.season==='off')return false;const m=new Date().getMonth();return cfg.season==='s'?(m>=5&&m<=7):(m===11||m<=1)}
function snow(x0,y0,W,H,n,sp){for(let i=0;i<n;i++){const x=x0+(i*47+i*i+tick*sp*(1+i%3))%W,y=y0+(i*31+tick*2*sp*(1+i%2))%H;px(x,y,1,1,'#ffffffcc')}}

/* ---- color moods (per scene): a tint over the finished picture ---- */
function tint(){
  const p=cfg.pals[cfg.place];if(!p)return;
  ctx.save();
  if(p==='warm'){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#ffe0b4';ctx.fillRect(0,0,160,90);ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,140,50,.10)';ctx.fillRect(0,0,160,90)}
  else if(p==='cold'){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#bcd2ff';ctx.fillRect(0,0,160,90);ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(50,110,255,.10)';ctx.fillRect(0,0,160,90)}
  else if(p==='muted'){ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.6;ctx.fillStyle='#808080';ctx.fillRect(0,0,160,90);ctx.globalAlpha=1;ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(120,120,140,.10)';ctx.fillRect(0,0,160,90)}
  ctx.restore();
}

function draw(){TM=resolveTime();PC=occ();const s=SC[TM]||SC.night;(SCENES[cfg.place]||SCENES.bed).draw(s);tint();fx()}
function fx(){if(jolt>0){const y=jy-(6-jolt)*2,c='#f3e3c8aa';px(jx,y,1,1,c);px(jx+3,y+2,1,1,c);px(jx-2,y+3,1,1,c)}if(moodT>0&&mood){const h=(SCENES[cfg.place].hot||[])[0];if(h){const x=h.r[0]+h.r[2]-2,y=h.r[1]+2,t=tick%4;
    if(mood==='happy'){px(x,y,1,1,t<2?'#f3e3c8':'#f3e3c855')}
    else if(mood==='sad'){px(x-12,y+8+t*3,1,2,'#7ab8ff');px(x-11,y+9+t*3,1,1,'#7ab8ff')}
    else{const z=(a,b,s)=>{px(a,b,s,1,'#f3e3c8');px(a+s-1,b+1,1,1,'#f3e3c8');px(a+s-2,b+2,1,1,'#f3e3c8');px(a,b+3,s,1,'#f3e3c8')};z(x,y-t,4);z(x+5,y-4-t,3)}}}
  const w=cfg.weather;
  if(w==='rain'||w==='snow'){
    for(let i=0;i<60;i++){const x=(i*47+i*i+tick*(w==='rain'?5:2)*(1+i%3))%160,y=(i*31+tick*(w==='rain'?14:5)*(1+i%2))%90;
      if(w==='rain')px(x,y,1,3,'#9ac8ff99');else px(x,y,1,1,'#ffffffcc')}
    return}
  /* winter: a light snowfall in outdoor scenes, and flakes in the window of indoor ones */
  if(winter()){const sc=SCENES[cfg.place];
    if(sc.outdoor)snow(0,0,160,90,24,1);
    else if(sc.win){const [x,y,W,H]=sc.win;snow(x,y,W,H,Math.max(6,W>>2),1);px(x,y+H,W,1,'#ffffffcc')}}}

/* tiny 3x5 pixel font for signs and clocks */
const FONT={O:'111101101101111',P:'111101111100100',E:'111100111100111',N:'101111111111101',D:'110101101101110',I:'111010010010111',A:'010101111101101',M:'101111111101101',R:'110101110101101',H:'101101111101101',B:'110101110101110',L:'100100100100111',Y:'101101010010010',S:'111100111001111',T:'111010010010010',U:'101101101101111',K:'101101110101101','3':'111001111001111','4':'101101111001001','2':'111001111100111','0':'111101101101111','1':'010110010010111',':':'000010000010000','-':'000000111000000'};
function text(str,x,y,c){[...str].forEach((ch,n)=>{const g=FONT[ch];if(!g)return;for(let i=0;i<15;i++)if(g[i]==='1')px(x+n*4+i%3,y+(i/3|0),1,1,c)})}
