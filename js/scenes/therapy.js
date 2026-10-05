/* Scene: Therapy session. Draws on the 160x90 canvas with px(x,y,w,h,color); s = time-of-day palette. */
function drawTherapy(s){
  const SK='#e8b894',DK='#2b1d2e',blink=Face.blink(),sp=gesture('tea'),ts=gesture('tissue'),se=gesture('settle'),wr=ev(32,8,6)>=0&&sp<0; /* idle: the therapist jots a note */
  px(0,0,160,58,s.wall);for(let x=0;x<160;x+=8)px(x,0,1,58,s.w2);
  px(0,58,160,32,s.floor);for(let y=62;y<90;y+=6)px(0,y,160,1,s.f2);px(0,56,160,3,'#2a2140');
  px(8,8,38,50,'#5a3a2a');px(10,10,34,46,'#3a2619');
  [10,24,38].forEach((y,r)=>{for(let x=11,i=0;x<43;x+=4,i++)px(x,y+2,3,10-((i+r)%3),['#d9798f','#7a9ad8','#e8c46a','#7ac98f','#a98af0'][(i+r)%5]);px(10,y+12,34,2,'#5a3a2a')});
  px(66,10,22,15,'#5a3a2a');px(68,12,18,11,'#f3e3c8');px(71,15,12,1,'#b8a888');px(71,18,9,1,'#b8a888');
  px(112,10,38,32,'#1c1730');skyfill(115,13,32,26,s);px(130,13,2,26,'#1c1730');px(115,25,32,2,'#1c1730');
  px(120,16,5,5,s.moon);px(121,15,3,7,s.moon);px(119,17,7,3,s.moon);
  if(stars()){px(140,18,1,1,'#fff');px(136,32,1,1,tick%2?'#fff':s.sky);px(122,33,1,1,'#fff')}
  px(140,58,10,8,'#a85a4a');px(138,46,14,12,'#4a8a5a');px(142,42,6,6,'#5ca06c');px(136,50,4,6,'#5ca06c');
  px(34,72,92,12,'#8a4a5a');px(37,74,86,8,'#a85a6a');
  px(60,26,40,40,'#8a4a4a');px(56,46,8,22,'#a05a5a');px(96,46,8,22,'#a05a5a');px(60,60,40,8,'#a05a5a');
  if(PC)drawChar(PC,64,34,2);else{
  px(66,54,28,7,'#3a3f5a');px(68,61,8,11,'#3a3f5a');px(84,61,8,11,'#3a3f5a');px(66,72,12,3,DK);px(82,72,12,3,DK);
  px(68,38,24,18,'#5a8a9a');px(76,38,8,3,'#f3e3c8');px(62,40,7,14,'#5a8a9a');px(91,40,7,14,'#5a8a9a');
  px(76,46,12,10,'#f3e3c8');px(78,49,8,1,'#b8a888');px(78,52,6,1,'#b8a888');
  px(64,53,6,5,SK);px(90,52+(wr?tick%2:0),6,5,SK);
  px(77,36,6,3,SK);px(73,26,14,12,SK);px(72,22,16,6,'#4a3a3a');px(71,25,3,10,'#4a3a3a');px(86,25,3,10,'#4a3a3a');
  px(74,30,5,3,DK);px(75,31,3,1,SK);px(81,30,5,3,DK);px(82,31,3,1,SK);px(79,31,2,1,DK);
  if(!blink){px(76+(wr?1:0),31,1,1,DK);px(83+(wr?1:0),31,1,1,DK)}
  Face.mouth(px,77,35,{w:6,lip:'#b5655a',maxH:3});
  }
  if(thinking){for(let i=0;i<=tick%3;i++)px(92+i*5,18,3,3,'#f3e3c8')}
  px(52,76,56,4,'#5a3a2a');px(56,80,4,6,'#5a3a2a');px(100,80,4,6,'#5a3a2a');
  px(60,71,10,5,'#7a9ad8');px(63,69,4,2,'#fff');if(sp<0){px(90,71,6,5,'#f3e3c8');px(96,72,2,3,'#f3e3c8')}
  else{const mx=[90,90,89,87,84,82,80,80,80,84,88,90,90][sp],my=[71,66,58,50,42,36,35,35,35,42,52,64,71][sp];
    arm(93,58,mx+5,my+3,2,PC?PC.c1:SK);px(mx,my,6,5,'#f3e3c8');px(mx+6,my+1,2,3,'#f3e3c8');px(mx,my,6,1,'#b8a888');
    if(sp>3&&sp<9)px(mx+2+(tick%2),my-3,1,2,'#ffffff77')}
  if(ts>=0){const up=[0,1,3,5,6,6,6,5,3,1,0,0][ts]; /* idle: offers a tissue */
    arm(66,58,64,Math.max(62,67-(up>>1)),2,PC?PC.c1:SK);px(63,69-up,4,2+up,'#fff');px(63,69-up,4,1,'#dfe6f4');px(62,66-up,6,4,PC?PC.c1:SK)}
  px(0,64,16,26,'#6a5aa0');px(144,64,16,26,'#6a5aa0');px(16,80,128,10,'#5a4a90');px(16,80,128,1,'#7a6ab8');
}
SCENES.therapy={label:"Therapy session",icon:"🛋️",name:"Dr. Sage",win:[115,13,32,26],setting:"in a quiet therapy office, with the person on the couch and you in the armchair across from them",
  prompt:"You are {pet}, a calm, attentive therapist in a quiet office, in a session with the person on the couch. Listen closely, reflect back what you hear, and ask a question when it helps. Never lecture or diagnose. You are an AI character for reflection and conversation, not a licensed clinician; if the person seems to be in crisis or mentions hurting themselves, respond with care and encourage them to reach out to a local crisis line or someone they trust.",
  greet:"Come in, sit wherever is comfortable. We can start anywhere. How are you doing today?",
  back:"Welcome back. Where would you like to pick up?",
  gest:{tea:13,tissue:12,settle:8},gp:(n,f)=>n==='settle'?[0,-1,-1,0,1,1,0,0][f]||0:0,hot:[{r:[60,22,40,50],say:["Yes? I'm listening.","*nods* Take your time.","We can slow down if you like."]}],
  draw:drawTherapy};
