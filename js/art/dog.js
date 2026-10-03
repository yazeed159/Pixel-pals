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
  const F=FUR[cfg.fur]||FUR.tan,wag=tick%2,blink=tick%11===0,open=talking&&tick%2;
  const col=c=>c==='b'?F[0]:c==='d'?F[1]:PAL[c];
  DOG.forEach((row,j)=>{
    if(j===9&&open)row="...bwwwooowwb...";
    [...row].forEach((c,i)=>{if(c==='.')return;px(X+i*k,Y+j*k,k,k,c==='e'&&blink?F[0]:col(c))});
  });
  px(X+14*k,Y+(wag?11:13)*k,k,2*k,F[1]);px(X+15*k,Y+(wag?9:12)*k,k,3*k,F[1]);
  if(thinking){for(let i=0;i<=tick%3;i++)px(X+18*k+i*Math.round(2.5*k),Y-3*k,Math.round(1.5*k),Math.round(1.5*k),'#f3e3c8')}
}
