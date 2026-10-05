/* Scene: Rooftop at night with string lights, a drone and a radio. Draws with px(x,y,w,h,color); s = time-of-day palette. */
function drawRoof(s){
  const M='#8a9ab8',L='#aab8d0',G='#7affc8';
  const SKY={day:['#8fd3f4','#a8dcf4','#c4e6f4'],dawn:['#7a6aa0','#e890a0','#ffd0a0'],sunset:['#4a3a7a','#b0587a','#e8825a'],dusk:['#1f1850','#5a3a7a','#c0587a'],night:['#0d1230','#151b3d','#1f2650']},sky=byTime(SKY);
  sky.forEach((c,i)=>px(0,i*20,160,20,c));
  if(stars())for(let i=0;i<24;i++)px((i*41+7)%160,(i*19+3)%40,1,1,(i+tick)%6?'#fff':sky[0]);
  px(132,8,6,6,s.moon);px(133,7,4,8,s.moon);px(131,9,8,4,s.moon);
  px(((tick*3)%190)-12,16,2,1,'#fff');px(((tick*3)%190)-14,16,1,1,tick%2?'#ff4a4a':sky[0]);
  [[0,40,22,30,'#1a1630'],[20,34,16,36,'#1a1630'],[60,38,24,32,'#1a1630'],[100,36,18,34,'#1a1630'],[140,40,20,30,'#1a1630']].forEach(([x,y,w,h,c])=>px(x,y,w,h,byDay(c,'#7a96b0')));
  [[0,48,16,22],[14,40,14,30],[28,52,20,18],[46,44,12,26],[56,54,20,16],[96,46,16,24],[110,36,14,34],[124,50,22,20],[144,42,16,28]].forEach(([x,y,w,h],i)=>{
    px(x,y,w,h,byDay('#241d3f','#6a86a0'));
    for(let r=y+3;r<66;r+=5)for(let c=x+2;c<x+w-2;c+=4)if((r*7+c*3+i+(tick>>3))%5<2)px(c,r,2,2,byDay('#ffd27a','#8aa6c0'));
  });
  px(114,26,12,8,'#5a4a3a');px(116,34,2,6,'#5a4a3a');px(122,34,2,6,'#5a4a3a');px(113,25,14,2,'#7a6a5a');
  px(0,66,160,24,'#3a3050');px(0,66,160,3,'#6a5a80');for(let x=0;x<160;x+=10)px(x,69,1,5,'#2e2640');for(let x=0;x<160;x+=16)px(x,74,1,16,'#2e2640');
  px(134,52,6,14,'#4a4a60');px(132,50,10,3,'#5a5a70');for(let i=0;i<3;i++)px(136+((tick+i)%3),46-i*4,2,2,'#ffffff55');
  const cl=['#ff7a8a','#ffd27a','#7affc8','#7ab8ff'];
  for(let x=0;x<160;x+=4){const y=6+Math.round(5*Math.sin(x/26)+4);px(x,y,4,1,'#00000066');if(x%8===0){px(x,y+1,2,2,cl[(x/8+tick)%4|0]);ctx.fillStyle='rgba(255,220,150,.07)';ctx.fillRect(x-2,y,6,6)}}
  const dx=118+Math.round(6*Math.sin(tick/3)),dy=22+Math.round(2*Math.sin(tick/2));
  px(dx,dy,8,4,L);px(dx+2,dy+1,4,2,G);px(dx-3,dy-2,5,1,tick%2?M:L);px(dx+6,dy-2,5,1,tick%2?L:M);
  px(24,72,22,12,'#7a5a3a');px(24,72,22,2,'#9a7a5a');px(30,60,10,12,'#a85a4a');px(31,54,2,7,'#4aa86a');px(35,52,2,9,'#4aa86a');px(38,56,2,5,'#4aa86a');
  px(60,70,40,14,'#7a5a3a');px(60,70,40,3,'#9a7a5a');px(76,70,2,14,'#5a3a2a');
  CH.b();
  drawChar(PC||charById('p:dog'),64,38,2); /* the scene's own resident is the ready-made dog; cast anyone else in Setup */
  CH.e();
  px(120,72,16,10,'#8a4a4a');px(122,74,6,6,'#5a2a2a');px(130,74,4,1,'#ffd27a');px(130,77,4,1,'#ffd27a');px(133,66,1,6,'#ccc');
  if(tick%2)px(124+(tick%3)*3,66-(tick%4)*3,2,2,'#ffd27a');
  if(thinking){for(let i=0;i<=tick%3;i++)px(98+i*5,16,3,3,'#f3e3c8')}
}
SCENES.rooftop={label:"Rooftop at night",icon:"🌃",name:"Biscuit",outdoor:true,setting:"on a city rooftop, string lights overhead and a radio playing low",
  prompt:"You are {pet}, a warm, loyal old dog lying beside the person on a city rooftop at night, string lights overhead and a radio playing low. You listen more than you talk, with a dry, gentle humor. Speak plainly. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*thumps tail* Hi. The city looks good from up here. What's been on your mind?",
  back:"*lifts head* You're back.",
  hot:[{r:[56,12,50,74],say:["*thumps tail*","*a soft huff* Yes?"]},{r:[110,16,24,12],say:["*watches the drone circle once and settle*"]},{r:[118,70,22,12],say:["*an ear twitches as the radio shifts to a slower song*"]}],
  draw:drawRoof};
