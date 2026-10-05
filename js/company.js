/* Company: two characters talking, role reversal, letters and dreams. Loads after together.js and uses its activity
   framework (setAct / endAct / ACTCHIPS). Letters live in cfg.letters and dreams in cfg.dreams, so backups include them. */
cfg.letters=cfg.letters||[];cfg.dreams=cfg.dreams||{};
const solo=(system,user,max)=>complete(system,[{role:'user',content:user}],null,max); /* one awaited AI call, no chat history */
const selfDesc=()=>{const c=occ();return c?c.name+', '+(c.persona||'a gentle, friendly character'):(cfg.prompt.trim()||SCENES[cfg.place].prompt).replace(/Old Pup|\{pet\}/g,nm()).slice(0,420)};

/* ================= two characters talking ================= */
let duo=null;
const duoSys=a=>'You write a short scene between two characters sitting together '+(SCENES[cfg.place].setting||'in a quiet place')+'. A person is nearby, listening, and may join in. CHARACTER 1: '+selfDesc()+'. Their way of speaking: '+voice().hint+' CHARACTER 2: '+a.p.name+', '+(a.p.persona||'a friendly character')+'. Their way of speaking: '+(VOICES[a.p.species]||VOICES.dog).hint+' They are different people and honestly disagree about something small but real (a matter of taste, an old argument, how to spend an evening), teasing or stubborn but never cruel, each fully in their own voice. Write 4 to 6 short lines. FORMAT: every line is exactly "Name: what they say" (a brief action in asterisks is allowed inside the line), using the names '+nm()+' and '+a.p.name+', with no narration. After the lines add one final line [[quick: first | second | third]] with three things the person might say to join in, in first person, each reacting to what was just said: one backing '+nm()+', one backing '+a.p.name+', one that does something else (a joke, a third view, or a question to both). Each can be a full sentence. If the person has spoken, at least one of them answers them directly and the other may see it differently.'+(cfg.me?' The person is called '+cfg.me+'.':'');
const duoAsk=(a,said)=>{const rec=a.log.slice(-8).map(l=>l.n+': '+l.s).join('\n');
  return (rec?'The conversation so far:\n'+rec+'\n\n':'')+(said?(cfg.me||'The person')+' just said to them: "'+said+'"\nContinue the scene: they react to it.':rec?'Continue the scene.':'Begin the scene with a topic of their own.')};
async function duoRun(a,said){
  if(demo()){say(NOKEY);return}
  const my=++a.run;a.gen=true;qr=[];let L=[],opts=[];
  if(said){a.log.push({n:cfg.me||'The person',s:said});if(cfg.style!=='bubbles'){you.textContent=said;you.style.display='block';txt.textContent='...'}}else say('...');
  try{
    {const r=splitQ(await solo(duoSys(a),duoAsk(a,said),1000));opts=r.quick;L=r.text.split('\n').map(l=>l.match(/^\W*([^:\n]{1,24}?)\W*:\s*(.+)$/)).filter(Boolean).map(m=>({n:m[1].trim(),s:m[2].trim()})).filter(l=>[nm(),a.p.name].some(x=>x.toLowerCase()===l.n.toLowerCase()))}
    if(!L.length)throw new Error('they stayed quiet');
  }catch(e){a.gen=false;if(!a.dead)say('(They could not get going: '+e.message+')');return}
  a.gen=false;ACTCHIPS=a.chips=cfg.qr==='1'&&opts.length?[...opts,'New topic','Stop']:['Join in','New topic','Stop'];
  for(const l of L){
    if(a.dead||a.run!==my)return;
    const mine=l.n.toLowerCase()===nm().toLowerCase();l.n=mine?nm():a.p.name;a.log.push(l);a.turn=mine?'a':'b';$('#name').textContent=l.n;
    say((cfg.style==='bubbles'?l.n+': ':'')+l.s);
    for(;;){await sleep(200);if(a.dead||a.run!==my)return;if(typing)continue;if(ci<chunks.length-1){const c=ci;await sleep(900);if(ci===c&&!typing){ci++;show()}continue}break}
    await sleep(1400);
  }
  if(a.dead||a.run!==my)return;a.turn='a';$('#name').textContent=nm();showQR();
}
function startDuo(){
  const cur=nm(),sel=$('#duo').value,p=(sel&&charById(sel))||pick([...cfg.chars,...PRESETS].filter(c=>c.name!==cur));
  const a={name:'two characters talking',chips:['Join in','New topic','Stop'],p,turn:'a',dead:false,gen:false,run:0,log:[],
    end(){a.dead=true;duo=null;applyUI()},
    on(t){if(a.gen)return;
      if(t==='New topic'){a.log=[];duoRun(a,'');return}
      if(t==='Join in'){say('*they both look over* Go on. We are listening.');msg.focus();return}
      duoRun(a,t)}};
  setAct(a);duo=a;duoRun(a,'');
}
/* the second character is drawn on top of the scene, so each scene has its own spot: x, y = top-left of the 32x32 sprite
   (feet at y+32), sh = draw a floor shadow, k = 'suit' (helmet and spacesuit) or 'dive' (bubble helmet, floats) */
const DUO_AT={bed:{x:104,y:46,sh:0},camp:{x:104,y:46},diner:{x:108,y:56},kitchen:{x:110,y:52},library:{x:108,y:52},rooftop:{x:112,y:42},
  lighthouse:{x:52,y:36},therapy:{x:108,y:48},train:{x:106,y:46,sh:0}};
function drawDuo(){
  const a=DUO_AT[cfg.place]||{x:104,y:44},{x,y}=a,p=duo.p,w=duo.turn==='b'&&talking;
  const t=talking;talking=w;
  if(a.k==='suit'){const W='#e8eef8';px(x+6,y+18,20,12,W);px(x+8,y+30,7,6,W);px(x+17,y+30,7,6,W);drawChar(p,x,y,2,{maxRow:11,seed:1});helmet(x+16,y+12,18)}
  else if(a.k==='dive'){const b=Math.sin(tick/4)>0?1:0;drawChar(p,x,y+b*2,2,{seed:1});helmet(x+16,y+16+b*2,19)}
  else{if(a.sh!==0)rpx(x+2,y+31,28,2,'rgba(0,0,0,.25)');drawChar(p,x,y,2,{seed:1})}
  talking=t;
}
const _draw2=draw;
draw=function(){
  if(!duo){_draw2();return}
  const t=talking;if(duo.turn==='b')talking=false;_draw2();talking=t;
  drawDuo();
};

/* ================= role reversal: they are the one having a rough day ================= */
function startRough(){
  if(demo()){say(NOKEY);return}
  const a={name:'their rough day',n:0,pass:()=>true,ai(){a.n++},
    hint:()=>'ROLE REVERSAL: today YOU are the one having a rough day, and the person has come to listen to you. Open up about something small, specific and true to your character and your place (a worry, a loss, bruised pride, something that did not go as planned): not melodramatic, and not about the person. Let them comfort or advise you. Answer what they actually say: be touched by real kindness, push back gently on glib advice, and slowly feel a little lighter. Do not turn the conversation onto their problems unless they bring it up, and ask them questions rarely. Two to five sentences. Your quick options are things the person might say to you here: one that comforts you, one that is practical or gently challenges you, one that asks what happened.'+(a.n>=6?' By now you feel noticeably better: thank them in your own way and let the conversation settle.':''),
    after(){if(a.n>=10)endAct()}};
  setAct(a);qr=[];_send('Hey. You seem a bit off today. Is everything okay?');
}

/* ================= last night's dream ================= */
const DREAMH=' You are telling the person a short dream you had last night. Dreams are strange: shifting places, odd logic, vivid images, feelings more than plot. It should loosely echo something from the recent conversation or what you remember about them, but transformed and indirect, never a literal retelling, and never explained, interpreted or linked to the real thing out loud. First person, past tense, 70 to 120 words, in your own voice, ending as you wake or it dissolves. Your final quick-options line holds three things the person might say about the dream.';
async function startDream(){
  if(act)endAct();
  const key=cfg.place+'|'+(cfg.cast[cfg.place]||'')+'|'+today();let d=cfg.dreams[key],fresh=[];
  if(!d&&demo()){say(NOKEY);return}
  if(!d){
    busy=true;if(cfg.style!=='bubbles')say('*thinks back* Hm. Last night...');
    try{
      {const r=splitQ(await solo(sys()+DREAMH,'What we have talked about lately:\n'+(hh().slice(-10).map(m=>(m.role==='user'?(cfg.me||'Person'):nm())+': '+m.content).join('\n')||'(not much yet)')+'\n\nTell me the dream you had last night.',800));d=r.text;fresh=r.quick}
    }catch(e){busy=false;say('(The dream slipped away: '+e.message+')');return}
    busy=false;cfg.dreams[key]=d;const ks=Object.keys(cfg.dreams);if(ks.length>40)delete cfg.dreams[ks[0]];
    echo('Did you dream last night?');hh().push({role:'user',content:'Did you dream last night?',t:Date.now()},{role:'assistant',content:d,t:Date.now()});store();
  }
  qr=cfg.qr!=='1'?[]:fresh.length?fresh:[];say(d);if(!qr.length)fillQR(d);
}

/* ================= letters: write today, a longer reply comes tomorrow morning ================= */
const mailing=new Set(),fmtD=t=>new Date(t).toLocaleDateString([],{month:'short',day:'numeric'});
const unread=place=>cfg.letters.filter(L=>L.reply&&!L.read&&(!place||L.place===place));
const badge=()=>{const n=unread().length;$('#ltb').textContent='✉ Letters'+(n?' ('+n+')':'');$('#more').classList.toggle('dot',n>0)};
const nextDue=()=>{const d=new Date();d.setHours(8,0,0,0);while(d-Date.now()<6*36e5)d.setDate(d.getDate()+1);return +d+Math.floor(Math.random()*60)*6e4};
function letterSys(L){
  const c=L.cid&&charById(L.cid),sc=SCENES[L.place]||SCENES.bed,v=VOICES[c?c.species:SCENE_VOICE[L.place]]||VOICES.dog;
  let p=c?'You are '+c.name+', '+(c.persona||'a gentle, friendly character')+'. You live '+(sc.setting||'in a quiet place')+'.':(sc.prompt||'').replace(/Old Pup|\{pet\}/g,L.who);
  if(cfg.me)p+=' The person is called '+cfg.me+'.';if(cfg.about)p+=' About them: '+cfg.about;
  const m=memText();if(m)p+=' What you remember about them (use it naturally, never recite it): '+m;
  return p+' Your way of speaking: '+v.hint+' They wrote you a letter, and you are writing back the next morning. This is a letter, not a chat message: warmer and more considered, 120 to 240 words, plain text in short paragraphs. Open with "Dear '+(cfg.me||'friend')+',", answer what they actually wrote (and any question they asked), add something small from your own day or place, say one thing you noticed that they did not say outright, and sign with your name. At most one question. No actions in asterisks, no quick-reply line.';
}
async function letterReply(L){
  if(demo())throw new Error(NOKEY); /* the letter just waits until a key is added */
  return (await solo(letterSys(L),'Their letter, sent '+fmtD(L.t)+':\n\n'+L.text+'\n\nWrite your letter back.',1200)).trim();
}
async function mailCheck(){
  for(const L of cfg.letters){
    if(L.reply||L.due>Date.now()||mailing.has(L.id))continue;
    mailing.add(L.id);
    try{L.reply=await letterReply(L);L.rt=Date.now();store();badge()}catch(e){}
    mailing.delete(L.id);
  }
}
function renderLetters(){
  const box=$('#ltl');box.textContent=cfg.letters.length?'':'No letters yet.';
  [...cfg.letters].sort((a,b)=>b.t-a.t).forEach(x=>{
    const d=document.createElement('details'),s=document.createElement('summary'),m=document.createElement('div'),r=document.createElement('div');
    d.className='je';s.textContent='To '+x.who+', '+fmtD(x.t)+(x.reply?(x.read?' · reply':' · new reply ✉'):' · waiting for a reply');
    m.textContent=x.text;m.style.cssText='opacity:.7;white-space:pre-wrap;margin:6px 0';
    r.textContent=x.reply||'They will write back '+(x.due>Date.now()?'on '+new Date(x.due).toLocaleString([],{weekday:'long',hour:'numeric',minute:'2-digit'}):'soon')+'.';r.style.whiteSpace='pre-wrap';
    d.append(s,m,r);d.ontoggle=()=>{if(d.open&&x.reply&&!x.read){x.read=1;store();badge()}};box.append(d)});
  $('#ltlab').textContent='Write to '+nm();$('#ltnow').hidden=!cfg.letters.some(x=>!x.reply);
}
const ltd=$('#ltd');
function openLetters(){renderLetters();ltd.showModal()}
$('#ltb').onclick=openLetters;$('#ltx').onclick=()=>ltd.close();
$('#ltsend').onclick=()=>{const t=$('#ltt').value.trim();if(!t)return;
  cfg.letters.push({id:'l'+Date.now().toString(36),place:cfg.place,cid:cfg.cast[cfg.place]||'',who:nm(),t:Date.now(),text:t,due:nextDue()});
  $('#ltt').value='';store();renderLetters()};
$('#ltnow').onclick=()=>{cfg.letters.forEach(x=>{if(!x.reply)x.due=0});mailCheck().then(renderLetters)};
const _glC=greetLine;
greetLine=function(){let g=_glC();if(unread(cfg.place).length)g+=' *taps an envelope on the table* I wrote back to your letter. It is in Letters.';return g};
setInterval(mailCheck,6e4);setTimeout(mailCheck,2500);badge();

/* ================= wiring into the Together menu ================= */
$('#actb').addEventListener('click',()=>{
  const s=$('#duo'),v=s.value,cur=nm();
  s.innerHTML='<option value="">Surprise me</option>'+[...cfg.chars,...PRESETS].filter(c=>c.name!==cur).map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.species+')</option>').join('');
  s.value=v&&charById(v)?v:'';
});
actd.addEventListener('click',e=>{
  const b=e.target.closest('button[data-b]');if(!b)return;
  const k=b.dataset.b;
  if(k==='letter'){actd.close();openLetters();return}
  if(busy){$('#actst').textContent='One moment, a reply is on its way.';return}
  actd.close();({duo:startDuo,rough:startRough,dream:startDream})[k]();
});
