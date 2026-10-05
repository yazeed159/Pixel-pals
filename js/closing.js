/* Closing the loop: quiet endings and small signs that time has passed. Everything is gentle, written in words, and stays
   on this device (cfg.loop, so backups include it). Four parts, each with its own switch in Setup > Closing the loop:
     1. wrap-up   one or two lines about what a conversation was about, saved with its date (Journal > Looking back)
     2. look-back a few sentences about the themes of a finished week, never a score, a count or a graph
     3. milestone a single quiet line in the greeting ("this is our tenth conversation", a year since the first)
     4. sign-off  a brief, scene-fitting line when the app goes away (window hidden, tab or app closed)
   A "conversation" is a stretch of chatting in one place that ends after 30 quiet minutes, when you leave the scene, or
   when the app is closed. Wrap-ups and look-backs are written by your AI provider from that chat (like any reply);
   milestones and sign-offs are local lines with no API call. Loads after company.js and wraps send(), leaveScene() and
   greetLine() instead of editing them. */
(()=>{
cfg.loop=cfg.loop&&typeof cfg.loop==='object'?cfg.loop:{};
const LP=cfg.loop;
LP.n=LP.n||0;LP.first=LP.first||0;LP.last=LP.last||0;
['wraps','weeks','pend','shown'].forEach(k=>{if(!Array.isArray(LP[k]))LP[k]=[]});
if(!LP.open||typeof LP.open!=='object')LP.open={};
['lpwrap','lpweek','lpmile','lpbye'].forEach(k=>{if(cfg[k]!=='0')cfg[k]='1'});
FIELDS.push('lpwrap','lpweek','lpmile','lpbye');
const GAP=30*60*1000,MIN=60*1000;
const dayStr=t=>new Date(t).toLocaleDateString('en-CA');
const shortD=s=>new Date(/^\d{4}-\d\d-\d\d$/.test(s)?s+'T00:00:00':s).toLocaleDateString([],{month:'short',day:'numeric'});
const lastUser=()=>hh().some(m=>m.role==='user'&&m.t>=visit.start);

/* people who already have chats: work out when they started and how many conversations they have had, once */
if(!LP.boot){
  LP.boot=1;
  const ts=[];for(const l of Object.values(H))for(const m of l)if(m.role==='user'&&m.t)ts.push(m.t);
  ts.sort((a,b)=>a-b);
  if(ts.length){LP.first=ts[0];LP.last=ts[ts.length-1];let n=1;for(let i=1;i<ts.length;i++)if(ts[i]-ts[i-1]>GAP)n++;LP.n=n}
  store();
}

/* ---------- following conversations ---------- */
function noteUser(t){
  const p=cfg.place;let s=LP.open[p];
  if(s&&t-s.to>GAP){queueWrap(p);s=null}
  if(!s)s=LP.open[p]={from:t,to:t,u:0,who:nm()};
  s.to=t;s.u++;
  if(t-(LP.last||0)>GAP){LP.n=(LP.n||0)+1;if(!LP.first)LP.first=t}
  LP.last=t;store();
}
const _send=send;
send=function(){
  const before=hh().length,r=_send.apply(this,arguments),h=hh();
  if(h.length>before&&h[h.length-1].role==='user')noteUser(h[h.length-1].t);
  return r;
};
const _leave=leaveScene;
leaveScene=function(p){queueWrap(p);return _leave(p)};
function queueWrap(p){
  const s=LP.open[p];if(!s)return;delete LP.open[p];
  if(cfg.lpwrap==='1'&&cfg.saver!=='1'&&s.u>=2&&!demo())LP.pend.push({place:p,from:s.from,to:s.to,who:s.who});
  store();setTimeout(processPend,50);
}

/* ---------- 1. wrap-up ---------- */
const WRAPSYS="You write one line for a private, gentle record of a conversation between a person and a companion character. In one or two short sentences (under 35 words), say what they talked about, addressed to the person as 'you' (for example: 'You talked about the move and how tired you have been.'). Be plain, kind and specific, using their own details. No advice, no analysis, no diagnosis, no scores, no judgement, no quotation marks, no preamble. If the conversation touched on something painful, stay gentle and simply name it without dramatizing it. Never invent anything.";
const outLang=()=>cfg.rlang==='match'?"the language the person wrote in":(LANGS[LANG]||LANGS.en).ai;
const tidy=(s,n)=>String(s||'').trim().replace(/^["“”']+|["“”']+$/g,'').replace(/\s+/g,' ').slice(0,n);
async function wrapText(j,msgs){
  const convo=msgs.map(m=>(m.role==='user'?(cfg.me||'Person'):j.who)+': '+m.content).join('\n').slice(-6000);
  return tidy(await complete(WRAPSYS+' Write it in '+outLang()+'.',[{role:'user',content:convo+'\n\nWrite the line.'}],null,200),320);
}
let wrapping=false;
async function processPend(){
  if(wrapping||!LP.pend.length)return;wrapping=true;
  try{
    while(LP.pend.length){
      const j=LP.pend[0],msgs=(H[j.place]||[]).filter(m=>m.t>=j.from-1000&&m.t<=j.to+5*MIN);
      let text='';
      if(cfg.lpwrap==='1'&&!demo()&&msgs.filter(m=>m.role==='user').length>=2){
        try{text=await wrapText(j,msgs)}catch(e){j.tries=(j.tries||0)+1;if(j.tries<3){store();break}}
      }
      if(text){LP.wraps.unshift({d:dayStr(j.from),t:j.to,place:j.place,who:j.who,text});LP.wraps=LP.wraps.slice(0,400)}
      LP.pend.shift();store();
    }
  }finally{wrapping=false}
  weeklyCheck();
}

/* ---------- 2. weekly look-back ---------- */
const WEEKSYS="You write a short, quiet look-back at a person's week, from one-line notes about their conversations with companion characters. Write two to four sentences, addressed to the person as 'you', naming the themes that ran through the week: what was on your mind, what shifted, what stayed. Be warm and plain. No numbers, counts, scores, ratings or comparisons, no advice, no diagnosis, no bullet points, no headings, no preamble. Never invent anything beyond the notes.";
const mondayOf=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d};
let weeking=false;
async function weeklyCheck(){
  if(cfg.lpweek!=='1'||cfg.saver==='1'||demo()||weeking||wrapping)return;
  const mon=mondayOf(Date.now());
  for(let k=1;k<=2;k++){
    const a=new Date(mon);a.setDate(a.getDate()-7*k);const b=new Date(a);b.setDate(b.getDate()+7);const key=dayStr(a);
    if(LP.weeks.some(w=>w.wk===key))return;
    const ws=LP.wraps.filter(w=>w.t>=+a&&w.t<+b).sort((x,y)=>x.t-y.t);
    if(ws.length<2)continue;
    weeking=true;
    try{
      const notes=ws.map(w=>w.d+' ('+w.who+'): '+w.text).join('\n');
      const text=tidy(await complete(WEEKSYS+' Write it in '+outLang()+'.',[{role:'user',content:'Notes from the week of '+key+':\n'+notes+'\n\nWrite the look-back.'}],null,400),700);
      if(text){LP.weeks.unshift({wk:key,t:Date.now(),text});LP.weeks=LP.weeks.slice(0,60);store();notifyWeek()}
    }catch(e){}
    weeking=false;return;
  }
}
const unseenWeek=()=>LP.weeks.find(w=>!w.seen);
const WEEKNOTE='*sets a folded note down* I wrote down how the week looked from here. It is under Journal, then Looking back.';
function notifyWeek(){ /* while the screen is quiet and you have not started talking yet; otherwise the next greeting mentions it */
  const w=unseenWeek();if(!w||w.told||busy||typing||document.hidden||document.querySelector('dialog[open]')||msg.value||lastUser())return;
  w.told=1;store();say(WEEKNOTE);
}

/* ---------- 3. milestones ---------- */
const MW={10:'tenth',25:'twenty-fifth',50:'fiftieth',100:'hundredth',250:'two hundred and fiftieth',500:'five hundredth',1000:'thousandth'};
const MLINE=[
  w=>'*glances up* This is our '+w+' conversation. I was not counting. Not out loud, anyway.',
  w=>'*smiles quietly* Our '+w+' conversation, if you were wondering. I like how these have been going.'
];
function milestone(){ /* this greeting is conversation number n+1; each one is mentioned once, in a single line */
  if(cfg.lpmile!=='1'||!LP.first)return '';
  const next=(LP.n||0)+1,id='n'+next;
  if(MW[next]&&!LP.shown.includes(id)){LP.shown.push(id);store();return MLINE[next%2](MW[next])}
  const f=new Date(LP.first),now=new Date();let y=now.getFullYear()-f.getFullYear();
  if(now.getMonth()<f.getMonth()||(now.getMonth()===f.getMonth()&&now.getDate()<f.getDate()))y--;
  if(y>=1&&!LP.shown.includes('y'+y)){LP.shown.push('y'+y);store();
    return '*looks at you a moment* It has been '+(y===1?'a year':y+' years')+' since our first conversation. Thank you for coming back.'}
  return '';
}
const _gl=greetLine;
greetLine=function(){
  let g=_gl();const m=milestone();
  if(m)g+=' '+m;
  else{const w=unseenWeek();if(w&&!w.told&&cfg.lpweek==='1'){w.told=1;store();g+=' '+WEEKNOTE}}
  return g;
};

/* ---------- 4. sign-off ---------- */
const BYE={
  bed:['*a sleepy tail thump* Goodnight. I will keep the warm spot.','*yawns and curls up* Sleep well. I am right here.'],
  therapy:['Take care of yourself until next time. We can pick this up whenever you like.','Be gentle with yourself today. The door is open when you want it.'],
  camp:['*pokes the embers* Go easy. The fire will keep.','*nods at the fire* Safe travels. We will sit again.'],
  train:['*pours the last of the tea* Safe travels. The night train runs again tomorrow.','*a small bow* Until the next station.'],
  diner:['*wipes the counter* Get home safe. Coffee is on me next time.','*taps the counter twice* Drive careful. The light stays on.'],
  library:['*closes the book on one finger* Shh... go well. The chair keeps.','*nods softly* Good night. I will leave the lamp on.'],
  lighthouse:['*the lamp turns* Fair winds. I will keep the light.','*tips his cap* Steady on. The light will be here.'],
  trading:['*sets down the watering can* Rest well. Nothing here is urgent.','*smiles* Good night. The plants and I will be here.'],
  kitchen:['*lifts the mug* Sleep well. I will rinse these.','*smiles over the rim* Goodnight. The kettle will be warm.']
};
const BYE0=['*smiles* Take care. Until next time.','*a small wave* Be well. See you soon.'];
let away=null,lastBye='';
function byeLine(){
  const a=(!occ()&&BYE[cfg.place])||BYE0,c=a.filter(x=>x!==lastBye);
  return lastBye=c[Math.floor(Math.random()*c.length)]||a[0];
}
function goAway(){
  if(away)return;
  away={t:Date.now(),title:document.title,old:null,el:null,line:''};
  if(cfg.lpbye!=='1'||!lastUser())return;
  const line=away.line=byeLine();
  clearInterval(timer);typing=talking=false;
  if(cfg.style==='bubbles')away.el=bub('ai',line);
  else{txt=$('#txt');away.old=txt.textContent;txt.textContent=line;arrow.style.visibility='hidden'}
  document.title=nm()+': '+(line.replace(/\*[^*]*\*\s*/g,'').trim()||line.replace(/\*/g,''));
}
function comeBack(){
  if(!away)return;const a=away;away=null;document.title=a.title;
  const idle=!busy&&!msg.value&&!document.querySelector('dialog[open]')&&!(typeof act!=='undefined'&&act);
  if(a.el)a.el.remove();
  if(Date.now()-a.t>=GAP&&idle){greet();return} /* back after a long while: a fresh greeting, which can carry a milestone */
  if(a.old!==null&&txt.id==='txt'&&txt.textContent===a.line)txt.textContent=a.old;
  if(a.old!==null)arrow.style.visibility=ci<chunks.length-1?'visible':'hidden';
}
document.addEventListener('visibilitychange',()=>document.hidden?goAway():comeBack());
window.addEventListener('pagehide',goAway);
window.addEventListener('pageshow',comeBack);

/* ---------- housekeeping: end quiet conversations, write what is waiting ---------- */
function sweep(){
  const now=Date.now();
  for(const p of Object.keys(LP.open))if(now-LP.open[p].to>GAP)queueWrap(p);
  processPend().then(()=>{weeklyCheck();notifyWeek()});
}
setInterval(sweep,MIN);setTimeout(sweep,3000);

/* ---------- Journal > Looking back ---------- */
const lbd=$('#lbd');
function lbRender(){
  const L=$('#lbl');L.textContent='';
  if(!LP.weeks.length&&!LP.wraps.length){L.textContent='Nothing yet.';return}
  const card=(head,body,del,week)=>{
    const d=document.createElement('div'),h=document.createElement('small'),sp=document.createElement('span'),b=document.createElement('button'),p=document.createElement('div');
    d.className='je'+(week?' lbw':'');sp.textContent=head;b.type='button';b.textContent='Delete';
    b.onclick=()=>{if(confirm(T('Delete this entry?'))){del();store();lbRender()}};
    h.append(sp,b);p.textContent=body;d.append(h,p);L.append(d);
  };
  LP.weeks.forEach(w=>card(T('Week of')+' '+shortD(w.wk),w.text,()=>{LP.weeks.splice(LP.weeks.indexOf(w),1)},true));
  LP.wraps.forEach(w=>card(w.d+(w.who?' · '+w.who:''),w.text,()=>{LP.wraps.splice(LP.wraps.indexOf(w),1)}));
}
function openLB(){LP.weeks.forEach(w=>{w.seen=1});store();lbRender();lbd.showModal()}
$('#lbb').onclick=()=>{jrd.close();openLB()};
$('#lbopen').onclick=()=>{dlg.close();openLB()};
$('#lbx').onclick=()=>lbd.close();
$('#lbexp').onclick=()=>download('pixel-looking-back.txt',new Blob([
  [...LP.weeks.map(w=>'Week of '+w.wk+'\n'+w.text),...LP.wraps.map(w=>w.d+(w.who?' ('+w.who+')':'')+'\n'+w.text)].join('\n\n')||'Nothing yet.'],{type:'text/plain'}));
})();
