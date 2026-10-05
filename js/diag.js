/* Behind the scenes (the "Details" button): which model answered, which key, what failed, and how many requests are left.
   Every AI request is logged here (time, what it was for, provider, model, key number and its last 4 characters, result, time taken,
   tokens when the provider reports them). Keys are never stored. The exact text of each request and reply is kept too (newest ones, up to about 1.5 MB, only in this browser; switch it off in the panel). Counts are for this browser only.
   "Left" comes from the provider's own rate-limit headers when the browser is allowed to read them, otherwise from a daily limit
   learned from a quota error (or typed in the panel) minus what this browser has sent today. */
let lastMeta={};
let DBGLOG=[],USE={},HDR={},DBGFULL=[]; /* DBGFULL: the exact request body and reply of every call, oldest first */
try{DBGFULL=JSON.parse(localStorage.getItem('pdFull')||'[]')}catch(e){}
let FULLSEQ=DBGFULL.reduce((a,e)=>Math.max(a,e.n||0),0);
const fullOn=()=>localStorage.getItem('pdFullOff')!=='1';
function fullSave(){
  let s=JSON.stringify(DBGFULL);
  while(s.length>1.5e6&&DBGFULL.length>1){DBGFULL.shift();s=JSON.stringify(DBGFULL)}
  for(;;){try{localStorage.setItem('pdFull',s);break}catch(e){if(DBGFULL.length<=1)break;DBGFULL.shift();s=JSON.stringify(DBGFULL)}}
}
try{DBGLOG=JSON.parse(localStorage.getItem('pdLog')||'[]')}catch(e){}
try{USE=JSON.parse(localStorage.getItem('pdUse')||'{}')}catch(e){}
try{HDR=JSON.parse(localStorage.getItem('pdHdr')||'{}')}catch(e){}
const dbgDay=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function dbgSave(){try{localStorage.setItem('pdLog',JSON.stringify(DBGLOG));localStorage.setItem('pdUse',JSON.stringify(USE));localStorage.setItem('pdHdr',JSON.stringify(HDR))}catch(e){}}
function dbgScrub(s){
  s=String(s||'');
  Object.values(cfg.keys||{}).forEach(v=>String(v).split(/[\s,;]+/).filter(x=>x.length>8).forEach(k=>{s=s.split(k).join('[key]')}));
  return s;
}
function dbgHdr(r){
  const g=n=>{try{return r.headers.get(n)}catch(e){return null}};
  const pk=(...n)=>{for(const x of n){const v=g(x);if(v!=null&&v!=='')return v}return null};
  const h={remReq:pk('anthropic-ratelimit-requests-remaining','x-ratelimit-remaining-requests'),
    limReq:pk('anthropic-ratelimit-requests-limit','x-ratelimit-limit-requests'),
    remTok:pk('anthropic-ratelimit-tokens-remaining','x-ratelimit-remaining-tokens'),
    limTok:pk('anthropic-ratelimit-tokens-limit','x-ratelimit-limit-tokens'),
    reset:pk('anthropic-ratelimit-requests-reset','x-ratelimit-reset-requests')};
  return Object.values(h).some(v=>v!=null)?h:null;
}
function dbgUsage(p,d){
  try{
    if(p==='anthropic')return {i:d.usage.input_tokens,o:d.usage.output_tokens};
    if(p==='gemini')return {i:d.usageMetadata.promptTokenCount,o:d.usageMetadata.candidatesTokenCount};
    return {i:d.usage.prompt_tokens,o:d.usage.completion_tokens};
  }catch(e){return {}}
}
function dbgQuota(raw){ /* a daily quota number named in a quota error, if there is one */
  const m=/PerDay[\s\S]{0,600}?quotaValue["']?\s*:\s*["']?(\d+)/i.exec(raw);
  return m?+m[1]:0;
}
const dbgWhat=(system,onDelta)=>onDelta?'Chat reply':String(system||'').replace(/\s+/g,' ').trim().slice(0,70)||'Background call';
function dbgRecord(o){
  const {p,k,m}=o,id=sid(p,k,m),e=o.e,meta=o.meta||{},u=meta.usage||{};
  const ent={t:Date.now(),sid:id,p,m,kn:keyList(p).indexOf(k)+1,k4:k?k.slice(-4):'',what:o.what,ms:Date.now()-o.t0,ok:!e,
    kind:!e?'ok':e.limit?'limit':e.bad?'refused':'error'};
  if(e){ent.status=e.status||0;ent.err=dbgScrub(e.message).slice(0,300)}
  if(u.i!=null)ent.tin=u.i;if(u.o!=null)ent.tout=u.o;
  DBGLOG.unshift(ent);if(DBGLOG.length>80)DBGLOG.length=80;
  const d=dbgDay();let c=USE[id];
  if(!c||c.d!==d)c=USE[id]={d,ok:0,fail:0,lim:(c&&c.lim)||0};
  if(e)c.fail++;else c.ok++;
  if(e&&e.quotaLimit)c.lim=e.quotaLimit;
  if(meta.hdr){meta.hdr.t=Date.now();HDR[id]=meta.hdr}
  dbgSave();
  if(fullOn()&&meta.sent){DBGFULL.push({n:++FULLSEQ,t:o.t0,what:o.what,p,m,url:meta.url||'',ok:!e,ms:Date.now()-o.t0,sent:dbgScrub(meta.sent),reply:o.reply!=null?dbgScrub(o.reply):'',err:e?dbgScrub(e.message).slice(0,500):''});fullSave()}
}
function dbgNote(what,msg){ /* a request that never left: every key was resting */
  DBGLOG.unshift({t:Date.now(),p:'',m:'',kn:0,k4:'',what,ok:false,kind:'error',ms:0,err:dbgScrub(msg).slice(0,300)});
  if(DBGLOG.length>80)DBGLOG.length=80;dbgSave();
}

/* ---------------- the panel ---------------- */
const PNAME={anthropic:'Claude',openai:'ChatGPT',gemini:'Gemini',openrouter:'OpenRouter',groq:'Groq',custom:'Custom'};
const pname=p=>PNAME[p]||p||'-';
const dbgClock=t=>new Date(t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
const dbgDur=ms=>ms>=2*3600e3?Math.round(ms/3600e3)+' h':ms>=90e3?Math.ceil(ms/60e3)+' min':Math.ceil(ms/1000)+' s';
const dbgAgo=t=>{const s=Math.round((Date.now()-t)/1000);return s<90?s+' s ago':s<5400?Math.round(s/60)+' min ago':Math.round(s/3600)+' h ago'};
const dbgSlot=e=>pname(e.p)+' · '+(e.kn?'key '+e.kn+' (…'+e.k4+')':'no key')+' · '+e.m;
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}

/* ---- the exact messages, first to last ---- */
function fullParts(e){ /* what was sent, in plain labelled pieces, whichever provider it went to */
  let b={};try{b=JSON.parse(e.sent)}catch(x){}
  const S=v=>typeof v==='string'?v:JSON.stringify(v,null,1);
  let sys='',msgs=[];
  if(b.system!=null){sys=S(b.system);msgs=b.messages||[]}
  else if(b.systemInstruction){sys=(b.systemInstruction.parts||[]).map(x=>x.text).join('');msgs=(b.contents||[]).map(x=>({role:x.role,content:(x.parts||[]).map(y=>y.text).join('')}))}
  else{const a=b.messages||[];if(a[0]&&a[0].role==='system'){sys=S(a[0].content);msgs=a.slice(1)}else msgs=a}
  const parts=[['Sent to',e.url+(b.model?'  (model '+b.model+')':'  (model '+e.m+')')+(b.max_tokens?'  max_tokens '+b.max_tokens:'')],['System prompt (hidden instructions the character is given)',sys]];
  msgs.forEach((x,i)=>parts.push(['Message '+(i+1)+' of '+msgs.length+': '+(x.role==='user'?'you':'the character'),S(x.content)]));
  parts.push([e.ok?'Reply that came back':'What went wrong',e.ok?e.reply:e.err]);
  return parts;
}
const fullHead=e=>'#'+e.n+' · '+new Date(e.t).toLocaleString()+' · '+e.what+' · '+pname(e.p)+' · '+e.m+' · '+(e.ok?'OK':'FAILED')+(e.ms?' · '+(e.ms/1000).toFixed(1)+' s':'');
function fullText(){
  return DBGFULL.map(e=>'==== '+fullHead(e)+' ====\n'+fullParts(e).map(([h,t])=>'--- '+h+' ---\n'+t).join('\n\n')+'\n--- Raw JSON body as sent ---\n'+e.sent).join('\n\n\n');
}
function renderFull(){
  const box=$('#dbfulllist');box.textContent='';$('#dbfull').checked=fullOn();
  if(!DBGFULL.length){box.append(el('div','dbrow',fullOn()?'Nothing recorded yet. Send a message and it will appear here.':'Recording is off.'));return}
  box.append(el('div','hint',DBGFULL.length+' request'+(DBGFULL.length>1?'s':'')+' kept, oldest first (newest at the bottom). Tap one to open it.'));
  DBGFULL.forEach(e=>{
    const d=el('details','dbfull'+(e.ok?'':' bad'));d.append(el('summary',null,fullHead(e)));
    fullParts(e).forEach(([h,t])=>{d.append(el('div','dbfh',h));d.append(el('pre','dbpre',t||'(empty)'))});
    const raw=el('details','dbraw');raw.append(el('summary',null,'Raw JSON body, exactly as sent'));raw.append(el('pre','dbpre',e.sent));d.append(raw);
    box.append(d);
  });
}
function renderDiag(){
  /* summary */
  const sum=$('#dbsum');sum.textContent='';
  const okE=DBGLOG.find(e=>e.ok),last=DBGLOG[0];
  if(okE){
    const a=el('div','dbrow');
    a.append(el('b',null,'Last reply: '),document.createTextNode(dbgSlot(okE)+' · '+(okE.ms/1000).toFixed(1)+' s'+(okE.tin!=null?' · '+okE.tin+' tokens in, '+okE.tout+' out':'')+' · '+dbgAgo(okE.t)+' ('+okE.what+')'));
    sum.append(a);
  }else sum.append(el('div','dbrow','No AI request yet in this browser.'));
  if(last&&!last.ok){
    const a=el('div','dbrow bad');
    a.append(el('b',null,'Last problem: '),document.createTextNode((last.p?dbgSlot(last)+' · ':'')+last.kind+(last.status?' (HTTP '+last.status+')':'')+' · '+dbgAgo(last.t)+' · '+last.err));
    sum.append(a);
  }
  if(typeof keyNote!=='undefined'&&keyNote)sum.append(el('div','dbrow',keyNote));

  /* every key x model of every provider that has a key */
  const box=$('#dbslots');box.textContent='';
  const today=dbgDay(),manual=+localStorage.getItem('pdLim')||0;
  const provs=[cfg.provider,...Object.keys(MODELS).filter(p=>p!==cfg.provider&&p!=='custom'&&keyList(p).length)];
  let any=false;
  provs.forEach(p=>{
    const slots=slotsOf(p);if(!slots.length)return;
    box.append(el('h4',null,pname(p)+(p===cfg.provider?' (main provider)':' (backup provider)')));
    slots.forEach(([k,m])=>{
      any=true;
      const id=sid(p,k,m),w=rest(p,k,m),c=USE[id]&&USE[id].d===today?USE[id]:{ok:0,fail:0,lim:(USE[id]&&USE[id].lim)||0},h=HDR[id];
      const row=el('div','dbrow slot'+(w>0?' bad':''));
      row.append(el('b',null,(k?'key '+(keyList(p).indexOf(k)+1)+' (…'+k.slice(-4)+')':'no key')+' · '+m));
      row.append(el('div',null,w>0?'Resting for about '+dbgDur(w)+(function(){const f=DBGLOG.find(e=>e.sid===id&&!e.ok);return f?'. '+f.err:''})():'Ready'));
      const lim=c.lim||Math.max(0,...Object.entries(USE).filter(([x])=>x.startsWith(p+'|')&&x.endsWith('|'+m)).map(([,v])=>v.lim||0))||manual;
      row.append(el('div',null,'Sent today from this browser: '+c.ok+' ok, '+c.fail+' failed'+(lim?'. About '+Math.max(0,lim-c.ok)+' left of '+lim+(c.lim?' (limit learned from the provider)':' (your limit)'):'. Daily limit unknown: it is learned from the first quota error, or type it below.')));
      if(h){
        const bits=[];
        if(h.remReq!=null)bits.push(h.remReq+(h.limReq?' of '+h.limReq:'')+' requests left');
        if(h.remTok!=null)bits.push(h.remTok+(h.limTok?' of '+h.limTok:'')+' tokens left');
        if(h.reset)bits.push('resets in '+h.reset);
        row.append(el('div',null,'The provider says: '+bits.join(', ')+' ('+dbgAgo(h.t)+')'));
      }
      box.append(row);
    });
  });
  if(!any)box.append(el('div','dbrow','No keys yet. Add one in Setup.'));
  $('#dblim').value=manual||'';

  /* recent requests */
  const lg=$('#dblog');lg.textContent='';
  if(!DBGLOG.length)lg.append(el('div','dbrow','Nothing yet.'));
  DBGLOG.slice(0,40).forEach(e=>{
    const r=el('div','dbrow'+(e.ok?'':' bad'));
    r.append(el('b',null,dbgClock(e.t)+' '+(e.ok?'OK':e.kind.toUpperCase())+' '),document.createTextNode((e.p?dbgSlot(e)+' · ':'')+e.what+(e.ms?' · '+(e.ms/1000).toFixed(1)+' s':'')+(e.tin!=null?' · '+e.tin+'/'+e.tout+' tok':'')+(e.status?' · HTTP '+e.status:'')));
    if(e.err)r.append(el('div','dberr',e.err));
    lg.append(r);
  });
  renderFull();
}
function dbgText(){
  return DBGLOG.map(e=>new Date(e.t).toISOString()+' '+(e.ok?'OK':e.kind.toUpperCase())+' '+(e.p?dbgSlot(e)+' ':'')+'['+e.what+'] '+(e.ms/1000).toFixed(1)+'s'
    +(e.tin!=null?' tokens '+e.tin+'/'+e.tout:'')+(e.status?' HTTP '+e.status:'')+(e.err?' - '+e.err:'')).join('\n');
}
$('#dbgb').onclick=()=>{renderDiag();$('#dbst').textContent='';$('#dbd').showModal()};
$('#dbx').onclick=()=>$('#dbd').close();
$('#dblim').onchange=()=>{const v=Math.max(0,Math.floor(+$('#dblim').value||0));try{v?localStorage.setItem('pdLim',v):localStorage.removeItem('pdLim')}catch(e){}renderDiag()};
$('#dbclr').onclick=()=>{DBGLOG=[];USE={};HDR={};DBGFULL=[];try{localStorage.removeItem('pdFull')}catch(e){}dbgSave();renderDiag();$('#dbst').textContent='Cleared.'};
$('#dbcopy').onclick=async()=>{
  try{await navigator.clipboard.writeText(dbgText());$('#dbst').textContent='Copied the log (no keys, no messages).'}
  catch(e){$('#dbst').textContent='Could not copy. Select the text below instead.'}
};
$('#dbfull').onchange=()=>{try{$('#dbfull').checked?localStorage.removeItem('pdFullOff'):localStorage.setItem('pdFullOff','1')}catch(e){}renderFull()};
$('#dbfcopy').onclick=async()=>{
  try{await navigator.clipboard.writeText(fullText());$('#dbst').textContent='Copied every request and reply, first to last.'}
  catch(e){$('#dbst').textContent='Could not copy. Use Download instead.'}
};
$('#dbfdl').onclick=()=>{
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([fullText()],{type:'text/plain'}));a.download='pixel-pals-exact-messages.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
};
