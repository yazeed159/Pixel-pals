/* Scene: In bed, first-person view. You lie on your back looking along your body past your knees to the footboard, window and bedside lamp.
   Draws on the 160x90 canvas with px(x,y,w,h,color); s = time-of-day palette. */
function drawBed(s){
  const N=1-DAYF, dk=(c,a=.4)=>mix(c,'#0d0a1e',a*N); /* dk darkens a color at night, full color by day */
  const QB=dk('#7a5ab8'),QH=dk('#9378d0'),QS=dk('#5f4299'),QD=dk('#46327c'); /* quilt: base, highlight, seam, deep shade */
  const SH=dk('#efe5d8',.2),SH2=dk('#cfc0b0',.2),SH3=dk('#fbf5ec',.2);           /* turned-down sheet */
  const PJ=dk('#6b8fd0',.3),PJ2=dk('#5072b0',.3),PJH=dk('#88a9e2',.3);             /* pajamas */
  const SK=dk('#e8b894',.12),SK2=dk('#c99572',.12),SKH=dk('#f4cdb0',.12);
  const QL=mix(QB,QH,.35),QM=mix(QB,QS,.5),QF=mix(QB,QH,.5); /* leg cloth, soft seam, soft highlight */   /* skin */
  const WD=dk('#6d4a36'),WD2=dk('#563725'),WDH=dk('#8a6048');             /* wood */
  const breath=(tick%8<4)?0:1,pa=gesture('pat'),pt=pa<0?0:[0,-2,-4,-2,-4,-2,0,0][pa],zz=gesture('snore'),mo=gesture('moth'),dd=(pa===2||pa===4||(zz>=0&&zz%4<2))?1:0; /* idle: a pat on the dog */
  const row=(y,x0,x1,c)=>{if(x1>x0)px(x0,y,x1-x0,1,c)};
  const L=y=>Math.round(34*(1-(y-41)/48)); /* left edge of the bed at row y; the right edge is 160-L */

  /* ---- room: wall, window, curtains, picture ---- */
  px(0,0,160,38,s.wall);for(let x=0;x<160;x+=8){px(x,0,1,38,s.w2);px(x+4,0,1,38,mix(s.wall,s.w2,.5))}
  px(0,0,160,3,dk('#2a2140',.2));
  px(46,8,24,17,WD2);px(48,10,20,13,mix(s.sky,s.hz,.4));px(48,19,20,4,dk('#3d5a47'));px(54,15,8,8,dk('#456650'));px(60,12,2,2,s.moon); /* framed hills */
  px(106,5,44,30,'#1c1730');skyfill(110,9,36,22,s);px(127,9,2,22,'#1c1730');px(110,19,36,2,'#1c1730');
  px(115,11,5,5,s.moon);px(116,10,3,7,s.moon);px(114,12,7,3,s.moon);
  if(stars()){px(136,13,1,1,'#fff');px(140,24,1,1,tick%2?'#fff':s.sky);px(122,25,1,1,'#fff')}
  px(104,32,48,3,WDH);px(104,35,48,1,WD2); /* sill */
  px(98,3,60,2,WD2); /* rod */
  for(let c=0;c<2;c++){const x0=c?148:99;for(let i=0;i<10;i++)px(x0+i,5,1,31,i%3===0?dk('#6a3a52'):(i%3===1?dk('#8a5068'):dk('#7a4560')))}
  px(0,34,160,4,mix(s.wall,'#ffffff',.12));px(0,37,160,1,s.w2); /* skirting */

  /* ---- bedside table and lamp, far left ---- */
  px(3,37,29,22,WD2);px(3,37,29,2,WD);px(6,42,23,8,WD);px(7,43,21,1,WDH);px(16,45,4,2,dk('#d9b36a'));
  px(4,31,9,6,dk('#2a2140'));px(6,33,1,2,'#ff8a6a');px(8,33,1,2,'#ff8a6a');px(10,33,1,2,tick%2?'#ff8a6a':'#2a2140') /* little clock */
  px(19,26,3,10,dk('#caa46a'));px(16,35,9,2,dk('#caa46a'));
  px(14,18,14,8,'#ffd98a');px(15,17,12,1,'#ffe6aa');px(13,26,16,1,'#e8b866');px(17,19,6,3,'#fff2c8');

  /* ---- floor and rug ---- */
  px(0,38,160,52,s.floor);for(let y=44;y<90;y+=6)px(0,y,160,1,s.f2);
  px(0,60,160,30,dk('#8a4a5a',.3));px(0,62,160,1,dk('#d9a07a',.3));px(0,66,160,1,dk('#d9a07a',.3));

  /* ---- footboard: posts, top rail and the inside face you can see ---- */
  px(30,34,100,7,WD);px(30,34,100,1,WDH);px(30,40,100,1,WD2);
  for(let x=38;x<122;x+=7)px(x,36,3,4,WD2);
  px(28,26,7,18,WD);px(28,26,1,18,WDH);px(34,26,1,18,WD2);px(29,23,5,3,WDH);px(30,21,3,2,WDH);
  px(125,26,7,18,WD);px(125,26,1,18,WDH);px(131,26,1,18,WD2);px(126,23,5,3,WDH);px(127,21,3,2,WDH);

  /* ---- quilt ---- */
  for(let y=41;y<90;y++){
    const t=(y-41)/48,l=L(y),r=160-l,W=r-l;
    row(y,l,r,QB);
    const gap=Math.round(4+t*7);if(y>41&&(y-41)%gap===0)row(y,l,r,QM); /* quilted rows, further apart toward you */
    else if(y>41&&(y-42)%gap===0)row(y,l,r,QF);
    for(let j=1;j<7;j++)px(l+Math.round(W*j/7),y,1,1,QM); /* seams run toward the foot of the bed */
    const d=Math.round(2+8*t); /* the quilt hangs over both sides of the mattress */
    row(y,l-d,l,QS);row(y,l-d,l-d+1,QD);row(y,r,r+d,QS);row(y,r+d-1,r+d,QD);
    row(y,l,l+1,QH);
  }
  /* ---- your legs under the quilt: feet by the footboard, knees closer ---- */
  const blob=(pts,base,hi,lo,cl)=>{
    const lo_={},hi_={};
    for(let k=0;k<pts.length-1;k++){const [x0,y0,r0]=pts[k],[x1,y1,r1]=pts[k+1],n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));
      for(let i=0;i<=n;i++){const f=i/n,cx=x0+(x1-x0)*f,cy=y0+(y1-y0)*f,r=r0+(r1-r0)*f;
        for(let dy=-Math.floor(r);dy<=Math.floor(r);dy++){const hw=Math.sqrt(r*r-dy*dy),y=Math.round(cy+dy);
          lo_[y]=Math.min(lo_[y]??999,Math.round(cx-hw));hi_[y]=Math.max(hi_[y]??-999,Math.round(cx+hw))}}}
    const ys=Object.keys(lo_).map(Number).sort((a,b)=>a-b),y0=ys[0],y1=ys[ys.length-1];
    ys.forEach(y=>{const a=lo_[y],b=hi_[y];row(y,a,b,base);
      if(cl&&(y-y0)%5===3)row(y,a+2,b-3,cl); /* a quilted row crossing the leg */
      if(y<y0+2)row(y,a,b,hi);
      row(y,a,Math.min(a+3,b),hi);row(y,Math.max(b-4,a),b,lo);if(y>y1-2)row(y,a,b,lo)});
  };
  const LL=[[68,47,6],[64,53,8],[58,60,11],[51,68,13],[42,78,16],[32,88,19]],RL=LL.map(([x,y,r])=>[160-x,y,r]);
  [LL,RL].forEach(pt=>blob(pt.map(([x,y,r])=>[x+3,y+2,r+1]),QD,QD,QD)); /* the shadow each leg casts on the quilt */
  blob(LL,QL,QH,QS,QM);blob(RL,QL,QH,QS,QM);
  [[49,62,9],[44,69,11],[36,78,14],[102,62,9],[107,69,11],[113,78,14]].forEach(([x,y,w])=>{row(y,x,x+w,QS);row(y-1,x+1,x+w-2,QF)}); /* creases around the knees */

  /* ---- the dog: a dent in the quilt, the dog, then a ridge of quilt over its paws ---- */
  const dp=[[0,0],[-2,0],[2,0],[0,2],[-2,2]][held(40,0,5)]; /* idle: every so often the dog shifts to a new spot */
  for(let k=0;k<5;k++){const hw=22-k*3;px(80+dp[0]-hw,60+dp[1]+k,hw*2,1,`rgba(25,12,50,${(.10+.05*k).toFixed(2)})`)}
  CH.b();if(PC)drawChar(PC,64+dp[0],34+dp[1]+dd,2,{dots:true});else dog(64+dp[0],34+dp[1]+dd);CH.e();
  for(let x=50;x<=110;x++){const top=75-Math.round(7*Math.sin(Math.PI*(x-50)/60));px(x,top,1,76-top,QB);px(x,top,1,1,QH);if(top<73)px(x,top+1,1,1,QF)}

  /* soft light from the lamp and the moon (or day) on the quilt */
  [[70,.020],[56,.026],[42,.034],[30,.04]].forEach(([r,a])=>{ctx.fillStyle=`rgba(${s.glow},${(a*(.4+N)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(22,50,r*1.4,r*.8,0,0,7);ctx.fill()});
  if(N>.2){ctx.fillStyle=`rgba(160,185,255,${(.07*N).toFixed(3)})`;ctx.beginPath();ctx.moveTo(116,41);ctx.lineTo(146,41);ctx.lineTo(128,66);ctx.lineTo(92,66);ctx.fill();
    ctx.fillStyle=`rgba(160,185,255,${(.05*N).toFixed(3)})`;ctx.beginPath();ctx.moveTo(98,66);ctx.lineTo(132,66);ctx.lineTo(118,84);ctx.lineTo(78,84);ctx.fill()}


  /* ---- foreground: sheet folded over the quilt, then your pajama top rising and falling with each breath ---- */
  for(let x=0;x<160;x++){const y=76+Math.round(2*Math.sin(x/14+0.6))-breath;
    px(x,y,1,6,SH);px(x,y,1,1,SH3);px(x,y+5,1,1,SH2);px(x,y+6,1,90-y-6,PJ)}
  for(let x=2;x<160;x+=7)px(x,83-breath,1,7,PJ2);
  for(let x=0;x<160;x+=1){const y=83-breath+Math.round(3*Math.sin(x/9));px(x,y,1,1,PJH)}

  /* ---- arms: sleeves from the bottom corners, left hand resting by the dog, right hand stroking its side ---- */
  const hand=(x,y,rt)=>{px(x+1,y+6,7,4,SK);px(x,y,9,7,SK);px(x,y,9,1,SKH);px(x,y+6,9,1,SK2);const tx=rt?x-3:x+8;px(tx,y+2,4,4,SK);px(tx,y+5,4,1,SK2);
    px(x,y-4,2,4,SK);px(x+2,y-5,2,5,SK);px(x+4,y-5,2,5,SK);px(x+6,y-4,2,4,SK);px(x+2,y-5,1,5,SKH);px(x+4,y-5,1,5,SKH);
    for(const fx of [2,4,6])px(x+fx,y-3,1,3,SK2);px(x+7,y-4,1,4,SK2)};
  const armAway=typeof TX!=='undefined'&&TX.on&&TX.hl; /* switching the lamp: this same left arm is the one reaching, so it is not also resting by the dog */
  if(!armAway){blob([[6,92,9],[26,83,8],[44,76,6.5],[54,72,5.5]],PJ,PJH,PJ2);
  px(48,70,12,2,SH);px(48,70,12,1,SH3);
  hand(53,62+pt,0)}
  const wig=[0,1,2,1][tick%4];
  blob([[154,92,9],[134,83,8],[116,74,6.5],[104,68,5.5]],PJ,PJH,PJ2);
  px(98+wig,66,12,2,SH);px(98+wig,66,12,1,SH3);
  hand(95+wig,57,1);

  /* ---- idle: the dog snores (Zzz), a moth circles the lamp ---- */
  if(zz>=0){const z=(a,y,w)=>{px(a,y,w,1,'#f3e3c8');px(a+w-1,y+1,1,1,'#f3e3c8');px(a+w-2,y+2,1,1,'#f3e3c8');px(a,y+3,w,1,'#f3e3c8')};
    z(88,32-(zz>>1),4);if(zz>=5)z(94,26-((zz-3)>>1),3)}
  if(mo>=0){const a=mo*.8,mx=Math.round(21+9*Math.cos(a)),my=Math.round(21+6*Math.sin(a));px(mx,my,2,1,'#f3efe6');px(mx-1+(mo%2),my-1,1,1,'#f3efe6aa');px(mx+2-(mo%2),my-1,1,1,'#f3efe6aa')}
  /* ---- soft dark edges, like looking from a pillow ---- */
  for(let i=0;i<6;i++){ctx.fillStyle=`rgba(8,5,20,${((6-i)*.045*(.5+N*.5)).toFixed(3)})`;
    ctx.fillRect(0,i,160,1);ctx.fillRect(0,89-i,160,1);ctx.fillRect(i,0,1,90);ctx.fillRect(159-i,0,1,90)}
}
SCENES.bed={label:"In bed, first-person view",icon:"🛏️",name:"Old Pup",win:[111,9,34,20],setting:"lying in bed beside them late at night, being petted",
  prompt:"You are {pet}, an old, calm dog lying next to the person in bed late at night, being petted. Quiet, steady and warm, like a late-night talk with someone who has known you a long time. Listen first, but also share your own thoughts. Don't lecture. Use an action in asterisks only occasionally.",
  greet:"*settles in beside you* It's late. How was your day, really?",
  back:"*lifts his head* There you are.",
  gest:{pat:8,snore:14,moth:18},hot:[{r:[64,34,32,32],say:["*leans into your hand*","*a long, slow breath*","*thumps his tail once*"]},{r:[12,16,18,22],say:["*the lamp hums softly*"]}],
  draw:drawBed};
