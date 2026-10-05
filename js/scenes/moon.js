/* Scene: Moon base with a tiny astronaut and Earth in the sky. Draws with px(x,y,w,h,color); s = time-of-day palette. */
function drawMoon(s){
  const blink=Face.blink(),W='#e8eef8',G=byTime({day:'#b8b8c8',sunset:'#a89098',night:'#7a7a90',dawn:'#a8a0b0',dusk:'#8a7a8a'}),D='#5a5a70',lk=ev(36,8,11)>=0,wv=ev(40,8,5)>=0; /* idle: looks up at Earth, sometimes waves */
  px(0,0,160,60,'#05060f');
  for(let i=0;i<40;i++)px((i*53+5)%160,(i*29+3)%56,1,1,(i+tick)%7?'#fff':'#05060f');
  if(tick%13<3)px(20+(tick%13)*6,6+(tick%13)*3,3,1,'#fff');
  for(let dy=-14;dy<=14;dy++){const w=Math.round(Math.sqrt(196-dy*dy));px(122-w,22+dy,2*w,1,'#2a6ac8')}
  px(114,18,6,4,'#4aa860');px(124,26,8,4,'#4aa860');px(118,28,4,3,'#4aa860');px(128,15+(tick%2),6,1,'#fff');
  px(0,60,160,30,G);px(0,60,160,1,'#ffffff40');
  [[18,68,22],[112,76,26],[60,83,16]].forEach(([x,y,w])=>{px(x,y,w,3,D);px(x+2,y-1,w-4,1,D)});
  px(138,48,1,18,'#ccc');px(139,48,12,7,'#d9798f');
  px(79,22,2,6,'#aab4c8');px(78,20,4,3,tick%2?'#ff6a8a':'#7a3a4a');
  CH.b();
  if(PC){px(70,44,20,10,W);drawChar(PC,64,26,2,{maxRow:11});helmet(80,38,18)}else{
  px(68,28,24,24,W);px(72,32,16,14,'#1c2a5a');px(74,34,4,3,'#7aa8ff');
  px(76,(blink?41:39)-(lk?1:0),2,blink?1:3,'#f3e3c8');px(83,(blink?41:39)-(lk?1:0),2,blink?1:3,'#f3e3c8');
  Face.mouth(px,77,43,{w:6,lip:'#f3e3c8',inn:'#a8506a',maxH:3});
  }
  px(66,52,28,22,W);px(72,56,16,8,'#c8d0e0');px(74,58,3,3,tick%2?'#ff6a6a':'#7a3a3a');px(80,58,3,3,'#7aff9a');
  const ay=wv?42+(tick%2)*2:54;px(58,54,8,16,W);px(94,ay,8,16,W);px(58,68,8,4,'#d9798f');px(94,ay+14,8,4,'#d9798f');
  px(68,74,10,10,W);px(82,74,10,10,W);px(66,82,14,4,'#8a9ab8');px(80,82,14,4,'#8a9ab8');
  CH.e();
  if(thinking){for(let i=0;i<=tick%3;i++)px(96+i*5,18,3,3,'#f3e3c8')}
}
SCENES.moon={label:"Moon base with an astronaut",icon:"🌙",name:"Comet",setting:"on a quiet moon base, talking over the radio with Earth hanging in the sky",
  prompt:"You are {pet}, an astronaut on a quiet moon base, talking with the person over the radio, Earth hanging in the sky. Calm, dry and a little wistful, with an understated sense of humor. Speak plainly. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*radio crackles* Base here. Earth looks clear tonight. How are things down there?",
  back:"*static, then a clear line* Good to hear you again.",
  hot:[{r:[56,18,48,68],say:["*adjusts the helmet*","*a short nod*"]},{r:[104,4,36,36],say:["*looks up at Earth for a moment*"]},{r:[134,44,18,22],say:["*glances at the flag*"]}],
  draw:drawMoon};
