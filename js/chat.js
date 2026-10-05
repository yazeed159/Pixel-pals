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
/* one call to whichever provider is set up. h = [{role, content}] starting with a user message */
async function complete(system,h,onDelta,maxTok=4096){
  const p=cfg.provider,k=cfg.keys[p]||'',m=cfg.models[p]||MODELS[p];
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
  const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)});
  if(onDelta&&r.ok&&r.body){streamed=true;return (await readStream(r,PICK[p]||PICK.oa,onDelta))||'...'}
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error?.message||(typeof d.error==='string'?d.error:'HTTP '+r.status));
  if(p==='anthropic')return d.content.filter(b=>b.type==='text').map(b=>b.text).join('');
  if(p==='gemini')return (d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('')||'...';
  return d.choices?.[0]?.message?.content||'...';
}
async function ask(onDelta){
  if(demo()){const e=new Error(NOKEY);e.noKey=true;throw e} /* no canned replies: nothing is guessed about what was said */
  let h=hh().slice(-60).map(m=>({role:m.role,content:m.content})); while(h[0]&&h[0].role!=='user')h.shift();
  return complete(sys(),h,onDelta,TOK[cfg.len]);
}
/* the model ends its reply with [[quick: a | b | c]]; split that off, and hide it while streaming */
function splitQ(t){
  const i=t.lastIndexOf('[[');if(i<0)return {text:t.trim(),quick:[]};
  const m=t.slice(i).match(/^\[\[\s*quick\s*:?\s*([^\]]*)/i);
  if(!m)return {text:t.trim(),quick:[]};
  return {text:t.slice(0,i).trim(),quick:m[1].split('|').map(s=>s.trim()).filter(Boolean).slice(0,3).map(x=>x.slice(0,300))};
}
/* if a reply came without its options (or a line was spoken locally, like a nudge), ask once for them separately so they are always there */
const QRSYS='You write suggested replies for a person chatting with a character, so they can tap instead of typing. From the conversation, write exactly three different things the person might plausibly say next, in first person. Each is one or two natural, complete sentences (not a few words) that responds to the specific thing the character just said or asked, using the details already mentioned. They must go in different directions: one that opens up or agrees, one that doubts, pushes back or jokes, one that asks the character something or moves on. Output only the three, one per line, with no numbering, quotes or labels.';
async function fillQR(line){
  if(cfg.qr!=='1'||demo()||qr.length||(typeof act!=='undefined'&&act&&act.strip))return;
  const n=hh().length,place=cfg.place,c=hh().slice(-6).map(m=>(m.role==='user'?(cfg.me||'Person'):nm())+': '+m.content);
  if(line&&!(c.length&&c[c.length-1].endsWith(line.slice(-40))))c.push(nm()+': '+line);
  if(!c.length)return;
  try{
    const out=await complete(QRSYS,[{role:'user',content:c.join('\n')+'\n\nWrite the three options.'}],null,500);
    if(place!==cfg.place||busy||qr.length||msg.value||hh().length!==n)return;
    const L=out.split('\n').map(x=>x.replace(/^\s*(?:[-*•]|\d+[.)])?\s*["“]?/,'').replace(/["”]\s*$/,'').trim()).filter(x=>x.length>1).slice(0,3).map(x=>x.slice(0,300));
    if(L.length){qr=L;if(!typing&&ci>=chunks.length-1)showQR()}
  }catch(e){}
}
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
