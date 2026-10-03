/* Character sprites: six species you can use anywhere, drawn from 16x16 grids.
   Letters: b = main fur, d = darker fur (auto), w = light/accent color, p = pink, y = yellow, e = eye, n = nose.
   Each grid is written as its left half and mirrored. A character is {species, c1 (fur), c2 (accent), name, persona, greet}. */
const mir=a=>a.map(r=>r+[...r].reverse().join(''));
const SPR={
  dog:{g:DOG,mouth:[7,9],tail:'dog'},
  cat:{g:mir(["........","..bb....","..bpb...","..bbbbbb",".bbbbbbb",".bbbebbb",".bbbbbbb","..bbbbbn","..bbbwww","...bbbbw","....bbbb","...bbbbb","..bbbwww","..bbbwww","..bbbbbb","..wwbb.."]),mouth:[7,8],ear:3,tail:'cat'},
  fox:{g:mir(["........","..dd....","..dbd...","..bbbbbb",".bbbbbbb",".bbbebbb",".bwbbbbb","..wwbbbn","..wwwwww","...wwwww","....bwww","...bbbbb","..bbbwww","..bbbwww","..bbbbbb","..ddbb.."]),mouth:[7,8],ear:3,tail:'fox'},
  rabbit:{g:mir(["....bb..","....bb..","....bp..","....bp..","....bbbb","...bbbbb","...bbebb","...bbbbn","...bbwww","....bbww","....bbbb","...bbbbb","..bbbwww","..bbbwww","..bbbbbb","..wwbb.."]),mouth:[7,8],ear:4,tail:'rabbit'},
  bear:{g:mir(["........","..bb....",".bbbb...",".bpbbbbb",".bbbbbbb",".bbbebbb",".bbbbbbb","..bbbwww","..bbwwwn","..bbwwww","...bbbww","...bbbbb","..bbbwww","..bbbwww","..bbbbbb","..bbbb.."]),mouth:[7,9],tail:'bear'},
  owl:{g:mir(["........","..d.....","..dd....","..bbbbbb",".bbbbbbb",".bwwwwbb",".bweewbb",".bwwwwby",".bbbbbby","..bbbbbb","...bbbbb","...bbwww","..bbwwbw","..bbwwwb","..bbbwww","...yy..."]),eb:'w',tail:'none'}
};
const shade=(h,f=.66)=>'#'+hex(h).map(v=>Math.round(v*f).toString(16).padStart(2,'0')).join('');
const cpal=c=>({b:c.c1,d:c.sh||shade(c.c1),w:c.c2,p:'#e89aa8',y:'#e8b84a',e:'#2b1d2e',n:'#2b1d2e',o:'#2b1d2e'});
const idleLook=()=>{const r=ev(23,6,4);return r<0?[0,0]:[[1,0],[-1,0],[0,-1],[1,-1]][evS%4]};

/* paint a character onto any 2d context. o: look [dx,dy], maxRow (draw only the top rows), noTail */
function paint(g,c,X,Y,k,o={}){
  const S=SPR[c.species]||SPR.dog,P=cpal(c),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},
    blink=tick%11===0,open=talking&&tick%2,lk=o.look||idleLook(),flick=ev(31,4,9)>=0,wag=tick%2,mr=o.maxRow||16,eb=P[S.eb||'b'];
  S.g.forEach((row,j)=>{if(j>=mr)return;[...row].forEach((ch,i)=>{if(ch==='.')return;
    const dx=(S.ear&&j<S.ear&&i>=8&&flick)?1:0;
    R(X+(i+dx)*k,Y+j*k,k,k,ch==='e'?eb:(P[ch]||P.b))})});
  if(!blink)S.g.forEach((row,j)=>{if(j>=mr)return;[...row].forEach((ch,i)=>{if(ch==='e')R(X+(i+lk[0])*k,Y+(j+lk[1])*k,k,k,P.e)})});
  if(open&&S.mouth&&mr>S.mouth[1])R(X+S.mouth[0]*k,Y+S.mouth[1]*k,2*k,k,'#7a2f3a');
  if(o.noTail||mr<16)return;
  const t=S.tail,sh=P.d;
  if(t==='dog'){R(X+14*k,Y+(wag?11:13)*k,k,2*k,sh);R(X+15*k,Y+(wag?9:12)*k,k,3*k,sh)}
  else if(t==='fox'){R(X+14*k,Y+(wag?10:12)*k,2*k,4*k,P.b);R(X+14*k,Y+(wag?14:15)*k,2*k,k,P.w)}
  else if(t==='cat'){R(X+15*k,Y+(wag?10:13)*k,k,3*k,sh);R(X+14*k,Y+(wag?9:12)*k,k,k,sh)}
  else if(t==='rabbit'){R(X+14*k,Y+13*k,2*k,2*k,P.w)}
  else if(t==='bear'){R(X+14*k,Y+13*k,k,k,sh)}
}
function drawChar(c,X,Y,k=2,o={}){
  paint(ctx,c,X,Y,k,o);
  if(o.dots&&thinking){for(let i=0;i<=tick%3;i++)px(X+18*k+i*Math.round(2.5*k),Y-3*k,Math.round(1.5*k),Math.round(1.5*k),'#f3e3c8')}
}
/* a round glass helmet / bubble drawn over a head (moon base, underwater) */
function helmet(cx,cy,r,col='#cfe8ffcc'){
  for(let a=0;a<72;a++){const t=a/72*Math.PI*2;px(Math.round(cx+r*Math.cos(t)),Math.round(cy+r*Math.sin(t)),1,1,col)}
  px(cx-Math.round(r*.6),cy-Math.round(r*.6),3,1,'#ffffffcc');px(cx-Math.round(r*.7),cy-Math.round(r*.5),1,3,'#ffffffcc');
}

/* ready-made characters anyone can be cast as in any scene */
const PRESETS=[
  {id:'p:dog',name:'Biscuit',species:'dog',c1:'#c98f56',c2:'#f3e3c8',persona:'a warm, loyal old dog who listens more than he talks'},
  {id:'p:cat',name:'Pepper',species:'cat',c1:'#6a6478',c2:'#e8d3a8',persona:'a composed, quietly witty cat with a dry sense of humor'},
  {id:'p:fox',name:'Ember',species:'fox',c1:'#e8803a',c2:'#f3e3c8',persona:'a weathered, even-tempered fox who has traveled a lot and has nothing to prove'},
  {id:'p:rabbit',name:'Clover',species:'rabbit',c1:'#e8dcd0',c2:'#fff4ec',persona:'a gentle, observant rabbit who notices small things'},
  {id:'p:bear',name:'Bruno',species:'bear',c1:'#7a4e34',c2:'#d8b890',persona:'a big, calm, slow-speaking bear with a soft heart'},
  {id:'p:owl',name:'Hoot',species:'owl',c1:'#a07a4e',c2:'#f0dcb4',persona:'a thoughtful night-owl who asks good questions'}
];
const charById=id=>PRESETS.find(p=>p.id===id)||cfg.chars.find(c=>c.id===id)||null;
/* the character cast in the current scene, or null for the scene's own default character */
const occ=()=>{const id=cfg.cast[cfg.place];return id?charById(id):null};
