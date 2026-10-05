/* Scene: A city rooftop at night with Biscuit, a friendly orange tabby in a red scarf. String lights, a skyline with lit windows,
   a crate for a table with a mug and a little fish, a lantern and a blanket. Calm on purpose: twinkling lights and windows, a slow tail,
   now and then an ear twitch, a glance at the moon or a shooting star. Draws with px(x,y,w,h,color); s = time-of-day palette. */
const RT_FAR=[[0,14,16],[12,10,24],[22,16,14],[36,9,22],[44,14,12],[56,10,26],[66,18,14],[84,11,24],[95,14,16],[109,10,22],[119,16,13],[135,10,25],[145,15,15]];
const RT_NEAR=[[0,18,22],[16,22,30],[40,14,18],[54,16,24],[100,18,20],[116,16,28],[130,30,32]];
function drawRooftop(s){
  const F='#e0904c',ST='#b5662f',W='#f6ead4',PK='#e89aa0',EYE='#7fd08a',DK='#2b1d2e',SCF='#c9505a',blink=Face.blink();
  const tw=[0,1,0,-1][Math.floor(tick/5)%4],ear=ev(36,5,11)>=0?1:0,look=ev(48,10,3)>=0?1:0,star=gesture('star'),pl=gesture('plane'),pu=gesture('purr'),rg=gesture('tap'),fj=rg>=4&&rg<=7&&rg%2===0?-1:0; /* idle: a paw taps the fish */
  const near0=()=>byDay('#120f2a','#2a3a50'),dark=DAYF<.55,far=byDay('#1b2050','#8aa6c0'),near=byDay('#120f2a','#5f7a98');
  /* sky, stars, moon, a shooting star */
  skyfill(0,0,160,60,s);
  if(stars())for(let i=0;i<24;i++)px((i*53+7)%160,(i*29+3)%34,1,1,(i+tick)%7?'#fff':s.sky);
  px(122,10,6,6,s.moon);px(123,9,4,8,s.moon);px(121,11,8,4,s.moon);
  if(star>=0){if(stars()){px(128-star*7,6+star*3,3,1,'#ffffff');px(131-star*7,5+star*3,3,1,'#ffffff55')} /* a shooting star by night, a bird by day */
    else{const bx=140-star*20,by=12+(star%2);px(bx,by,3,1,near0());px(bx-2,by-1+(star%2),2,1,near0());px(bx+3,by-1+(star%2),2,1,near0())}}
  if(pl>=0){const x=-6+pl*11,y=16-(pl>>2);px(x,y,5,1,'#cfd2e0');px(x,y-1,1,1,'#cfd2e0');px(x+1,y+1,2,1,'#aab0c0');px(x+5,y,1,1,pl%2?'#ff6a6a':'#6aff9a')} /* a plane passes over */
  /* the skyline: far and near rows of buildings with a few lit windows, a water tank and an aerial */
  RT_FAR.forEach(([x,w,h])=>px(x,58-h,w,h,far));
  RT_NEAR.forEach(([x,w,h],b)=>{
    px(x,58-h,w,h,near);
    if(dark)for(let wy=62-h;wy<54;wy+=5)for(let wx=x+2;wx<x+w-2;wx+=4){
      const k=(wx*7+wy*13+b*5)%11;
      if(k<4&&((k+(tick>>5))%5)!==0)px(wx,wy,2,2,'#ffd98a');
    }
  });
  px(21,17,12,9,byDay('#2a2540','#6f8098'));px(20,15,14,2,byDay('#1a1630','#556478'));px(22,26,1,6,near);px(31,26,1,6,near);
  px(144,16,1,16,near);px(141,20,7,1,near);px(142,24,5,1,near);if(tick%6<3)px(144,14,1,2,'#ff6a6a');
  /* the low wall and the roof floor */
  px(0,58,160,8,s.wall);px(0,57,160,2,mix(s.wall,'#ffffff',.18));
  for(let x=0;x<160;x+=10){px(x,61,1,5,s.w2);px(x+5,64,1,2,s.w2)}px(0,63,160,1,s.w2);
  px(0,66,160,24,s.floor);for(let y=70;y<90;y+=5)px(0,y,160,1,s.f2);
  for(let y=70;y<90;y+=5)for(let x=(y%10?6:26);x<160;x+=40)px(x,y,1,5,s.f2);
  /* string lights between two poles */
  const sag=x=>31+Math.round(9*Math.sin(Math.PI*(x-10)/139));
  px(9,30,3,42,'#2a2236');px(6,70,9,4,'#3a3050');px(148,30,3,42,'#2a2236');px(145,70,9,4,'#3a3050');
  for(let x=10;x<150;x++)px(x,sag(x),1,1,'#2a2236');
  const BC=['#ffd98a','#ff9ab0','#9ad8ff','#b8f0a0'];
  for(let i=0;i<14;i++){const x=14+i*10,y=sag(x),on=((i*3+(tick>>1))%9)!==0;
    px(x,y+1,2,3,on?BC[i%4]:'#6a5a50');if(on)px(x-1,y+1,4,5,'rgba(255,217,138,.12)')}
  /* soft glow from the lights and the lantern */
  [[20,28,120,40],[50,36,60,40]].forEach(g=>{ctx.fillStyle='rgba('+s.glow+',.04)';ctx.fillRect(...g)});
  /* a cushion for the cat to sit on */
  px(58,66,44,6,'#4f7f8f');px(58,66,44,1,'#6fa0b0');px(56,68,2,4,'#e8c46a');px(102,68,2,4,'#e8c46a');
  /* Biscuit */
  CH.b();
  if(PC)drawChar(PC,64,34,2);
  else{
    px(94,62,8,4,F);px(100,52+tw,4,12,F);px(100,50+tw,4,3,ST);                                                  /* tail with a dark tip */
    px(64,50,6,16,F);px(90,50,6,16,F);px(67,43,26,24,F);px(75,46,10,18,W);                                      /* haunches, body, white chest */
    px(67,50,3,1,ST);px(67,54,3,1,ST);px(90,50,3,1,ST);px(90,54,3,1,ST);
    px(71,62,7,6,W);px(82,62,7,6,W);px(74,65,1,3,'#d8c8a8');px(85,65,1,3,'#d8c8a8');                              /* front paws */
    px(68,42,24,4,SCF);px(68,44,24,1,'#a8404a');px(86,46,4,9,SCF);px(86,53,4,2,'#f3e3c8');                       /* red scarf */
    px(67,19+ear,3,2,F);px(66,21+ear,5,3,F);px(66,24,6,3,F);px(68,22+ear,2,3,PK);                               /* ears */
    px(90,19,3,2,F);px(89,21,5,3,F);px(88,24,6,3,F);px(90,22,2,3,PK);
    px(66,26,28,16,F);px(68,24,24,2,F);                                                                         /* head */
    px(76,24,2,4,ST);px(80,24,2,5,ST);px(83,24,2,4,ST);px(66,32,4,1,ST);px(66,35,4,1,ST);px(90,32,4,1,ST);px(90,35,4,1,ST);
    px(74,35,12,7,W);px(76,33,8,2,W);                                                                           /* muzzle */
    if(!blink){px(71,29,6,6,EYE);px(73+look,29,2,6,DK);px(72,30,1,2,'#fff');px(83,29,6,6,EYE);px(85+look,29,2,6,DK);px(84,30,1,2,'#fff')}
    else{px(71,32,6,1,DK);px(83,32,6,1,DK)}
    px(78,34,4,1,PK);px(79,35,2,1,PK);Face.mouth(px,77,37,{w:6,lip:DK,maxH:3});
    px(70,36,3,2,'#f0a0a0');px(87,36,3,2,'#f0a0a0');                                                            /* blush */
    px(60,34,6,1,'#efe4cc');px(61,37,5,1,'#efe4cc');px(94,34,6,1,'#efe4cc');px(94,37,5,1,'#efe4cc');          /* whiskers */
  }
  CH.e();
  if(pu>=2){const hh=(x,y)=>{px(x,y,2,1,'#ff7a9a');px(x+3,y,2,1,'#ff7a9a');px(x,y+1,5,1,'#ff7a9a');px(x+1,y+2,3,1,'#ff7a9a');px(x+2,y+3,1,1,'#ff7a9a')}; /* purring: little hearts */
    hh(98,32-(pu-2)*2);if(pu>=6)hh(58,34-(pu-6)*2)}
  if(thinking){for(let i=0;i<=tick%3;i++)px(100+i*5,16,3,3,'#f3e3c8')}
  /* the crate that serves as a table */
  px(36,72,88,16,'#7a5a38');px(36,72,88,2,'#a88a5e');px(36,78,88,1,'#5a4026');px(36,84,88,1,'#5a4026');
  px(36,72,3,16,'#5a4026');px(121,72,3,16,'#5a4026');px(78,72,2,16,'#5a4026');
  px(46,66,7,6,'#f3e3c8');px(53,67,2,3,'#f3e3c8');px(47,66,5,1,'#8a5a32');                                       /* mug */
  if(tick%6<3){px(48,63,1,2,'#ffffff66');px(50,62,1,2,'#ffffff44')}
  px(96,70,16,2,'#e8e0d0');px(99,67+fj,7,3,'#7a9ad8');px(106,66+fj,2,5,'#7a9ad8');px(100,68+fj,1,1,DK);px(99,69+fj,5,1,'#a8c0f0');   /* a little fish on a plate */
  px(114,68,6,4,'#b5654a');px(115,64,4,4,'#6fbf6f');px(116,62,2,2,'#8acb7a');                                    /* a seedling pot */
  if(rg>=0){const d=[0,2,4,6,7,7,7,7,5,3,1,0][rg];px(91,64,3+d,3,PC?PC.c1:F);px(92+d,64,3,3,PC?PC.c2:W)}
  /* a lantern and a folded blanket */
  const fl=tick%4<2;
  px(136,66,4,1,'#2a2a3a');px(134,67,8,13,'#2a2a3a');px(135,69,6,9,fl?'#ffd27a':'#ffbe6e');px(133,80,10,2,'#3a3a4a');
  ctx.fillStyle='rgba(255,200,110,.035)';ctx.fillRect(122,64,36,24);
  px(6,76,28,12,'#9a4a5a');px(6,80,28,2,'#e8c46a');px(6,84,28,2,'#e8c46a');px(6,76,28,1,'#b8606e');
}
SCENES.rooftop={label:"Rooftop at night",icon:"🌃",name:"Biscuit",outdoor:true,win:[0,0,160,58],setting:"on a city rooftop at night, string lights overhead, a crate for a table between you with a mug and a little fish on it, a lantern glowing and the skyline all around",
  prompt:"You are {pet}, a friendly orange tabby cat in a red scarf who lives on a city rooftop and loves company. You are warm, curious and playful, quick to purr and quick to laugh, and you make people feel welcome right away. You notice small things: the lit windows across the street, the moon, the wind, a plane going over. You are a good listener who asks about the person's day and remembers what they say, and you are happy to talk about anything: big things, small things, silly things or nothing in particular. You tease gently and never meanly, you do not lecture, and you do not pretend to be a person. If they seem to be having a hard time, slow down and keep them company first. A cat's habits show up now and then (a slow blink, a stretch, a tail curling around your paws), lightly and never forced."+STYLE,
  greet:"*tail curls up* There you are! I saved you the good spot. The city is lovely tonight. How was your day?",
  back:"*looks up and purrs* Back already? Good. The lights are still on.",
  hot:[{r:[62,18,38,50],say:["*slow blink* Hello, you.","*purrs* I'm listening. Take your time.","*tilts head* Mm? Go on."]},{r:[44,60,14,12],say:["*sniffs the mug* Still warm. Don't tell anyone I checked.","*pats the mug* Good for cold paws."]},{r:[94,64,20,8],say:["*eyes the fish* That's for later. Probably.","*whiskers twitch* Do not look at the fish. It is a trap."]},{r:[8,28,142,18],say:["*looks up at the lights* I hung every one of those myself. Well, I supervised.","*watches the bulbs twinkle* Pretty, aren't they?"]},{r:[0,18,160,38],say:["*nods at the skyline* Every window is somebody's evening.","*watches the city* I like it up here. It's quiet and loud at once."]},{r:[132,64,14,20],say:["*warms paws by the lantern* Cozy.","*the lantern flickers, then steadies*"]}],
  gest:{tap:12,star:7,plane:16,purr:14},gp:(n,f)=>n==='purr'?(f%2):0,draw:drawRooftop};
