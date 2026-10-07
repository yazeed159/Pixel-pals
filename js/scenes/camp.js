/* Scene: Campfire with a fox. Draws on the 160x90 canvas with px(x,y,w,h,color); s = time-of-day palette. */
function drawCamp(s){
  const SK='#e8b894',DK='#2b1d2e',OR='#e8803a',CR='#f3e3c8',blink=Face.blink();
  const C=byTime({night:['#1f3a3a','#12281f','#1a2347'],sunset:['#4a4a3a','#2a3a2a','#7a4a6a'],day:['#5a9a5a','#3a7a4a','#6aa0b8'],dawn:['#6a8a6a','#3a5a4a','#7a6a8a'],dusk:['#2f4a4a','#1a3228','#352a5a']});
  skyfill(0,0,160,58,s);px(0,46,160,12,'#ffffff18');
  if(stars())for(let i=0;i<16;i++)px((i*37+11)%160,(i*23+5)%38,1,1,(i+tick)%5?'#fff':s.sky);
  px(118,10,6,6,s.moon);px(119,9,4,8,s.moon);px(117,11,8,4,s.moon);
  for(let x=0;x<160;x++){const h=Math.round(46-(8*Math.sin(x/18)+5*Math.sin(x/7)+6));px(x,h,1,58-h,C[2])}
  px(0,56,160,34,C[0]);for(let x=3;x<160;x+=9)px(x,60+(x*7)%24,2,1,C[1]);
  const pine=(x,b,h,w)=>{for(let i=0;i<h;i++){const q=2+Math.round(i*w/h);px(x-(q>>1),b-h+i,q,1,C[1])}px(x-1,b,2,3,'#3a2619')};
  [[8,62,34,16],[24,60,26,12],[40,63,30,14],[148,62,34,16],[110,59,24,10]].forEach(a=>pine(...a));
  for(let i=0;i<20;i++)px(122+i,66-i,1,0,C[1]);
  for(let i=0;i<=20;i++)px(134-i,50+i,2*i+1,1,i%7===0?'#b85a74':'#d9798f');px(130,62,8,10,'#1a1224');
  [[48,48,64,40],[56,54,48,30],[64,60,32,22]].forEach(g=>{ctx.fillStyle=`rgba(${s.glow},${stars()?.06:.03})`;ctx.fillRect(...g)});
  px(60,62,40,6,'#5a3a2a');
  CH.b();
  if(PC)drawChar(PC,64,30,2);else{
  px(94+(tick%2),50,8,14,OR);px(96+(tick%2),46,6,6,CR);
  px(70,46,20,20,OR);px(75,48,10,14,CR);px(70,46,20,3,'#d9798f');px(74,49,4,7,'#d9798f');
  px(72,64,5,3,'#4a2a1a');px(83,64,5,3,'#4a2a1a');
  px(68,30,24,16,OR);px(68,38,6,8,CR);px(86,38,6,8,CR);px(76,38,8,8,CR);px(78,38,4,2,DK);
  px(70,20,2,2,OR);px(69,22,4,3,OR);px(68,25,6,6,OR);px(70,26,2,4,'#c85a3a');
  px(88,20,2,2,OR);px(87,22,4,3,OR);px(86,25,6,6,OR);px(88,26,2,4,'#c85a3a');
  px(73,blink?35:34,2,blink?1:2,DK);px(85,blink?35:34,2,blink?1:2,DK);
  Face.mouth(px,77,43,{w:6,lip:DK,maxH:3});
  }
  CH.e();
  if(thinking){for(let i=0;i<=tick%3;i++)px(96+i*5,16,3,3,'#f3e3c8')}
  const a=(tick%3)*2,b=((tick+1)%3)*2,c=((tick+2)%3)*2;
  px(66,76,28,4,'#5a3a2a');px(68,74,8,3,'#6d4a36');px(84,74,8,3,'#6d4a36');
  px(70,70,20,8,'#e8602a');px(73,64-a,6,14+a,'#e8602a');px(81,66-b,6,12+b,'#e8602a');
  px(73,70,14,6,'#f5a03a');px(75,67-c,5,9+c,'#f5a03a');px(82,69-a,4,7+a,'#f5a03a');
  px(76,72,8,4,'#ffe08a');px(78,70-b,3,6+b,'#ffe08a');
  const rs=gesture('roast'),lg=gesture('log'),sk=gesture('sky'),pk=ev(34,6,5); /* idle: the fox pokes the fire with a stick */
  if(rs>=0){const T=[[86,56],[84,60],[82,64],[80,67],[80,67],[80,67],[80,67],[80,67],[81,62],[82,56],[83,50],[83,46],[83,46],[83,46],[85,52]][rs],mc=rs<5?'#f3efe6':rs<7?'#e8d9a8':rs<8?'#c9984a':'#8a5a2a';
    limb(92,57,T[0],T[1],2,'#6d4a36');if(rs<12)px(T[0]-2,T[1]-1,4,3,mc);const hd=placeHand();armHand(88,54,92,57,hd,'grip');
    if(rs>=3&&rs<=8)for(let i=0;i<4;i++)px(76+((rs*5+i*7)%10),63-((rs*3+i*4)%8),1,1,'#ffd27a')}
  else if(pk>=0&&lg<0){const tx=79+(pk%2)*2,ty=70-(pk%3);for(let i=0;i<=12;i++)px(Math.round(92-(92-tx)*i/12),Math.round(57+(ty-57)*i/12),2,2,'#6d4a36');{const hd=placeHand();armHand(88,54,92,57,hd,'grip')}for(let i=0;i<5;i++)px(tx-6+((pk*7+i*5)%14),62-pk*3-i*2,1,1,'#ffd27a')}
  if(lg>=0){const LX=[90,92,92,90,88,86,84,82,80,79,78,78],LY=[54,50,48,48,50,54,58,62,66,68,68,68]; /* idle: tosses a log on the fire */
    const hd=placeHand();if(lg<=5)armHand(88,54,LX[lg]+7,LY[lg]+1,hd);
    if(lg<=11){px(LX[lg],LY[lg],9,3,'#6d4a36');px(LX[lg],LY[lg],2,3,'#a88a5e')}
    if(lg<=5)handAt(LX[lg]+6,LY[lg]+1,hd,'grip');
    if(lg>=8){px(72,56,6,10,'#e8602a');px(80,52,6,14,'#f5a03a');px(76,50,5,8,'#ffe08a');
      for(let i=0;i<8;i++)px(70+((lg*7+i*9)%24),60-(((lg-7)*4+i*3)%24),1,1,'#ffd27a')}}
  if(sk>=0){if(stars()){px(140-sk*14,6+sk*4,3,1,'#ffffff');px(143-sk*14,5+sk*4,3,1,'#ffffff55')} /* idle: a shooting star by night, a bird by day */
    else{const bx=150-sk*15,by=14+(sk%2);px(bx,by,3,1,'#2b1d2e');px(bx-2,by-1+(sk%2),2,1,'#2b1d2e');px(bx+3,by-1+(sk%2),2,1,'#2b1d2e')}}
  px(66+(tick*5)%14,62-(tick*3)%18,1,1,'#ffd27a');px(90-(tick*7)%12,58-(tick*4)%16,1,1,'#ffd27a');
  [[20,50],[100,44],[150,56]].forEach(([x,y],i)=>{if((tick+i)%3)px(x+(tick%4),y,1,1,'#d8ff7a')});
  px(0,82,160,8,'#5a3a2a');px(0,82,160,1,'#6d4a36');
  px(28,78,10,8,SK);px(32,72,9,8,CR);px(41,74,2,4,CR);px(35,68-(tick%2),1,3,'#ffffff66');
}
SCENES.camp={label:"Campfire with a fox",icon:"🔥",name:"Rusty",outdoor:true,setting:"sitting across a campfire from them, under an open sky",
  prompt:"You are {pet}, a weathered, even-tempered fox sitting across a campfire from the person, under an open sky. Speak simply and honestly, like someone who has traveled a lot and has nothing to prove. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*adds a log to the fire* Evening. Sit, get warm. What's on your mind?",
  back:"*glances up from the flames* Back by the fire. Good.",
  gest:{roast:15,log:12,sky:10},hot:[{r:[66,18,28,46],say:["*looks up* Hm?","*a nod* Go on."]},{r:[66,60,28,20],say:["*the fire pops and sparks rise*","*he adds another log*"]}],
  draw:drawCamp};
