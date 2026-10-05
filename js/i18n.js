/* Languages and right-to-left text.
   - The page text is translated by exact match: every English string in index.html (and a few made in code) is a key in
     TRX (js/i18n-data.js). A walker swaps text, placeholders and aria-labels, and a MutationObserver does the same for
     text added later. A string with no entry simply stays English. Chat text is never touched (see SKIP).
   - Arabic and Hebrew set <html dir="rtl">. Each line of dialogue, bubble and input also gets its own direction from its
     first letter (dirOf), so English names or quotes inside Arabic text, and the other way round, still read correctly.
   - Replies: sys() and the quick-reply prompt get a LANGUAGE instruction, so the AI writes in the chosen language.
   Add a language: a line in LANGS, a column in js/i18n-data.js (see README). */
const LANGS={en:{n:'English',ai:'English'},ar:{n:'العربية',ai:'Arabic',dir:'rtl'},he:{n:'עברית',ai:'Hebrew',dir:'rtl'},es:{n:'Español',ai:'Spanish'},fr:{n:'Français',ai:'French'}};
let LANG='en',applying=false;
const KEYS=new Set();Object.values(TRX).forEach(o=>Object.keys(o).forEach(k=>KEYS.add(k)));
const T=s=>(LANG!=='en'&&TRX[LANG]&&TRX[LANG][s])||s; /* for confirm() and alert(), which the walker cannot reach */
const RTL_CH='\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF';
const dirOf=t=>{const m=new RegExp('[A-Za-z\\u00C0-\\u024F\\u0370-\\u052F'+RTL_CH+']').exec(String(t||''));
  if(!m)return document.documentElement.dir||'ltr';return new RegExp('['+RTL_CH+']').test(m[0])?'rtl':'ltr'};

/* ---- the walker ---- */
const SKIP='#chat,#txt,#box,#log,#jrl,#ltl,#you,#name,#chlist,#bglist,textarea,script,style',ATTRS=['placeholder','aria-label','title'],O=new WeakMap();
const trFor=en=>LANG==='en'?en:((TRX[LANG]||{})[en]||en);
function setText(n,en,lead,trail){const v=lead+trFor(en)+trail;if(n.nodeValue!==v)n.nodeValue=v;O.set(n,{en,lead,trail,set:v})}
function visitText(n){
  const raw=n.nodeValue,e=O.get(n);
  if(e&&raw===e.set){setText(n,e.en,e.lead,e.trail);return}  /* our own text: refresh it for the current language */
  const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(raw),core=m[2].replace(/\s+/g,' ');
  if(core&&KEYS.has(core))setText(n,core,m[1],m[3]);else O.delete(n);
}
function visitEl(el){
  for(const a of ATTRS){
    const v=el.getAttribute(a);if(v==null)continue;
    let en=el['_o'+a];
    if(!(en!==undefined&&v===el['_s'+a])){if(KEYS.has(v.trim()))en=v.trim();else{el['_o'+a]=undefined;continue}}
    const tr=trFor(en);el['_o'+a]=en;el['_s'+a]=tr;if(v!==tr)el.setAttribute(a,tr);
  }
}
function walk(n){
  if(n.nodeType===3){visitText(n);return}
  if(n.nodeType!==1||n.matches(SKIP))return;
  visitEl(n);for(const c of n.childNodes)walk(c);
}
const inSkip=n=>{const p=n.nodeType===1?n:n.parentElement;return !p||!!p.closest(SKIP)};
const mo=new MutationObserver(ms=>{
  if(applying)return;applying=true;
  try{for(const m of ms){
    if(m.type==='characterData'){if(!inSkip(m.target))visitText(m.target)}
    else if(m.type==='attributes'){if(!inSkip(m.target))visitEl(m.target)}
    else m.addedNodes.forEach(n=>{if(!inSkip(n))walk(n)});
  }}finally{applying=false;mo.takeRecords()}
});
mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});

/* ---- direction of inputs: follow what is typed; when empty, follow the interface ---- */
const AUTO=['#msg','#pet','#me','#about','#prompt','#memtxt','#chn','#chp','#chg','#jrn','#ltt','#ritualX','#bgname','#bgset'];
const fixInput=e=>{e.dir=e.value.trim()?'auto':(document.documentElement.dir||'ltr')};
AUTO.forEach(s=>{const e=$(s);if(e)e.addEventListener('input',()=>fixInput(e))});
document.addEventListener('focusin',e=>{if(e.target.id&&AUTO.includes('#'+e.target.id))fixInput(e.target)});
['#key','#model','#base'].forEach(s=>{$(s).dir='ltr'}); /* keys, model names and URLs are always left to right */

/* ---- fonts for the two scripts the pixel font does not have; falls back to system fonts when offline ---- */
let fontsAdded=false;
function loadFonts(){if(fontsAdded)return;fontsAdded=true;const l=document.createElement('link');l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600&family=Noto+Sans+Hebrew:wght@400;600&display=swap';document.head.append(l)}

/* ---- apply ---- */
const LANGOPTS=Object.entries(LANGS).map(([k,v])=>'<option value="'+k+'">'+v.n+'</option>').join('');
$('#lang').innerHTML=LANGOPTS;
function applyLang(){
  LANG=LANGS[cfg.lang]?cfg.lang:'en';
  const h=document.documentElement,d=LANGS[LANG].dir||'ltr';
  h.lang=LANG;h.dir=d;if(d==='rtl')loadFonts();
  applying=true;try{walk(document.body);AUTO.forEach(s=>{const e=$(s);if(e)fixInput(e)})}finally{applying=false;mo.takeRecords()}
  const bx=$('#box');if(bx&&!bx.getAttribute('dir'))bx.dir=d;
}
const _applyUIi=applyUI;
applyUI=function(){_applyUIi();applyLang()};

/* ---- replies in the chosen language ---- */
function langDirective(){
  const L=LANGS[LANG]||LANGS.en;
  if(cfg.rlang==='match')return ' LANGUAGE: Reply in the language the person writes in (use their latest message to tell). If they have not written yet or you cannot tell, use '+L.ai+'.';
  if(LANG==='en')return '';
  return ' LANGUAGE: Write every reply in '+L.ai+', including any action in *asterisks*. Use natural, idiomatic '+L.ai+'. If the person writes in a particular regional dialect, you may answer in that dialect.';
}
const _sysI=sys;
sys=function(){const l=langDirective();return _sysI()+(l?l+(cfg.qr==='1'?' Keep the [[quick: a | b | c]] line exactly in that form, with the three options in the same language as your reply.':''):'')};
const _completeI=complete;
complete=function(system,h,onDelta,maxTok){if(system===QRSYS){const l=langDirective();if(l)system+=l}return _completeI(system,h,onDelta,maxTok)};
