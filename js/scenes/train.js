/* Scene: Night train with a conductor cat across the table. Draws with px(x,y,w,h,color); s = time-of-day palette. */
function drawTrain(s){
  const blink=Face.blink(),F='#e8d3a8',N='#2a3a7a',DK='#2b1d2e',day=TM==='day'||TM==='dawn',lk=ev(30,8,3)>=0,tu=gesture('tunnel'),wt=gesture('watch'); /* idle: the cat checks the window */
  px(0,0,160,90,s.wall);for(let x=0;x<160;x+=8)px(x,0,1,72,s.w2);
  px(18,8,124,48,'#1c1730');skyfill(22,12,116,40,s);
  if(stars())for(let i=0;i<14;i++)px(24+(i*37)%112,14+(i*11)%14,1,1,(i+tick)%5?'#fff':s.sky);
  for(let x=22;x<138;x++)px(x,Math.round(40+3*Math.sin((x+tick*4)/9)),1,12,byDay('#12281f','#3a7a4a'));
  for(let k=0;k<5;k++)px(22+(((k*30-tick*8)%116)+116)%116,12,2,40,'#1c1730');
  for(let k=0;k<6;k++)px(22+(((k*23-tick*5)%116)+116)%116,44+(k%3)*3,2,2,'#ffd27a');
  px(78,12,4,40,'#1c1730');px(22,28,116,2,'#1c1730');
  if(tu>=0){const A=[0,.2,.55,.85,.95,.95,.95,.95,.95,.9,.7,.4,.15,0][tu]; /* idle: the train goes through a tunnel */
    ctx.fillStyle='rgba(6,4,18,'+A+')';ctx.fillRect(22,12,116,40);
    if(A>.5){for(let q=0;q<6;q++)px(22+(((q*23-tu*18)%116)+116)%116,12,2,40,'#0c0a1c');for(let q=0;q<3;q++)px(22+(((q*40-tu*22)%116)+116)%116,20,2,2,'#ffd27a')}}
  px(0,72,160,18,s.floor);px(0,56,16,24,'#7a3a4a');px(144,56,16,24,'#7a3a4a');
  CH.b();
  if(PC)drawChar(PC,64,36,2);else{
  px(68,22,24,4,N);px(66,26,28,3,'#1c2250');px(77,23,6,2,'#ffd27a');
  px(68,20-(lk?1:0),5,6,F);px(87,20-(lk?1:0),5,6,F);px(70,22,2,3,'#d9798f');px(88,22,2,3,'#d9798f');
  px(66,28,28,16,F);
  px(71+(lk?2:0),(blink?35:33)-(lk?1:0),3,blink?1:4,DK);px(86+(lk?2:0),(blink?35:33)-(lk?1:0),3,blink?1:4,DK);
  px(79,38,2,2,'#d9798f');Face.mouth(px,77,41,{w:6,lip:DK,maxH:3});
  px(58,38,8,1,'#c8b890');px(94,38,8,1,'#c8b890');px(58,41,8,1,'#c8b890');px(94,41,8,1,'#c8b890');
  px(64,44,32,24,N);px(79,48,2,2,'#ffd27a');px(79,53,2,2,'#ffd27a');px(79,58,2,2,'#ffd27a');
  px(96,56-(tick%2)*2,4,10,F);px(98,50-(tick%2)*2,4,6,F);
  px(68,64,8,4,F);px(84,64,8,4,F);
  }
  CH.e();
  px(28,68,104,5,'#5a3a2a');px(30,73,100,2,'#3a2619');
  px(46,64,10,4,'#f3e3c8');px(48,60-(tick%2),1,3,'#ffffff66');const sp=gesture('sip');
  if(sp<0)px(104,64,10,4,'#7a9ad8');
  else{const cx=[104,103,100,96,91,86,84,84,84,88,95,102,104][sp],cy=[64,60,54,48,44,41,40,40,40,44,52,62,64][sp];
    limb(94,62,cx+10,cy+2,3,PC?PC.c1:F);px(cx,cy,9,5,'#7a9ad8');px(cx+9,cy+1,2,3,'#7a9ad8');px(cx,cy,9,1,'#a8bfe8');
    if(sp>3&&sp<9)px(cx+3+(tick%2),cy-3,1,2,'#ffffff77')}
  if(wt>=0){const W=[[88,56],[88,52],[88,48],[88,46],[88,46],[88,46],[88,46],[88,46],[88,48],[88,52],[88,56],[88,58]][wt]; /* idle: checks a pocket watch */
    limb(72,52,W[0],W[1],1,'#e8c46a');px(W[0]-2,W[1]-2,6,6,'#e8c46a');px(W[0]-1,W[1]-1,4,4,'#f3efe6');px(W[0],W[1]-1,1,2,DK);px(W[0],W[1],2,1,DK);px(W[0]+3,W[1]+2,4,4,PC?PC.c1:F)}
  px(78,56,4,12,'#ffd98a');px(76,54,8,3,'#d9798f');
  [[44,50],[64,40],[100,44]].forEach(([x,y],i)=>{ctx.fillStyle=`rgba(${s.glow},.04)`;ctx.fillRect(x,y,40,26)});
  if(thinking){for(let i=0;i<=tick%3;i++)px(98+i*5,16,3,3,'#f3e3c8')}
}
SCENES.train={label:"Night train with a cat",icon:"🚂",name:"Mochi",win:[22,12,116,40],setting:"across a small table on a night train, tea between you",
  prompt:"You are {pet}, a composed, dignified conductor cat sitting across a small table on a night train, tea between you. Speak quietly and with dry wit, like someone who has seen many towns and many people. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*pours the tea* Plenty of time before the next stop. Where are you headed?",
  back:"*glances up from the window* Same seat. The tea is still warm.",
  gest:{sip:13,watch:12,tunnel:14},hot:[{r:[56,18,48,52],say:["*flicks an ear*","*a slow blink*"]},{r:[72,52,16,16],say:["*the lamp flickers, then steadies*"]},{r:[24,60,36,10],say:["*steam curls up from the cup*"]}],
  draw:drawTrain};
