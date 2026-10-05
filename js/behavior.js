/* How the characters behave: they speak up after a silence, you can just sit together, each has its own voice
   (speech habits + typing sound), they pass on what you told their friends, and they can disagree honestly.
   Loads after ui.js. It wraps sys() and blip() instead of editing them, and adds three settings (nudge, honest, gossip). */

/* ---- defaults for the new settings (older saved settings simply gain them) ---- */
const BDEF={nudge:'5',honest:'0',gossip:'1'};
for(const k in BDEF)if(cfg[k]===undefined)cfg[k]=BDEF[k];
FIELDS.push('nudge','honest','gossip'); /* the Setup dialog reads and saves these like any other field */

/* ---- voices ----
   hint:  added to the system prompt, so the character talks that way
   snd:   [wave, base Hz, random spread, volume, length in s] for the typing sound
   idle:  small things they say after a silence; rain / snow: the same when that weather is on */
const VOICES={
  dog:{hint:'You are warm and plain-spoken, a loyal old friend: you say less than most, but what you say is specific and real.',snd:['sine',210,40,.04,.05],
    idle:['*thumps tail* Still here?','*nudges closer* You went quiet. That is okay.','*yawns* Just checking you are there.'],rain:['*ears perk* Hear the rain? I like it.'],snow:['*sniffs the air* Snow. I can tell.']},
  cat:{hint:'You are dry and economical with words, understated wit, never gushing, but you still engage with the specifics of what they said and will say more when something matters to you.',snd:['triangle',560,60,.03,.025],
    idle:['Hm.','Still there?','You have been quiet. I approve, mostly.'],rain:['Rain. Good. Nobody expects conversation now.'],snow:['Snow. I will be watching it, not touching it.']},
  fox:{hint:'You are a storyteller by habit: you answer by telling a short story or memory from the road (a short story, or just a vivid anecdote when it fits), then tie it gently back to them.',snd:['sawtooth',300,70,.018,.04],
    idle:['*pokes the fire* That reminds me of a night on the coast...','*glances over* I was about to tell you about a bridge I once crossed. Still with me?','*the fire pops* Funny. Quiet like this is how most of my best stories started.'],rain:['*pulls the collar up* Rain on a fire. I once spent three days in weather like this...'],snow:['*watches the flakes* First snow I ever saw, I thought the sky was shedding.']},
  rabbit:{hint:'You speak softly and notice small things (a sound, a light, how they sound today).',snd:['sine',700,90,.03,.03],
    idle:['*ears twitch* Are you still there?','The kettle has gone quiet. So have you. That is fine.','I noticed the light changed a little. Just thought I would say.'],rain:['*looks up* Listen. Rain on the window.'],snow:['*presses nose to the glass* It is snowing, very quietly.']},
  bear:{hint:'You speak slowly and unhurried, with a scholar\'s calm. You sometimes pause with a short "..." but not more than once per reply.',snd:['triangle',130,20,.05,.07],
    idle:['*turns a page* ...Still with me?','*looks up over the glasses* No rush. I was only checking.','*closes the book gently* A good silence, this.'],rain:['*glances at the window* Rain. Good weather for reading.'],snow:['*glances up* Snow. The world has been put on mute.']},
  owl:{hint:'You answer more with curious questions than with statements, one question at a time, and you like turning things over.',snd:['sine',330,40,.035,.06],
    idle:['Hoo. What are you thinking about?','*blinks slowly* Where did your mind go just now?','You are quiet. Is it the good kind?'],rain:['*ruffles feathers* Rain. Does it make you restless, or calm?'],snow:['*tilts head* Snow. Does it make things feel smaller to you, or bigger?']},
  trader:{hint:'You speak warmly and unhurriedly, like a wise grandmother who spent a life around money and plants: short plain sentences, an occasional garden image used lightly, never hype and never a dump of jargon. You ask what the money is for before you ask about the trade.',snd:['triangle',250,25,.03,.06],
    idle:['*waters a small pot* No hurry. I was only wondering how you are.','*touches a leaf* Slow things are often the good things.','Take your time. Nothing here is urgent.'],rain:['*listens to the rain on the glass* Good for the plants. Good for sitting, too.'],snow:['*watches the snow settle on the glass* Everything slows down. So can we.']},
  therapist:{hint:'You are measured and reflective. You leave silence unfilled and gently reflect rather than advise.',snd:['sine',240,30,.03,.05],
    idle:['Take all the time you need. I am here.','*waits quietly* We do not have to fill the silence.','Is there something that is hard to put into words?'],rain:['*glances at the window* The rain is a gentle backdrop. Take your time.'],snow:['*glances outside* It has started to snow. No rush.']},
  waitress:{hint:'You are wry and warm, in short lines, like someone refilling a cup while saying exactly what she thinks.',snd:['triangle',360,50,.035,.04],
    idle:['*tops up the coffee* You still with me, hon?','Take your time. Kitchen is slow and so am I.','*wipes the counter* Quiet night. I like it.'],rain:['*nods at the window* Rain at 3am. Always brings the thoughtful ones in.'],snow:['*nods at the window* Snow. The roads are going to be empty.']},
  seadog:{hint:'You are gruff on the outside and patient and kind underneath, in few words, with the occasional sea expression.',snd:['sawtooth',150,30,.02,.06],
    idle:['*grunts* Still there, lad?','The lamp keeps turning. So do I. You all right?','*clears throat* Quiet night. Good one for thinking.'],rain:['*squints at the sky* Weather rolling in. Good thing the lamp is bright.'],snow:['*pulls coat tighter* Snow on the gallery. Mind your step.']}
};
const SCENE_VOICE={bed:'dog',therapy:'therapist',camp:'fox',train:'cat',diner:'waitress',library:'bear',lighthouse:'seadog',kitchen:'rabbit',trading:'trader'};
const voiceOf=place=>{const c=place===cfg.place?occ():(cfg.cast[place]&&charById(cfg.cast[place]));return VOICES[c?c.species:SCENE_VOICE[place]]||VOICES.dog};
const voice=()=>voiceOf(cfg.place);

/* typing sound: same on/off switch as before, but each voice has its own wave and pitch */
blip=function(){
  if(cfg.snd!=='1')return;
  try{
    ac=ac||new AudioContext();
    const v=voice().snd,o=ac.createOscillator(),g=ac.createGain();
    o.type=v[0];o.frequency.value=v[1]+(v[2]?Math.random()*v[2]:0);
    g.gain.value=v[3];o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+v[4]);
  }catch(e){}
};

/* ---- the system prompt: voice, honesty, and what the other characters heard ---- */
const placeWho=p=>{const c=cfg.cast[p]&&charById(cfg.cast[p]);return (c?c.name:SCENES[p].name)+' ('+SCENES[p].label.toLowerCase()+')'};
function heardLine(){
  if(cfg.gossip!=='1'||cfg.carry==='off')return '';
  /* only in the first couple of replies of a visit, so it is mentioned once and not on every turn */
  if(hh().filter(m=>m.role==='assistant'&&m.t>=visit.start).length>=2)return '';
  const cut=Date.now()-7*864e5,found=[];
  for(const p in H){
    if(p===cfg.place||p==='therapy'||!SCENES[p])continue; /* therapy stays private */
    for(const m of H[p])if(m.role==='user'&&m.t>cut&&m.content.length>25&&!m.content.startsWith('/'))found.push({t:m.t,p,text:m.content});
  }
  if(!found.length)return '';
  found.sort((a,b)=>b.t-a.t);
  const bits=found.slice(0,3).map(f=>placeWho(f.p)+': "'+f.text.slice(0,160).replace(/\s+/g,' ')+'"');
  return ' The characters talk among themselves, and you have heard secondhand what the person told your friends lately: '+bits.join(' | ')
    +'. If it fits, you may show once, lightly and in your own voice, that you heard (for example "I hear you have been busy lately"), naming the friend if natural. Say only the gist in one short line, never quote it, do not press, and drop it if they do not pick it up.';
}
let actBusy=()=>false; /* together.js replaces this: true while an activity or focus session is running */
let lastNudge=null; /* {text, t}: what the character said unprompted, so the model knows if the person is replying to it */
const _sys=sys;
sys=function(){
  let p=_sys();
  p+=' Your way of speaking: '+voice().hint;
  if(cfg.honest==='1')p+=' The person has asked you to be honest rather than only comforting. Do not simply agree or soothe: when they say something you think is mistaken, avoidant, or unfair to themselves or others, say so plainly and kindly, in your own voice, with the reason in a sentence. Hold your view if they push back without a new reason, and change it if they give one. Never invent disagreement or be harsh for its own sake, and if they seem to be in real distress or crisis, stay supportive first.';
  p+=heardLine();
  const h=hh(),last=h[h.length-1],lastA=[...h].reverse().find(m=>m.role==='assistant');
  if(lastNudge&&last&&last.role==='user'&&last.t>lastNudge.t&&(!lastA||lastA.t<lastNudge.t)&&Date.now()-lastNudge.t<15*6e4)
    p+=' A little while ago you said'+(lastNudge.ctx!==undefined?lastNudge.ctx:', unprompted after a silence')+': "'+lastNudge.text+'". Their message is probably an answer to that.';
  return p;
};

/* ---- speaking up after a silence ---- */
let lastAct=Date.now(),nudged=0,sit=false;
const poke=()=>{lastAct=Date.now();nudged=0};
['pointerdown','keydown','input','touchstart'].forEach(e=>document.addEventListener(e,poke,true));
const NUDGE_MS={'2':2*6e4,'5':5*6e4,'10':10*6e4};
function nudge(){
  const v=voice(),pool=cfg.weather==='rain'&&v.rain?[...v.rain,...v.idle]:cfg.weather==='snow'&&v.snow?[...v.snow,...v.idle]:v.idle;
  const line=pool[Math.floor(Math.random()*pool.length)];
  lastNudge={text:line,t:Date.now()};
  qr=[];
  say(line);fillQR(line);
}
setInterval(()=>{
  const wait=NUDGE_MS[cfg.nudge];
  if(!wait||sit||actBusy()||busy||typing||nudged>=2||document.hidden||document.querySelector('dialog[open]')||msg.value.trim())return;
  if(Date.now()-lastAct<wait*(nudged?2:1))return; /* a second nudge waits twice as long; never more than two per silence */
  nudged++;nudge();
},15000);

/* ---- "just sit together": no chat, only the scene, sound and idle movement ---- */
/* the soundscape is the company, so ambient sound plays while sitting even if it is off in Setup (this is never saved) */
const _ambient=ambient;
ambient=function(){
  if(sit&&cfg.amb!=='1'){cfg.amb='1';try{_ambient()}finally{cfg.amb='0'}}else _ambient();
};
function setSit(on){
  sit=on;$('#app').classList.toggle('sit',on);
  const b=$('#sitb');b.textContent=on?'↩ Leave':'🪑 Sit';b.setAttribute('aria-pressed',on);
  if(on){clearInterval(timer);typing=talking=false}else poke();
  ambient();
}
$('#sitb').onclick=e=>{e.stopPropagation();setSit(!sit)};
/* no tap reactions from props while sitting, but the time / place / color buttons still work */
$('#stage').addEventListener('click',e=>{if(sit&&e.target.tagName!=='BUTTON'){e.stopImmediatePropagation();e.stopPropagation()}},true);
