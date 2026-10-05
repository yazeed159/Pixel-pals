/* Chat: calls to each AI provider, sending / redoing / editing messages,
   quick replies, long-term memory (summaries), the daily check-in and greetings. */
const STARTERS=["Hi.","Long day.","Just here to hang out."];
let streamed=false,ckAsk=false,summing=false;
const NOKEY='(I need an AI key to answer. Open Setup, under AI provider, and add one.)';
const PICK={anthropic:d=>d.type==='content_block_delta'&&d.delta&&d.delta.text||'',gemini:d=>(d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join(''),oa:d=>d.choices?.[0]?.delta?.content||''};
const demo=()=>!cfg.keys[cfg.provider]&&cfg.provider!=='custom';
async function readStream(r,pick,onDelta){
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='',all='';
  for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const lines=buf.split('\n');buf=lines.pop();
    for(const l of lines){if(!l.startsWith('data:'))continue;const j=l.slice(5).trim();if(!j||j==='[DONE]')continue;try{const t=pick(JSON.parse(j));if(t){all+=t;onDelta(all)}}catch(e){}}}
  return all;
}
/* ---- several keys and backup models, with automatic failover ----
   Each provider can hold many keys (one per line in Setup) and a list of models (comma separated). A "slot" is one key with one model.
   Free-tier limits are counted per key AND per model, so when a slot is rate limited it rests for a while and the next slot takes over
   on the same request, with the same conversation. If every slot of the chosen provider is resting, the other providers that have
   keys are tried (unless turned off in Setup). The resting times are kept in localStorage so a reload does not hit a dead key again. */
const keyList=p=>String(cfg.keys[p]||'').split(/[\s,;]+/).filter(Boolean);
const modelList=p=>String(cfg.models[p]||MODELS[p]||'').split(/[,\n]+/).map(x=>x.trim()).filter(Boolean);
let COOL={};try{COOL=JSON.parse(localStorage.getItem('pdCool')||'{}')}catch(e){}
const sid=(p,k,m)=>p+'|'+k.slice(-10)+'|'+m;
const rest=(p,k,m)=>Math.max(0,(COOL[sid(p,k,m)]||0)-Date.now());
function rested(p,k,m,ms){COOL[sid(p,k,m)]=Date.now()+ms;for(const x in COOL)if(COOL[x]<Date.now())delete COOL[x];try{localStorage.setItem('pdCool',JSON.stringify(COOL))}catch(e){}}
const nap=ms=>new Promise(r=>setTimeout(r,ms));
let keyNote=''; /* what the last failover did, shown in Setup */
function limitInfo(r,d,status,msg){
  const raw=msg+' '+JSON.stringify(d||{});
  const limit=status===429||status===503||status===529||/quota|rate.?limit|resource.?exhausted|too many requests|overloaded|capacity/i.test(raw);
  const bad=!limit&&(status===401||status===403||/api key not valid|invalid api.?key|incorrect api key|api key.*(expired|invalid)|permission.?denied/i.test(raw));
  let ms=60e3;
  const ra=Number(r.headers&&r.headers.get&&r.headers.get('retry-after'));
  const m=/retry (?:in|after) ([\d.]+)\s*s/i.exec(raw);
  if(ra>0)ms=ra*1000;else if(m)ms=Math.ceil(Number(m[1])*1000)+1000;
  if(/PerDay|per day|daily|RPD/i.test(raw))ms=Math.max(ms,45*60e3); /* a daily quota will not come back in a minute */
  if(status===503||status===529)ms=Math.min(ms,20e3);
  if(bad)ms=6*3600e3;
  return {limit,bad,ms:Math.min(ms,6*3600e3)};
}
/* one call to one key and one model */
async function callOnce(p,k,m,system,h,onDelta,maxTok){
  let url,headers={'content-type':'application/json'},body;
  if(p==='anthropic'){
    url='https://api.anthropic.com/v1/messages';
    Object.assign(headers,{'x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'});
    body={model:m,max_tokens:maxTok,system,messages:h};
  }else if(p==='gemini'){
    url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(m)+':generateContent';
    headers['x-goog-api-key']=k;
    body={systemInstruction:{parts:[{text:system}]},contents:h.map(x=>({role:x.role==='user'?'user':'model',parts:[{text:x.content}]}))};
  }else{
    url=({openai:'https://api.openai.com/v1',openrouter:'https://openrouter.ai/api/v1',groq:'https://api.groq.com/openai/v1'}[p]||cfg.base.replace(/\/+$/,''))+'/chat/completions';
    if(k)headers.Authorization='Bearer '+k;
    body={model:m,messages:[{role:'system',content:system},...h]};
  }
  if(onDelta){if(p==='gemini')url=url.replace(':generateContent',':streamGenerateContent')+'?alt=sse';else body.stream=true}
  lastMeta={sent:JSON.stringify(body),url}; /* the exact body, for the Details panel; keys are in headers and are never recorded */
  const r=await fetch(url,{method:'POST',headers,body:lastMeta.sent});
  lastMeta.hdr=dbgHdr(r);
  if(onDelta&&r.ok&&r.body){streamed=true;return (await readStream(r,PICK[p]||PICK.oa,onDelta))||'...'}
  const d=await r.json().catch(()=>({}));
  if(!r.ok){
    const msg=d.error?.message||(typeof d.error==='string'?d.error:'')||('HTTP '+r.status);
    const e=new Error(msg);Object.assign(e,limitInfo(r,d,r.status,msg));e.status=r.status;e.quotaLimit=dbgQuota(msg+' '+JSON.stringify(d||{}));throw e;
  }
  lastMeta.usage=dbgUsage(p,d);
  if(p==='anthropic')return d.content.filter(b=>b.type==='text').map(b=>b.text).join('');
  if(p==='gemini')return (d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('')||'...';
  return d.choices?.[0]?.message?.content||'...';
}
const slotsOf=p=>{const ks=keyList(p),ms=modelList(p);if(p==='custom'&&!ks.length)ks.push('');
  const o=[];ms.forEach(m=>ks.forEach(k=>o.push([k,m])));return o}; /* best model first, across all keys, then the backup models */
/* one call to whichever provider is set up. h = [{role, content}] starting with a user message */
async function complete(system,h,onDelta,maxTok=4096){
  const order=[cfg.provider,...(cfg.fb==='0'?[]:Object.keys(MODELS).filter(p=>p!==cfg.provider&&p!=='custom'&&keyList(p).length))];
  let firstErr=null;
  for(let pass=0;pass<2;pass++){
    let soonest=Infinity,tried=0;
    for(const p of order){
      const slots=slotsOf(p),pref=(cfg.ki&&cfg.ki[p])||0;
      const start=slots.length?pref%slots.length:0;
      for(let n=0;n<slots.length;n++){
        const i=(start+n)%slots.length,[k,m]=slots[i],w=rest(p,k,m);
        if(w>0){soonest=Math.min(soonest,w);continue}
        tried++;
        const t0=Date.now(),what=dbgWhat(system,onDelta);lastMeta={};
        try{
          const out=await callOnce(p,k,m,system,h,onDelta,maxTok);
          dbgRecord({p,k,m,what,t0,meta:lastMeta,reply:out});
          (cfg.ki=cfg.ki||{})[p]=i;
          if(n||p!==cfg.provider)keyNote='Switched to '+(p!==cfg.provider?p+' ':'')+'key '+(keyList(p).indexOf(k)+1)+(modelList(p).length>1?' with '+m:'')+' because the first one was limited.';
          return out;
        }catch(e){
          dbgRecord({p,k,m,what,t0,e,meta:lastMeta});
          if(e.limit||e.bad){rested(p,k,m,e.ms);firstErr=firstErr||e;if(e.limit)soonest=Math.min(soonest,e.ms);continue}
          throw e; /* a real problem (no network, a bad request): do not burn through the other keys */
        }
      }
    }
    if(pass===0&&soonest<=15e3&&Number.isFinite(soonest)){await nap(soonest+300);firstErr=null;continue} /* a short rest: just wait it out */
    if(!tried&&!firstErr){ /* everything is already resting from earlier */
      const e=new Error('All your keys are resting after hitting their limits. Try again in about '+Math.max(1,Math.ceil(soonest/1000))+' seconds'+(soonest>120e3?' (about '+Math.ceil(soonest/60e3)+' minutes)':'')+'. Adding more keys or backup models in Setup helps.');
      dbgNote('No request sent',e.message);throw e;
    }
    break;
  }
  const n=order.reduce((a,p)=>a+slotsOf(p).length,0);
  const e=new Error((firstErr&&firstErr.bad&&!firstErr.limit?'The key was refused: ':'Every key hit its limit ('+n+' tried). ')+(firstErr?firstErr.message.slice(0,160):'')+' Add more keys or backup models in Setup, or wait a bit.');
  dbgNote('Every key failed',e.message);throw e;
}
/* ---- how much of the chat is sent with each reply ----
   Sending the whole chat every time costs a lot of tokens, and free plans count tokens as well as requests. Only the recent part is sent
   (Setup > Conversation sent each time). What falls out of that window is folded into the long-term memory summary instead, in one
   batch once at least 6 messages have dropped out (so it costs one extra call every several messages, not one per message). */
const CTXS={lean:{n:20,chars:7000},normal:{n:40,chars:20000},full:{n:60,chars:1e9}};
function ctxWindow(list){
  const c=CTXS[cfg.ctx]||CTXS.lean;let chars=0,from=list.length;
  while(from>0&&list.length-from<c.n){const L=String(list[from-1].content||'').length;if(list.length-from>=4&&chars+L>c.chars)break;chars+=L;from--}
  return {from};
}
function trimOld(place,list,from){
  if(cfg.carry==='off'||demo()||summing)return;
  const dropped=list.slice(0,from).filter(m=>!m.m).length;
  if(dropped<6)return;
  const pend=list.filter(m=>!m.m).length;
  summarize(place,pend-dropped).then(ok=>ok&&typeof refreshMemBox==='function'&&refreshMemBox());
}
async function ask(onDelta){
  if(demo()){const e=new Error(NOKEY);e.noKey=true;throw e} /* no canned replies: nothing is guessed about what was said */
  const list=hh(),{from}=ctxWindow(list);
  let h=list.slice(from).map(m=>({role:m.role,content:m.content})); while(h[0]&&h[0].role!=='user')h.shift();
  trimOld(cfg.place,list,from);
  return complete(sys(),h,onDelta,TOK[cfg.len]);
}
/* the model ends its reply with [[quick: a | b | c]]; split that off, and hide it while streaming */
function splitQ(t){
  const i=t.lastIndexOf('[[');if(i<0)return {text:t.trim(),quick:[]};
  const m=t.slice(i).match(/^\[\[\s*quick\s*:?\s*([^\]]*)/i);
  if(!m)return {text:t.trim(),quick:[]};
  return {text:t.slice(0,i).trim(),quick:m[1].split('|').map(s=>s.trim()).filter(Boolean).slice(0,3).map(x=>x.slice(0,300))};
}
/* the options come inside the reply itself; there is no separate call for them (it would cost an extra request) */
function fillQR(){}
const vis=t=>{const i=t.lastIndexOf('[[');return (i>=0?t.slice(0,i):t.replace(/\[$/,'')).trimEnd()};
function setMood(t){const l=t.toLowerCase();mood=/sorry|hard|heavy|lonely|hurt|tough|painful|sad/.test(l)?'sad':/tired|sleep|rest|yawn|cozy|drowsy/.test(l)?'sleepy':/haha|glad|wonderful|love|great|happy|proud|yay|lovely/.test(l)?'happy':'';moodT=mood?50:0}

/* ---- long-term memory ----
   When enough messages pile up that have not been folded into the memory yet, the AI writes an updated summary
   (existing memory + the new messages). That summary is fed back into every prompt, so the character keeps the
   thread long after the last 40 messages. Leaving a scene also summarizes it, so the next scene knows. */
const SUMSYS="You maintain a short memory file about a person who chats with companion characters. Merge the EXISTING MEMORY with the NEW CONVERSATION into one updated memory. Keep: facts about the person, what they are going through, ongoing threads and worries, good news, names, preferences, promises, and moments that mattered. Write in plain third person ('They...'), neutral and kind, under 220 words, no preamble, no headings. Drop small talk. Never invent anything.";
async function summarize(place,keep){
  if(summing||demo()||cfg.carry==='off')return false;
  const list=H[place]||[],pend=list.filter(m=>!m.m),n=pend.length-keep;if(n<=0)return false;
  const batch=pend.slice(0,n),key=cfg.carry==='scene'?place:'*',sc=SCENES[place]||SCENES.bed;
  const who=((cfg.cast[place]&&charById(cfg.cast[place]))||{}).name||(place===cfg.place&&cfg.pet)||sc.name;
  summing=true;
  try{
    const convo=batch.map(m=>(m.role==='user'?(cfg.me||'Person'):who)+': '+m.content).join('\n');
    const out=await complete(SUMSYS,[{role:'user',content:'EXISTING MEMORY:\n'+(cfg.mem[key]||'(none yet)')+'\n\nNEW CONVERSATION (with '+who+', '+sc.label+'):\n'+convo+'\n\nWrite the updated memory.'}],null,700);
    const t=out.trim().slice(0,2400);
    if(t){cfg.mem[key]=t;batch.forEach(m=>m.m=1);store();summing=false;return true}
  }catch(e){}
  summing=false;return false;
}
const unmemorized=place=>(H[place]||[]).filter(m=>!m.m).length;
function leaveScene(place){if(unmemorized(place)>=6)summarize(place,0)}

/* ---- sending ---- */
async function send(over){
  const t=(typeof over==='string'?over:msg.value).trim(); if(!t||busy)return; msg.value=''; clearQR();
  if(/^\/(remember|forget)\b/i.test(t)){const m=t.match(/^\/remember\s+(.+)/i);
    if(m){cfg.about=(cfg.about?cfg.about+' ':'')+m[1];say('*nods* Got it. I will remember that.')}
    else if(/^\/forget/i.test(t)){cfg.about='';say('*tilts head* Okay, I have let all of that go.')}
    else say('Tell me what to remember, like: /remember I have a dog named Max');
    store();return}
  if(ckAsk){ckAsk=false;cfg.ckDone=today();
    if(/^not now$/i.test(t)){store();say('*nods* Another day, then.');return}
    J.unshift({d:today(),t:Date.now(),text:t,who:nm(),place:cfg.place})}
  if(typing)finish(); if(cfg.style==='bubbles')bub('user',t); else{you.textContent=t; you.style.display='block'}
  hh().push({role:'user',content:t,t:Date.now()});
  respond(()=>{hh().pop(); msg.value=t});
}
/* ask the AI to answer the chat as it stands. onFail puts things back if the call fails */
async function respond(onFail){
  busy=thinking=true; clearInterval(timer); typing=talking=false; if(cfg.style==='bubbles')pend=bub('ai','...'); else txt.textContent='...'; arrow.style.visibility='hidden';
  try{
    streamed=false; const live=cfg.style==='bubbles'?pend:null;
    Face.begin('');const raw=await ask(live?(x=>{const v=vis(x);live.textContent=v;thinking=false;talking=true;Face.stream(v)}):undefined);
    const {text,quick}=splitQ(raw);
    hh().push({role:'assistant',content:text,t:Date.now()}); thinking=false; setMood(text); qr=quick; if(!quick.length)fillQR(text);
    if(live&&streamed){live.textContent=text;talking=false;Face.end(text);pend=null;txt=live}else say(text)}
  catch(e){onFail&&onFail(); if(cfg.style==='bubbles'){renderChat()} thinking=false; say(e&&e.noKey?e.message:'Woof... something went wrong: '+e.message)}
  busy=false; store();
  if(!typing&&ci>=chunks.length-1)showQR();
  if(unmemorized(cfg.place)>=30)summarize(cfg.place,10).then(ok=>ok&&refreshMemBox&&refreshMemBox());
}
$('#send').onclick=()=>send(); /* The message box is a textarea, not an input: browsers and password managers treat a lone text input as an email/username field and ask to save it after every
   send. Enter sends, Shift+Enter adds a line, and the box grows up to about five lines. */
msg.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send()}});
const growMsg=()=>{msg.style.height='auto';const h=Math.min(msg.scrollHeight+(msg.offsetHeight-msg.clientHeight),160);msg.style.height=h+'px';msg.style.overflowY=msg.scrollHeight>msg.clientHeight+1?'auto':'hidden'};
{const d=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');
 Object.defineProperty(msg,'value',{get(){return d.get.call(msg)},set(v){d.set.call(msg,v);growMsg()},configurable:true})} /* code that sets msg.value (after sending, restoring an edit) resizes it too */
msg.addEventListener('input',growMsg);
msg.addEventListener('input',()=>{if(msg.value)$('#qr').textContent=''});

/* ---- redo the last reply / edit your last message ---- */
$('#redo').onclick=()=>{
  if(busy)return;const h=hh();if(!h.length||h[h.length-1].role!=='assistant')return;
  const old=h.pop();clearQR();if(cfg.style==='bubbles')renderChat();
  respond(()=>{h.push(old)});
};
$('#edit').onclick=()=>{
  if(busy)return;const h=hh();let i=h.length-1;while(i>=0&&h[i].role!=='user')i--;if(i<0)return;
  const t=h[i].content;h.length=i;clearQR();renderChat();you.style.display='none';say('...');
  msg.value=t;msg.focus();
};

/* ---- greetings ---- */
function greetLine(){
  const pc=occ(),sc=SCENES[cfg.place],has=hh().length>0,gap=visit.gap;
  let g=has?(pc?(pc.back||'*looks up* Oh, hello again.'):sc.back):(pc?(pc.greet||'*looks over* Hi. I\'m '+pc.name+'. What\'s on your mind?'):sc.greet);
  if(gap>14*864e5)g+=" It's been a long while.";
  else if(gap>2*864e5)g+=" It's been "+Math.round(gap/864e5)+" days.";
  else if(new Date().getHours()<5&&!sc.noLate)g+=" Quiet hour, isn't it?";
  return g;
}
function greet(){
  renderChat();ambient();clearQR();
  const l=lastTalk();visit={start:Date.now(),gap:l?Date.now()-l:0};
  ckAsk=cfg.checkin==='1'&&cfg.ckDone!==today();
  qr=cfg.qr==='1'?(ckAsk?["It was a good day.","It was a rough day.","Not now"]:STARTERS):[];
  say(greetLine()+(ckAsk?" How was today? Tell me, and I'll save it in your journal.":''));
}
