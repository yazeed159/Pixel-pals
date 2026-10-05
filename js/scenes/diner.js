/* Scene: A diner at 3am. Night-shift owl behind the counter. Draws with px(x,y,w,h,color); s = time-of-day palette. */
function drawDiner(s){
  const nn=gesture('neon'),bl=gesture('bell'),flick=tick%9===0||(nn>=0&&[1,0,1,1,0,0,1,0,1,0,1,1][nn]===1),pour=ev(38,6,8)>=0; /* idle: the owl tops up your coffee */
  /* tiled back wall */
  px(0,0,160,56,'#2c6a72');for(let y=0;y<56;y+=6)px(0,y,160,1,'#265b62');for(let x=0;x<160;x+=8)px(x,0,1,56,'#265b62');
  px(0,40,160,16,'#8a2f3a');px(0,40,160,1,'#c9c0b0');
  /* window with the neon sign and street */
  px(6,8,56,34,'#14101e');skyfill(8,10,52,30,s);
  px(8,34,52,6,'#1c1730');px(48,18,2,18,'#2a2a3a');px(44,16,10,3,'#2a2a3a');px(45,19,8,2,'#ffd98a');
  ctx.fillStyle='rgba(255,217,138,.12)';ctx.fillRect(38,19,22,16);
  for(let i=0;i<8;i++)px(8+(i*13+tick*3)%52,10+(i*17+tick*5)%26,1,2,'#9ac8ff44');
  text('OPEN',14,15,flick?'#7a2f3a':'#ff5a6a');px(13,14,17,1,flick?'#4a1f2a':'#ff5a6a88');px(13,21,17,1,flick?'#4a1f2a':'#ff5a6a88');
  px(29,40,2,2,'#14101e');
  /* wall clock stuck at 3:00 and the menu board */
  px(74,8,14,14,'#c9c0b0');px(75,9,12,12,'#f3e3c8');px(80,10,1,5,'#2b1d2e');px(81,15,4,1,'#2b1d2e');px(80,15,2,2,'#d94a5a');
  px(100,8,48,26,'#2b1d2e');px(102,10,44,22,'#3a3f4a');
  text('PIE',104,13,'#f3e3c8');text('3',124,13,'#ffd27a');for(let y=21;y<30;y+=4){px(104,y,22,1,'#9aa0b0');px(130,y,12,1,'#9aa0b0')}
  /* pie case */
  px(110,38,38,18,'#c9c0b0');px(112,40,34,14,'#5a3a2a');px(113,41,32,6,'#e8c46a33');
  px(115,42,8,5,'#d9a45a');px(125,42,8,5,'#c94a5a');px(135,42,8,5,'#e8c46a');px(115,49,8,5,'#a85a3a');px(125,49,8,5,'#d9a45a');px(135,49,8,5,'#c94a5a');
  /* the owl waitress */
  const owl={species:'owl',c1:'#a07a4e',c2:'#f0dcb4'};
  CH.b();
  if(PC)drawChar(PC,64,24,2);
  else{drawChar(owl,64,24,2);
    px(69,26,22,4,'#f3e3c8');px(69,29,22,1,'#d94a5a');px(76,24,8,3,'#f3e3c8');  /* paper cap */
    px(72,48,16,3,'#d9798f');px(75,52,6,3,'#fff');px(76,53,2,1,'#d94a5a')}       /* collar + name tag */
  CH.e();
  /* coffee pot she is holding */
  const py=pour?44+(tick%2):46,pxx=pour?92:100;
  px(pxx,py,8,12,'#2b1d2e');px(pxx+1,py+3,6,8,'#6a3a22');px(pxx+8,py+2,2,8,'#2b1d2e');px(pxx-1,py-2,10,2,'#9aa0b0');
  if(pour)for(let i=0;i<6;i++)px(91-i*2,py+9+i*4,1,3,'#6a3a22');
  /* back ledge hides her feet */
  px(0,56,160,6,'#4a2228');px(0,56,160,1,'#c9c0b0');
  for(let i=0;i<6;i++)px(8+i*9,52,6,4,i%2?'#f3e3c8':'#d9d0c0');
  /* counter top, a mug of coffee, and a few things on it */
  px(0,62,160,28,'#d8d0c0');for(let i=0;i<40;i++)px((i*37)%160,64+(i*19)%24,1,1,'#b8b0a0');
  px(0,62,160,2,'#f3efe6');px(0,88,160,2,'#9aa0b0');
  px(74,70,12,9,'#f3e3c8');px(86,72,3,5,'#f3e3c8');px(75,70,10,3,'#4a2a1a');px(70,79,20,2,'#c9c0b0');
  px(79,65-(tick%3),1,3,'#ffffff88');px(82,66-((tick+1)%3),1,3,'#ffffff66');
  px(112,68,10,9,'#aab0c0');px(113,69,8,2,'#d9dce6');px(130,66,4,10,'#d94a4a');px(130,64,4,2,'#f3e3c8');px(138,68,5,8,'#e8e8f0');px(139,66,3,2,'#9aa0b0');
  px(20,70,18,10,'#e8e0d0');px(22,72,14,1,'#b8b0a0');px(22,75,10,1,'#b8b0a0');
  const wp=gesture('wipe'); /* idle: wipes down the counter */
  if(wp>=0){const x=[66,62,56,50,44,40,46,52,58,64,58,50,44,50,58,66][wp];
    arm(70,50,x+4,60,3,PC?PC.c1:'#a07a4e');px(x,62,10,3,'#f3efe6');px(x,64,10,1,'#d9d0c0')}
  if(bl>=0){const hx=[62,58,53,56,60,56,53,56,60,64][bl],hy=[56,57,58,57,56,57,58,57,56,56][bl],by=hy===58?1:0; /* idle: rings the order-up bell */
    px(47,63,10,2,'#b8962a');px(49,60+by,6,3,'#e8c46a');px(51,58+by,2,2,'#e8c46a');arm(70,50,hx,hy,3,PC?PC.c1:'#a07a4e')}
  if(thinking){for(let i=0;i<=tick%3;i++)px(98+i*5,16,3,3,'#f3e3c8')}
}
SCENES.diner={label:"Diner at 3am",icon:"🍳",name:"Nell",win:[8,10,52,30],setting:"in an all-night diner at 3am, you behind the counter pouring coffee and the person sitting on a stool across from you",
  prompt:"You are {pet}, a tired but warm night-shift waitress (a night owl, naturally) at an all-night diner at 3am. You have heard a thousand late-night confessions over coffee and are kind, wry and unhurried. Speak plainly, like someone leaning on the counter."+STYLE,
  greet:"*slides a mug across the counter* Coffee's fresh. Can't sleep either, huh?",
  back:"*glances up from the pot* Same stool. Coffee's on its way.",
  hot:[{r:[62,22,38,34],say:["*tops up your coffee* Mm.","*wipes the counter* Go on, hon.","*yawns* Sorry. Long shift. I'm listening."]},{r:[72,6,18,18],say:["*glances at the clock* Still three. It's always three."]},{r:[108,36,42,22],say:["*taps the glass* Last slice of the night. It's yours."]},{r:[6,8,56,34],say:["*the neon buzzes and the rain streaks past the window*"]}],
  noLate:true,gest:{wipe:16,neon:12,bell:10},draw:drawDiner};
