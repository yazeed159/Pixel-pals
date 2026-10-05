/* Life: the things that make a return visit feel different.
   1. Visitors  - now and then something small wanders into the scene (a moth at the lamp, a stray cat on the rooftop...).
   2. Inner state - a quiet mood that carries over: tired after a long talk, restless after time away. It shows in posture
      and in how the character opens the next conversation. It is worked out from your saved chats, so nothing extra is stored.
   3. Rituals - a repeatable opening (evening tea, morning coffee, goodnight, or your own) that the character notices when you keep it up.
   Loads after backgrounds.js. It wraps greetLine(), sys(), send() and respond() instead of editing them, and core.js calls
   lifePose() before a scene is drawn and lifeOver() after it. Settings are the five fields below, in Setup > Visitors, moods & rituals. */

const LDEF={visitors:'2',inner:'1',ritual:'',ritualT:'19:30',ritualX:''};
for(const k in LDEF)if(cfg[k]===undefined)cfg[k]=LDEF[k];
if(!cfg.rit||!Array.isArray(cfg.rit.days))cfg.rit={days:[]}; /* days you kept the ritual, 'YYYY-MM-DD' */
FIELDS.push('visitors','inner','ritual','ritualT','ritualX');

const LIFE={drawn:false,st:'',gap0:0,pv:null,next:0,count:0,hot:null,hotScene:'',ritOpen:null};
const NOLIFE={therapy:1}; /* the therapy room stays about you: no moods, no rituals */
const rnd=([a,b])=>a+Math.random()*(b-a);
const ph=(p,a,b)=>Math.max(0,Math.min(1,(p-a)/(b-a)));
const lerp=(a,b,t)=>a+(b-a)*t;

/* ================= inner state ================= */
/* the most recent run of messages in a place, where a gap of 45 minutes ends a conversation */
function lastSession(place){
  const L=(H[place]||[]).filter(m=>m.t);if(!L.length)return null;
  let i=L.length-1,n=1;
  while(i>0&&L[i].t-L[i-1].t<45*6e4){i--;n++}
  return {start:L[i].t,end:L[L.length-1].t,n};
}
function computeState(){
  const pl=cfg.place,L=H[pl]||[];
  if(cfg.inner!=='1'||NOLIFE[pl]||!L.length)return '';
  const s=lastSession(pl),now=Date.now();
  /* a long talk (about eight exchanges, or most of an hour) leaves them tired for the next few hours */
  if(s&&now-s.end<7*36e5&&(s.n>=16||(s.n>=8&&s.end-s.start>45*6e4)))return 'tired';
  /* time away leaves them restless, until you have talked a little */
  const userNow=L.filter(m=>m.role==='user'&&m.t>=visit.start).length;
  if(LIFE.gap0>=3*864e5&&userNow<3)return 'restless';
  return '';
}
const STATE_LINES={
  tired:['*stifles a yawn* We talked for ages last time. I am still a little worn out, in a good way.','*blinks slowly* Long talk, last time. I am moving at half speed today.','*settles in with a sigh* Be gentle with me, I am still sleepy.'],
  restless:['*fidgets, then settles* There you are. It has been too quiet.','*can\'t quite sit still* Sorry. I got restless. I am glad you are here.','*shifts about* It has been a while. Sit, talk, I will calm down.']
};

/* posture: whole-character offsets that core.js applies to anything drawn between CH.b() and CH.e() */
function lifePose(){
  CH.dx=0;CH.dy=0;
  const st=LIFE.st;if(!st)return;
  if(st==='tired'){
    CH.dy=2+(ev(44,5,6)>=0?1:0); /* sunk a little, and now and then a deeper sigh */
    if(moodT<=0&&!talking&&!thinking&&ev(70,12,5)>=0){mood='sleepy';moodT=3}
  }else{
    if(!quietMotion()){const r=ev(16,7,2);if(r>=0)CH.dx=[-1,1,-1,1,0,-1,0][r]; /* rocking from side to side */
    if(ev(37,2,11)>=0)CH.dy=-1} /* a small hop */
  }
}
setInterval(()=>{LIFE.st=computeState()},20000);

/* ================= visitors ================= */
const spr=(rows,x,y,pal,flip)=>rows.forEach((r,j)=>{
  const n=r.length;let i=0;
  while(i<n){const ch=r[flip?n-1-i:i];if(ch==='.'){i++;continue}
    let k=i+1;while(k<n&&r[flip?n-1-k:k]===ch)k++;
    px(x+i,y+j,k-i,1,pal[ch]);i=k}
});
const cpx=(x,y,w,h,c,R)=>{const x0=Math.max(x,R[0]),x1=Math.min(x+w,R[2]),y0=Math.max(y,R[1]),y1=Math.min(y+h,R[3]);if(x1>x0&&y1>y0)px(x0,y0,x1-x0,y1-y0,c)};
const sil=()=>byDay('#0d0a18','#3b3050');

const CAT_W=[["..........b.b","..........bbb","t.bbbbbbbbbgb","tbbbbbbbbbbb.",".bbbbbbbbbbb.","..b.b...b.b..","..b.b...b.b.."],
             ["..........b.b","..........bbb","t.bbbbbbbbbgb","tbbbbbbbbbbb.",".bbbbbbbbbbb.","...b.b.b.b...","...b.b.b.b..."]];
const CAT_S=[".......b.b",".......bbb",".......bgb","......bbbb",".....bbbbb","....bbbbbb","...bbbbbbb","..bbbbbbbb","t.bbbbbbbb","tbbbbbbbbb"];
const CAT_S2=[".......b.b",".......bbb",".......bgb","......bbbb",".....bbbbb","....bbbbbb","...bbbbbbb","..bbbbbbbb",".tbbbbbbbb","ttbbbbbbbb"];
const MOTH=[["oo.b.oo","owwbwwo",".wwbww.","...b..."],["...b...",".wwbww.","owwbwwo","oo.b.oo"]];
const HOG=[["....sSsS....","..sSsSsSs...",".sSsSsSsSff.","sssssssssfen",".ssssssssff.","..l.l..l.l.."],
           ["....sSsS....","..sSsSsSs...",".sSsSsSsSff.","sssssssssfen",".ssssssssff.",".l.l..l.l..."]];
const MOUSE=[["....bb..","tbbbbebn",".bbbbbb.","..l..l.."],["....bb..","tbbbbebn",".bbbbbb.",".l..l..."]];
const BIRD=["..bb.....",".bbeb....","ybbbbb...",".bwwbbbbt","..wwbbbt.","...l.l..."];
const TURTLE=[["....ssss......","..ssSsSsss.hh.",".ssSsSsSssshhe","..ssSsSsss.hh.","....ssss......","..ff....ff...."],
              ["....ssss......","..ssSsSsss.hh.",".ssSsSsSssshhe","..ssSsSsss.hh.","....ssss......","...ff..ff....."]];

/* every draw(p, placement) gets p = 0..1 through the visit, draws with px, and returns its box [x,y,w,h] for tapping */
const VD={
  moth(p,P){
    const off=(1-ph(p,0,.1))*80+ph(p,.9,1)*80,a=tick*.9+P.y,r=3.5+2*Math.sin(tick/4+P.x);
    const x=Math.round(P.x+off+Math.cos(a)*r*1.7)-3,y=Math.round(P.y+Math.sin(a*1.3)*r*.9)-2;
    spr(MOTH[tick%2],x,y,{o:'#9a8a6a',w:'#efe3c4',b:'#4a3a2a'});
    return [x-1,y-1,9,6];
  },
  ledgecat(p,P){
    /* walks in along the ledge, sits and watches the city for a while, then wanders back off */
    const x=Math.round(p<.38?lerp(-14,P.stop,ph(p,0,.38)):p<.8?P.stop:lerp(P.stop,-16,ph(p,.8,1))),c={b:sil(),t:sil(),g:'#ffd27a'};
    if(p>=.38&&p<.8){spr(tick%10<5?CAT_S:CAT_S2,x,P.y-10,c);return [x,P.y-10,10,10]}
    spr(CAT_W[tick%2],x,P.y-7,c,p>=.8);return [x,P.y-7,13,7];
  },
  sillcat(p,P){
    const rise=ph(p,0,.12)-ph(p,.88,1),y=P.y+Math.round((1-rise)*11);
    spr(tick%12<6?CAT_S:CAT_S2,P.x,y,{b:sil(),t:sil(),g:'#ffd27a'},true);
    return [P.x,y,10,10];
  },
  ship(p,P){
    const x=Math.round(lerp(-50,170,p)),C=byDay('#050b1c','#14405e')+'e0',W='#ffffff30';
    px(x,0,38,1,C);px(x+1,1,36,1,C);px(x+3,2,31,1,C);px(x+6,3,23,1,C);px(x+11,4,12,1,C);px(x+30,3,3,3,C);
    for(let i=0;i<5;i++)px(x-4-i*4+((tick+i)%3),2+((tick*2+i*3)%9),1,1,W);
    return [x,0,38,6];
  },
  turtle(p,P){
    const x=Math.round(lerp(-18,172,p)),y=P.y+Math.round(3*Math.sin(p*14));
    spr(TURTLE[tick%2],x,y,{s:'#3f8a5a',S:'#7ac28a',h:'#9ad8a0',e:'#10281a',f:'#2f6a48'});
    return [x,y,14,8];
  },
  bird(p,P){
    const rise=ph(p,0,.1)-ph(p,.9,1),dy=Math.round((1-rise)*18),hop=ev(17,2,3)>=0?1:0,fl=(tick%9<3);
    spr(BIRD,P.x,P.y-5-hop+dy,{b:'#6a8ac8',e:'#1c1730',y:'#f0b84a',w:'#e8e0d0',t:'#4a6aa8',l:'#3a2a20'},fl);
    return [P.x,P.y-5-hop+dy,9,6];
  },
  hog(p,P){
    /* shuffles in from the right, stops to sniff the air near the fire, then goes on */
    const stop=ph(p,.45,.7)>0&&ph(p,.45,.7)<1,x=p<.45?lerp(172,106,ph(p,0,.45)):p<.7?106:lerp(106,-14,ph(p,.7,1));
    spr(HOG[stop?0:tick%2],Math.round(x),P.y-6,{s:'#5a4030',S:'#9a7a58',f:'#d8b890',e:'#1a1020',n:'#1a1020',l:'#3a2a20'},p>=.7);
    return [Math.round(x),P.y-6,12,6];
  },
  mouse(p,P){
    /* runs in, freezes for a sniff, then bolts */
    const xx=p<.35?Math.round(lerp(168,96,ph(p,0,.35))):p<.6?96:Math.round(lerp(96,-10,ph(p,.6,1)));
    spr(MOUSE[(p>.35&&p<.6)?0:tick%2],xx,P.y-4,{b:'#8a8a98',t:'#d8a0a0',e:'#1c1730',n:'#e89aa8',l:'#4a4a58'},true);
    return [xx,P.y-4,8,4];
  },
  pass(p,P){
    /* another train going the other way: a streak of lit windows behind the glass */
    const R=[22,12,138,52],x=Math.round(lerp(150,-130,p)),n=6;
    for(let k=0;k<n;k++){const cx=x+k*26;cpx(cx,36,24,14,'#0e1226',R);cpx(cx,36,24,2,'#1a1f3a',R);for(let w=0;w<3;w++)cpx(cx+3+w*7,39,5,5,'#ffd27a',R)}
    cpx(x,50,n*26,1,'#0a0d1c',R);
    return [Math.max(22,x),36,Math.min(116,Math.max(0,n*26+x-22)),14];
  },
  walker(p,P){
    /* somebody out in the street with an umbrella */
    const R=[8,10,60,42],x=Math.round(lerp(0,62,p)),U=P.u||'#d9798f',K='#14101e',leg=tick%2;
    cpx(x-1,19,9,1,U,R);cpx(x-2,20,11,1,U,R);cpx(x-3,21,13,1,U,R);cpx(x+3,22,1,4,K,R);
    cpx(x+2,26,3,3,K,R);cpx(x+1,29,5,6,K,R);cpx(x+1+leg,35,2,4,K,R);cpx(x+4-leg,35,2,4,K,R);
    return [Math.max(8,x-3),19,13,20];
  }
};

/* what each kind is, what the character says when it turns up, and what a tap does */
const VK={
  moth:{dur:30,phrase:'a moth is circling the light',say:['*glances up* A moth found the light. Let it stay.','*watches it circle* Little thing. It cannot decide about the lamp.'],tap:['*the moth startles, then circles back*']},
  ledgecat:{dur:42,phrase:'a stray cat is walking along the ledge',say:['*goes still* A stray, on the ledge. It does this sometimes.','*quietly* Do not move. It is deciding about us.'],tap:['*the cat glances over, unimpressed*']},
  sillcat:{dur:32,phrase:'a cat has appeared on the window sill outside',say:['*nods at the window* A cat on the sill. It comes to supervise.','*lowers voice* There is a cat at the window. Pretend you did not see it.'],tap:['*the cat blinks slowly at you*']},
  ship:{dur:38,phrase:'the shadow of a ship is passing slowly overhead',say:['*looks up* A ship, way up on the surface. It does not know we are here.','*follows the shadow overhead* Slow ship. Nobody on it is in any hurry.'],tap:['*the ship goes on, unbothered*']},
  turtle:{dur:36,phrase:'a sea turtle is drifting past',say:['*smiles* A turtle. It has somewhere to be, and all the time to get there.','*watches it glide by* Look at that. Not one wasted stroke.'],tap:['*the turtle turns an eye toward you and keeps going*']},
  bird:{dur:24,phrase:'a small bird has landed on the window sill',say:['*glances at the window* A little bird on the sill.','*quietly* A bird, just outside. Let us not startle it.'],tap:['*the bird tilts its head*']},
  hog:{dur:38,phrase:'a hedgehog is shuffling past the camp',say:['*peers over the fire* Hedgehog. It is checking whether we are worth the trouble.','*whispers* Do not move. Hedgehogs startle.'],tap:['*the hedgehog freezes, then carries on*']},
  mouse:{dur:15,phrase:'a mouse is scurrying across the floor',say:['*glances down* A mouse. It thinks we have not noticed.','*lowers voice* A mouse. We have an understanding, it and I.'],tap:['*the mouse darts for cover*']},
  pass:{dur:6,phrase:'another train just rushed past the window the other way',say:['*the window flickers* Another train, going the other way. Whoosh.','*glances at the glass* Somebody else is travelling tonight.'],tap:['*the lights have already gone*']},
  walker:{dur:24,phrase:'someone with an umbrella is walking past outside',say:['*glances at the window* Somebody out walking, in this. Brave, or stubborn.','*nods at the street* Another late one, out there on their own business.'],tap:['*the figure walks on*']}
};
/* where they turn up. when: 'dark' = not in daylight, 'light' = daytime and the edges of it. */
const PLACEV={
  bed:[{k:'moth',x:21,y:22,d:.5,when:'dark'}],
  therapy:[{k:'bird',x:136,y:39,d:.2,when:'light'},{k:'moth',x:131,y:26,d:.2,when:'dark'}],
  camp:[{k:'hog',y:86,d:1,when:'dark'}],
  train:[{k:'pass',d:.3,when:'dark',behind:true}],
  diner:[{k:'walker',d:.2,when:'dark'}],
  rooftop:[{k:'moth',x:96,y:34,d:.5,when:'dark'}],
  library:[{k:'moth',x:105,y:38,d:.5,when:'dark'},{k:'mouse',y:87,d:1}],
  lighthouse:[{k:'moth',x:30,y:33,d:.5,when:'dark'}],
  kitchen:[{k:'sillcat',x:114,y:30,d:.3},{k:'mouse',y:86,d:1},{k:'moth',x:80,y:15,d:.5,when:'dark'}]
};
const okTime=w=>!w||(w==='dark'?TM!=='day':(TM==='day'||TM==='dawn'||TM==='sunset'));
const VFREQ={'3':{first:[20,60],gap:[100,220],max:5,p:1},'2':{first:[45,120],gap:[240,540],max:3,p:.8},'1':{first:[90,240],gap:[600,1200],max:2,p:.5}};

function endVisitor(){
  if(LIFE.hot&&SCENES[LIFE.hotScene]){const h=SCENES[LIFE.hotScene].hot;const i=h?h.indexOf(LIFE.hot):-1;if(i>0)h.splice(i,1)}
  LIFE.hot=null;LIFE.pv=null;
}
function startVisitor(pl,early,forced){
  endVisitor();
  const def=VK[pl.k],dur=def.dur*1000;
  LIFE.pv={pl,def,dur,t0:Date.now()-(early?dur*.2:0),said:!!early,forced:!!forced};
  LIFE.count++;
  const f=VFREQ[cfg.visitors];LIFE.next=Date.now()+dur+(f?rnd(f.gap)*1000:60000);
  const sc=SCENES[cfg.place];
  if(sc&&sc.hot){LIFE.hot={r:[0,0,0,0],say:def.tap};LIFE.hotScene=cfg.place;sc.hot.push(LIFE.hot)}
}
function pickVisitor(force){
  const all=PLACEV[cfg.place]||[],ok=all.filter(o=>okTime(o.when));
  return pick(ok.length?ok:(force?all:ok))||null;
}
function planVisitors(){
  LIFE.count=0;const f=VFREQ[cfg.visitors];
  LIFE.next=Date.now()+(f?rnd(f.first)*1000:0);
}
/* the character can only speak when nobody is mid-sentence, typing, or in a dialog */
const quiet=()=>!busy&&!typing&&!thinking&&!sit&&!actBusy()&&!document.querySelector('dialog[open]')&&!msg.value.trim()&&document.activeElement!==msg&&ci>=chunks.length-1&&Date.now()-lastAct>10000;
function drawVisitor(v,p,s){
  const on=CH.on;CH.on=0;
  const box=VD[v.pl.k](p,v.pl,s);
  CH.on=on;
  if(LIFE.hot&&box)LIFE.hot.r=[box[0]-2,box[1]-2,box[2]+4,box[3]+4];
}
/* called by CH.b() just before a scene draws its character: visitors that belong behind the character go here */
function lifeBehind(){
  try{const v=LIFE.pv;if(!v||!v.pl.behind||LIFE.drawn)return;
    const p=(Date.now()-v.t0)/v.dur;if(p>=1)return;
    drawVisitor(v,p,CURPAL);LIFE.drawn=true}catch(e){}
}
function lifeOver(s){
  try{
    let v=LIFE.pv;
    if(quietMotion()&&!(v&&v.forced)){if(v)endVisitor();LIFE.drawn=false;return}
    if(v&&cfg.visitors==='0'&&!v.forced){endVisitor();v=null}
    if(!v){
      const f=VFREQ[cfg.visitors];
      if(!f||Date.now()<LIFE.next||LIFE.count>=f.max||document.hidden||act||calm||br||document.querySelector('dialog[open]')){LIFE.drawn=false;return}
      if(Math.random()>f.p){LIFE.next=Date.now()+rnd(f.gap)*1000;return}
      const o=pickVisitor(false);if(!o){LIFE.next=Date.now()+30000;return}
      startVisitor(o);v=LIFE.pv;
    }
    const p=(Date.now()-v.t0)/v.dur;
    if(p>=1){endVisitor();LIFE.drawn=false;return}
    if(!LIFE.drawn)drawVisitor(v,p,s);
    LIFE.drawn=false;
    if(!v.said&&p>.12&&p<.9&&quiet()){
      v.said=true;const line=pick(v.def.say);
      lastNudge={text:line,t:Date.now(),ctx:', unprompted, because '+v.def.phrase};
      qr=[];
      say(line);fillQR(line);
    }
  }catch(e){LIFE.drawn=false}
}
/* Setup > Preview a visitor, and a handy hook for testing: LIFE_summon('moth') */
function LIFE_summon(k){
  const all=PLACEV[cfg.place]||[];
  const o=(k&&all.find(x=>x.k===k))||pickVisitor(true);
  if(o)startVisitor(o,false,true);return !!o;
}

/* ================= rituals ================= */
const RIT={
  tea:{label:'Evening tea',t:'19:30',desc:()=>'a quiet evening tea together',
    first:()=>'*settles in* It is about our tea hour, if you want one. Picture a warm cup in your hands. I will have mine.',
    again:()=>'*settles in, just like yesterday* Same hour, same warm cup. I like this.',
    many:n=>'*settles in without a word* '+(n>=7?'Evening tea again, as it has been for days.':n+' evenings of tea now.')+' I like how this has become ours.',
    back:()=>'*settles in as if no time had passed* Warm cup in hand? Good. Welcome back to it.'},
  coffee:{label:'Morning coffee',t:'08:00',desc:()=>'a slow morning coffee together',
    first:()=>'*stretches* Morning. Shall we have a slow coffee before the day gets loud? Imaginary cups are fine.',
    again:()=>'*stretches* Same hour as yesterday. Coffee, then.',
    many:n=>'*stretches and smiles* '+(n>=7?'Morning coffee, as usual.':n+' mornings running.')+' The day starts better this way.',
    back:()=>'*pours an imaginary cup* Morning. Coffee is still coffee, whenever you come to it.'},
  goodnight:{label:'Goodnight',t:'22:30',desc:()=>'closing the day together before bed',
    first:()=>'*turns things low* It is about the hour for closing the day. Shall we? Tell me one thing from today.',
    again:()=>'*turns things low* Same time as last night. Let us close the day.',
    many:n=>'*turns things low* '+(n>=7?'Closing the day, the way we do.':n+' nights of this now.')+' It is a good way to end a day.',
    back:()=>'*turns things low* There you are. Come, let us close this day gently.'},
  custom:{label:'Your own',t:'19:00',desc:x=>x,
    first:x=>'*smiles* It is about the hour for '+x+'. Shall we make a habit of it?',
    again:x=>'*smiles* Same time as yesterday: '+x+'. I like this.',
    many:(n,x)=>'*smiles* '+x+', '+(n>=7?'as always':n+' days running now')+'. This is ours.',
    back:x=>'*smiles* There you are. '+x+', as ever.'}
};
const ritX=()=>(cfg.ritualX||'our little ritual').trim();
const ritTime=()=>cfg.ritualT||(RIT[cfg.ritual]||{}).t||'19:30';
function inWindow(){
  if(!RIT[cfg.ritual])return false;
  const [h,m]=ritTime().split(':').map(Number),d=new Date(),now=d.getHours()*60+d.getMinutes(),t=(h||0)*60+(m||0),diff=Math.abs(now-t);
  return Math.min(diff,1440-diff)<=90;
}
const dstr=d=>d.toLocaleDateString('en-CA');
const shiftDay=(ds,n)=>{const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return dstr(d)};
function runEndingAt(ds){let n=0;const S=new Set(cfg.rit.days);while(S.has(ds)){n++;ds=shiftDay(ds,-1)}return n}
function ritualOpen(){
  const R=RIT[cfg.ritual];
  if(!R||NOLIFE[cfg.place]||!inWindow()||cfg.rit.days.includes(today()))return '';
  const S=cfg.rit.days,run=runEndingAt(shiftDay(today(),-1)),n=run+1;
  const lastKept=S.length?[...S].sort().pop():'',back=!run&&S.length&&runEndingAt(lastKept)>=3;
  LIFE.ritOpen={n,k:cfg.ritual};
  const x=ritX();
  return back?R.back(x):n===1?R.first(x):n===2?R.again(x):R.many(n,x);
}
function ritualKept(){ /* called when you send a message */
  if(!RIT[cfg.ritual]||NOLIFE[cfg.place]||!inWindow()||cfg.rit.days.includes(today()))return;
  cfg.rit.days=[...new Set([...cfg.rit.days,today()])].sort().slice(-90);store();
}
function ritualSummary(){
  if(!RIT[cfg.ritual])return '';
  let k=0;for(let i=0;i<7;i++)if(cfg.rit.days.includes(shiftDay(today(),-i)))k++;
  return k?'Kept '+k+' of the last 7 days. Missing a day is fine.':'Not kept yet. The character will notice when you do.';
}

/* ================= wiring ================= */
const _glLife=greetLine;
greetLine=function(){
  /* a fresh visit: work out the mood, plan the visitors, maybe find one already there */
  const L=H[cfg.place]||[],lt=L.reduce((a,m)=>m.t>a?m.t:a,0);
  LIFE.gap0=lt?Date.now()-lt:0;LIFE.ritOpen=null;
  LIFE.st=computeState();
  endVisitor();planVisitors();
  let early=null;
  if(cfg.visitors!=='0'&&!document.querySelector('dialog[open]')){
    const f=VFREQ[cfg.visitors]||VFREQ['2'];
    if(Math.random()<(LIFE.gap0>12*36e5?.3:.12)*f.p){early=pickVisitor(false);if(early)startVisitor(early,true)}
  }
  let g=_glLife();
  const rl=ritualOpen();
  if(rl)g=rl;
  if(LIFE.st&&STATE_LINES[LIFE.st])g+=' '+pick(STATE_LINES[LIFE.st]);
  else if(early&&LIFE.pv)g+=' '+pick(LIFE.pv.def.say);
  return g;
};
const _sysLife=sys;
sys=function(){
  let p=_sysLife();
  const v=LIFE.pv;
  if(v)p+=' Right now '+v.def.phrase+', visible in the scene. You may glance at it or mention it once if that feels natural; do not narrate it in every message.';
  if(LIFE.st==='tired')p+=' Your quiet inner state: you are a little tired after a long conversation earlier. Let it color how you open (softer, slower, maybe a yawn), but do not complain, do not make the person feel responsible for it, and do not keep bringing it up.';
  else if(LIFE.st==='restless')p+=' Your quiet inner state: it has been a while since you two talked, and you were a bit restless without company. Let it show lightly in how you open (eager, a little fidgety) and say you are glad they are here. Never make them feel guilty for being away.';
  const early=hh().filter(m=>m.role==='assistant'&&m.t>=visit.start).length<3;
  if(LIFE.ritOpen&&early){const R=RIT[LIFE.ritOpen.k];if(R)p+=' You and the person have a small daily ritual: '+R.desc(ritX())+' (around '+ritTime()+'). '+(LIFE.ritOpen.n>1?'Today is day '+LIFE.ritOpen.n+' in a row of keeping it. ':'')+'Acknowledge it warmly and briefly, once, in your own voice. It is never an obligation; never make them feel guilty if they miss a day.'}
  return p;
};
const _sendLife=send;
send=function(over){
  const t=(typeof over==='string'?over:msg.value).trim();
  if(t&&!busy)ritualKept();
  return _sendLife.apply(this,arguments);
};
const _respondLife=respond;
respond=async function(f){await _respondLife(f);LIFE.st=computeState()};

/* Setup */
function lifeSetup(){
  const R=RIT[$('#ritual').value];
  $('#ritXw').hidden=$('#ritual').value!=='custom';
  $('#ritualT').disabled=!R;
  if(R&&!$('#ritualT').value)$('#ritualT').value=R.t;
  $('#ritst').textContent=ritualSummary();
}
let lastRitual=cfg.ritual;
$('#ritual').onchange=()=>{
  const R=RIT[$('#ritual').value],old=RIT[lastRitual],t=$('#ritualT');
  if(R&&(!t.value||(old&&t.value===old.t)))t.value=R.t;
  lastRitual=$('#ritual').value;lifeSetup();
};
$('#gear').addEventListener('click',()=>{lastRitual=cfg.ritual;lifeSetup()});
$('#visnow').onclick=()=>{dlg.close();if(!LIFE_summon())say('*looks around* Nobody is passing by here today.')};
