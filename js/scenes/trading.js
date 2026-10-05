/* Scene: A greenhouse at dusk with Ada, an older woman who spent a lifetime around money and now tends plants.
   A potting bench with a notebook, tea and a brass balance scale (risk on one pan, reward on the other). Kept calm on purpose: only a slow
   sway of the hanging plants and a gentle tilt of the scale. Draws with px(x,y,w,h,color); s = time-of-day palette. */
const GP=['#4f9a5a','#6fbf6f','#3f7f55','#8acb7a'];
function drawTrading(s){
  const SK='#a8704c',DK='#2b1d2e',HAIR='#dcdce6',GOLD='#e8c46a',blink=Face.blink(),adjust=ev(44,6,15)>=0;
  const sway=[0,1,0,-1][Math.floor(tick/6)%4],tilt=[0,1,0,-1][Math.floor(tick/8)%4];
  /* glass walls onto the dusk sky, iron frame */
  skyfill(2,3,156,53,s);if(stars()){[[20,12],[58,8],[96,14],[134,10],[148,26]].forEach(([x,y])=>px(x,y,1,1,'#fff'))}
  px(0,0,160,3,'#243428');px(0,56,160,2,'#243428');px(0,0,2,58,'#243428');px(158,0,2,58,'#243428');
  for(let x=22;x<158;x+=22)px(x,3,1,53,'#243428');px(2,22,156,1,'#243428');px(2,40,156,1,'#243428');
  for(let i=0;i<15;i++)px(8+i*10,5+(i%2),2,2,'#ffd98a');                                   /* string lights */
  /* left shelves: pots */
  const shelf=(x0,w,y,pots)=>{px(x0,y,w,2,'#6a4a2a');pots.forEach(([dx,ph,col,k],i)=>{const x=x0+dx;px(x,y-6,8,6,'#b5654a');px(x+1,y-6,6,1,'#c9755a');
    if(k==='fern'){px(x+1,y-6-ph,6,ph,GP[2]);px(x-1,y-6-ph+2,2,3,GP[1]);px(x+7,y-6-ph+2,2,3,GP[1])}
    else if(k==='bloom'){px(x+3,y-6-ph,2,ph,GP[2]);px(x+1,y-8-ph,6,3,col);px(x+3,y-9-ph,2,1,'#ffe9a0')}
    else if(k==='tall'){px(x+2,y-6-ph,4,ph,col);px(x+1,y-6-ph+3,1,3,col);px(x+6,y-6-ph+5,1,3,col)}
    else{px(x+1,y-6-ph,6,ph,col);px(x+2,y-7-ph,4,1,GP[3])}})};
  shelf(4,42,32,[[3,7,GP[0],'leaf'],[15,10,'#6fbf6f','tall'],[28,6,'#e07a8a','bloom']]);
  shelf(4,42,48,[[2,6,GP[2],'fern'],[14,5,'#e8c46a','bloom'],[28,8,GP[1],'leaf']]);
  shelf(116,42,32,[[4,9,GP[1],'fern'],[17,6,'#a98af0','bloom'],[30,10,GP[0],'tall']]);
  shelf(116,42,48,[[3,5,GP[0],'leaf'],[16,8,GP[2],'fern'],[29,6,'#e07a8a','bloom']]);
  /* hanging plants, swaying very slowly */
  [[62,10],[98,14]].forEach(([x,l])=>{px(x,3,1,l,'#243428');px(x-3+sway,3+l,7,4,'#b5654a');for(let i=0;i<4;i++)px(x-3+sway+i*2,7+l,1,3+(i%2)*2,GP[(i+1)%4])});
  /* warm light */
  [[20,24,120,56],[40,34,80,44]].forEach(g=>{ctx.fillStyle='rgba(255,200,120,.03)';ctx.fillRect(...g)});
  /* Ada */
  CH.b();
  if(PC)drawChar(PC,64,34,2);
  else{
    px(66,43,28,20,'#6f8a5a');px(68,40,24,5,'#6f8a5a');px(62,44,7,15,'#6f8a5a');px(91,44,7,15,'#6f8a5a');          /* sage cardigan */
    px(76,41,8,10,'#f3e3c8');px(79,41,2,10,'#e8dcc0');px(80,46,1,1,'#b8a888');px(80,50,1,1,'#b8a888');            /* blouse and buttons */
    px(64,57,6,4,SK);px(90,57-(adjust?0:0),6,4,SK);
    px(77,36,6,5,SK);px(73,26,14,12,SK);                                                                          /* neck, face */
    px(72,22,16,6,HAIR);px(71,25,3,12,HAIR);px(86,25,3,12,HAIR);px(76,17,8,6,HAIR);px(77,16,6,1,HAIR);           /* silver hair and a bun */
    px(74,28,5,1,HAIR);px(81,28,5,1,HAIR);                                                                        /* brows */
    px(74,30,5,3,GOLD);px(75,31,3,1,SK);px(81,30,5,3,GOLD);px(82,31,3,1,SK);px(79,31,2,1,GOLD);                 /* round glasses */
    if(!blink){px(76,31,1,1,DK);px(83,31,1,1,DK)}
    px(79,33,2,2,'#8e5a3c');px(74,34,2,1,'#c0786a');px(84,34,2,1,'#c0786a');
    Face.mouth(px,77,35,{w:6,lip:'#a8504a',maxH:3});
  }
  CH.e();
  if(thinking){for(let i=0;i<=tick%3;i++)px(92+i*5,14,3,3,'#f3e3c8')}
  /* the potting bench */
  px(22,62,116,5,'#8a6a42');px(22,62,116,1,'#a88a5e');px(26,67,108,12,'#6a4a2a');px(30,70,38,8,'#4a3220');px(92,70,38,8,'#4a3220');px(46,73,4,2,'#c8a050');px(110,73,4,2,'#c8a050');
  /* brass balance scale: coin on one pan, a leaf on the other */
  px(44,48,2,12,'#c8a050');px(40,60,10,2,'#c8a050');px(43,47,4,2,'#c8a050');
  px(32,48+tilt,26,1,'#c8a050');
  px(33,49+tilt,1,5,'#c8a05088');px(37,49+tilt,1,5,'#c8a05088');px(53,49-tilt,1,5,'#c8a05088');px(57,49-tilt,1,5,'#c8a05088');
  px(32,54+tilt,7,1,'#c8a050');px(34,52+tilt,3,2,'#e8c46a');
  px(52,54-tilt,7,1,'#c8a050');px(54,52-tilt,3,2,'#6fbf6f');
  /* notebook, pencil, tea */
  px(100,57,12,5,'#f3e3c8');px(112,57,10,5,'#ece0c0');px(111,56,2,6,'#7a4a54');px(102,58,8,1,'#b8a888');px(114,58,6,1,'#b8a888');px(103,60,4,1,'#b8a888');px(112,54,1,6,'#e8c46a');px(112,53,1,1,'#2a1a10');
  px(126,56,7,6,'#e8e0d0');px(133,57,2,3,'#e8e0d0');px(127,57,5,1,'#8a5a32');if(tick%6<3){px(128,53,1,2,'#ffffff66');px(130,52,1,2,'#ffffff44')}
  px(90,57,6,5,'#b5654a');px(91,54,4,3,GP[1]);px(92,52,2,2,GP[3]);                                                /* a seedling */
  /* stone floor, a watering can */
  px(0,79,160,11,'#5a5248');for(let y=82;y<90;y+=4){px(0,y,160,1,'#4a4238');for(let x=(y%8?0:10);x<160;x+=20)px(x,y,1,4,'#4a4238')}
  px(140,74,12,8,'#6a8a9a');px(150,70,2,8,'#6a8a9a');px(138,72,3,2,'#6a8a9a');px(142,72,8,1,'#8aaaba');
}
SCENES.trading={label:"Greenhouse at dusk",icon:"🪴",name:"Ada",win:[2,3,156,53],setting:"in a warm greenhouse at dusk, a potting bench with a notebook, a cup of tea and a brass balance scale between you, the person on a stool across the bench",
  prompt:"You are {pet}, an older, wise woman who spent a lifetime around money and markets and now tends plants in a greenhouse. You are warm, patient, humble and quietly funny. You never compete, boast, hype or chase, and you see money as one part of a life, not a scoreboard. You may use a garden image now and then, lightly, but you never force it. You still know markets well: how stocks, funds, currencies, crypto and options work, how orders and fees work, reading charts and news, position sizing, risk and reward, diversification, and the habits that cost people money (chasing, panic selling, revenge trading, overconfidence). You explain in plain, short words, you take the long view, and you ask what the money is for and how much loss the person could truly live with before you talk about any trade. You think in probabilities, never certainties: you never promise returns, never say a trade is sure, and never give a confident buy or sell call. You are not a licensed financial advisor and you say so briefly when someone asks what to do with real money, then help them think it through and see the trade-offs. You have no live prices or news, and you say so instead of guessing numbers. You are especially careful with leverage, borrowed money, money they cannot afford to lose, and trading to escape stress or win back a loss: you slow them down, kindly and plainly, and you are glad to say that doing nothing is also an answer. If they seem to be having a hard time, set the markets aside and sit with them first."+STYLE,
  greet:"*looks up from the seedlings and smiles* Come in, pull up a stool. The markets can wait. What is on your mind?",
  back:"*looks up over her glasses* Ah, there you are. The kettle is still warm.",
  hot:[{r:[62,16,40,48],say:["*smiles over her glasses* Mm? Take your time.","*tucks a loose strand behind her ear* No hurry.","*sets down her trowel* I am listening."]},{r:[30,44,32,20],say:["*nudges the scale and watches it settle* Risk on one pan, reward on the other. It is never free.","*smiles* Most people only look at one pan. I look at both."]},{r:[98,52,26,10],say:["*taps the notebook* Writing it down slows the hand. That is most of the craft.","*flips a page* Old notes. Humbling ones."]},{r:[2,20,44,34],say:["*touches a leaf* Slow things are often the good things.","*checks the soil* Do not dig up the seed to see if it is growing."]},{r:[114,20,44,34],say:["*pinches off a dead leaf* A little tidying goes a long way."]},{r:[124,50,12,12],say:["*takes a slow sip* Still warm. Good."]}],
  draw:drawTrading};
