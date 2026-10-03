/* Scene: A lighthouse gallery with a grey sea-dog keeper. Draws with px(x,y,w,h,color); s = time-of-day palette. */
function drawLighthouse(s){
  const open=talking&&tick%2,gl=ev(52,12,9); /* idle: a gull flies past */
  skyfill(0,0,160,56,s);
  if(stars())for(let i=0;i<22;i++)px((i*43+9)%160,(i*17+4)%44,1,1,(i+tick)%6?'#fff':s.sky);
  px(122,10,6,6,s.moon);px(123,9,4,8,s.moon);px(121,11,8,4,s.moon);
  /* sea and the moon's path */
  const sea=TM==='day'?['#3a8ab8','#2a6a98']:TM==='dawn'?['#5a7aa8','#3a5a88']:TM==='sunset'?['#4a5a8a','#2a3a6a']:['#12284f','#0a1a3a'];
  px(0,56,160,12,sea[0]);for(let y=56;y<68;y+=3)px(0,y,160,1,sea[1]);
  for(let y=0;y<10;y++)px(116+((y*3+tick)%5)-2,57+y,10-y%3,1,'#ffffff30');
  for(let i=0;i<10;i++)px((i*31+tick*(1+i%3))%160,57+(i*7)%10,3,1,'#ffffff44');
  const sx=((tick>>1)%210)-20;px(sx,54,3,1,'#c8c0b0');px(sx+1,53,1,1,'#ff6a6a');px(sx+2,54,1,1,'#7affc8'); /* distant ship */
  if(gl>=0){const gx=gl*14-6;px(gx,14+(gl%2),2,1,'#e8e0d0');px(gx+2,13,2,1,'#e8e0d0');px(gx-2,13,2,1,'#e8e0d0')}
  /* the lamp room and its beam */
  px(8,6,44,56,'#2a2a3a');px(10,8,40,52,'#3a3a4e');px(12,10,36,48,'#1c1730');
  const pulse=tick%10<6;
  px(20,18,20,30,pulse?'#ffe9a0':'#ffd27a');px(24,22,12,22,'#fff6d0');px(28,14,4,4,'#e8c46a');
  for(let x=12;x<48;x+=9)px(x,10,2,48,'#3a3a4e');
  px(6,60,48,4,'#4a4a5a');
  const ey=30+Math.round(20*Math.sin(tick/7));
  ctx.fillStyle=TM==='day'?'rgba(255,240,170,.06)':'rgba(255,240,170,.15)';
  ctx.beginPath();ctx.moveTo(40,30);ctx.lineTo(160,ey-14);ctx.lineTo(160,ey+14);ctx.closePath();ctx.fill();
  /* railing and the deck */
  px(0,64,160,26,'#5a4030');for(let y=68;y<90;y+=5)px(0,y,160,1,'#4a3224');for(let x=0;x<160;x+=24)px(x,64,1,26,'#4a3224');
  px(0,62,160,3,'#8a8a9a');for(let x=2;x<160;x+=14)px(x,52,2,12,'#7a7a8a');px(0,52,160,2,'#9a9aaa');
  /* the keeper on a crate */
  const dg={species:'dog',c1:'#8a8a98',c2:'#eae4d4'};
  px(78,66,50,8,'#6a4a30');px(78,66,50,2,'#8a6a42');
  if(PC)drawChar(PC,88,34,2);
  else{drawChar(dg,88,34,2);
    px(91,34,26,4,'#f3e3c8');px(91,37,26,2,'#2a3a7a');px(98,31,12,3,'#f3e3c8');    /* sailor cap */
    px(90,56,28,10,'#e8b840');px(90,56,3,10,'#c89830');px(115,56,3,10,'#c89830')}  /* yellow raincoat */
  px(132,56,6,10,'#9aa0b0');px(133,54,4,2,'#2b1d2e');px(130,70,10,6,'#f3e3c8');px(131,70,8,2,'#4a2a1a');px(134,64-(tick%3),1,3,'#ffffff77');
  if(thinking){for(let i=0;i<=tick%3;i++)px(122+i*5,28,3,3,'#f3e3c8')}
}
SCENES.lighthouse={label:"Lighthouse at night",icon:"🗼",name:"Skipper",outdoor:true,setting:"on the gallery of a lighthouse at night, the lamp turning behind you and the sea below",
  prompt:"You are {pet}, a grey old sea-dog who keeps a lighthouse, sitting on the gallery with the person while the lamp turns. Gruff on the outside, patient and kind underneath, speaking simply, with the occasional sea expression. You think of the light as something that is simply there for anyone out in the dark."+STYLE,
  greet:"*pours something hot from a thermos* The light's turning. Sit a while. What's out there tonight?",
  back:"*nods toward the crate* Saved your spot.",
  hot:[{r:[86,30,36,38],say:["*tugs his cap* Mm.","*pours you a cup* Warm that up.","*watches the sea* Steady, now."]},{r:[8,6,44,56],say:["*the beam sweeps slowly out over the water*"]},{r:[0,56,160,10],say:["*far below, the waves keep time*"]}],
  draw:drawLighthouse};
