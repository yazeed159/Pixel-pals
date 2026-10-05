/* The pixel dog sprite, fur colors and dog() drawing helper (used by the bed scene). */
const PAL={o:'#2b1d2e',b:'#c98f56',d:'#8a5a36',w:'#f3e3c8',e:'#2b1d2e',n:'#2b1d2e'};
const DOG=[
"................",
"..dd........dd..",
".dddd......dddd.",
".dddbbbbbbbbddd.",
".ddbbbbbbbbbbdd.",
"..bbbebbbbebbb..",
"..bbbbbbbbbbbb..",
"...bbwwwwwwbb...",
"...bwwwnnwwwb...",
"...bwwwwwwwwb...",
"....bbwwwwbb....",
"...bbbbbbbbbb...",
"..bbbwwwwwwbbb..",
"..bbbwwwwwwbbb..",
"..bbbbbbbbbbbb..",
"..wwbb....bbww.."];
const FUR={tan:['#c98f56','#8a5a36'],grey:['#9a9aa8','#62627a'],black:['#4a4458','#2e2a3a'],cream:['#e8d3a8','#b99a6a']};
function dog(X,Y,k=2){
  const F=FUR[cfg.fur]||FUR.tan,wag=tick%2,ph=Face.phase(0),st=Face.state(0),lid=ph===2?0:(ph===1||st.e==='laugh'||st.e==='grin')?1:2;
  const col=c=>c==='b'?F[0]:c==='d'?F[1]:PAL[c];
  DOG.forEach((row,j)=>{
    [...row].forEach((c,i)=>{if(c==='.')return;
      if(c==='e'){px(X+i*k,Y+j*k,k,k,F[0]);if(lid){const h=lid===1?Math.max(1,k>>1):k;px(X+i*k,Y+j*k+k-h,k,h,PAL.e)}return}
      px(X+i*k,Y+j*k,k,k,col(c))});
  });
  Face.mouth(px,X+8*k-1.5*k,Y+9*k+k/2,{w:6,q:k/2,maxH:3,lip:PAL.o,inn:'#7a2f3a',soft:1,st});
  px(X+14*k,Y+(wag?11:13)*k,k,2*k,F[1]);px(X+15*k,Y+(wag?9:12)*k,k,3*k,F[1]);
  if(thinking){for(let i=0;i<=tick%3;i++)px(X+18*k+i*Math.round(2.5*k),Y-3*k,Math.round(1.5*k),Math.round(1.5*k),'#f3e3c8')}
}
