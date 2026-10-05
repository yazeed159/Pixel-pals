/* Hand-off between places: when you move to another scene the conversation follows you.
   - The new character is given the end of your talk with the one you just left, so it is one conversation told by different
     personalities, and in its FIRST reply it shows it knows you came from them (teasing, curious, comparing the two), then carries on.
   - A character you left remembers it: when you come back they may notice you went off to sit with someone else.
   Same switch as "They talk to each other" (Setup > Presence & honesty) and it needs Long-term memory not Off.
   Therapy stays private both ways. Nothing is stored except a tiny "who you left me for" note in cfg.away (it is in backups).
   Loads after together.js and closing.js; wraps greet(), sys(), heardLine() and ask() like the other behavior files do. */
cfg.away=cfg.away||{};
let ARR=null,lastPlace=''; /* ARR: the arrival at the current scene: {t, to, from:{place,name,desc,text}|null, away:{to,t}|null} */
const lastT=p=>{const l=H[p]||[];return l.length?l[l.length-1].t||0:0};
const nameOf=p=>{const c=cfg.cast[p]&&charById(cfg.cast[p]);return c?c.name:(cfg.pet||(SCENES[p]||{}).name||'someone')};
const HOURS6=6*36e5,DAYS3=3*864e5,KEEP=12;

function startArrival(from,to){
  const now=Date.now();
  if(cfg.gossip!=='1'||cfg.carry==='off'||from==='therapy'||to==='therapy'){ARR=null;return}
  const a={t:now,to,from:null,away:null};
  cfg.away=cfg.away||{};
  if(ARR&&ARR.to===from&&lastT(from)<ARR.t){ /* passed through a place where nothing was said: the earlier hand-off carries on */
    if(ARR.from&&ARR.from.place!==to)a.from=ARR.from;
  }else if(lastT(from)&&now-lastT(from)<HOURS6){
    const me=cfg.me||'Person',who=nameOf(from);
    const text=(H[from]||[]).filter(m=>m.content&&!m.content.startsWith('/')).slice(-14)
      .map(m=>(m.role==='user'?me:who)+': '+m.content.replace(/\s+/g,' ').slice(0,300)).join('\n').slice(-2400);
    if(text)a.from={place:from,name:who,desc:who+' ('+SCENES[from].label.toLowerCase()+')',text};
    cfg.away[from]={to:nameOf(to),t:now};
  }
  const aw=cfg.away[to];
  if(aw&&lastT(to)<aw.t&&now-aw.t<DAYS3)a.away=aw;
  ARR=a;store();
}
const _greetH=greet;
greet=function(){
  const p=cfg.place;
  if(lastPlace&&lastPlace!==p&&SCENES[lastPlace])startArrival(lastPlace,p);
  lastPlace=p;
  return _greetH.apply(this,arguments);
};

/* true until the character has answered once since you arrived */
const fresh=()=>!!ARR&&!hh().some(m=>m.role==='assistant'&&m.t>=ARR.t);
const threadOn=()=>!!ARR&&ARR.to===cfg.place&&hh().filter(m=>m.t>=ARR.t).length<KEEP;

function arrivalNote(){
  if(!ARR||ARR.to!==cfg.place)return '';
  const first=fresh();let p='';
  if(ARR.from&&threadOn()){
    const f=ARR.from;
    p+=' THE CONVERSATION CONTINUES: the person has just come over to you from '+f.desc+'. They were in the middle of talking with '+f.name
      +', and this is how that went (one ongoing conversation: pick up its thread. You were not there, so you only know it from this transcript, and you should not pretend to have said any of it yourself):\n'+f.text+'\n(end of transcript.)';
    if(first)p+=' In your very first reply, before anything else, show in your own voice that you know they just left '+f.name+' to sit with you: one or two short lines, playful and specific to you two (a little teasing, wondering how '+f.name+' took it, noticing how different you are, or guessing what '+f.name+' would have said), never mean and never a speech. Then respond to what they just said and carry the conversation on from where it left off, as yourself. Do this only in that first reply.';
    else p+=' You have already acknowledged the switch, so do not do it again: just keep the thread going as yourself, and bring up '+f.name+' only if it comes up.';
  }
  if(ARR.away&&first)p+=' Earlier the person left you to go and sit with '+ARR.away.to+', and now they are back with you. You may notice that once, lightly, in your own voice (curious, a little dramatic, or glad)'+(ARR.from&&threadOn()?', in the same short opening line':'')+', then carry on.';
  return p;
}
const _sysH=sys;
sys=function(){return _sysH()+arrivalNote()};
/* the older "I heard what you told my friends" line would repeat what the transcript already shows */
const _heardH=heardLine;
heardLine=function(){return ARR&&ARR.to===cfg.place&&ARR.from&&threadOn()?'':_heardH()};
