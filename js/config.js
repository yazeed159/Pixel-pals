/* Settings, saved chats, and the system prompt.
   Loaded first: everything else reads `cfg` (settings) and `hh()` (current chat). */
const $=s=>document.querySelector(s), sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MODELS={anthropic:'claude-sonnet-5-5',openai:'gpt-4o-mini',gemini:'gemini-2.5-flash',openrouter:'openai/gpt-4o-mini',custom:''};
const LEN={short:'Reply in 1-2 short sentences.',medium:'Reply in 2-4 sentences.',long:'Reply in 4-7 sentences, still conversational.'};
const TOK={short:200,medium:400,long:800};
const TI={day:'☀️',sunset:'🌇',night:'🌙'};
const DEF={provider:'anthropic',keys:{},models:{},base:'',place:'bed',time:'night',pos:'below',ts:'1',spd:'26',snd:'0',fur:'tan',len:'medium',pet:'',me:'',
prompt:''};
let cfg={...DEF,keys:{},models:{}}; try{Object.assign(cfg,JSON.parse(localStorage.pdCfg||'{}'))}catch(e){}
if(cfg.key){cfg.keys.anthropic=cfg.key;delete cfg.key}
if(cfg.model){cfg.models.anthropic=cfg.model;delete cfg.model}
if(cfg.scene){cfg.time=cfg.scene;delete cfg.scene}
if(/^You are Old Pup/.test(cfg.prompt))cfg.prompt='';if(cfg.pet==='Old Pup')cfg.pet='';
const nm=()=>cfg.pet||SCENES[cfg.place].name;
const sys=()=>(cfg.prompt.trim()||SCENES[cfg.place].prompt).replace(/Old Pup|\{pet\}/g,nm())+(cfg.me?' The person you are talking to is called '+cfg.me+'.':'')+' '+LEN[cfg.len];
let H={}; try{H=JSON.parse(localStorage.pdH||'{}');if(!H.room&&localStorage.pdHist)H.room=JSON.parse(localStorage.pdHist)}catch(e){}
const hh=()=>H[cfg.place]||(H[cfg.place]=[]);
const store=()=>{try{localStorage.pdCfg=JSON.stringify(cfg);localStorage.pdH=JSON.stringify(Object.fromEntries(Object.entries(H).map(([k,v])=>[k,v.slice(-40)])))}catch(e){}};
