/* Scene: A quiet library with a bear librarian. Draws with px(x,y,w,h,color); s = time-of-day palette. */
const BOOKC=['#a83a4a','#3a6aa8','#4a8a5a','#d9a45a','#7a4aa8','#c8c0a0','#3a8a8a','#b8603a'];
function drawLibrary(s){
  const pg=gesture('page'),adj=gesture('glasses')>=0,sh=gesture('shush'); /* idle: turns a page, pushes up his glasses, shushes */
  px(0,0,160,62,'#3a2619');for(let x=0;x<160;x+=10)px(x,0,1,62,'#321f14');
  /* bookcases */
  const case_=(x0,w)=>{px(x0,4,w,60,'#4a3020');for(let r=0;r<4;r++){const y=6+r*14;px(x0+1,y,w-2,13,'#2a1810');let x=x0+2;for(let i=0;x<x0+w-4;i++){const bw=2+((i*5+r*3)%3),bh=7+((i*7+r)%5);px(x,y+13-bh,bw,bh,BOOKC[(i*3+r*2)%8]);x+=bw+(i%6===0?2:0)}px(x0,y+13,w,2,'#5a3a28')}};
  case_(2,44);case_(114,44);
  /* tall arched window */
  px(64,8,32,34,'#1c1730');skyfill(66,12,28,28,s);px(66,10,28,2,s.sky);px(64,8,32,3,'#1c1730');px(79,10,2,32,'#1c1730');px(66,24,28,2,'#1c1730');
  px(70,14,4,4,s.moon);px(71,13,2,6,s.moon);if(stars()){px(86,16,1,1,'#fff');px(84,30,1,1,tick%2?'#fff':s.sky)}
  /* warm glow */
  [[40,20,80,50],[48,28,64,38]].forEach(g=>{ctx.fillStyle=`rgba(${s.glow},.05)`;ctx.fillRect(...g)});
  /* globe and ladder */
  px(48,52,10,3,'#5a3a2a');px(52,46,2,6,'#5a3a2a');for(let dy=-4;dy<=4;dy++){const w=Math.round(Math.sqrt(16-dy*dy));px(53-w,42+dy+2,2*w,1,'#3a6aa8')}const sw=gesture('spin'),o=sw>=0?(sw*2)%8:0; /* idle: gives the globe a spin */
  [[50,44,3,2],[55,46,2,2]].forEach(([x,y,w,h])=>{const nx=49+((x-49+o)%8);px(nx,y,Math.min(w,57-nx),h,'#4a8a5a')});
  if(sw>=0&&sw<5){px(58-(sw%2),47,4,4,PC?PC.c1:'#7a4e34');px(58-(sw%2),47,2,4,PC?PC.c2:'#d8b890')}
  if(sw>=2&&sw<10)px(46+sw%3,44+(sw%2)*5,1,1,'#ffffff99');
  px(160-18,6,2,62,'#8a6a42');px(160-10,6,2,62,'#8a6a42');for(let y=12;y<64;y+=9)px(142,y,10,2,'#8a6a42');
  /* the bear librarian */
  const bear={species:'bear',c1:'#7a4e34',c2:'#d8b890'};
  CH.b();
  if(PC)drawChar(PC,64,30,2);
  else{drawChar(bear,64,30,2);
    const g='#e8c46a',yy=adj?-1:0;                                  /* round glasses */
    px(70,40+yy,7,1,g);px(70,46+yy,7,1,g);px(70,40+yy,1,7,g);px(76,40+yy,1,7,g);
    px(83,40+yy,7,1,g);px(83,46+yy,7,1,g);px(83,40+yy,1,7,g);px(89,40+yy,1,7,g);px(77,43+yy,6,1,g);
    px(70,54,20,6,'#4a6a4a');px(76,54,8,6,'#f3e3c8')}                /* cardigan + shirt */
  if(adj)armHand(88,55,89,49,placeHand(),'point'); /* a paw up to the glasses */
  CH.e();
  /* the desk, a lamp, an open book */
  px(36,60,92,5,'#6a4a2a');px(36,60,92,1,'#8a6a42');px(40,65,84,14,'#5a3a22');px(44,68,32,8,'#4a2e1a');px(84,68,32,8,'#4a2e1a');px(60,71,4,2,'#c8a050');px(100,71,4,2,'#c8a050');
  px(54,54,26,6,'#f3e3c8');px(80,54,26,6,'#ece0c0');px(79,53,2,8,'#a83a4a');px(56,56,20,1,'#b8a888');px(56,58,18,1,'#b8a888');px(84,56,18,1,'#b8a888');px(84,58,14,1,'#b8a888');
  if(pg>=0){const fx=80+(pg<3?pg*8:(5-pg)*8);px(fx-(pg<3?0:0),52+(pg%2),Math.max(2,26-fx+80),5,'#fff')}
  if(sh>=0){const H=[[80,60],[80,56],[79,52],[78,50],[78,49],[78,49],[78,49],[78,49],[78,49],[79,52],[80,56],[80,60]][sh]; /* one finger to the lips: shh. Drawn in front of the desk and book so the whole paw shows. */
    armHand(88,55,H[0]+6,H[1]+5,placeHand(),'point')}
  px(104,40,2,20,'#2a4a3a');px(98,36,14,6,'#2f7a4f');px(100,34,10,3,'#2f7a4f');px(99,42,12,2,'#ffe9a0');
  ctx.fillStyle='rgba(255,230,150,.10)';ctx.fillRect(92,44,30,28);
  for(let i=0;i<7;i++)px(94+(i*9+tick*(1+i%2))%28,46+(i*13+tick)%24,1,1,'#ffe9a099');  /* dust in the lamplight */
  px(112,52,10,8,'#a83a4a');px(112,52,10,2,'#c8605a');px(114,46,10,6,'#3a6aa8');
  /* floor and rug */
  px(0,79,160,11,'#3a2619');for(let y=80;y<90;y+=3)px(0,y,160,1,'#2e1d12');
  px(24,80,112,10,'#7a2f3a');px(24,80,112,1,'#c8a050');for(let x=28;x<136;x+=8)px(x,84,4,2,'#c8a050');
  if(thinking){for(let i=0;i<=tick%3;i++)px(98+i*5,26,3,3,'#f3e3c8')}
}
SCENES.library={label:"Library at night",icon:"📚",name:"Barnaby",setting:"in a hushed library after closing, you behind the desk with an open book and the person in the reading chair across from you",
  prompt:"You are {pet}, a large, gentle bear in round glasses who is the librarian of a quiet library after closing. You speak softly and slowly, with a scholar's curiosity. You sometimes mention a book, but never lecture."+STYLE,
  greet:"*closes the book on one finger* Shh... well, you may speak. We're alone. What brings you in?",
  back:"*looks up over his glasses* Ah. Your usual chair is free.",
  hot:[{r:[62,28,40,34],say:["*pushes up his glasses* Mm?","*turns a page without looking down*","*a soft, rumbling hum*"]},{r:[92,34,32,30],say:["*the lamp hums warmly*"]},{r:[44,40,16,16],say:["*gives the globe a slow spin*"]},{r:[2,4,44,60],say:["*a book somewhere settles with a quiet thud*"]}],
  gest:{spin:12,page:5,glasses:6,shush:12},win:[66,12,28,28],draw:drawLibrary};
