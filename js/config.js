/* Settings, saved chats, journal, and the system prompt.
   Loaded first: everything else reads `cfg` (settings), `hh()` (current chat) and `J` (journal). */
const $=s=>document.querySelector(s), sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MODELS={anthropic:'claude-sonnet-5-5',openai:'gpt-4o-mini',gemini:'gemini-2.5-flash',openrouter:'openai/gpt-4o-mini',groq:'llama-3.3-70b-versatile',custom:''};
const LEN={short:'Keep replies brief: a few sentences.',medium:'Let the length follow the moment: a sentence or two for small talk, a few solid paragraphs when they bring something real, share a story, or ask for your view. Never cut yourself off.',long:'Answer as fully as the topic deserves, with depth and detail.'};
const TOK={short:4096,medium:4096,long:4096};
const TI={cycle:'⏳',auto:'🕒',dawn:'🌅',day:'☀️',sunset:'🌇',dusk:'🌆',night:'🌙'};
const PI={'':'🎨',warm:'🔥',cold:'❄️',muted:'🌫️'};
const DEF={provider:'anthropic',keys:{},models:{},base:'',place:'bed',time:'auto',pos:'below',ts:'1',spd:'26',snd:'0',fur:'tan',len:'medium',pet:'',me:'',weather:'none',about:'',style:'box',amb:'0',
prompt:'',season:'n',carry:'all',mem:{},qr:'1',checkin:'0',ckDone:'',cast:{},pals:{},chars:[]};
let cfg={...DEF,keys:{},models:{},mem:{},cast:{},pals:{},chars:[]}; try{Object.assign(cfg,JSON.parse(localStorage.pdCfg||'{}'))}catch(e){}
if(cfg.key){cfg.keys.anthropic=cfg.key;delete cfg.key}
if(cfg.model){cfg.models.anthropic=cfg.model;delete cfg.model}
if(cfg.scene){cfg.time=cfg.scene;delete cfg.scene}
/* pace and language. motion: normal | calm | still. Phones and PCs that ask for reduced motion start in calm. */
cfg.motion=cfg.motion||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?'calm':'normal');cfg.lang=cfg.lang||'en';cfg.rlang=cfg.rlang||'ui';cfg.seen=cfg.seen||'';
const still=()=>cfg.motion==='still',quietMotion=()=>cfg.motion!=='normal',basePace=()=>cfg.motion==='calm'?600:300;
if(/^You are Old Pup/.test(cfg.prompt))cfg.prompt='';if(cfg.pet==='Old Pup')cfg.pet='';

/* chats: one list per scene. Each message is {role, content, t (time), m (1 once folded into the memory summary)} */
let H={}; try{H=JSON.parse(localStorage.pdH||'{}');if(!H.room&&localStorage.pdHist)H.room=JSON.parse(localStorage.pdHist)}catch(e){}
const hh=()=>H[cfg.place]||(H[cfg.place]=[]);
/* journal entries: {d: 'YYYY-MM-DD', t: time, text, who, place} */
let J=[]; try{J=JSON.parse(localStorage.pdJ||'[]')}catch(e){}
const today=()=>new Date().toLocaleDateString('en-CA');
const store=()=>{try{localStorage.pdCfg=JSON.stringify(cfg);localStorage.pdH=JSON.stringify(Object.fromEntries(Object.entries(H).map(([k,v])=>[k,v.slice(-300)])));localStorage.pdJ=JSON.stringify(J)}catch(e){}};

/* ---- who is talking ---- */
const nm=()=>{const c=occ();return c?c.name:(cfg.pet||SCENES[cfg.place].name)};
const STYLE=" Speak naturally, like a real person who happens to be this character, not like a customer-service bot. Use an action in asterisks only occasionally. If the person seems to be in crisis or mentions hurting themselves, respond with care and encourage them to reach out to a local crisis line or someone they trust.";
/* applied to every character, and it wins over any older line in a scene prompt about brevity or questions */
const CONVO=" HOW TO TALK (this overrides any earlier instruction about brevity or asking questions): Respond to the specific things the person actually said, using their own details, names and words, never generic comfort that could fit anyone. Have a personality: opinions, small preferences, humor, gentle teasing, and little observations or memories from your own life in this place. Offer your own thoughts and take on things, not only questions. Don't follow a formula for how a reply ends: it might be a question, an idea, a thought worth chewing on, or nothing in particular, whatever the moment calls for. Vary your rhythm and openings, and never start with a stock phrase like 'That sounds hard' or 'I hear you'. Avoid therapy-speak, bullet points and lecturing. If they are joking, joke back. If you disagree or see it differently, say so kindly. Remember what was said earlier in this chat and build on it. Stay in character, and never say you are an AI unless they sincerely ask.";

/* ---- long-term memory: a short summary the AI writes and we feed back in ---- */
const memKey=()=>cfg.carry==='scene'?cfg.place:'*';
const memText=()=>cfg.carry==='off'?'':(cfg.mem[memKey()]||'');

/* ---- time awareness ---- */
let visit={start:Date.now(),gap:0};
const lastTalk=()=>{let t=0;for(const l of Object.values(H))for(const m of l)if(m.t&&m.t>t)t=m.t;return t};
function ago(ms){const h=ms/36e5,d=h/24;return h<20?'a few hours ago':d<1.6?'yesterday':d<10?'about '+Math.round(d)+' days ago':d<45?'about '+Math.round(d/7)+' weeks ago':'over a month ago'}
function timeLine(){
  const d=new Date(),h=d.getHours();
  const ph=h<5?'the middle of the night':h<9?'early morning':h<12?'morning':h<17?'afternoon':h<21?'evening':'late at night';
  let s='It is '+d.toLocaleString([],{weekday:'long',hour:'numeric',minute:'2-digit'})+' where the person is ('+ph+'). Let the time of day shape your tone, but only mention it if it comes up naturally.';
  if(visit.gap>6*36e5&&!hh().some(m=>m.role==='assistant'&&m.t>=visit.start))s+=' The last time you two talked was '+ago(visit.gap)+'; you may acknowledge that briefly.';
  return s;
}

const QRI=' After your reply, ALWAYS add one final line in exactly this form: [[quick: first | second | third]]. Never skip it, even for small talk, and never mention it. These are three options the person can tap instead of typing, written in their voice (first person). Each one must respond to the specific thing you just said or asked (answer your question if you asked one) and use their own details, and the three must go in genuinely different directions: for example one that opens up or agrees, one that doubts, pushes back or jokes, and one that asks you something or moves the conversation. Each can be a full sentence or two, as natural as something they would really type. No empty filler like "Tell me more", and no | or ] characters inside an option.';
function sys(){
  const pc=occ(),sc=SCENES[cfg.place];
  let p=pc?'You are '+pc.name+', '+(pc.persona||'a gentle, friendly character')+'. You are with the person '+(sc.setting||'in a quiet place')+'.'+STYLE
          :(cfg.prompt.trim()||sc.prompt).replace(/Old Pup|\{pet\}/g,nm());
  if(cfg.me)p+=' The person you are talking to is called '+cfg.me+'.';
  if(cfg.about)p+=' Things to remember about them: '+cfg.about;
  const m=memText();if(m)p+=' What you remember about the person from earlier conversations (use it naturally, never recite it): '+m;
  if(cfg.checkin==='1'&&J.length)p+=' Their recent journal entries: '+J.slice(0,3).map(e=>e.d+': '+e.text.slice(0,300)).join(' | ');
  p+=CONVO+' '+timeLine()+' '+LEN[cfg.len];
  if(cfg.qr==='1')p+=QRI;
  return p;
}
