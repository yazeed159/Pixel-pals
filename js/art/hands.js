/* Hands: ONE system draws every paw, hand and wing in the app, so they always match the character they belong to.
   - spec = hspec(color, kind, sleeve): kind is 'paw' (dog, cat, fox, rabbit, bear), 'hand' (a person) or 'wing' (the owl).
     The hand is ALWAYS the character's own fur/skin color; outline, highlight and toe lines are derived from it, so a custom
     color, a night palette or a tint never gives a mismatched hand. A sleeve (coat, cardigan, sweater) covers the arm up to the cuff.
   - armHand(sx,sy,hx,hy,spec,pose,o): the whole limb. Shoulder cap, upper arm, elbow, forearm, then the hand centered on
     (hx,hy). Poses: open (palm out, for waving), fist (holding a handle or covering a mouth), grip (holding something small),
     point (one finger up, shh) and rest (lying flat). o.P = the pixel function (px for scenes, rpx for the transition layer),
     o.flip = a left hand, o.w = arm thickness, o.hand = a different spec for the hand than the arm (white socks), o.bend = how far the elbow bends (1 normal, 0.3 for an arm hanging at rest).
   - Nothing else in the app should draw a hand with raw rectangles. */

const HKIND=sp=>sp==='owl'?'wing':sp==='human'?'hand':'paw';
/* the look of each scene's own character (custom characters use their own species and color instead) */
const DEFH={
  kitchen:{sp:'rabbit',c:'#e8dcd0'},
  therapy:{sp:'human',c:'#e8b894',sl:'#5a8a9a'},
  camp:{sp:'fox',c:'#e8803a'},
  train:{sp:'cat',c:'#e8d3a8',sl:'#2a3a7a'},
  diner:{sp:'owl',c:'#a07a4e'},
  library:{sp:'bear',c:'#7a4e34',sl:'#4a6a4a'},
  lighthouse:{sp:'dog',c:'#8a8a98',sl:'#e8b840'},
  rooftop:{sp:'cat',c:'#e0904c'},
  bed:{sp:'dog',c:'#c98f56'}
};
const lum=c=>{const [r,g,b]=hex(c);return .3*r+.59*g+.11*b};
function hspec(c,kind='paw',sl=null){
  const wing=kind==='wing',hand=kind==='hand';
  return{c,k:kind,sl,
    o:shade(c,lum(c)>175?.6:wing?.5:.52), /* outline, a little softer on pale fur */
    l:mix(c,'#ffffff',hand?.22:.3),    /* highlight */
    d:shade(c,wing?.68:.78),           /* toe / finger / feather lines */
    p:hand?shade(c,.9):mix(shade(c,.72),'#d9707e',.42), /* pad */
    cf:sl?mix(sl,'#ffffff',.28):c,     /* cuff */
    so:sl?shade(sl,.55):null,          /* sleeve outline */
    t:wing?4:3}                        /* arm thickness */
}
/* the hand style of the character in a scene (the cast character if there is one, else the scene's own) */
function placeHand(place=cfg.place){
  const id=cfg.cast&&cfg.cast[place],pc=id?charById(id):null;
  if(pc)return hspec(pc.c1,HKIND(pc.species));
  const d=DEFH[place]||DEFH.bed;
  return hspec(place==='bed'?(FUR[cfg.fur]||FUR.tan)[0]:d.c,HKIND(d.sp),d.sl);
}

/* ---- the hands, as little pictures. o outline, f fur, l light, d line, p pad, c cuff. anchor = where the forearm joins ---- */
const HT={
  paw:{
    open:{a:[3,5],r:[".ooooo.","oldfdfo","oldfdfo","offfffo","ofpppfo",".offfo."]},
    fist:{a:[3,3],r:[".oooo.","olfffo","ofdddo","offffo","ofdddo",".oooo."]},
    grip:{a:[2,2],r:[".ooo.","olffo","ofddo","offfo",".ooo."]},
    point:{a:[3,6],r:["..oo..",".olfo.",".offo.",".offo.","olffdo","offffo","ofdddo",".oooo."]},
    rest:{a:[1,2],r:[".oooooo.","olffdfdo","offffffo",".oooooo."]}
  },
  hand:{
    open:{a:[3,5],r:[".ooooo.","oldfdfo","oldfdfo","offfffo","offfffo",".offfo."]},
    fist:{a:[3,3],r:[".oooo.","olfffo","ofdddo","offffo","ofdddo",".oooo."]},
    grip:{a:[2,2],r:[".ooo.","olffo","ofddo","offfo",".ooo."]},
    point:{a:[3,6],r:["..oo..",".olfo.",".offo.",".offo.","olffdo","offffo","ofdddo",".oooo."]},
    rest:{a:[1,2],r:[".oooooo.","olffdfdo","offffffo",".oooooo."]}
  },
  wing:{
    open:{a:[3,5],r:[".o.o.o.","ololdlo","ofdfdfo","offfffo","ofdfdfo",".offfo."]},
    fist:{a:[3,3],r:[".oooo.","olffdo","ofdfdo","offfdo","ofdfdo",".oooo."]},
    grip:{a:[2,2],r:[".ooo.","olfdo","ofdfo","offdo",".ooo."]},
    point:{a:[3,6],r:["..oo..",".olo..",".ofo..",".ofdo.","olfdfo","offfdo","ofdfdo",".oooo."]},
    rest:{a:[1,2],r:[".o.o.o.","olfdfdfo","offfffdo",".oooooo."]}
  }
};
function hstamp(P,tp,x,y,s,flip){
  const W=tp.r[0].length;
  for(let j=0;j<tp.r.length;j++)for(let i=0;i<W;i++){
    const ch=tp.r[j][flip?W-1-i:i];if(ch==='.')continue;
    P(x+i,y+j,1,1,ch==='o'?s.o:ch==='l'?s.l:ch==='d'?s.d:ch==='p'?s.p:s.c)}
}
/* just a hand, its anchor on (x,y) */
function handAt(x,y,s,pose='open',o={}){
  return; /* hands are switched off: nothing draws a paw, hand or wing any more */
  const P=o.P||px,tp=(HT[s.k]||HT.paw)[pose]||HT.paw.open,W=tp.r[0].length,ax=o.flip?W-1-tp.a[0]:tp.a[0];
  hstamp(P,tp,Math.round(x)-ax,Math.round(y)-tp.a[1],s,o.flip);
}
/* the whole limb. Returns the elbow. */
function armHand(sx,sy,hx,hy,s,pose,o={}){
  return[sx,sy]; /* switched off: no arms, hands or wings are drawn; the props and actions still play */
  const P=o.P||px,w=o.w||s.t,[ex,ey]=armElbow(sx,sy,hx,hy,o.bend==null?1:o.bend),wing=s.k==='wing',pts=[];
  const seg=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)pts.push([Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n)])};
  seg(sx,sy,ex,ey);seg(ex,ey,hx,hy);
  const N=pts.length,cuff=s.sl?Math.floor(N*.8):-1;
  const wd=i=>wing?Math.max(w-1,Math.round(w+1-i/N*2)):w, sq=(x,y,q,c)=>P(x-(q>>1),y-(q>>1),q,q,c);
  /* 1. outline */
  pts.forEach(([x,y],i)=>sq(x,y,wd(i)+2,i<cuff?s.so:s.o));
  sq(sx,sy,wd(0)+4,s.sl?s.so:s.o); /* the shoulder cap */
  /* 2. fill: sleeve up to the cuff, then the character's own fur or skin */
  pts.forEach(([x,y],i)=>{
    let c=i<cuff?s.sl:s.c;
    if(i>=cuff&&i<cuff+2)c=s.cf;
    else if(wing&&i%4===3)c=s.d; /* feather barring */
    sq(x,y,wd(i),c)});
  sq(sx,sy,wd(0)+2,s.sl||s.c);
  /* 3. a light edge on top and a shadow underneath, so it reads as round */
  pts.forEach(([x,y],i)=>{const q=wd(i),h=i<cuff?mix(s.sl,'#ffffff',.2):s.l,sh=i<cuff?shade(s.sl,.8):s.d;
    P(x-(q>>1),y-(q>>1),1,1,h);P(x-(q>>1)+q-1,y-(q>>1)+q-1,1,1,sh)});
  if(pose)handAt(hx,hy,o.hand||s,pose,o);
  return[ex,ey];
}

/* ---- first-person hands (the bed scene: your own hands on the quilt, fingers toward the dog) ----
   pal = {s skin, h highlight, d shade, n nail}. rt = 1 puts the thumb on the left (a right hand), 0 on the right (a left hand).
   (x,y) is the top-left of the 11 x 13 hand; the thumb sticks out 3 more pixels to the side. */
const POV=[
"...nn......",
"nn.hs.nn...",
"hs.hs.hs...",
"hs.hs.hs.nn",
"hs.hs.hs.hs",
"hs.sd.sd.hs",
"hhsssssssds",
"hsssssssssd",
"ssssssssssd",
"dsssssssssd",
".dsssssssd.",
"..dsssssd..",
"...ddddd..."];
const POVT=[".hs",".hs","hss","hsd","ssd","dd."]; /* the thumb, drawn to the left; mirrored for the other side */
function povHand(P,x,y,rt,pal){
  const c={s:pal.s,h:pal.h,d:pal.d,n:pal.n};
  POV.forEach((row,j)=>{[...row].forEach((ch,i)=>{if(ch!=='.')P(x+(rt?i:i),y+j,1,1,c[ch])})});
  /* the thumb: three pixels out from the side of the palm, angled up toward the fingers */
  POVT.forEach((row,j)=>{[...row].forEach((ch,i)=>{if(ch==='.')return;
    const tx=rt?x-3+i:x+10+(2-i);P(tx,y+6+j,1,1,c[ch])})});
}
