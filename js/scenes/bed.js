/* Scene: In bed, first-person view. Draws on the 160x90 canvas with px(x,y,w,h,color); s = time-of-day palette. */
function drawBed(s){
  // first-person: lying down, looking along your body toward the footboard
  const BL='#7a5ab8',LEG='#8a6ac8',SK='#e8b894',PJ='#6b8fd0',AR='#5a7fc0';
  px(0,0,160,38,s.wall);for(let x=0;x<160;x+=8)px(x,0,1,38,s.w2);
  px(108,6,40,26,'#1c1730');skyfill(111,9,34,20,s);px(127,9,2,20,'#1c1730');px(111,18,34,2,'#1c1730');
  px(115,11,5,5,s.moon);px(116,10,3,7,s.moon);px(114,12,7,3,s.moon);
  if(stars()){px(136,13,1,1,'#fff');px(140,24,1,1,tick%2?'#fff':s.sky);px(122,25,1,1,'#fff')}
  px(10,34,24,3,'#5a3a2a');px(20,24,2,10,'#2a2140');px(16,18,10,7,'#ffd98a');
  [[0,6,44,40],[6,10,32,30],[12,14,20,20]].forEach(g=>{ctx.fillStyle=`rgba(${s.glow},.05)`;ctx.fillRect(...g)});
  px(0,38,160,52,s.floor);for(let y=44;y<90;y+=6)px(0,y,160,1,s.f2);
  px(0,36,160,5,'#5a3a2a');px(0,30,6,18,'#6d4a36');px(154,30,6,18,'#6d4a36');
  for(let y=41;y<90;y++){const t=(y-41)/48,l=Math.round(34*(1-t)),r=160-l;px(l,y,r-l,1,y%10===0?'#6a4aa8':BL);px(l,y,2,1,'#5a3d94');px(r-2,y,2,1,'#5a3d94')}
  for(let y=45;y<80;y++){const t=(y-45)/35,w=Math.round(6+16*t),c=Math.round(22*t);px((70-c-w/2)|0,y,w,1,LEG);px((90+c-w/2)|0,y,w,1,LEG)}
  px(66,64,28,3,'#6a4aa8');
  const dp=[[0,0],[-2,0],[2,0],[0,2],[-2,2]][held(40,0,5)]; /* idle: every so often the dog shifts to a new spot */
  CH.b();if(PC)drawChar(PC,64+dp[0],34+dp[1],2,{dots:true});else dog(64+dp[0],34+dp[1]);CH.e();
  for(let y=78;y<90;y++){const hw=30+(y-78)*4;px(80-hw,y,hw*2,1,PJ)}
  px(60,78,40,2,'#8fb0f0');
  const h=tick%2;
  for(let i=0;i<=16;i++)px(128-i*2,88-i,14,3,AR);
  px(90,66+h,10,7,SK);px(88,68+h,3,4,SK);
  for(let i=0;i<=12;i++)px(30+i*2,88-i,14,3,AR);
  px(52,71,10,7,SK);
}
SCENES.bed={label:"In bed, first-person view",icon:"🛏️",name:"Old Pup",win:[111,9,34,20],setting:"lying in bed beside them late at night, being petted",
  prompt:"You are {pet}, an old, calm dog lying next to the person in bed late at night, being petted. Quiet, steady and warm, like a late-night talk with someone who has known you a long time. Listen first, but also share your own thoughts. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*settles in beside you* It's late. How was your day, really?",
  back:"*lifts his head* There you are.",
  hot:[{r:[64,34,32,32],say:["*leans into your hand*","*a long, slow breath*","*thumps his tail once*"]}],
  draw:drawBed};
