/* Chat: demo replies, calls to each AI provider, sending a message, greetings. */
const MOCK=["*tail thumps slowly* That sounds like a lot to carry. Want to tell me which part is heaviest right now?","Hmm. I've been around a long time, little one, and most storms pass faster than they feel. What would make tonight a bit softer?","*tilts head* I'm listening. Take your time. There's no rush in this room.","You did well to say that out loud. How does it feel now that it's out of your head?"];
async function ask(){
  const p=cfg.provider,k=cfg.keys[p]||'',m=cfg.models[p]||MODELS[p];
  if(!k&&p!=='custom'){await sleep(900);return MOCK[Math.floor(Math.random()*MOCK.length)]}
  let h=hh().slice(-30); while(h[0]&&h[0].role!=='user')h.shift();
  let url,headers={'content-type':'application/json'},body;
  if(p==='anthropic'){
    url='https://api.anthropic.com/v1/messages';
    Object.assign(headers,{'x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'});
    body={model:m,max_tokens:TOK[cfg.len],system:sys(),messages:h};
  }else if(p==='gemini'){
    url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(m)+':generateContent';
    headers['x-goog-api-key']=k;
    body={systemInstruction:{parts:[{text:sys()}]},contents:h.map(x=>({role:x.role==='user'?'user':'model',parts:[{text:x.content}]}))};
  }else{
    url=({openai:'https://api.openai.com/v1',openrouter:'https://openrouter.ai/api/v1'}[p]||cfg.base.replace(/\/+$/,''))+'/chat/completions';
    if(k)headers.Authorization='Bearer '+k;
    body={model:m,messages:[{role:'system',content:sys()},...h]};
  }
  const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error?.message||(typeof d.error==='string'?d.error:'HTTP '+r.status));
  if(p==='anthropic')return d.content.filter(b=>b.type==='text').map(b=>b.text).join('');
  if(p==='gemini')return (d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('')||'...';
  return d.choices?.[0]?.message?.content||'...';
}
async function send(){
  const t=msg.value.trim(); if(!t||busy)return; msg.value='';
  you.textContent=t; you.style.display='block';
  hh().push({role:'user',content:t}); busy=thinking=true; clearInterval(timer); typing=talking=false; txt.textContent='...'; arrow.style.visibility='hidden';
  try{const r=await ask(); hh().push({role:'assistant',content:r}); thinking=false; say(r)}
  catch(e){hh().pop(); thinking=false; say('Woof... something went wrong: '+e.message)}
  busy=false; store();
}
$('#send').onclick=send; msg.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
function greet(){const sc=SCENES[cfg.place];say(hh().length?sc.back:sc.greet)}
