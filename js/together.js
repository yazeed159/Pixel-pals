/* Things to do together: a journaling question, breathing and grounding, stories, a focus timer, small games.
   Open them from the Together button. One activity runs at a time (`act`); a focus session (`foc`) runs beside it.
   Loads after behavior.js. Like that file it wraps send(), sys(), ask(), respond(), greet(), showQR() and draw()
   instead of editing them. Riddles, word chain, breathing and grounding are local: no API calls, nothing added to the chat history. */
let pace=300,calm=0,act=null,foc=null,ACTCHIPS=[],hint='',br=null;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const echo=t=>{if(cfg.style==='bubbles')bub('user',t)};
actBusy=()=>!!act||!!foc;

/* ---- plumbing: one activity at a time, its own quick-reply chips, its own bit of system prompt ---- */
const _showQR=showQR;
showQR=function(){
  if(!ACTCHIPS.length||busy)return _showQR();
  const q=$('#qr');q.textContent='';
  ACTCHIPS.forEach(t=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>send(t);q.append(b)});
};
function setAct(a){if(act)endAct();act=a;ACTCHIPS=a.chips||[]}
function endAct(line){
  const a=act;act=null;ACTCHIPS=[];hint='';pace=basePace();calm=0;br=null;
  if(a&&a.end)a.end();
  $('#qr').textContent='';
  if(line)say(line);
}
const _send=send;
send=function(over){
  const t=(typeof over==='string'?over:msg.value).trim();
  if(!t||busy)return;
  if(act&&!t.startsWith('/')){
    msg.value='';clearQR();if(typing)finish();
    if(t==='Stop'){echo(t);endAct('*nods* All right. We can do something else any time.');return}
    if(act.pass&&act.pass(t)){if(act.ai)act.ai(t);return _send(t)} /* goes to the AI like a normal message */
    echo(t);act.on(t);return;
  }
  return _send(over);
};
const _sys2=sys;
sys=function(){
  let p=_sys2();
  if(act&&act.strip)p=p.replace(QRI,'');
  if(act&&act.hint)p+=' '+act.hint();
  if(hint)p+=' '+hint;
  return p;
};
const _respond=respond;
respond=async function(f){await _respond(f);hint='';if(act&&act.after)act.after()};
const _greet=greet;
greet=function(){if(act)endAct();_greet()}; /* changing scene or character ends the activity */
$('#stage').addEventListener('click',e=>{if(act&&act.quiet&&e.target.tagName!=='BUTTON'){e.stopImmediatePropagation();e.stopPropagation()}},true);

/* ---- drawn on top of any scene: a dim veil while slowing down, and the breathing light ---- */
const _draw=draw;
draw=function(){_draw();
  if(calm)rpx(0,0,160,90,'rgba(18,12,38,.16)');
  if(br){
    const p=Math.min(1,(Date.now()-br.t0)/(br.secs*1000)),r=Math.round(br.type==='in'?3+8*p:br.type==='out'?11-8*p:11),cx=146,cy=17;
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const d=dx*dx+dy*dy;if(d<=r*r)rpx(cx+dx,cy+dy,1,1,d>(r-1.5)*(r-1.5)?'rgba(243,227,200,.8)':'rgba(243,227,200,.22)')}
  }
};
setInterval(()=>{if(br)draw()},100); /* the light moves smoothly even though the scene itself is slowed */

/* ================= journaling ================= */
const JQ=['What is one thing from today you want to remember?','What took more energy from you today than it should have?','What are you looking forward to, even a little?','What is something you did recently that you are quietly proud of?','What has been on your mind that you have not said out loud?','Who made your week a bit easier, and how?','What would a gentler version of today have looked like?','What is one thing you have been putting off, and what is the smallest first step?','What did you need today that you did not get?','What made you smile or laugh recently?','If tomorrow could be better in one small way, which way?','What are you learning about yourself lately?','What are you carrying that might not be yours to carry?','What was the best part of your day, however small?','What do you want less of in your life right now?','What do you want more of?','What is a worry that might be smaller than it feels?','What would you tell a friend who felt the way you feel now?','What are you grateful for that you usually overlook?','Where did you feel most like yourself this week?','What is one thing you can let go of tonight?','What do you hope people understand about you?','What did you do today just for you?','What has changed for you this month?'];
const JI=['Here is a question to sit with: ','Something to write down, if you like: ','Let me ask you one small thing: '];
function journalAct(q){
  const a={name:'journal',q,chips:['Another question','Not now'],
    pass:t=>!['Another question','Not now'].includes(t)&&!demo(), /* a real answer goes to the AI for a short, warm reply */
    ai(t){save(t);ACTCHIPS=[];hint='They just answered a reflective question for their private journal. Reply in one or two warm sentences. Do not ask another question.'},
    on(t){
      if(t==='Another question'){a.q=pick(JQ.filter(x=>x!==a.q));lastNudge={text:a.q,t:Date.now(),ctx:' (a journaling question you asked)'};say(pick(JI)+a.q);return}
      if(t==='Not now'){endAct('*nods* Another time, then.');return}
      save(t);endAct('(Saved in your Journal.)'); /* no AI call, so no reply is made up */
    },
    after(){endAct()}};
  const save=t=>{J.unshift({d:today(),t:Date.now(),text:t,who:nm(),place:cfg.place,q:a.q});store()};
  return a;
}
function startJournal(){
  const recent=J.map(e=>e.q).filter(Boolean).slice(0,10),pool=JQ.filter(q=>!recent.includes(q)),q=pick(pool.length?pool:JQ);
  setAct(journalAct(q));lastNudge={text:q,t:Date.now(),ctx:' (a journaling question you asked)'};qr=[];say(pick(JI)+q);
}

/* ================= breathing and grounding ================= */
const waitIdle=async a=>{while(!a.dead&&(typing||talking))await sleep(150)};
function startBreath(){
  const a={name:'breathing',quiet:true,chips:['Stop'],dead:false,done:false,
    end(){a.dead=true},
    on(t){if(!a.done){endAct('*nods* We can stop there. I am here.');return}
      if(/once more|again/i.test(t)){startBreath();return}endAct(/calmer|better/i.test(t)?'*quietly* Good. Carry a little of that with you.':'*nods* That is all right. Some days it takes a few rounds. Take the quiet with you anyway.')}};
  setAct(a);pace=Math.max(700,basePace());calm=1;qr=[];
  (async()=>{
    say(still()?'Let us slow down. I will count each breath with you.':'Let us slow down. Follow the light in the corner, and breathe with it.');
    await waitIdle(a);await sleep(1500);
    for(let r=1;r<=5;r++)for(const [label,secs,type] of [['Breathe in...',4,'in'],['Hold...',2,'hold'],['Breathe out...',6,'out']]){
      if(a.dead)return;
      /* in a static scene there is no moving light, so the count is in the words */
      br=still()?null:{type,t0:Date.now(),secs};say(still()?label+' '+Array.from({length:secs},(_,i)=>i+1).join(', '):label);await sleep(secs*1000);
    }
    if(a.dead)return;
    br=null;pace=basePace();calm=0;a.done=true;ACTCHIPS=a.chips=['Calmer','About the same','Once more','Stop'];
    say('That is it. Notice your shoulders, your jaw, your hands. How do you feel?');
  })();
}
const GSTEPS=['Let us ground. Look around slowly, and name 5 things you can see.','Now 4 things you can feel: your feet, the seat under you, your clothes, the air.','3 things you can hear. Near or far, anything.','2 things you can smell, or would like to smell.','1 thing you can taste, or one kind thing you could say about yourself.'];
const GACK=['Good.','Mm, thank you.','Nice. Take your time.','That is it.'];
function startGround(){
  let i=0;
  const a={name:'grounding',quiet:true,chips:['Next','Stop'],
    on(t){
      if(a.over){endAct('*softly* You are here. That is enough for now.');return}
      i++;
      if(i<GSTEPS.length)say(pick(GACK)+' '+GSTEPS[i]);
      else{a.over=true;pace=basePace();calm=0;ACTCHIPS=['Thanks'];say('Good. One slow breath in... and out. Feel where you are sitting. You are here.')}
    }};
  setAct(a);pace=Math.max(700,basePace());calm=1;qr=[];say(GSTEPS[0]);
}

/* ================= stories ================= */
const OPEN=['The last train of the night stopped at a station that was not on any map.','Behind the old library, somebody had left a lantern burning in the snow.','The first thing the fox noticed that morning was that the river had gone quiet.','Nobody could remember who had painted the door on the side of the hill.','On the tenth night of rain, a small knock came from inside the lighthouse wall.','The robot found a letter in a pocket it was sure had been empty.','Every evening at nine, the diner radio played a song nobody had ever requested.','The moon base received a message that began with the words: do not be alarmed.'];
function tellStory(){
  if(demo()){qr=[];say(NOKEY);return}
  hint='The person asked you for a story. Tell one short original story (about 120 to 200 words) right away, in your own voice and fitting where you are, with a gentle ending. No preamble.';
  _send('Tell me a story.');
}
function startWrite(){
  if(demo()){say(NOKEY);return}
  const op=pick(OPEN);
  const a={name:'story',strip:true,chips:['The end','Stop'],lines:[{w:'ai',s:op}],
    pass:t=>t!=='The end',
    ai(t){a.lines.push({w:'you',s:t})},
    hint:()=>'You and the person are writing a story together, taking turns, one or two sentences each. The story so far: '+a.lines.map(l=>l.s).join(' ')+' Write ONLY your next one or two sentences, continuing naturally from their last line. Plain story text: no commentary, no quotation marks around it, no questions, no actions in asterisks.',
    after(){const l=hh()[hh().length-1];if(!l||l.role!=='assistant')return;const last=a.lines[a.lines.length-1];if(last&&last.w==='ai'&&a.lines.length>1)last.s=l.content;else a.lines.push({w:'ai',s:l.content})},
    on(t){ /* only 'The end' arrives here */
      if(a.lines.length>1){J.unshift({d:today(),t:Date.now(),text:a.lines.map(l=>l.s).join(' '),who:nm(),place:cfg.place,q:'A story we wrote together'});store()}
      endAct(a.lines.length>1?'*closes the notebook* What a story. I saved it in your Journal.':'*smiles* Maybe next time.');
    }};
  setAct(a);qr=[];say('Let us write one together, a line each. I will begin: '+op+' Now you add the next line.');
}

/* ================= focus companion ================= */
const WORK={dog:['*gnaws a chew toy, contentedly*','*dozes with one ear up*'],cat:['*writes something in a tiny notebook*','*washes a paw, thinking*'],fox:['*mends a boot by the fire*','*whittles a stick*'],rabbit:['*sorts a jar of seeds*','*knits a few slow stitches*'],bear:['*turns a page*','*adjusts the glasses and keeps reading*'],owl:['*preens a feather and blinks*','*scribbles a note*'],jelly:['*glows steadily*','*drifts a little slower*'],therapist:['*writes a short note*','*sips tea*'],waitress:['*wipes the counter*','*folds napkins*'],seadog:['*polishes the lamp glass*','*coils a rope*']};
const vkey=()=>Object.keys(VOICES).find(k=>VOICES[k]===voice())||'dog';
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function chime(){try{ac=ac||new AudioContext();if(ac.state==='suspended')ac.resume();
  [[660,0],[880,.2]].forEach(([f,d])=>{const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+d;o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.5);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.55)})}catch(e){}}
function quietSay(t,tries=0){ /* never talks over you: waits until you have been still for a while */
  const f=foc;
  setTimeout(()=>{
    if(foc!==f||!f)return;
    if(typing||busy||Date.now()-lastAct<20000){if(tries<30)quietSay(t,tries+1);return}
    qr=[];say(t);
  },tries?10000:0);
}
const TITLE=document.title;
function startFocus(){
  const [w,b]=$('#fdur').value.split('/').map(Number),sty=$('#fsty').value;
  cfg.fdur=$('#fdur').value;cfg.fsty=sty;store();
  foc={mode:'work',w,b,sty,done:0,end:Date.now()+w*6e4,nextWork:Date.now()+(5+Math.random()*3)*6e4};
  if(act)endAct();
  qr=[];say(sty==='work'?pick(WORK[vkey()]||WORK.dog)+' I will keep busy beside you. '+w+' minutes, starting now.':'*settles in beside you* No talking. I will tell you when the '+w+' minutes are up.');
  focTick();
}
function stopFocus(line){foc=null;$('#ftime').hidden=true;document.title=TITLE;if(line)say(line)}
function focTick(){
  if(!foc)return;
  let left=foc.end-Date.now();
  if(left<=0){
    chime();
    if(foc.mode==='work'){
      foc.done++;foc.mode='break';foc.end=Date.now()+foc.b*6e4;
      quietSay('*stretches* That is round '+foc.done+'. Break time: stand up, drink some water, look at something far away. '+foc.b+' minutes.');
    }else{
      foc.mode='work';foc.end=Date.now()+foc.w*6e4;foc.nextWork=Date.now()+(5+Math.random()*3)*6e4;
      quietSay('Ready when you are. I am right here. '+foc.w+' minutes.');
    }
    left=foc.end-Date.now();
  }else if(foc.mode==='work'&&foc.sty==='work'&&Date.now()>foc.nextWork){
    foc.nextWork=Date.now()+(6+Math.random()*4)*6e4;quietSay(pick(WORK[vkey()]||WORK.dog));
  }
  const f=$('#ftime'),label=(foc.mode==='work'?'Focus ':'Break ')+mmss(left)+(foc.done?'  x'+foc.done:'');
  f.hidden=false;f.textContent=label;document.title=mmss(left)+' · '+(foc.mode==='work'?'Focus':'Break');
}
setInterval(focTick,1000);

/* ================= games ================= */
const RIDDLES=[
{q:'What has keys but cannot open locks?',a:['piano','keyboard'],show:'a piano (or a keyboard)',h:'You can play it.'},
{q:'What gets wetter the more it dries?',a:['towel'],show:'a towel',h:'Found in a bathroom.'},
{q:'What has hands but cannot clap?',a:['clock','watch'],show:'a clock',h:'It tells you something.'},
{q:'I speak without a mouth and hear without ears. What am I?',a:['echo'],show:'an echo',h:'Think of mountains and empty halls.'},
{q:'What can you catch but never throw?',a:['cold','a cold'],show:'a cold',h:'It is not fun to have.'},
{q:'The more you take, the more you leave behind. What are they?',a:['footsteps','footstep','steps','step'],show:'footsteps',h:'Think of a beach.'},
{q:'What has a neck but no head?',a:['bottle'],show:'a bottle',h:'It holds something.'},
{q:'What has many teeth but cannot bite?',a:['comb'],show:'a comb',h:'You use it on your hair.'},
{q:'I am light as a feather, yet the strongest person cannot hold me for more than a few minutes. What am I?',a:['breath','breathing'],show:'your breath',h:'You are doing it right now.'},
{q:'What runs but never walks, and has a mouth but never talks?',a:['river'],show:'a river',h:'It flows to the sea.'},
{q:'What can travel around the world while staying in a corner?',a:['stamp'],show:'a stamp',h:'It goes on a letter.'},
{q:'What comes once in a minute, twice in a moment, but never in a thousand years?',a:['m','letter m'],show:'the letter M',h:'Look at the words, not the time.'},
{q:'What has one eye but cannot see?',a:['needle'],show:'a needle',h:'Used with thread.'},
{q:'What begins with T, ends with T, and has T in it?',a:['teapot'],show:'a teapot',h:'Perfect for a quiet evening.'}];
let usedR=new Set();
const norm=t=>t.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).filter(w=>w&&!['a','an','the','it','its','is','they','are','i','think','maybe','guess','my','your','im'].includes(w));
const RIGHT=['Yes! That is it.','Exactly. Well done.','Right. You have a quick mind.'],WRONG=['Not quite. Try again.','Hm, no. Keep thinking.','Close, maybe. Another guess?'];
function startRiddle(){
  if(usedR.size>=RIDDLES.length)usedR=new Set();
  const i=pick(RIDDLES.map((r,k)=>k).filter(k=>!usedR.has(k))),r=RIDDLES[i];usedR.add(i);
  const a={name:'riddle',tries:0,solved:false,chips:['Hint','I give up','Stop'],
    on(t){
      if(a.solved){if(t==='Another riddle')startRiddle();else endAct('*smiles* Any time.');return}
      if(t==='Hint'){say('Hint: '+r.h);return}
      if(t==='I give up'){a.solved=true;ACTCHIPS=['Another riddle','Stop'];say('It was '+r.show+'. A good one, wasn\'t it?');return}
      const n=norm(t).join(' ');
      if(r.a.some(x=>n===x||norm(t).includes(x)||n.includes(' '+x)||n.startsWith(x+' '))){a.solved=true;ACTCHIPS=['Another riddle','Stop'];say(pick(RIGHT));return}
      a.tries++;say(a.tries%3===0?'Not quite. A hint: '+r.h:pick(WRONG));
    }};
  setAct(a);qr=[];say('A riddle: '+r.q);
}
const WORDS=[...new Set(`apple anchor autumn ankle artist attic arrow answer ancient angle bridge basket breeze button blanket bottle branch burrow beacon barn candle cloud copper compass cabin canyon clover cricket cradle castle dragon dolphin dawn drift dune doorway dream dusty drum dinner ember echo eagle engine evening elbow elder earth essay empty forest feather fiddle flame fox fountain frost friend field fable garden glow gentle ginger glacier grain grove guitar gravel globe harbor hollow honey horizon hammer harvest hearth hill hush hat island ivory iron igloo idea inkwell insect inlet image ice jungle jacket jelly journey jewel jar jigsaw juniper joy jazz kettle kite key kitchen knot kingdom koala kernel kindle kayak lantern lighthouse lemon lake leaf library lullaby lamp lily lodge meadow mirror moon mountain marble melody mist mitten maple market night nest needle north notebook noodle nectar nutmeg narrow novel ocean orchard owl otter olive orbit oyster oak onion outpost pebble pillow puddle pine pepper piano parade pocket planet porch quiet quilt quartz quest quick queen quote quarry quail quill river rain rocket ribbon robin ripple rooftop rabbit rust radio shadow snow star stream sailor sunset summer stone spoon sparrow teapot thunder tunnel train tulip tower timber trail thistle tide umbrella unicorn uncle upstairs urchin ukulele under unfold update valley violin velvet village voyage vine vapor visitor vase willow window whisper wagon waterfall winter wheat wander wool whale xylophone xenon yellow yarn yonder yawn yesterday yacht yard yeast youth yodel zebra zero zigzag zephyr zone zoo zinc zest zipper zodiac`.split(' '))];
function startWords(){
  const used=new Set(),w0=pick(WORDS.filter(w=>w[0]!=='x'));used.add(w0);let last=w0.slice(-1);
  const a={name:'word chain',chips:['Stop'],
    on(t){
      if(a.over){if(t==='Play again')startWords();else endAct('*smiles* Good game.');return}
      const w=t.toLowerCase().replace(/[^a-z]/g,'');
      if(w.length<2){say('A word of at least two letters, please. It starts with '+last.toUpperCase()+'.');return}
      if(w[0]!==last){say('That has to start with '+last.toUpperCase()+'. Try again.');return}
      if(used.has(w)){say('We already used '+w+'. Another one?');return}
      used.add(w);const l2=w.slice(-1),c=WORDS.filter(x=>x[0]===l2&&!used.has(x));
      if(!c.length){a.over=true;ACTCHIPS=['Play again','Stop'];say('You got me. I have nothing that starts with '+l2.toUpperCase()+'. You win, after '+used.size+' words!');return}
      const bw=pick(c);used.add(bw);last=bw.slice(-1);say(bw+'. Your turn: '+last.toUpperCase()+'.');
    }};
  setAct(a);qr=[];say('Word chain: each word starts with the last letter of the one before. I will begin with "'+w0+'". Your word starts with '+last.toUpperCase()+'.');
}
const SECRETS=['a lighthouse','a bicycle','a penguin','an umbrella','a piano','the moon','a teapot','a sailboat','a cactus','a violin','a snowman','a lantern','a pair of glasses','a train','a bee','a pumpkin','a compass','a campfire','a jellyfish','a clock','a kite','a mushroom','a bridge','a candle','a mountain','a whale','a key'];
function startQ(mode){
  if(demo()){say('Twenty questions needs the AI connected. Add a key in Setup and I will be right here.');return}
  const secret=mode==='guess'?pick(SECRETS):'';
  const a={name:'twenty questions',strip:true,n:0,chips:mode==='guess'?['I give up','Stop']:['Ready','Stop'],
    pass:t=>!(mode==='guess'&&t==='I give up'),
    ai(){a.n++;if(mode==='think')ACTCHIPS=a.chips=['Yes','No','Sometimes','Stop']},
    hint:()=>mode==='guess'
      ?'We are playing twenty questions. You have secretly chosen: '+secret+'. The person asks yes/no questions to work out what it is. Answer each with Yes, No or Sometimes, plus at most a few words of in-character flavor. Never reveal what it is unless they guess it correctly (then celebrate briefly and say the game is over). Questions asked so far, including this one: '+a.n+' of 20.'+(a.n===20?' That was their last question: answer it, then invite one final guess.':'')+(a.n>20?' That was their final guess: say whether it is right, and tell them it was '+secret+'.':'')+' One or two short sentences.'
      :'We are playing twenty questions the other way round: the person is thinking of something (an animal, object or place) and you work out what it is. Ask exactly ONE yes/no question per reply. This reply is question number '+Math.min(a.n,20)+' of 20. Their last message answers your previous question (or says Ready, if you are just starting). Make a specific guess ("Is it ...?") when you are fairly sure, or by question 18. If they confirm a correct guess, celebrate briefly and say the game is over. After question 20, concede and ask what it was. One short sentence, no actions in asterisks.',
    after(){if(a.n>=21)endAct()},
    on(t){if(t==='I give up')endAct('It was '+secret+'. Good game.')}};
  setAct(a);qr=[];
  say(mode==='guess'?'I have thought of something. Ask me yes/no questions; you have twenty.':'Think of something: an animal, an object, a place. Tell me when you are ready.');
}

/* ================= the Together menu ================= */
const actd=$('#actd');
function actStatus(){
  const s=[];
  if(act)s.push('Now: '+act.name+'.');
  if(foc)s.push((foc.mode==='work'?'Focus':'Break')+' '+mmss(foc.end-Date.now())+' left, '+foc.done+' done.');
  $('#actst').textContent=s.join(' ');
  $('#stopf').hidden=!foc;$('#stopa').hidden=!act;
}
$('#actb').onclick=()=>{$('#fdur').value=cfg.fdur||'25/5';$('#fsty').value=cfg.fsty||'work';actStatus();actd.showModal()};
$('#actx').onclick=()=>actd.close();
actd.addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]');if(!b)return;
  const k=b.dataset.a;
  if(k==='stopact'){actd.close();endAct('*nods* All right.');return}
  if(k==='stopfocus'){actd.close();stopFocus('*looks up* All done for now. Nice work.');return}
  if(busy){$('#actst').textContent='One moment, a reply is on its way.';return}
  actd.close();
  ({journal:startJournal,breathe:startBreath,ground:startGround,tell:tellStory,write:startWrite,focus:startFocus,riddle:startRiddle,words:startWords,qguess:()=>startQ('guess'),qthink:()=>startQ('think')})[k]();
});
