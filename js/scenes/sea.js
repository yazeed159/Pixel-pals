/* Scene: Underwater with one glowing jellyfish, a shipwreck and a quiet sea floor. Kept deliberately calm: a slow drift, a few bubbles, no other creatures.
   Draws with px(x,y,w,h,color); s = time-of-day palette. */
function drawSea(s){
  const T=TM,B=byTime({day:['#4ab8d8','#2a8ab8','#1a6a9a'],sunset:['#3a6a9a','#2a4a7a','#1e2f5a'],night:['#12335a','#0c2347','#08122a'],dawn:['#6ab0c8','#4a8aa8','#2a5a80'],dusk:['#2a4a7a','#1e3060','#10183a']});
  const DK='#2b1d2e',bob=Math.floor(tick/4)%2,blink=Face.blink(),sand=byDay('#3a4a5a','#c9b88a');
  B.forEach((c,i)=>px(0,i*30,160,30,c));
  [20,70,118].forEach(x=>{for(let y=0;y<60;y++)px(x+(y>>2),y,8,1,'#ffffff10')});
  px(0,78,160,12,sand);for(let x=0;x<160;x+=7)px(x,80+(x*3)%7,4,1,'#ffffff18');
  px(106,64,40,12,'#4a342c');px(104,68,4,8,'#4a342c');for(let x=108;x<144;x+=6)px(x,66,1,9,'#3a2a22');px(118,68,5,5,'#ffd27a88');px(126,68,5,5,'#ffd27a88');
  px(124,42,3,24,'#4a342c');px(127,46,14,12,'#c8b89888');px(120,50,4,1,'#4a342c');
  px(14,70,16,10,'#8a5a2a');px(14,70,16,3,'#a87a3a');px(21,72,2,3,'#ffd27a');
  [[44,'#ff9a4a'],[92,'#ff7a8a'],[150,'#ffd27a']].forEach(([x,c])=>{px(x,84,5,2,c);px(x+2,82,1,5,c);px(x-1,83,7,1,c)});
  [[8,'#ff7a8a',16],[22,'#ffb04a',10],[48,'#a98af0',12],[86,'#ff7a8a',9],[142,'#a98af0',18],[152,'#ffb04a',11]].forEach(([x,c,h])=>{px(x,78-h,4,h,c);px(x-2,78-h,2,4,c);px(x+4,78-h+3,2,4,c)});
  [56,64,100,108,132].forEach((x,k)=>{for(let y=0;y<16;y++)px(x+Math.round(Math.sin((y+tick/3+k)/3)*2),79-y,2,1,'#3aa86a')});
  if(T==='night'||T==='dusk'){ctx.fillStyle=`rgba(255,150,230,${ev(24,6,3)>=0?.2:.1})`; /* idle: the glow pulses */ctx.fillRect(56,16,48,56)}
  CH.b();
  if(PC){drawChar(PC,64,24+bob*2,2);helmet(80,40+bob*2,19)}else{
  for(let k=0;k<6;k++){const x=68+k*5;for(let y=0;y<24;y++)px(x+Math.round(Math.sin((y+tick/3+k*2)/3)*2),38+bob+y,1,1,k%2?'#ff9ae0':'#c870d8')}
  for(let y=0;y<14;y++){const w=Math.round(30*Math.sqrt(1-((13-y)/14)**2));px(80-(w>>1),22+y+bob,w,1,y<3?'#ffc8f0':'#e890d8')}
  px(72,30+bob,16,5,'#ffd8f8');px(70,27+bob,3,2,'#ffffff99');
  px(73,(blink?34:31)+bob,2,blink?1:3,DK);px(85,(blink?34:31)+bob,2,blink?1:3,DK);px(70,34+bob,3,2,'#ff9ab0');px(87,34+bob,3,2,'#ff9ab0');
  Face.mouth(px,78,36+bob,{w:4,lip:DK,maxH:3});
  }
  CH.e();
  for(let i=0;i<3;i++)px(30+i*48+((Math.floor(tick/3)+i)%3),86-((tick+i*27)%80),2,2,'#ffffff66'); /* a few slow bubbles */
  for(let i=0;i<6;i++)px((i*37)%160,(i*23+Math.floor(tick/4))%76,1,1,'#ffffff33');
  if(thinking){for(let i=0;i<=tick%3;i++)px(98+i*5,14,3,3,'#f3e3c8')}
}
SCENES.sea={label:"Underwater with a jellyfish",icon:"🪼",name:"Luma",setting:"in a calm sea, floating side by side (you both breathe easily underwater)",
  prompt:"You are {pet}, a slow-drifting, faintly glowing jellyfish in a calm sea, keeping the person company as they float beside you. Speak calmly and simply, in a quiet, unhurried way. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*glows faintly* It's calm down here tonight. What brought you?",
  back:"*drifts closer* You came back. Stay as long as you like.",
  hot:[{r:[62,18,36,40],say:["*the glow brightens a little*","*drifts closer*"]},{r:[12,68,20,12],say:["*the chest catches the light. It looks empty.*"]},{r:[102,60,46,18],say:["*bubbles rise from the old hull*"]}],
  draw:drawSea};
