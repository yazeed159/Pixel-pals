/* The look and feel: photo mode and seasonal events.
   Loads after together.js and, like it, wraps draw(), sys() and greetLine() instead of editing them.
   The day-night blending itself lives in art/core.js (resolveTime, byTime, byDay). */
cfg.events=cfg.events||'auto';delete cfg.depth; /* the old cursor/tilt depth motion was removed */
FIELDS.push('events');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ================= seasonal events ================= */
function evNow(){
  if(cfg.events==='off')return '';
  if(cfg.events==='newyear'||cfg.events==='halloween')return cfg.events; /* the Setup preview options */
  const d=new Date(),m=d.getMonth(),n=d.getDate();
  if((m===11&&n===31)||(m===0&&n===1))return 'newyear';
  if(m===9&&n>=25)return 'halloween';
  return '';
}
const FWC=[[255,120,140],[255,210,120],[120,255,200],[130,190,255],[220,150,255]];
function fireworks(now){
  const o=0;
  [[3200,0],[4100,1300],[5300,2600]].forEach(([per,off],i)=>{
    const n=Math.floor((now+off)/per),age=((now+off)%per)/1000,r=hs(n*13+i*101),cx=34+r%92,cy=16+(r>>8)%15,c=FWC[(r>>4)%FWC.length],c2=FWC[(r>>6)%FWC.length];
    if(age<.6){const p=age/.6,y=Math.round(68-(68-cy)*p*(2-p));rpx(cx+o,y,2,2,'#fff3c8');rpx(cx+o,y+2,1,4,'rgba(255,233,168,.45)');return} /* the rocket */
    const a=age-.6;if(a>2.2)return;
    const life=Math.max(0,1-a/2.2),al=Math.pow(life,.7);
    if(a<.15){const f=(.15-a)/.15;rpx(cx-3+o,cy-1,7,3,'rgba(255,255,255,'+(.8*f).toFixed(2)+')');rpx(cx-1+o,cy-3,3,7,'rgba(255,255,255,'+(.8*f).toFixed(2)+')')} /* the flash */
    [[30,24,c],[16,13,c2]].forEach(([N,sp,col],ring)=>{for(let k=0;k<N;k++){
      if(a>1.1&&(k*3+tick+ring)%6===0)continue; /* sparkle out */
      const ang=k/N*Math.PI*2+(r%7)*.3+ring*.2;
      [[a,1],[a-.09,.45],[a-.18,.2]].forEach(([t,m])=>{if(t<0)return;const d=1-Math.exp(-t*2.2);
        rpx(Math.round(cx+Math.cos(ang)*sp*d)+o,Math.round(cy+Math.sin(ang)*sp*d+5*t*t),a<.9?2:1,a<.9?2:1,'rgba('+col+','+(al*m).toFixed(2)+')')})}});
  });
}
function bats(now){
  [0,1,2].forEach(i=>{
    const x=Math.round(((now/55+i*70)%200)-20),y=10+i*9+Math.round(3*Math.sin(now/400+i)),up=Math.floor(now/140+i)%2,B='#120c1c';
    rpx(x,y,3,2,B);rpx(x,y-1,1,1,B);rpx(x+2,y-1,1,1,B);
    if(up){rpx(x-3,y-1,3,1,B);rpx(x+3,y-1,3,1,B)}else{rpx(x-3,y+1,3,1,B);rpx(x+3,y+1,3,1,B)}
  });
}
function campSnow(){ /* winter at the camp: snow clings to the pines, speckles the ground, and falls thicker */
  [[8,62,34,16],[24,60,26,12],[40,63,30,14],[148,62,34,16],[110,59,24,10]].forEach(([x,b,h,w])=>{
    for(let i=2;i<h;i++){if(i%5>1)continue;const q=2+Math.round(i*w/h),xl=x-(q>>1);rpx(xl,b-h+i,2,1,'#f2f6ff');rpx(xl+q-2,b-h+i,2,1,'#f2f6ff')}});
  for(let x=2;x<160;x+=5){if(x>54&&x<106)continue;rpx(x+(x*7)%3,60+(x*13)%27,2,1,'#eaf1ff')}
  snow(0,0,160,90,26,1);
}
const _draw3=draw;
draw=function(){
  _draw3();
  const e=evNow(),pl=cfg.place,sc=SCENES[pl]||{};
  if(!quietMotion()){if(e==='newyear'&&pl==='rooftop')fireworks(Date.now());
  if(e==='halloween'&&sc.outdoor)bats(Date.now())}
  if(pl==='camp'&&winter())campSnow();
};
setInterval(()=>{ /* fireworks and bats move faster than the 3 fps scene tick */
  const e=evNow(),sc=SCENES[cfg.place]||{};
  if(!document.hidden&&!quietMotion()&&((e==='newyear'&&cfg.place==='rooftop')||(e==='halloween'&&sc.outdoor)))draw();
},100);
const _sys3=sys;
sys=function(){
  let p=_sys3();const e=evNow(),sc=SCENES[cfg.place]||{};
  if(e==='newyear'&&cfg.place==='rooftop')p+=" It is New Year's: fireworks are going off over the city and you can both see them from the rooftop. Mention them naturally if it fits, but do not keep repeating it.";
  if(e==='halloween'&&sc.outdoor)p+=' Halloween is close: bats are flying across the sky. Mention it only if it fits.';
  if(cfg.place==='camp'&&winter()&&cfg.weather!=='rain')p+=' It is winter: snow is falling softly and has settled on the pines and the ground around the fire.';
  return p;
};
const _gl=greetLine;
greetLine=function(){let l=_gl();if(evNow()==='newyear'&&cfg.place==='rooftop')l+=" Happy New Year, by the way. Look up!";return l};

/* ================= photo mode ================= */
const phd=$('#phd'),phv=$('#phv');
function photoText(){
  if(cfg.style==='bubbles'){const a=[...hh()].reverse().find(m=>m.role==='assistant');return a?a.content.replace(/\s+/g,' ').trim():''}
  return (txt.textContent||full||'').replace(/\s+/g,' ').trim();
}
function wrapLines(g,t,maxW){const out=[];let line='';for(const w of t.split(' ')){const test=line?line+' '+w:w;if(g.measureText(test).width>maxW&&line){out.push(line);line=w}else line=test}if(line)out.push(line);return out}
/* the scene as a crisp pixel-art image (always drawn flat), optionally with the dialogue box under it */
function snap(withText,sc){
  draw();
  const W=160*sc,H=90*sc,u=W/640,ff=getComputedStyle(document.body).fontFamily,ink=css('--ink')||'#1c1730',cream=css('--cream')||'#f3e3c8',rose=css('--rose')||'#d9798f';
  let t=withText?photoText():'',lines=[],boxH=0;
  const m=document.createElement('canvas').getContext('2d');
  if(t){m.font=Math.round(20*u)+'px '+ff;lines=wrapLines(m,t,W-48*u);if(lines.length>7){lines=lines.slice(0,7);lines[6]=lines[6].replace(/\s*\S*$/,'')+'…'}boxH=Math.round((64+lines.length*27+14)*u)}
  const o=document.createElement('canvas');o.width=W;o.height=H+boxH;const g=o.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage($('#cv'),0,0,W,H);
  draw();
  if(t){
    g.fillStyle=ink;g.fillRect(0,H,W,boxH);g.fillStyle=cream;g.fillRect(0,H,W,Math.max(2,4*u));
    const rt=dirOf(t)==='rtl';
    const nt=nm();g.font='600 '+Math.round(18*u)+'px '+ff;const nw=g.measureText(nt).width+26*u,nx=rt?W-14*u-nw:14*u;
    g.fillStyle=rose;g.fillRect(nx,H+12*u,nw,30*u);g.fillStyle=ink;g.textBaseline='middle';g.fillText(nt,nx+13*u,H+27*u);
    g.fillStyle=cream;g.font=Math.round(20*u)+'px '+ff;g.textBaseline='alphabetic';
    g.direction=rt?'rtl':'ltr';g.textAlign=rt?'right':'left';
    lines.forEach((l,i)=>g.fillText(l,rt?W-24*u:24*u,H+(72+i*27)*u));
    g.textAlign='left';g.direction='ltr';
  }
  return o;
}
const phOpts=()=>({text:$('#phtext').value==='1',sc:+$('#phsc').value});
function phRender(){const {text,sc}=phOpts(),o=snap(text,Math.min(sc,4));phv.width=o.width;phv.height=o.height;phv.getContext('2d').drawImage(o,0,0)}
const stamp=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())};
const phBlob=()=>{const {text,sc}=phOpts();return new Promise(r=>snap(text,sc).toBlob(r,'image/png'))};
$('#phb').onclick=e=>{e.stopPropagation();if(!photoText())$('#phtext').value='0';phRender();phd.showModal()};
$('#phtext').onchange=$('#phsc').onchange=phRender;
$('#phx').onclick=()=>phd.close();
$('#phsave').onclick=async()=>{
  const b=await phBlob(),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='pixel-pals-'+cfg.place+'-'+stamp()+'.png';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
};
$('#phshare').onclick=async()=>{
  const b=await phBlob(),f=new File([b],'pixel-pals-'+stamp()+'.png',{type:'image/png'});
  try{if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]});else $('#phsave').click()}catch(e){}
};
if(!(navigator.share&&navigator.canShare))$('#phshare').hidden=true;
