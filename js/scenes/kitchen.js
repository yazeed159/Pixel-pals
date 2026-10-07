/* Scene: A quiet kitchen late at night with a rabbit. Draws with px(x,y,w,h,color); s = time-of-day palette. */
const KY=[0,0,1,1,2,2,2,2,1,1,0,0]; /* how far the rabbit dips during a yawn */
function drawKitchen(s){
  const stir=ev(30,8,2)>=0,sp=gesture('sip'),ck=gesture('cookie'),ke=gesture('kettle'),yw=gesture('yawn'); /* idle: stirs the mug, and now and then picks it up for a sip */ /* idle: stirs the mug, ears twitch */
  px(0,0,160,64,'#6a7e8e');for(let y=0;y<64;y+=8)px(0,y,160,1,'#5c707f');for(let x=0;x<160;x+=8)px(x,0,1,64,'#5c707f');
  px(0,40,160,24,'#7f9aa6');for(let y=40;y<64;y+=6)px(0,y,160,1,'#6d8894');for(let x=0;x<160;x+=6)px(x,40,1,24,'#6d8894');
  /* window with a herb on the sill */
  px(94,10,36,30,'#14101e');skyfill(96,12,32,26,s);px(110,12,2,26,'#14101e');px(96,24,32,2,'#14101e');
  if(stars()){px(100,16,1,1,'#fff');px(122,20,1,1,tick%2?'#fff':s.sky)}px(116,14,4,4,s.moon);
  px(92,40,40,3,'#c9b898');px(100,34,8,6,'#a85a4a');px(101,28,2,6,'#4aa86a');px(105,26,2,8,'#4aa86a');px(103,30,2,4,'#4aa86a');
  /* upper cabinets and the wall clock */
  px(0,4,52,24,'#8a6a4a');px(2,6,24,20,'#7a5a3a');px(28,6,22,20,'#7a5a3a');px(24,14,2,4,'#e8c46a');px(28,14,2,4,'#e8c46a');
  px(60,6,14,14,'#e8e0d0');px(61,7,12,12,'#f3efe6');px(66,8,1,5,'#2b1d2e');px(66,13,4,1,'#2b1d2e');
  /* fridge */
  px(132,6,26,60,'#c8d2d8');px(132,6,26,2,'#e8eef2');px(132,28,26,2,'#9aa4aa');px(136,12,2,12,'#9aa4aa');px(136,34,2,16,'#9aa4aa');
  px(142,12,6,5,'#d94a4a');px(148,20,5,4,'#e8c46a');px(141,36,7,9,'#f3efe6');px(143,38,3,1,'#9aa0b0');px(143,41,3,1,'#9aa0b0');
  /* stove and kettle */
  px(6,46,40,22,'#3a3f4a');px(6,46,40,2,'#6a707e');px(10,50,12,8,'#2a2f3a');px(26,50,12,8,'#2a2f3a');px(12,52,8,4,'#ff8a3a');
  px(10,36,18,10,'#9aa4aa');px(12,34,14,3,'#9aa4aa');px(8,38,3,4,'#9aa4aa');px(28,38,3,2,'#6a707e');px(16,31,6,3,'#2b1d2e');
  for(let i=0;i<3;i++)px(16+((tick+i)%3),28-i*4-(tick%2),2,2,'#ffffff77');
  if(ke>=0){px(16,29+(ke%2),6,2,'#2b1d2e');for(let i=0;i<8;i++)px(13+((i*5+tick)%6),26-i*3-(ke%2),2+(i>4?1:0),2,'#ffffffcc')} /* idle: the kettle whistles */
  /* warm pendant light */
  px(80,0,1,10,'#2b1d2e');px(74,10,13,5,'#e8c46a');px(72,14,17,2,'#ffe9a0');
  [[56,16,52,50],[62,24,40,40]].forEach(g=>{ctx.fillStyle=`rgba(${s.glow},.06)`;ctx.fillRect(...g)});
  /* the rabbit */
  const rb={species:'rabbit',c1:'#e8dcd0',c2:'#fff4ec'};
  CH.b();
  if(PC)drawChar(PC,64,30,2);
  else{drawChar(rb,64,30,2);
    px(70,52,20,12,'#d9798f');px(72,52,3,4,'#e8dcd0');px(85,52,3,4,'#e8dcd0');px(76,56,8,3,'#c0607a')}   /* apron */
  CH.e();
  /* table with two mugs and cookies */
  px(30,64,100,5,'#9a6a3a');px(30,64,100,1,'#b88a52');px(34,69,92,3,'#7a5028');px(36,72,5,18,'#7a5028');px(119,72,5,18,'#7a5028');
  if(sp<0){px(94,58,10,7,'#e8c46a');px(104,60,3,4,'#e8c46a');px(95,58,8,2,'#4a2a1a')}
  else{const mx=[94,94,92,88,82,77,76,76,76,78,84,90,94],my=[58,58,56,53,50,47,46,46,46,48,53,57,58],x=mx[sp],y=my[sp],hd=placeHand();
    armHand(88,55,x+12,y+4,hd); /* the arm, then the mug, then the paw wrapped around its handle */
    px(x,y,10,7,'#e8c46a');px(x+10,y+2,3,4,'#e8c46a');px(x+1,y,8,2,'#4a2a1a');handAt(x+12,y+4,hd,'fist');
    if(sp>3)px(x+3+(tick%2),y-3,1,2,'#ffffff77')}
  px(58,59,10,6,'#f3e3c8');px(68,61,3,3,'#f3e3c8');px(59,59,8,2,'#4a2a1a');
  if(stir&&sp<0){px(98,50+(tick%2),1,8,'#c9c0b0')}
  if(sp<0){px(97,52-(tick%3),1,3,'#ffffff77');px(101,53-((tick+1)%3),1,3,'#ffffff55')}
  px(110,62,16,3,'#f3e3c8');if(ck<0)px(112,60,4,3,'#c8803a');px(118,60,4,3,'#d9983a');
  if(ck>=0){const P=[[112,60],[108,56],[102,52],[95,50],[88,48],[82,47],[81,47],[81,47],[81,47],[81,47],[88,49],[98,53],[108,58],[112,60]][ck],w=ck===8||ck===9?3:4,hd=placeHand(); /* idle: nibbles a cookie */
    armHand(88,55,P[0]+5,P[1]+2,hd);px(P[0],P[1],w,3,'#c8803a');handAt(P[0]+5,P[1]+2,hd,'grip');
    if(ck>=7&&ck<=11)px(81+(ck%3),50+(ck-6)*2,1,1,'#c8803a')}
  if(yw>=0){const P=[[88,54],[84,50],[80,47],[78,46],[78,46],[78,46],[78,46],[78,46],[79,47],[82,50],[86,54],[89,56]][yw],dy=KY[yw]; /* idle: a sleepy yawn behind a paw */
    armHand(88,55,P[0]+2,P[1]+2+dy,placeHand(),'fist')}
  px(0,72,160,18,'#5a4a3a');px(0,72,160,1,'#4a3a2a');for(let x=0;x<160;x+=16)px(x,73,1,17,'#4a3a2a');
  px(30,72,100,2,'#00000030');
  if(thinking){for(let i=0;i<=tick%3;i++)px(98+i*5,20,3,3,'#f3e3c8')}
}
SCENES.kitchen={label:"Quiet kitchen",icon:"🍵",name:"Clover",win:[96,12,32,26],setting:"in a quiet kitchen late at night, the kettle just boiled and two mugs on the table between you",
  prompt:"You are {pet}, a gentle rabbit in an apron, up late in a quiet kitchen with the person, the kettle just boiled. You notice small things, speak softly, and make people feel there is no rush. You offer tea and company more than advice."+STYLE,
  greet:"*sets down two mugs* Kettle just boiled. Couldn't sleep either? Sit, sit.",
  back:"*nudges a mug toward your chair* It's still warm.",
  hot:[{r:[60,26,40,40],say:["*ears twitch* Mm?","*stirs her tea* Take your time.","*smiles* There's no rush."]},{r:[8,30,40,38],say:["*the kettle ticks as it cools*"]},{r:[130,6,28,60],say:["*the fridge hums, then goes quiet*"]},{r:[56,56,76,12],say:["*pushes the cookie plate toward you*"]}],
  gest:{sip:13,cookie:14,kettle:14,yawn:12},gp:(n,f)=>n==='yawn'?KY[f]:0,draw:drawKitchen};
